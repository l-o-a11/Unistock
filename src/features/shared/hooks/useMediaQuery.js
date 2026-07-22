import { useEffect, useState } from "react";

/**
 * Hook simple para saber si el viewport cumple una media query.
 * Se usa para ajustar layouts (ej. tablas) sin depender de CSS modules.
 */
export const useMediaQuery = (query) => {
  const getMatches = () => {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia(query).matches;
  };

  const [matches, setMatches] = useState(getMatches);

  useEffect(() => {
    if (!window.matchMedia) return;

    const mediaQueryList = window.matchMedia(query);
    const listener = () => setMatches(mediaQueryList.matches);

    // Compatibilidad: addListener (viejo) vs addEventListener (nuevo)
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
      return () => mediaQueryList.removeEventListener("change", listener);
    }

    mediaQueryList.addListener(listener);
    return () => mediaQueryList.removeListener(listener);
  }, [query]);

  return matches;
};

export default useMediaQuery;

