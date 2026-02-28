// ═══════════════════════════════════════════════════════════════════
// Eldenmoor.jsx — root component
// ═══════════════════════════════════════════════════════════════════

import { useState, useEffect, useRef } from "react";
import {
  TILE_SIZE, MAP_W, MAP_H,
  BUILTIN_TILES,
  STARTER_MISSIONS,
  STARTER_INVENTORY,
  emptyMap,
} from "./constants";
import WorldEditor                         from "./editor/WorldEditor";
import InventoryPanel                      from "./components/InventoryPanel";
import MissionsPanel                       from "./components/MissionsPanel";
import { usePersistence }                  from "./usePersistence";
import { usePlayerMovement }               from "./usePlayerMovement";
import { useZoomPrevention }               from "./useZoomPrevention";
import { useItemPickup, ItemPickupOverlay, PickupToasts } from "./useItemPickup";
import PlayerSprite                        from "./PlayerSprite";
import { useSpriteLoader }                 from "./useSpriteLoader";
import LobbyScreen                         from "./LobbyScreen";
import { useAuth }                         from "./useAuth";
import CanvasTile                          from "./components/CanvasTile";
import { useCamera }                       from "./useCamera";

// ── Theme palette ─────────────────────────────────────────────────
const C = {
  bg:     "#080602",
  hudBg:  "linear-gradient(90deg,#1a1408,#0d0a06,#1a1408)",
  border: "#5a402055",
  gold:   "#c8952a",
  muted:  "#6a5a40",
  green:  "#4aaa55",
  text:   "#c8b888",
};

const SAVE_STATUS_STYLES = {
  idle:   { color: "#3a3020",  label: ""              },
  saving: { color: "#c87020",  label: "⧖ INSCRIBING…" },
  saved:  { color: "#6aaa44",  label: "✦ SAVED"        },
  error:  { color: "#aa3322",  label: "✕ SAVE FAILED"  },
};

