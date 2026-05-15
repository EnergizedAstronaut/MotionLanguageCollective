import { useState, useEffect, useRef } from "react";

const C = {
  bg: '#010d1a', panel: 'rgba(1,8,22,0.88)',
  cyan: '#00d4f0', cyanDim: 'rgba(0,212,240,0.15)',
  pink: '#ff1b92', pinkLight: '#ffc7e3', pinkDim: 'rgba(255,24,146,0.15)',
  green: '#00ff9d', amber: '#ffaa00',
};
const MONO = "'Share Tech Mono','Courier New',monospace";
const ORBITRON = "'Orbitron',monospace";

const BONES = [
  [0,1],[1,2],[1,3],[2,4],[4,6],[3,5],[5,7],
  [1,8],[8,9],[8,10],[9,11],[11,13],[10,12],[12,14]
];

const STAND = [[0,-118],[0,-99],[-36,-80],[36,-80],[-50,-48],[50,-48],[-48,-14],[48,-14],[0,0],[-20,10],[20,10],[-26,61],[26,61],[-23,115],[23,115]];
const WAVE  = [[4,-120],[2,-100],[-34,-82],[38,-82],[-48,-50],[62,-26],[-46,-16],[70,6],[0,0],[-22,10],[22,10],[-26,62],[26,62],[-23,116],[23,116]];
const LEAN  = [[-6,-116],[-4,-98],[-42,-80],[32,-82],[-54,-50],[46,-52],[-52,-18],[42,-20],[-4,0],[-24,9],[18,9],[-28,60],[22,62],[-24,114],[18,114]];
const SWOON = [[-20,-108],[-15,-91],[-50,-76],[26,-78],[-62,-46],[40,-50],[-60,-14],[36,-18],[-12,0],[-30,7],[12,7],[-34,57],[16,59],[-30,110],[12,110]];

function runPose(c) {
  const s = Math.sin(c * Math.PI * 2);
  return [
    [s*4,-126],[s*2,-107],[-40-s*5,-88],[40+s*5,-88],
    [-50+s*22,-54],[50-s*22,-54],[-48+s*28,-21],[48-s*28,-21],
    [0,0],[-20,9],[20,9],[-24+s*42,58],[24-s*42,58],[-20+s*38,111],[20-s*38,111]
  ];
}

function lp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }
function eio(t) { t = Math.max(0, Math.min(1, t)); return t < 0.5 ? 2*t*t : -1+(4-2*t)*t; }
function lpPose(a, b, t) {
  t = Math.max(0, Math.min(1, t));
  return a.map((j, i) => [j[0] + (b[i][0] - j[0]) * t, j[1] + (b[i][1] - j[1]) * t]);
}
function wJ(pose, px, py, angle, flipX, SC) {
  const cos = Math.cos(angle), sin = Math.sin(angle);
  return pose.map(([lx, ly]) => {
    const rx = lx*cos - ly*sin, ry = lx*sin + ly*cos;
    return [px + (flipX ? -rx : rx) * SC, py + ry * SC];
  });
}


