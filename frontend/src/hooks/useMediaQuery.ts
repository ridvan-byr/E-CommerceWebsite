"use client";

import { useEffect, useState } from "react";

/**
 * İstemci tarafında breakpoint eşlemesi; SSR’da `initialWhenUnknown` döner (hidratasyon uyumu için).
 */
export function useMediaQuery(query: string, initialWhenUnknown = false): boolean {
  const [matches, setMatches] = useState(initialWhenUnknown);

  useEffect(() => {
    const mq = window.matchMedia(query);
    setMatches(mq.matches);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
