// ═══════════════════════════════════════════════════════════════════
// useZoomPrevention.js
//
// Prevents all browser zoom triggers while the game is running:
//   • Ctrl + scroll wheel
//   • Ctrl + Plus / Minus / 0 keyboard shortcuts
//   • Pinch-to-zoom (touch / trackpad) via touch events
//
// Usage: call once at the top of your root component.
//   import { useZoomPrevention } from "./useZoomPrevention";
//   useZoomPrevention();
// ═══════════════════════════════════════════════════════════════════

import { useEffect } from "react";

export function useZoomPrevention() {
  useEffect(() => {
    // ── Ctrl + scroll ──────────────────────────────────────────
    // Must be { passive: false } — modern browsers default wheel
    // listeners to passive, silently ignoring preventDefault() otherwise.
    const onWheel = (e) => {
      if (e.ctrlKey) e.preventDefault();
    };

    // ── Ctrl + keyboard shortcuts ──────────────────────────────
    const onKeyDown = (e) => {
      if (e.ctrlKey && (
        e.key === "+"  ||
        e.key === "-"  ||
        e.key === "="  ||  // Ctrl+= is the same as Ctrl++ on most keyboards
        e.key === "0"
      )) {
        e.preventDefault();
      }
    };

    // ── Pinch-to-zoom (touch / trackpad) ──────────────────────
    const onTouchMove = (e) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    window.addEventListener("wheel",     onWheel,     { passive: false });
    window.addEventListener("keydown",   onKeyDown);
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel",     onWheel);
      window.removeEventListener("keydown",   onKeyDown);
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, []); // runs once on mount, cleans up on unmount
}
