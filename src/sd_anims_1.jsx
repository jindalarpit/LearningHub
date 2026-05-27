// System Design — Animations Part 1: Framework + Fundamentals
import React, { useState, useEffect } from "react";

export const AnimControls = ({ playing, setPlaying, step, setStep, total }) => (
  <div className="anim-ctrls">
    <button className="ctrl-btn" onClick={() => setPlaying((p) => !p)}>
      {playing ? "❚❚ pause" : "▶ play"}
    </button>
    <button className="ctrl-btn" onClick={() => { setPlaying(false); setStep((s) => (s - 1 + total) % total); }}>← step</button>
    <button className="ctrl-btn" onClick={() => { setPlaying(false); setStep((s) => (s + 1) % total); }}>step →</button>
    <div className="ctrl-progress">
      <span>frame {step + 1} / {total}</span>
      <div className="ctrl-bar"><div className="ctrl-fill" style={{ width: `${((step + 1) / total) * 100}%` }} /></div>
    </div>
  </div>
);

export function HLDFlowAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { label: "1. Clarify Requirements", time: "5 min", note: "Functional, non-functional, scale. Write them down." },
    { label: "2. Capacity Estimation", time: "5 min", note: "QPS, storage, bandwidth. Ground every later decision." },
    { label: "3. High-Level Design", time: "10-15 min", note: "Components, data flow, APIs. Don't over-draw." },
    { label: "4. Deep Dive", time: "15-20 min", note: "Pick 2-3 subsystems. Where principal-level signal lives." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 2200);
    return () => clearInterval(id);
  }, [playing, stages.length]);
  return (
    <div className="anim-box">
      <div className="hld-flow">
        {stages.map((s, i) => (
          <div key={i} className={`hld-stage ${i === step ? "active" : ""} ${i < step ? "done" : ""}`}>
            <div className="hld-time">{s.time}</div>
            <div className="hld-label">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="anim-note">{stages[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

export function LoadBalancerAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { type: "L4", dest: 0, note: "L4 LB: routes by source IP hash. Fast, protocol-agnostic. Routes to backend 0." },
    { type: "L4", dest: 1, note: "Different client. Different hash. Backend 1." },
    { type: "L4", dest: 2, note: "L4 sees only TCP/IP — no URLs, no headers. Cheap to operate at high QPS." },
    { type: "L7", dest: 0, path: "/api/users", note: "L7 LB: reads HTTP. /api/users → user service (backend 0)." },
    { type: "L7", dest: 2, path: "/api/orders", note: "/api/orders → order service (backend 2). Path-based routing." },
    { type: "L7", dest: 1, path: "/static/img.png", note: "/static/* → static assets backend (backend 1)." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1900);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">{f.type === "L4" ? "L4 — TCP/IP routing (NLB, HAProxy TCP)" : "L7 — HTTP-aware routing (ALB, nginx, Envoy)"}</div>
      <svg viewBox="0 0 540 280" className="anim-svg">
        <rect x="20" y="120" width="80" height="40" rx="3" fill="var(--sd-bg-3)" stroke="var(--sd-line)" />
        <text x="60" y="145" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="12" fontWeight="600" fill="var(--sd-text)">Client</text>
        <line x1="100" y1="140" x2="200" y2="140" stroke="var(--sd-accent)" strokeWidth="2" markerEnd="url(#sd-arrow)" />
        {f.type === "L7" && f.path && (
          <text x="150" y="125" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="10" fill="var(--sd-accent)">{f.path}</text>
        )}
        <rect x="200" y="105" width="100" height="70" rx="3" fill={f.type === "L4" ? "var(--sd-warn)" : "var(--sd-accent)"} stroke="var(--sd-text)" strokeWidth="2" />
        <text x="250" y="135" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="13" fontWeight="700" fill="var(--sd-bg)">{f.type} LB</text>
        <text x="250" y="155" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="9" fill="var(--sd-bg)">{f.type === "L4" ? "TCP-aware" : "HTTP-aware"}</text>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <line x1="300" y1="140" x2="420" y2={60 + i * 80}
              stroke={f.dest === i ? "var(--sd-accent)" : "var(--sd-line)"}
              strokeWidth={f.dest === i ? "2" : "1"}
              markerEnd={f.dest === i ? "url(#sd-arrow)" : undefined} />
            <rect x="420" y={45 + i * 80} width="100" height="40" rx="3"
              fill={f.dest === i ? "var(--sd-accent)" : "var(--sd-bg-3)"}
              stroke="var(--sd-line)" />
            <text x="470" y={70 + i * 80} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11"
              fontWeight="600" fill={f.dest === i ? "var(--sd-bg)" : "var(--sd-text)"}>backend {i}</text>
          </g>
        ))}
        <defs>
          <marker id="sd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--sd-accent)" />
          </marker>
        </defs>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

export function ConsistentHashAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const initialServers = [
    { id: "S0", angle: 30 }, { id: "S1", angle: 110 }, { id: "S2", angle: 200 }, { id: "S3", angle: 290 },
  ];
  const newServer = { id: "S4", angle: 60 };
  const keys = [
    { k: "K_alice", angle: 50 }, { k: "K_bob", angle: 150 }, { k: "K_carol", angle: 230 },
    { k: "K_dave", angle: 320 }, { k: "K_eve", angle: 80 },
  ];
  const frames = [
    { addNew: false, focus: -1, note: "Hash ring with 4 servers. Keys hash to positions; route clockwise to next server." },
    { addNew: false, focus: 0, note: "K_alice (50°) → S1 (110°). Data lives on S1." },
    { addNew: false, focus: 4, note: "K_eve (80°) → S1 (110°). Both K_alice and K_eve map to S1." },
    { addNew: true, focus: -1, note: "Add S4 at angle 60°. Naive hashing would invalidate ALL keys. Consistent hashing..." },
    { addNew: true, focus: 0, note: "K_alice (50°) now → S4 (60°). Only K_alice (and K_eve) move. Others unaffected." },
    { addNew: true, focus: -1, note: "Adding 1 server in 5-server ring moves only ~1/5 of keys. Naive modulo would move ~all. This is the win." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2400);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const servers = f.addNew ? [...initialServers, newServer] : initialServers;
  const cx = 200, cy = 150, r = 100;
  const polar = (angle) => { const rad = ((angle - 90) * Math.PI) / 180; return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)]; };
  const findServer = (keyAngle) => {
    let best = null, bestDelta = 360;
    for (const s of servers) {
      let delta = (s.angle - keyAngle + 360) % 360;
      if (delta === 0) delta = 0.01;
      if (delta < bestDelta) { bestDelta = delta; best = s; }
    }
    return best;
  };
  return (
    <div className="anim-box">
      <svg viewBox="0 0 540 300" className="anim-svg">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--sd-line)" strokeWidth="1.5" strokeDasharray="3,2" />
        {servers.map((s) => {
          const [x, y] = polar(s.angle);
          const isNew = s.id === "S4";
          return (
            <g key={s.id}>
              <rect x={x - 18} y={y - 12} width="36" height="24" rx="3" fill={isNew ? "var(--sd-accent)" : "var(--sd-warn)"} stroke="var(--sd-text)" strokeWidth="1.5" />
              <text x={x} y={y + 4} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="700" fill="var(--sd-bg)">{s.id}</text>
            </g>
          );
        })}
        {keys.map((key, i) => {
          const [x, y] = polar(key.angle);
          const dest = findServer(key.angle);
          const [dx, dy] = polar(dest.angle);
          const isFocus = i === f.focus;
          return (
            <g key={key.k}>
              <line x1={x} y1={y} x2={dx} y2={dy} stroke={isFocus ? "var(--sd-accent)" : "var(--sd-line)"} strokeWidth={isFocus ? "2" : "1"} opacity={isFocus ? 1 : 0.4} />
              <circle cx={x} cy={y} r="4" fill={isFocus ? "var(--sd-accent)" : "var(--sd-text)"} />
              <text x={x + 8} y={y + 4} fontFamily="var(--sd-mono)" fontSize="9" fill={isFocus ? "var(--sd-accent)" : "var(--sd-dim)"}>{key.k}</text>
            </g>
          );
        })}
        <text x={cx} y={cy + 4} textAnchor="middle" fontFamily="var(--sd-serif)" fontSize="11" fontStyle="italic" fill="var(--sd-dim)">hash ring</text>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

export function CacheStrategiesAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const strats = [
    { name: "Cache-Aside", op: "READ", flow: "app → cache(miss) → db → cache(write) → app", note: "App checks cache; on miss reads DB and populates. Default pattern." },
    { name: "Write-Through", op: "WRITE", flow: "app → cache + db (synchronous)", note: "Writes go to cache AND DB synchronously. Reads always fresh; slower writes." },
    { name: "Write-Back", op: "WRITE", flow: "app → cache (db: async, later)", note: "Writes to cache only; flushed to DB async. Fastest writes; risk of data loss." },
    { name: "Write-Around", op: "WRITE", flow: "app → db (cache untouched)", note: "Writes bypass cache. Cache fills lazily on subsequent reads." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % strats.length), 2400);
    return () => clearInterval(id);
  }, [playing, strats.length]);
  return (
    <div className="anim-box">
      <div className="cache-strats">
        {strats.map((s, i) => (
          <div key={s.name} className={`cache-strat ${i === step ? "active" : ""}`}>
            <div className="cache-strat-name">{s.name}</div>
            <div className="cache-strat-op">{s.op}</div>
            <div className="cache-strat-flow">{s.flow}</div>
          </div>
        ))}
      </div>
      <div className="anim-note">{strats[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={strats.length} />
    </div>
  );
}

export function ThunderingHerdAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { state: "ok", label: "10K req/s", dbLoad: "low", note: "Normal: cache hit ~99%. Few requests reach DB." },
    { state: "expire", label: "key expires", dbLoad: "low", note: "Popular cached key TTL expires. Cache miss begins." },
    { state: "stampede", label: "10K req/s ALL miss", dbLoad: "10K", note: "All concurrent requests miss simultaneously. All hit DB. Stampede." },
    { state: "dbdown", label: "DB overloaded", dbLoad: "100% timeouts", note: "DB can't handle 10K spike. Cascading failure." },
    { state: "fix-coal", label: "request coalescing", dbLoad: "1", note: "Fix: first request fetches; concurrent requests wait. Only one DB query." },
    { state: "fix-prob", label: "probabilistic refresh", dbLoad: "low", note: "Fix: refresh cache slightly before TTL expires. No simultaneous misses." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 540 240" className="anim-svg">
        <rect x="20" y="100" width="80" height="40" rx="3" fill="var(--sd-bg-3)" stroke="var(--sd-line)" />
        <text x="60" y="125" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="600" fill="var(--sd-text)">Clients</text>
        <rect x="200" y="100" width="80" height="40" rx="3"
          fill={f.state === "ok" || f.state === "fix-prob" ? "var(--sd-accent-2)" : f.state === "expire" ? "var(--sd-warn)" : "var(--sd-bg-3)"}
          stroke="var(--sd-line)" strokeWidth="2" />
        <text x="240" y="125" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="600"
          fill={f.state === "ok" || f.state === "fix-prob" ? "var(--sd-bg)" : "var(--sd-text)"}>Cache</text>
        <rect x="380" y="100" width="80" height="40" rx="3"
          fill={f.state === "stampede" || f.state === "dbdown" ? "var(--sd-accent)" : "var(--sd-bg-3)"}
          stroke="var(--sd-line)" strokeWidth="2" />
        <text x="420" y="125" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="600"
          fill={f.state === "stampede" || f.state === "dbdown" ? "var(--sd-bg)" : "var(--sd-text)"}>DB</text>
        <line x1="100" y1="120" x2="200" y2="120" stroke="var(--sd-accent)" strokeWidth={f.state === "stampede" ? "3" : "1.5"} />
        <text x="150" y="110" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="9" fill="var(--sd-dim)">{f.label}</text>
        <line x1="280" y1="120" x2="380" y2="120"
          stroke={f.state === "stampede" || f.state === "dbdown" ? "var(--sd-accent)" : "var(--sd-line)"}
          strokeWidth={f.state === "stampede" ? "3" : "1.5"}
          strokeDasharray={f.state === "ok" ? "4,3" : "none"} />
        <text x="330" y="110" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="9" fill="var(--sd-dim)">{f.dbLoad}</text>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

export function BTreeLSMAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { active: "btree-write", note: "B-tree write: locate the right leaf node (O(log n)), update in place, fsync. Random I/O." },
    { active: "btree-read", note: "B-tree read: descend the tree (O(log n)). Predictable, fast. Postgres, MySQL InnoDB." },
    { active: "lsm-write", note: "LSM write: append to in-memory memtable + WAL. Sequential I/O, very fast. Cassandra, RocksDB." },
    { active: "lsm-flush", note: "Periodically: memtable flushed to immutable SSTable on disk." },
    { active: "lsm-compact", note: "Background: SSTables merged via compaction to limit read amplification." },
    { active: "lsm-read", note: "LSM read: check memtable, then SSTables (newest first), with Bloom filters to skip irrelevant ones." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2000);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="btree-lsm-grid">
        <div className={`btree-side ${f.active.startsWith("btree") ? "active" : "dim"}`}>
          <div className="btree-lsm-title">B-tree (Postgres, MySQL)</div>
          <div className="btree-vis">
            <div className="btree-node btree-root">root</div>
            <div className="btree-row"><div className="btree-node">internal</div><div className="btree-node">internal</div></div>
            <div className="btree-row"><div className="btree-node leaf">leaf</div><div className="btree-node leaf">leaf</div><div className="btree-node leaf">leaf</div><div className="btree-node leaf">leaf</div></div>
          </div>
          <div className="btree-lsm-prop">in-place updates · random I/O · O(log n)</div>
        </div>
        <div className={`lsm-side ${f.active.startsWith("lsm") ? "active" : "dim"}`}>
          <div className="btree-lsm-title">LSM-tree (Cassandra, RocksDB)</div>
          <div className="lsm-vis">
            <div className={`lsm-layer ${f.active === "lsm-write" ? "hot" : ""}`}>memtable + WAL</div>
            <div className="lsm-arrow">↓ flush</div>
            <div className={`lsm-layer ${f.active === "lsm-flush" ? "hot" : ""}`}>SSTable L0</div>
            <div className="lsm-arrow">↓ compact</div>
            <div className={`lsm-layer ${f.active === "lsm-compact" ? "hot" : ""}`}>SSTable L1</div>
            <div className="lsm-arrow">↓ compact</div>
            <div className="lsm-layer">SSTable L2</div>
          </div>
          <div className="btree-lsm-prop">append-only · sequential I/O · compactions</div>
        </div>
      </div>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

export function ShardingAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const strategies = [
    { name: "Range-based", layout: ["A-F → S1", "G-M → S2", "N-S → S3", "T-Z → S4"], pro: "Range queries fast", con: "Hot spots on sequential keys" },
    { name: "Hash-based", layout: ["hash(K) % 4", "uniform distribution", "no range queries"], pro: "Even load", con: "Range queries hit all shards" },
    { name: "Consistent Hash", layout: ["ring of N positions", "key → next pos on ring", "add/remove: 1/N moves"], pro: "Elastic scaling", con: "More complex" },
    { name: "Geographic", layout: ["EU users → S1", "US users → S2", "APAC → S3"], pro: "Data residency, latency", con: "Cross-region complications" },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % strategies.length), 2400);
    return () => clearInterval(id);
  }, [playing, strategies.length]);
  const s = strategies[step];
  return (
    <div className="anim-box">
      <div className="shard-grid">
        {strategies.map((str, i) => (
          <div key={str.name} className={`shard-card ${i === step ? "active" : ""}`}>
            <div className="shard-name">{str.name}</div>
            <div className="shard-layout">{str.layout.map((l, j) => <div key={j} className="shard-row">{l}</div>)}</div>
            <div className="shard-pro">+ {str.pro}</div>
            <div className="shard-con">− {str.con}</div>
          </div>
        ))}
      </div>
      <div className="anim-note"><strong>{s.name}:</strong> + {s.pro} · − {s.con}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={strategies.length} />
    </div>
  );
}