export default function Pillars() {

  // ── World state ────────────────────────────────────────────────
  const [mapLayers,   setMapLayers]   = useState(emptyMap);
  const [customTiles, setCustomTiles] = useState({});
  const [inventory,   setInventory]   = useState(STARTER_INVENTORY);
  const [missions,    setMissions]    = useState(STARTER_MISSIONS);

  // ── UI state ───────────────────────────────────────────────────
  const [editorOpen, setEditorOpen] = useState(false);
  const [panel,      setPanel]      = useState(null);
  const [spawnPos,   setSpawnPos]   = useState({ x: 5, y: 5 });

  // ── Persistence ────────────────────────────────────────────────
  const { saveStatus, exportMap, importMap, clearMap } = usePersistence({
    mapLayers, setMapLayers, customTiles, setCustomTiles, spawnPos, setSpawnPos,
  });

  const allTiles = { ...BUILTIN_TILES, ...customTiles };

  // ── Auth ───────────────────────────────────────────────────────
  const { username, login, logout, isLoggedIn } = useAuth();

  // ── Zoom prevention ────────────────────────────────────────────
  useZoomPrevention();

  // ── Item pickup (must come before usePlayerMovement) ──────────
  const { onTileEnter, pendingItem, toasts } = useItemPickup({
    mapLayers, setMapLayers,
    allTiles,
    setInventory,
  });

  // ── Player movement ────────────────────────────────────────────
  const { spriteRef, tileX, tileY, facing, isMoving, movingRef, pixelRef } = usePlayerMovement({
    mapLayers,
    allTiles,
    active: !editorOpen && !panel && !pendingItem,
    onTileEnter,
    spawnPos,
  });

  // ── Sprite loading ────────────────────────────────────────────
  const spriteName = "bladesmark";
  const { frames: spriteFrames, manifest: spriteManifest, loading: spriteLoading } =
    useSpriteLoader(spriteName);

  // ── Camera ────────────────────────────────────────────────────
  const viewportRef = useRef(null);
  const { worldRef } = useCamera({ pixelRef, viewportRef });

  // ── Hotkeys ────────────────────────────────────────────────────
  useEffect(() => {
    const held = new Set();
    const onDown = (e) => {
      held.add(e.key);
      if (["Control","Shift","E"].every(k => held.has(k))) {
        e.preventDefault(); setEditorOpen(o => !o); setPanel(null);
      }
      if (!editorOpen) {
        if (e.key === "i" || e.key === "I") setPanel(p => p === "inventory" ? null : "inventory");
        if (e.key === "l" || e.key === "L") setPanel(p => p === "missions"  ? null : "missions");
        if (e.key === "Escape") setPanel(null);
      }
    };
    const onUp = (e) => held.delete(e.key);
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup",   onUp);
    return () => { window.removeEventListener("keydown", onDown); window.removeEventListener("keyup", onUp); };
  }, [editorOpen]);

  // ── Tile renderer ──────────────────────────────────────────────
  const GAME_LAYERS = ["ground","water","structures","decor","items"];

  const renderGameTile = (x, y) => (
    <div key={`${x}-${y}`} style={{
      width:TILE_SIZE, height:TILE_SIZE,
      flexShrink:0, position:"relative",
      overflow:"visible", userSelect:"none",
      background:C.bg,
    }}>
      {GAME_LAYERS.map((layer, li) => {
        const tid = mapLayers[layer]?.[y]?.[x];
        if (!tid) return null;
        const t = allTiles[tid];
        if (!t) return null;
        const scale  = t.scale ?? 1;
        const size   = TILE_SIZE * scale;
        const offset = (TILE_SIZE - size) / 2;
        return (
          <div key={layer} style={{
            position:"absolute", left:offset, top:offset,
            width:size, height:size,
            pointerEvents:"none", zIndex:li,
          }}>
            <CanvasTile tileId={tid} allTiles={allTiles} size={size} />
          </div>
        );
      })}
    </div>
  );

  // ── Stats ──────────────────────────────────────────────────────
  const equipped = inventory.filter(i => i.equipped);
  const stats = {
    hp: 84, maxHp: 100, mp: 40, maxMp: 60,
    atk: equipped.reduce((s,i) => s+(i.stats?.atk||0), 0),
    def: equipped.reduce((s,i) => s+(i.stats?.def||0), 0),
  };
  const statusStyle = SAVE_STATUS_STYLES[saveStatus] ?? SAVE_STATUS_STYLES.idle;

  // ── Gate: show lobby if not logged in ─────────────────────────
  if (!isLoggedIn) return <LobbyScreen onEnter={login} />;

  return (
    <div style={{
      width:"100%", height:"100vh",
      background:C.bg,
      fontFamily:"'Courier New', monospace",
      color:C.text,
      overflow:"hidden", position:"relative",
    }}>

      {/* Subtle parchment grain overlay */}
      <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:999,
        background:"repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.05) 3px,rgba(0,0,0,0.05) 4px)"
      }} />

      {/* ── HUD ── */}
      <div style={{
        position:"fixed", top:0, left:0, right:0, height:44,
        background:C.hudBg,
        borderBottom:`1px solid ${C.border}`,
        display:"flex", alignItems:"center", padding:"0 16px", gap:14,
        zIndex:100, backdropFilter:"blur(8px)",
      }}>
        {/* Title */}
        <span style={{ color:C.gold, fontWeight:"bold", letterSpacing:4, fontSize:13, fontFamily:"Georgia,serif", textShadow:`0 0 12px ${C.gold}66` }}>
          ⚜
        </span>

        {/* Hero name + logout */}
        <div style={{ fontSize:10, color:`${C.gold}99`, letterSpacing:2, display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ color:C.green }}>✦</span>
          <span style={{ color:C.text }}>{username}</span>
          <button onClick={logout} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.muted, fontFamily:"inherit", fontSize:9, letterSpacing:2, padding:"2px 6px", cursor:"pointer" }}>
            LOGOUT
          </button>
        </div>

        {/* Save status */}
        {saveStatus !== "idle" && (
          <span style={{ fontSize:9, letterSpacing:2, color:statusStyle.color, transition:"color 0.3s" }}>
            {statusStyle.label}
          </span>
        )}

        <div style={{ flex:1 }} />

        {/* Stat readouts */}
        <div style={{ display:"flex", gap:14, fontSize:14 }}>
          {[
            ["❤️","HP",  `${stats.hp}/${stats.maxHp}`, "#aa3322"],
            ["✦", "MP",  `${stats.mp}/${stats.maxMp}`, "#6644aa"],
            ["🛡️","DEF", stats.def,                    "#6688aa"],
            ["⚔️","ATK", stats.atk,                    C.gold   ],
          ].map(([icon,label,val,color]) => (
            <div key={label} style={{ display:"flex", gap:4, alignItems:"center" }}>
              <span>{icon}</span>
              <span style={{ color:C.muted }}>{label}</span>
              <span style={{ color, fontWeight:"bold", fontFamily:"Georgia,serif" }}>{val}</span>
            </div>
          ))}
        </div>

        <div style={{ width:1, height:24, background:`${C.gold}22` }} />

        {/* Panel buttons */}
        {[["I","SATCHEL","inventory"],["L","QUESTS","missions"]].map(([key,label,id]) => (
          <button key={id} onClick={() => setPanel(p => p===id ? null : id)}
            style={{
              background: panel===id ? `${C.gold}18` : "transparent",
              border:`1px solid ${panel===id ? C.gold : `${C.gold}44`}`,
              color: panel===id ? C.gold : C.muted,
              padding:"4px 12px", cursor:"pointer", fontFamily:"inherit",
              fontSize:11, letterSpacing:2, transition:"all 0.2s",
            }}>
            [{key}] {label}
          </button>
        ))}

        <div style={{ fontSize:9, color:C.muted, borderLeft:`1px solid ${C.border}`, paddingLeft:12, letterSpacing:1 }}>
          CTRL+SHIFT+E = EDITOR
        </div>
      </div>

      {/* ── Game viewport ── */}
      <div
        ref={viewportRef}
        style={{
          position:"absolute", top:80, left:280, right:0, bottom:0,
          overflow:"hidden",
          border:"3px solid",
          scale:1.7,
        }}
      >
        {/* World container — camera writes transform here */}
        <div ref={worldRef} style={{ position:"absolute", top:0, left:0, lineHeight:0 }}>

          {/* Static tile grid */}
          <div style={{ display:"flex", flexDirection:"column" }}>
            {Array.from({ length:MAP_H }, (_, y) => (
              <div key={y} style={{ display:"flex", fontSize:0 }}>
                {Array.from({ length:MAP_W }, (_, x) => renderGameTile(x, y))}
              </div>
            ))}
          </div>

          {/* Player sprite */}
          <PlayerSprite
            spriteRef={spriteRef}
            scale="1"
            facing={facing}
            isMoving={isMoving}
            frames={spriteLoading ? null : spriteFrames}
            manifest={spriteManifest}
            spriteName={spriteLoading ? spriteName : null}
            movingRef={movingRef}
          />
        </div>
      </div>

      {/* ── Overlays ── */}
      <ItemPickupOverlay pendingItem={pendingItem} />
      <PickupToasts toasts={toasts} />

      {/* Panels */}
      {panel === "inventory" && <InventoryPanel inventory={inventory} setInventory={setInventory} onClose={() => setPanel(null)} />}
      {panel === "missions"  && <MissionsPanel  missions={missions}   setMissions={setMissions}   onClose={() => setPanel(null)} />}

      {/* Editor */}
      {editorOpen && (
        <WorldEditor
          mapLayers={mapLayers}     setMapLayers={setMapLayers}
          customTiles={customTiles} setCustomTiles={setCustomTiles}
          allTiles={allTiles}
          onClose={() => setEditorOpen(false)}
          onExport={exportMap} onImport={importMap} onClear={clearMap}
          saveStatus={saveStatus}
          spawnPos={spawnPos} setSpawnPos={setSpawnPos}
        />
      )}
    </div>
  );
}