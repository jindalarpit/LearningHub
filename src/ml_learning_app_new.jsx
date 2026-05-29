import React, { useState, useEffect, useRef, useMemo } from "react";
import { MODULES } from "./ml_content.js";
import {
  loadCourseProgress,
  saveCourseProgress,
  saveCourseSummary,
  recordActivity,
} from "./progress_store.js";

// ============================================================================
// ANIMATIONS
// ============================================================================

const AnimControls = ({ playing, setPlaying, step, setStep, total }) => (
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

// Training loop animation
function TrainingLoopAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { active: "data", loss: 2.45, note: "1. Sample a batch from the training data." },
    { active: "forward", loss: 2.45, note: "2. Forward pass: model computes predictions ŷ from inputs x." },
    { active: "loss", loss: 2.45, note: "3. Loss function compares ŷ to true y. Scalar measure of wrongness." },
    { active: "backward", loss: 2.45, note: "4. Backward pass: compute gradient of loss w.r.t. every parameter via chain rule." },
    { active: "optim", loss: 2.31, note: "5. Optimizer takes a step: θ ← θ - η · ∇L. Loss drops." },
    { active: "data", loss: 2.31, note: "Repeat. Each iteration nudges parameters toward lower loss." },
    { active: "forward", loss: 2.31, note: "Another batch, another forward pass." },
    { active: "optim", loss: 2.14, note: "Thousands of iterations later: the function has found a local minimum." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1600);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const nodes = [
    { id: "data", label: "Data", desc: "batch (x, y)", x: 80, y: 100 },
    { id: "forward", label: "Model", desc: "forward pass → ŷ", x: 230, y: 100 },
    { id: "loss", label: "Loss", desc: "L(ŷ, y)", x: 380, y: 100 },
    { id: "backward", label: "Gradients", desc: "∇L / ∇θ", x: 380, y: 220 },
    { id: "optim", label: "Optimizer", desc: "θ ← θ - η·∇L", x: 230, y: 220 },
  ];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 320" className="anim-svg">
        <defs>
          <marker id="a1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--ml-dim)" />
          </marker>
        </defs>
        {[
          ["data", "forward"], ["forward", "loss"], ["loss", "backward"],
          ["backward", "optim"], ["optim", "forward"],
        ].map(([a, b], i) => {
          const na = nodes.find((n) => n.id === a);
          const nb = nodes.find((n) => n.id === b);
          return (
            <line key={i} x1={na.x + 50} y1={na.y} x2={nb.x - 50} y2={nb.y}
                  stroke="var(--ml-dim)" strokeWidth="1.5"
                  strokeDasharray={(a === "optim" && b === "forward") ? "4,3" : "none"}
                  markerEnd="url(#a1)" opacity="0.6" />
          );
        })}
        {nodes.map((n) => {
          const active = n.id === f.active;
          return (
            <g key={n.id} style={{ transition: "all 0.4s" }}>
              <rect x={n.x - 50} y={n.y - 24} width="100" height="48" rx="6"
                    fill={active ? "var(--ml-accent)" : "var(--ml-bg-3)"}
                    stroke={active ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="1.5" />
              <text x={n.x} y={n.y - 5} textAnchor="middle"
                    fill={active ? "var(--ml-bg)" : "var(--ml-text)"}
                    fontSize="13" fontWeight="700" fontFamily="var(--ml-mono)">{n.label}</text>
              <text x={n.x} y={n.y + 12} textAnchor="middle"
                    fill={active ? "var(--ml-bg)" : "var(--ml-dim)"}
                    fontSize="10" fontFamily="var(--ml-mono)">{n.desc}</text>
            </g>
          );
        })}
        <text x="250" y="295" textAnchor="middle" fill="var(--ml-dim)" fontSize="11" fontFamily="var(--ml-mono)">
          current loss: <tspan fill="var(--ml-accent)" fontWeight="700">{f.loss}</tspan>
        </text>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Neuron flow
function NeuronFlowAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { phase: "input", note: "Input vector x = [x₁, x₂, x₃] arrives." },
    { phase: "weighted", note: "Each input is multiplied by its weight wᵢ: x₁·w₁, x₂·w₂, x₃·w₃." },
    { phase: "sum", note: "Sum the products, add bias b: z = Σ(xᵢwᵢ) + b." },
    { phase: "activation", note: "Apply non-linear activation: a = σ(z). Without this, the whole network collapses to one linear transform." },
    { phase: "output", note: "Output a is passed to the next layer." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1500);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const highlight = (p) => ({ input: ["input"], weighted: ["input", "weights"], sum: ["input", "weights", "sum"], activation: ["sum", "act"], output: ["act", "output"] }[p]);
  const hot = (el) => highlight(f.phase).includes(el);
  return (
    <div className="anim-box">
      <svg viewBox="0 0 520 240" className="anim-svg">
        {[80, 130, 180].map((y, i) => (
          <g key={i}>
            <circle cx="60" cy={y} r="18"
              fill={hot("input") ? "var(--ml-accent)" : "var(--ml-bg-3)"}
              stroke={hot("input") ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="2"
              style={{ transition: "all 0.4s" }} />
            <text x="60" y={y + 4} textAnchor="middle" fontSize="12" fontWeight="700"
              fill={hot("input") ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">x{i + 1}</text>
            <line x1="78" y1={y} x2="222" y2="130"
              stroke={hot("weights") ? "var(--ml-accent-2)" : "var(--ml-line)"}
              strokeWidth={hot("weights") ? "2" : "1.2"} style={{ transition: "all 0.4s" }} />
            <text x="145" y={y - 12 + (i * 5)} fontSize="10" fontFamily="var(--ml-mono)"
              fill={hot("weights") ? "var(--ml-accent-2)" : "var(--ml-dim)"}>w{i + 1}</text>
          </g>
        ))}
        <circle cx="240" cy="130" r="26"
          fill={hot("sum") ? "var(--ml-warn)" : "var(--ml-bg-3)"}
          stroke={hot("sum") ? "var(--ml-warn)" : "var(--ml-line)"} strokeWidth="2"
          style={{ transition: "all 0.4s" }} />
        <text x="240" y="135" textAnchor="middle" fontSize="18" fontWeight="700"
          fill={hot("sum") ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">Σ</text>
        <line x1="266" y1="130" x2="324" y2="130" stroke="var(--ml-line)" strokeWidth="1.5" />
        <rect x="326" y="108" width="64" height="44" rx="4"
          fill={hot("act") ? "var(--ml-accent)" : "var(--ml-bg-3)"}
          stroke={hot("act") ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="2"
          style={{ transition: "all 0.4s" }} />
        <text x="358" y="128" textAnchor="middle" fontSize="11" fontWeight="700"
          fill={hot("act") ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">ReLU</text>
        <text x="358" y="143" textAnchor="middle" fontSize="9"
          fill={hot("act") ? "var(--ml-bg)" : "var(--ml-dim)"} fontFamily="var(--ml-mono)">a = σ(z)</text>
        <line x1="390" y1="130" x2="432" y2="130" stroke="var(--ml-line)" strokeWidth="1.5" />
        <circle cx="450" cy="130" r="18"
          fill={hot("output") ? "var(--ml-accent)" : "var(--ml-bg-3)"}
          stroke={hot("output") ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="2"
          style={{ transition: "all 0.4s" }} />
        <text x="450" y="135" textAnchor="middle" fontSize="13" fontWeight="700"
          fill={hot("output") ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">a</text>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Attention animation
function AttentionAnim() {
  const tokens = ["The", "bank", "raised", "rates"];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const attn = [
    [0.6, 0.15, 0.15, 0.10],
    [0.1, 0.35, 0.15, 0.40],
    [0.1, 0.30, 0.35, 0.25],
    [0.1, 0.40, 0.25, 0.25],
  ];
  const frames = tokens.map((t, i) => ({
    queryIdx: i,
    note: `Token "${t}" (query ${i}) attends to all tokens. Attention row: ${attn[i].map(w => w.toFixed(2)).join(", ")}. Strongest: "${tokens[attn[i].indexOf(Math.max(...attn[i]))]}".`,
  }));
  frames.push({
    queryIdx: -1,
    note: "Every token does this in parallel. Output = weighted sum of all V vectors, weighted by softmax(QK/√d).",
  });
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2000);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">query tokens (top) attend to key tokens (bottom)</div>
      <svg viewBox="0 0 520 220" className="anim-svg">
        {tokens.map((t, i) => {
          const isQuery = i === f.queryIdx;
          return (
            <g key={`q-${i}`}>
              <rect x={60 + i * 100 - 36} y="20" width="72" height="36" rx="4"
                fill={isQuery ? "var(--ml-accent)" : "var(--ml-bg-3)"}
                stroke={isQuery ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="2"
                style={{ transition: "all 0.4s" }} />
              <text x={60 + i * 100} y="43" textAnchor="middle" fontSize="13" fontWeight="600"
                fill={isQuery ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">{t}</text>
              <text x={60 + i * 100} y="14" textAnchor="middle" fontSize="9"
                fill={isQuery ? "var(--ml-accent)" : "var(--ml-dim)"} fontFamily="var(--ml-mono)">Q{i}</text>
            </g>
          );
        })}
        {tokens.map((t, j) => (
          <g key={`k-${j}`}>
            <rect x={60 + j * 100 - 36} y="164" width="72" height="36" rx="4"
              fill="var(--ml-bg-3)" stroke="var(--ml-line)" strokeWidth="1.5" />
            <text x={60 + j * 100} y="187" textAnchor="middle" fontSize="13" fontWeight="600"
              fill="var(--ml-text)" fontFamily="var(--ml-mono)">{t}</text>
            <text x={60 + j * 100} y="212" textAnchor="middle" fontSize="9"
              fill="var(--ml-dim)" fontFamily="var(--ml-mono)">K{j}, V{j}</text>
          </g>
        ))}
        {f.queryIdx >= 0 && tokens.map((_, j) => {
          const w = attn[f.queryIdx][j];
          return (
            <g key={`e-${j}`}>
              <line x1={60 + f.queryIdx * 100} y1="58" x2={60 + j * 100} y2="162"
                stroke="var(--ml-accent)" strokeWidth={w * 8} opacity={w * 1.5}
                style={{ transition: "all 0.4s" }} />
              <text x={(60 + f.queryIdx * 100 + 60 + j * 100) / 2} y={110}
                textAnchor="middle" fontSize="10" fontWeight="700"
                fill="var(--ml-accent)" fontFamily="var(--ml-mono)"
                opacity={w > 0.12 ? 1 : 0}>{w.toFixed(2)}</text>
            </g>
          );
        })}
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Scaling laws curves
function ScalingAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { highlight: "kaplan", note: "Kaplan 2020: under fixed compute, scale params fast, tokens slow. Recommended large underfed models." },
    { highlight: "chinchilla", note: "Chinchilla 2022 corrected this: ~20 tokens per parameter. Model and data should scale together." },
    { highlight: "both", note: "GPT-3: 175B params, 300B tokens (1.7:1). Chinchilla's rule wanted 3.5T. GPT-3 was severely undertrained." },
    { highlight: "overtrain", note: "Modern practice: overtrain smaller models (Llama 3 8B on 15T tokens ≈ 1875:1) to reduce per-query inference cost." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2400);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  const pts = (ratio) => {
    const points = [];
    for (let c = 1; c <= 100; c += 3) {
      const offset = Math.abs(Math.log(ratio) - Math.log(20)) * 0.3;
      points.push([c, 3.2 - 0.4 * Math.log(c) + offset]);
    }
    return points;
  };
  const toPath = (points, xScale, yScale, xOff, yOff) =>
    points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x * xScale + xOff},${(y - 1) * yScale + yOff}`).join(" ");
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 280" className="anim-svg">
        <line x1="50" y1="40" x2="50" y2="230" stroke="var(--ml-dim)" strokeWidth="1" />
        <line x1="50" y1="230" x2="470" y2="230" stroke="var(--ml-dim)" strokeWidth="1" />
        <text x="30" y="40" fontSize="10" fill="var(--ml-dim)" fontFamily="var(--ml-mono)">loss</text>
        <text x="450" y="250" fontSize="10" fill="var(--ml-dim)" fontFamily="var(--ml-mono)">compute →</text>
        <path d={toPath(pts(60), 4, -80, 50, 230)}
          stroke={f.highlight === "kaplan" || f.highlight === "both" ? "var(--ml-warn)" : "var(--ml-line)"}
          strokeWidth="2.5" fill="none" style={{ transition: "all 0.4s" }} />
        <path d={toPath(pts(20), 4, -80, 50, 230)}
          stroke={f.highlight === "chinchilla" || f.highlight === "both" ? "var(--ml-accent)" : "var(--ml-line)"}
          strokeWidth="2.5" fill="none" style={{ transition: "all 0.4s" }} />
        <path d={toPath(pts(500), 4, -80, 50, 230)}
          stroke={f.highlight === "overtrain" ? "var(--ml-accent-2)" : "var(--ml-line)"}
          strokeWidth={f.highlight === "overtrain" ? "2.5" : "1.5"} fill="none"
          strokeDasharray={f.highlight === "overtrain" ? "none" : "4,2"}
          style={{ transition: "all 0.4s" }} />
        <g fontFamily="var(--ml-mono)" fontSize="11">
          <circle cx="400" cy="80" r="4" fill="var(--ml-warn)" />
          <text x="410" y="83" fill={f.highlight === "kaplan" || f.highlight === "both" ? "var(--ml-warn)" : "var(--ml-dim)"}>
            Kaplan: big, less data
          </text>
          <circle cx="400" cy="105" r="4" fill="var(--ml-accent)" />
          <text x="410" y="108" fill={f.highlight === "chinchilla" || f.highlight === "both" ? "var(--ml-accent)" : "var(--ml-dim)"}>
            Chinchilla: 20:1
          </text>
          <circle cx="400" cy="130" r="4" fill="var(--ml-accent-2)" />
          <text x="410" y="133" fill={f.highlight === "overtrain" ? "var(--ml-accent-2)" : "var(--ml-dim)"}>
            Llama 3: 1875:1
          </text>
        </g>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Contrastive learning — pulling/pushing in vector space
function ContrastiveAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { t: 0, note: "Before training: anchor, positive, and negatives scattered randomly in embedding space." },
    { t: 0.3, note: "Step 1: pull anchor and positive closer (their meanings are similar — they should share a neighborhood)." },
    { t: 0.6, note: "Step 2: push anchor away from negatives (dissimilar meanings belong in different regions)." },
    { t: 1.0, note: "After many steps: anchor-positive tight, anchor-negatives far apart. Ready for retrieval." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2000);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const t = frames[step].t;
  // interpolate positions
  const anchorStart = [250, 140], posStart = [350, 210], neg1Start = [320, 100], neg2Start = [180, 200], neg3Start = [400, 140];
  const anchorEnd = [250, 140], posEnd = [285, 165], neg1End = [370, 50], neg2End = [130, 240], neg3End = [445, 170];
  const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const pos = lerp(posStart, posEnd, t);
  const neg1 = lerp(neg1Start, neg1End, t);
  const neg2 = lerp(neg2Start, neg2End, t);
  const neg3 = lerp(neg3Start, neg3End, t);
  const anchor = anchorEnd;
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 300" className="anim-svg">
        <circle cx="250" cy="150" r="125" fill="none" stroke="var(--ml-line)" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />
        <text x="250" y="30" textAnchor="middle" fontSize="10" fill="var(--ml-dim)" fontFamily="var(--ml-mono)">embedding space</text>

        {step > 0 && (
          <line x1={anchor[0]} y1={anchor[1]} x2={pos[0]} y2={pos[1]}
            stroke="var(--ml-accent-2)" strokeWidth="2" strokeDasharray="4,2" opacity="0.7" />
        )}
        {step > 1 && [neg1, neg2, neg3].map((n, i) => (
          <line key={i} x1={anchor[0]} y1={anchor[1]} x2={n[0]} y2={n[1]}
            stroke="var(--ml-accent)" strokeWidth="1.5" strokeDasharray="2,2" opacity="0.5" />
        ))}

        {/* negatives */}
        {[neg1, neg2, neg3].map((n, i) => (
          <g key={i} style={{ transition: "all 0.8s" }}>
            <circle cx={n[0]} cy={n[1]} r="12" fill="var(--ml-bg-3)" stroke="var(--ml-accent)" strokeWidth="2" />
            <text x={n[0]} y={n[1] + 4} textAnchor="middle" fontSize="9" fontWeight="700"
              fill="var(--ml-accent)" fontFamily="var(--ml-mono)">neg{i + 1}</text>
          </g>
        ))}

        {/* positive */}
        <g style={{ transition: "all 0.8s" }}>
          <circle cx={pos[0]} cy={pos[1]} r="12" fill="var(--ml-bg-3)" stroke="var(--ml-accent-2)" strokeWidth="2" />
          <text x={pos[0]} y={pos[1] + 4} textAnchor="middle" fontSize="9" fontWeight="700"
            fill="var(--ml-accent-2)" fontFamily="var(--ml-mono)">pos+</text>
        </g>

        {/* anchor */}
        <g>
          <circle cx={anchor[0]} cy={anchor[1]} r="14" fill="var(--ml-accent)" stroke="var(--ml-accent)" strokeWidth="2" />
          <text x={anchor[0]} y={anchor[1] + 4} textAnchor="middle" fontSize="9" fontWeight="700"
            fill="var(--ml-bg)" fontFamily="var(--ml-mono)">anchor</text>
        </g>
      </svg>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}


// Softmax temperature animation
function SoftmaxTempAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const temps = [
    { T: 0.1, label: "T = 0.1 (sharp)", note: "Very low temperature: distribution is near one-hot. One token dominates. Gradients vanish — softmax is saturated." },
    { T: 0.5, label: "T = 0.5", note: "Low temperature: distribution is peaked but not collapsed. Some gradient flows." },
    { T: 1.0, label: "T = 1.0 (standard)", note: "Standard temperature (no scaling beyond √d_k). Healthy gradient regime — peaked but not saturated." },
    { T: 2.0, label: "T = 2.0 (flat)", note: "High temperature: distribution flattens. Every token gets similar weight. Model attends to everything equally — learns nothing specific." },
    { T: 5.0, label: "T = 5.0 (uniform)", note: "Very high temperature: near-uniform distribution. Attention is meaningless — equivalent to averaging all values." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % temps.length), 2200);
    return () => clearInterval(id);
  }, [playing, temps.length]);
  const f = temps[step];
  const logits = [2.0, 1.0, 0.5, -0.5, -1.0];
  const labels = ["tok₁", "tok₂", "tok₃", "tok₄", "tok₅"];
  const softmax = (logits, T) => {
    const scaled = logits.map((l) => l / T);
    const maxVal = Math.max(...scaled);
    const exps = scaled.map((s) => Math.exp(s - maxVal));
    const sum = exps.reduce((a, b) => a + b, 0);
    return exps.map((e) => e / sum);
  };
  const probs = softmax(logits, f.T);
  const barW = 60;
  const barGap = 20;
  const startX = 50;
  const maxH = 160;
  return (
    <div className="anim-box">
      <div className="anim-sub">softmax(logits / T) — how temperature reshapes the distribution</div>
      <svg viewBox="0 0 500 240" className="anim-svg">
        <line x1="40" y1="200" x2="460" y2="200" stroke="var(--ml-dim)" strokeWidth="1" />
        {probs.map((p, i) => {
          const x = startX + i * (barW + barGap);
          const h = p * maxH;
          return (
            <g key={i} style={{ transition: "all 0.6s" }}>
              <rect x={x} y={200 - h} width={barW} height={h} rx="2"
                fill={i === 0 ? "var(--ml-accent)" : "var(--ml-bg-3)"}
                stroke={i === 0 ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="1.5" />
              <text x={x + barW / 2} y={195 - h} textAnchor="middle" fontSize="11" fontWeight="700"
                fill="var(--ml-accent)" fontFamily="var(--ml-mono)">{p.toFixed(2)}</text>
              <text x={x + barW / 2} y="218" textAnchor="middle" fontSize="10"
                fill="var(--ml-dim)" fontFamily="var(--ml-mono)">{labels[i]}</text>
            </g>
          );
        })}
        <text x="250" y="16" textAnchor="middle" fontSize="13" fontWeight="700"
          fill="var(--ml-text)" fontFamily="var(--ml-mono)">{f.label}</text>
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={temps.length} />
    </div>
  );
}

// Alignment pipeline animation
function AlignmentAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    {
      id: "sft", label: "Stage 1: SFT", sub: "Supervised Fine-Tuning",
      desc: "Train on (instruction, response) pairs. The model learns to follow instructions instead of just completing text.",
      detail: "Data: human-written demonstrations. Loss: standard cross-entropy on the response tokens.",
    },
    {
      id: "rm", label: "Stage 2: Reward Model", sub: "Learn human preferences",
      desc: "Train a separate model to score responses. Given two responses to the same prompt, predict which humans prefer.",
      detail: "Data: pairs of responses ranked by humans. Loss: Bradley-Terry pairwise ranking loss.",
    },
    {
      id: "rlhf", label: "Stage 3: RLHF / DPO", sub: "Optimize for human preference",
      desc: "Use the reward model to guide the policy. RLHF uses PPO; DPO skips the reward model and optimizes directly from preference pairs.",
      detail: "RLHF: PPO with KL penalty to stay near the SFT model. DPO: implicit reward via log-ratio trick — simpler, no RL needed.",
    },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 3000);
    return () => clearInterval(id);
  }, [playing, stages.length]);
  const f = stages[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">the three-stage alignment pipeline</div>
      <div className="alignment-stages">
        {stages.map((s, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={s.id} className={`align-stage ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
              <div className="align-stage-num">{i + 1}</div>
              <div className="align-stage-body">
                <div className="align-stage-label">{s.label}</div>
                <div className="align-stage-sub">{s.sub}</div>
                {isActive && (
                  <div className="align-stage-detail">{s.detail}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="anim-note">{f.desc}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

// Eval pyramid animation
function EvalPyramidAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const layers = [
    { label: "Unit tests", desc: "Deterministic checks on individual components", color: "var(--ml-dim)" },
    { label: "Benchmark evals", desc: "MMLU, HumanEval, GSM8K — standardized tasks", color: "var(--ml-warn)" },
    { label: "LLM-as-judge", desc: "GPT-4 / Claude scoring open-ended outputs", color: "var(--ml-accent-2)" },
    { label: "Human eval", desc: "Domain experts rating quality, safety, helpfulness", color: "var(--ml-accent)" },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % layers.length), 2200);
    return () => clearInterval(id);
  }, [playing, layers.length]);
  return (
    <div className="anim-box">
      <div className="anim-sub">evaluation pyramid — cheap at the bottom, expensive at the top</div>
      <svg viewBox="0 0 500 260" className="anim-svg">
        {layers.map((l, i) => {
          const isActive = i === step;
          const w = 400 - i * 70;
          const x = (500 - w) / 2;
          const y = 200 - i * 50;
          return (
            <g key={i} style={{ transition: "all 0.4s" }}>
              <rect x={x} y={y} width={w} height="42" rx="3"
                fill={isActive ? l.color : "var(--ml-bg-3)"}
                stroke={isActive ? l.color : "var(--ml-line)"} strokeWidth={isActive ? 2 : 1}
                opacity={isActive ? 1 : 0.6} />
              <text x="250" y={y + 18} textAnchor="middle" fontSize="12" fontWeight="700"
                fill={isActive ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">{l.label}</text>
              <text x="250" y={y + 33} textAnchor="middle" fontSize="9"
                fill={isActive ? "var(--ml-bg)" : "var(--ml-dim)"} fontFamily="var(--ml-mono)">{l.desc}</text>
            </g>
          );
        })}
        <text x="480" y="225" textAnchor="end" fontSize="9" fill="var(--ml-dim)" fontFamily="var(--ml-mono)">cheap, fast</text>
        <text x="480" y="65" textAnchor="end" fontSize="9" fill="var(--ml-dim)" fontFamily="var(--ml-mono)">expensive, reliable</text>
      </svg>
      <div className="anim-note">Layer {step + 1}: <strong>{layers[step].label}</strong>. {
        ["Fast, automated, catches regressions. But can't evaluate open-ended generation quality.",
         "Standardized benchmarks give comparable numbers. But they saturate and don't capture real-world performance.",
         "Scalable quality assessment for open-ended tasks. But has known biases (verbosity, self-preference).",
         "The gold standard. Expensive, slow, but catches what automated evals miss. Essential for safety."][step]
      }</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={layers.length} />
    </div>
  );
}

// MoE routing animation
function MoeAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const tokens = ["The", "cat", "sat", "on", "the", "mat"];
  const experts = ["Expert 1", "Expert 2", "Expert 3", "Expert 4"];
  const routing = [
    [0, 1], [2, 3], [0, 2], [1, 3], [0, 1], [2, 3],
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % tokens.length), 1400);
    return () => clearInterval(id);
  }, [playing, tokens.length]);
  const activeExperts = routing[step];
  return (
    <div className="anim-box">
      <div className="anim-sub">top-2 routing: each token activates 2 of 4 experts</div>
      <svg viewBox="0 0 500 240" className="anim-svg">
        {/* Router */}
        <rect x="190" y="10" width="120" height="32" rx="4" fill="var(--ml-bg-3)" stroke="var(--ml-line)" strokeWidth="1.5" />
        <text x="250" y="30" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--ml-text)" fontFamily="var(--ml-mono)">Router</text>

        {/* Tokens */}
        {tokens.map((t, i) => {
          const isActive = i === step;
          const x = 30 + i * 75;
          return (
            <g key={i} style={{ transition: "all 0.3s" }}>
              <rect x={x} y="60" width="60" height="28" rx="3"
                fill={isActive ? "var(--ml-accent)" : "var(--ml-bg-3)"}
                stroke={isActive ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="1.5" />
              <text x={x + 30} y="78" textAnchor="middle" fontSize="11" fontWeight="600"
                fill={isActive ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">{t}</text>
            </g>
          );
        })}

        {/* Experts */}
        {experts.map((e, i) => {
          const isActive = activeExperts.includes(i);
          const x = 50 + i * 110;
          return (
            <g key={i} style={{ transition: "all 0.3s" }}>
              <rect x={x} y="170" width="100" height="36" rx="4"
                fill={isActive ? "var(--ml-accent-2)" : "var(--ml-bg-3)"}
                stroke={isActive ? "var(--ml-accent-2)" : "var(--ml-line)"} strokeWidth="1.5" />
              <text x={x + 50} y="192" textAnchor="middle" fontSize="11" fontWeight="600"
                fill={isActive ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">{e}</text>
            </g>
          );
        })}

        {/* Routing lines */}
        {activeExperts.map((ei) => {
          const tx = 30 + step * 75 + 30;
          const ex = 50 + ei * 110 + 50;
          return (
            <line key={ei} x1={tx} y1="88" x2={ex} y2="170"
              stroke="var(--ml-accent-2)" strokeWidth="2" opacity="0.7"
              style={{ transition: "all 0.3s" }} />
          );
        })}
      </svg>
      <div className="anim-note">Token "{tokens[step]}" routes to {experts[activeExperts[0]]} and {experts[activeExperts[1]]}. Only 2 of 4 experts fire — 50% of FFN params active per token.</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={tokens.length} />
    </div>
  );
}

// Sculley diagram
function SculleyAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const boxes = [
    { id: "data-collection", label: "Data Collection", x: 30, y: 30 },
    { id: "data-verification", label: "Data Verification", x: 170, y: 30 },
    { id: "feature-extraction", label: "Feature Extraction", x: 310, y: 30 },
    { id: "ml-code", label: "ML Code", x: 210, y: 120 },
    { id: "config", label: "Configuration", x: 30, y: 120 },
    { id: "machine-resource", label: "Machine Resource Mgmt", x: 30, y: 210 },
    { id: "monitoring", label: "Monitoring", x: 310, y: 120 },
    { id: "analysis", label: "Analysis Tools", x: 170, y: 210 },
    { id: "process-mgmt", label: "Process Mgmt Tools", x: 310, y: 210 },
    { id: "serving", label: "Serving Infrastructure", x: 170, y: 300 },
  ];
  const frames = [
    { spotlight: ["ml-code"], note: "This is what most people picture when they hear 'ML system' — the model, the code, the algorithm." },
    { spotlight: ["data-collection", "data-verification", "feature-extraction"], note: "Before any ML happens: collect data, verify it, extract features. Huge engineering effort." },
    { spotlight: ["config", "machine-resource", "process-mgmt"], note: "Around it: configuration (thousands of hyperparameters), compute resource mgmt, training process orchestration." },
    { spotlight: ["monitoring", "analysis", "serving"], note: "After training: serve the model, monitor it, analyze outputs. More engineering." },
    { spotlight: boxes.map((b) => b.id), note: "Sculley's paper: ML code is the small box in the middle. The rest is the 'hidden technical debt' — where real systems live or die." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 2400);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const f = frames[step];
  return (
    <div className="anim-box">
      <svg viewBox="0 0 500 360" className="anim-svg">
        {boxes.map((b) => {
          const isMl = b.id === "ml-code";
          const isHot = f.spotlight.includes(b.id);
          return (
            <g key={b.id} style={{ transition: "all 0.4s" }}>
              <rect x={b.x} y={b.y} width={isMl ? 80 : 130} height={isMl ? 60 : 60} rx="4"
                fill={isMl ? "var(--ml-accent)" : isHot ? "var(--ml-bg-2)" : "var(--ml-bg-3)"}
                stroke={isHot ? "var(--ml-accent)" : "var(--ml-line)"}
                strokeWidth={isHot ? 2 : 1}
                opacity={f.spotlight.length < boxes.length && !isHot ? 0.3 : 1} />
              <text x={b.x + (isMl ? 40 : 65)} y={b.y + 35} textAnchor="middle"
                fontSize="10" fontWeight={isMl ? 700 : 500}
                fill={isMl ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)"
                opacity={f.spotlight.length < boxes.length && !isHot ? 0.3 : 1}>
                {b.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// RAG pipeline
function RagPipelineAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { id: "query", label: "User Query", sub: "'What's our PTO policy?'" },
    { id: "embed-q", label: "Embed Query", sub: "encoder → vector" },
    { id: "retrieve", label: "Vector Search", sub: "top-k from index" },
    { id: "passages", label: "Retrieved Passages", sub: "top-5 relevant chunks" },
    { id: "prompt", label: "Build Prompt", sub: "query + passages" },
    { id: "llm", label: "LLM Generation", sub: "answer with context" },
    { id: "answer", label: "Final Answer", sub: "with citations" },
  ];
  const frames = stages.map((_, i) => i);
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1400);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  const activeIdx = frames[step];
  return (
    <div className="anim-box">
      <div className="rag-flow">
        {stages.map((s, i) => (
          <React.Fragment key={s.id}>
            <div className={`rag-stage ${i === activeIdx ? "active" : ""} ${i < activeIdx ? "done" : ""}`}>
              <div className="rag-stage-label">{s.label}</div>
              <div className="rag-stage-sub">{s.sub}</div>
            </div>
            {i < stages.length - 1 && (
              <div className={`rag-arrow ${i < activeIdx ? "done" : ""}`}>→</div>
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="anim-note">Stage {activeIdx + 1}/{stages.length}: {stages[activeIdx].label} — {stages[activeIdx].sub}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Advanced RAG pipeline with reranker
function RagAdvancedAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const stages = [
    { id: "query", label: "Query", group: "input" },
    { id: "rewrite", label: "Query Rewrite / HyDE", group: "pre" },
    { id: "hybrid", label: "Hybrid Retrieval\n(BM25 + Vector)", group: "retrieve" },
    { id: "rerank", label: "Cross-encoder Rerank", group: "post" },
    { id: "compress", label: "Context Compression", group: "post" },
    { id: "gen", label: "LLM Generation", group: "generate" },
    { id: "verify", label: "Faithfulness Check", group: "guard" },
    { id: "answer", label: "Answer + Citations", group: "output" },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % stages.length), 1300);
    return () => clearInterval(id);
  }, [playing, stages.length]);
  return (
    <div className="anim-box">
      <div className="rag-columns">
        {["pre", "retrieve", "post", "generate", "guard"].map((g) => (
          <div key={g} className="rag-col">
            <div className="rag-col-label">{g === "pre" ? "PRE-RETRIEVAL" : g === "retrieve" ? "RETRIEVAL" : g === "post" ? "POST-RETRIEVAL" : g === "generate" ? "GENERATION" : "GUARDRAILS"}</div>
            <div className="rag-col-body">
              {stages.filter((s) => s.group === g).map((s) => {
                const idx = stages.indexOf(s);
                const isActive = step === idx;
                const isDone = step > idx;
                return (
                  <div key={s.id} className={`rag-node ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
                    {s.label.split("\n").map((l, j) => <div key={j}>{l}</div>)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="anim-note">Step {step + 1}: {stages[step].label}. Modular RAG lets you add or skip stages per use case.</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={stages.length} />
    </div>
  );
}

// Prefill vs decode
function PrefillDecodeAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const promptLen = 8;
  const outputLen = 6;
  const totalFrames = 1 + outputLen;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % totalFrames), 1500);
    return () => clearInterval(id);
  }, [playing, totalFrames]);
  const isPrefill = step === 0;
  return (
    <div className="anim-box">
      <div className="anim-sub">{isPrefill ? "PREFILL: process all prompt tokens in parallel (compute-bound)" : `DECODE step ${step}: generate one token (memory-bandwidth-bound)`}</div>
      <div className="pd-grid">
        {Array.from({ length: promptLen }).map((_, i) => (
          <div key={`p-${i}`} className={`pd-cell pd-prompt ${isPrefill ? "pd-active" : "pd-done"}`}>p{i + 1}</div>
        ))}
        {Array.from({ length: outputLen }).map((_, i) => {
          const done = step > i + 1;
          const active = step === i + 1;
          return (
            <div key={`o-${i}`} className={`pd-cell pd-output ${active ? "pd-active" : ""} ${done ? "pd-done" : "pd-future"}`}>
              {active || done ? `o${i + 1}` : "·"}
            </div>
          );
        })}
      </div>
      <div className="pd-stats">
        <div className="pd-stat">
          <div className="pd-stat-label">KV cache size</div>
          <div className="pd-stat-val">
            {isPrefill ? `${promptLen} entries` : `${promptLen + step} entries`}
          </div>
        </div>
        <div className="pd-stat">
          <div className="pd-stat-label">bottleneck</div>
          <div className="pd-stat-val">
            {isPrefill ? "compute (matmul)" : "HBM bandwidth"}
          </div>
        </div>
        <div className="pd-stat">
          <div className="pd-stat-label">parallelism</div>
          <div className="pd-stat-val">
            {isPrefill ? "across tokens" : "across batch only"}
          </div>
        </div>
      </div>
      <div className="anim-note">
        {isPrefill
          ? "All prompt tokens pass through the model in a single parallel forward pass. High FLOP utilization."
          : `Generate token o${step}. Model weights must be re-streamed from HBM to compute for this one token. Low FLOP utilization, bandwidth-bound.`}
      </div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={totalFrames} />
    </div>
  );
}

// ReAct loop
function ReActAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const frames = [
    { phase: "thought", text: "I need to find the population of Tokyo and Delhi, then compare.", note: "Thought: the model reasons about what to do." },
    { phase: "action", text: "search('population of Tokyo 2024')", note: "Action: call a tool — web search in this case." },
    { phase: "observation", text: "Tokyo metro: 37.4 million (2024)", note: "Observation: the tool's result comes back." },
    { phase: "thought", text: "Got Tokyo. Now Delhi.", note: "Thought: reason about next step given new info." },
    { phase: "action", text: "search('population of Delhi 2024')", note: "Action: another tool call." },
    { phase: "observation", text: "Delhi NCR: 33.8 million (2024)", note: "Observation: second result." },
    { phase: "thought", text: "Tokyo 37.4M > Delhi 33.8M. Difference: 3.6M.", note: "Thought: synthesize final answer from accumulated observations." },
    { phase: "answer", text: "Tokyo is larger by 3.6 million.", note: "Final answer returned. Loop ends." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % frames.length), 1700);
    return () => clearInterval(id);
  }, [playing, frames.length]);
  return (
    <div className="anim-box">
      <div className="anim-sub">goal: "which is bigger, Tokyo or Delhi, and by how much?"</div>
      <div className="react-list">
        {frames.slice(0, step + 1).map((f, i) => (
          <div key={i} className={`react-row react-${f.phase} ${i === step ? "react-active" : ""}`}>
            <div className="react-phase">{f.phase}</div>
            <div className="react-text">{f.text}</div>
          </div>
        ))}
      </div>
      <div className="anim-note">{frames[step].note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={frames.length} />
    </div>
  );
}

// Agent loop (ReAct + memory + planning)
function AgentLoopAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const components = [
    { id: "goal", label: "Goal", desc: "what user wants" },
    { id: "plan", label: "Planner", desc: "decompose into steps" },
    { id: "memory", label: "Memory", desc: "past context + skills" },
    { id: "think", label: "Reasoner", desc: "decide next action" },
    { id: "tools", label: "Tools", desc: "external APIs" },
    { id: "observe", label: "Observer", desc: "process tool output" },
    { id: "check", label: "Verifier", desc: "done? loop or exit" },
  ];
  const trajectory = [
    { active: "goal", note: "User goal arrives. 'Research competitors and summarize.'" },
    { active: "plan", note: "Planner decomposes: 1) list competitors, 2) fetch info on each, 3) synthesize." },
    { active: "memory", note: "Memory: check if we've researched these competitors before. Load relevant past findings." },
    { active: "think", note: "Reasoner: start with step 1. Need a search tool." },
    { active: "tools", note: "Call search('competitors in X market'). Get results." },
    { active: "observe", note: "Parse results. Extract 5 competitor names." },
    { active: "check", note: "Verifier: step 1 complete, 2 more remain. Loop back to reasoner." },
    { active: "think", note: "Reasoner: step 2 for each competitor. Parallelize tool calls." },
    { active: "tools", note: "5 parallel calls to fetch_info(competitor). Results populate memory." },
    { active: "check", note: "Verifier: ready for step 3. Proceed." },
    { active: "think", note: "Reasoner: synthesize findings. Compose final summary." },
    { active: "check", note: "Verifier: goal met. Exit loop." },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % trajectory.length), 1500);
    return () => clearInterval(id);
  }, [playing, trajectory.length]);
  const f = trajectory[step];
  const positions = {
    goal: { x: 60, y: 40 }, plan: { x: 220, y: 40 }, memory: { x: 380, y: 40 },
    think: { x: 220, y: 140 }, tools: { x: 60, y: 240 }, observe: { x: 220, y: 240 },
    check: { x: 380, y: 240 },
  };
  return (
    <div className="anim-box">
      <svg viewBox="0 0 460 320" className="anim-svg">
        <defs>
          <marker id="a3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="var(--ml-dim)" />
          </marker>
        </defs>
        {[
          ["goal", "plan"], ["plan", "memory"], ["plan", "think"],
          ["memory", "think"], ["think", "tools"], ["tools", "observe"],
          ["observe", "check"], ["check", "think"],
        ].map(([a, b], i) => {
          const pa = positions[a], pb = positions[b];
          return (
            <line key={i} x1={pa.x + 50} y1={pa.y} x2={pb.x - 50} y2={pb.y}
              stroke="var(--ml-line)" strokeWidth="1" markerEnd="url(#a3)" opacity="0.5" />
          );
        })}
        {components.map((c) => {
          const p = positions[c.id];
          const active = f.active === c.id;
          return (
            <g key={c.id} style={{ transition: "all 0.4s" }}>
              <rect x={p.x - 50} y={p.y - 22} width="100" height="44" rx="5"
                fill={active ? "var(--ml-accent)" : "var(--ml-bg-3)"}
                stroke={active ? "var(--ml-accent)" : "var(--ml-line)"} strokeWidth="1.5" />
              <text x={p.x} y={p.y - 4} textAnchor="middle" fontSize="11" fontWeight="700"
                fill={active ? "var(--ml-bg)" : "var(--ml-text)"} fontFamily="var(--ml-mono)">{c.label}</text>
              <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize="9"
                fill={active ? "var(--ml-bg)" : "var(--ml-dim)"} fontFamily="var(--ml-mono)">{c.desc}</text>
            </g>
          );
        })}
      </svg>
      <div className="anim-note">{f.note}</div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={trajectory.length} />
    </div>
  );
}

// Enterprise RAG architecture
function EnterpriseRagAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const layers = [
    {
      id: "sources",
      title: "Source Systems",
      boxes: [
        { label: "SharePoint", note: "permissions per user/group" },
        { label: "Confluence", note: "space-level ACLs" },
        { label: "S3 / Drive", note: "bucket/folder access" },
        { label: "Databases", note: "row-level security" },
      ],
    },
    {
      id: "ingest",
      title: "Ingestion Pipeline",
      boxes: [
        { label: "Connectors", note: "poll or CDC" },
        { label: "Extract + OCR", note: "Unstructured, Docling" },
        { label: "Enrich", note: "metadata, entities" },
        { label: "Chunk + Embed", note: "preserve ACL metadata" },
      ],
    },
    {
      id: "storage",
      title: "Storage & Index",
      boxes: [
        { label: "Vector DB", note: "w/ metadata filtering" },
        { label: "BM25 index", note: "for hybrid retrieval" },
        { label: "Doc registry", note: "versions, lineage" },
        { label: "ACL store", note: "user→resource graph" },
      ],
    },
    {
      id: "query",
      title: "Query Serving",
      boxes: [
        { label: "Pre-filter by ACL", note: "user's allowed docs only" },
        { label: "Hybrid retrieve", note: "BM25 + vector" },
        { label: "Rerank", note: "cross-encoder" },
        { label: "Generate + cite", note: "with citations" },
      ],
    },
    {
      id: "ops",
      title: "Ops & Observability",
      boxes: [
        { label: "Audit log", note: "query, retrieved, answer" },
        { label: "Eval harness", note: "golden set regression" },
        { label: "Feedback loop", note: "👍👎 → training signal" },
        { label: "Drift monitor", note: "embedding shift" },
      ],
    },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % layers.length), 2500);
    return () => clearInterval(id);
  }, [playing, layers.length]);
  return (
    <div className="anim-box">
      <div className="ent-rag-stack">
        {layers.map((layer, i) => {
          const isActive = i === step;
          const isDone = i < step;
          return (
            <div key={layer.id} className={`ent-layer ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}>
              <div className="ent-layer-title">{layer.title}</div>
              <div className="ent-layer-boxes">
                {layer.boxes.map((b, j) => (
                  <div key={j} className="ent-box">
                    <div className="ent-box-label">{b.label}</div>
                    <div className="ent-box-note">{b.note}</div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="anim-note">
        Layer {step + 1}: <strong>{layers[step].title}</strong>. {
          ["The raw data, with permissions that must propagate downstream.",
           "Where most enterprise RAG fails — document parsing is the unglamorous killer.",
           "Vector DB is the easy part; ACL propagation and doc registry are where engineering compounds.",
           "Per-query ACL filter is the safety layer; reranker is the quality layer.",
           "The part usually skipped. Without this, you can't debug or improve."][step]
        }
      </div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={layers.length} />
    </div>
  );
}

// Monitoring
function MonitoringAnim() {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const layers = [
    { id: "ops", label: "Operational", items: ["latency p50/p99", "error rate", "throughput", "GPU/CPU %"], color: "var(--ml-dim)" },
    { id: "data", label: "Data drift", items: ["input distribution", "PSI / KS test", "missing features", "categorical shift"], color: "var(--ml-warn)" },
    { id: "concept", label: "Concept drift", items: ["ground truth feedback", "proxy labels", "A/B performance", "counterfactual"], color: "var(--ml-accent-2)" },
    { id: "biz", label: "Business metrics", items: ["conversion", "user retention", "support tickets", "$ revenue impact"], color: "var(--ml-accent)" },
  ];
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setStep((s) => (s + 1) % layers.length), 2200);
    return () => clearInterval(id);
  }, [playing, layers.length]);
  return (
    <div className="anim-box">
      <div className="mon-grid">
        {layers.map((l, i) => {
          const active = i === step;
          return (
            <div key={l.id} className={`mon-layer ${active ? "mon-active" : ""}`}
                 style={{ borderColor: active ? l.color : "var(--ml-line)" }}>
              <div className="mon-layer-label" style={{ color: active ? l.color : "var(--ml-dim)" }}>
                {i + 1}. {l.label}
              </div>
              <div className="mon-items">
                {l.items.map((it) => (
                  <div key={it} className="mon-item" style={{ color: active ? "var(--ml-text)" : "var(--ml-dimmer)" }}>
                    • {it}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="anim-note">
        Layer {step + 1}: <strong>{layers[step].label}</strong>. {
          ["Operational metrics are table stakes — same as any service.",
           "Detects inputs drifting away from training distribution. Statistical tests on feature values.",
           "Detects the relationship between inputs and outputs changing. Needs ground truth, often delayed.",
           "What you actually care about. Tie model metrics to business outcomes or you're optimizing the wrong thing."][step]
        }
      </div>
      <AnimControls playing={playing} setPlaying={setPlaying} step={step} setStep={setStep} total={layers.length} />
    </div>
  );
}

// ============================================================================
// ANIMATION MAP
// ============================================================================

const ANIM_MAP = {
  "training-loop": TrainingLoopAnim,
  "neuron-flow": NeuronFlowAnim,
  "attention": AttentionAnim,
  "scaling": ScalingAnim,
  "contrastive": ContrastiveAnim,
  "softmax-temp": SoftmaxTempAnim,
  "alignment": AlignmentAnim,
  "eval-pyramid": EvalPyramidAnim,
  "moe": MoeAnim,
  "sculley": SculleyAnim,
  "rag-pipeline": RagPipelineAnim,
  "rag-advanced": RagAdvancedAnim,
  "prefill-decode": PrefillDecodeAnim,
  "react": ReActAnim,
  "agent-loop": AgentLoopAnim,
  "enterprise-rag": EnterpriseRagAnim,
  "monitoring": MonitoringAnim,
};

// ============================================================================
// SECTION RENDERERS
// ============================================================================

function ProseSection({ section }) {
  return (
    <div className="sec-prose">
      <h3 className="sec-heading">{section.heading}</h3>
      <p className="sec-body">{section.body}</p>
    </div>
  );
}

function DiagramSection({ section }) {
  const Anim = ANIM_MAP[section.anim];
  return (
    <div className="sec-diagram">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">◇</span> {section.heading}
      </h3>
      {Anim ? <Anim /> : <div className="anim-box">animation not found</div>}
    </div>
  );
}

function CalloutSection({ section }) {
  return (
    <div className="callout">
      <div className="callout-label">{section.heading}</div>
      <div className="callout-body">{section.body}</div>
    </div>
  );
}

function ConceptsSection({ section }) {
  return (
    <div className="sec-concepts">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">◈</span> {section.heading}
      </h3>
      <div className="concept-list">
        {section.items.map((c, i) => (
          <div key={i} className="concept-item">
            <div className="concept-term">{c.term}</div>
            <div className="concept-def">{c.def}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PaperWalkSection({ section }) {
  return (
    <div className="sec-paper">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">§</span> {section.heading}
      </h3>
      <div className="paper-items">
        {section.items.map((item, i) => (
          <div key={i} className="paper-item">
            <div className="paper-claim">
              <span className="paper-bullet">{i + 1}.</span>
              <span>{item.claim}</span>
            </div>
            <div className="paper-note">{item.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MathSection({ section }) {
  return (
    <div className="sec-math">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">∑</span> {section.heading}
      </h3>
      {section.body && <p className="math-intro">{section.body}</p>}
      {section.eqs && (
        <div className="math-eqs">
          {section.eqs.map((eq, i) => (
            <div key={i} className="math-eq-row">
              <span className="math-lhs">{eq.lhs}</span>
              {eq.rhs && <span className="math-rhs">{eq.rhs}</span>}
              {eq.note && <span className="math-note">{eq.note}</span>}
            </div>
          ))}
        </div>
      )}
      {section.footer && <p className="math-footer">{section.footer}</p>}
    </div>
  );
}

function DerivationSection({ section }) {
  return (
    <div className="sec-derivation">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">⇒</span> {section.heading}
      </h3>
      <div className="deriv-steps">
        {section.steps.map((step, i) => (
          <div key={i} className="deriv-step">
            <div className="deriv-step-head">
              <span className="deriv-step-num">{i + 1}.</span>
              <span className="deriv-step-title">{step.title}</span>
            </div>
            <div className="deriv-expr">{step.expr}</div>
            <div className="deriv-explain">{step.explain}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizSection({ section, moduleId, onRecord }) {
  return (
    <div className="sec-quiz">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">?</span> {section.heading}
      </h3>
      <div className="quiz-list">
        {section.items.map((item, i) => (
          <QuizItem key={i} item={item} moduleId={moduleId} idx={i} onRecord={onRecord} />
        ))}
      </div>
    </div>
  );
}

function QuizItem({ item, moduleId, idx, onRecord }) {
  const [picked, setPicked] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const handlePick = (i) => {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
    onRecord(moduleId, idx, i === item.answer);
  };
  return (
    <div className="quiz-item">
      <div className="quiz-q">{item.q}</div>
      <div className="quiz-choices">
        {item.choices.map((c, i) => {
          const isPicked = picked === i;
          const isCorrect = revealed && i === item.answer;
          const isWrong = revealed && isPicked && i !== item.answer;
          return (
            <button key={i}
              className={`quiz-choice ${isCorrect ? "qc-correct" : ""} ${isWrong ? "qc-wrong" : ""} ${revealed && !isCorrect && !isWrong ? "qc-dim" : ""}`}
              onClick={() => handlePick(i)}
              disabled={revealed}>
              <span className="qc-letter">{String.fromCharCode(65 + i)}</span>
              <span className="qc-text">{c}</span>
              {isCorrect && <span className="qc-mark">✓</span>}
              {isWrong && <span className="qc-mark">✗</span>}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="quiz-explain">
          <span className="quiz-explain-label">why:</span> {item.explain}
        </div>
      )}
    </div>
  );
}

function ModuleView({ module, quizProgress, onQuizRecord }) {
  return (
    <div className="module-view">
      <div className="module-head">
        <div className="module-stage">{module.stage}</div>
        <div className="module-title-row">
          <span className="module-num">{module.num}</span>
          <h1 className="module-title">{module.name}</h1>
        </div>
        <p className="module-tagline">{module.tagline}</p>
        <div className="module-meta">
          <span>⧖ {module.readTime}</span>
          {module.paper && (
            <>
              <span className="meta-sep">·</span>
              <span>📄 {module.paper.authors}, <em>{module.paper.title}</em></span>
            </>
          )}
        </div>
      </div>

      {module.sections.map((section, i) => {
        switch (section.kind) {
          case "prose": return <ProseSection key={i} section={section} />;
          case "diagram": return <DiagramSection key={i} section={section} />;
          case "callout": return <CalloutSection key={i} section={section} />;
          case "concepts": return <ConceptsSection key={i} section={section} />;
          case "paper-walk": return <PaperWalkSection key={i} section={section} />;
          case "math": return <MathSection key={i} section={section} />;
          case "derivation": return <DerivationSection key={i} section={section} />;
          case "quiz": return <QuizSection key={i} section={section} moduleId={module.id} onRecord={onQuizRecord} />;
          default: return null;
        }
      })}
    </div>
  );
}

// ============================================================================
// FLASHCARDS (aggregate all concepts into a deck)
// ============================================================================

function FlashcardDeck({ onJumpToModule }) {
  const cards = useMemo(() => {
    const deck = [];
    for (const m of MODULES) {
      for (const sec of m.sections) {
        if (sec.kind === "concepts") {
          for (const item of sec.items) {
            deck.push({ term: item.term, def: item.def, moduleId: m.id, moduleName: m.name });
          }
        }
      }
    }
    return deck;
  }, []);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const card = cards[order[idx]];
  const next = () => { setFlipped(false); setIdx((i) => (i + 1) % order.length); };
  const prev = () => { setFlipped(false); setIdx((i) => (i - 1 + order.length) % order.length); };
  const shuffle = () => {
    const shuffled = [...order];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setOrder(shuffled); setIdx(0); setFlipped(false);
  };
  return (
    <div className="deck-wrap">
      <div className="deck-head">
        <div>
          <h1 className="deck-title">Flashcards</h1>
          <p className="deck-sub">{cards.length} terms across all modules. Recall before you flip — that's the whole point.</p>
        </div>
        <button className="deck-shuffle" onClick={shuffle}>↯ shuffle</button>
      </div>

      <div className={`flashcard ${flipped ? "flipped" : ""}`} onClick={() => setFlipped((f) => !f)}>
        <div className="card-face card-front">
          <div className="card-label">TERM · {card.moduleName}</div>
          <div className="card-term">{card.term}</div>
          <div className="card-hint">tap to flip</div>
        </div>
        <div className="card-face card-back">
          <div className="card-label">DEFINITION</div>
          <div className="card-def">{card.def}</div>
          <button className="card-jump" onClick={(e) => { e.stopPropagation(); onJumpToModule(card.moduleId); }}>
            read module ↗
          </button>
        </div>
      </div>

      <div className="deck-ctrls">
        <button className="deck-btn" onClick={prev}>← prev</button>
        <div className="deck-progress">{idx + 1} / {order.length}</div>
        <button className="deck-btn" onClick={next}>next →</button>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function MLApp({ theme = "dark" }) {
  const [view, setView] = useState("modules"); // modules | deck
  const [activeId, setActiveId] = useState(MODULES[0].id);
  const [quizProgress, setQuizProgress] = useState(() => loadCourseProgress("ml"));
  const contentRef = useRef(null);

  const activeModule = MODULES.find((m) => m.id === activeId);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeId, view]);

  const recordQuiz = (moduleId, quizIdx, correct) => {
    const key = `${moduleId}::${quizIdx}`;
    setQuizProgress((p) => {
      const wasCorrect = !!p[key];
      const next = { ...p, [key]: correct };
      // Count first-time correct answers as a learning activity.
      if (correct && !wasCorrect) recordActivity(1);
      return next;
    });
  };

  const totalQuizzes = MODULES.reduce((sum, m) => {
    const q = m.sections.find((s) => s.kind === "quiz");
    return sum + (q ? q.items.length : 0);
  }, 0);
  const correctQuizzes = Object.values(quizProgress).filter(Boolean).length;
  const attempted = Object.keys(quizProgress).length;

  // Persist for cross-session resume + dashboard summary.
  useEffect(() => {
    saveCourseProgress("ml", quizProgress);
    saveCourseSummary("ml", { done: correctQuizzes, total: totalQuizzes });
  }, [quizProgress, correctQuizzes, totalQuizzes]);

  const stages = [...new Set(MODULES.map((m) => m.stage))];

  return (
    <div className={`ml-course ${theme}`}>
      <style>{CSS}</style>
      <div className="app">
        <div className="ml-sub-header">
          <div className="quiz-stat">
            <span className="qs-num">{correctQuizzes}/{attempted}</span>
            <span className="qs-label">quizzes</span>
          </div>
        </div>

        <div className="view-tabs">
          <button className={`view-tab ${view === "modules" ? "active" : ""}`} onClick={() => setView("modules")}>
            <span className="vt-num">{MODULES.length}</span>
            <span>Modules</span>
          </button>
          <button className={`view-tab ${view === "deck" ? "active" : ""}`} onClick={() => setView("deck")}>
            <span className="vt-num">◈</span>
            <span>Flashcard Deck</span>
          </button>
        </div>

        {view === "modules" ? (
          <div className="layout">
            <aside className="sidebar">
              {stages.map((stage) => (
                <div key={stage} className="stage-group">
                  <div className="stage-label">{stage}</div>
                  {MODULES.filter((m) => m.stage === stage).map((m) => {
                    const q = m.sections.find((s) => s.kind === "quiz");
                    const qCount = q ? q.items.length : 0;
                    const qDone = q ? q.items.filter((_, i) => quizProgress[`${m.id}::${i}`]).length : 0;
                    return (
                      <button key={m.id}
                        className={`nav-item ${activeId === m.id ? "active" : ""}`}
                        onClick={() => setActiveId(m.id)}>
                        <span className="nav-num">{m.num}</span>
                        <span className="nav-body">
                          <span className="nav-title">{m.name}</span>
                          {qCount > 0 && (
                            <span className="nav-meta">
                              <span className="nav-time">{m.readTime}</span>
                              <span className="nav-quiz">{qDone}/{qCount} ✓</span>
                            </span>
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div className="sidebar-footer">
                <div>ML interview prep</div>
                <div className="sf-dim">principal / staff ML prep</div>
              </div>
            </aside>

            <main className="content" ref={contentRef}>
              <ModuleView module={activeModule} quizProgress={quizProgress} onQuizRecord={recordQuiz} />

              <div className="bottom-nav">
                {MODULES.findIndex((m) => m.id === activeId) > 0 && (
                  <button className="nav-btn" onClick={() => {
                    const i = MODULES.findIndex((m) => m.id === activeId);
                    setActiveId(MODULES[i - 1].id);
                  }}>
                    ← {MODULES[MODULES.findIndex((m) => m.id === activeId) - 1].name}
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {MODULES.findIndex((m) => m.id === activeId) < MODULES.length - 1 && (
                  <button className="nav-btn" onClick={() => {
                    const i = MODULES.findIndex((m) => m.id === activeId);
                    setActiveId(MODULES[i + 1].id);
                  }}>
                    {MODULES[MODULES.findIndex((m) => m.id === activeId) + 1].name} →
                  </button>
                )}
              </div>
            </main>
          </div>
        ) : (
          <FlashcardDeck onJumpToModule={(id) => { setActiveId(id); setView("modules"); }} />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// CSS
// ============================================================================


const CSS = `

.ml-course {
  --ml-bg: #06080f;
  --ml-bg-2: rgba(255,255,255,0.03);
  --ml-bg-3: rgba(255,255,255,0.06);
  --ml-line: rgba(255,255,255,0.08);
  --ml-text: #e2e5ef;
  --ml-dim: #8b90a0;
  --ml-dimmer: #555a6e;
  --ml-accent: #f59e0b;
  --ml-accent-2: #10b981;
  --ml-warn: #ef4444;
  --ml-highlight: rgba(245,158,11,0.06);
  --ml-mono: 'JetBrains Mono', ui-monospace, monospace;
  --ml-serif: 'Inter', -apple-system, system-ui, sans-serif;
  --ml-sans: 'Inter', system-ui, sans-serif;
  --glass-blur: blur(16px) saturate(180%);
}

.ml-course * { box-sizing: border-box; margin: 0; padding: 0; }

.ml-course .app {
  background: transparent;
  color: var(--ml-text);
  font-family: var(--ml-serif);
  font-size: 15px;
  line-height: 1.65;
}
.ml-course .app { display: flex; flex-direction: column; }

.ml-course .ml-sub-header {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 8px 36px; border-bottom: 1px solid var(--ml-line);
  background: rgba(6,8,15,0.5);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}

.brand-title {
  font-family: var(--ml-mono); font-size: 13px; font-weight: 700;
  letter-spacing: 0.18em; color: var(--ml-text);
}
.brand-sub {
  font-family: var(--ml-serif); font-size: 12px;
  color: var(--ml-dim); margin-top: 2px;
}

.topbar-right { display: flex; align-items: center; gap: 16px; }
.quiz-stat {
  display: flex; flex-direction: column; align-items: flex-end;
  padding: 6px 14px; border: 1px solid var(--ml-line); border-radius: 8px;
  background: var(--ml-bg-2);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.qs-num { font-family: var(--ml-mono); font-weight: 700; font-size: 13px; color: var(--ml-accent); }
.qs-label { font-family: var(--ml-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ml-dim); }

.view-tabs {
  display: flex; border-bottom: 1px solid var(--ml-line);
  background: rgba(6,8,15,0.5);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  padding: 0 36px; position: sticky; top: 73px; z-index: 9;
}
.view-tab {
  display: flex; align-items: center; gap: 10px;
  background: none; border: none; color: var(--ml-dim);
  padding: 14px 24px; cursor: pointer; font-family: var(--ml-mono);
  font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase;
  border-bottom: 2px solid transparent; transition: all 0.2s;
}
.view-tab:hover { color: var(--ml-text); background: var(--ml-bg-2); }
.view-tab.active { color: var(--ml-accent); border-bottom-color: var(--ml-accent); font-weight: 600; }
.vt-num { font-size: 18px; font-weight: 700; color: var(--ml-accent); }

.layout { display: grid; grid-template-columns: 300px 1fr; flex: 1; min-height: 0; }

.sidebar {
  background: rgba(255,255,255,0.02);
  border-right: 1px solid var(--ml-line);
  padding: 28px 0 0; position: sticky; top: 127px;
  height: calc(100vh - 127px); overflow-y: auto;
  display: flex; flex-direction: column;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}

.stage-group { margin-bottom: 16px; }
.stage-label {
  font-family: var(--ml-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.22em; color: var(--ml-dim);
  padding: 8px 28px; font-weight: 600;
  border-top: 1px solid var(--ml-line); margin-top: 4px;
  background: var(--ml-bg-3);
}
.stage-group:first-child .stage-label { border-top: none; margin-top: 0; }

.nav-item {
  display: flex; align-items: flex-start; gap: 12px; width: 100%;
  padding: 11px 28px; background: none; border: none;
  color: var(--ml-text); text-align: left; cursor: pointer;
  border-left: 3px solid transparent; transition: all 0.2s;
  font-family: var(--ml-serif);
}
.nav-item:hover { background: var(--ml-bg-2); }
.nav-item.active { background: rgba(245,158,11,0.06); border-left-color: var(--ml-accent); }

.nav-num {
  font-family: var(--ml-mono); font-size: 14px; font-weight: 700;
  color: var(--ml-dim); min-width: 24px; padding-top: 1px;
}
.nav-item.active .nav-num { color: var(--ml-accent); }

.nav-body { flex: 1; display: flex; flex-direction: column; }
.nav-title { font-size: 14px; font-weight: 500; line-height: 1.3; }
.nav-meta {
  display: flex; gap: 10px; margin-top: 3px;
  font-family: var(--ml-mono); font-size: 10px; color: var(--ml-dimmer);
}
.nav-quiz { color: var(--ml-accent-2); }

.sidebar-footer {
  margin-top: auto; padding: 18px 28px; border-top: 1px solid var(--ml-line);
  font-family: var(--ml-mono); font-size: 10px; color: var(--ml-dimmer);
}
.sf-dim { color: var(--ml-dimmer); margin-top: 3px; }

.content { padding: 56px 80px 100px; max-width: 860px; width: 100%; overflow-y: auto; }

.module-head {
  margin-bottom: 44px; padding-bottom: 32px;
  border-bottom: 1px solid var(--ml-line);
}
.module-stage {
  font-family: var(--ml-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.25em; color: var(--ml-accent); font-weight: 600;
  margin-bottom: 12px;
}
.module-title-row { display: flex; align-items: baseline; gap: 18px; margin-bottom: 12px; }
.module-num {
  font-size: 56px; font-weight: 800;
  color: var(--ml-accent); line-height: 0.9;
  letter-spacing: -0.02em;
  text-shadow: 0 0 40px rgba(245,158,11,0.2);
}
.module-title {
  font-size: 40px; font-weight: 700;
  line-height: 1.1; letter-spacing: -0.01em;
  background: linear-gradient(135deg, #e2e5ef 0%, #8b90a0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.module-tagline {
  font-size: 17px; font-style: italic;
  color: var(--ml-dim); max-width: 620px; line-height: 1.5;
}
.module-meta {
  display: flex; align-items: center; gap: 12px;
  margin-top: 18px; font-family: var(--ml-mono); font-size: 11px;
  color: var(--ml-dim);
}
.module-meta em { font-style: italic; color: var(--ml-text); }
.meta-sep { color: var(--ml-dimmer); }

.sec-prose { margin-bottom: 32px; }
.sec-heading {
  font-size: 22px; font-weight: 600;
  line-height: 1.2; margin-bottom: 14px; letter-spacing: -0.01em;
  display: flex; align-items: center; gap: 12px;
}
.sec-heading-mark {
  font-family: var(--ml-mono); font-size: 16px; color: var(--ml-accent);
  font-weight: 400;
}
.sec-body {
  font-size: 16px; line-height: 1.72;
  color: var(--ml-text); max-width: 680px;
}
.sec-diagram { margin-bottom: 44px; margin-top: 8px; }

.anim-box {
  background: var(--ml-bg-2); border: 1px solid var(--ml-line);
  padding: 28px 32px; margin-top: 4px; border-radius: 16px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.anim-svg { width: 100%; height: auto; display: block; margin: 0 auto 12px; }
.anim-sub {
  font-family: var(--ml-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.14em; color: var(--ml-dim); margin-bottom: 12px;
}
.anim-note {
  padding: 12px 16px; background: rgba(245,158,11,0.04); border-left: 3px solid var(--ml-accent);
  font-size: 14px; font-style: italic;
  line-height: 1.6; color: var(--ml-text); margin-top: 16px;
  min-height: 48px; border-radius: 0 8px 8px 0;
}
.anim-placeholder {
  padding: 40px 20px; text-align: center; font-family: var(--ml-mono);
  font-size: 13px; color: var(--ml-dimmer); font-style: italic;
}
.anim-ctrls {
  display: flex; align-items: center; gap: 10px;
  margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--ml-line);
}
.ctrl-btn {
  background: var(--ml-bg-3); border: 1px solid var(--ml-line); color: var(--ml-text);
  font-family: var(--ml-mono); font-size: 11px; padding: 5px 12px;
  border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.ctrl-btn:hover { border-color: var(--ml-accent); color: var(--ml-accent); background: rgba(245,158,11,0.06); }
.ctrl-progress { flex: 1; display: flex; flex-direction: column; gap: 4px; margin-left: 8px; }
.ctrl-progress span { font-family: var(--ml-mono); font-size: 10px; color: var(--ml-dim); }
.ctrl-bar { height: 2px; background: var(--ml-line); border-radius: 1px; overflow: hidden; }
.ctrl-fill { height: 100%; background: var(--ml-accent); transition: width 0.3s; border-radius: 1px; }

/* RAG flow */
.rag-flow {
  display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
  justify-content: center; padding: 12px 0;
}
.rag-stage {
  padding: 10px 14px; background: var(--ml-bg-3); border: 1px solid var(--ml-line);
  border-radius: 8px; transition: all 0.3s; min-width: 120px; text-align: center;
}
.rag-stage.active { border-color: var(--ml-accent); background: var(--ml-highlight); box-shadow: 0 0 16px rgba(245,158,11,0.15); }
.rag-stage.done { border-color: var(--ml-accent-2); background: rgba(16,185,129,0.05); }
.rag-stage-label { font-family: var(--ml-mono); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.rag-stage-sub { font-size: 11px; color: var(--ml-dim); margin-top: 3px; font-style: italic; }
.rag-arrow { font-family: var(--ml-mono); color: var(--ml-dim); font-size: 18px; }
.rag-arrow.done { color: var(--ml-accent-2); }

/* Advanced RAG columns */
.rag-columns { display: flex; gap: 10px; margin-bottom: 12px; }
.rag-col { flex: 1; display: flex; flex-direction: column; }
.rag-col-label {
  font-family: var(--ml-mono); font-size: 9px; text-align: center;
  color: var(--ml-dim); letter-spacing: 0.1em; margin-bottom: 8px;
  padding-bottom: 6px; border-bottom: 1px dashed var(--ml-line);
}
.rag-col-body { display: flex; flex-direction: column; gap: 6px; }
.rag-node {
  padding: 8px 10px; background: var(--ml-bg-3); border: 1px solid var(--ml-line);
  border-radius: 6px; font-family: var(--ml-mono); font-size: 11px;
  text-align: center; transition: all 0.3s; font-weight: 500;
}
.rag-node.active { border-color: var(--ml-accent); background: var(--ml-highlight); transform: scale(1.03); box-shadow: 0 0 12px rgba(245,158,11,0.1); }
.rag-node.done { border-color: var(--ml-accent-2); color: var(--ml-dim); opacity: 0.8; }

/* Prefill/decode */
.pd-grid { display: flex; gap: 4px; flex-wrap: wrap; margin-bottom: 16px; padding: 14px; background: var(--ml-bg-3); border: 1px solid var(--ml-line); border-radius: 8px; }
.pd-cell {
  width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
  font-family: var(--ml-mono); font-size: 12px; font-weight: 600;
  border: 1px solid var(--ml-line); transition: all 0.4s; border-radius: 6px;
}
.pd-cell.pd-prompt { background: var(--ml-bg-3); color: var(--ml-text); }
.pd-cell.pd-output { background: transparent; color: var(--ml-dimmer); }
.pd-cell.pd-active { background: var(--ml-accent); color: var(--ml-bg); border-color: var(--ml-accent); transform: scale(1.08); box-shadow: 0 0 12px rgba(245,158,11,0.3); }
.pd-cell.pd-done { background: var(--ml-highlight); color: var(--ml-text); border-color: var(--ml-accent); }
.pd-cell.pd-future { color: var(--ml-line); }

.pd-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 4px; }
.pd-stat { padding: 10px; background: var(--ml-bg-3); border: 1px solid var(--ml-line); border-radius: 8px; }
.pd-stat-label { font-family: var(--ml-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--ml-dim); }
.pd-stat-val { font-family: var(--ml-mono); font-size: 12px; font-weight: 600; color: var(--ml-accent); margin-top: 4px; }

/* ReAct */
.react-list { display: flex; flex-direction: column; gap: 6px; margin-bottom: 12px; }
.react-row {
  display: flex; align-items: flex-start; gap: 12px; padding: 10px 14px;
  background: var(--ml-bg-3); border: 1px solid var(--ml-line);
  opacity: 0.5; transition: all 0.3s; border-radius: 8px;
}
.react-row.react-active { opacity: 1; border-color: var(--ml-accent); background: var(--ml-highlight); }
.react-phase {
  font-family: var(--ml-mono); font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em;
  padding: 2px 8px; border-radius: 4px; flex-shrink: 0; min-width: 88px; text-align: center;
}
.react-thought .react-phase { background: var(--ml-bg-3); color: var(--ml-text); border: 1px solid var(--ml-line); }
.react-action .react-phase { background: var(--ml-accent); color: #000; }
.react-observation .react-phase { background: var(--ml-accent-2); color: #fff; }
.react-answer .react-phase { background: var(--ml-text); color: var(--ml-bg); }
.react-text { font-family: var(--ml-mono); font-size: 12px; flex: 1; }

/* Enterprise RAG */
.ent-rag-stack { display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px; }
.ent-layer {
  padding: 14px 18px; background: var(--ml-bg-3); border: 1px solid var(--ml-line);
  transition: all 0.4s; border-radius: 10px;
}
.ent-layer.active { border-color: var(--ml-accent); background: var(--ml-highlight); box-shadow: 0 0 20px rgba(245,158,11,0.1); }
.ent-layer.done { border-color: var(--ml-line); opacity: 0.6; }
.ent-layer-title {
  font-family: var(--ml-mono); font-size: 11px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 10px;
}
.ent-layer-boxes { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 8px; }
.ent-box {
  padding: 8px 12px; background: var(--ml-bg-2); border: 1px solid var(--ml-line);
  border-radius: 6px;
}
.ent-box-label { font-family: var(--ml-mono); font-size: 11px; font-weight: 600; }
.ent-box-note { font-size: 10px; color: var(--ml-dim); font-style: italic; margin-top: 2px; }

/* Monitoring grid */
.mon-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px; }
.mon-layer {
  padding: 14px 18px; background: var(--ml-bg-3); border: 2px solid var(--ml-line);
  transition: all 0.4s; border-radius: 10px;
}
.mon-layer.mon-active { background: var(--ml-highlight); transform: translateY(-2px); border-color: var(--ml-accent); box-shadow: 0 4px 20px rgba(245,158,11,0.1); }
.mon-layer-label {
  font-family: var(--ml-mono); font-size: 12px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 10px;
}
.mon-items { display: flex; flex-direction: column; gap: 4px; }
.mon-item { font-family: var(--ml-mono); font-size: 11px; transition: color 0.4s; }

/* Alignment stages */
.alignment-stages { display: flex; flex-direction: column; gap: 10px; margin-bottom: 12px; }
.align-stage {
  display: flex; gap: 16px; padding: 14px 18px; background: var(--ml-bg-3);
  border: 1px solid var(--ml-line); border-radius: 10px; transition: all 0.4s;
}
.align-stage.active { border-color: var(--ml-accent); background: var(--ml-highlight); box-shadow: 0 0 20px rgba(245,158,11,0.1); }
.align-stage.done { opacity: 0.5; }
.align-stage-num {
  font-size: 28px; font-weight: 800;
  color: var(--ml-accent); line-height: 1; min-width: 32px;
}
.align-stage-body { flex: 1; }
.align-stage-label { font-family: var(--ml-mono); font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
.align-stage-sub { font-size: 13px; color: var(--ml-dim); font-style: italic; margin-top: 2px; }
.align-stage-detail {
  margin-top: 8px; padding: 8px 12px; background: var(--ml-bg-2);
  border-left: 2px solid var(--ml-accent); font-family: var(--ml-mono);
  font-size: 11px; line-height: 1.5; color: var(--ml-text); border-radius: 0 6px 6px 0;
}

.callout {
  margin: 32px 0; padding: 20px 24px 22px;
  background: var(--ml-highlight); border-left: 4px solid var(--ml-accent);
  border-radius: 0 12px 12px 0;
}
.callout-label {
  font-family: var(--ml-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.2em; color: var(--ml-accent); font-weight: 700;
  margin-bottom: 10px;
}
.callout-body {
  font-size: 15px; line-height: 1.7;
  color: var(--ml-text); font-style: italic;
}

.sec-concepts { margin-bottom: 36px; margin-top: 40px; }
.concept-list {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--ml-line); border: 1px solid var(--ml-line); margin-top: 8px; border-radius: 12px; overflow: hidden;
}
.concept-item { padding: 14px 16px; background: rgba(255,255,255,0.02); }
.concept-term {
  font-family: var(--ml-mono); font-size: 12px; font-weight: 700;
  color: var(--ml-accent); margin-bottom: 4px; letter-spacing: 0.02em;
}
.concept-def { font-size: 13px; line-height: 1.55; color: var(--ml-text); }

.sec-paper { margin-bottom: 36px; margin-top: 40px; }
.paper-items { margin-top: 12px; }
.paper-item { padding: 16px 0; border-bottom: 1px dashed var(--ml-line); }
.paper-item:last-child { border-bottom: none; }
.paper-claim { font-size: 15px; font-weight: 600; display: flex; gap: 12px; margin-bottom: 6px; }
.paper-bullet { font-style: italic; color: var(--ml-accent); font-weight: 700; flex-shrink: 0; }
.paper-note { font-size: 14px; line-height: 1.65; color: var(--ml-dim); margin-left: 28px; }

.sec-math { margin-bottom: 36px; margin-top: 40px; }
.math-intro { font-size: 15px; line-height: 1.7; color: var(--ml-text); margin-bottom: 16px; max-width: 680px; }
.math-eqs {
  background: var(--ml-bg-2); border: 1px solid var(--ml-line);
  padding: 16px 20px; margin-bottom: 12px; border-radius: 12px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.math-eq-row {
  display: flex; align-items: baseline; gap: 12px;
  padding: 6px 0; border-bottom: 1px dashed var(--ml-line);
  font-family: var(--ml-mono); font-size: 13px;
}
.math-eq-row:last-child { border-bottom: none; }
.math-lhs { font-weight: 700; color: var(--ml-accent); min-width: 140px; flex-shrink: 0; }
.math-rhs { color: var(--ml-text); flex: 1; }
.math-note { color: var(--ml-dim); font-size: 11px; font-style: italic; }
.math-footer {
  font-size: 14px; line-height: 1.65;
  color: var(--ml-dim); font-style: italic; margin-top: 8px; max-width: 680px;
}

.sec-derivation { margin-bottom: 36px; margin-top: 40px; }
.deriv-steps { margin-top: 12px; }
.deriv-step { padding: 16px 0; border-bottom: 1px dashed var(--ml-line); }
.deriv-step:last-child { border-bottom: none; }
.deriv-step-head { display: flex; align-items: baseline; gap: 10px; margin-bottom: 8px; }
.deriv-step-num { font-weight: 700; color: var(--ml-accent); font-size: 16px; }
.deriv-step-title { font-size: 16px; font-weight: 600; }
.deriv-expr {
  font-family: var(--ml-mono); font-size: 14px; font-weight: 600;
  color: var(--ml-accent); padding: 10px 16px; background: var(--ml-bg-2);
  border-left: 3px solid var(--ml-accent); margin-bottom: 8px; border-radius: 0 8px 8px 0;
}
.deriv-explain {
  font-size: 14px; line-height: 1.6;
  color: var(--ml-dim); margin-left: 16px;
}

.sec-quiz {
  margin: 48px 0; padding: 32px 28px 28px;
  background: var(--ml-bg-2); border-top: 2px solid var(--ml-accent);
  border-bottom: 2px solid var(--ml-accent); border-radius: 12px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.quiz-list { display: flex; flex-direction: column; gap: 28px; }
.quiz-q { font-size: 15px; font-weight: 500; line-height: 1.55; margin-bottom: 14px; }
.quiz-choices { display: flex; flex-direction: column; gap: 6px; }
.quiz-choice {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 14px; background: var(--ml-bg-3); border: 1px solid var(--ml-line);
  font-size: 14px; text-align: left;
  cursor: pointer; transition: all 0.2s; color: var(--ml-text); border-radius: 8px;
}
.quiz-choice:hover:not(:disabled) { border-color: var(--ml-accent); background: var(--ml-highlight); }
.quiz-choice:disabled { cursor: default; }

.qc-letter {
  font-family: var(--ml-mono); font-size: 12px; font-weight: 700;
  color: var(--ml-accent); flex-shrink: 0; padding-top: 1px;
}
.qc-text { flex: 1; line-height: 1.5; }
.qc-mark { font-family: var(--ml-mono); font-weight: 700; font-size: 16px; }

.qc-correct { background: rgba(16,185,129,0.1); border-color: var(--ml-accent-2); color: var(--ml-accent-2); }
.qc-correct .qc-letter, .qc-correct .qc-mark { color: var(--ml-accent-2); }
.qc-wrong { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444; text-decoration: line-through; }
.qc-wrong .qc-letter, .qc-wrong .qc-mark { color: #ef4444; }
.qc-dim { opacity: 0.45; }

.quiz-explain {
  margin-top: 10px; padding: 10px 14px; background: rgba(16,185,129,0.05);
  border-left: 3px solid var(--ml-accent-2);
  font-size: 13px; font-style: italic;
  line-height: 1.6; color: var(--ml-text); border-radius: 0 8px 8px 0;
}
.quiz-explain-label { font-family: var(--ml-mono); font-weight: 700; color: var(--ml-accent-2); font-style: normal; letter-spacing: 0.05em; text-transform: uppercase; font-size: 10px; margin-right: 6px; }

/* Flashcards */
.deck-wrap { max-width: 720px; margin: 0 auto; padding: 60px 48px 80px; width: 100%; }
.deck-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 36px; padding-bottom: 20px; border-bottom: 1px solid var(--ml-line);
}
.deck-title {
  font-size: 42px; font-weight: 700;
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, #e2e5ef, #8b90a0);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.deck-sub { font-size: 14px; color: var(--ml-dim); font-style: italic; margin-top: 6px; }
.deck-shuffle {
  background: var(--ml-bg-2); border: 1px solid var(--ml-line); color: var(--ml-text);
  font-family: var(--ml-mono); font-size: 12px; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.deck-shuffle:hover { border-color: var(--ml-accent); color: var(--ml-accent); }

.flashcard {
  height: 340px; margin-bottom: 28px;
  perspective: 1200px; cursor: pointer; position: relative;
}
.card-face {
  position: absolute; inset: 0; backface-visibility: hidden;
  border: 1px solid var(--ml-line); padding: 36px 40px;
  display: flex; flex-direction: column; justify-content: space-between;
  background: var(--ml-bg-2); transition: transform 0.55s;
  border-radius: 16px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.card-front { transform: rotateY(0deg); }
.card-back { transform: rotateY(180deg); background: var(--ml-highlight); border-color: var(--ml-accent); }
.flashcard.flipped .card-front { transform: rotateY(180deg); }
.flashcard.flipped .card-back { transform: rotateY(0deg); }

.card-label {
  font-family: var(--ml-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.2em; color: var(--ml-dim); font-weight: 600;
}
.card-term {
  font-size: 38px; font-weight: 700;
  color: var(--ml-accent); line-height: 1.15;
  letter-spacing: -0.01em;
}
.card-def { font-size: 19px; line-height: 1.55; color: var(--ml-text); }
.card-hint {
  font-family: var(--ml-mono); font-size: 10px; color: var(--ml-dimmer);
  text-transform: uppercase; letter-spacing: 0.1em; text-align: right;
}
.card-jump {
  align-self: flex-end; background: none; border: 1px solid var(--ml-accent);
  color: var(--ml-accent); font-family: var(--ml-mono); font-size: 11px;
  padding: 5px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.card-jump:hover { background: var(--ml-accent); color: #000; }

.deck-ctrls { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
.deck-btn {
  background: var(--ml-bg-2); border: 1px solid var(--ml-line); color: var(--ml-text);
  font-family: var(--ml-mono); font-size: 12px; padding: 10px 24px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.deck-btn:hover { border-color: var(--ml-accent); color: var(--ml-accent); }
.deck-progress { font-family: var(--ml-mono); font-size: 13px; color: var(--ml-dim); font-weight: 600; }

.bottom-nav { display: flex; gap: 14px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--ml-line); }
.nav-btn {
  background: var(--ml-bg-2); border: 1px solid var(--ml-line); color: var(--ml-text);
  font-family: var(--ml-mono); font-size: 12px; padding: 10px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s; max-width: 320px;
}
.nav-btn:hover { border-color: var(--ml-accent); color: var(--ml-accent); background: rgba(245,158,11,0.05); }

@media (max-width: 980px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; top: 0; }
  .content { padding: 32px 28px; }
  .module-num { font-size: 42px; }
  .module-title { font-size: 30px; }
  .concept-list { grid-template-columns: 1fr; }
  .rag-columns { flex-direction: column; }
  .mon-grid { grid-template-columns: 1fr; }
  .deck-wrap { padding: 32px 24px; }
  .flashcard { height: 280px; }
  .card-face { padding: 24px 28px; }
  .card-term { font-size: 28px; }
  .view-tabs { padding: 0 20px; }
  .math-eq-row { flex-direction: column; gap: 4px; }
  .math-lhs { min-width: auto; }
}

/* ═══ Light Theme ═══ */
.ml-course.light {
  --ml-bg: #f0f2f5;
  --ml-bg-2: rgba(255,255,255,0.7);
  --ml-bg-3: rgba(255,255,255,0.9);
  --ml-line: rgba(0,0,0,0.08);
  --ml-text: #1a1d24;
  --ml-dim: #5a6070;
  --ml-dimmer: #8890a0;
  --ml-accent: #d97706;
  --ml-accent-2: #059669;
  --ml-warn: #dc2626;
  --ml-highlight: rgba(217,119,6,0.06);
}
.ml-course.light .app { background: var(--ml-bg); }
.ml-course.light .ml-sub-header { background: rgba(240,242,245,0.85); }
.ml-course.light .sidebar { background: rgba(255,255,255,0.6); }
.ml-course.light .view-tabs { background: rgba(240,242,245,0.9); }
.ml-course.light .anim-box { background: rgba(255,255,255,0.7); }
.ml-course.light .math-eqs { background: rgba(255,255,255,0.7); }
.ml-course.light .sec-quiz { background: rgba(255,255,255,0.7); }
.ml-course.light .card-face { background: rgba(255,255,255,0.8); }
.ml-course.light .card-back { background: rgba(217,119,6,0.06); }
.ml-course.light .module-title {
  background: linear-gradient(135deg, #1a1d24 0%, #5a6070 100%);
  -webkit-background-clip: text; background-clip: text;
}
.ml-course.light .deck-title {
  background: linear-gradient(135deg, #1a1d24 0%, #5a6070 100%);
  -webkit-background-clip: text; background-clip: text;
}
.ml-course.light .concept-item { background: rgba(255,255,255,0.7); }
`;