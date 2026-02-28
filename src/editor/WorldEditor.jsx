// ═══════════════════════════════════════════════════════════════════
// WorldEditor.jsx — Eldenmoor Map Editor
// Full-screen tile map editor, toggled by Ctrl+Shift+E.
//
// Props:
//   mapLayers     {object}   current layer→grid state
//   setMapLayers  {fn}       updater for map state (lives in parent)
//   customTiles   {object}   user-uploaded tiles
//   setCustomTiles{fn}       updater for custom tiles
//   allTiles      {object}   merged BUILTIN_TILES + customTiles
//   onClose       {fn}       callback to close the editor
// ═══════════════════════════════════════════════════════════════════

import { useState, useRef } from "react";
import {
  TILE_SIZE, MAP_W, MAP_H,
  LAYERS, LAYER_LABELS,
  EDITOR_BTN,
} from "../constants";

// ── Tool cursors ────────────────────────────────────────────────────
const TOOL_CURSORS = { paint: "crosshair", erase: "not-allowed", fill: "cell", spawn: "cell" };

// ── Tool icon map ───────────────────────────────────────────────────
const TOOL_ICONS = { paint: "✏", erase: "⌫", fill: "◼", spawn: "✦" };

export default function WorldEditor({ mapLayers, setMapLayers, customTiles, setCustomTiles, allTiles, onClose, onExport, onImport, onClear, saveStatus, spawnPos, setSpawnPos }) {

  // ── Import file input ref (for JSON import) ────────────────────
  const importInputRef = useRef();

  // ── Local editor state ──────────────────────────────────────────
  const [activeLayer,    setActiveLayer]    = useState("ground");
  const [selectedTile,   setSelectedTile]   = useState("grass");
  const [tool,           setTool]           = useState("paint"); // paint | erase | fill
  const [showCollision,  setShowCollision]  = useState(true);
  const [zoom,           setZoom]           = useState(1);
  const [isPainting,     setIsPainting]     = useState(false);
  const [isDraggingCam,  setIsDraggingCam]  = useState(false);
  const [dragStart,      setDragStart]      = useState(null);
  const [camOffset,      setCamOffset]      = useState({ x: 0, y: 0 });
  const fileInputRef = useRef();

  const tilesForLayer = Object.values(allTiles).filter(t => t.layer === activeLayer);

  // ── Paint / erase / fill / spawn ────────────────────────────────
  const paintTile = (x, y) => {
    if (tool === "spawn") { setSpawnPos({ x, y }); return; }
    setMapLayers(prev => {
      const next = {
        ...prev,
        [activeLayer]: prev[activeLayer].map(row => [...row]),
      };

      if (tool === "erase") {
        next[activeLayer][y][x] = null;

      } else if (tool === "fill") {
        const target = prev[activeLayer][y][x];
        const visited = Array.from({ length: MAP_H }, () => Array(MAP_W).fill(false));
        const stack = [[x, y]];
        while (stack.length) {
          const [cx, cy] = stack.pop();
          if (cx < 0 || cx >= MAP_W || cy < 0 || cy >= MAP_H) continue;
          if (visited[cy][cx]) continue;
          if (next[activeLayer][cy][cx] !== target) continue;
          visited[cy][cx] = true;
          next[activeLayer][cy][cx] = selectedTile;
          stack.push([cx+1,cy],[cx-1,cy],[cx,cy+1],[cx,cy-1]);
        }

      } else {
        next[activeLayer][y][x] = selectedTile;
      }

      return next;
    });
  };

  // ── Mouse handlers ──────────────────────────────────────────────
  const handleTileMouseDown = (e, x, y) => {
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsDraggingCam(true);
      setDragStart({ mx: e.clientX, my: e.clientY, cx: camOffset.x, cy: camOffset.y });
      return;
    }
    setIsPainting(true);
    paintTile(x, y);
  };

  const handleTileMouseEnter = (e, x, y) => {
    if (isDraggingCam && dragStart) {
      setCamOffset({
        x: dragStart.cx + (e.clientX - dragStart.mx),
        y: dragStart.cy + (e.clientY - dragStart.my),
      });
      return;
    }
    if (isPainting) paintTile(x, y);
  };

  const handleMouseUp = () => {
    setIsPainting(false);
    setIsDraggingCam(false);
    setDragStart(null);
  };

  // ── Image import ────────────────────────────────────────────────
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const id = "custom_" + Date.now();
      setCustomTiles(prev => ({
        ...prev,
        [id]: {
          id,
          label:    file.name.replace(/\.[^.]+$/, ""),
          layer:    activeLayer,
          color:    "#ffffff",
          char:     "□",
          walkable: true,
          scale:    1.0,
          imageUrl: ev.target.result,
        },
      }));
      setSelectedTile(id);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Tile renderer ───────────────────────────────────────────────
  // Same stacked approach as the game viewport — each layer is an
  // absolutely-positioned child scaled by tile.scale.
  const renderTile = (x, y) => {
    const collTile = mapLayers.collision?.[y]?.[x];

    return (
      <div
        key={`${x}-${y}`}
        style={{
          width: TILE_SIZE, height: TILE_SIZE,
          flexShrink: 0, position: "relative",
          overflow: "visible",
          cursor: TOOL_CURSORS[tool],
          userSelect: "none",
          background: "#050510",
          // Faint grid line only in editor, drawn as box-shadow so it
          // doesn't affect layout or create sub-pixel gaps
          boxShadow: "inset 0 0 0 0.5px rgba(200,180,120,0.04)",
        }}
        onMouseDown={(e) => handleTileMouseDown(e, x, y)}
        onMouseEnter={(e) => handleTileMouseEnter(e, x, y)}
      >
        {LAYERS.map((layer, layerIndex) => {
          const tid = mapLayers[layer]?.[y]?.[x];
          if (!tid) return null;
          const t = allTiles[tid];
          if (!t) return null;

          const scale  = t.scale ?? 1;
          const size   = TILE_SIZE * scale;
          const offset = (TILE_SIZE - size) / 2;

          return (
            <div
              key={layer}
              style={{
                position: "absolute",
                left: offset, top: offset,
                width: size, height: size,
                display: "flex", alignItems: "center", justifyContent: "center",
                background: t.imageUrl
                  ? `url(${t.imageUrl}) center/cover`
                  : t.color,
                color: "#fff",
                fontSize: Math.max(9, size * 0.45),
                pointerEvents: "none",
                zIndex: layerIndex,
                // drop-shadow removed — caused visual artifacts between tiles
              }}
            >
              {!t.imageUrl && t.char}
            </div>
          );
        })}

        {/* Collision overlay — shown when collision toggle is on */}
        {collTile && showCollision && (
          <div style={{
            position: "absolute", inset: 0,
            background: "#aa000033",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 9, color: "#aa3322",
            pointerEvents: "none",
            zIndex: 50,
          }}>✕</div>
        )}

        {/* Spawn point marker */}
        {spawnPos?.x === x && spawnPos?.y === y && (
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
            zIndex: 60,
          }}>
            <div style={{
              width: "70%", height: "70%",
              border: "2px solid #c8952a",
              borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(200,149,42,0.15)",
              boxShadow: "0 0 6px #c8952a88",
              animation: "spawnPulse 1.6s ease-in-out infinite",
            }}>
              <span style={{ fontSize: 10, color: "#c8952a" }}>✦</span>
            </div>
            <style>{`
              @keyframes spawnPulse {
                0%,100% { box-shadow: 0 0 4px #c8952a66; opacity:0.8; }
                50%     { box-shadow: 0 0 12px #c8952aaa; opacity:1; }
              }
            `}</style>
          </div>
        )}
      </div>
    );
  };

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 500, display: "flex", flexDirection: "column", background: "#08060302" }}
      onMouseUp={handleMouseUp}
    >
      {/* ── Editor toolbar ── */}
      <div style={{
        height: 44, flexShrink: 0,
        background: "linear-gradient(90deg,#1a1408,#0d0a06,#1a1408)",
        borderBottom: "2px solid #c8952a44",
        display: "flex", alignItems: "center", padding: "0 16px", gap: 10,
      }}>
        <span style={{ color: "#c8952a", fontWeight: "bold", letterSpacing: 3, fontSize: 12, textShadow: "0 0 10px #c8952a66" }}>
          ⚙ WORLD EDITOR
        </span>
        <div style={{ flex: 1 }} />

        <span style={{ fontSize: 10, color: "#444", marginRight: 4 }}>Alt+Drag pan · Scroll zoom</span>
        {spawnPos && (
          <span style={{ fontSize: 9, color: "#c8952a88", letterSpacing: 1 }}>
            ✦ SPAWN ({spawnPos.x},{spawnPos.y})
          </span>
        )}

        {/* Import image */}
        <label style={{ fontSize: 10, color: "#888", cursor: "pointer", border: "1px solid #c8952a33", padding: "3px 8px", background: "#0d0a06" }}>
          + IMPORT IMAGE
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
        </label>

        {/* Collision toggle */}
        <button
          onClick={() => setShowCollision(v => !v)}
          style={{ ...EDITOR_BTN, color: showCollision ? "#aa3322" : "#444", borderColor: showCollision ? "#aa332266" : "#333" }}
        >
          {showCollision ? "◉" : "○"} COLLISION
        </button>

        {/* Tool selector */}
        {["paint", "erase", "fill", "spawn"].map(t => (
          <button
            key={t}
            onClick={() => setTool(t)}
            style={{ ...EDITOR_BTN, color: tool === t ? "#6aaa44" : "#555", borderColor: tool === t ? "#6aaa4466" : "#333" }}
          >
            {TOOL_ICONS[t]} {t.toUpperCase()}
          </button>
        ))}

        {/* Divider */}
        <div style={{ width: 1, height: 24, background: "#c8952a22", margin: "0 4px" }} />

        {/* Save status */}
        {saveStatus && saveStatus !== "idle" && (
          <span style={{ fontSize: 9, letterSpacing: 2, color: saveStatus === "saved" ? "#6aaa44" : saveStatus === "saving" ? "#ff9900" : "#ff3333" }}>
            {saveStatus === "saving" ? "⧖ SAVING…" : saveStatus === "saved" ? "✦ SAVED" : "✕ ERROR"}
          </span>
        )}

        {/* Export map to JSON */}
        <button onClick={onExport} style={{ ...EDITOR_BTN, color: "#6aaa44", borderColor: "#6aaa4444" }}>
          ↓ EXPORT
        </button>

        {/* Import map from JSON */}
        <label style={{ ...EDITOR_BTN, color: "#6688aa", borderColor: "#6688aa44", cursor: "pointer", display: "inline-flex", alignItems: "center" }}>
          ↑ IMPORT
          <input
            ref={importInputRef}
            type="file"
            accept=".json"
            style={{ display: "none" }}
            onChange={e => { onImport(e.target.files[0]); e.target.value = ""; }}
          />
        </label>

        {/* New / clear map */}
        <button
          onClick={() => {
            if (window.confirm("Clear the entire map? This cannot be undone.")) onClear();
          }}
          style={{ ...EDITOR_BTN, color: "#c87020", borderColor: "#c8702044" }}
        >
          ⊗ NEW MAP
        </button>

        {/* Close */}
        <button onClick={onClose} style={{ ...EDITOR_BTN, color: "#c8952a", borderColor: "#c8952a66", marginLeft: 4 }}>
          ✕ CLOSE
        </button>
      </div>

      {/* ── Body: sidebar + map ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* ── Sidebar ── */}
        <div style={{ width: 224, background: "#0a0806", borderRight: "1px solid #c8952a22", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>

          {/* Layer list */}
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #c8952a22" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#c8952a88", marginBottom: 6 }}>ACTIVE LAYER</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {LAYERS.map(l => (
                <button
                  key={l}
                  onClick={() => setActiveLayer(l)}
                  style={{
                    textAlign: "left",
                    background:  activeLayer === l ? "#c8952a18" : "transparent",
                    border:     `1px solid ${activeLayer === l ? "#c8952a55" : "#1a1408"}`,
                    color:       activeLayer === l ? "#c8952a" : "#556",
                    padding: "4px 8px", cursor: "pointer",
                    fontFamily: "inherit", fontSize: 11, letterSpacing: 1,
                    transition: "all 0.15s",
                  }}
                >
                  {activeLayer === l ? "▶ " : "  "}{LAYER_LABELS[l].toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Tile palette */}
          <div style={{ flex: 1, overflow: "auto", padding: "10px 12px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: "#c8952a88", marginBottom: 6 }}>
              TILES · {LAYER_LABELS[activeLayer].toUpperCase()}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
              {tilesForLayer.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTile(t.id)}
                  style={{
                    background:  selectedTile === t.id ? "#c8952a18" : (t.imageUrl ? `url(${t.imageUrl}) center/cover` : `${t.color}33`),
                    border:     `1px solid ${selectedTile === t.id ? "#c8952a" : "#222"}`,
                    borderRadius: 2, padding: 6,
                    cursor: "pointer", color: "#c8b888",
                    fontSize: 11, fontFamily: "inherit",
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    transition: "all 0.15s", minHeight: 48,
                  }}
                >
                  {!t.imageUrl && <span style={{ fontSize: 16 }}>{t.char}</span>}
                  <span style={{ fontSize: 9, letterSpacing: 1 }}>{t.label.toUpperCase()}</span>
                </button>
              ))}
              {tilesForLayer.length === 0 && (
                <div style={{ gridColumn: "1/-1", fontSize: 10, color: "#333", textAlign: "center", padding: 16 }}>
                  No tiles for this layer.<br />Import an image to add one.
                </div>
              )}
            </div>
          </div>

          {/* ── Tile Properties Panel ── */}
          {allTiles[selectedTile] && (
            <TilePropertiesPanel
              tile={allTiles[selectedTile]}
              onUpdate={(patch) => {
                setCustomTiles(prev => ({
                  ...prev,
                  [selectedTile]: {
                    ...(prev[selectedTile] ?? allTiles[selectedTile]),
                    ...patch,
                  },
                }));
              }}
            />
          )}
        </div>

        {/* ── Map canvas ── */}
        <div
          style={{ flex: 1, overflow: "auto", position: "relative", cursor: TOOL_CURSORS[tool] }}
          onWheel={e => setZoom(z => Math.max(0.3, Math.min(3, z - e.deltaY * 0.001)))}
        >
          <div style={{
            transform: `scale(${zoom}) translate(${camOffset.x / zoom}px, ${camOffset.y / zoom}px)`,
            transformOrigin: "top left",
            display: "inline-flex", flexDirection: "column",
            margin: 8, gap: 0,
          }}>
            {Array.from({ length: MAP_H }, (_, y) => (
              <div key={y} style={{ display: "flex", fontSize: 0, lineHeight: 0 }}>
                {Array.from({ length: MAP_W }, (_, x) => renderTile(x, y))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TilePropertiesPanel
// Renders an editable property sheet for the currently selected tile.
// All changes are written back via onUpdate(patch) which the parent
// merges into customTiles — builtin tiles are never mutated directly.
// ═══════════════════════════════════════════════════════════════════
function TilePropertiesPanel({ tile, onUpdate }) {
  const imageUploadRef = useRef();

  // Helper — shared input style
  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    background: "#0d0a06", border: "1px solid #c8952a22",
    color: "#c8b888", padding: "3px 6px",
    fontFamily: "inherit", fontSize: 10,
    outline: "none", borderRadius: 1,
  };

  const labelStyle = {
    fontSize: 9, letterSpacing: 2,
    color: "#c8952a88", display: "block",
    marginBottom: 3, marginTop: 8,
  };

  const handleImageReplace = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onUpdate({ imageUrl: ev.target.result });
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const isItem = !!tile.item;
  const itemData = tile.itemData ?? {};

  return (
    <div style={{
      borderTop: "2px solid #c8952a33",
      background: "#0a0806",
      padding: "10px 12px",
      overflow: "auto",
      maxHeight: 420,
      flexShrink: 0,
    }}>
      <div style={{ fontSize: 9, letterSpacing: 3, color: "#c8952a", marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>TILE PROPERTIES</span>
        {tile.imageUrl && (
          <img src={tile.imageUrl} alt="" style={{ width: 28, height: 28, objectFit: "cover", border: "1px solid #c8952a33" }} />
        )}
      </div>

      {/* Label */}
      <label style={labelStyle}>LABEL</label>
      <input
        style={inputStyle}
        value={tile.label ?? ""}
        onChange={e => onUpdate({ label: e.target.value })}
      />

      {/* Description */}
      <label style={labelStyle}>DESCRIPTION</label>
      <textarea
        style={{ ...inputStyle, resize: "vertical", minHeight: 44, lineHeight: 1.4 }}
        value={tile.description ?? ""}
        onChange={e => onUpdate({ description: e.target.value })}
        placeholder="Tile description…"
      />

      {/* Char / emoji (only for non-image tiles) */}
      {!tile.imageUrl && (
        <>
          <label style={labelStyle}>CHAR / EMOJI</label>
          <input
            style={{ ...inputStyle, width: 48 }}
            value={tile.char ?? ""}
            maxLength={2}
            onChange={e => onUpdate({ char: e.target.value })}
          />
        </>
      )}

      {/* Colour */}
      <label style={labelStyle}>COLOUR</label>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="color"
          value={tile.color?.length === 7 ? tile.color : "#1a1408"}
          onChange={e => onUpdate({ color: e.target.value })}
          style={{ width: 32, height: 24, border: "none", background: "none", cursor: "pointer", padding: 0 }}
        />
        <input
          style={{ ...inputStyle, flex: 1 }}
          value={tile.color ?? ""}
          onChange={e => onUpdate({ color: e.target.value })}
          placeholder="#rrggbb"
        />
      </div>

      {/* Image */}
      <label style={labelStyle}>IMAGE</label>
      <div style={{ display: "flex", gap: 4 }}>
        <label style={{ flex: 1, fontSize: 10, color: "#888", cursor: "pointer", border: "1px solid #c8952a22", padding: "3px 6px", background: "#0d0a06", textAlign: "center" }}>
          {tile.imageUrl ? "↺ REPLACE" : "+ UPLOAD"}
          <input ref={imageUploadRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageReplace} />
        </label>
        {tile.imageUrl && (
          <button
            onClick={() => onUpdate({ imageUrl: null })}
            style={{ fontSize: 10, color: "#ff3333", border: "1px solid #ff333322", background: "#0d0a06", padding: "3px 8px", cursor: "pointer", fontFamily: "inherit" }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Scale */}
      <label style={labelStyle}>SCALE — {(tile.scale ?? 1).toFixed(2)}×</label>
      <input
        type="range" min="0.25" max="2.5" step="0.05"
        value={tile.scale ?? 1}
        onChange={e => onUpdate({ scale: parseFloat(e.target.value) })}
        style={{ width: "100%", accentColor: "#c8952a" }}
      />

      {/* Walkable */}
      <label style={{ ...labelStyle, marginTop: 10, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={tile.walkable ?? true}
          onChange={e => onUpdate({ walkable: e.target.checked })}
          style={{ accentColor: "#6aaa44" }}
        />
        <span style={{ color: tile.walkable ? "#6aaa44" : "#aa3322" }}>
          {tile.walkable ? "✓ WALKABLE" : "✕ BLOCKS MOVEMENT"}
        </span>
      </label>

      {/* ── Item data (only shown for item-layer tiles) ── */}
      {isItem && (
        <>
          <div style={{ marginTop: 12, marginBottom: 6, fontSize: 9, letterSpacing: 3, color: "#c8a820", borderTop: "1px solid #ffcc0022", paddingTop: 8 }}>
            ITEM DATA
          </div>

          <label style={labelStyle}>ITEM NAME</label>
          <input
            style={inputStyle}
            value={itemData.name ?? ""}
            onChange={e => onUpdate({ itemData: { ...itemData, name: e.target.value } })}
          />

          <label style={labelStyle}>ITEM TYPE</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={itemData.type ?? "misc"}
            onChange={e => onUpdate({ itemData: { ...itemData, type: e.target.value } })}
          >
            {["weapon","armor","consumable","key","quest","misc"].map(t => (
              <option key={t} value={t}>{t.toUpperCase()}</option>
            ))}
          </select>

          <label style={labelStyle}>STATS (JSON)</label>
          <input
            style={inputStyle}
            placeholder='e.g. {"atk":12,"def":5}'
            defaultValue={itemData.stats ? JSON.stringify(itemData.stats) : ""}
            onBlur={e => {
              try {
                const parsed = JSON.parse(e.target.value || "{}");
                onUpdate({ itemData: { ...itemData, stats: parsed } });
              } catch (_) { /* ignore bad JSON */ }
            }}
          />

          <label style={labelStyle}>RARITY</label>
          <select
            style={{ ...inputStyle, cursor: "pointer" }}
            value={itemData.rarity ?? "common"}
            onChange={e => onUpdate({ itemData: { ...itemData, rarity: e.target.value } })}
          >
            {["common","uncommon","rare","epic","quest"].map(r => (
              <option key={r} value={r}>{r.toUpperCase()}</option>
            ))}
          </select>
        </>
      )}

      {/* Toggle item flag */}
      <label style={{ ...labelStyle, marginTop: 12, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={!!tile.item}
          onChange={e => onUpdate({
            item: e.target.checked,
            layer: e.target.checked ? "items" : tile.layer,
            itemData: e.target.checked ? (tile.itemData ?? { name: tile.label, type: "misc", rarity: "common" }) : undefined,
          })}
          style={{ accentColor: "#c8a820" }}
        />
        <span style={{ color: tile.item ? "#c8a820" : "#555" }}>IS PICKUP ITEM</span>
      </label>
    </div>
  );
}
