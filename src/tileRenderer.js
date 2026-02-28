// ═══════════════════════════════════════════════════════════════════
// tileRenderer.js — Procedural canvas draw functions for every
// built-in tile in Eldenmoor. Each function signature is:
//   (ctx, x, y, size) => void
// where x/y are the top-left corner and size is the tile dimension.
// ═══════════════════════════════════════════════════════════════════

// ── Shared primitives ────────────────────────────────────────────

function grassBase(ctx, x, y, s) {
  ctx.fillStyle = "#1e4a1a";
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#173d14";
  ctx.beginPath(); ctx.ellipse(x+s*.72, y+s*.28, s*.26, s*.2, .4, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+s*.22, y+s*.72, s*.2, s*.15, -.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#224d1c";
  ctx.beginPath(); ctx.ellipse(x+s*.5, y+s*.5, s*.35, s*.28, .8, 0, Math.PI*2); ctx.fill();
}

function grassTuft(ctx, cx, cy, r) {
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath();
    ctx.moveTo(cx + i*r*.6, cy + r*.4);
    ctx.quadraticCurveTo(cx + i*r*1.2, cy - r*1.5, cx + i*r*.9, cy - r*2.2);
    ctx.lineWidth = r * .5;
    ctx.strokeStyle = i === 0 ? "#1a4a10" : "#163d0e";
    ctx.stroke();
  }
}

