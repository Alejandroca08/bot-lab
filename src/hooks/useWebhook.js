import { useState, useCallback } from "react";

export function useWebhook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendPayload = useCallback(async (url, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(
          `HTTP ${response.status}: ${response.statusText}${errorBody ? ` — ${errorBody}` : ""}`
        );
      }

      const data = await response.json().catch(() => null);
      return { ok: true, status: response.status, data };
    } catch (err) {
      let message = err.message;

      if (err instanceof TypeError && err.message === "Failed to fetch") {
        message =
          "Request failed. This is likely a CORS error — the webhook server must include " +
          "'Access-Control-Allow-Origin' headers, or you can route through a proxy. " +
          "Check the browser console for details.";
      }

      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendPayload, loading, error };
}
