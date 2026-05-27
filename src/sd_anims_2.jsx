// System Design — Animations Part 2: Case Studies + AI/ML
import React, { useState, useEffect } from "react";
import { AnimControls } from "./sd_anims_1.jsx";

// URL Shortener architecture
export function UrlShortenerAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { active: "client", note: "Client sends POST /shorten with long URL + idempotency key." },
    { active: "lb", note: "L7 load balancer routes to app server. Rate limiting applied here." },
    { active: "app", note: "App server generates short code (counter-based, base62). Checks cache for collision." },
    { active: "db", note: "Write short_code → long_url to DB (DynamoDB or sharded MySQL). Immutable once written." },
    { active: "cache", note: "Populate Redis cache with the mapping. 100:1 read:write means cache is critical." },
    { active: "cdn", note: "On redirect: CDN edge serves 301 for hot URLs. Cache miss → Redis → DB. p99 < 10ms." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 1800); return () => clearInterval(id); }, [playing, stages.length]);
  const boxes = [
    { id: "client", label: "Client", x: 20, y: 60 },
    { id: "cdn", label: "CDN Edge", x: 130, y: 60 },
    { id: "lb", label: "L7 LB", x: 240, y: 60 },
    { id: "app", label: "App Server", x: 350, y: 60 },
    { id: "cache", label: "Redis Cache", x: 290, y: 160 },
    { id: "db", label: "DB (DynamoDB)", x: 410, y: 160 },
  ];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 520 220" className="anim-svg">
        {[["client","cdn"],["cdn","lb"],["lb","app"],["app","cache"],["app","db"],["cdn","cache"]].map(([a,b],i) => {
          const ba = boxes.find(x=>x.id===a), bb = boxes.find(x=>x.id===b);
          return <line key={i} x1={ba.x+45} y1={ba.y+15} x2={bb.x} y2={bb.y+15} stroke="var(--sd-line)" strokeWidth="1" opacity="0.5" />;
        })}
        {boxes.map(b => {
          const active = b.id === stages[step].active;
          return (
            <g key={b.id} style={{transition:"all 0.3s"}}>
              <rect x={b.x} y={b.y} width="90" height="30" rx="4" fill={active?"var(--sd-accent)":"var(--sd-bg-3)"} stroke={active?"var(--sd-accent)":"var(--sd-line)"} strokeWidth="1.5" />
              <text x={b.x+45} y={b.y+19} textAnchor="middle" fontSize="10" fontWeight="700" fill={active?"var(--sd-bg)":"var(--sd-text)"} fontFamily="var(--sd-mono)">{b.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="anim-note">{stages[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

// Feed generation: Push vs Pull vs Hybrid
export function FeedGenerationAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { mode: "push", note: "PUSH (fan-out on write): User posts → copy to all followers' feeds. Reads are O(1). Problem: celebrity with 100M followers = 100M writes per post." },
    { mode: "pull", note: "PULL (fan-out on read): User loads feed → query all followees, merge. Writes are O(1). Problem: feed load = 200 queries + merge = slow." },
    { mode: "hybrid", note: "HYBRID: Push for normal users, pull for celebrities at read time. Twitter, Instagram, Facebook all use this. Threshold tuned per system." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 3000); return () => clearInterval(id); }, [playing, frames.length]);
  const f = frames[step];
  const colors = { push: "var(--sd-accent)", pull: "var(--sd-accent-2)", hybrid: "var(--sd-warn)" };
  return (
    <div className="anim-box">
      <div style={{display:"flex",gap:"8px",marginBottom:"12px"}}>
        {frames.map((fr,i) => (
          <div key={i} style={{flex:1,padding:"12px",background:i===step?colors[fr.mode]:"var(--sd-bg)",border:`2px solid ${i===step?colors[fr.mode]:"var(--sd-line)"}`,borderRadius:"4px",textAlign:"center",transition:"all 0.3s",color:i===step?"var(--sd-bg)":"var(--sd-text)",fontFamily:"var(--sd-mono)",fontSize:"12px",fontWeight:"700",textTransform:"uppercase"}}>{fr.mode}</div>
        ))}
      </div>
      <svg viewBox="0 0 500 140" className="anim-svg">
        {f.mode === "push" && <>
          <rect x="20" y="20" width="80" height="30" rx="3" fill="var(--sd-accent)" /><text x="60" y="39" textAnchor="middle" fontSize="10" fill="var(--sd-bg)" fontFamily="var(--sd-mono)" fontWeight="700">User Posts</text>
          {[0,1,2,3].map(i => <><line key={`l${i}`} x1="100" y1="35" x2="200" y2={20+i*30+15} stroke="var(--sd-accent)" strokeWidth="1.5" /><rect key={`r${i}`} x="200" y={20+i*30} width="90" height="24" rx="3" fill="var(--sd-highlight)" stroke="var(--sd-accent)" strokeWidth="1" /><text key={`t${i}`} x="245" y={20+i*30+16} textAnchor="middle" fontSize="9" fill="var(--sd-accent)" fontFamily="var(--sd-mono)">Follower {i+1} feed</text></>)}
          <text x="400" y="70" fontSize="10" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Write: O(followers)</text>
          <text x="400" y="90" fontSize="10" fill="var(--sd-accent-2)" fontFamily="var(--sd-mono)">Read: O(1)</text>
        </>}
        {f.mode === "pull" && <>
          <rect x="20" y="50" width="80" height="30" rx="3" fill="var(--sd-accent-2)" /><text x="60" y="69" textAnchor="middle" fontSize="10" fill="var(--sd-bg)" fontFamily="var(--sd-mono)" fontWeight="700">User Reads</text>
          {[0,1,2,3].map(i => <><line key={`l${i}`} x1="100" y1="65" x2="200" y2={20+i*30+15} stroke="var(--sd-accent-2)" strokeWidth="1.5" strokeDasharray="4,2" /><rect key={`r${i}`} x="200" y={20+i*30} width="90" height="24" rx="3" fill="var(--sd-bg-3)" stroke="var(--sd-line)" strokeWidth="1" /><text key={`t${i}`} x="245" y={20+i*30+16} textAnchor="middle" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Followee {i+1}</text></>)}
          <rect x="340" y="50" width="60" height="30" rx="3" fill="var(--sd-accent-2)" /><text x="370" y="69" textAnchor="middle" fontSize="10" fill="var(--sd-bg)" fontFamily="var(--sd-mono)" fontWeight="700">Merge</text>
          <text x="430" y="50" fontSize="10" fill="var(--sd-accent-2)" fontFamily="var(--sd-mono)">Write: O(1)</text>
          <text x="430" y="70" fontSize="10" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Read: O(followees)</text>
        </>}
        {f.mode === "hybrid" && <>
          <text x="60" y="30" textAnchor="middle" fontSize="10" fill="var(--sd-warn)" fontFamily="var(--sd-mono)" fontWeight="700">Normal users</text>
          <text x="60" y="45" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">→ PUSH to feeds</text>
          <rect x="20" y="55" width="80" height="24" rx="3" fill="var(--sd-accent)" /><text x="60" y="71" textAnchor="middle" fontSize="9" fill="var(--sd-bg)" fontFamily="var(--sd-mono)">Fan-out write</text>
          <text x="300" y="30" textAnchor="middle" fontSize="10" fill="var(--sd-warn)" fontFamily="var(--sd-mono)" fontWeight="700">Celebrities</text>
          <text x="300" y="45" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">→ PULL at read time</text>
          <rect x="260" y="55" width="80" height="24" rx="3" fill="var(--sd-accent-2)" /><text x="300" y="71" textAnchor="middle" fontSize="9" fill="var(--sd-bg)" fontFamily="var(--sd-mono)">Fan-out read</text>
          <rect x="170" y="95" width="160" height="30" rx="3" fill="var(--sd-warn)" /><text x="250" y="114" textAnchor="middle" fontSize="10" fill="var(--sd-bg)" fontFamily="var(--sd-mono)" fontWeight="700">Merge at read time</text>
          <line x1="60" y1="79" x2="200" y2="95" stroke="var(--sd-warn)" strokeWidth="1.5" />
          <line x1="300" y1="79" x2="300" y2="95" stroke="var(--sd-warn)" strokeWidth="1.5" />
        </>}
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Chat message delivery
export function ChatAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { phase: "send", note: "Alice sends message via WebSocket to her connection server." },
    { phase: "route", note: "Message router looks up Bob's connection server in the presence service." },
    { phase: "deliver", note: "Message pushed to Bob's connection server → Bob's WebSocket. Stored in message DB." },
    { phase: "ack-deliver", note: "Bob's device ACKs delivery → 'delivered' status pushed back to Alice (✓✓)." },
    { phase: "ack-read", note: "Bob opens chat → 'read' receipt sent back to Alice (blue ✓✓)." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2000); return () => clearInterval(id); }, [playing, frames.length]);
  const nodes = [{id:"alice",label:"Alice",x:30,y:70},{id:"conn-a",label:"Conn Server A",x:140,y:70},{id:"router",label:"Msg Router",x:270,y:70},{id:"conn-b",label:"Conn Server B",x:400,y:70},{id:"bob",label:"Bob",x:480,y:70},{id:"db",label:"Message DB",x:270,y:150}];
  const phaseHighlight = {send:["alice","conn-a"],route:["conn-a","router"],"deliver":["router","conn-b","bob","db"],"ack-deliver":["bob","conn-b","router","conn-a","alice"],"ack-read":["bob","alice"]};
  const hot = phaseHighlight[frames[step].phase] || [];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 530 190" className="anim-svg">
        {[["alice","conn-a"],["conn-a","router"],["router","conn-b"],["conn-b","bob"],["router","db"]].map(([a,b],i) => {
          const na=nodes.find(n=>n.id===a),nb=nodes.find(n=>n.id===b);
          return <line key={i} x1={na.x+25} y1={na.y} x2={nb.x} y2={nb.y} stroke="var(--sd-line)" strokeWidth="1" opacity="0.4" />;
        })}
        {nodes.map(n => {
          const active = hot.includes(n.id);
          const w = n.id==="alice"||n.id==="bob"?50:90;
          return (
            <g key={n.id} style={{transition:"all 0.3s"}}>
              <rect x={n.x} y={n.y-15} width={w} height="30" rx="4" fill={active?"var(--sd-accent)":"var(--sd-bg-3)"} stroke={active?"var(--sd-accent)":"var(--sd-line)"} strokeWidth="1.5" />
              <text x={n.x+w/2} y={n.y+4} textAnchor="middle" fontSize="9" fontWeight="700" fill={active?"var(--sd-bg)":"var(--sd-text)"} fontFamily="var(--sd-mono)">{n.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Geo-index (H3 hexagonal)
export function GeoIndexAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { note: "Rider requests ride at location P. System needs to find nearby drivers fast." },
    { note: "H3 maps P to a hex cell. Query: 'drivers in this cell + 6 neighbors' — O(log N) with index." },
    { note: "5 candidate drivers found in nearby cells. Compute ETA for each using traffic data." },
    { note: "Best match dispatched. Driver location updates every 4s keep the geo-index fresh." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200); return () => clearInterval(id); }, [playing, frames.length]);
  // Draw hex grid
  const hexPoints = (cx, cy, r) => {
    const pts = [];
    for (let i = 0; i < 6; i++) { const a = Math.PI/6 + i*Math.PI/3; pts.push(`${cx+r*Math.cos(a)},${cy+r*Math.sin(a)}`); }
    return pts.join(" ");
  };
  const hexes = [{x:250,y:120,center:true},{x:250,y:76},{x:290,y:98},{x:290,y:142},{x:250,y:164},{x:210,y:142},{x:210,y:98}];
  const drivers = [{x:245,y:115,id:"D1"},{x:275,y:105,id:"D2"},{x:220,y:135,id:"D3"},{x:260,y:155,id:"D4"},{x:235,y:90,id:"D5"}];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 220" className="anim-svg">
        {hexes.map((h,i) => (
          <polygon key={i} points={hexPoints(h.x,h.y,24)} fill={h.center && step>=1?"var(--sd-highlight)":"none"} stroke={step>=1?(h.center?"var(--sd-accent)":"var(--sd-accent-2)"):"var(--sd-line)"} strokeWidth={step>=1?"2":"1"} opacity={step>=1?1:0.5} style={{transition:"all 0.4s"}} />
        ))}
        {step >= 0 && <circle cx="250" cy="120" r="5" fill="var(--sd-accent)" />}
        {step >= 0 && <text x="250" y="112" textAnchor="middle" fontSize="9" fill="var(--sd-accent)" fontFamily="var(--sd-mono)" fontWeight="700">Rider</text>}
        {step >= 2 && drivers.map(d => (
          <g key={d.id}><circle cx={d.x} cy={d.y} r="4" fill="var(--sd-accent-2)" /><text x={d.x+8} y={d.y+3} fontSize="8" fill="var(--sd-accent-2)" fontFamily="var(--sd-mono)">{d.id}</text></g>
        ))}
        {step >= 3 && <line x1="250" y1="120" x2="245" y2="115" stroke="var(--sd-accent)" strokeWidth="2" />}
        <text x="400" y="60" fontSize="10" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">H3 hexagonal grid</text>
        <text x="400" y="80" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Uniform neighbor distance</text>
        <text x="400" y="100" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Query: cell + 6 neighbors</text>
      </svg>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Adaptive Bitrate Streaming
export function AbrAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { quality: "1080p", bw: "high", note: "Good bandwidth: client requests 1080p chunks. Buffer filling fast." },
    { quality: "1080p", bw: "high", note: "Each chunk is 2-10 seconds of video, independently decodable." },
    { quality: "720p", bw: "medium", note: "Bandwidth drops — client detects via throughput measurement. Switches to 720p next chunk." },
    { quality: "360p", bw: "low", note: "Network degrades further. Client drops to 360p. No rebuffer — seamless switch." },
    { quality: "720p", bw: "medium", note: "Bandwidth recovers. Client steps back up to 720p. Buffer refills." },
    { quality: "1080p", bw: "high", note: "Full recovery. Back to 1080p. This is ABR — client-side quality adaptation." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1800); return () => clearInterval(id); }, [playing, frames.length]);
  const f = frames[step];
  const qualities = ["1080p","720p","480p","360p"];
  const barH = {"1080p":120,"720p":90,"480p":60,"360p":40};
  return (
    <div className="anim-box">
      <div className="anim-sub">client-side adaptive bitrate — quality adjusts to bandwidth</div>
      <svg viewBox="0 0 500 180" className="anim-svg">
        <text x="30" y="15" fontSize="10" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Available qualities:</text>
        {qualities.map((q,i) => {
          const active = q === f.quality;
          const h = barH[q]; const y = 160 - h;
          return (
            <g key={q} style={{transition:"all 0.4s"}}>
              <rect x={40+i*60} y={y} width="45" height={h} rx="3" fill={active?"var(--sd-accent)":"var(--sd-bg-3)"} stroke={active?"var(--sd-accent)":"var(--sd-line)"} strokeWidth="1.5" />
              <text x={40+i*60+22} y="175" textAnchor="middle" fontSize="9" fontWeight="600" fill={active?"var(--sd-accent)":"var(--sd-dim)"} fontFamily="var(--sd-mono)">{q}</text>
            </g>
          );
        })}
        <text x="320" y="50" fontSize="11" fontWeight="700" fill="var(--sd-text)" fontFamily="var(--sd-mono)">Current: {f.quality}</text>
        <text x="320" y="70" fontSize="10" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Bandwidth: {f.bw}</text>
        <rect x="320" y="85" width={f.bw==="high"?150:f.bw==="medium"?100:50} height="8" rx="2" fill={f.bw==="high"?"var(--sd-accent-2)":f.bw==="medium"?"var(--sd-warn)":"var(--sd-accent)"} style={{transition:"all 0.4s"}} />
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Double-entry Ledger
export function LedgerAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { entries: [], note: "Double-entry: every transaction = debit + credit of equal amount. Global sum is always zero." },
    { entries: [{dr:"Alice"  ,cr:"Escrow" ,amt:"₹1000",desc:"Debit Alice"}], note: "Step 1: Debit Alice's account ₹1000. Money leaves Alice." },
    { entries: [{dr:"Alice",cr:"Escrow",amt:"₹1000",desc:"Debit Alice"},{dr:"Escrow",cr:"Bob",amt:"₹1000",desc:"Credit Bob"}], note: "Step 2: Credit Bob's account ₹1000. Both entries created atomically. Ledger balanced." },
    { entries: [{dr:"Alice",cr:"Escrow",amt:"₹1000",desc:"Debit Alice"},{dr:"Escrow",cr:"Bob",amt:"₹1000",desc:"Credit Bob"},{dr:"Bob",cr:"Escrow",amt:"₹200",desc:"Refund partial"}], note: "Refund? Another pair of entries. Never delete — append only. Full audit trail." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2500); return () => clearInterval(id); }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">double-entry bookkeeping — every debit has an equal credit</div>
      <div style={{fontFamily:"var(--sd-mono)",fontSize:"11px",background:"var(--sd-bg)",border:"1px solid var(--sd-line)",padding:"12px",marginBottom:"8px"}}>
        <div style={{display:"grid",gridTemplateColumns:"40px 80px 80px 80px 1fr",gap:"4px",fontWeight:"700",borderBottom:"1px solid var(--sd-line)",paddingBottom:"6px",marginBottom:"6px",color:"var(--sd-dim)"}}>
          <span>#</span><span>Debit</span><span>Credit</span><span>Amount</span><span>Description</span>
        </div>
        {f.entries.length === 0 && <div style={{color:"var(--sd-dimmer)",fontStyle:"italic",padding:"8px 0"}}>No entries yet...</div>}
        {f.entries.map((e,i) => (
          <div key={i} style={{display:"grid",gridTemplateColumns:"40px 80px 80px 80px 1fr",gap:"4px",padding:"4px 0",borderBottom:"1px dashed var(--sd-line)",color:i===f.entries.length-1?"var(--sd-accent)":"var(--sd-text)",transition:"all 0.3s"}}>
            <span>{i+1}</span><span>{e.dr}</span><span>{e.cr}</span><span>{e.amt}</span><span>{e.desc}</span>
          </div>
        ))}
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Saga pattern
export function SagaAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { active: 0, status: "running", note: "Step 1: Debit sender's account. Local transaction in sender's bank." },
    { active: 1, status: "running", note: "Step 2: Credit receiver's account. Local transaction in receiver's bank." },
    { active: 2, status: "running", note: "Step 3: Emit confirmation to both parties. Update status." },
    { active: 2, status: "done", note: "All steps succeeded. Saga complete. Money transferred." },
    { active: 1, status: "fail", note: "What if step 2 fails? Compensate: reverse step 1 (credit sender back)." },
  ];
  const steps = ["Debit Sender","Credit Receiver","Confirm"];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200); return () => clearInterval(id); }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">saga pattern — distributed transaction with compensating actions</div>
      <div style={{display:"flex",gap:"8px",marginBottom:"12px",alignItems:"center"}}>
        {steps.map((s,i) => {
          const isDone = f.status==="done" || i < f.active;
          const isActive = i === f.active && f.status==="running";
          const isFail = f.status==="fail" && i === f.active;
          return (
            <React.Fragment key={i}>
              <div style={{flex:1,padding:"14px 8px",background:isFail?"rgba(239,68,68,0.1)":isActive?"var(--sd-highlight)":isDone?"rgba(16,185,129,0.1)":"var(--sd-bg-3)",border:`2px solid ${isFail?"#ef4444":isActive?"var(--sd-accent)":isDone?"var(--sd-accent-2)":"var(--sd-line)"}`,borderRadius:"8px",textAlign:"center",transition:"all 0.3s",fontFamily:"var(--sd-mono)",fontSize:"11px",fontWeight:"600"}}>
                <div>{s}</div>
                <div style={{fontSize:"9px",marginTop:"4px",color:isFail?"#ef4444":isDone?"var(--sd-accent-2)":"var(--sd-dim)"}}>{isFail?"✗ FAILED":isDone?"✓ done":isActive?"running...":"pending"}</div>
              </div>
              {i < steps.length-1 && <span style={{fontFamily:"var(--sd-mono)",color:"var(--sd-dim)"}}>→</span>}
            </React.Fragment>
          );
        })}
      </div>
      {f.status === "fail" && <div style={{padding:"8px 12px",background:"rgba(239,68,68,0.1)",border:"1px solid #ef4444",borderRadius:"8px",fontFamily:"var(--sd-mono)",fontSize:"11px",color:"#ef4444",marginBottom:"8px"}}>⟲ COMPENSATE: Reverse step 1 — credit sender back</div>}
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Fraud scoring architecture
export function FraudAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { active: "txn", note: "Payment transaction arrives. Must be scored in < 50ms." },
    { active: "rules", note: "Hard rules first: sanctions check, velocity limits, amount thresholds. Fail-fast." },
    { active: "features", note: "Feature store lookup: 100+ features in parallel — user history, device, geo, behavioral." },
    { active: "model", note: "ML model scores risk (0-1). Gradient-boosted trees or small neural net for speed." },
    { active: "decision", note: "Decision engine: low risk → approve, medium → step-up auth (OTP), high → block." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 2000); return () => clearInterval(id); }, [playing, stages.length]);
  const boxes = [{id:"txn",label:"Transaction",x:20,y:60},{id:"rules",label:"Rules Engine",x:130,y:60},{id:"features",label:"Feature Store",x:250,y:60},{id:"model",label:"ML Model",x:370,y:60},{id:"decision",label:"Decision",x:450,y:140}];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 530 190" className="anim-svg">
        {[["txn","rules"],["rules","features"],["features","model"],["model","decision"]].map(([a,b],i) => {
          const ba=boxes.find(x=>x.id===a),bb=boxes.find(x=>x.id===b);
          return <line key={i} x1={ba.x+50} y1={ba.y+15} x2={bb.x} y2={bb.y+15} stroke="var(--sd-line)" strokeWidth="1" opacity="0.5" />;
        })}
        {boxes.map(b => {
          const active = b.id === stages[step].active;
          return (
            <g key={b.id} style={{transition:"all 0.3s"}}>
              <rect x={b.x} y={b.y} width={b.id==="decision"?70:100} height="30" rx="4" fill={active?"var(--sd-accent)":"var(--sd-bg-3)"} stroke={active?"var(--sd-accent)":"var(--sd-line)"} strokeWidth="1.5" />
              <text x={b.x+(b.id==="decision"?35:50)} y={b.y+19} textAnchor="middle" fontSize="9" fontWeight="700" fill={active?"var(--sd-bg)":"var(--sd-text)"} fontFamily="var(--sd-mono)">{b.label}</text>
            </g>
          );
        })}
        <text x="20" y="170" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">Total budget: &lt; 50ms p99</text>
      </svg>
      <div className="anim-note">{stages[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

// Feature Store architecture
export function FeatureStoreAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { active: "def", note: "Feature definitions live as code. Single source of truth for both training and serving." },
    { active: "batch", note: "Batch pipeline materializes features into offline store (S3/BigQuery) for training." },
    { active: "stream", note: "Streaming pipeline keeps online store (Redis/DynamoDB) fresh for real-time inference." },
    { active: "train", note: "Training reads from offline store. Point-in-time joins prevent future data leakage." },
    { active: "serve", note: "Inference reads from online store. Same feature definitions → no training-serving skew." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200); return () => clearInterval(id); }, [playing, frames.length]);
  const boxes = [{id:"def",label:"Feature Defs",x:200,y:10},{id:"batch",label:"Batch Pipeline",x:80,y:80},{id:"stream",label:"Stream Pipeline",x:320,y:80},{id:"offline",label:"Offline Store",x:40,y:150},{id:"online",label:"Online Store",x:360,y:150},{id:"train",label:"Training",x:40,y:210},{id:"serve",label:"Inference",x:360,y:210}];
  const hot = frames[step].active;
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 260" className="anim-svg">
        {[["def","batch"],["def","stream"],["batch","offline"],["stream","online"],["offline","train"],["online","serve"]].map(([a,b],i) => {
          const ba=boxes.find(x=>x.id===a),bb=boxes.find(x=>x.id===b);
          return <line key={i} x1={ba.x+50} y1={ba.y+15} x2={bb.x+50} y2={bb.y} stroke="var(--sd-line)" strokeWidth="1" opacity="0.4" />;
        })}
        {boxes.map(b => {
          const active = b.id===hot || (hot==="train"&&b.id==="offline") || (hot==="serve"&&b.id==="online");
          return (
            <g key={b.id} style={{transition:"all 0.3s"}}>
              <rect x={b.x} y={b.y} width="100" height="28" rx="4" fill={active?"var(--sd-accent)":"var(--sd-bg-3)"} stroke={active?"var(--sd-accent)":"var(--sd-line)"} strokeWidth="1.5" />
              <text x={b.x+50} y={b.y+18} textAnchor="middle" fontSize="9" fontWeight="700" fill={active?"var(--sd-bg)":"var(--sd-text)"} fontFamily="var(--sd-mono)">{b.label}</text>
            </g>
          );
        })}
      </svg>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Model Serving infrastructure
