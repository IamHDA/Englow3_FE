import { useCallback, useEffect, useRef, useState } from "react";

type State<T> = { key: string; data?: T; error?: unknown };

/**
 * Loads one REST resource and reloads it when `key` changes or `reload()` is
 * called. A response that arrives after the key moved on is dropped, so a
 * slow earlier request never overwrites a newer one. `setData` replaces the
 * cached value with what a mutation returned, without a round trip.
 */
export function useRest<T>(key: string, load: () => Promise<T>) {
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<State<T>>({ key: "" });
  const loadRef = useRef(load);
  useEffect(() => {
    loadRef.current = load;
  });

  const current = `${key}#${revision}`;
  useEffect(() => {
    let live = true;
    loadRef
      .current()
      .then((data) => {
        if (live) setState({ key: current, data });
      })
      .catch((error: unknown) => {
        if (live) setState({ key: current, error });
      });
    return () => {
      live = false;
    };
  }, [current]);

  const reload = useCallback(() => setRevision((value) => value + 1), []);
  const setData = useCallback(
    (data: T) => setState({ key: current, data }),
    [current],
  );

  const settled = state.key === current;
  return {
    data: settled ? state.data : undefined,
    error: settled ? state.error : undefined,
    loading: !settled,
    /** The last value loaded under any key, for showing while reloading. */
    stale: state.data,
    reload,
    setData,
  };
}
