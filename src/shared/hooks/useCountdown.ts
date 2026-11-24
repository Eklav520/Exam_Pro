import { useEffect, useEffectEvent, useState } from 'react';

/**
 * Milliseconds left until `deadline` (epoch ms, device clock). Derived from the
 * clock on each tick, so background-tab throttling cannot make it drift.
 * `onExpire` fires once per deadline.
 */
export function useCountdown(deadline: number, onExpire: () => void): number {
  const [now, setNow] = useState(() => Date.now());
  const handleExpire = useEffectEvent(onExpire);

  useEffect(() => {
    const timer = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= deadline) {
        clearInterval(timer);
        handleExpire();
      }
    }, 500);
    return () => clearInterval(timer);
  }, [deadline]);

  return Math.max(0, deadline - now);
}
