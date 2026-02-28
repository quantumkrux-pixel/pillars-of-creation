// ═══════════════════════════════════════════════════════════════════
// useCamera.js
//
// Smoothly follows the player by translating the world container
// every RAF frame. Runs entirely in a ref-based loop — zero React
// re-renders during camera movement.
//
// ── Scale compensation ────────────────────────────────────────────
//
//   CSS `scale` on the viewport div zooms the visual display but does
//   NOT change clientWidth/clientHeight — those always report the
//   pre-scale layout size. This means:
//
//     • The visible area in world-pixels is:  clientSize / scale
//     • The map in world-pixels is:           MAP_W * TILE_SIZE (unchanged)
//
//   We read the scale from the viewport's computed style each tick so
//   it stays correct if you change the scale at runtime.
//
// ── Tuning ────────────────────────────────────────────────────────
//
//   LERP_FACTOR  — camera smoothing (0–1).
//                  1.0 = rigid lock,  0.06 = very floaty, 0.12 = RPG feel
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { TILE_SIZE, MAP_W, MAP_H } from "./constants";

const LERP_FACTOR = 0.12;

export function useCamera({ pixelRef, viewportRef }) {
  const worldRef  = useRef(null);
  const camRef    = useRef({ x: 0, y: 0 });
  const rafRef    = useRef(null);
  const lastTsRef = useRef(null);

  useEffect(() => {
    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);

      const dt = Math.min(
        lastTsRef.current === null ? 0 : (ts - lastTsRef.current) / 1000,
        0.05
      );
      lastTsRef.current = ts;

      const viewport = viewportRef.current;
      const world    = worldRef.current;
      if (!viewport || !world || !pixelRef.current) return;

      // ── Read the CSS scale applied to the viewport ─────────────
      // clientWidth/clientHeight are pre-scale layout dimensions.
      // The actual visible world-pixel area shrinks by the scale factor
      // because each world pixel is rendered scale× larger on screen.
      const computedScale = parseFloat(
        getComputedStyle(viewport).scale ??
        getComputedStyle(viewport).transform
      ) || 1;

      // Visible area expressed in world-pixel units
      const vw = viewport.clientWidth  / computedScale;
      const vh = viewport.clientHeight / computedScale;

      // Player centre in world-pixel space
      const px = pixelRef.current.x + TILE_SIZE / 2;
      const py = pixelRef.current.y + TILE_SIZE / 2;

      // Ideal offset: player centred in the visible area
      let idealX = vw / 2 - px;
      let idealY = vh / 2 - py;

      // Clamp: never reveal space outside the map
      const mapPixelW = MAP_W * TILE_SIZE;
      const mapPixelH = MAP_H * TILE_SIZE;

      idealX = Math.min(0, Math.max(vw - mapPixelW, idealX));
      idealY = Math.min(0, Math.max(vh - mapPixelH, idealY));

      // Frame-rate-independent lerp
      const alpha = 1 - Math.pow(1 - LERP_FACTOR, dt * 60);
      camRef.current.x += (idealX - camRef.current.x) * alpha;
      camRef.current.y += (idealY - camRef.current.y) * alpha;

      // Snap to whole pixels to prevent tilemap blurring
      const cx = Math.round(camRef.current.x);
      const cy = Math.round(camRef.current.y);

      world.style.transform = `translate(${cx}px,${cy}px)`;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, []);

  return { worldRef };
}
