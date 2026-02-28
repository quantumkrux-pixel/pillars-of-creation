// ═══════════════════════════════════════════════════════════════════
// PlayerSprite.jsx
//
// Renders the player. Two modes:
//   MODULAR — frames + manifest from useSpriteLoader → draws on canvas
//   GLYPH   — fallback ✦ when no frames loaded yet
//
// Key design: the animation RAF loop reads `movingRef.current` directly
// (a ref from usePlayerMovement) rather than the `isMoving` React prop.
// This avoids the re-render delay that caused animations to never play —
// by the time React re-rendered with isMoving=true, the tile move was
// already completing and isMoving was being set back to false.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef } from "react";
import { TILE_SIZE } from "./constants";

export default function PlayerSprite({
  spriteRef,
  facing     = "down",
  isMoving   = false,   // kept for glyph fallback / external use
  movingRef  = null,    // live ref from usePlayerMovement — used by anim loop
  frames     = null,
  manifest   = null,
  spriteName = null,
}) {
  const canvasRef   = useRef(null);
  const animRafRef  = useRef(null);
  const frameIdxRef = useRef(0);
  const lastTsRef   = useRef(null);

  // Internal fallback ref if movingRef isn't provided
  const internalMovingRef = useRef(isMoving);
  internalMovingRef.current = isMoving;
  const liveMovingRef = movingRef ?? internalMovingRef;

  // Keep latest values in refs so the RAF loop always reads fresh
  // data without needing to restart when props change
  const facingRef   = useRef(facing);
  const framesRef   = useRef(frames);
  const manifestRef = useRef(manifest);
  facingRef.current   = facing;
  framesRef.current   = frames;
  manifestRef.current = manifest;

  const scale    = manifest?.scale ?? 1;
  const renderPx = Math.round(TILE_SIZE * scale);

  // Reset frame counter on direction change so cycles start clean
  useEffect(() => {
    frameIdxRef.current = 0;
    lastTsRef.current   = null;
  }, [facing]);

  // ── Canvas animation loop ──────────────────────────────────────
  // Restarts when frames arrive (null → loaded) or renderPx changes.
  // One rAF delay before grabbing canvasRef ensures React has committed
  // the <canvas> to the DOM.
  useEffect(() => {
    if (!frames) return;

    const startId = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width  = renderPx;
      canvas.height = renderPx;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const tick = (ts) => {
        animRafRef.current = requestAnimationFrame(tick);

        const mf = manifestRef.current;
        const fr = framesRef.current;
        if (!mf || !fr) return;

        const fps        = mf.fps       ?? 8;
        const idleFrame  = mf.idleFrame ?? 0;
        const msPerFrame = 1000 / fps;

        // Read the live ref — no re-render delay
        const moving    = liveMovingRef.current;
        const dirFrames = fr[facingRef.current] ?? fr["down"] ?? [];
        if (!dirFrames.length) return;

        if (moving) {
          const elapsed = lastTsRef.current === null ? 0 : ts - lastTsRef.current;
          if (elapsed >= msPerFrame) {
            frameIdxRef.current = (frameIdxRef.current + 1) % dirFrames.length;
            lastTsRef.current   = ts;
          }
        } else {
          frameIdxRef.current = idleFrame % dirFrames.length;
          lastTsRef.current   = null;
        }

        const img = dirFrames[frameIdxRef.current];
        if (!img) return;

        ctx.clearRect(0, 0, renderPx, renderPx);
        ctx.drawImage(img, 0, 0, renderPx, renderPx);
      };

      animRafRef.current = requestAnimationFrame(tick);
    });

    return () => {
      cancelAnimationFrame(startId);
      cancelAnimationFrame(animRafRef.current);
    };
  }, [frames, renderPx]);

  return (
    <div
      ref={spriteRef}
      style={{
        position:      "absolute",
        top:           0,
        left:          0,
        width:         TILE_SIZE,
        height:        TILE_SIZE,
        overflow:      "visible",
        pointerEvents: "none",
        zIndex:        200,
        willChange:    "transform",
        transform:     `translate(${5 * TILE_SIZE}px, ${5 * TILE_SIZE}px)`,
      }}
    >
      {frames ? (
        <canvas
          ref={canvasRef}
          width={renderPx}
          height={renderPx}
          style={{
            position:       "absolute",
            left:           (TILE_SIZE - renderPx) / 2,
            top:            (TILE_SIZE - renderPx) / 2,
            imageRendering: "pixelated",
            transform: (
              facing === "left" &&
              !manifest?.directions?.includes("left")
            ) ? "scaleX(-1)" : "none",
          }}
        />
      ) : (
        <div style={{
          position:       "absolute",
          inset:          0,
          display:        "flex",
          alignItems:     "center",
          justifyContent: "center",
          fontSize:       Math.round(TILE_SIZE * 0.6),
          filter:         "drop-shadow(0 0 6px #c8952a) drop-shadow(0 0 16px #c8952a88)",
          transform:      facing === "left" ? "scaleX(-1)" : "none",
          animation:      spriteName ? "spriteLoading 1s ease-in-out infinite" : "none",
          opacity:        spriteName ? 0.6 : 1,
        }}>
          ✦
          <style>{`
            @keyframes spriteLoading {
              0%,100% { opacity:0.25; }
              50%     { opacity:0.7;  }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
