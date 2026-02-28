// ═══════════════════════════════════════════════════════════════════
// usePlayerMovement.js — smooth eased tile movement
//
// How it works:
//   • pixelRef tracks the sub-pixel render position (written to DOM each frame)
//   • velRef tracks current pixel velocity (px/s), separate for x and y
//   • Each tick, velocity is eased toward the direction of the current target
//   • When a tile is 70% complete, the next queued move is pre-accepted so
//     there is zero gap between steps when holding a key
//   • Ease-out: velocity is multiplied by a drag factor as the sprite nears
//     its target, giving a natural deceleration instead of a hard stop
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import { TILE_SIZE, MAP_W, MAP_H } from "./constants";

// ── Tuning knobs ──────────────────────────────────────────────────
const MAX_SPEED      = 320;   // px/s  — top travel speed
const ACCEL          = 2400;  // px/s² — how fast velocity ramps up
const DECEL          = 2400;  // px/s² — how fast velocity brakes
const QUEUE_THRESHOLD = 0.65; // start next move when this % of tile crossed
// ─────────────────────────────────────────────────────────────────

const DIRS = {
  ArrowUp:    [ 0, -1, "up"    ],
  ArrowDown:  [ 0,  1, "down"  ],
  ArrowLeft:  [-1,  0, "left"  ],
  ArrowRight: [ 1,  0, "right" ],
  w:          [ 0, -1, "up"    ],
  s:          [ 0,  1, "down"  ],
  a:          [-1,  0, "left"  ],
  d:          [ 1,  0, "right" ],
};

