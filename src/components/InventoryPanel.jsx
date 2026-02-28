import { useState } from "react";
import { RARITY_COLORS } from "../constants";

const UNEQUIPPABLE = new Set(["consumable", "key", "quest"]);

const C = {
  bg:     "#0d0a06",
  panel:  "#120e08",
  border: "#5a4020",
  gold:   "#c8952a",
  text:   "#c8b888",
  muted:  "#6a5a40",
  green:  "#4aaa55",
};

export default function InventoryPanel({ inventory, setInventory, onClose }) {
  const handleItemClick = (item) => {
    if (UNEQUIPPABLE.has(item.type)) return;
    setInventory(inv => inv.map(i => i.id === item.id ? { ...i, equipped: !i.equipped } : i));
  };

  const equipped   = inventory.filter(i => i.equipped);
  const unequipped = inventory.filter(i => !i.equipped);

  return (
    <SidePanel title="SATCHEL" onClose={onClose}>
      {/* Stats bar */}
      <div style={{ display:"flex", gap:8, marginBottom:12, padding:"8px 10px", background:"#0a0806", border:`1px solid ${C.border}44` }}>
        {[
          ["⚔️","ATK", equipped.reduce((s,i)=>s+(i.stats?.atk||0),0), "#c8952a"],
          ["🛡️","DEF", equipped.reduce((s,i)=>s+(i.stats?.def||0),0), "#6688aa"],
          ["🎯","RNG", equipped.reduce((s,i)=>s+(i.stats?.rng||0),0), "#6a9955"],
        ].map(([icon,label,val,color]) => (
          <div key={label} style={{ flex:1, textAlign:"center" }}>
            <div style={{ fontSize:18 }}>{icon}</div>
            <div style={{ fontSize:18, color:C.muted, letterSpacing:1 }}>{label}</div>
            <div style={{ fontSize:20, fontWeight:"bold", color }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Equipped section */}
      {equipped.length > 0 && (
        <>
          <SectionLabel>EQUIPPED</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6, marginBottom:12 }}>
            {equipped.map(item => <ItemCard key={item.id} item={item} onClick={handleItemClick} />)}
          </div>
        </>
      )}

      {/* Unequipped / carried items only */}
      {unequipped.length > 0 && (
        <>
          <SectionLabel>CARRIED</SectionLabel>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
            {unequipped.map(item => <ItemCard key={item.id} item={item} onClick={handleItemClick} />)}
          </div>
        </>
      )}

      {unequipped.length === 0 && equipped.length === 0 && (
        <div style={{ textAlign:"center", color:C.muted, fontSize:11, padding:"24px 0", fontFamily:"'Courier New',monospace", letterSpacing:2 }}>
          YOUR SATCHEL IS EMPTY
        </div>
      )}

      <div style={{ marginTop:12, padding:"6px 10px", background:"#0a0806", border:`1px solid ${C.border}33`, fontSize:9, color:C.muted, letterSpacing:1 }}>
        HOVER TO INSPECT · CLICK EQUIPPED ITEM TO UNEQUIP · CLICK CARRIED ITEM TO EQUIP
      </div>
    </SidePanel>
  );
}

function SectionLabel({ children }) {
  return (
    <div style={{ fontSize:14, letterSpacing:3, color:`${C.gold}99`, marginBottom:6, fontFamily:"'Courier New',monospace" }}>
      — {children} —
    </div>
  );
}

function ItemCard({ item, onClick }) {
  const [hovered, setHovered] = useState(false);
  const rc       = RARITY_COLORS[item.rarity] || "#9a9a8a";
  const canEquip = !["consumable","key","quest"].includes(item.type);
  const hasDetail = item.description || (item.stats && Object.keys(item.stats).length > 0);

  return (
    <div
      onClick={() => onClick(item)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background:  hovered ? "#1a140855" : item.equipped ? "#1a140833" : "#0d0a06",
        border:     `3px solid ${hovered ? rc + "99" : rc + "44"}`,
        borderLeft: `5px solid ${rc}`,
        padding:    "8px 10px",
        cursor:      canEquip ? "pointer" : "default",
        transition:  "background 0.2s, border-color 0.2s",
      }}
    >
      {/* Always visible: icon + name */}
      <div style={{ display:"flex", alignItems:"center", gap:6 }}>
        <span style={{
          fontSize:   18,
          filter:     hovered ? `drop-shadow(0 0 5px ${rc})` : "none",
          transition: "filter 0.2s",
          flexShrink: 0,
        }}>
          {item.icon}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:16, fontWeight:"bold", color:rc, fontFamily:"Georgia,serif" }}>
            {item.name}
          </div>
          <div style={{ fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:1, fontFamily:"'Courier New',monospace" }}>
            {item.rarity} · {item.type}
          </div>
        </div>
        {item.quantity > 1 && (
          <span style={{ fontSize:9, color:C.muted, fontFamily:"'Courier New',monospace", flexShrink:0 }}>
            ×{item.quantity}
          </span>
        )}
      </div>

      {/* Hover-reveal: description + stats */}
      <div style={{
        overflow:   "hidden",
        maxHeight:  hovered && hasDetail ? "120px" : "0px",
        opacity:    hovered && hasDetail ? 1 : 0,
        marginTop:  hovered && hasDetail ? 8 : 0,
        transition: "max-height 0.25s ease, opacity 0.2s ease, margin-top 0.2s ease",
      }}>
        {item.description && (
          <div style={{
            fontSize:     12,
            color:        "#7a6a50",
            lineHeight:   1.45,
            marginBottom: item.stats && Object.keys(item.stats).length > 0 ? 6 : 0,
            borderTop:    `1px solid ${rc}22`,
            paddingTop:   6,
          }}>
            {item.description}
          </div>
        )}
        {item.stats && Object.keys(item.stats).length > 0 && (
          <div style={{ display:"flex", gap:6, fontSize:14, flexWrap:"wrap" }}>
            {Object.entries(item.stats).map(([k, v]) => (
              <span key={k} style={{ color:C.muted, fontFamily:"'Courier New',monospace" }}>
                {k.toUpperCase()} <span style={{ color:"#c8b888" }}>+{v}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SidePanel({ title, children, onClose }) {
  return (
    <div style={{
      position:"fixed", top:44, right:0, bottom:0, width:380,
      background:"linear-gradient(180deg,#120e08,#0a0806)",
      borderLeft:`1px solid ${C.border}`,
      zIndex:200, display:"flex", flexDirection:"column",
      boxShadow:"-8px 0 40px rgba(0,0,0,0.8)",
    }}>
      <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}55`, display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0d0a06" }}>
        <span style={{ color:C.gold, letterSpacing:4, fontSize:12, fontWeight:"bold", fontFamily:"Georgia,serif", textShadow:`0 0 10px ${C.gold}55` }}>⚜ {title}</span>
        <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${C.border}`, color:C.gold, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:12 }}>{children}</div>
    </div>
  );
}
