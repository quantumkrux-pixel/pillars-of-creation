// ═══════════════════════════════════════════════════════════════════
// useItemPickup.js — Eldenmoor item interaction
// Step on item → parchment overlay → press F to pick up
// ═══════════════════════════════════════════════════════════════════

import { useCallback, useEffect, useRef, useState } from "react";
import { RARITY_COLORS } from "./constants";

const TOAST_DURATION_MS = 2400;
const DEFAULT_RARITY = { weapon:"rare", armor:"rare", consumable:"common", key:"uncommon", quest:"quest", misc:"common" };
const STACKABLE = new Set(["consumable","key","misc"]);

function buildInventoryItem(tileDef, tid) {
  const itemData = tileDef.itemData ?? {};
  const rarity   = itemData.rarity ?? DEFAULT_RARITY[itemData.type] ?? "common";
  return {
    id:           Date.now() + Math.random(),
    name:         itemData.name       ?? tileDef.label ?? "Unknown",
    type:         itemData.type       ?? "misc",
    rarity,
    icon:         tileDef.char        ?? "◆",
    description:  itemData.description ?? tileDef.description ?? "",
    equipped:     false,
    quantity:     1,
    stats:        itemData.stats      ?? {},
    sourceTileId: tid,
  };
}

export function useItemPickup({ mapLayers, setMapLayers, allTiles, setInventory }) {
  const [pendingItem, setPendingItem] = useState(null);
  const [toasts,      setToasts]      = useState([]);
  const pendingCoordRef = useRef(null);
  const toastIdRef      = useRef(0);

  const pushToast = useCallback((item) => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, item }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), TOAST_DURATION_MS);
  }, []);

  const commitPickup = useCallback(() => {
    if (!pendingItem || !pendingCoordRef.current) return;
    const { x, y } = pendingCoordRef.current;
    setMapLayers(prev => ({
      ...prev,
      items: prev.items.map((row, ry) =>
        ry === y ? row.map((cell, rx) => rx === x ? null : cell) : row
      ),
    }));
    setInventory(prev => {
      if (STACKABLE.has(pendingItem.type)) {
        const idx = prev.findIndex(i => i.sourceTileId === pendingItem.sourceTileId && i.type === pendingItem.type);
        if (idx !== -1) return prev.map((i,n) => n===idx ? {...i, quantity:(i.quantity??1)+1} : i);
      }
      return [...prev, pendingItem];
    });
    pushToast(pendingItem);
    setPendingItem(null);
    pendingCoordRef.current = null;
  }, [pendingItem, setMapLayers, setInventory, pushToast]);

  useEffect(() => {
    const onKey = (e) => {
      if ((e.key === "f" || e.key === "F") && pendingItem) { e.preventDefault(); commitPickup(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingItem, commitPickup]);

  const onTileEnter = useCallback((x, y) => {
    const tid     = mapLayers?.items?.[y]?.[x];
    const tileDef = tid ? allTiles[tid] : null;
    if (tileDef?.item) {
      pendingCoordRef.current = { x, y };
      setPendingItem(buildInventoryItem(tileDef, tid));
    } else {
      setPendingItem(null);
      pendingCoordRef.current = null;
    }
  }, [mapLayers, allTiles]);

  return { onTileEnter, pendingItem, toasts };
}


// ── Item Pickup Overlay ───────────────────────────────────────────
export function ItemPickupOverlay({ pendingItem }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pendingItem) {
      const t = setTimeout(() => setVisible(true), 16);
      return () => clearTimeout(t);
    } else {
      setVisible(false);
    }
  }, [!!pendingItem]);

  if (!pendingItem && !visible) return null;

  const rc = RARITY_COLORS[pendingItem?.rarity] ?? "#9a9a8a";

  return (
    <div style={{
      position:   "fixed",
      bottom:     64,
      left:       "50%",
      transform:  `translateX(-50%) translateY(${visible && pendingItem ? "0" : "14px"})`,
      opacity:    visible && pendingItem ? 1 : 0,
      transition: "opacity 0.22s ease, transform 0.22s ease",
      zIndex:     400,
      pointerEvents: "none",
      fontFamily: "'Courier New', monospace",
    }}>
      <div style={{
        display: "flex", alignItems: "stretch",
        background: "rgba(10,8,4,0.97)",
        border: `1px solid ${rc}88`,
        boxShadow: `0 0 30px rgba(0,0,0,0.9), 0 0 20px ${rc}22`,
        minWidth: 270, maxWidth: 350,
        overflow: "hidden",
      }}>
        {/* Rarity stripe */}
        <div style={{ width:4, flexShrink:0, background:rc }} />

        <div style={{ padding:"14px 16px", flex:1 }}>
          {/* Header */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <span style={{ fontSize:24, flexShrink:0 }}>{pendingItem?.icon}</span>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:13, fontWeight:"bold", color:"#e8d898", fontFamily:"Georgia,serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {pendingItem?.name}
              </div>
              <div style={{ fontSize:9, letterSpacing:2, color:rc, marginTop:2 }}>
                {pendingItem?.rarity?.toUpperCase()} · {pendingItem?.type?.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Description */}
          {pendingItem?.description && (
            <div style={{ fontSize:10, color:"#7a6a50", lineHeight:1.5, marginBottom:10, borderTop:"1px solid #ffffff08", paddingTop:8 }}>
              {pendingItem.description}
            </div>
          )}

          {/* Stat chips */}
          {pendingItem?.stats && Object.keys(pendingItem.stats).length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:10 }}>
              {Object.entries(pendingItem.stats).map(([stat,val]) => (
                <span key={stat} style={{ fontSize:9, letterSpacing:1, color:"#8aaa55", border:"1px solid #8aaa5533", padding:"2px 6px", background:"rgba(100,150,50,0.07)" }}>
                  +{val} {stat.toUpperCase()}
                </span>
              ))}
            </div>
          )}

          {/* F-key prompt */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, paddingTop:8, borderTop:"1px solid #ffffff08" }}>
            <kbd style={{
              display:"inline-flex", alignItems:"center", justifyContent:"center",
              width:22, height:22,
              background:"rgba(200,140,40,0.12)",
              border:`1px solid #c8952a88`,
              color:"#c8952a",
              fontSize:11, fontFamily:"inherit", fontWeight:"bold",
              animation:"kbdGlow 1.4s ease-in-out infinite",
            }}>F</kbd>
            <span style={{ fontSize:10, letterSpacing:2, color:"#7a6a50" }}>TAKE ITEM</span>
            <span style={{ fontSize:9, color:"#3a3020", letterSpacing:1 }}>· WALK AWAY TO LEAVE</span>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes kbdGlow {
          0%,100% { box-shadow:0 0 6px #c8952a44; border-color:#c8952a66; }
          50%      { box-shadow:0 0 14px #c8952a99; border-color:#c8952a; }
        }
      `}</style>
    </div>
  );
}


// ── Pickup Toasts ─────────────────────────────────────────────────
export function PickupToasts({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div style={{ position:"fixed", bottom:52, right:20, zIndex:300, display:"flex", flexDirection:"column-reverse", gap:6, pointerEvents:"none" }}>
      {toasts.map(({ id, item }) => {
        const rc = RARITY_COLORS[item.rarity] ?? "#9a9a8a";
        return (
          <div key={id} style={{
            display:"flex", alignItems:"center", gap:8,
            background:"rgba(10,8,4,0.95)", border:`1px solid ${rc}55`,
            padding:"7px 12px 7px 8px", fontFamily:"'Courier New',monospace",
            fontSize:10, color:"#c8b888", minWidth:180, maxWidth:260,
            animation:"toastSlideIn 0.2s ease forwards",
          }}>
            <div style={{ width:2, alignSelf:"stretch", background:rc, flexShrink:0 }} />
            <span style={{ fontSize:14, flexShrink:0 }}>{item.icon}</span>
            <div style={{ flex:1, overflow:"hidden" }}>
              <div style={{ fontSize:8, letterSpacing:2, color:rc, marginBottom:1 }}>ITEM FOUND</div>
              <div style={{ color:"#e8d898", fontFamily:"Georgia,serif", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                {item.name}{item.quantity>1 && <span style={{ color:"#6a5a40" }}> ×{item.quantity}</span>}
              </div>
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes toastSlideIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
      `}</style>
    </div>
  );
}