export function usePlayerMovement({ mapLayers, allTiles, active, onTileEnter, spawnPos }) {
  const sx = spawnPos?.x ?? 5;
  const sy = spawnPos?.y ?? 5;
  const [tilePos, setTilePos] = useState({ x: sx, y: sy });
  const [facing,  setFacing]  = useState("down");
  const [isMoving,setIsMoving]= useState(false);

  const spriteRef = useRef(null);

  // ── Core movement state (all refs — zero re-renders during motion) ─
  const tileRef    = useRef({ x: sx, y: sy });           // logical tile position
  const pixelRef   = useRef({ x: sx*TILE_SIZE, y: sy*TILE_SIZE }); // render position
  const originRef  = useRef({ x: sx*TILE_SIZE, y: sy*TILE_SIZE }); // start of current move
  const targetRef  = useRef({ x: sx*TILE_SIZE, y: sy*TILE_SIZE }); // end of current move
  const velRef     = useRef({ x: 0, y: 0 });           // current pixel velocity
  const movingRef  = useRef(false);
  const heldKeys   = useRef(new Set());
  const lastTsRef  = useRef(null);
  const rafRef     = useRef(null);
  const queuedRef  = useRef(null); // { tileX, tileY, face, targetPx } — next move

  // Props as refs
  const onTileEnterRef = useRef(onTileEnter);
  const mapRef         = useRef(mapLayers);
  const tilesRef       = useRef(allTiles);
  const activeRef      = useRef(active);
  onTileEnterRef.current = onTileEnter;
  mapRef.current         = mapLayers;
  tilesRef.current       = allTiles;
  activeRef.current      = active;

  // ── Collision ──────────────────────────────────────────────────
  const canMoveTo = (nx, ny) => {
    if (nx < 0 || nx >= MAP_W || ny < 0 || ny >= MAP_H) return false;
    if (mapRef.current?.collision?.[ny]?.[nx]) return false;
    const sid = mapRef.current?.structures?.[ny]?.[nx];
    if (sid && tilesRef.current[sid] && !tilesRef.current[sid].walkable) return false;
    return true;
  };

  // ── Key listeners ──────────────────────────────────────────────
  useEffect(() => {
    const dn = (e) => { if (DIRS[e.key]) { e.preventDefault(); heldKeys.current.add(e.key); } };
    const up = (e) => heldKeys.current.delete(e.key);
    window.addEventListener("keydown", dn);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", dn);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  // ── RAF loop ───────────────────────────────────────────────────
  useEffect(() => {
    const applyTransform = () => {
      if (!spriteRef.current) return;
      const { x, y } = pixelRef.current;
      spriteRef.current.style.transform = `translate(${x}px,${y}px)`;
    };

    // Commit the queued move as the new active move
    const commitQueued = () => {
      const q = queuedRef.current;
      if (!q) return;
      queuedRef.current = null;

      originRef.current = { ...pixelRef.current };
      targetRef.current = q.targetPx;
      tileRef.current   = { x: q.tileX, y: q.tileY };
      movingRef.current = true;

      setFacing(q.face);
      setIsMoving(true);
      setTilePos({ x: q.tileX, y: q.tileY });
      if (onTileEnterRef.current) onTileEnterRef.current(q.tileX, q.tileY);
    };

    // Try to build a queued move from currently held keys
    const tryQueueMove = (fromTile) => {
      for (const key of heldKeys.current) {
        const dir = DIRS[key];
        if (!dir) continue;
        const [dx, dy, face] = dir;
        const nx = fromTile.x + dx;
        const ny = fromTile.y + dy;

        setFacing(face);

        if (canMoveTo(nx, ny)) {
          queuedRef.current = {
            tileX: nx, tileY: ny, face,
            targetPx: { x: nx * TILE_SIZE, y: ny * TILE_SIZE },
          };
        } else {
          queuedRef.current = null;
        }
        return;
      }
      queuedRef.current = null;
    };

    const tick = (ts) => {
      rafRef.current = requestAnimationFrame(tick);

      const dt = Math.min(
        lastTsRef.current === null ? 0 : (ts - lastTsRef.current) / 1000,
        0.05 // cap at 50ms (handles tab-switch lag)
      );
      lastTsRef.current = ts;

      if (!activeRef.current) {
        heldKeys.current.clear();
        velRef.current = { x: 0, y: 0 };
        return;
      }

      if (movingRef.current) {
        // ── Currently travelling between tiles ──────────────────

        const px  = pixelRef.current;
        const tgt = targetRef.current;
        const org = originRef.current;

        // Distance vectors
        const remX = tgt.x - px.x;
        const remY = tgt.y - px.y;
        const rem  = Math.sqrt(remX*remX + remY*remY);
        const total = Math.sqrt(
          (tgt.x-org.x)**2 + (tgt.y-org.y)**2
        ) || TILE_SIZE;

        const progress = 1 - (rem / total); // 0 → 1 as we travel

        // ── Pre-queue the next move once 65% through ────────────
        if (progress >= QUEUE_THRESHOLD && !queuedRef.current) {
          tryQueueMove(tileRef.current);
        }

        if (rem < 1.5) {
          // ── Arrived ─────────────────────────────────────────
          pixelRef.current = { ...tgt };
          velRef.current   = { x: 0, y: 0 };

          if (queuedRef.current) {
            // Seamlessly continue into the next tile
            commitQueued();
          } else {
            movingRef.current = false;
            setIsMoving(false);
          }
        } else {
          // ── Ease toward target ───────────────────────────────
          // Direction unit vector toward target
          const dirX = remX / rem;
          const dirY = remY / rem;

          // Braking distance: how far we need to start decelerating
          // so that we arrive at exactly 0 velocity at the target.
          // d = v² / (2a)
          const speed = Math.sqrt(velRef.current.x**2 + velRef.current.y**2);
          const brakeDist = (speed * speed) / (2 * DECEL);

          let ax, ay;
          if (rem <= brakeDist + 2) {
            // Braking zone — decelerate
            ax = -velRef.current.x / (speed || 1) * DECEL;
            ay = -velRef.current.y / (speed || 1) * DECEL;
          } else {
            // Acceleration zone — push toward target
            ax = dirX * ACCEL;
            ay = dirY * ACCEL;
          }

          // Integrate velocity
          let vx = velRef.current.x + ax * dt;
          let vy = velRef.current.y + ay * dt;

          // Clamp to max speed
          const newSpeed = Math.sqrt(vx*vx + vy*vy);
          if (newSpeed > MAX_SPEED) {
            vx = (vx / newSpeed) * MAX_SPEED;
            vy = (vy / newSpeed) * MAX_SPEED;
          }

          velRef.current = { x: vx, y: vy };

          // Integrate position
          let nx = px.x + vx * dt;
          let ny = px.y + vy * dt;

          // Don't overshoot
          const newRemX = tgt.x - nx;
          const newRemY = tgt.y - ny;
          if (Math.sign(newRemX) !== Math.sign(remX)) nx = tgt.x;
          if (Math.sign(newRemY) !== Math.sign(remY)) ny = tgt.y;

          pixelRef.current = { x: nx, y: ny };
        }

        applyTransform();

      } else {
        // ── Idle — watch for new keypresses ────────────────────
        if (heldKeys.current.size > 0) {
          for (const key of heldKeys.current) {
            const dir = DIRS[key];
            if (!dir) continue;
            const [dx, dy, face] = dir;
            const nx = tileRef.current.x + dx;
            const ny = tileRef.current.y + dy;

            setFacing(face);

            if (canMoveTo(nx, ny)) {
              originRef.current = { ...pixelRef.current };
              targetRef.current = { x: nx * TILE_SIZE, y: ny * TILE_SIZE };
              tileRef.current   = { x: nx, y: ny };
              movingRef.current = true;
              velRef.current    = { x: 0, y: 0 };

              setIsMoving(true);
              setTilePos({ x: nx, y: ny });
              if (onTileEnterRef.current) onTileEnterRef.current(nx, ny);
            }
            break;
          }
        }
      }
    };

    applyTransform();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      lastTsRef.current = null;
    };
  }, []);

  // pixelRef exported so useCamera can read the live sub-pixel position
  // each frame without a React re-render.
  return { spriteRef, tileX: tilePos.x, tileY: tilePos.y, facing, isMoving, movingRef, pixelRef };
}