export function ModelServingAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { active: "request", note: "Inference request arrives with features. Routed to model version by A/B config." },
    { active: "preprocess", note: "Pre-processing: tokenize, normalize, convert to tensors. Must be identical to training." },
    { active: "inference", note: "Forward pass through model. PyTorch/TensorRT/ONNX Runtime. GPU or CPU." },
    { active: "postprocess", note: "Post-processing: logits → business response (class + probability). Apply thresholds." },
    { active: "log", note: "Log request + prediction + latency. Feed into monitoring and A/B evaluation." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 1800); return () => clearInterval(id); }, [playing, stages.length]);
  return (
    <div className="anim-box">
      <div className="anim-sub">model serving pipeline — inside one inference request</div>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px"}}>
        {stages.map((s,i) => {
          const active = i === step;
          const done = i < step;
          return (
            <div key={i} style={{flex:1,padding:"10px 6px",background:active?"var(--sd-highlight)":done?"rgba(16,185,129,0.1)":"var(--sd-bg-3)",border:`1.5px solid ${active?"var(--sd-accent)":done?"var(--sd-accent-2)":"var(--sd-line)"}`,borderRadius:"8px",textAlign:"center",transition:"all 0.3s",fontFamily:"var(--sd-mono)",fontSize:"10px",fontWeight:"600"}}>{s.active}</div>
          );
        })}
      </div>
      <div className="anim-note">{stages[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

// HNSW search
export function HnswAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { layer: 2, note: "Layer 2 (top): sparse graph, few nodes. Start at entry point, greedy walk to nearest." },
    { layer: 1, note: "Layer 1 (mid): more nodes. Drop down, continue greedy walk with finer granularity." },
    { layer: 0, note: "Layer 0 (base): all nodes. Final greedy walk finds approximate nearest neighbors." },
    { layer: -1, note: "Result: top-k nearest vectors found. ~O(log N) hops instead of O(N) linear scan." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200); return () => clearInterval(id); }, [playing, frames.length]);
  const layers = [
    { y: 30, label: "Layer 2", nodes: [{x:150},{x:350}], color: "var(--sd-accent)" },
    { y: 100, label: "Layer 1", nodes: [{x:100},{x:200},{x:300},{x:400}], color: "var(--sd-warn)" },
    { y: 170, label: "Layer 0", nodes: [{x:60},{x:120},{x:180},{x:240},{x:300},{x:360},{x:420}], color: "var(--sd-accent-2)" },
  ];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 220" className="anim-svg">
        {layers.map((l,li) => {
          const active = li === (2 - frames[step].layer) || frames[step].layer === -1;
          return (
            <g key={li} style={{transition:"all 0.4s",opacity:active?1:0.3}}>
              <text x="20" y={l.y+8} fontSize="9" fill={active?l.color:"var(--sd-dim)"} fontFamily="var(--sd-mono)" fontWeight="700">{l.label}</text>
              <line x1="50" y1={l.y+12} x2="470" y2={l.y+12} stroke="var(--sd-line)" strokeWidth="0.5" strokeDasharray="3,3" />
              {l.nodes.map((n,ni) => (
                <circle key={ni} cx={n.x} cy={l.y+12} r="6" fill={active?l.color:"var(--sd-bg-3)"} stroke={active?l.color:"var(--sd-line)"} strokeWidth="1.5" />
              ))}
              {l.nodes.slice(0,-1).map((n,ni) => (
                <line key={`e${ni}`} x1={n.x+6} y1={l.y+12} x2={l.nodes[ni+1].x-6} y2={l.y+12} stroke={active?l.color:"var(--sd-line)"} strokeWidth="1" opacity="0.5" />
              ))}
            </g>
          );
        })}
        {frames[step].layer >= 0 && layers.slice(0,-1).map((l,li) => {
          if (li >= 2 - frames[step].layer) return null;
          return <line key={`drop${li}`} x1={l.nodes[0].x} y1={l.y+18} x2={layers[li+1].nodes[0].x} y2={layers[li+1].y+6} stroke="var(--sd-accent)" strokeWidth="1.5" strokeDasharray="4,2" />;
        })}
      </svg>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Production RAG architecture
export function RagProdAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { active: "query", note: "User query arrives. May be rewritten (HyDE, multi-query) for better retrieval." },
    { active: "hybrid", note: "Hybrid retrieval: BM25 (keyword) + vector search (semantic). Reciprocal Rank Fusion." },
    { active: "rerank", note: "Cross-encoder reranker scores top-100 → top-5. Expensive but critical for quality." },
    { active: "generate", note: "LLM generates answer conditioned on top passages. Citations attached." },
    { active: "guard", note: "Guardrails: faithfulness check, PII scan, toxicity filter. Then return to user." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 2000); return () => clearInterval(id); }, [playing, stages.length]);
  return (
    <div className="anim-box">
      <div className="anim-sub">production RAG pipeline — retrieval → rerank → generate → guard</div>
      <div style={{display:"flex",gap:"6px",marginBottom:"12px",alignItems:"center"}}>
        {stages.map((s,i) => (
          <React.Fragment key={i}>
            <div style={{flex:1,padding:"12px 6px",background:i===step?"var(--sd-highlight)":i<step?"rgba(16,185,129,0.1)":"var(--sd-bg-3)",border:`1.5px solid ${i===step?"var(--sd-accent)":i<step?"var(--sd-accent-2)":"var(--sd-line)"}`,borderRadius:"8px",textAlign:"center",transition:"all 0.3s",fontFamily:"var(--sd-mono)",fontSize:"10px",fontWeight:"600"}}>{s.active}</div>
            {i < stages.length-1 && <span style={{fontFamily:"var(--sd-mono)",color:"var(--sd-dim)",fontSize:"14px"}}>→</span>}
          </React.Fragment>
        ))}
      </div>
      <div className="anim-note">{stages[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

// Agent Platform architecture
export function AgentPlatformAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { active: "goal", note: "User goal arrives. Planner decomposes into sub-tasks." },
    { active: "planner", note: "LLM-based planner decides next action. CoT reasoning in the prompt." },
    { active: "tools", note: "Tool executor calls external APIs: search, DB query, code execution, etc." },
    { active: "memory", note: "Results stored in memory (vector store + scratchpad). Context for next step." },
    { active: "eval", note: "Evaluator checks: goal met? If not, loop back to planner. Max-steps guardrail." },
  ];
  useEffect(() => { if (!playing) return; const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2000); return () => clearInterval(id); }, [playing, frames.length]);
  const boxes = [{id:"goal",label:"Goal",x:20,y:80},{id:"planner",label:"Planner (LLM)",x:130,y:80},{id:"tools",label:"Tool Executor",x:280,y:80},{id:"memory",label:"Memory",x:280,y:160},{id:"eval",label:"Evaluator",x:420,y:80}];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 520 210" className="anim-svg">
        {[["goal","planner"],["planner","tools"],["tools","memory"],["tools","eval"],["eval","planner"]].map(([a,b],i) => {
          const ba=boxes.find(x=>x.id===a),bb=boxes.find(x=>x.id===b);
          const isDash = a==="eval"&&b==="planner";
          return <line key={i} x1={ba.x+50} y1={ba.y+15} x2={bb.x} y2={bb.y+15} stroke="var(--sd-line)" strokeWidth="1" opacity="0.5" strokeDasharray={isDash?"4,3":"none"} />;
        })}
        {boxes.map(b => {
          const active = b.id === frames[step].active;
          return (
            <g key={b.id} style={{transition:"all 0.3s"}}>
              <rect x={b.x} y={b.y} width="100" height="30" rx="4" fill={active?"var(--sd-accent)":"var(--sd-bg-3)"} stroke={active?"var(--sd-accent)":"var(--sd-line)"} strokeWidth="1.5" />
              <text x={b.x+50} y={b.y+19} textAnchor="middle" fontSize="9" fontWeight="700" fill={active?"var(--sd-bg)":"var(--sd-text)"} fontFamily="var(--sd-mono)">{b.label}</text>
            </g>
          );
        })}
        <text x="420" y="130" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">loop until done</text>
        <text x="420" y="145" fontSize="9" fill="var(--sd-dim)" fontFamily="var(--sd-mono)">or max steps</text>
      </svg>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}