export function ReplicationAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const topologies = [
    { name: "Single-leader", arrows: [[0, 1], [0, 2]], leader: 0, note: "One primary takes writes; replicas are read-only. Postgres primary-replica, MongoDB primary." },
    { name: "Multi-leader", arrows: [[0, 1], [1, 0], [0, 2], [2, 0], [1, 2], [2, 1]], leader: -1, note: "Multiple primaries. Multi-region active-active. Pain: write conflicts." },
    { name: "Leaderless (quorum)", arrows: [[0, 1], [0, 2], [1, 0], [1, 2], [2, 0], [2, 1]], leader: -1, note: "Any node accepts writes. Quorum (R+W>N) ensures consistency. Cassandra, DynamoDB." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % topologies.length), 2400);
    return () => clearInterval(id);
  }, [playing, topologies.length]);
  const t = topologies[step];
  const positions = [{ x: 270, y: 60 }, { x: 150, y: 200 }, { x: 390, y: 200 }];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 540 280" className="anim-svg">
        {t.arrows.map(([from, to], i) => {
          const p1 = positions[from], p2 = positions[to];
          const dx = p2.x - p1.x, dy = p2.y - p1.y;
          const len = Math.sqrt(dx * dx + dy * dy);
          const ux = dx / len, uy = dy / len;
          const nx = -uy * 8, ny = ux * 8;
          return <line key={i} x1={p1.x + ux * 32 + nx} y1={p1.y + uy * 32 + ny} x2={p2.x - ux * 32 + nx} y2={p2.y - uy * 32 + ny} stroke="var(--sd-accent)" strokeWidth="1.5" markerEnd="url(#repl-arrow)" />;
        })}
        {positions.map((p, i) => {
          const isLeader = t.leader === i;
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="32" fill={isLeader ? "var(--sd-accent)" : "var(--sd-bg-3)"} stroke={isLeader ? "var(--sd-accent)" : "var(--sd-line)"} strokeWidth="2" />
              <text x={p.x} y={p.y - 2} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="700" fill={isLeader ? "var(--sd-bg)" : "var(--sd-text)"}>{t.leader === i ? "Primary" : t.leader === -1 ? "Node" : "Replica"}</text>
              <text x={p.x} y={p.y + 12} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="10" fill={isLeader ? "var(--sd-bg)" : "var(--sd-dim)"}>{String.fromCharCode(65 + i)}</text>
            </g>
          );
        })}
        <text x="270" y="265" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="14" fontWeight="700" fill="var(--sd-text)">{t.name}</text>
        <defs>
          <marker id="repl-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--sd-accent)" />
          </marker>
        </defs>
      </svg>
      <div className="anim-note">{t.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={topologies.length} />
    </div>
  );
}

