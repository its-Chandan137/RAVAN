"use client";

import { useState, useEffect, useCallback } from "react";
import { getStorage, setStorage } from "@/lib/storage";

export function useLocalState<T>(key: string, initial: T): [T, (v: T | ((p: T) => T)) => void] {
  const [state, setState] = useState<T>(initial);
  useEffect(() => {
    setState(getStorage<T>(key, initial));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback((v: T | ((p: T) => T)) => {
    setState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      setStorage(key, next);
      return next;
    });
  }, [key]);

  return [state, update];
}
