import { useEffect, useRef, useState } from "react";

/**
 * Seconds left until `deadline` (an ISO time from the server), ticking once a
 * second. Calls `onExpire` once when it reaches zero. Counting from the
 * server's deadline rather than a local start keeps the clock right after the
 * app was backgrounded.
 */
export function useCountdown(
  deadline: string | null | undefined,
  onExpire?: () => void,
) {
  const [now, setNow] = useState(() => Date.now());
  const fired = useRef(false);
  const expireRef = useRef(onExpire);
  useEffect(() => {
    expireRef.current = onExpire;
  });

  const end = deadline ? new Date(deadline).getTime() : null;
  const secondsLeft =
    end === null || Number.isNaN(end)
      ? null
      : Math.max(0, Math.ceil((end - now) / 1000));

  useEffect(() => {
    fired.current = false;
  }, [deadline]);

  useEffect(() => {
    if (end === null) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [end]);

  useEffect(() => {
    if (secondsLeft === 0 && !fired.current) {
      fired.current = true;
      expireRef.current?.();
    }
  }, [secondsLeft]);

  return secondsLeft;
}
