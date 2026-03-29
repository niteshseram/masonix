import { useMemo } from "react";
import { isServer } from "../utils/ssr";

/**
 * Detects CSS native masonry grid support via CSS.supports().
 * Returns false on the server (always renders flexbox for SSR consistency).
 */
export function useNativeMasonry(enabled: boolean | undefined): boolean {
  return useMemo(() => {
    if (!enabled || isServer) return false;
    if (typeof CSS === "undefined" || typeof CSS.supports !== "function") return false;
    return (
      CSS.supports("grid-template-rows", "masonry") ||
      CSS.supports("grid-template-columns", "masonry")
    );
  }, [enabled]);
}
