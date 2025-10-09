import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type VerificationStatus = "idle" | "pending" | "verified" | "timeout" | "error";

export function usePaymentVerification(options?: { timeoutMs?: number; intervalMs?: number }) {
  const timeoutMs = options?.timeoutMs ?? 20_000; // 20s window
  const intervalMs = options?.intervalMs ?? 2_000; // poll every 2s

  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stop = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    intervalRef.current = null;
    timerRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setStatus("pending");
    setErrorMessage("");

    // Quick local check first
    if (localStorage.getItem("donorVerified") === "true") {
      setStatus("verified");
      return;
    }

    // Poll Supabase auth user metadata
    intervalRef.current = window.setInterval(async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) return;
        const donor = (data.user?.user_metadata as Record<string, unknown>)?.donorVerified === true;
        if (donor || localStorage.getItem("donorVerified") === "true") {
          setStatus("verified");
          stop();
        }
      } catch (_) {
        // best-effort; ignore
      }
    }, intervalMs);

    // Timeout safety
    timerRef.current = window.setTimeout(() => {
      setStatus("timeout");
      stop();
    }, timeoutMs);
  }, [intervalMs, timeoutMs, stop]);

  useEffect(() => () => stop(), [stop]);

  return { status, errorMessage, start, stop } as const;
}




