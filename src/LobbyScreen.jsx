import { useState, useEffect, useRef } from "react";

const C = {
  bg:       "#0a0806",
  bgDeep:   "#060402",
  gold:     "#c8952a",
  goldBright:"#f0c040",
  amber:    "#e07820",
  purple:   "#6633aa",
  purpleGlow:"#aa55ff",
  stone:    "#2a2420",
  text:     "#d4c8a8",
  muted:    "#6a5a40",
  warn:     "#cc3322",
  green:    "#2a6622",
};

// ── Rune / glyph glitch title ─────────────────────────────────────
const RUNE_CHARS = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ";
function randomRune() { return RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)]; }

function RuneTitle({ text }) {
  // Split into words so we can render each word on its own line
  // and control inter-word spacing independently of letter spacing.
  const words = text.split(" ");

  const [displayed, setDisplayed] = useState(() =>
    text.split("").map(c => ({ char: c, glitching: false }))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const idx = Math.floor(Math.random() * text.length);
      if (text[idx] === " ") return;
      setDisplayed(prev => prev.map((c, i) => i === idx ? { char: randomRune(), glitching: true } : c));
      setTimeout(() => {
        setDisplayed(prev => prev.map((c, i) => i === idx ? { char: text[i], glitching: false } : c));
      }, 100);
    }, 180);
    return () => clearInterval(interval);
  }, [text]);

  // Map flat displayed array back onto per-word slices
  let cursor = 0;
  const wordChars = words.map(word => {
    const chars = displayed.slice(cursor, cursor + word.length);
    cursor += word.length + 1; // +1 for the space
    return { word, chars };
  });

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "0.18em",           // vertical gap between lines
      userSelect: "none",
      textAlign: "center",
    }}>
      {wordChars.map(({ word, chars }) => (
        <div
          key={word}
          style={{
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: "clamp(28px, 5.2vw, 62px)",
            fontWeight: "bold",
            // Wide letter spacing within each word
            letterSpacing: "0.32em",
            lineHeight: 1.05,
            // Extra right-padding to visually compensate for trailing letter-spacing
            paddingRight: "0.32em",
          }}
        >
          {chars.map((c, i) => (
            <span key={i} style={{
              color: c.glitching ? C.purpleGlow : C.goldBright,
              textShadow: c.glitching
                ? `0 0 14px ${C.purpleGlow}, 0 0 40px ${C.purple}`
                : `0 0 18px ${C.gold}bb, 0 0 50px ${C.gold}44`,
              transition: c.glitching ? "none" : "color 0.2s, text-shadow 0.2s",
              display: "inline-block",
            }}>{c.char}</span>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Parallax layered mountains / mist canvas ──────────────────────
function SceneCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const tRef      = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);

    const draw = (ts) => {
      rafRef.current = requestAnimationFrame(draw);
      tRef.current = ts / 1000;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Sky gradient — deep night to twilight
      const sky = ctx.createLinearGradient(0, 0, 0, H * 0.65);
      sky.addColorStop(0,   "#03020a");
      sky.addColorStop(0.5, "#0d0818");
      sky.addColorStop(1,   "#1a1020");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H * 0.65);

      // Stars
      ctx.save();
      const seed = 42;
      for (let i = 0; i < 120; i++) {
        const sx = ((Math.sin(seed * i * 0.31 + 1.1) * 0.5 + 0.5)) * W;
        const sy = ((Math.sin(seed * i * 0.17 + 2.3) * 0.5 + 0.5)) * H * 0.55;
        const brightness = 0.3 + Math.abs(Math.sin(tRef.current * 0.5 + i)) * 0.7;
        const r = 0.5 + Math.abs(Math.sin(seed * i * 0.7)) * 1.2;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220,210,180,${brightness * 0.8})`;
        ctx.fill();
      }
      ctx.restore();

      // Moon
      const moonX = W * 0.78, moonY = H * 0.18, moonR = Math.min(W,H)*0.055;
      const moonGlow = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, moonR*2.5);
      moonGlow.addColorStop(0,    "rgba(240,230,180,0.18)");
      moonGlow.addColorStop(1,    "rgba(240,230,180,0)");
      ctx.fillStyle = moonGlow;
      ctx.beginPath(); ctx.arc(moonX, moonY, moonR*2.5, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#e8dfa0";
      ctx.beginPath(); ctx.arc(moonX, moonY, moonR, 0, Math.PI*2); ctx.fill();
      // Moon shadow (crescent)
      ctx.fillStyle = "#0d0818";
      ctx.beginPath(); ctx.arc(moonX + moonR*0.35, moonY, moonR*0.88, 0, Math.PI*2); ctx.fill();

      // Far mountains (dark silhouette)
      ctx.fillStyle = "#0f0d12";
      ctx.beginPath(); ctx.moveTo(0, H*0.65);
      const mPts = [0,0.45, 0.08,0.32, 0.18,0.42, 0.28,0.28, 0.38,0.38, 0.5,0.22, 0.62,0.36, 0.72,0.26, 0.82,0.40, 0.92,0.30, 1,0.44, 1,0.65];
      for (let i=0;i<mPts.length;i+=2) ctx.lineTo(mPts[i]*W, mPts[i+1]*H);
      ctx.closePath(); ctx.fill();

      // Near mountains (slightly lighter)
      ctx.fillStyle = "#14111a";
      ctx.beginPath(); ctx.moveTo(0, H*0.7);
      const m2 = [0,0.56, 0.1,0.46, 0.22,0.55, 0.35,0.40, 0.48,0.52, 0.6,0.44, 0.72,0.54, 0.85,0.42, 1,0.58, 1,0.7];
      for (let i=0;i<m2.length;i+=2) ctx.lineTo(m2[i]*W, m2[i+1]*H);
      ctx.closePath(); ctx.fill();

      // Ground fog / mist
      const fog = ctx.createLinearGradient(0, H*0.6, 0, H);
      fog.addColorStop(0,   "rgba(15,12,20,0)");
      fog.addColorStop(0.3, "rgba(10,8,14,0.7)");
      fog.addColorStop(1,   "#060402");
      ctx.fillStyle = fog;
      ctx.fillRect(0, H*0.6, W, H*0.4);

      // Drifting mist wisps
      for (let i = 0; i < 4; i++) {
        const wx = ((tRef.current * (0.012 + i*0.005) + i * 0.28) % 1.4 - 0.2) * W;
        const wy = H * (0.68 + i * 0.06);
        const ww = W * (0.25 + i * 0.08);
        const mist = ctx.createRadialGradient(wx, wy, 0, wx, wy, ww*0.5);
        mist.addColorStop(0,   `rgba(180,170,200,${0.035 + i*0.01})`);
        mist.addColorStop(1,   "rgba(180,170,200,0)");
        ctx.fillStyle = mist;
        ctx.beginPath(); ctx.ellipse(wx, wy, ww, ww*0.18, 0, 0, Math.PI*2); ctx.fill();
      }

      // Foreground treeline silhouette
      ctx.fillStyle = "#060402";
      ctx.beginPath(); ctx.moveTo(0, H);
      // left trees
      for (let i = 0; i < 7; i++) {
        const tx = (i / 7) * W * 0.35;
        const th = H * (0.82 + Math.sin(i * 1.7) * 0.06);
        ctx.lineTo(tx, th);
        ctx.lineTo(tx + W*0.025, th - H*0.12);
        ctx.lineTo(tx + W*0.05, th);
      }
      // right trees
      for (let i = 0; i < 7; i++) {
        const tx = W - (i / 7) * W * 0.35;
        const th = H * (0.80 + Math.sin(i * 2.1) * 0.06);
        ctx.lineTo(tx, th);
        ctx.lineTo(tx - W*0.025, th - H*0.12);
        ctx.lineTo(tx - W*0.05, th);
      }
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", display:"block" }} />;
}

// ── Floating ember particles ──────────────────────────────────────
function Embers() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener("resize", resize);
    for (let i = 0; i < 40; i++) {
      particles.current.push({
        x: Math.random() * (canvas.width || 800),
        y: Math.random() * (canvas.height || 600),
        r: Math.random() * 1.8 + 0.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -(Math.random() * 0.6 + 0.2),
        alpha: Math.random() * 0.8 + 0.1,
        flicker: Math.random() * Math.PI * 2,
      });
    }
    const draw = (ts) => {
      rafRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles.current) {
        p.x += p.vx + Math.sin(ts/1200 + p.flicker) * 0.15;
        p.y += p.vy;
        p.flicker += 0.04;
        if (p.y < -4) { p.y = canvas.height + 4; p.x = Math.random() * canvas.width; }
        const a = p.alpha * (0.6 + Math.sin(p.flicker) * 0.4);
        const color = Math.random() > 0.3
          ? `rgba(200,120,30,${a})`
          : `rgba(240,200,80,${a})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fillStyle = color;
        ctx.fill();
      }
    };
    rafRef.current = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none" }} />;
}

// ── Validation ────────────────────────────────────────────────────
const USERNAME_RE = /^[a-zA-Z0-9_\-\.]{3,24}$/;
const RESERVED    = new Set(["admin","root","god","null","undefined","system","eldenmoor","hero","champion"]);
function validateUsername(name) {
  const t = name.trim();
  if (!t)                         return "You must name your hero.";
  if (t.length < 3)               return "A hero's name must be at least 3 characters.";
  if (t.length > 24)              return "A name no longer than 24 characters, traveller.";
  if (!USERNAME_RE.test(t))       return "Letters, numbers, _ - . only.";
  if (RESERVED.has(t.toLowerCase())) return "That name is spoken only in legend.";
  return null;
}

function SpinnerRune() {
  const FRAMES = ["◐","◓","◑","◒"];
  const [f, setF] = useState(0);
  useEffect(() => { const t = setInterval(() => setF(p=>(p+1)%4), 130); return ()=>clearInterval(t); }, []);
  return <span>{FRAMES[f]}</span>;
}

// ═══════════════════════════════════════════════════════════════════
export default function LobbyScreen({ onEnter }) {
  const [username, setUsername] = useState("");
  const [error,    setError]    = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const handleSubmit = () => {
    const err = validateUsername(username);
    if (err) { setError(err); return; }
    setError(null);
    setLoading(true);
    setTimeout(() => onEnter(username.trim()), 1000);
  };

  const handleKey = (e) => {
    if (e.key === "Enter") handleSubmit();
    if (error) setError(null);
  };

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: C.bgDeep,
      overflow: "hidden",
      fontFamily: "Georgia, 'Times New Roman', serif",
      color: C.text,
    }}>
      <SceneCanvas />
      <Embers />

      {/* Parchment grain overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 3,
        background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.06) 3px,rgba(0,0,0,0.06) 4px)",
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 4,
        background: "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,0,0.85) 100%)",
      }} />

      {/* UI layer */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 5,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>

        {/* Corner flourishes */}
        {[["top","left"],["top","right"],["bottom","left"],["bottom","right"]].map(([v,h]) => (
          <div key={`${v}${h}`} style={{
            position: "absolute", [v]: 18, [h]: 18,
            width: 40, height: 40,
            borderTop:    v==="top"    ? `1px solid ${C.gold}55` : "none",
            borderBottom: v==="bottom" ? `1px solid ${C.gold}55` : "none",
            borderLeft:   h==="left"   ? `1px solid ${C.gold}55` : "none",
            borderRight:  h==="right"  ? `1px solid ${C.gold}55` : "none",
          }} />
        ))}

        {/* Top divider */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${C.gold}88, ${C.amber}, ${C.gold}88, transparent)`,
        }} />

        {/* Version */}
        <div style={{ position:"absolute", top:14, right:56, fontSize:9, letterSpacing:2, color:C.muted, fontFamily:"'Courier New',monospace" }}>v0.1.0</div>

        {/* Main card */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          width: "100%", maxWidth: 540,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "opacity 0.7s ease, transform 0.7s ease",
        }}>
          {/* Subtitle */}
          <div style={{
            fontSize: 11, letterSpacing: 5, color: C.amber,
            textShadow: `0 0 10px ${C.amber}66`,
            marginBottom: 12,
            fontFamily: "'Courier New', monospace",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.7s ease 0.1s",
          }}>
            WHERE WORLDS TAKE SHAPE
          </div>

          {/* Title */}
          <RuneTitle text="PILLARS OF CREATION" />

          {/* Decorative rule */}
          <div style={{
            margin: "18px 0 28px",
            display: "flex", alignItems: "center", gap: 12, width: "100%",
            opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.2s",
          }}>
            <div style={{ flex:1, height:1, background:`linear-gradient(90deg, transparent, ${C.gold}55)` }} />
            <span style={{ color: C.gold, fontSize: 18 }}>⚜</span>
            <div style={{ flex:1, height:1, background:`linear-gradient(90deg, ${C.gold}55, transparent)` }} />
          </div>

          {/* Panel */}
          <div style={{
            width: "100%",
            background: "rgba(8,6,4,0.90)",
            border: `1px solid ${C.gold}33`,
            boxShadow: `0 0 50px rgba(0,0,0,0.9), inset 0 0 30px rgba(0,0,0,0.5)`,
            padding: "26px 30px 30px",
            display: "flex", flexDirection: "column", gap: 10,
            opacity: mounted ? 1 : 0, transition: "opacity 0.7s ease 0.3s",
          }}>
            <div style={{ fontSize: 10, letterSpacing: 3, color: C.gold, marginBottom: 4, fontFamily:"'Courier New',monospace" }}>
              SPEAK YOUR NAME, TRAVELLER
            </div>

            {/* Input */}
            <div style={{ position:"relative" }}>
              <div style={{
                position:"absolute", left:0, top:0, bottom:0, width:2,
                background: error ? C.warn : loading ? C.amber : C.gold,
                boxShadow: `0 0 6px ${error ? C.warn : C.gold}`,
                transition: "background 0.3s",
              }} />
              <input
                type="text"
                value={username}
                onChange={e => { setUsername(e.target.value); if(error) setError(null); }}
                onKeyDown={handleKey}
                placeholder="Your hero's name..."
                maxLength={24}
                disabled={loading}
                autoFocus
                style={{
                  width: "100%", boxSizing: "border-box",
                  background: "rgba(200,140,40,0.05)",
                  border: "none",
                  borderBottom: `1px solid ${error ? C.warn : C.gold}44`,
                  color: loading ? C.amber : C.text,
                  fontFamily: "Georgia, serif",
                  fontSize: 18,
                  letterSpacing: 2,
                  padding: "10px 12px 10px 14px",
                  outline: "none",
                  caretColor: C.gold,
                  transition: "color 0.3s",
                }}
              />
              <div style={{ position:"absolute", right:8, bottom:8, fontSize:9, color: username.length>20?C.warn:C.muted, fontFamily:"'Courier New',monospace" }}>
                {username.length}/24
              </div>
            </div>

            {/* Error */}
            <div style={{ fontSize:10, letterSpacing:1, color:C.warn, height:14, opacity:error?1:0, transition:"opacity 0.2s", fontFamily:"'Courier New',monospace" }}>
              {error || " "}
            </div>

            <div style={{ fontSize:9, color:C.muted, letterSpacing:1, fontFamily:"'Courier New',monospace" }}>
              LETTERS · NUMBERS · _ - .  ·  3–24 CHARACTERS
            </div>

            {/* Enter button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 10,
                background: loading ? "rgba(200,100,20,0.1)" : "rgba(200,140,40,0.08)",
                border: `1px solid ${loading ? C.amber : C.gold}88`,
                color: loading ? C.amber : C.goldBright,
                fontFamily: "Georgia, serif",
                fontSize: 14,
                letterSpacing: 4,
                padding: "14px 0",
                cursor: loading ? "default" : "pointer",
                width: "100%",
                textShadow: `0 0 10px ${C.gold}88`,
                boxShadow: `0 0 20px ${C.gold}18`,
                transition: "all 0.3s",
              }}
              onMouseEnter={e => { if(!loading) e.currentTarget.style.background="rgba(200,140,40,0.16)"; }}
              onMouseLeave={e => { if(!loading) e.currentTarget.style.background="rgba(200,140,40,0.08)"; }}
            >
              {loading
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}><SpinnerRune /> ENTERING THE REALM…</span>
                : "BEGIN YOUR JOURNEY"}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom divider */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, zIndex:5, height:2,
        background:`linear-gradient(90deg, transparent, ${C.amber}88, ${C.gold}, ${C.amber}88, transparent)`,
      }} />
    </div>
  );
}