function drawRock(ctx, cx, cy, rw, rh, s) {
  ctx.fillStyle = "#1e3a1066";
  ctx.beginPath(); ctx.ellipse(cx+s*.02, cy+rh*.7, rw*.9, rh*.3, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#4a5a28";
  ctx.beginPath(); ctx.ellipse(cx, cy+rh*.1, rw, rh, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#7a9030";
  ctx.beginPath(); ctx.ellipse(cx-rw*.05, cy-rh*.08, rw*.85, rh*.8, -.15, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#b89838";
  ctx.beginPath(); ctx.ellipse(cx-rw*.2, cy-rh*.35, rw*.5, rh*.38, -.3, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#caa840";
  ctx.beginPath(); ctx.ellipse(cx-rw*.25, cy-rh*.5, rw*.28, rh*.22, -.4, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#1e3a10"; ctx.lineWidth = s*.02;
  ctx.beginPath(); ctx.ellipse(cx, cy, rw, rh, 0, 0, Math.PI*2); ctx.stroke();
}

function drawFlower(ctx, cx, cy, r, petalColor, centerColor) {
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI*2/5;
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.ellipse(cx+Math.cos(a)*r*1.5, cy+Math.sin(a)*r*1.5, r, r*.7, a, 0, Math.PI*2);
    ctx.fill();
  }
  ctx.fillStyle = centerColor;
  ctx.beginPath(); ctx.arc(cx, cy, r*.65, 0, Math.PI*2); ctx.fill();
}

// ── Ground tiles ─────────────────────────────────────────────────

export function drawGrass(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
}

export function drawGrassTufts(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  [[.22,.28],[.62,.18],[.14,.64],[.72,.58],[.44,.78]].forEach(([tx,ty]) =>
    grassTuft(ctx, x+tx*s, y+ty*s, s*.11));
}

export function drawGrassShaded(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0d200888";
  ctx.beginPath();
  ctx.moveTo(x+s*.28, y+s*.08);
  ctx.bezierCurveTo(x+s*.7,y+s*.04, x+s*.96,y+s*.28, x+s*.92,y+s*.72);
  ctx.bezierCurveTo(x+s*.86,y+s*.96, x+s*.38,y+s*.9, x+s*.28,y+s*.72);
  ctx.bezierCurveTo(x+s*.08,y+s*.5, x+s*.08,y+s*.18, x+s*.28,y+s*.08);
  ctx.fill();
}

export function drawGrassEdgeN(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0d2008aa";
  ctx.beginPath();
  ctx.moveTo(x, y+s*.4);
  ctx.bezierCurveTo(x+s*.3,y+s*.32, x+s*.65,y+s*.38, x+s,y+s*.34);
  ctx.lineTo(x+s, y); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
  grassTuft(ctx, x+s*.18, y+s*.38, s*.09);
  grassTuft(ctx, x+s*.55, y+s*.35, s*.1);
  grassTuft(ctx, x+s*.82, y+s*.37, s*.08);
}

export function drawGrassEdgeS(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0d2008aa";
  ctx.beginPath();
  ctx.moveTo(x, y+s*.62);
  ctx.bezierCurveTo(x+s*.3,y+s*.68, x+s*.65,y+s*.6, x+s,y+s*.66);
  ctx.lineTo(x+s, y+s); ctx.lineTo(x, y+s); ctx.closePath(); ctx.fill();
  grassTuft(ctx, x+s*.25, y+s*.6, s*.1);
  grassTuft(ctx, x+s*.7,  y+s*.62, s*.09);
}

export function drawGrassEdgeE(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0d2008aa";
  ctx.beginPath();
  ctx.moveTo(x+s*.65, y);
  ctx.bezierCurveTo(x+s*.6,y+s*.32, x+s*.68,y+s*.62, x+s*.64,y+s);
  ctx.lineTo(x+s, y+s); ctx.lineTo(x+s, y); ctx.closePath(); ctx.fill();
  grassTuft(ctx, x+s*.68, y+s*.42, s*.1);
}

export function drawGrassEdgeW(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0d2008aa";
  ctx.beginPath();
  ctx.moveTo(x+s*.35, y);
  ctx.bezierCurveTo(x+s*.4,y+s*.32, x+s*.32,y+s*.62, x+s*.36,y+s);
  ctx.lineTo(x, y+s); ctx.lineTo(x, y); ctx.closePath(); ctx.fill();
  grassTuft(ctx, x+s*.3, y+s*.5, s*.1);
}

export function drawGrassCorner(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0d2008aa";
  ctx.beginPath();
  ctx.moveTo(x+s*.62, y);
  ctx.bezierCurveTo(x+s*.58,y+s*.38, x+s*.7,y+s*.58, x+s,y+s*.62);
  ctx.lineTo(x+s, y); ctx.closePath(); ctx.fill();
  grassTuft(ctx, x+s*.74, y+s*.28, s*.1);
}

export function drawDirt(ctx, x, y, s) {
  ctx.fillStyle = "#5a3a18";
  ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#4a2e10";
  ctx.beginPath(); ctx.ellipse(x+s*.6,y+s*.3, s*.22,s*.16, .3,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+s*.25,y+s*.65, s*.18,s*.13, -.2,0,Math.PI*2); ctx.fill();
}

function pathBase(ctx, x, y, s) {
  ctx.fillStyle = "#5a3a18"; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#4a2e1088";
  [[.18,.48],[.48,.38],[.72,.52],[.32,.62]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.ellipse(x+dx*s, y+dy*s, s*.03, s*.02, .3, 0, Math.PI*2); ctx.fill();
  });
}

export function drawDirtPathH(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#7a5228"; ctx.fillRect(x, y+s*.22, s, s*.56);
  ctx.fillStyle = "#5a3a18"; ctx.fillRect(x, y+s*.22, s, s*.56);
  ctx.fillStyle = "#8a6030"; ctx.fillRect(x, y+s*.26, s, s*.48);
  ctx.fillStyle = "#6a4820aa";
  ctx.fillRect(x, y+s*.26, s, s*.04);
  ctx.fillRect(x, y+s*.7,  s, s*.04);
  ctx.fillStyle = "#4a3010";
  [[.18,.5],[.48,.42],[.72,.54],[.34,.62]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.ellipse(x+dx*s,y+dy*s,s*.028,s*.02,.3,0,Math.PI*2); ctx.fill();
  });
}

export function drawDirtPathV(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#8a6030"; ctx.fillRect(x+s*.26, y, s*.48, s);
  ctx.fillStyle = "#6a4820aa";
  ctx.fillRect(x+s*.26, y, s*.04, s);
  ctx.fillRect(x+s*.7,  y, s*.04, s);
  ctx.fillStyle = "#4a3010";
  [[.5,.18],[.42,.48],[.54,.72],[.62,.34]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.ellipse(x+dx*s,y+dy*s,s*.02,s*.028,.3,0,Math.PI*2); ctx.fill();
  });
}

export function drawDirtPathCross(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#8a6030";
  ctx.fillRect(x, y+s*.26, s, s*.48);
  ctx.fillRect(x+s*.26, y, s*.48, s);
}

export function drawDirtPathCurve(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#8a6030";
  ctx.beginPath();
  ctx.moveTo(x+s*.26, y+s);
  ctx.lineTo(x+s*.26, y+s*.26);
  ctx.quadraticCurveTo(x+s*.26, y+s*.26, x+s, y+s*.26);
  ctx.lineTo(x+s, y+s*.74);
  ctx.quadraticCurveTo(x+s*.74, y+s*.74, x+s*.74, y+s);
  ctx.closePath(); ctx.fill();
}

export function drawDirtPathTee(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#8a6030";
  ctx.fillRect(x, y+s*.26, s, s*.48);
  ctx.fillRect(x+s*.26, y+s*.26, s*.48, s*.74);
}

export function drawCobblestone(ctx, x, y, s) {
  ctx.fillStyle = "#2e2820"; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#383028";
  const stones = [[.1,.1,.38,.28],[.52,.06,.36,.3],[.08,.44,.32,.26],[.44,.38,.4,.28],[.1,.74,.3,.22],[.46,.68,.38,.24],[.84,.12,.14,.3],[.84,.5,.14,.3],[.84,.8,.14,.18]];
  stones.forEach(([sx,sy,sw,sh]) => {
    ctx.fillStyle = ["#342c24","#3a3028","#302820"][Math.floor(Math.random()*3) % 3];
    ctx.fillRect(x+sx*s, y+sy*s, sw*s, sh*s);
    ctx.strokeStyle = "#201a14"; ctx.lineWidth = s*.025;
    ctx.strokeRect(x+sx*s, y+sy*s, sw*s, sh*s);
  });
}

export function drawDungeonFloor(ctx, x, y, s) {
  ctx.fillStyle = "#121010"; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "#1e1a16"; ctx.lineWidth = s*.02;
  const g = s * .5;
  for (let i = 0; i <= 2; i++) {
    ctx.beginPath(); ctx.moveTo(x+i*g, y); ctx.lineTo(x+i*g, y+s); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(x, y+i*g); ctx.lineTo(x+s, y+i*g); ctx.stroke();
  }
  ctx.fillStyle = "#181410";
  ctx.beginPath(); ctx.ellipse(x+s*.3,y+s*.3,s*.08,s*.06,.3,0,Math.PI*2); ctx.fill();
}

export function drawSand(ctx, x, y, s) {
  ctx.fillStyle = "#8a6e38"; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#7a6030";
  ctx.beginPath(); ctx.ellipse(x+s*.6,y+s*.35,s*.25,s*.18,.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#987840";
  ctx.beginPath(); ctx.ellipse(x+s*.3,y+s*.65,s*.2,s*.14,-.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#a08848";
  [[.15,.25],[.55,.15],[.8,.55],[.35,.8],[.7,.8]].forEach(([dx,dy]) => {
    ctx.beginPath(); ctx.arc(x+dx*s,y+dy*s,s*.018,0,Math.PI*2); ctx.fill();
  });
}

// ── Water tiles ───────────────────────────────────────────────────

export function drawWater(ctx, x, y, s) {
  ctx.fillStyle = "#0a2238"; ctx.fillRect(x, y, s, s);
  const g = ctx.createLinearGradient(x, y, x, y+s);
  g.addColorStop(0, "#1a5080cc"); g.addColorStop(.5, "#0a223800"); g.addColorStop(1, "#061828aa");
  ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "#2a7ab0aa"; ctx.lineWidth = s*.028;
  [[.16],[.44],[.72]].forEach(([ty]) => {
    ctx.beginPath(); ctx.moveTo(x, y+ty*s);
    ctx.bezierCurveTo(x+s*.28,y+ty*s-s*.038, x+s*.52,y+ty*s+s*.038, x+s*.78,y+ty*s);
    ctx.bezierCurveTo(x+s*.88,y+ty*s-s*.02, x+s*.94,y+ty*s, x+s,y+ty*s); ctx.stroke();
  });
  ctx.fillStyle = "#88ccee66";
  ctx.beginPath(); ctx.ellipse(x+s*.28,y+s*.24,s*.055,s*.028,-.3,0,Math.PI*2); ctx.fill();
}

export function drawWaterEdgeN(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0a2238"; ctx.fillRect(x, y+s*.44, s, s*.56);
  const g = ctx.createLinearGradient(x, y+s*.44, x, y+s);
  g.addColorStop(0,"#1a508088"); g.addColorStop(1,"#0a223800");
  ctx.fillStyle = g; ctx.fillRect(x, y+s*.44, s, s*.56);
  ctx.strokeStyle = "#88ddf8cc"; ctx.lineWidth = s*.038;
  ctx.beginPath(); ctx.moveTo(x, y+s*.48);
  ctx.bezierCurveTo(x+s*.3,y+s*.38, x+s*.62,y+s*.52, x+s,y+s*.46); ctx.stroke();
  grassTuft(ctx, x+s*.18, y+s*.42, s*.09);
  grassTuft(ctx, x+s*.62, y+s*.44, s*.09);
}

export function drawWaterEdgeS(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0a2238"; ctx.fillRect(x, y, s, s*.56);
  ctx.strokeStyle = "#88ddf8cc"; ctx.lineWidth = s*.038;
  ctx.beginPath(); ctx.moveTo(x, y+s*.52);
  ctx.bezierCurveTo(x+s*.3,y+s*.62, x+s*.65,y+s*.48, x+s,y+s*.55); ctx.stroke();
}

export function drawWaterCorner(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#0a2238";
  ctx.beginPath(); ctx.moveTo(x+s*.5,y+s*.5);
  ctx.arc(x+s, y+s, s*.56, Math.PI, Math.PI*1.5); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = "#88ddf8cc"; ctx.lineWidth = s*.038;
  ctx.beginPath(); ctx.arc(x+s, y+s, s*.52, Math.PI, Math.PI*1.5); ctx.stroke();
}

export function drawLava(ctx, x, y, s) {
  ctx.fillStyle = "#300800"; ctx.fillRect(x, y, s, s);
  const g = ctx.createRadialGradient(x+s*.5,y+s*.5,0, x+s*.5,y+s*.5,s*.6);
  g.addColorStop(0,"#ff420088"); g.addColorStop(1,"#30080000");
  ctx.fillStyle = g; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "#ff6600aa"; ctx.lineWidth = s*.03;
  [[.2,.4],[.5,.2],[.7,.55]].forEach(([tx,ty]) => {
    ctx.beginPath(); ctx.moveTo(x+tx*s,y+ty*s);
    ctx.bezierCurveTo(x+(tx+.15)*s,y+(ty-.08)*s, x+(tx+.25)*s,y+(ty+.1)*s, x+(tx+.35)*s,y+ty*s);
    ctx.stroke();
  });
  ctx.fillStyle = "#ff440044";
  ctx.beginPath(); ctx.ellipse(x+s*.4,y+s*.4,s*.15,s*.1,-.3,0,Math.PI*2); ctx.fill();
}

export function drawSwamp(ctx, x, y, s) {
  ctx.fillStyle = "#141f08"; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#1a2a0c";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.5,s*.42,s*.38,.3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#2a3a1088"; ctx.lineWidth = s*.025;
  [[.2,.45],[.55,.3],[.65,.65]].forEach(([tx,ty]) => {
    ctx.beginPath(); ctx.moveTo(x+tx*s,y+ty*s);
    ctx.bezierCurveTo(x+(tx+.12)*s,y+(ty-.06)*s, x+(tx+.2)*s,y+(ty+.08)*s, x+(tx+.32)*s,y+ty*s);
    ctx.stroke();
  });
  ctx.fillStyle = "#3a5a1866";
  ctx.beginPath(); ctx.ellipse(x+s*.35,y+s*.3,s*.08,s*.05,.4,0,Math.PI*2); ctx.fill();
}

// ── Structures ────────────────────────────────────────────────────

export function drawWall(ctx, x, y, s) {
  ctx.fillStyle = "#1a1610"; ctx.fillRect(x, y, s, s);
  const rows = 3, cols = 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offset = r % 2 === 0 ? 0 : s/(cols*2);
      const bx = x + c*(s/cols) + offset;
      const by = y + r*(s/rows);
      const bw = s/cols - s*.04;
      const bh = s/rows - s*.04;
      ctx.fillStyle = r % 2 === 0 ? "#2a2218" : "#252018";
      ctx.fillRect(bx, by, bw, bh);
      ctx.strokeStyle = "#101008"; ctx.lineWidth = s*.03;
      ctx.strokeRect(bx, by, bw, bh);
    }
  }
}

export function drawDoor(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#3a2010";
  ctx.fillRect(x+s*.2, y+s*.15, s*.6, s*.82);
  ctx.fillStyle = "#4a2c18";
  ctx.fillRect(x+s*.24, y+s*.18, s*.52, s*.75);
  ctx.fillStyle = "#5a3820";
  ctx.fillRect(x+s*.24, y+s*.18, s*.24, s*.75);
  ctx.fillStyle = "#c8903866";
  ctx.beginPath(); ctx.arc(x+s*.62, y+s*.52, s*.05, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#1a0c06"; ctx.lineWidth = s*.03;
  ctx.strokeRect(x+s*.2, y+s*.15, s*.6, s*.82);
}

export function drawChest(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#4a2e08";
  ctx.fillRect(x+s*.12, y+s*.35, s*.76, s*.5);
  ctx.fillStyle = "#5a3a10";
  ctx.fillRect(x+s*.12, y+s*.28, s*.76, s*.18);
  ctx.fillStyle = "#7a5a20";
  ctx.fillRect(x+s*.12, y+s*.43, s*.76, s*.04);
  ctx.fillStyle = "#c8901e";
  ctx.fillRect(x+s*.44, y+s*.38, s*.12, s*.12);
  ctx.fillStyle = "#e8b030";
  ctx.beginPath(); ctx.arc(x+s*.5, y+s*.44, s*.04, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#2a1804"; ctx.lineWidth = s*.025;
  ctx.strokeRect(x+s*.12, y+s*.28, s*.76, s*.57);
}

export function drawTower(ctx, x, y, s) {
  ctx.fillStyle = "#0a0806"; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#1a1610";
  ctx.fillRect(x+s*.15, y+s*.08, s*.7, s*.88);
  ctx.fillStyle = "#141210";
  [[0,.08,.15,.12],[.85,.08,.15,.12]].forEach(([bx,by,bw,bh]) =>
    ctx.fillRect(x+bx*s, y+by*s, bw*s, bh*s));
  ctx.fillStyle = "#0a0806";
  ctx.fillRect(x+s*.38, y+s*.55, s*.24, s*.42);
  ctx.fillStyle = "#6060a022";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.35,s*.1,s*.14,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#0a0804"; ctx.lineWidth = s*.03;
  ctx.strokeRect(x+s*.15, y+s*.08, s*.7, s*.88);
}

export function drawFenceH(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  const py = y+s*.42;
  ctx.fillStyle = "#b89050";
  ctx.fillRect(x, py, s, s*.06);
  ctx.fillRect(x, py+s*.14, s, s*.06);
  [.1,.5,.9].forEach(px => {
    ctx.fillStyle = "#8a6830";
    ctx.fillRect(x+px*s-s*.04, py-s*.08, s*.08, s*.32);
    ctx.fillStyle = "#c8a060";
    ctx.fillRect(x+px*s-s*.045, py-s*.1, s*.09, s*.04);
    ctx.strokeStyle = "#4a3010"; ctx.lineWidth = s*.015;
    ctx.strokeRect(x+px*s-s*.04, py-s*.08, s*.08, s*.32);
  });
}

export function drawFenceV(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  const px = x+s*.42;
  ctx.fillStyle = "#b89050";
  ctx.fillRect(px, y, s*.06, s);
  ctx.fillRect(px+s*.14, y, s*.06, s);
  [.1,.5,.9].forEach(py => {
    ctx.fillStyle = "#8a6830";
    ctx.fillRect(px-s*.08, y+py*s-s*.04, s*.32, s*.08);
    ctx.fillStyle = "#c8a060";
    ctx.fillRect(px-s*.1, y+py*s-s*.04, s*.04, s*.08);
  });
}

export function drawFenceCorner(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  const px = x+s*.42, py = y+s*.42;
  ctx.fillStyle = "#b89050";
  ctx.fillRect(px, y, s*.06, py-y+s*.06);
  ctx.fillRect(px, py, x+s-px, s*.06);
  ctx.fillStyle = "#8a6830";
  ctx.fillRect(px-s*.04, py-s*.08, s*.08, s*.32);
  ctx.fillStyle = "#c8a060";
  ctx.fillRect(px-s*.045, py-s*.1, s*.09, s*.04);
  ctx.strokeStyle = "#4a3010"; ctx.lineWidth = s*.015;
  ctx.strokeRect(px-s*.04, py-s*.08, s*.08, s*.32);
}

export function drawFenceGate(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  const py = y+s*.34;
  [.14,.86].forEach(px => {
    ctx.fillStyle = "#6a3e18";
    ctx.fillRect(x+px*s-s*.05, py-s*.1, s*.1, s*.44);
    ctx.fillStyle = "#c8a060";
    ctx.fillRect(x+px*s-s*.055, py-s*.13, s*.11, s*.05);
  });
  ctx.fillStyle = "#b89050";
  [.04,.22,.4].forEach(off => ctx.fillRect(x+s*.18, py+off*s, s*.64, s*.065));
  ctx.strokeStyle = "#8a6030"; ctx.lineWidth = s*.038;
  ctx.beginPath(); ctx.moveTo(x+s*.18, py+s*.04); ctx.lineTo(x+s*.82, py+s*.48); ctx.stroke();
}

// ── Decor tiles ───────────────────────────────────────────────────

export function drawTree(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#5a3010";
  ctx.fillRect(x+s*.43, y+s*.54, s*.14, s*.48);
  ctx.fillStyle = "#3a1e08";
  ctx.fillRect(x+s*.43, y+s*.54, s*.04, s*.48);
  ctx.fillStyle = "#144a10";
  ctx.beginPath(); ctx.arc(x+s*.5, y+s*.35, s*.32, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#1e6618";
  ctx.beginPath(); ctx.arc(x+s*.5, y+s*.32, s*.28, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#28882e";
  ctx.beginPath(); ctx.arc(x+s*.5, y+s*.3, s*.26, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = "#40aa38";
  ctx.beginPath(); ctx.ellipse(x+s*.4, y+s*.2, s*.14, s*.1, -.3, 0, Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#0a2808"; ctx.lineWidth = s*.022;
  ctx.beginPath(); ctx.arc(x+s*.5, y+s*.3, s*.28, 0, Math.PI*2); ctx.stroke();
}

export function drawTreeStump(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#7a4a20";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.65,s*.22,s*.11,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#5a3010";
  ctx.fillRect(x+s*.3, y+s*.52, s*.4, s*.18);
  ctx.fillStyle = "#b89050";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.52,s*.22,s*.1,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#7a6030"; ctx.lineWidth = s*.018;
  [[.14,.05],[.09,.03]].forEach(([a,b]) => {
    ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.52,a*s,b*s,0,0,Math.PI*2); ctx.stroke();
  });
  ctx.strokeStyle = "#3a1e08"; ctx.lineWidth = s*.022;
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.52,s*.22,s*.1,0,0,Math.PI*2); ctx.stroke();
}

export function drawTreeCanopy(ctx, x, y, s) {
  ctx.fillStyle = "#0e2e0a"; ctx.fillRect(x, y, s, s);
  ctx.fillStyle = "#1a5a14";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.46,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#228820";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.4,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#2eaa28";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.34,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#3ec838";
  ctx.beginPath(); ctx.ellipse(x+s*.36,y+s*.32,s*.18,s*.12,-.4,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+s*.6,y+s*.54,s*.12,s*.09,.3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#0a2008"; ctx.lineWidth = s*.022;
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.44,0,Math.PI*2); ctx.stroke();
}

export function drawTreeAutumn(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#5a3010";
  ctx.fillRect(x+s*.43, y+s*.54, s*.14, s*.48);
  ctx.fillStyle = "#5a2808";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.35,s*.32,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#963a10";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.32,s*.28,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#c85010";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.3,s*.24,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#e87818";
  ctx.beginPath(); ctx.ellipse(x+s*.4,y+s*.2,s*.13,s*.09,-.3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#2a0e00"; ctx.lineWidth = s*.022;
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.3,s*.28,0,Math.PI*2); ctx.stroke();
}

export function drawRockLarge(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  [[.22,.3,.09,.07],[.62,.18,.07,.06],[.14,.64,.08,.06],[.72,.58,.09,.07],[.44,.78,.1,.07]].forEach(([tx,ty]) =>
    grassTuft(ctx, x+tx*s, y+ty*s, s*.11));
  drawRock(ctx, x+s*.5, y+s*.52, s*.34, s*.27, s);
}

export function drawRockSmall(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  drawRock(ctx, x+s*.5, y+s*.58, s*.17, s*.13, s);
}

export function drawRockPair(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  [[.22,.3],[.62,.18],[.14,.64],[.72,.58],[.44,.78]].forEach(([tx,ty]) =>
    grassTuft(ctx, x+tx*s, y+ty*s, s*.11));
  drawRock(ctx, x+s*.36, y+s*.5, s*.27, s*.21, s);
  drawRock(ctx, x+s*.66, y+s*.6, s*.14, s*.11, s);
}

export function drawFlowerRed(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  // stem
  ctx.strokeStyle = "#1a4a10"; ctx.lineWidth = s*.025;
  ctx.beginPath(); ctx.moveTo(x+s*.5,y+s*.62); ctx.lineTo(x+s*.5,y+s*.45); ctx.stroke();
  drawFlower(ctx, x+s*.5, y+s*.42, s*.09, "#cc2020", "#e8c020");
  grassTuft(ctx, x+s*.22, y+s*.58, s*.1);
  grassTuft(ctx, x+s*.7,  y+s*.68, s*.09);
}

export function drawFlowerYellow(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#1a4a10"; ctx.lineWidth = s*.025;
  ctx.beginPath(); ctx.moveTo(x+s*.5,y+s*.62); ctx.lineTo(x+s*.5,y+s*.45); ctx.stroke();
  drawFlower(ctx, x+s*.5, y+s*.42, s*.09, "#e8c820", "#e86820");
  grassTuft(ctx, x+s*.24, y+s*.65, s*.1);
}

export function drawFlowerPurple(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#1a4a10"; ctx.lineWidth = s*.025;
  ctx.beginPath(); ctx.moveTo(x+s*.5,y+s*.62); ctx.lineTo(x+s*.5,y+s*.45); ctx.stroke();
  drawFlower(ctx, x+s*.5, y+s*.42, s*.09, "#aa38cc", "#e8d820");
  grassTuft(ctx, x+s*.66, y+s*.65, s*.1);
}

export function drawFlowerPatch(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#1a4a10"; ctx.lineWidth = s*.02;
  [[.3,.36],[.64,.5],[.48,.68]].forEach(([fx,fy]) => {
    ctx.beginPath(); ctx.moveTo(x+fx*s,y+fy*s+s*.18); ctx.lineTo(x+fx*s,y+fy*s); ctx.stroke();
  });
  drawFlower(ctx, x+s*.3,  y+s*.36, s*.078, "#cc2020", "#e8c020");
  drawFlower(ctx, x+s*.64, y+s*.5,  s*.078, "#e8c820", "#e86820");
  drawFlower(ctx, x+s*.48, y+s*.68, s*.068, "#aa38cc", "#e8d820");
  grassTuft(ctx, x+s*.14, y+s*.72, s*.09);
}

export function drawRuins(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#2a2218";
  [[.1,.4,.18,.25],[.34,.28,.22,.3],[.6,.38,.2,.26],[.72,.58,.16,.22]].forEach(([rx,ry,rw,rh]) => {
    ctx.fillStyle = ["#2a2218","#222018","#1e1c14"][Math.floor(rx*10)%3];
    ctx.fillRect(x+rx*s,y+ry*s,rw*s,rh*s);
    ctx.strokeStyle="#141008";ctx.lineWidth=s*.02;
    ctx.strokeRect(x+rx*s,y+ry*s,rw*s,rh*s);
  });
  ctx.fillStyle="#38301866";
  ctx.beginPath();ctx.arc(x+s*.45,y+s*.45,s*.08,0,Math.PI*2);ctx.fill();
}

export function drawSign(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#3a2810";
  ctx.fillRect(x+s*.47, y+s*.38, s*.06, s*.55);
  ctx.fillStyle = "#6a4820";
  ctx.fillRect(x+s*.2, y+s*.22, s*.6, s*.28);
  ctx.fillStyle = "#7a5528";
  ctx.fillRect(x+s*.22, y+s*.24, s*.56, s*.24);
  ctx.fillStyle = "#c8a85888";
  ctx.fillRect(x+s*.28, y+s*.28, s*.12, s*.08);
  ctx.fillRect(x+s*.46, y+s*.28, s*.18, s*.04);
  ctx.fillRect(x+s*.46, y+s*.34, s*.14, s*.04);
  ctx.strokeStyle = "#2a1808"; ctx.lineWidth = s*.025;
  ctx.strokeRect(x+s*.2, y+s*.22, s*.6, s*.28);
}

export function drawShrine(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#1e1228";
  ctx.fillRect(x+s*.28, y+s*.28, s*.44, s*.62);
  ctx.fillStyle = "#2a1a38";
  ctx.fillRect(x+s*.32, y+s*.22, s*.36, s*.12);
  ctx.fillStyle = "#160c1e";
  ctx.beginPath();
  ctx.moveTo(x+s*.38,y+s*.22);
  ctx.lineTo(x+s*.5,y+s*.08);
  ctx.lineTo(x+s*.62,y+s*.22);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#cc8800bb";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.48,s*.07,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#ffcc4488";
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.48,s*.04,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle = "#3a2050"; ctx.lineWidth = s*.025;
  ctx.strokeRect(x+s*.28, y+s*.28, s*.44, s*.62);
}

// ── Collision / spawn tiles ───────────────────────────────────────

export function drawBlock(ctx, x, y, s) {
  ctx.fillStyle = "#ff000022"; ctx.fillRect(x, y, s, s);
  ctx.strokeStyle = "#ff000055"; ctx.lineWidth = s*.04;
  ctx.beginPath();
  ctx.moveTo(x+s*.2, y+s*.2); ctx.lineTo(x+s*.8, y+s*.8);
  ctx.moveTo(x+s*.8, y+s*.2); ctx.lineTo(x+s*.2, y+s*.8);
  ctx.stroke();
}

export function drawPlayerSpawn(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#00cc6688"; ctx.lineWidth = s*.04;
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.3,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = "#00cc6688";
  ctx.font = `bold ${s*.4}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("P", x+s*.5, y+s*.52);
}

export function drawEnemySpawn(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#cc330088"; ctx.lineWidth = s*.04;
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.3,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = "#cc330088";
  ctx.font = `bold ${s*.4}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("E", x+s*.5, y+s*.52);
}

export function drawNpcSpawn(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#3366cc88"; ctx.lineWidth = s*.04;
  ctx.beginPath(); ctx.arc(x+s*.5,y+s*.5,s*.3,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle = "#3366cc88";
  ctx.font = `bold ${s*.4}px monospace`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("N", x+s*.5, y+s*.52);
}

// ── Item tiles ────────────────────────────────────────────────────

export function drawSword(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#8a8890"; ctx.lineWidth = s*.055;
  ctx.beginPath(); ctx.moveTo(x+s*.3,y+s*.7); ctx.lineTo(x+s*.7,y+s*.3); ctx.stroke();
  ctx.strokeStyle = "#c8c0a0"; ctx.lineWidth = s*.03;
  ctx.beginPath(); ctx.moveTo(x+s*.3,y+s*.7); ctx.lineTo(x+s*.68,y+s*.32); ctx.stroke();
  ctx.strokeStyle = "#c89030"; ctx.lineWidth = s*.06;
  ctx.beginPath(); ctx.moveTo(x+s*.28,y+s*.52); ctx.lineTo(x+s*.42,y+s*.66); ctx.stroke();
  ctx.fillStyle = "#8a6820";
  ctx.beginPath(); ctx.arc(x+s*.3,y+s*.7,s*.06,0,Math.PI*2); ctx.fill();
}

export function drawPotion(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#3a0e14";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.58,s*.16,s*.2,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#8a1a28";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.56,s*.13,s*.17,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#cc2840";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.54,s*.1,s*.13,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#ff6880";
  ctx.beginPath(); ctx.ellipse(x+s*.44,y+s*.48,s*.04,s*.06,-.3,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#2a1808";
  ctx.fillRect(x+s*.44,y+s*.3,s*.12,s*.16);
  ctx.fillStyle = "#4a2a10";
  ctx.fillRect(x+s*.4,y+s*.28,s*.2,s*.06);
  ctx.strokeStyle = "#1a0808"; ctx.lineWidth = s*.02;
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.58,s*.16,s*.2,0,0,Math.PI*2); ctx.stroke();
}

export function drawKey(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.strokeStyle = "#b08020"; ctx.lineWidth = s*.055;
  ctx.beginPath(); ctx.arc(x+s*.38,y+s*.38,s*.14,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+s*.5,y+s*.42); ctx.lineTo(x+s*.72,y+s*.64); ctx.stroke();
  ctx.strokeStyle = "#c89028"; ctx.lineWidth = s*.04;
  ctx.beginPath(); ctx.moveTo(x+s*.63,y+s*.55); ctx.lineTo(x+s*.72,y+s*.46); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(x+s*.68,y+s*.6); ctx.lineTo(x+s*.77,y+s*.51); ctx.stroke();
}

export function drawScroll(ctx, x, y, s) {
  grassBase(ctx, x, y, s);
  ctx.fillStyle = "#5a3c14";
  ctx.beginPath(); ctx.ellipse(x+s*.5,y+s*.5,s*.28,s*.22,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#c8a060";
  ctx.fillRect(x+s*.24, y+s*.3, s*.52, s*.4);
  ctx.fillStyle = "#d8b878";
  ctx.fillRect(x+s*.26, y+s*.32, s*.48, s*.36);
  ctx.fillStyle = "#7a5828";
  ctx.beginPath(); ctx.ellipse(x+s*.24,y+s*.5,s*.06,s*.18,0,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(x+s*.76,y+s*.5,s*.06,s*.18,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle = "#5a401888";
  [[.34,.38],[.34,.44],[.34,.5],[.5,.38],[.5,.44]].forEach(([rx,ry]) => {
    ctx.fillRect(x+rx*s,y+ry*s,s*.2,s*.025);
  });
}

// ── Lookup table ─────────────────────────────────────────────────
// Maps every tile id in BUILTIN_TILES to its draw function.

export const TILE_DRAW_FNS = {
  grass:          drawGrass,
  grass_tufts:    drawGrassTufts,
  grass_shaded:   drawGrassShaded,
  grass_edge_n:   drawGrassEdgeN,
  grass_edge_s:   drawGrassEdgeS,
  grass_edge_e:   drawGrassEdgeE,
  grass_edge_w:   drawGrassEdgeW,
  grass_corner:   drawGrassCorner,
  dirt:           drawDirt,
  dirt_path_h:    drawDirtPathH,
  dirt_path_v:    drawDirtPathV,
  dirt_path_cross:drawDirtPathCross,
  dirt_path_curve:drawDirtPathCurve,
  dirt_path_tee:  drawDirtPathTee,
  cobblestone:    drawCobblestone,
  dungeon_floor:  drawDungeonFloor,
  sand:           drawSand,
  water:          drawWater,
  water_edge_n:   drawWaterEdgeN,
  water_edge_s:   drawWaterEdgeS,
  water_corner:   drawWaterCorner,
  lava:           drawLava,
  swamp:          drawSwamp,
  wall:           drawWall,
  door:           drawDoor,
  chest:          drawChest,
  tower:          drawTower,
  fence_h:        drawFenceH,
  fence_v:        drawFenceV,
  fence_corner:   drawFenceCorner,
  fence_gate:     drawFenceGate,
  tree:           drawTree,
  tree_stump:     drawTreeStump,
  tree_canopy:    drawTreeCanopy,
  tree_autumn:    drawTreeAutumn,
  rock_large:     drawRockLarge,
  rock_small:     drawRockSmall,
  rock_pair:      drawRockPair,
  flower_red:     drawFlowerRed,
  flower_yellow:  drawFlowerYellow,
  flower_purple:  drawFlowerPurple,
  flower_patch:   drawFlowerPatch,
  ruins:          drawRuins,
  sign:           drawSign,
  shrine:         drawShrine,
  block:          drawBlock,
  sword:          drawSword,
  potion:         drawPotion,
  key:            drawKey,
  scroll:         drawScroll,
  player_spawn:   drawPlayerSpawn,
  enemy_spawn:    drawEnemySpawn,
  npc_spawn:      drawNpcSpawn,
};
