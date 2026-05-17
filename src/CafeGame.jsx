import { useRef, useEffect, useCallback } from "react";

const W = 800, H = 290, GY = 238;
const CX = 110;
const GRAVITY = 0.62;
const JUMP_V = -15;

const K = {
  espresso:"#3D2B1F", cream:"#F5EDD6", red:"#B8503E",
  beige:"#D4A97A", teal:"#5A9E96", blush:"#F2B0AC", parchment:"#EDE0C4",
};

// ── Drawing ──────────────────────────────────────────────────────────────────

function drawBg(ctx, frame) {
  // Sky
  const grad = ctx.createLinearGradient(0,0,0,GY);
  grad.addColorStop(0, "#D4C5A0");
  grad.addColorStop(1, K.parchment);
  ctx.fillStyle = grad;
  ctx.fillRect(0,0,W,GY);

  // Scrolling clouds
  const cloudSpeed = 0.4;
  [120,320,560,740].forEach((baseX, i) => {
    const cx = ((baseX - frame * cloudSpeed * (0.6+i*0.15)) % (W+160) + W+160) % (W+160) - 80;
    const cy = 38 + i * 12;
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI*2);
    ctx.arc(cx+24, cy-8, 16, 0, Math.PI*2);
    ctx.arc(cx+46, cy, 19, 0, Math.PI*2);
    ctx.fill();
  });

  // Ground
  ctx.fillStyle = K.espresso;
  ctx.fillRect(0, GY, W, H-GY);

  // Ground highlight
  ctx.fillStyle = "rgba(212,169,122,0.35)";
  ctx.fillRect(0, GY, W, 3);

  // Scrolling dots
  const ds = 48;
  const off = (frame * 4) % ds;
  ctx.fillStyle = "rgba(212,169,122,0.4)";
  for (let x = -off; x < W; x += ds) {
    ctx.beginPath();
    ctx.arc(x, GY+12, 2.5, 0, Math.PI*2);
    ctx.fill();
  }
}

function _stroke(ctx, outer, inner, ow, iw) {
  ctx.strokeStyle = outer; ctx.lineWidth = ow; ctx.lineCap = "round"; ctx.stroke();
  ctx.strokeStyle = inner; ctx.lineWidth = iw; ctx.stroke();
}

