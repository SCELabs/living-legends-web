import { useEffect, useRef, useState } from "react";

type UseAutoModeOptions = {
  intervalMs?: number;
  enabled?: boolean;
  onTick: () => Promise<void>;
};

export function useAutoMode({
  intervalMs = 5000,
  enabled = false,
  onTick,
}: UseAutoModeOptions) {
  const [isAutoMode, setIsAutoMode] = useState(enabled);
  const [isTicking, setIsTicking] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const tickingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  function clearTimer() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  async function runTick() {
    if (tickingRef.current) return;

    try {
      tickingRef.current = true;
      if (mountedRef.current) setIsTicking(true);

      await onTick();
    } catch (err) {
      // Silent fail — UI handles errors elsewhere
      console.error("Auto tick failed:", err);
    } finally {
      tickingRef.current = false;
      if (mountedRef.current) setIsTicking(false);
    }
  }

  useEffect(() => {
    clearTimer();

    if (!isAutoMode) return;

    intervalRef.current = setInterval(() => {
      runTick();
    }, intervalMs);

    return () => clearTimer();
  }, [isAutoMode, intervalMs]);

  function toggle() {
    setIsAutoMode((prev) => !prev);
  }

  function start() {
    setIsAutoMode(true);
  }

  function stop() {
    setIsAutoMode(false);
  }

  return {
    isAutoMode,
    isTicking,
    toggle,
    start,
    stop,
  };
}