// ── Cinematic Chat Replay ────────────────────────────────────────────────────
function CinematicReplay({ messages, yourName, crushName, onDone }) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [typingFor, setTypingFor] = useState(null);
  const [phase, setPhase] = useState('playing');
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!messages || messages.length === 0) { onDone(); return; }
    let cancelled = false;
    const showNext = (idx) => {
      if (cancelled) return;
      if (idx >= messages.length) {
        setTypingFor(null);
        setPhase('done');
        setTimeout(() => { if (!cancelled) onDone(); }, 2400);
        return;
      }
      setTypingFor(messages[idx].sender);
      const typingMs = 550 + Math.min(messages[idx].text.length * 26, 1300);
      setTimeout(() => {
        if (cancelled) return;
        setTypingFor(null);
        setVisibleCount(idx + 1);
        setTimeout(() => showNext(idx + 1), 380 + Math.random() * 220);
      }, typingMs);
    };
    const t = setTimeout(() => showNext(0), 600);
    return () => { cancelled = true; clearTimeout(t); };
  }, [messages]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [visibleCount, typingFor]);

  const youLabel   = (yourName  || 'YOU').toUpperCase();
  const crushLabel = (crushName || 'CRUSH').toUpperCase();

  return (
    <div style={{ position:'absolute', inset:0, zIndex:35, display:'flex', flexDirection:'column', alignItems:'center', background:C.bg, fontFamily:MONO }}>
      <div style={{ position:'absolute', inset:0, backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,0.07) 3px,rgba(0,0,0,0.07) 4px)', pointerEvents:'none', zIndex:1 }} />

      {/* header */}
      <div style={{ width:'100%', padding:'11px 20px', borderBottom:'1px solid rgba(255,24,146,0.15)', background:'rgba(1,8,22,0.97)', zIndex:10, display:'flex', justifyContent:'space-between', alignItems:'center', flexShrink:0 }}>
        <div style={{ fontFamily:ORBITRON, fontSize:9, color:C.cyan, letterSpacing:'0.2em' }}>MLC · REPLAY DECODING</div>
        <div style={{ display:'flex', gap:12, alignItems:'center' }}>
          <span style={{ fontSize:8, color:C.pink, letterSpacing:'0.1em' }}>{youLabel}</span>
          <span style={{ fontSize:7, color:'rgba(255,199,227,0.25)' }}>vs</span>
          <span style={{ fontSize:8, color:C.cyan, letterSpacing:'0.1em' }}>{crushLabel}</span>
        </div>
      </div>

      {/* messages */}
      <div ref={scrollRef} style={{ width:'100%', maxWidth:440, flex:1, overflowY:'auto', padding:'14px 18px 80px', display:'flex', flexDirection:'column', gap:10, scrollbarWidth:'none', position:'relative', zIndex:2 }}>
        {(messages || []).slice(0, visibleCount).map((msg, i) => {
          const isYou = msg.sender === 'you';
          return (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems: isYou ? 'flex-end' : 'flex-start', animation:'bubbleIn 0.32s cubic-bezier(0.34,1.56,0.64,1) both' }}>
              <div style={{ fontSize:7, letterSpacing:'0.14em', color: isYou ? 'rgba(255,24,146,0.5)' : 'rgba(0,212,240,0.5)', marginBottom:3 }}>
                {isYou ? youLabel : crushLabel}
              </div>
              <div style={{ maxWidth:'76%', padding:'9px 13px', background: isYou ? 'rgba(255,24,146,0.11)' : 'rgba(0,212,240,0.09)', border:`1px solid ${isYou ? 'rgba(255,24,146,0.32)' : 'rgba(0,212,240,0.28)'}`, borderRadius: isYou ? '12px 12px 2px 12px' : '12px 12px 12px 2px', fontSize:12, color: isYou ? C.pinkLight : C.cyan, lineHeight:1.5, boxShadow: isYou ? '0 0 10px rgba(255,24,146,0.13)' : '0 0 10px rgba(0,212,240,0.10)' }}>
                {msg.text}
              </div>
            </div>
          );
        })}

        {typingFor && (
          <div style={{ display:'flex', flexDirection:'column', alignItems: typingFor === 'you' ? 'flex-end' : 'flex-start' }}>
            <div style={{ fontSize:7, letterSpacing:'0.14em', color: typingFor === 'you' ? 'rgba(255,24,146,0.4)' : 'rgba(0,212,240,0.4)', marginBottom:3 }}>
              {typingFor === 'you' ? youLabel : crushLabel}
            </div>
            <div style={{ padding:'10px 16px', background: typingFor === 'you' ? 'rgba(255,24,146,0.07)' : 'rgba(0,212,240,0.06)', border:`1px solid ${typingFor === 'you' ? 'rgba(255,24,146,0.18)' : 'rgba(0,212,240,0.18)'}`, borderRadius: typingFor === 'you' ? '12px 12px 2px 12px' : '12px 12px 12px 2px', display:'flex', gap:5, alignItems:'center' }}>
              {[0,1,2].map(d => (
                <div key={d} style={{ width:6, height:6, borderRadius:'50%', background: typingFor === 'you' ? C.pink : C.cyan, animation:`typingDot 1.1s ${d*0.18}s infinite ease-in-out` }} />
              ))}
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{ textAlign:'center', marginTop:20, animation:'bubbleIn 0.5s ease both' }}>
            <div style={{ fontFamily:ORBITRON, fontSize:10, color:C.pink, letterSpacing:'0.2em', marginBottom:5 }}>PATTERN DECODED</div>
            <div style={{ fontSize:8, color:'rgba(255,199,227,0.35)', letterSpacing:'0.15em' }}>REVEALING RESULTS...</div>
          </div>
        )}
      </div>

      {/* skip */}
      <div style={{ position:'absolute', bottom:18, right:18, zIndex:10 }}>
        <button onClick={onDone} style={{ background:'transparent', border:'1px solid rgba(255,24,146,0.22)', color:'rgba(255,199,227,0.35)', fontFamily:MONO, fontSize:8, letterSpacing:'0.15em', padding:'7px 16px', cursor:'pointer' }} onMouseEnter={e => e.currentTarget.style.borderColor='rgba(255,24,146,0.55)'} onMouseLeave={e => e.currentTarget.style.borderColor='rgba(255,24,146,0.22)'}>SKIP →</button>
      </div>

      <style>{`
        @keyframes bubbleIn { from{opacity:0;transform:scale(0.82) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes typingDot { 0%,80%,100%{transform:scale(0.55);opacity:0.35} 40%{transform:scale(1);opacity:1} }
      `}</style>
    </div>
  );
}

