// ═══════════════════════════════════════════════════════════════════
// useSpriteLoader.js
//
// Loads a modular, folder-based sprite at runtime.
//
// ── Folder layout ─────────────────────────────────────────────────
//
//   public/sprites/
//     hero/
//       sprite.json        ← manifest (required)
//       down/
//         0.png            ← walk frame 0
//         1.png
//         2.png
//         3.png
//       up/    0.png  1.png  2.png  3.png
//       left/  0.png  1.png  2.png  3.png
//       right/ 0.png  1.png  2.png  3.png
//     mage/
//       sprite.json
//       down/  ...
//
// ── sprite.json schema ────────────────────────────────────────────
//
//   {
//     "fps":        8,
//     "scale":      1.5,
//     "idleFrame":  0,
//     "frameCount": 4,
//     "directions": ["down","up","left","right"]
//   }
//
//   fps        — animation speed in frames per second
//   scale      — render size over TILE_SIZE (1.5 = 48px on 32px tiles)
//   idleFrame  — frame index to show when standing still
//   frameCount — exact PNG count per direction (omit to auto-detect)
//   directions — which subfolders exist; missing ones fall back to "down"
//
// ── Return value ──────────────────────────────────────────────────
//
//   { frames, manifest, loading, error }
//
//   frames   — { down: HTMLImageElement[], up: [...], left: [...], right: [...] }
//   manifest — parsed sprite.json
//   loading  — true while any fetch/decode is in flight
//   error    — string or null
//
// ── Usage ─────────────────────────────────────────────────────────
//
//   const { frames, manifest, loading, error } = useSpriteLoader("hero");
//
//   <PlayerSprite
//     spriteRef={spriteRef}
//     facing={facing}
//     isMoving={isMoving}
//     frames={frames}
//     manifest={manifest}
//   />
//
// ═══════════════════════════════════════════════════════════════════

import { useEffect, useRef, useState } from "react";

// Module-level cache: name → { frames, manifest }
const CACHE = new Map();

const ALL_DIRECTIONS = ["down", "up", "left", "right"];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload  = () => resolve(img);
    img.onerror = () => reject(new Error(`404: ${src}`));
    img.src = src;
  });
}

// Load all frames for one direction subfolder.
// Exact count → parallel. No count → sequential probe until 404.
async function loadDirectionFrames(basePath, dir, frameCount) {
  if (typeof frameCount === "number" && frameCount > 0) {
    return Promise.all(
      Array.from({ length: frameCount }, (_, i) =>
        loadImage(`${basePath}/${dir}/${i}.png`)
      )
    );
  }
  const frames = [];
  for (let i = 0; i < 64; i++) {
    try { frames.push(await loadImage(`${basePath}/${dir}/${i}.png`)); }
    catch { break; }
  }
  return frames;
}

export function useSpriteLoader(name) {
  const [state, setState] = useState({
    frames: null, manifest: null, loading: !!name, error: null,
  });
  const nameRef = useRef(name);
  nameRef.current = name;

  useEffect(() => {
    if (!name) {
      setState({ frames: null, manifest: null, loading: false, error: null });
      return;
    }
    if (CACHE.has(name)) {
      setState({ ...CACHE.get(name), loading: false, error: null });
      return;
    }

    setState({ frames: null, manifest: null, loading: true, error: null });

    const basePath = `/sprites/${name}`;

    async function load() {
      // 1. Fetch manifest
      let manifest;
      try {
        const res = await fetch(`${basePath}/sprite.json`);
        if (!res.ok) throw new Error(`sprite.json not found at ${basePath}/sprite.json (HTTP ${res.status})`);
        manifest = await res.json();
        console.log(`[useSpriteLoader] "${name}" manifest loaded:`, manifest);
      } catch (err) {
        console.error(`[useSpriteLoader] "${name}" failed:`, err.message);
        if (nameRef.current === name)
          setState({ frames: null, manifest: null, loading: false, error: err.message });
        return;
      }

      const { directions = ALL_DIRECTIONS, frameCount } = manifest;

      // 2. Load each direction in parallel
      const settled = await Promise.allSettled(
        directions.map(dir =>
          loadDirectionFrames(basePath, dir, frameCount).then(imgs => ({ dir, imgs }))
        )
      );

      if (nameRef.current !== name) return; // stale

      // 3. Collect + fill fallbacks
      const frames = {};
      const errs   = [];
      for (const r of settled) {
        if (r.status === "fulfilled" && r.value.imgs.length > 0) {
          frames[r.value.dir] = r.value.imgs;
        } else {
          errs.push(r.reason?.message ?? "load error");
        }
      }
      for (const dir of ALL_DIRECTIONS) {
        if (!frames[dir]) frames[dir] = frames["down"] ?? [];
      }

      const loaded = Object.entries(frames).map(([d,f]) => `${d}:${f.length}`).join(", ");
      console.log(`[useSpriteLoader] "${name}" ready — ${loaded}`);
      if (errs.length) console.warn(`[useSpriteLoader] "${name}" partial errors:`, errs);

      const entry = { frames, manifest };
      CACHE.set(name, entry);
      setState({ ...entry, loading: false, error: errs.length ? errs.join(" | ") : null });
    }

    load();
  }, [name]);

  return state;
}

// Dev helper: bust cache to force a fresh load
export function clearSpriteCache(name) {
  if (name) CACHE.delete(name);
  else CACHE.clear();
}
