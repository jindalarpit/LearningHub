import React, { useState, useEffect, useRef, useMemo } from "react";
import { MODULES } from "./sd_modules_1.js";
import { CASE_STUDIES } from "./sd_modules_2.js";
import {
  AnimControls,
  HLDFlowAnim, LoadBalancerAnim, ConsistentHashAnim,
  CacheStrategiesAnim, ThunderingHerdAnim, BTreeLSMAnim,
  ShardingAnim, ReplicationAnim, RaftAnim, KafkaAnim,
} from "./sd_anims_1.jsx";
import {
  UrlShortenerAnim, FeedGenerationAnim, ChatAnim, GeoIndexAnim,
  AbrAnim, LedgerAnim, SagaAnim, FraudAnim,
  FeatureStoreAnim, ModelServingAnim, HnswAnim, RagProdAnim,
  AgentPlatformAnim,
} from "./sd_anims_2.jsx";

// Combine all modules
const ALL_MODULES = [...MODULES, ...CASE_STUDIES];

// Animation map — maps anim IDs from content to components
const ANIM_MAP = {
  "hld-flow": HLDFlowAnim,
  "load-balancer": LoadBalancerAnim,
  "consistent-hash": ConsistentHashAnim,
  "cache-strategies": CacheStrategiesAnim,
  "thundering-herd": ThunderingHerdAnim,
  "btree-lsm": BTreeLSMAnim,
  "sharding": ShardingAnim,
  "replication": ReplicationAnim,
  "raft": RaftAnim,
  "kafka": KafkaAnim,
  "url-shortener": UrlShortenerAnim,
  "feed-generation": FeedGenerationAnim,
  "chat": ChatAnim,
  "geo-index": GeoIndexAnim,
  "abr": AbrAnim,
  "ledger": LedgerAnim,
  "saga": SagaAnim,
  "fraud": FraudAnim,
  "feature-store": FeatureStoreAnim,
  "model-serving": ModelServingAnim,
  "hnsw": HnswAnim,
  "rag-prod": RagProdAnim,
  "agent-platform": AgentPlatformAnim,
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
      {Anim ? <Anim /> : (
        <div className="anim-box">
          <div className="anim-placeholder">animation "{section.anim}" — coming soon</div>
        </div>
      )}
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

function CaseStudySection({ section }) {
  return (
    <div className="sec-case-study">
      <h3 className="sec-heading">
        <span className="sec-heading-mark">⚙</span> {section.heading}
      </h3>
      <div className="case-items">
        {section.items.map((item, i) => (
          <div key={i} className="case-item">
            <div className="case-company">{item.company}</div>
            <div className="case-note">{item.note}</div>
          </div>
        ))}
      </div>
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
        </div>
      </div>
      {module.sections.map((section, i) => {
        switch (section.kind) {
          case "prose": return <ProseSection key={i} section={section} />;
          case "diagram": return <DiagramSection key={i} section={section} />;
          case "callout": return <CalloutSection key={i} section={section} />;
          case "concepts": return <ConceptsSection key={i} section={section} />;
          case "paper-walk": return <PaperWalkSection key={i} section={section} />;
          case "case-study": return <CaseStudySection key={i} section={section} />;
          case "math": return <MathSection key={i} section={section} />;
          case "quiz": return <QuizSection key={i} section={section} moduleId={module.id} onRecord={onQuizRecord} />;
          default: return null;
        }
      })}
    </div>
  );
}

// ============================================================================
// FLASHCARDS
// ============================================================================

function FlashcardDeck({ onJumpToModule }) {
  const cards = useMemo(() => {
    const deck = [];
    for (const m of ALL_MODULES) {
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
          <p className="deck-sub">{cards.length} terms across all modules.</p>
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

export default function SDApp({ theme = "dark" }) {
  const [view, setView] = useState("modules");
  const [activeId, setActiveId] = useState(ALL_MODULES[0].id);
  const [quizProgress, setQuizProgress] = useState({});
  const contentRef = useRef(null);

  const activeModule = ALL_MODULES.find((m) => m.id === activeId);

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
  }, [activeId, view]);

  const recordQuiz = (moduleId, quizIdx, correct) => {
    setQuizProgress((p) => ({ ...p, [`${moduleId}::${quizIdx}`]: correct }));
  };

  const correctQuizzes = Object.values(quizProgress).filter(Boolean).length;
  const attempted = Object.keys(quizProgress).length;

  const stages = [...new Set(ALL_MODULES.map((m) => m.stage))];

  return (
    <div className={`sd-course ${theme}`}>
      <style>{CSS}</style>
      <div className="app">
        <div className="sd-sub-header">
          <div className="quiz-stat">
            <span className="qs-num">{correctQuizzes}/{attempted}</span>
            <span className="qs-label">quizzes</span>
          </div>
        </div>

        <div className="view-tabs">
          <button className={`view-tab ${view === "modules" ? "active" : ""}`} onClick={() => setView("modules")}>
            <span className="vt-num">{ALL_MODULES.length}</span>
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
                  {ALL_MODULES.filter((m) => m.stage === stage).map((m) => {
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
                          <span className="nav-meta">
                            <span className="nav-time">{m.readTime}</span>
                            {qCount > 0 && <span className="nav-quiz">{qDone}/{qCount} ✓</span>}
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
              <div className="sidebar-footer">
                <div>for Arpit J.</div>
                <div className="sf-dim">principal / staff system design prep</div>
              </div>
            </aside>
            <main className="content" ref={contentRef}>
              <ModuleView module={activeModule} quizProgress={quizProgress} onQuizRecord={recordQuiz} />
              <div className="bottom-nav">
                {ALL_MODULES.findIndex((m) => m.id === activeId) > 0 && (
                  <button className="nav-btn" onClick={() => {
                    const i = ALL_MODULES.findIndex((m) => m.id === activeId);
                    setActiveId(ALL_MODULES[i - 1].id);
                  }}>
                    ← {ALL_MODULES[ALL_MODULES.findIndex((m) => m.id === activeId) - 1].name}
                  </button>
                )}
                <div style={{ flex: 1 }} />
                {ALL_MODULES.findIndex((m) => m.id === activeId) < ALL_MODULES.length - 1 && (
                  <button className="nav-btn" onClick={() => {
                    const i = ALL_MODULES.findIndex((m) => m.id === activeId);
                    setActiveId(ALL_MODULES[i + 1].id);
                  }}>
                    {ALL_MODULES[ALL_MODULES.findIndex((m) => m.id === activeId) + 1].name} →
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

.sd-course {
  --sd-bg: #06080f;
  --sd-bg-2: rgba(255,255,255,0.03);
  --sd-bg-3: rgba(255,255,255,0.06);
  --sd-line: rgba(255,255,255,0.08);
  --sd-text: #e2e5ef;
  --sd-dim: #8b90a0;
  --sd-dimmer: #555a6e;
  --sd-accent: #10b981;
  --sd-accent-2: #3b82f6;
  --sd-warn: #f59e0b;
  --sd-highlight: rgba(16,185,129,0.06);
  --sd-mono: 'JetBrains Mono', ui-monospace, monospace;
  --sd-serif: 'Inter', -apple-system, system-ui, sans-serif;
  --sd-sans: 'Inter', system-ui, sans-serif;
  --glass-blur: blur(16px) saturate(180%);
}

.sd-course * { box-sizing: border-box; margin: 0; padding: 0; }

.sd-course .app {
  background: transparent;
  color: var(--sd-text);
  font-family: var(--sd-serif);
  font-size: 15px;
  line-height: 1.65;
}
.sd-course .app { display: flex; flex-direction: column; }

.sd-course .sd-sub-header {
  display: flex; justify-content: flex-end; align-items: center;
  padding: 8px 36px; border-bottom: 1px solid var(--sd-line);
  background: rgba(6,8,15,0.5);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}

.topbar { display: none; }
.quiz-stat { display: flex; flex-direction: column; align-items: flex-end; padding: 6px 14px; border: 1px solid var(--sd-line); border-radius: 8px; background: var(--sd-bg-2); }
.qs-num { font-family: var(--sd-mono); font-weight: 700; font-size: 13px; color: var(--sd-accent); }
.qs-label { font-family: var(--sd-mono); font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sd-dim); }

.view-tabs {
  display: flex; border-bottom: 1px solid var(--sd-line);
  background: rgba(6,8,15,0.5);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  padding: 0 36px; position: sticky; top: 73px; z-index: 9;
}
.view-tab {
  display: flex; align-items: center; gap: 10px; background: none; border: none; color: var(--sd-dim);
  padding: 14px 24px; cursor: pointer; font-family: var(--sd-mono); font-size: 12px;
  letter-spacing: 0.08em; text-transform: uppercase; border-bottom: 2px solid transparent; transition: all 0.2s;
}
.view-tab:hover { color: var(--sd-text); background: var(--sd-bg-2); }
.view-tab.active { color: var(--sd-accent); border-bottom-color: var(--sd-accent); font-weight: 600; }
.vt-num { font-size: 18px; font-weight: 700; color: var(--sd-accent); }

.layout { display: grid; grid-template-columns: 300px 1fr; flex: 1; min-height: 0; }
.sidebar {
  background: rgba(255,255,255,0.02);
  border-right: 1px solid var(--sd-line); padding: 28px 0 0;
  position: sticky; top: 127px; height: calc(100vh - 127px); overflow-y: auto;
  display: flex; flex-direction: column;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.stage-group { margin-bottom: 16px; }
.stage-label {
  font-family: var(--sd-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.22em; color: var(--sd-dim); padding: 8px 28px;
  font-weight: 600; border-top: 1px solid var(--sd-line); margin-top: 4px; background: var(--sd-bg-3);
}
.stage-group:first-child .stage-label { border-top: none; margin-top: 0; }
.nav-item {
  display: flex; align-items: flex-start; gap: 12px; width: 100%;
  padding: 11px 28px; background: none; border: none; color: var(--sd-text);
  text-align: left; cursor: pointer; border-left: 3px solid transparent;
  transition: all 0.2s; font-family: var(--sd-serif);
}
.nav-item:hover { background: var(--sd-bg-2); }
.nav-item.active { background: rgba(16,185,129,0.06); border-left-color: var(--sd-accent); }
.nav-num {
  font-family: var(--sd-mono); font-size: 14px; font-weight: 700;
  color: var(--sd-dim); min-width: 30px; padding-top: 1px;
}
.nav-item.active .nav-num { color: var(--sd-accent); }
.nav-body { flex: 1; display: flex; flex-direction: column; }
.nav-title { font-size: 14px; font-weight: 500; line-height: 1.3; }
.nav-meta { display: flex; gap: 10px; margin-top: 3px; font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dimmer); }
.nav-quiz { color: var(--sd-accent); }
.sidebar-footer { margin-top: auto; padding: 18px 28px; border-top: 1px solid var(--sd-line); font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dimmer); }
.sf-dim { color: var(--sd-dimmer); margin-top: 3px; }

.content { padding: 56px 80px 100px; max-width: 860px; width: 100%; overflow-y: auto; }
.module-head { margin-bottom: 44px; padding-bottom: 32px; border-bottom: 1px solid var(--sd-line); }
.module-stage {
  font-family: var(--sd-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.25em; color: var(--sd-accent); font-weight: 600; margin-bottom: 12px;
}
.module-title-row { display: flex; align-items: baseline; gap: 18px; margin-bottom: 12px; }
.module-num {
  font-size: 56px; font-weight: 800; color: var(--sd-accent);
  line-height: 0.9; letter-spacing: -0.02em;
  text-shadow: 0 0 40px rgba(16,185,129,0.2);
}
.module-title {
  font-size: 40px; font-weight: 700; line-height: 1.1; letter-spacing: -0.01em;
  background: linear-gradient(135deg, #e2e5ef 0%, #8b90a0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.module-tagline { font-size: 17px; font-style: italic; color: var(--sd-dim); max-width: 620px; line-height: 1.5; }
.module-meta {
  display: flex; align-items: center; gap: 12px; margin-top: 18px;
  font-family: var(--sd-mono); font-size: 11px; color: var(--sd-dim);
}

.sec-prose { margin-bottom: 32px; }
.sec-heading {
  font-size: 22px; font-weight: 600; line-height: 1.2;
  margin-bottom: 14px; letter-spacing: -0.01em; display: flex; align-items: center; gap: 12px;
}
.sec-heading-mark { font-family: var(--sd-mono); font-size: 16px; color: var(--sd-accent); font-weight: 400; }
.sec-body { font-size: 16px; line-height: 1.72; color: var(--sd-text); max-width: 680px; }
.sec-diagram { margin-bottom: 44px; margin-top: 8px; }

.anim-box {
  background: var(--sd-bg-2); border: 1px solid var(--sd-line);
  padding: 28px 32px; margin-top: 4px; border-radius: 16px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.anim-svg { width: 100%; height: auto; display: block; margin: 0 auto 12px; }
.anim-sub { font-family: var(--sd-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.14em; color: var(--sd-dim); margin-bottom: 12px; }
.anim-note {
  padding: 12px 16px; background: rgba(16,185,129,0.04); border-left: 3px solid var(--sd-accent);
  font-size: 14px; font-style: italic; line-height: 1.6; color: var(--sd-text);
  margin-top: 16px; min-height: 48px; border-radius: 0 8px 8px 0;
}
.anim-placeholder { padding: 40px 20px; text-align: center; font-family: var(--sd-mono); font-size: 13px; color: var(--sd-dimmer); font-style: italic; }
.anim-ctrls {
  display: flex; align-items: center; gap: 10px; margin-top: 16px;
  padding-top: 14px; border-top: 1px dashed var(--sd-line);
}
.ctrl-btn {
  background: var(--sd-bg-3); border: 1px solid var(--sd-line); color: var(--sd-text);
  font-family: var(--sd-mono); font-size: 11px; padding: 5px 12px;
  border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.ctrl-btn:hover { border-color: var(--sd-accent); color: var(--sd-accent); background: rgba(16,185,129,0.06); }
.ctrl-progress { flex: 1; display: flex; flex-direction: column; gap: 4px; margin-left: 8px; }
.ctrl-progress span { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dim); }
.ctrl-bar { height: 2px; background: var(--sd-line); border-radius: 1px; overflow: hidden; }
.ctrl-fill { height: 100%; background: var(--sd-accent); transition: width 0.3s; border-radius: 1px; }

/* HLD flow */
.hld-flow { display: flex; gap: 8px; margin-bottom: 12px; }
.hld-stage {
  flex: 1; padding: 14px 12px; background: var(--sd-bg-3); border: 1px solid var(--sd-line);
  border-radius: 8px; transition: all 0.3s; text-align: center;
}
.hld-stage.active { border-color: var(--sd-accent); background: var(--sd-highlight); box-shadow: 0 0 16px rgba(16,185,129,0.15); }
.hld-stage.done { border-color: var(--sd-accent); opacity: 0.5; }
.hld-time { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dim); margin-bottom: 4px; }
.hld-label { font-family: var(--sd-mono); font-size: 11px; font-weight: 600; }

.callout {
  margin: 32px 0; padding: 20px 24px 22px;
  background: var(--sd-highlight); border-left: 4px solid var(--sd-accent);
  border-radius: 0 12px 12px 0;
}
.callout-label {
  font-family: var(--sd-mono); font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.2em; color: var(--sd-accent); font-weight: 700; margin-bottom: 10px;
}
.callout-body { font-size: 15px; line-height: 1.7; color: var(--sd-text); font-style: italic; }

.sec-concepts { margin-bottom: 36px; margin-top: 40px; }
.concept-list {
  display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
  background: var(--sd-line); border: 1px solid var(--sd-line); margin-top: 8px;
  border-radius: 12px; overflow: hidden;
}
.concept-item { padding: 14px 16px; background: rgba(255,255,255,0.02); }
.concept-term { font-family: var(--sd-mono); font-size: 12px; font-weight: 700; color: var(--sd-accent); margin-bottom: 4px; letter-spacing: 0.02em; }
.concept-def { font-size: 13px; line-height: 1.55; color: var(--sd-text); }

.sec-paper { margin-bottom: 36px; margin-top: 40px; }
.paper-items { margin-top: 12px; }
.paper-item { padding: 16px 0; border-bottom: 1px dashed var(--sd-line); }
.paper-item:last-child { border-bottom: none; }
.paper-claim { font-size: 15px; font-weight: 600; display: flex; gap: 12px; margin-bottom: 6px; }
.paper-bullet { font-style: italic; color: var(--sd-accent); font-weight: 700; flex-shrink: 0; }
.paper-note { font-size: 14px; line-height: 1.65; color: var(--sd-dim); margin-left: 28px; }

.sec-math { margin-bottom: 36px; margin-top: 40px; }
.math-intro { font-size: 15px; line-height: 1.7; color: var(--sd-text); margin-bottom: 16px; max-width: 680px; }
.math-eqs {
  background: var(--sd-bg-2); border: 1px solid var(--sd-line);
  padding: 16px 20px; margin-bottom: 12px; border-radius: 12px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.math-eq-row {
  display: flex; align-items: baseline; gap: 12px; padding: 6px 0;
  border-bottom: 1px dashed var(--sd-line); font-family: var(--sd-mono); font-size: 13px;
}
.math-eq-row:last-child { border-bottom: none; }
.math-lhs { font-weight: 700; color: var(--sd-accent); min-width: 140px; flex-shrink: 0; }
.math-rhs { color: var(--sd-text); flex: 1; }
.math-note { color: var(--sd-dim); font-size: 11px; font-style: italic; }
.math-footer { font-size: 14px; line-height: 1.65; color: var(--sd-dim); font-style: italic; margin-top: 8px; max-width: 680px; }

.sec-quiz {
  margin: 48px 0; padding: 32px 28px 28px;
  background: var(--sd-bg-2); border-top: 2px solid var(--sd-accent);
  border-bottom: 2px solid var(--sd-accent); border-radius: 12px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.quiz-list { display: flex; flex-direction: column; gap: 28px; }
.quiz-q { font-size: 15px; font-weight: 500; line-height: 1.55; margin-bottom: 14px; }
.quiz-choices { display: flex; flex-direction: column; gap: 6px; }
.quiz-choice {
  display: flex; align-items: flex-start; gap: 12px;
  padding: 10px 14px; background: var(--sd-bg-3); border: 1px solid var(--sd-line);
  font-size: 14px; text-align: left; cursor: pointer; transition: all 0.2s;
  color: var(--sd-text); border-radius: 8px;
}
.quiz-choice:hover:not(:disabled) { border-color: var(--sd-accent); background: var(--sd-highlight); }
.quiz-choice:disabled { cursor: default; }
.qc-letter { font-family: var(--sd-mono); font-size: 12px; font-weight: 700; color: var(--sd-accent); flex-shrink: 0; padding-top: 1px; }
.qc-text { flex: 1; line-height: 1.5; }
.qc-mark { font-family: var(--sd-mono); font-weight: 700; font-size: 16px; }
.qc-correct { background: rgba(16,185,129,0.1); border-color: var(--sd-accent); color: var(--sd-accent); }
.qc-correct .qc-letter, .qc-correct .qc-mark { color: var(--sd-accent); }
.qc-wrong { background: rgba(239,68,68,0.1); border-color: #ef4444; color: #ef4444; text-decoration: line-through; }
.qc-wrong .qc-letter, .qc-wrong .qc-mark { color: #ef4444; }
.qc-dim { opacity: 0.45; }
.quiz-explain {
  margin-top: 10px; padding: 10px 14px; background: rgba(16,185,129,0.04);
  border-left: 3px solid var(--sd-accent); font-size: 13px;
  font-style: italic; line-height: 1.6; color: var(--sd-text); border-radius: 0 8px 8px 0;
}
.quiz-explain-label { font-family: var(--sd-mono); font-weight: 700; color: var(--sd-accent); font-style: normal; letter-spacing: 0.05em; text-transform: uppercase; font-size: 10px; margin-right: 6px; }

.deck-wrap { max-width: 720px; margin: 0 auto; padding: 60px 48px 80px; width: 100%; }
.deck-head {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 36px; padding-bottom: 20px; border-bottom: 1px solid var(--sd-line);
}
.deck-title {
  font-size: 42px; font-weight: 700; letter-spacing: -0.02em;
  background: linear-gradient(135deg, #e2e5ef, #8b90a0);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.deck-sub { font-size: 14px; color: var(--sd-dim); font-style: italic; margin-top: 6px; }
.deck-shuffle {
  background: var(--sd-bg-2); border: 1px solid var(--sd-line); color: var(--sd-text);
  font-family: var(--sd-mono); font-size: 12px; padding: 8px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.deck-shuffle:hover { border-color: var(--sd-accent); color: var(--sd-accent); }
.flashcard { height: 340px; margin-bottom: 28px; perspective: 1200px; cursor: pointer; position: relative; }
.card-face {
  position: absolute; inset: 0; backface-visibility: hidden;
  border: 1px solid var(--sd-line); padding: 36px 40px;
  display: flex; flex-direction: column; justify-content: space-between;
  background: var(--sd-bg-2); transition: transform 0.55s; border-radius: 16px;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.card-front { transform: rotateY(0deg); }
.card-back { transform: rotateY(180deg); background: var(--sd-highlight); border-color: var(--sd-accent); }
.flashcard.flipped .card-front { transform: rotateY(180deg); }
.flashcard.flipped .card-back { transform: rotateY(0deg); }
.card-label { font-family: var(--sd-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; color: var(--sd-dim); font-weight: 600; }
.card-term { font-size: 38px; font-weight: 700; color: var(--sd-accent); line-height: 1.15; letter-spacing: -0.01em; }
.card-def { font-size: 19px; line-height: 1.55; color: var(--sd-text); }
.card-hint { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dimmer); text-transform: uppercase; letter-spacing: 0.1em; text-align: right; }
.card-jump {
  align-self: flex-end; background: none; border: 1px solid var(--sd-accent);
  color: var(--sd-accent); font-family: var(--sd-mono); font-size: 11px;
  padding: 5px 12px; border-radius: 6px; cursor: pointer; transition: all 0.2s;
}
.card-jump:hover { background: var(--sd-accent); color: #000; }
.deck-ctrls { display: flex; justify-content: space-between; align-items: center; gap: 18px; }
.deck-btn {
  background: var(--sd-bg-2); border: 1px solid var(--sd-line); color: var(--sd-text);
  font-family: var(--sd-mono); font-size: 12px; padding: 10px 24px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s;
}
.deck-btn:hover { border-color: var(--sd-accent); color: var(--sd-accent); }
.deck-progress { font-family: var(--sd-mono); font-size: 13px; color: var(--sd-dim); font-weight: 600; }

.bottom-nav { display: flex; gap: 14px; margin-top: 56px; padding-top: 28px; border-top: 1px solid var(--sd-line); }
.nav-btn {
  background: var(--sd-bg-2); border: 1px solid var(--sd-line); color: var(--sd-text);
  font-family: var(--sd-mono); font-size: 12px; padding: 10px 16px;
  border-radius: 8px; cursor: pointer; transition: all 0.2s; max-width: 320px;
}
.nav-btn:hover { border-color: var(--sd-accent); color: var(--sd-accent); background: rgba(16,185,129,0.05); }

/* Cache strategies */
.cache-strats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px; }
.cache-strat { padding: 14px 16px; background: var(--sd-bg-3); border: 2px solid var(--sd-line); border-radius: 10px; transition: all 0.3s; }
.cache-strat.active { border-color: var(--sd-accent); background: var(--sd-highlight); box-shadow: 0 0 16px rgba(16,185,129,0.15); }
.cache-strat-name { font-family: var(--sd-mono); font-size: 13px; font-weight: 700; color: var(--sd-accent); margin-bottom: 4px; }
.cache-strat-op { font-family: var(--sd-mono); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--sd-dim); margin-bottom: 6px; }
.cache-strat-flow { font-family: var(--sd-mono); font-size: 11px; color: var(--sd-text); line-height: 1.5; }

/* B-tree vs LSM */
.btree-lsm-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px; }
.btree-side, .lsm-side { padding: 16px; background: var(--sd-bg-3); border: 2px solid var(--sd-line); border-radius: 10px; transition: all 0.3s; }
.btree-side.active, .lsm-side.active { border-color: var(--sd-accent); background: var(--sd-highlight); }
.btree-side.dim, .lsm-side.dim { opacity: 0.3; }
.btree-lsm-title { font-family: var(--sd-mono); font-size: 12px; font-weight: 700; color: var(--sd-accent); margin-bottom: 12px; text-align: center; }
.btree-lsm-prop { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dim); text-align: center; margin-top: 12px; }
.btree-vis { display: flex; flex-direction: column; align-items: center; gap: 6px; }
.btree-row { display: flex; gap: 4px; justify-content: center; }
.btree-node { padding: 4px 10px; background: var(--sd-bg-2); border: 1px solid var(--sd-line); border-radius: 4px; font-family: var(--sd-mono); font-size: 10px; font-weight: 600; text-align: center; }
.btree-node.btree-root { background: var(--sd-accent); color: #000; border-color: var(--sd-accent); }
.btree-node.leaf { background: var(--sd-bg-3); }
.lsm-vis { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.lsm-layer { padding: 6px 16px; background: var(--sd-bg-2); border: 1px solid var(--sd-line); border-radius: 4px; font-family: var(--sd-mono); font-size: 10px; font-weight: 600; text-align: center; width: 100%; transition: all 0.3s; }
.lsm-layer.hot { background: var(--sd-accent); color: #000; border-color: var(--sd-accent); }
.lsm-arrow { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-dim); }

/* Sharding */
.shard-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; margin-bottom: 12px; }
.shard-card { padding: 14px 16px; background: var(--sd-bg-3); border: 2px solid var(--sd-line); border-radius: 10px; transition: all 0.3s; }
.shard-card.active { border-color: var(--sd-accent); background: var(--sd-highlight); box-shadow: 0 0 16px rgba(16,185,129,0.1); }
.shard-name { font-family: var(--sd-mono); font-size: 12px; font-weight: 700; color: var(--sd-accent); margin-bottom: 8px; }
.shard-layout { margin-bottom: 8px; }
.shard-row { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-text); padding: 2px 0; }
.shard-pro { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-accent); }
.shard-con { font-family: var(--sd-mono); font-size: 10px; color: var(--sd-warn); }

/* Case study sections */
.sec-case-study { margin-bottom: 36px; margin-top: 40px; }
.case-items { margin-top: 12px; }
.case-item { padding: 14px 0; border-bottom: 1px dashed var(--sd-line); }
.case-item:last-child { border-bottom: none; }
.case-company { font-family: var(--sd-mono); font-size: 12px; font-weight: 700; color: var(--sd-accent); margin-bottom: 4px; }
.case-note { font-size: 14px; line-height: 1.6; color: var(--sd-dim); }

@media (max-width: 980px) {
  .layout { grid-template-columns: 1fr; }
  .sidebar { position: relative; height: auto; top: 0; }
  .content { padding: 32px 28px; }
  .module-num { font-size: 42px; }
  .module-title { font-size: 30px; }
  .concept-list { grid-template-columns: 1fr; }
  .deck-wrap { padding: 32px 24px; }
  .flashcard { height: 280px; }
  .card-face { padding: 24px 28px; }
  .card-term { font-size: 28px; }
  .view-tabs { padding: 0 20px; }
  .hld-flow { flex-direction: column; }
  .cache-strats { grid-template-columns: 1fr; }
  .btree-lsm-grid { grid-template-columns: 1fr; }
  .shard-grid { grid-template-columns: 1fr; }
}

/* ═══ Light Theme ═══ */
.sd-course.light {
  --sd-bg: #f0f2f5;
  --sd-bg-2: rgba(255,255,255,0.7);
  --sd-bg-3: rgba(255,255,255,0.9);
  --sd-line: rgba(0,0,0,0.08);
  --sd-text: #1a1d24;
  --sd-dim: #5a6070;
  --sd-dimmer: #8890a0;
  --sd-accent: #059669;
  --sd-accent-2: #2563eb;
  --sd-warn: #d97706;
  --sd-highlight: rgba(5,150,105,0.06);
}
.sd-course.light .app { background: var(--sd-bg); }
.sd-course.light .sd-sub-header { background: rgba(240,242,245,0.85); }
.sd-course.light .sidebar { background: rgba(255,255,255,0.6); }
.sd-course.light .view-tabs { background: rgba(240,242,245,0.9); }
.sd-course.light .anim-box { background: rgba(255,255,255,0.7); }
.sd-course.light .math-eqs { background: rgba(255,255,255,0.7); }
.sd-course.light .sec-quiz { background: rgba(255,255,255,0.7); }
.sd-course.light .card-face { background: rgba(255,255,255,0.8); }
.sd-course.light .card-back { background: rgba(5,150,105,0.06); }
.sd-course.light .module-title {
  background: linear-gradient(135deg, #1a1d24 0%, #5a6070 100%);
  -webkit-background-clip: text; background-clip: text;
}
.sd-course.light .deck-title {
  background: linear-gradient(135deg, #1a1d24 0%, #5a6070 100%);
  -webkit-background-clip: text; background-clip: text;
}
.sd-course.light .concept-item { background: rgba(255,255,255,0.7); }
`;
