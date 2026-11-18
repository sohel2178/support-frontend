"use client";

import { useCallback, useEffect, useState } from "react";

import API, { getErrorMessage } from "@/lib/axios";

type Params = Record<string, string | number | undefined>;

/**
 * GET `url` (relative to /api) whenever url/params change or `reload()` is called.
 * Pass `null` as url to skip. `loading` is true while the current request is in flight;
 * previous `data` is kept meanwhile so lists don't flash empty.
 */
export function useFetch<T>(url: string | null, params?: Params) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState<{ data: T | null; error: string | null; key: string | null }>({
    data: null,
    error: null,
    key: null,
  });

  const paramsKey = JSON.stringify(params ?? {});
  const key = url ? `${url}|${paramsKey}|${nonce}` : null;

  useEffect(() => {
    if (!url || !key) return;

    let active = true;

    API.get<T>(url, { params: JSON.parse(paramsKey) })
      .then((res) => {
        if (active) setState({ data: res.data, error: null, key });
      })
      .catch((error) => {
        if (active) setState((s) => ({ data: s.data, error: getErrorMessage(error), key }));
      });

    return () => {
      active = false;
    };
  }, [url, paramsKey, key]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);

  return {
    data: state.data,
    error: state.error,
    loading: key !== null && state.key !== key,
    reload,
  };
}
