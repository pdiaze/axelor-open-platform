import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  createSearchParams,
  generatePath,
  useLocation,
  useNavigate,
} from "react-router";

export function useRoute() {
  const navigate = useNavigate();
  const location = useLocation();
  const refs = useRef({ location, navigate });

  const redirect = useCallback(
    (
      path: string,
      params?: Record<string, string | null>,
      query?: Record<string, string>,
      // `state` is attached to the history entry, letting the caller label a
      // navigation it issued itself and recognise it when it comes back
      options?: { state?: unknown },
    ) => {
      let pathname = generatePath(path, params);
      let search = createSearchParams(query).toString();
      const current = refs.current.location;
      if (current.pathname !== pathname || current.search !== search) {
        refs.current.navigate(
          {
            pathname,
            search,
          },
          options,
        );
      }
    },
    [],
  );

  useEffect(() => {
    refs.current = { location, navigate };
  }, [location, navigate]);

  // eslint-disable-next-line react-hooks/refs
  return useMemo(() => ({ ...refs.current, redirect }), [redirect]);
}
