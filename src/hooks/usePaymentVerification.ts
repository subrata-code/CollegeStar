import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

type VerificationStatus = "idle" | "pending" | "verified" | "timeout" | "error";

export function usePaymentVerification(options?: { timeoutMs?: number; intervalMs?: number }) {
  const timeoutMs = options?.timeoutMs ?? 20_000; // 20s window
  const intervalMs = options?.intervalMs ?? 2_000; // poll every 2s

  const [status, setStatus] = useState<VerificationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const { user } = useAuth();

  const stop = useCallback(() => {
    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timerRef.current) window.clearTimeout(timerRef.current);
    intervalRef.current = null;
    timerRef.current = null;
  }, []);

  const start = useCallback(async () => {
    if (!user) {
      setStatus("error");
      setErrorMessage("User not authenticated");
      return;
    }

    setStatus("pending");
    setErrorMessage("");

    // Quick local check first
    if (localStorage.getItem("donorVerified") === "true") {
      setStatus("verified");
      return;
    }

    // Poll user profile via API
    intervalRef.current = window.setInterval(async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5000/api/profiles/${user.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const profileData = await response.json();
          // Check if user has donor verification fields
          const isDonor = profileData.donorVerified === true || localStorage.getItem("donorVerified") === "true";
          if (isDonor) {
            setStatus("verified");
            stop();
          }
        }
      } catch (error) {
        // best-effort; ignore network errors during polling
        console.warn('Payment verification poll failed:', error);
      }
    }, intervalMs);

    // Timeout safety
    timerRef.current = window.setTimeout(() => {
      setStatus("timeout");
      stop();
    }, timeoutMs);
  }, [intervalMs, timeoutMs, stop, user]);

  useEffect(() => () => stop(), [stop]);

  return { status, errorMessage, start, stop } as const;
}