export function RaftAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { state: "follower", note: "5 nodes start as followers. Wait for heartbeats. Term = 0." },
    { state: "election-timeout", note: "Node 2's election timeout expires. Becomes candidate, increments term to 1, votes for itself." },
    { state: "voting", note: "Nodes 0, 1, 3 grant votes. Node 4 missed the request." },
    { state: "leader", note: "Candidate 2 has majority (3 of 5). Becomes leader for term 1. Sends heartbeats." },
    { state: "log-append", note: "Client writes 'X = 5'. Leader appends to log, sends AppendEntries to all followers." },
    { state: "log-ack", note: "Followers append, ack to leader. Once majority (3 of 5) ack, entry is committed." },
    { state: "applied", note: "Committed entries applied to state machine on each node. System is consistent." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const positions = [{ x: 90, y: 80 }, { x: 210, y: 60 }, { x: 270, y: 150 }, { x: 210, y: 240 }, { x: 90, y: 220 }];
  const role = (i) => {
    if (f.state === "follower") return "F";
    if (f.state === "election-timeout" || f.state === "voting") return i === 2 ? "C" : "F";
    return i === 2 ? "L" : "F";
  };
  const roleLabel = { F: "follower", C: "candidate", L: "LEADER" };
  const roleColor = (r) => r === "L" ? "var(--sd-accent)" : r === "C" ? "var(--sd-warn)" : "var(--sd-bg-3)";
  return (
    <div className="anim-box">
      <svg viewBox="0 0 540 320" className="anim-svg">
        {(f.state === "leader" || f.state === "log-append") && positions.map((p, i) => {
          if (i === 2) return null;
          return <line key={i} x1={positions[2].x} y1={positions[2].y} x2={p.x} y2={p.y} stroke="var(--sd-accent)" strokeWidth="1.5" markerEnd="url(#raft-arrow)" />;
        })}
        {f.state === "voting" && [0, 1, 3].map((i) => {
          const p = positions[i];
          return <line key={i} x1={p.x} y1={p.y} x2={positions[2].x} y2={positions[2].y} stroke="var(--sd-accent-2)" strokeWidth="2" markerEnd="url(#raft-arrow)" />;
        })}
        {f.state === "log-ack" && [0, 1, 3, 4].map((i) => {
          const p = positions[i];
          return <line key={i} x1={p.x} y1={p.y} x2={positions[2].x} y2={positions[2].y} stroke={i === 4 ? "var(--sd-line)" : "var(--sd-accent-2)"} strokeWidth={i === 4 ? "1" : "2"} markerEnd="url(#raft-arrow)" opacity={i === 4 ? 0.4 : 1} />;
        })}
        {positions.map((p, i) => {
          const r = role(i);
          return (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="28" fill={roleColor(r)} stroke="var(--sd-text)" strokeWidth={r === "L" ? "2" : "1"} />
              <text x={p.x} y={p.y + 1} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="10" fontWeight="700" fill={r === "L" || r === "C" ? "var(--sd-bg)" : "var(--sd-text)"}>N{i}</text>
              <text x={p.x} y={p.y + 13} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="8" fill={r === "L" || r === "C" ? "var(--sd-bg)" : "var(--sd-dim)"}>{roleLabel[r]}</text>
            </g>
          );
        })}
        <text x="380" y="40" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="700" fill="var(--sd-accent)">{f.state === "follower" ? "Term 0" : "Term 1"}</text>
        <defs>
          <marker id="raft-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--sd-accent)" />
          </marker>
        </defs>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

export function KafkaAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { producer: 0, partition: 0, consumer: 0, note: "Producer publishes msg key=user_42. Hash(user_42) % 4 = partition 0." },
    { producer: 1, partition: 1, consumer: 1, note: "Different msg, key=user_99. Hash % 4 = partition 1. Different consumer." },
    { producer: 2, partition: 0, consumer: 0, note: "Same key (user_42) → same partition (0) → same consumer. Per-key ordering preserved." },
    { producer: -1, partition: -1, consumer: -1, note: "Ordering guaranteed within partition only. Pick partition key based on what needs to be ordered." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2200);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 540 280" className="anim-svg">
        {[0, 1, 2].map((i) => (
          <g key={`p-${i}`}>
            <rect x="20" y={20 + i * 70} width="80" height="40" rx="3" fill={f.producer === i ? "var(--sd-accent)" : "var(--sd-bg-3)"} stroke="var(--sd-line)" />
            <text x="60" y={45 + i * 70} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="600" fill={f.producer === i ? "var(--sd-bg)" : "var(--sd-text)"}>P{i}</text>
          </g>
        ))}
        <rect x="180" y="20" width="180" height="240" rx="3" fill="var(--sd-bg-2)" stroke="var(--sd-line)" strokeWidth="2" />
        <text x="270" y="15" textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="10" fill="var(--sd-dim)">Kafka Topic: events</text>
        {[0, 1, 2, 3].map((i) => (
          <g key={`part-${i}`}>
            <rect x="195" y={30 + i * 56} width="150" height="48" rx="2" fill={f.partition === i ? "var(--sd-warn)" : "var(--sd-bg)"} stroke="var(--sd-line)" />
            <text x="270" y={50 + i * 56} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="600" fill={f.partition === i ? "var(--sd-bg)" : "var(--sd-text)"}>Partition {i}</text>
            <text x="270" y={65 + i * 56} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="9" fill="var(--sd-dim)">[m0][m1][m2]...</text>
          </g>
        ))}
        {[0, 1].map((i) => (
          <g key={`c-${i}`}>
            <rect x="440" y={50 + i * 100} width="80" height="40" rx="3" fill={f.consumer === i ? "var(--sd-accent-2)" : "var(--sd-bg-3)"} stroke="var(--sd-line)" />
            <text x="480" y={75 + i * 100} textAnchor="middle" fontFamily="var(--sd-mono)" fontSize="11" fontWeight="600" fill={f.consumer === i ? "var(--sd-bg)" : "var(--sd-text)"}>C{i}</text>
          </g>
        ))}
        {f.producer >= 0 && f.partition >= 0 && (
          <line x1="100" y1={40 + f.producer * 70} x2="195" y2={54 + f.partition * 56} stroke="var(--sd-accent)" strokeWidth="2" markerEnd="url(#kafka-arrow)" />
        )}
        {f.partition >= 0 && f.consumer >= 0 && (
          <line x1="345" y1={54 + f.partition * 56} x2="440" y2={70 + f.consumer * 100} stroke="var(--sd-accent-2)" strokeWidth="2" markerEnd="url(#kafka-arrow)" />
        )}
        <defs>
          <marker id="kafka-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}