export default function App() {
  const cvRef   = useRef(null);
  const fileRef = useRef(null);
  const [screen,     setScreen]     = useState('landing');
  const [files,      setFiles]      = useState([]);
  const [yourName,   setYourName]   = useState('');
  const [crushName,  setCrushName]  = useState('');
  const [progress,   setProgress]   = useState(0);
  const [statusMsg,  setStatusMsg]  = useState('');
  const [result,     setResult]     = useState(null);
  const [chatReplay,  setChatReplay]  = useState([]);
  const [replayIdx,   setReplayIdx]   = useState(0);

  // ── fonts ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700&display=swap';
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  // ── canvas animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const cv = cvRef.current;
    if (!cv) return;
    const ctx = cv.getContext('2d');
    let W, H, GY, SC, raf;

    const resize = () => {
      W  = cv.width  = cv.offsetWidth;
      H  = cv.height = cv.offsetHeight;
      GY = H * 0.67;
      SC = Math.max(0.34, Math.min(0.82, H / 700));
    };
    resize();
    window.addEventListener('resize', resize);

    const hearts = [];
    function spawnHearts(x, y) {
      for (let i = 0; i < 10; i++) {
        hearts.push({
          x, y,
          vx: (Math.random() - 0.5) * 2,
          vy: -1.2 - Math.random() * 2.5,
          life: 1,
          decay: 0.016 + Math.random() * 0.014,
          sz: 5 + Math.random() * 7,
        });
      }
    }

    function drawHeart(x, y, sz, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha * 0.88;
      ctx.fillStyle   = C.pinkLight;
      ctx.shadowColor = C.pink;
      ctx.shadowBlur  = 10;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.bezierCurveTo(x, y-sz*.3, x-sz*.5, y-sz*.5, x-sz*.5, y-sz*.25);
      ctx.bezierCurveTo(x-sz*.5, y+sz*.1, x, y+sz*.4, x, y+sz*.5);
      ctx.bezierCurveTo(x, y+sz*.4, x+sz*.5, y+sz*.1, x+sz*.5, y-sz*.25);
      ctx.bezierCurveTo(x+sz*.5, y-sz*.5, x, y-sz*.3, x, y);
      ctx.fill();
      ctx.restore();
    }

    function drawBg() {
      ctx.fillStyle = C.bg;
      ctx.fillRect(0, 0, W, H);

      ctx.save();
      ctx.strokeStyle = 'rgba(0,80,120,0.09)';
      ctx.lineWidth   = 0.5;
      const g = Math.min(W, H) * 0.055;
      for (let x = 0; x < W; x += g) { ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
      for (let y = 0; y < H; y += g) { ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
      ctx.restore();

      ctx.save();
      ctx.strokeStyle = 'rgba(255,24,146,0.1)';
      ctx.shadowColor = 'rgba(255,24,146,0.18)';
      ctx.shadowBlur  = 8;
      ctx.lineWidth   = 0.8;
      ctx.beginPath(); ctx.moveTo(0, GY); ctx.lineTo(W, GY); ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.globalAlpha = 0.018;
      ctx.fillStyle   = '#000';
      for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 2);
      ctx.restore();
    }

    function drawFig(joints, col, alpha, gender, facingRight) {
      if (alpha <= 0) return;
      const hr = 12 * SC;

      // glow pass
      ctx.save();
      ctx.globalAlpha = alpha * 0.28;
      ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 22;
      ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (const [a, b] of BONES) {
        ctx.beginPath(); ctx.moveTo(joints[a][0], joints[a][1]);
        ctx.lineTo(joints[b][0], joints[b][1]); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(joints[0][0], joints[0][1], hr, 0, Math.PI*2); ctx.stroke();
      ctx.restore();

      // core pass
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = col; ctx.shadowColor = col; ctx.shadowBlur = 9;
      ctx.lineWidth = 1.5; ctx.lineCap = 'round';
      for (const [a, b] of BONES) {
        ctx.beginPath(); ctx.moveTo(joints[a][0], joints[a][1]);
        ctx.lineTo(joints[b][0], joints[b][1]); ctx.stroke();
      }
      ctx.beginPath(); ctx.arc(joints[0][0], joints[0][1], hr, 0, Math.PI*2); ctx.stroke();

      // girl hair / ponytail
      if (gender === 'girl') {
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(joints[0][0], joints[0][1], hr * 1.15, Math.PI*1.15, Math.PI*1.85, false);
        ctx.stroke();
        const side = facingRight ? -1 : 1;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(joints[0][0] + side*hr*0.65, joints[0][1] - hr*0.5);
        ctx.quadraticCurveTo(
          joints[0][0] + side*hr*2.0, joints[0][1] - hr*0.1,
          joints[0][0] + side*hr*1.7, joints[0][1] + hr*1.1
        );
        ctx.stroke();
      }

      ctx.fillStyle = col;
      for (const j of joints) { ctx.beginPath(); ctx.arc(j[0], j[1], 2.1, 0, Math.PI*2); ctx.fill(); }
      ctx.restore();
    }

    function drawLabel(txt, x, hy, col, alpha) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.font        = `8px ${MONO}`;
      ctx.fillStyle   = col;
      ctx.textAlign   = 'center';
      ctx.fillText(txt, x, hy - 18*SC);
      ctx.restore();
    }

    let T0 = null, hSpawned = false;
    const DUR = 9200;

    function frame(ts) {
      if (!T0) T0 = ts;
      const t = ((ts - T0) % DUR) / 1000;
      if (t < 0.06) hSpawned = false;

      drawBg();

      const MX  = W * 0.5;
      const gap = Math.min(W * 0.14, 72 * SC);
      let gX, bX, gY, bY, gP, bP, gA = 0, gAl = 1, bAl = 1;
      const pelvisY = a => GY - 115 * Math.cos(a) * SC;

      if (t < 1.6) {
        const p = eio(t / 1.6);
        gX = lp(W*.07, MX - gap, p); bX = lp(W*.93, MX + gap, p);
        gY = pelvisY(0); bY = pelvisY(0);
        gP = runPose(t * 1.8); bP = runPose(t * 1.8 + 0.5);
      } else if (t < 2.6) {
        const p = eio((t - 1.6) / 1);
        gX = MX - gap; bX = MX + gap;
        gY = pelvisY(0); bY = pelvisY(0);
        gP = lpPose(runPose(1.6*1.8), STAND, p);
        bP = lpPose(runPose(1.6*1.8 + 0.5), STAND, p);
      } else if (t < 4.2) {
        const p = eio((t - 2.6) / 1.6);
        gX = MX - gap; bX = MX + gap;
        gY = pelvisY(0); bY = pelvisY(0);
        gP = lpPose(STAND, WAVE, p);
        bP = lpPose(STAND, LEAN, p * 0.8);
      } else if (t < 5.8) {
        gX = MX - gap; bX = MX + gap;
        gY = pelvisY(0); bY = pelvisY(0);
        gP = WAVE; bP = LEAN;
        if (!hSpawned) { spawnHearts(MX, pelvisY(0) - 75*SC); hSpawned = true; }
      } else if (t < 7.4) {
        const p = eio((t - 5.8) / 1.6);
        gX = MX - gap; bX = MX + gap;
        gY = pelvisY(p * 0.52); bY = pelvisY(0);
        gP = lpPose(WAVE, SWOON, p);
        bP = lpPose(LEAN, STAND, p);
        gA = p * 0.52;
      } else if (t < 8.6) {
        const p = eio((t - 7.4) / 1.2);
        gX = MX - gap; bX = MX + gap;
        gY = pelvisY(0.52); bY = pelvisY(0);
        gP = SWOON; bP = STAND; gA = 0.52;
        gAl = lp(1, 0, p); bAl = lp(1, 0, p);
      } else {
        gAl = 0; bAl = 0;
      }

      // hearts
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.x += h.vx; h.y += h.vy; h.vy += 0.045; h.life -= h.decay;
        if (h.life <= 0) { hearts.splice(i, 1); continue; }
        drawHeart(h.x, h.y, h.sz, h.life * 0.85);
      }

      const gJ = wJ(gP, gX, gY, gA, false, SC);
      const bJ = wJ(bP || STAND, bX, bY || pelvisY(0), 0, true, SC);

      drawFig(bJ, C.cyan, bAl, 'boy', false);
      drawFig(gJ, C.pink, gAl, 'girl', true);
      if (gAl > 0.1) drawLabel('YOU',   gX, gJ[0][1], C.pink, gAl * 0.65);
      if (bAl > 0.1) drawLabel('CRUSH', bX, bJ[0][1], C.cyan, bAl * 0.65);

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  // ── file handling ────────────────────────────────────────────────────────
  const onFiles = e => setFiles(Array.from(e.target.files || []).slice(0, 10));
  const onDrop  = e => {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/') || f.type === 'text/plain' || f.name.endsWith('.txt')).slice(0, 10));
  };

  // ── analysis ─────────────────────────────────────────────────────────────
  const runAnalysis = async () => {
    if (!files.length) return;
    setScreen('analyzing'); setProgress(0);

    const steps = [
      'EXTRACTING METADATA...',
      'DECODING TIMESTAMPS...',
      'ANALYZING RESPONSE VELOCITY...',
      'COMPUTING EMOTIONAL SIGNATURES...',
      'CROSS-REFERENCING PATTERNS...',
      'FINALIZING PROFILE...',
    ];
    let si = 0;
    setStatusMsg(steps[0]);
    const ticker = setInterval(() => {
      si++;
      setStatusMsg(steps[Math.min(si, steps.length - 1)]);
      setProgress(p => Math.min(88, p + 12 + Math.random() * 6));
    }, 950);

    try {
      const imageFiles = files.filter(f => f.type.startsWith('image/'));
      const textFiles  = files.filter(f => f.type === 'text/plain' || f.name.endsWith('.txt'));

      // Parse WhatsApp txt exports
      const parseWhatsApp = (raw, yourN, crushN) => {
        // WhatsApp format: MM/DD/YY, HH:MM - Name: message  OR  [DD/MM/YYYY, HH:MM:SS] Name: message
        const lines = raw.split('\n').filter(l => l.trim());
        const messages = [];
        const msgRegex = /^[\[‎]?(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AP]M)?)\]?\s*[-‎]?\s*([^:]+):\s(.+)$/;
        for (const line of lines) {
          const m = line.match(msgRegex);
          if (m) messages.push({ date: m[1], time: m[2], sender: m[3].trim(), text: m[4].trim() });
        }
        if (!messages.length) return raw.slice(0, 8000); // fallback: send raw
        // Trim to last 120 messages for token efficiency
        const recent = messages.slice(-120);
        return recent.map(m => `[${m.date} ${m.time}] ${m.sender}: ${m.text}`).join('\n');
      };

      let txtContent = '';
      if (textFiles.length) {
        const txts = await Promise.all(textFiles.map(f => f.text()));
        txtContent = txts.map(raw => parseWhatsApp(raw, yourName, crushName)).join('\n\n---\n\n');
      }

      const imgs = await Promise.all(imageFiles.map(f => new Promise(res => {
        const r = new FileReader();
        r.onload = e => res({
          type: 'image',
          source: { type: 'base64', media_type: f.type || 'image/jpeg', data: e.target.result.split(',')[1] },
        });
        r.readAsDataURL(f);
      })));

      const nameHint = (yourName || crushName)
        ? `The person uploading is called "${yourName || 'the user'}" and their crush is "${crushName || 'the crush'}". `
        : '';

      const contentBlocks = [
        ...imgs,
        ...(txtContent ? [{
          type: 'text',
          text: `WhatsApp chat export:\n\n${txtContent}`,
        }] : []),
        {
          type: 'text',
          text: `${nameHint}Analyze these text message conversations like an FBI forensic analyst. Determine who is more "into" the other person. Examine: visible timestamps for response time gaps, message length and effort, who initiates, emotional warmth, use of questions/interest signals.\n\nYou MUST respond with ONLY a raw JSON object. No markdown. No backticks. No explanation. No preamble. Start your response with { and end with }. Use exactly these fields:\n{"youScore":72,"crushScore":45,"verdict":"YOU ARE MORE INTO THEM","keyFindings":["Finding 1 with specific detail","Finding 2 with specific detail","Finding 3 with specific detail"],"dominantSignal":"Key behavioral pattern observed in one short sentence","advice":"One-sentence brutally honest advice","chatReplay":[{"sender":"you","text":"hey you free tonight?"},{"sender":"crush","text":"maybe why?"},{"sender":"you","text":"wanted to hang"},{"sender":"crush","text":"sure I guess"},{"sender":"you","text":"awesome! 8pm?"},{"sender":"crush","text":"k"}]}. For chatReplay pick 6-8 real revealing exchanges. sender is \"you\" or \"crush\". Max 38 chars each.`,
        },
      ];

      const resp = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemini-1.5-flash',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: contentBlocks,
          }],
        }),
      });

      const data = await resp.json();
      console.log('[MLC] raw API response:', JSON.stringify(data).slice(0, 600));
      const raw = data.content?.map(b => b.text || '').join('') || '';
      console.log('[MLC] extracted text:', raw.slice(0, 400));

      if (!raw) throw new Error('Empty response from API');

      // Extract JSON object robustly - handles markdown fences and extra text
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('No JSON found: ' + raw.slice(0, 200));
      const parsed = JSON.parse(jsonMatch[0]);
      console.log('[MLC] parsed:', parsed);

      if (typeof parsed.youScore !== 'number') throw new Error('Bad scores: ' + JSON.stringify(parsed));

      clearInterval(ticker);
      setProgress(100);
      setStatusMsg('ANALYSIS COMPLETE');
      setTimeout(() => { setResult(parsed); setScreen('result'); }, 700);

    } catch (err) {
      console.error(err);
      clearInterval(ticker);
      setResult({
        youScore: 60, crushScore: 55,
        verdict: 'ANALYSIS INCONCLUSIVE',
        keyFindings: [
          'Make sure timestamps are visible in screenshots',
          'Try uploading clearer images',
          'Upload more of the conversation for better accuracy',
        ],
        dominantSignal: 'Insufficient data for a confident conclusion',
        advice: 'Upload screenshots with visible timestamps for a better reading.',
      });
      setChatReplay([]);
      setScreen('result');
    }
  };

  const reset = () => {
    setScreen('landing'); setFiles([]); setResult(null);
    setProgress(0); setYourName(''); setCrushName('');
    setChatReplay([]); setReplayIdx(0);
  };

  // ── shared style helpers ──────────────────────────────────────────────────
  const panel = {
    background: C.panel,
    border: `1px solid rgba(255,24,146,0.22)`,
    backdropFilter: 'blur(4px)',
  };
  const lbl = {
    fontFamily: MONO, fontSize: 8, letterSpacing: '0.2em',
    textTransform: 'uppercase', color: 'rgba(0,212,240,0.45)',
    display: 'block', marginBottom: 5,
  };
  const inp = {
    background: 'transparent', border: 'none',
    borderBottom: `1px solid rgba(255,24,146,0.35)`,
    color: C.pinkLight, fontFamily: MONO, fontSize: 13,
    padding: '5px 0', width: '100%', outline: 'none', caretColor: C.pink,
  };
  const actionBtn = active => ({
    background: active ? C.pink : 'transparent',
    border: `2px solid ${active ? C.pink : 'rgba(255,24,146,0.3)'}`,
    color: active ? '#fff' : 'rgba(255,24,146,0.35)',
    fontFamily: MONO, fontSize: 11, letterSpacing: '0.18em',
    textTransform: 'uppercase', padding: '11px 30px',
    cursor: active ? 'pointer' : 'not-allowed', transition: 'all 0.2s',
  });

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div style={{ position:'relative', width:'100%', height:'100vh', background:C.bg, overflow:'hidden', fontFamily:MONO }}>
      {/* Background canvas — always rendered */}
      <canvas ref={cvRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

      {/* Corner brackets */}
      {[
        { top:10, left:10,  borderTop:`1px solid rgba(255,24,146,0.55)`, borderLeft:`1px solid rgba(255,24,146,0.55)` },
        { top:10, right:10, borderTop:`1px solid rgba(255,24,146,0.55)`, borderRight:`1px solid rgba(255,24,146,0.55)` },
        { bottom:10, left:10,  borderBottom:`1px solid rgba(255,24,146,0.55)`, borderLeft:`1px solid rgba(255,24,146,0.55)` },
        { bottom:10, right:10, borderBottom:`1px solid rgba(255,24,146,0.55)`, borderRight:`1px solid rgba(255,24,146,0.55)` },
      ].map((s, i) => (
        <div key={i} style={{ position:'absolute', width:22, height:22, zIndex:50, pointerEvents:'none', ...s }} />
      ))}

      {/* Top bar */}
      <div style={{ position:'absolute', top:10, left:0, right:0, display:'flex', justifyContent:'center', zIndex:40, pointerEvents:'none' }}>
        <div style={{ ...panel, padding:'7px 18px', textAlign:'center' }}>
          <div style={{ fontFamily:ORBITRON, fontSize:10, letterSpacing:'0.22em', color:C.cyan, fontWeight:700 }}>
            MOTION · LANGUAGE · COLLECTIVE
          </div>
          <div style={{ fontSize:8, letterSpacing:'0.15em', color:C.pink, marginTop:3 }}>
            ◉ BEHAVIORAL PATTERN RECOGNITION ACTIVE
          </div>
        </div>
      </div>

      {/* ── LANDING ── */}
      {screen === 'landing' && (
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', zIndex:20 }}>
          <div style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ fontSize:8, color:'rgba(0,212,240,0.45)', letterSpacing:'0.28em', marginBottom:10, textTransform:'uppercase' }}>Motion Language Collective</div>
            <h1 style={{ fontFamily:ORBITRON, fontSize:'clamp(18px,4vw,30px)', color:C.pinkLight, letterSpacing:'0.14em', textTransform:'uppercase', lineHeight:1.35, textShadow:`0 0 22px ${C.pink}55`, marginBottom:10 }}>
              WHO'S MORE<br />INTO WHO?
            </h1>
            <p style={{ color:'rgba(255,199,227,0.45)', fontSize:10, letterSpacing:'0.18em' }}>
              FORENSIC TEXT MESSAGE ANALYSIS
            </p>
          </div>
          <button
            onClick={() => setScreen('upload')}
            style={{ background:'transparent', border:`2px solid ${C.pink}`, color:C.pinkLight, fontFamily:ORBITRON, fontSize:14, letterSpacing:'0.2em', textTransform:'uppercase', padding:'14px 44px', cursor:'pointer', boxShadow:`0 0 22px ${C.pink}33`, transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background = `${C.pink}22`; e.currentTarget.style.boxShadow = `0 0 40px ${C.pink}77`; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = `0 0 22px ${C.pink}33`; }}
          >
            UPLOAD TEXTS
          </button>
          <p style={{ color:'rgba(255,199,227,0.25)', fontSize:8, letterSpacing:'0.14em', marginTop:12 }}>
            SCREENSHOTS OR WHATSAPP EXPORT · BEGIN ANALYSIS
          </p>
        </div>
      )}

      {/* ── UPLOAD ── */}
      {screen === 'upload' && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:30, padding:20 }}>
          <div style={{ ...panel, padding:'22px 26px', width:'100%', maxWidth:460, position:'relative', maxHeight:'90vh', overflowY:'auto' }}>
            <button onClick={() => setScreen('landing')} style={{ position:'absolute', top:12, right:14, background:'none', border:'none', color:'rgba(255,199,227,0.35)', cursor:'pointer', fontSize:17, lineHeight:1 }}>✕</button>
            <div style={{ fontFamily:ORBITRON, fontSize:10, color:C.cyan, letterSpacing:'0.2em', marginBottom:16, borderBottom:`1px solid rgba(0,212,240,0.1)`, paddingBottom:10 }}>
              EVIDENCE UPLOAD — MLC CLASSIFIED
            </div>

            {/* Steps + phone mock */}
            <div style={{ display:'grid', gridTemplateColumns:'90px 1fr', gap:16, marginBottom:18, alignItems:'start' }}>
              <div style={{ background:'rgba(255,24,146,0.06)', border:`1px solid rgba(255,24,146,0.2)`, borderRadius:10, padding:'8px 6px', display:'flex', flexDirection:'column', gap:3 }}>
                {['rgba(0,212,240,0.5)','rgba(0,212,240,0.5)','rgba(255,24,146,0.6)','rgba(0,212,240,0.5)'].map((c, i) => (
                  <div key={i} style={{ height: i===2 ? 12 : 8, background:c, borderRadius:3, width: i%2===0 ? '80%' : '65%', marginLeft: i%2===0 ? 0 : 'auto', opacity:0.7 }} />
                ))}
                <div style={{ height:8, background:'rgba(255,199,227,0.15)', borderRadius:3, marginTop:2 }} />
                <div style={{ height:8, background:'rgba(0,212,240,0.3)', borderRadius:3, width:'70%' }} />
                <div style={{ height:8, background:'rgba(255,24,146,0.4)', borderRadius:3, width:'55%', marginLeft:'auto' }} />
                <div style={{ height:6, background:'rgba(255,199,227,0.1)', borderRadius:3, marginTop:3 }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[
                  ['STEP 1', 'Open WhatsApp → Chat → Export Chat (no media) for a .txt file'],
                  ['STEP 2', 'Or screenshot your texts (hold message to show timestamps)'],
                  ['STEP 3', 'Screenshot top to bottom (6 rec, max 10 images)'],
                  ['STEP 4', 'Upload .txt export or image screenshots below'],
                ].map(([s, d]) => (
                  <div key={s}>
                    <div style={{ fontFamily:ORBITRON, fontSize:12, color:C.pink, marginBottom:1 }}>{s}</div>
                    <div style={{ fontSize:9, color:'rgba(255,199,227,0.6)', lineHeight:1.5, letterSpacing:'0.02em' }}>{d}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Names */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>
              <div>
                <label style={lbl}>your name</label>
                <input style={inp} value={yourName} onChange={e => setYourName(e.target.value)} placeholder="you..." />
              </div>
              <div>
                <label style={lbl}>crush's name</label>
                <input style={inp} value={crushName} onChange={e => setCrushName(e.target.value)} placeholder="them..." />
              </div>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={onDrop}
              onDragOver={e => e.preventDefault()}
              style={{ border:`1px dashed rgba(255,24,146,0.35)`, padding:'16px 14px', textAlign:'center', cursor:'pointer', marginBottom:14, background: files.length ? 'rgba(255,24,146,0.05)' : 'transparent', transition:'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,24,146,0.07)'}
              onMouseLeave={e => e.currentTarget.style.background = files.length ? 'rgba(255,24,146,0.05)' : 'transparent'}
            >
              <input ref={fileRef} type="file" multiple accept="image/*,.txt,text/plain" onChange={onFiles} style={{ display:'none' }} />
              {files.length === 0 ? (
                <>
                  <div style={{ fontSize:22, color:'rgba(255,24,146,0.35)', marginBottom:5 }}>⊕</div>
                  <div style={{ fontSize:9, color:'rgba(255,199,227,0.45)', letterSpacing:'0.12em' }}>TAP TO UPLOAD SCREENSHOTS OR WHATSAPP .TXT</div>
                  <div style={{ fontSize:8, color:'rgba(255,199,227,0.22)', marginTop:3, letterSpacing:'0.08em' }}>MAX 10 FILES · IMAGES OR WHATSAPP EXPORT</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize:11, color:C.green, letterSpacing:'0.12em', marginBottom:6 }}>✓ {files.length} FILE{files.length > 1 ? 'S' : ''} LOADED</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:3, justifyContent:'center', marginBottom:5 }}>
                    {files.slice(0, 6).map((f, i) => (
                      <span key={i} style={{ fontSize:8, color:'rgba(255,199,227,0.45)', background:'rgba(255,24,146,0.08)', border:`1px solid rgba(255,24,146,0.18)`, padding:'2px 6px' }}>
                        {f.name.slice(0, 12)}{f.name.length > 12 ? '…' : ''}
                      </span>
                    ))}
                    {files.length > 6 && <span style={{ fontSize:8, color:'rgba(255,199,227,0.35)', padding:'2px 4px' }}>+{files.length - 6}</span>}
                  </div>
                  <div style={{ fontSize:8, color:'rgba(255,199,227,0.25)', letterSpacing:'0.08em' }}>click to change</div>
                </>
              )}
            </div>

            <div style={{ display:'flex', justifyContent:'center', marginBottom:10 }}>
              <button
                onClick={runAnalysis}
                disabled={!files.length}
                style={actionBtn(files.length > 0)}
                onMouseEnter={e => { if (files.length) e.currentTarget.style.boxShadow = `0 0 28px ${C.pink}55`; }}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
              >
                INITIATE ANALYSIS →
              </button>
            </div>
            <p style={{ textAlign:'center', fontSize:8, color:'rgba(255,199,227,0.2)', letterSpacing:'0.1em' }}>
              MOTION LANGUAGE COLLECTIVE · CONVERSATIONS NEVER STORED ♡
            </p>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {screen === 'analyzing' && (
        <div style={{ position:'absolute', bottom:60, left:'50%', transform:'translateX(-50%)', zIndex:30, width:'min(380px,88vw)' }}>
          <div style={{ ...panel, padding:'16px 20px' }}>
            <div style={{ fontSize:9, color:C.pink, letterSpacing:'0.16em', marginBottom:10 }}>{statusMsg}</div>
            <div style={{ height:3, background:'rgba(255,24,146,0.1)', border:`1px solid rgba(255,24,146,0.18)`, overflow:'hidden', marginBottom:8 }}>
              <div style={{ height:'100%', width:`${progress}%`, background:C.pink, transition:'width 0.85s ease', boxShadow:`0 0 8px ${C.pink}77` }} />
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, color:'rgba(255,199,227,0.3)', letterSpacing:'0.1em' }}>
              <span>READING BEHAVIORAL PATTERNS</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>
        </div>
      )}


      {/* ── CINEMATIC CHAT REPLAY ── */}
      {screen === 'cinematic' && result && (
        <CinematicReplay
          messages={chatReplay}
          yourName={yourName}
          crushName={crushName}
          onDone={() => setScreen('result')}
        />
      )}

      {/* ── RESULT ── */}
      {screen === 'result' && result && (
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:30, padding:20 }}>
          <div style={{ ...panel, padding:'22px 26px', width:'100%', maxWidth:460, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ fontFamily:ORBITRON, fontSize:9, color:C.cyan, letterSpacing:'0.2em', marginBottom:4 }}>
              MLC · ANALYSIS COMPLETE · CLASSIFIED
            </div>

            <div style={{ fontFamily:ORBITRON, fontSize:'clamp(13px,2.8vw,18px)', color:C.pinkLight, letterSpacing:'0.12em', textTransform:'uppercase', textAlign:'center', padding:'14px 0', borderTop:`1px solid rgba(255,24,146,0.12)`, borderBottom:`1px solid rgba(255,24,146,0.12)`, marginBottom:18, textShadow:`0 0 16px ${C.pink}55`, lineHeight:1.4 }}>
              {result.verdict}
            </div>

            {/* Score bars */}
            <div style={{ marginBottom:18 }}>
              {[
                { label: yourName || 'YOU',   score: result.youScore,   col: C.pink, delay: 0   },
                { label: crushName || 'CRUSH', score: result.crushScore, col: C.cyan, delay: 350 },
              ].map(({ label, score, col, delay }) => (
                <div key={label} style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:8, letterSpacing:'0.12em', color:'rgba(255,199,227,0.55)', marginBottom:4 }}>
                    <span>{label.toUpperCase()}</span>
                    <span style={{ color:col }}>{score}%</span>
                  </div>
                  <div style={{ height:7, background:'rgba(255,199,227,0.07)', border:`1px solid rgba(255,199,227,0.08)`, overflow:'hidden' }}>
                    <div
                      ref={el => { if (el) setTimeout(() => { el.style.width = score + '%'; }, delay); }}
                      style={{ height:'100%', width:'0%', background:col, transition:'width 1.3s cubic-bezier(0.4,0,0.2,1)', boxShadow:`0 0 7px ${col}77` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Key findings */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:7.5, color:'rgba(0,212,240,0.45)', letterSpacing:'0.18em', marginBottom:7 }}>◈ KEY FINDINGS</div>
              {(result.keyFindings || []).map((f, i) => (
                <div key={i} style={{ display:'flex', gap:7, alignItems:'baseline', marginBottom:5 }}>
                  <span style={{ color:'rgba(255,24,146,0.5)', fontSize:9, flexShrink:0 }}>▸</span>
                  <span style={{ fontSize:10, color:'rgba(255,199,227,0.68)', lineHeight:1.55, letterSpacing:'0.03em' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* Dominant signal */}
            {result.dominantSignal && (
              <div style={{ background:'rgba(0,212,240,0.04)', border:`1px solid rgba(0,212,240,0.12)`, padding:'9px 13px', marginBottom:14 }}>
                <div style={{ fontSize:7.5, color:'rgba(0,212,240,0.4)', letterSpacing:'0.15em', marginBottom:3 }}>DOMINANT SIGNAL</div>
                <div style={{ fontSize:10, color:C.cyan, letterSpacing:'0.05em', lineHeight:1.5 }}>{result.dominantSignal}</div>
              </div>
            )}

            {/* Advice */}
            {result.advice && (
              <div style={{ borderLeft:`2px solid rgba(255,24,146,0.45)`, paddingLeft:11, marginBottom:18 }}>
                <div style={{ fontSize:7.5, color:'rgba(255,24,146,0.45)', letterSpacing:'0.15em', marginBottom:3 }}>VERDICT</div>
                <div style={{ fontSize:10, color:'rgba(255,199,227,0.75)', lineHeight:1.6, fontStyle:'italic' }}>{result.advice}</div>
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
              <button
                onClick={reset}
                style={{ background:'transparent', border:`1px solid rgba(255,24,146,0.3)`, color:'rgba(255,199,227,0.5)', fontFamily:MONO, fontSize:9, letterSpacing:'0.15em', padding:'9px 20px', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,24,146,0.65)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,24,146,0.3)'}
              >
                ← START OVER
              </button>
              <button
                onClick={() => setScreen('upload')}
                style={{ background:'transparent', border:`1px solid rgba(0,212,240,0.3)`, color:'rgba(0,212,240,0.5)', fontFamily:MONO, fontSize:9, letterSpacing:'0.15em', padding:'9px 20px', cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,212,240,0.65)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,212,240,0.3)'}
              >
                RE-ANALYZE
              </button>
            </div>

            <p style={{ textAlign:'center', marginTop:10, fontSize:7.5, color:'rgba(255,199,227,0.18)', letterSpacing:'0.1em' }}>
              MOTION LANGUAGE COLLECTIVE · CONVERSATIONS NOT STORED ♡
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
