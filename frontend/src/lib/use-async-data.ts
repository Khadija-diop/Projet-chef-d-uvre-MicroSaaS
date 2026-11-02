"use client";

import { useEffect, useState } from "react";

/**
 * Factorise le trio chargement / donnees / erreur repete sur les pages qui
 * appellent l'API au montage. `data` reste `undefined` pendant le chargement.
 */
export function useAsyncData<T>(fetcher: () => Promise<T>, deps: unknown[], fallbackErrorMessage: string) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((result) => {
        if (!cancelled) {
          setData(result);
        }
      })
      .catch((caughtError: unknown) => {
        if (cancelled) {
          return;
        }
        setError(caughtError instanceof Error && caughtError.message ? caughtError.message : fallbackErrorMessage);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, error };
}
