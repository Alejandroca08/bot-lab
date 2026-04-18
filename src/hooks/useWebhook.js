import { useState, useCallback } from "react";

const PROXY_URL = "/api/webhook-proxy";

export function useWebhook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendPayload = useCallback(async (webhookUrl, payload) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ webhookUrl, payload }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok || result?.error) {
        throw new Error(result?.error || `Proxy returned HTTP ${response.status}`);
      }

      return { ok: result.ok, status: result.status, data: result.data };
    } catch (err) {
      const message = err.message || "Webhook request failed";
      setError(message);
      return { ok: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { sendPayload, loading, error };
}
