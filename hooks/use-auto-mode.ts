import { useEffect, useRef, useState } from "react";

type UseAutoModeOptions = {
  onTick: () => Promise<void> | void;
  intervalMs?: number;
  enabled?: boolean;
};

export function useAutoMode({
  onTick,
  intervalMs = 5000,
  enabled = false,
}: UseAutoModeOptions) {
  const [isAutoMode, setIsAutoMode] = useState(enabled);
  const [isTicking, setIsTicking] = useState(false);

  const onTickRef = useRef(onTick);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    onTickRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isAutoMode) {
      stop();
      return;
    }

    start();

    return () => {
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAutoMode, intervalMs]);

  async function tick() {
    if (isTicking) return;

    try {
      setIsTicking(true);
      await onTickRef.current();
    } finally {
      setIsTicking(false);
    }
  }

  function start() {
    if (intervalRef.current) return;

    intervalRef.current = setInterval(() => {
      void tick();
    }, intervalMs);
  }

  function stop() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function enable() {
    setIsAutoMode(true);
  }

  function disable() {
    setIsAutoMode(false);
  }

  function toggle() {
    setIsAutoMode((prev) => !prev);
  }

  return {
    isAutoMode,
    isTicking,
    enable,
    disable,
    toggle,
    tick,
  };
}
