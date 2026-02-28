const C = {
  bg:     "#0d0a06",
  border: "#5a4020",
  gold:   "#c8952a",
  muted:  "#6a5a40",
  green:  "#4aaa55",
  red:    "#aa3322",
};

const STATUS_COLORS = {
  active:   "#c8952a",
  complete: "#4aaa55",
  locked:   "#3a3020",
  failed:   "#aa3322",
};

const STATUS_BG = {
  active:   "#c8952a14",
  complete: "#4aaa5514",
  locked:   "#1a1408",
  failed:   "#aa332214",
};

export default function MissionsPanel({ missions, setMissions, onClose }) {
  const active   = missions.filter(m => m.status === "active");
  const complete = missions.filter(m => m.status === "complete");
  const locked   = missions.filter(m => m.status === "locked" || m.status === "failed");

  return (
    <SidePanel title="QUEST LOG" onClose={onClose}>
      {/* Summary bar */}
      <div style={{ display:"flex", gap:8, marginBottom:14 }}>
        {[
          ["ACTIVE",   active.length,   C.gold],
          ["DONE",     complete.length, C.green],
          ["LOCKED",   locked.length,   C.muted],
        ].map(([label, count, color]) => (
          <div key={label} style={{ flex:1, textAlign:"center", padding:"6px 0", background:"#0a0806", border:`1px solid ${color}44` }}>
            <div style={{ fontSize:18, fontWeight:"bold", color, fontFamily:"Georgia,serif" }}>{count}</div>
            <div style={{ fontSize:9, color:C.muted, letterSpacing:2, fontFamily:"'Courier New',monospace" }}>{label}</div>
          </div>
        ))}
      </div>

      {active.length > 0 && (
        <Section label="ACTIVE QUESTS">
          {active.map(m => <QuestCard key={m.id} mission={m} setMissions={setMissions} />)}
        </Section>
      )}
      {complete.length > 0 && (
        <Section label="COMPLETED">
          {complete.map(m => <QuestCard key={m.id} mission={m} setMissions={setMissions} />)}
        </Section>
      )}
      {locked.length > 0 && (
        <Section label="LOCKED / FAILED">
          {locked.map(m => <QuestCard key={m.id} mission={m} setMissions={setMissions} />)}
        </Section>
      )}
    </SidePanel>
  );
}

function Section({ label, children }) {
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ fontSize:9, letterSpacing:3, color:`${C.gold}88`, marginBottom:6, fontFamily:"'Courier New',monospace" }}>— {label} —</div>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>{children}</div>
    </div>
  );
}

function QuestCard({ mission: m, setMissions }) {
  const color = STATUS_COLORS[m.status] || C.muted;
  const bg    = STATUS_BG[m.status]     || "#0a0806";
  const done  = m.objectives.filter(o => o.done).length;
  const total = m.objectives.length;
  const pct   = total ? Math.round((done / total) * 100) : 0;

  const toggleObjective = (idx) => {
    if (m.status === "locked" || m.status === "complete") return;
    setMissions(ms => ms.map(q =>
      q.id !== m.id ? q : {
        ...q,
        objectives: q.objectives.map((o, i) => i === idx ? { ...o, done: !o.done } : o),
      }
    ));
  };

  return (
    <div style={{ background:bg, border:`1px solid ${color}44`, borderLeft:`3px solid ${color}`, padding:10 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <span style={{ fontWeight:"bold", fontSize:12, color, fontFamily:"Georgia,serif" }}>{m.title}</span>
        <span style={{ fontSize:9, padding:"2px 6px", border:`1px solid ${color}66`, color, letterSpacing:1, fontFamily:"'Courier New',monospace" }}>
          {m.status.toUpperCase()}
        </span>
      </div>

      <div style={{ fontSize:10, color:C.muted, marginBottom:6, lineHeight:1.5 }}>{m.description}</div>

      {/* Progress bar */}
      <div style={{ height:2, background:"#1a1408", marginBottom:6 }}>
        <div style={{ height:"100%", width:`${pct}%`, background:color, transition:"width 0.4s" }} />
      </div>

      {/* Objectives */}
      <div style={{ display:"flex", flexDirection:"column", gap:3, marginBottom:6 }}>
        {m.objectives.map((obj, i) => (
          <div
            key={i}
            onClick={() => toggleObjective(i)}
            style={{
              display:"flex", gap:6, alignItems:"center",
              fontSize:10, color: obj.done ? C.green : "#5a4a30",
              cursor: m.status === "active" ? "pointer" : "default",
              transition:"color 0.2s",
            }}
          >
            <span>{obj.done ? "◉" : "○"}</span>
            <span style={{ textDecoration: obj.done ? "line-through" : "none" }}>{obj.text}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize:10, color:C.muted }}>
        Reward: <span style={{ color:C.gold, fontFamily:"Georgia,serif" }}>{m.reward}</span>
      </div>
    </div>
  );
}

function SidePanel({ title, children, onClose }) {
  return (
    <div style={{
      position:"fixed", top:44, right:0, bottom:0, width:380,
      background:"linear-gradient(180deg,#120e08,#0a0806)",
      borderLeft:`1px solid #5a402088`,
      zIndex:200, display:"flex", flexDirection:"column",
      boxShadow:"-8px 0 40px rgba(0,0,0,0.8)",
      fontFamily:"'Courier New',monospace",
    }}>
      <div style={{ padding:"12px 16px", borderBottom:`1px solid #5a402055`, display:"flex", justifyContent:"space-between", alignItems:"center", background:"#0d0a06" }}>
        <span style={{ color:C.gold, letterSpacing:4, fontSize:12, fontWeight:"bold", fontFamily:"Georgia,serif", textShadow:`0 0 10px ${C.gold}55` }}>⚜ {title}</span>
        <button onClick={onClose} style={{ background:"transparent", border:`1px solid #5a402066`, color:C.gold, padding:"2px 8px", cursor:"pointer", fontFamily:"inherit", fontSize:11 }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"auto", padding:12 }}>{children}</div>
    </div>
  );
}
