// ═══════════════════════════════════════════════════════════════════
// CanvasTile.jsx — shared tile renderer
// Used by both WorldEditor (palette + map grid) and the live game
// viewport. Renders procedural canvas art for built-in tiles,
// falls back to imageUrl for custom tiles, then colour+char.
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useCallback } from "react";
import { TILE_DRAW_FNS } from "../tileRenderer";

// ── Module-level image cache ─────────────────────────────────────
// Keyed by imageUrl string. Each entry is either:
//   { status: "loading", img, callbacks: [...] }
//   { status: "ready",   img }
//   { status: "error" }
// This lives outside React so it persists across renders and
// component unmounts — a given data-URL is only decoded once.
const IMAGE_CACHE = new Map();

function loadCachedImage(url, onReady) {
  if (IMAGE_CACHE.has(url)) {
    const entry = IMAGE_CACHE.get(url);
    if (entry.status === "ready") {
      // Already decoded — call back synchronously next microtask
      Promise.resolve().then(() => onReady(entry.img));
    } else if (entry.status === "loading") {
      // In-flight — queue the callback
      entry.callbacks.push(onReady);
    }
    // "error" — do nothing, tile stays blank
    return;
  }

  // First request for this URL
  const img = new Image();
  const entry = { status: "loading", img, callbacks: [onReady] };
  IMAGE_CACHE.set(url, entry);

  img.onload = () => {
    entry.status = "ready";
    entry.callbacks.forEach(cb => cb(img));
    entry.callbacks = [];
  };
  img.onerror = () => {
    entry.status = "error";
    entry.callbacks = [];
    IMAGE_CACHE.delete(url); // allow retry if URL changes later
  };
  img.src = url;
}

// ── Component ────────────────────────────────────────────────────
export default function CanvasTile({ tileId, allTiles, size, style }) {
  const canvasRef = useRef();
  // Track the url we last drew so we skip redundant redraws
  const drawnUrlRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const tile = allTiles[tileId];
    if (!tile) {
      ctx.clearRect(0, 0, size, size);
      return;
    }

    // 1. Procedural draw function (built-in tiles) — always synchronous
    const drawFn = TILE_DRAW_FNS[tileId];
    if (drawFn) {
      ctx.clearRect(0, 0, size, size);
      drawFn(ctx, 0, 0, size);
      drawnUrlRef.current = null;
      return;
    }

    // 2. Custom image tile — use cache to avoid re-decoding on every render
    if (tile.imageUrl) {
      // Already drew this exact URL — nothing to do
      if (drawnUrlRef.current === tile.imageUrl) return;

      loadCachedImage(tile.imageUrl, (img) => {
        // Guard: canvas may have unmounted or tile may have changed
        const c = canvasRef.current;
        if (!c) return;
        const currentTile = allTiles[tileId];
        if (!currentTile || currentTile.imageUrl !== tile.imageUrl) return;

        const cx = c.getContext("2d");
        cx.clearRect(0, 0, size, size);
        cx.drawImage(img, 0, 0, size, size);
        drawnUrlRef.current = tile.imageUrl;
      });
      return;
    }

    // 3. Fallback — solid colour + char
    ctx.clearRect(0, 0, size, size);
    const sc = tile.scale ?? 1;
    const tsize = size * sc;
    const offset = (size - tsize) / 2;
    ctx.fillStyle = tile.color ?? "#333";
    ctx.fillRect(offset, offset, tsize, tsize);
    if (tile.char) {
      ctx.fillStyle = "#fff";
      ctx.font = `${Math.max(8, tsize * 0.45)}px monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(tile.char, size / 2, size / 2);
    }
    drawnUrlRef.current = null;
  }, [tileId, allTiles, size]);

  useEffect(() => { draw(); }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", imageRendering: "pixelated", ...style }}
    />
  );
}