function drawChar(ctx, charY, frame, jumping) {
  const bob = jumping ? 0 : Math.sin(frame * 0.25) * 2;
  const tilt = jumping ? 0 : Math.sin(frame * 0.22) * 3;

  ctx.save();
  ctx.translate(CX, charY + bob);
  ctx.rotate((tilt * Math.PI) / 180);

  // Cup body
  ctx.beginPath();
  ctx.moveTo(-22, -50); ctx.lineTo(22, -50);
  ctx.lineTo(26, 0); ctx.lineTo(-26, 0);
  ctx.closePath();
  ctx.fillStyle = K.cream; ctx.fill();
  ctx.strokeStyle = K.espresso; ctx.lineWidth = 3; ctx.stroke();

  // Decorative stripes
  ctx.beginPath();
  ctx.moveTo(-25, -20); ctx.lineTo(25, -20);
  ctx.moveTo(-24, -33); ctx.lineTo(24, -33);
  ctx.strokeStyle = K.red; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.3; ctx.stroke();
  ctx.globalAlpha = 1;

  // Coffee surface
  ctx.beginPath();
  ctx.ellipse(0, -50, 22, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = K.beige; ctx.fill();
  ctx.strokeStyle = K.espresso; ctx.lineWidth = 2; ctx.stroke();

  // Handle
  ctx.beginPath();
  ctx.arc(30, -26, 13, -Math.PI * 0.55, Math.PI * 0.55);
  ctx.strokeStyle = K.espresso; ctx.lineWidth = 5; ctx.stroke();

  // Steam wisps
  const sPhase = frame * 0.09;
  [[-8, 0], [0, -4], [8, 0]].forEach(([sx, offset], i) => {
    const mx = sx + Math.sin(sPhase + i * 1.3) * 5;
    ctx.beginPath();
    ctx.moveTo(sx, -52);
    ctx.bezierCurveTo(sx - 4, -59 + offset, mx + 4, -65 + offset, mx, -72 + offset);
    ctx.strokeStyle = "rgba(61,43,31,0.22)";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
  });

  ctx.restore();
}

function drawPanDulce(ctx, x) {
  ctx.save(); ctx.translate(x, GY);
  // shadow
  ctx.beginPath(); ctx.ellipse(0,0,22,6,0,0,Math.PI*2);
  ctx.fillStyle = "rgba(61,43,31,0.15)"; ctx.fill();
  // bun
  ctx.beginPath(); ctx.arc(0,-24,27,0,Math.PI*2);
  ctx.fillStyle = K.beige; ctx.fill();
  ctx.strokeStyle = K.espresso; ctx.lineWidth = 2.5; ctx.stroke();
  // concha ring
  ctx.beginPath(); ctx.arc(0,-24,17,0,Math.PI*2);
  ctx.strokeStyle = K.cream; ctx.lineWidth = 2; ctx.stroke();
  // cross
  ctx.beginPath();
  ctx.moveTo(-15,-24); ctx.lineTo(15,-24);
  ctx.moveTo(0,-39); ctx.lineTo(0,-9);
  ctx.strokeStyle = K.cream; ctx.lineWidth = 2; ctx.stroke();
  // gloss
  ctx.beginPath(); ctx.arc(-8,-32,6,0,Math.PI*2);
  ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fill();
  ctx.restore();
}

function drawLaptop(ctx, x) {
  ctx.save(); ctx.translate(x, GY);
  // shadow
  ctx.beginPath(); ctx.ellipse(0,0,30,6,0,0,Math.PI*2);
  ctx.fillStyle = "rgba(61,43,31,0.15)"; ctx.fill();
  // base
  ctx.beginPath();
  ctx.moveTo(-36,-2); ctx.lineTo(36,-2); ctx.lineTo(32,0); ctx.lineTo(-32,0);
  ctx.closePath();
  ctx.fillStyle = "#2a1c12"; ctx.fill();
  // hinge detail
  ctx.beginPath(); ctx.rect(-4,-4,8,4);
  ctx.fillStyle = "#1a0f08"; ctx.fill();
  // screen body
  ctx.beginPath();
  ctx.moveTo(-30,-64); ctx.lineTo(30,-64);
  ctx.lineTo(30,-2); ctx.lineTo(-30,-2);
  ctx.closePath();
  ctx.fillStyle = K.espresso; ctx.fill();
  ctx.strokeStyle = K.beige; ctx.lineWidth = 2; ctx.stroke();
  // screen face
  ctx.beginPath(); ctx.rect(-24,-58,48,48);
  ctx.fillStyle = "#0d0705"; ctx.fill();
  // dead X
  ctx.beginPath();
  ctx.moveTo(-12,-48); ctx.lineTo(12,-22);
  ctx.moveTo(12,-48); ctx.lineTo(-12,-22);
  ctx.strokeStyle = K.red; ctx.lineWidth = 4; ctx.lineCap="round"; ctx.stroke();
  // keyboard dots
  ctx.fillStyle = "rgba(212,169,122,0.3)";
  for (let kx=-22; kx<=22; kx+=8) {
    ctx.beginPath(); ctx.arc(kx,-3,2,0,Math.PI*2); ctx.fill();
  }
  ctx.restore();
}

function drawWifi(ctx, x) {
  ctx.save(); ctx.translate(x, GY-18);
  // shadow
  ctx.beginPath(); ctx.ellipse(0,18,22,5,0,0,Math.PI*2);
  ctx.fillStyle = "rgba(61,43,31,0.12)"; ctx.fill();
  // arcs
  [[40,K.espresso,5],[28,K.teal,4],[16,K.teal,3.5]].forEach(([r,col,lw]) => {
    ctx.beginPath();
    ctx.arc(0,0,r,Math.PI*1.18,Math.PI*1.82);
    ctx.strokeStyle=col; ctx.lineWidth=lw; ctx.stroke();
  });
  // dot
  ctx.beginPath(); ctx.arc(0,0,5.5,0,Math.PI*2);
  ctx.fillStyle=K.teal; ctx.fill();
  ctx.strokeStyle=K.espresso; ctx.lineWidth=2; ctx.stroke();
  // strike X
  ctx.beginPath();
  ctx.moveTo(-16,-55); ctx.lineTo(16,-25);
  ctx.moveTo(16,-55); ctx.lineTo(-16,-25);
  ctx.strokeStyle=K.red; ctx.lineWidth=5.5; ctx.lineCap="round"; ctx.stroke();
  ctx.restore();
}

// ── Collision ─────────────────────────────────────────────────────────────────

const HB = {
  pan:   {dx:-20, dy:-50, w:40, h:50},
  laptop:{dx:-28, dy:-64, w:56, h:64},
  wifi:  {dx:-30, dy:-72, w:60, h:72},
};
const CHB = {dx:-26, dy:-56, w:52, h:56}; // relative to charY

function collides(charY, obs) {
  const cx1=CX+CHB.dx, cy1=charY+CHB.dy, cx2=cx1+CHB.w, cy2=cy1+CHB.h;
  const h=HB[obs.type];
  const ox1=obs.x+h.dx, oy1=GY+h.dy, ox2=ox1+h.w, oy2=oy1+h.h;
  return cx1<ox2 && cx2>ox1 && cy1<oy2 && cy2>oy1;
}

const TYPES = ["pan","laptop","wifi"];

// ── Component ─────────────────────────────────────────────────────────────────

export default function CafeGame({ onClose }) {
  const DW = Math.min(W, window.innerWidth - 16);
  const DH = Math.round(H * DW / W);

  const canvasRef = useRef(null);
  const g = useRef({
    phase:"start", frame:0, score:0, best:0,
    charY:GY, vy:0, jumping:false, speed:5,
    obstacles:[], nextIn:380, shake:0,
  });
  const raf = useRef(null);

  const action = useCallback(() => {
    const s = g.current;
    if (s.phase==="start") { s.phase="playing"; return; }
    if (s.phase==="dead") {
      Object.assign(s,{phase:"playing",frame:0,score:0,charY:GY,vy:0,jumping:false,speed:5,obstacles:[],nextIn:49*5+80,shake:0});
      return;
    }
    if (!s.jumping) { s.vy=JUMP_V; s.jumping=true; }
  }, []);

  useEffect(() => {
    const onKey = e => { if (e.code==="Space"||e.code==="ArrowUp") { e.preventDefault(); action(); } };
    window.addEventListener("keydown", onKey);
    const cv = canvasRef.current;
    cv.addEventListener("click", action);
    return () => { window.removeEventListener("keydown", onKey); cv.removeEventListener("click", action); };
  }, [action]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv.getContext("2d");

    function loop() {
      const s = g.current;
      s.frame++;

      if (s.phase==="playing") {
        s.vy += GRAVITY;
        s.charY += s.vy;
        if (s.charY >= GY) { s.charY=GY; s.vy=0; s.jumping=false; }
        else s.jumping=true;

        s.speed = Math.min(5 + s.score*0.0028, 15);
        s.nextIn -= s.speed;

        if (s.nextIn<=0) {
          s.obstacles.push({x:W+50, type:TYPES[Math.floor(Math.random()*3)]});
          s.nextIn = 49 * s.speed + 80 + Math.random() * 180;
        }
        s.obstacles = s.obstacles.map(o=>({...o,x:o.x-s.speed})).filter(o=>o.x>-120);

        if (s.obstacles.some(o=>collides(s.charY,o))) {
          s.phase="dead"; s.best=Math.max(s.best,s.score);
        }
        s.score++;
        if (s.shake>0) s.shake--;
      }

      // ── Render ──
      ctx.save();
      if (s.shake>0) ctx.translate((Math.random()-.5)*s.shake*0.8,(Math.random()-.5)*s.shake*0.4);

      drawBg(ctx, s.frame);
      s.obstacles.forEach(o=>{
        if (o.type==="pan") drawPanDulce(ctx,o.x);
        else if (o.type==="laptop") drawLaptop(ctx,o.x);
        else drawWifi(ctx,o.x);
      });
      drawChar(ctx, s.charY, s.frame, s.jumping);

      // Score
      ctx.font="bold 16px 'Nunito',sans-serif";
      ctx.fillStyle=K.espresso; ctx.textAlign="right";
      ctx.fillText(`Score: ${Math.floor(s.score/6)}`, W-18, 26);
      if (s.best>0) {
        ctx.font="12px 'Nunito',sans-serif";
        ctx.fillText(`Best: ${Math.floor(s.best/6)}`, W-18, 46);
      }

      // Speed indicator (Cuphead-style star rating)
      const stars = Math.min(Math.floor(s.speed/3), 5);
      ctx.font="13px sans-serif"; ctx.textAlign="left";
      ctx.fillText("☕".repeat(stars), 18, 26);

      if (s.phase==="start") {
        // Vintage overlay panel
        ctx.fillStyle="rgba(61,43,31,0.72)";
        ctx.fillRect(W/2-180, H/2-65, 360, 120);
        ctx.strokeStyle=K.beige; ctx.lineWidth=3;
        ctx.strokeRect(W/2-180, H/2-65, 360, 120);

        ctx.textAlign="center";
        ctx.font="bold 26px 'Nunito',sans-serif";
        ctx.fillStyle=K.cream;
        ctx.fillText("☕  CAFÉ RUN!", W/2, H/2-28);

        ctx.font="13px 'Nunito',sans-serif";
        ctx.fillStyle=K.beige;
        ctx.fillText("Jump the pan dulce, laptops & dead WiFi", W/2, H/2+2);

        ctx.font="bold 13px 'Nunito',sans-serif";
        ctx.fillStyle=K.blush;
        ctx.fillText("SPACE / TAP TO START", W/2, H/2+30);
      }

      if (s.phase==="dead") {
        ctx.fillStyle="rgba(61,43,31,0.75)";
        ctx.fillRect(0,0,W,H);

        ctx.fillStyle=K.beige; ctx.lineWidth=4;
        ctx.fillRect(W/2-200,H/2-75,400,140);
        ctx.strokeStyle=K.red;
        ctx.strokeRect(W/2-200,H/2-75,400,140);

        ctx.textAlign="center";
        ctx.font="bold 30px 'Nunito',sans-serif";
        ctx.fillStyle=K.espresso;
        ctx.fillText("GAME OVER  ☕", W/2, H/2-34);

        ctx.font="16px 'Nunito',sans-serif";
        ctx.fillText(`Score: ${Math.floor(s.score/6)}   ·   Best: ${Math.floor(s.best/6)}`, W/2, H/2+4);

        ctx.font="bold 13px 'Nunito',sans-serif";
        ctx.fillStyle=K.red;
        ctx.fillText("SPACE / TAP TO TRY AGAIN", W/2, H/2+38);
      }

      ctx.restore();
      raf.current = requestAnimationFrame(loop);
    }

    raf.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  return (
    <div style={{
      position:"fixed",inset:0,zIndex:1000,
      background:"rgba(20,10,5,0.88)",
      display:"flex",flexDirection:"column",
      alignItems:"center",justifyContent:"center",
    }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}
    >
      <div style={{boxShadow:`0 0 0 3px ${K.beige}, 0 8px 40px rgba(0,0,0,0.6)`, width:DW}}>
        {/* Header */}
        <div style={{
          background:K.espresso,borderBottom:`3px solid ${K.beige}`,
          padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",
          flexWrap:"wrap",gap:"4px",
        }}>
          <span style={{fontFamily:"'Pacifico',cursive",fontSize:Math.min(18, 14 + DW/100),color:K.cream}}>
            Café Con <span style={{color:K.blush}}>Pan</span>
            <span style={{fontFamily:"'Nunito',sans-serif",fontSize:10,letterSpacing:"0.18em",textTransform:"uppercase",color:K.beige,marginLeft:10,fontWeight:700}}>
              CAFÉ RUN
            </span>
          </span>
          <button onClick={onClose} style={{
            background:"none",border:`2px solid rgba(212,169,122,0.5)`,color:K.cream,
            cursor:"pointer",fontSize:11,fontWeight:700,letterSpacing:"0.1em",
            padding:"4px 10px",fontFamily:"'Nunito',sans-serif",
          }}>✕ CLOSE</button>
        </div>

        {/* Canvas */}
        <canvas ref={canvasRef} width={W} height={H}
          style={{display:"block",width:DW,height:DH,cursor:"pointer"}} />

        {/* Footer */}
        <div style={{
          background:K.espresso,padding:"6px 12px",textAlign:"center",
          borderTop:`2px solid rgba(212,169,122,0.2)`,
        }}>
          <span style={{fontSize:10,color:"rgba(245,237,214,0.45)",letterSpacing:"0.08em",textTransform:"uppercase",fontFamily:"'Nunito',sans-serif"}}>
            TAP to jump &nbsp;·&nbsp; Avoid pan dulce, laptops & dead WiFi
          </span>
        </div>
      </div>
    </div>
  );
}
