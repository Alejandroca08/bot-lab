import { useState, useCallback } from "react";

const PROXY_URL = "/api/webhook-proxy";
const isDev = import.meta.env.DEV;

export function useWebhook() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const sendPayload = useCallback(async (webhookUrl, payload) => {
    setLoading(true);
    setError(null);

    try {
      let ok, status, data;

      if (isDev) {
        // In dev mode, call the webhook directly (no proxy)
        const response = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        status = response.status;
        ok = response.ok;
        data = await response.json().catch(() => null);
      } else {
        // In production, route through CF Pages Function proxy
        const response = await fetch(PROXY_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ webhookUrl, payload }),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok || result?.error) {
          throw new Error(result?.error || `Proxy returned HTTP ${response.status}`);
        }

        ok = result.ok;
        status = result.status;
        data = result.data;
      }

      if (!ok) {
        throw new Error(`Webhook returned HTTP ${status}`);
      }

      return { ok: true, status, data };
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
