import React, { useState, useEffect, useRef } from "react";
import DSAApp from "./dsa_app.jsx";
import MLApp from "./ml_learning_app_new.jsx";
import SDApp from "./sd_app.jsx";
import {
  getUserName,
  setUserName,
  loadAllSummaries,
  weeklyActivity,
  currentStreak,
  totalItemsCompleted,
  overallProgressPct,
  onProgressChange,
} from "./progress_store.js";

/* ─── Course definitions ─── */
const COURSES = [
  {
    id: "dsa",
    name: "DSA Patterns",
    shortName: "DSA",
    desc: "14 coding patterns, 120+ problems with Google & Microsoft tags",
    longDesc: "Master the 14 essential algorithm patterns that cover 95% of coding interviews. Each pattern includes interactive visualizations, Java templates, and curated problems tagged by Google and Microsoft frequency.",
    accent: "#3b82f6",
    accentRgb: "59,130,246",
    icon: "⟐",
    stats: { items: "14 Patterns", problems: "120+ Problems", extras: "Hot Lists" },
  },
  {
    id: "ml",
    name: "Machine Learning",
    shortName: "ML",
    desc: "16 modules from foundations to production ML systems",
    longDesc: "Deep dive into ML from neural network fundamentals through transformers, scaling laws, RAG, agents, and production systems. Includes interactive animations, paper walkthroughs, and spaced-repetition flashcards.",
    accent: "#f59e0b",
    accentRgb: "245,158,11",
    icon: "◉",
    stats: { items: "16 Modules", problems: "Quizzes", extras: "Flashcards" },
  },
  {
    id: "sd",
    name: "System Design",
    shortName: "SD",
    desc: "8 fundamentals + 12 case studies with interactive animations",
    longDesc: "From load balancing fundamentals to complex distributed systems. Features the four-step HLD framework, 20+ interactive architecture animations, and real-world case studies from URL shorteners to agent platforms.",
    accent: "#10b981",
    accentRgb: "16,185,129",
    icon: "⬡",
    stats: { items: "20 Modules", problems: "Case Studies", extras: "Flashcards" },
  },
];

/* ─── Animated background orbs ─── */
function BackgroundOrbs() {
  return (
    <div className="bg-orbs" aria-hidden="true">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      <div className="grid-overlay" />
    </div>
  );
}

/* ─── Animated counter ─── */
function AnimCounter({ end, duration = 1200 }) {
  const [val, setVal] = useState(0);
  const startRef = useRef(null);
  useEffect(() => {
    startRef.current = null;
    const step = (ts) => {
      if (startRef.current === null) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / duration, 1);
      setVal(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [end, duration]);
  return <span>{val}</span>;
}

/* ─── Progress Ring ─── */
function ProgressRing({ progress, size = 80, stroke = 5, color = "#3b82f6" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg width={size} height={size} className="progress-ring">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)" }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        fill="#e2e5ef" fontSize={size * 0.22} fontWeight="700" fontFamily="Inter">
        {Math.round(progress)}%
      </text>
    </svg>
  );
}

/* ─── Sparkline ─── */
function Sparkline({ data, color = "#3b82f6", width = 120, height = 32 }) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`).join(" ");
  const gradId = `spark-${color.replace("#", "")}`;
  return (
    <svg width={width} height={height} className="sparkline">
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={pts} strokeLinecap="round" strokeLinejoin="round" />
      <polyline fill={`url(#${gradId})`} stroke="none" points={`0,${height} ${pts} ${width},${height}`} />
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─── Time-based greeting ─── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

/* ─── Dashboard ─── */
function Dashboard({ onSelectCourse }) {
  const [hoveredCard, setHoveredCard] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  // Live, per-user state pulled from localStorage.
  const [userName, setUserNameState] = useState(() => getUserName());
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(userName);
  const [summaries, setSummaries] = useState(() => loadAllSummaries());
  const [streak, setStreak] = useState(() => currentStreak());
  const [activity, setActivity] = useState(() => weeklyActivity());
  const [itemsDone, setItemsDone] = useState(() => totalItemsCompleted());
  const [overallProgress, setOverallProgress] = useState(() => overallProgressPct());

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  // Refresh whenever progress changes (toggles in any course, name edits,
  // cross-tab storage events).
  useEffect(() => {
    const refresh = () => {
      setUserNameState(getUserName());
      setSummaries(loadAllSummaries());
      setStreak(currentStreak());
      setActivity(weeklyActivity());
      setItemsDone(totalItemsCompleted());
      setOverallProgress(overallProgressPct());
    };
    refresh();
    return onProgressChange(refresh);
  }, []);

  const commitName = () => {
    setUserName(nameDraft);
    setUserNameState(getUserName());
    setEditingName(false);
  };

  const handleMouseMove = (e, id) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setHoveredCard(id);
  };

  const coursesActive = ["dsa", "ml", "sd"].filter(
    (id) => (summaries[id]?.done || 0) > 0
  ).length;
  const weeklyMax = Math.max(...activity, 1);
  const todayDate = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className={`dashboard ${mounted ? "dash-mounted" : ""}`}>
      {/* Hero */}
      <div className="dash-hero">
        <div className="dash-hero-content">
          <div className="dash-greeting-badge">
            <span className="dash-pulse" />
            <span>Active Session</span>
          </div>
          <h1 className="dash-title">
            {editingName ? (
              <span className="dash-title-line dash-name-edit">
                {getGreeting()},{" "}
                <input
                  className="dash-name-input"
                  autoFocus
                  value={nameDraft}
                  placeholder="your name"
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitName();
                    if (e.key === "Escape") { setNameDraft(userName); setEditingName(false); }
                  }}
                  onBlur={commitName}
                />
              </span>
            ) : (
              <span
                className="dash-title-line dash-title-clickable"
                onClick={() => { setNameDraft(userName); setEditingName(true); }}
                title="Click to set your name"
              >
                {getGreeting()}{userName ? `, ${userName}` : ", learner"}
                <span className="dash-name-edit-hint">✎</span>
              </span>
            )}
          </h1>
          <p className="dash-subtitle">
            Your principal-level interview prep across DSA, Machine Learning, and System Design.
            <br />
            <span className="dash-date">{todayDate}</span>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="dash-stats">
        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-body">
            <div className="stat-value"><AnimCounter end={streak} /></div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-body">
            <div className="stat-value"><AnimCounter end={overallProgress} />%</div>
            <div className="stat-label">Overall Progress</div>
          </div>
          <Sparkline data={activity} color="#3b82f6" />
        </div>
        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-body">
            <div className="stat-value"><AnimCounter end={coursesActive} /></div>
            <div className="stat-label">Courses Active</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-body">
            <div className="stat-value"><AnimCounter end={itemsDone} /></div>
            <div className="stat-label">Items Completed</div>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div className="dash-section-header">
        <h2 className="dash-section-title">Your Courses</h2>
        <span className="dash-section-badge">{COURSES.length} tracks</span>
      </div>
      <div className="dash-courses">
        {COURSES.map((c, idx) => {
          const s = summaries[c.id] || { done: 0, total: 0 };
          const pct = s.total > 0 ? Math.round((s.done / s.total) * 100) : 0;
          return (
          <button
            key={c.id}
            className="course-card"
            onClick={() => onSelectCourse(c.id)}
            onMouseMove={(e) => handleMouseMove(e, c.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              "--card-accent": c.accent,
              "--card-accent-rgb": c.accentRgb,
              "--delay": `${idx * 0.1}s`,
              ...(hoveredCard === c.id ? { "--mouse-x": `${mousePos.x}px`, "--mouse-y": `${mousePos.y}px` } : {}),
            }}
          >
            <div className="card-glow" />
            <div className="card-content">
              <div className="card-top">
                <span className="card-icon">{c.icon}</span>
                <span className="card-badge">{c.stats.items}</span>
              </div>
              <h3 className="card-title">{c.name}</h3>
              <p className="card-desc">{c.longDesc}</p>
              <div className="card-stats">
                <div className="card-stat">
                  <ProgressRing progress={pct} size={48} stroke={3} color={c.accent} />
                </div>
                <div className="card-meta">
                  <div className="card-meta-item"><span className="card-meta-val">{c.stats.problems}</span></div>
                  <div className="card-meta-item"><span className="card-meta-val">{c.stats.extras}</span></div>
                </div>
              </div>
              <div className="card-cta">
                <span>Continue Learning</span>
                <span className="card-arrow">→</span>
              </div>
            </div>
          </button>
          );
        })}
      </div>

      {/* Weekly Activity */}
      <div className="dash-section-header" style={{ marginTop: "48px" }}>
        <h2 className="dash-section-title">This Week</h2>
      </div>
      <div className="dash-activity">
        {(() => {
          // Build day labels matching the last 7 days returned by weeklyActivity()
          const labels = [];
          const today = new Date();
          for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(today.getDate() - i);
            labels.push(d.toLocaleDateString("en-US", { weekday: "short" }));
          }
          return labels.map((day, i) => (
            <div key={`${day}-${i}`} className="activity-day">
              <div className="activity-bar-wrap">
                <div className="activity-bar" style={{
                  height: `${(activity[i] / weeklyMax) * 100}%`,
                  background: activity[i] > weeklyMax * 0.6 ? "var(--accent-primary)" : "rgba(255,255,255,0.12)",
                  transitionDelay: `${i * 0.08}s`,
                }} />
              </div>
              <span className="activity-label">{day}</span>
            </div>
          ));
        })()}
      </div>

      {/* Footer */}
      <div className="dash-footer">
        <div className="dash-footer-brand">
          <span className="footer-logo">◆</span>
          <span>Field Notes</span>
        </div>
        <span className="dash-footer-dim">Principal / Staff Interview Prep</span>
      </div>
    </div>
  );
}

/* ─── Main App ─── */
export default function App() {
  const [activeCourse, setActiveCourse] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("app-theme") || "dark");

  const toggleTheme = () => {
    setTheme((t) => {
      const next = t === "dark" ? "light" : "dark";
      localStorage.setItem("app-theme", next);
      return next;
    });
  };

  useEffect(() => {
    document.body.style.background = theme === "dark" ? "#06080f" : "#f0f2f5";
    document.body.style.color = theme === "dark" ? "#e2e5ef" : "#1a1d24";
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{SHELL_CSS}</style>
      <div className={`shell ${theme}`}>
        <BackgroundOrbs />
        <header className={`shell-topbar ${scrolled ? "scrolled" : ""}`}>
          <button className="shell-brand" onClick={() => setActiveCourse(null)}>
            <span className="shell-logo">◆</span>
            <span className="shell-brand-text">
              <span className="shell-title">FIELD NOTES</span>
              <span className="shell-sub">interview prep hub</span>
            </span>
          </button>
          <div className="shell-right">
            <nav className="shell-nav">
              {COURSES.map((c) => (
                <button
                  key={c.id}
                  className={`shell-nav-btn ${activeCourse === c.id ? "active" : ""}`}
                  onClick={() => setActiveCourse(c.id)}
                  style={{ "--nav-accent": c.accent, "--nav-accent-rgb": c.accentRgb }}
                >
                  <span className="shell-nav-icon">{c.icon}</span>
                  <span className="shell-nav-label">{c.shortName}</span>
                </button>
              ))}
            </nav>
            <button className="theme-toggle" onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
              {theme === "dark" ? "☀️" : "🌙"}
            </button>
          </div>
        </header>
        <div className="shell-body">
          {activeCourse === null && <Dashboard onSelectCourse={setActiveCourse} />}
          {activeCourse === "dsa" && <DSAApp theme={theme} />}
          {activeCourse === "ml" && <MLApp theme={theme} />}
          {activeCourse === "sd" && <SDApp theme={theme} />}
        </div>
      </div>
    </>
  );
}

const SHELL_CSS = `
/* ═══ Design Tokens ═══ */
:root {
  --bg-base: #06080f;
  --bg-surface: rgba(255,255,255,0.03);
  --bg-surface-2: rgba(255,255,255,0.05);
  --bg-surface-3: rgba(255,255,255,0.08);
  --bg-glass: rgba(12,15,25,0.7);
  --border: rgba(255,255,255,0.06);
  --border-2: rgba(255,255,255,0.1);
  --border-3: rgba(255,255,255,0.15);
  --text-primary: #e2e5ef;
  --text-secondary: #8b90a0;
  --text-tertiary: #555a6e;
  --accent-primary: #3b82f6;
  --accent-green: #10b981;
  --accent-amber: #f59e0b;
  --accent-red: #ef4444;
  --glass-blur: blur(20px) saturate(180%);
  --sans: 'Inter', -apple-system, system-ui, sans-serif;
  --mono: 'JetBrains Mono', ui-monospace, monospace;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* ═══ Background Orbs ═══ */
.bg-orbs { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.orb { position: absolute; border-radius: 50%; filter: blur(120px); opacity: 0.12; animation: orb-drift 20s ease-in-out infinite; }
.orb-1 { width: 600px; height: 600px; top: -10%; left: -5%; background: radial-gradient(circle, #3b82f6, transparent 70%); animation-duration: 25s; }
.orb-2 { width: 500px; height: 500px; top: 40%; right: -10%; background: radial-gradient(circle, #10b981, transparent 70%); animation-duration: 30s; animation-delay: -5s; }
.orb-3 { width: 400px; height: 400px; bottom: -5%; left: 30%; background: radial-gradient(circle, #f59e0b, transparent 70%); animation-duration: 22s; animation-delay: -10s; }
@keyframes orb-drift {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(30px, -40px) scale(1.05); }
  50% { transform: translate(-20px, 20px) scale(0.95); }
  75% { transform: translate(15px, 30px) scale(1.02); }
}
.grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 80px 80px;
  mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 70%);
  -webkit-mask-image: radial-gradient(ellipse 60% 50% at 50% 50%, black 30%, transparent 70%);
}

/* ═══ Shell ═══ */
.shell { min-height: 100vh; display: flex; flex-direction: column; position: relative; }

.shell-topbar {
  display: flex; justify-content: space-between; align-items: center;
  padding: 0 32px; height: 64px;
  background: rgba(6,8,15,0.6); backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; z-index: 100; transition: all 0.3s ease;
}
.shell-topbar.scrolled { background: rgba(6,8,15,0.85); border-bottom-color: var(--border-2); box-shadow: 0 4px 30px rgba(0,0,0,0.3); }

.shell-brand { display: flex; align-items: center; gap: 12px; background: none; border: none; cursor: pointer; color: var(--text-primary); }
.shell-logo { font-size: 22px; color: var(--accent-primary); filter: drop-shadow(0 0 8px rgba(59,130,246,0.4)); }
.shell-brand-text { display: flex; flex-direction: column; }
.shell-title { font-family: var(--mono); font-size: 12px; font-weight: 700; letter-spacing: 0.2em; color: var(--text-primary); }
.shell-sub { font-size: 10px; font-weight: 400; color: var(--text-tertiary); letter-spacing: 0.05em; margin-top: 1px; }

.shell-nav { display: flex; gap: 2px; height: 100%; align-items: center; }
.shell-nav-btn {
  display: flex; align-items: center; gap: 8px;
  background: none; border: 1px solid transparent; color: var(--text-secondary);
  padding: 8px 16px; border-radius: 8px; cursor: pointer;
  font-family: var(--mono); font-size: 12px; font-weight: 500;
  letter-spacing: 0.04em; transition: all 0.2s;
}
.shell-nav-btn:hover { color: var(--text-primary); background: var(--bg-surface-2); border-color: var(--border); }
.shell-nav-btn.active {
  color: var(--nav-accent, var(--accent-primary));
  background: rgba(var(--nav-accent-rgb, 59,130,246), 0.08);
  border-color: rgba(var(--nav-accent-rgb, 59,130,246), 0.2);
  font-weight: 600;
}
.shell-nav-icon { font-size: 14px; }
.shell-nav-label { white-space: nowrap; }

.shell-body { flex: 1; position: relative; z-index: 1; }

/* ═══ Dashboard ═══ */
.dashboard {
  max-width: 1100px; margin: 0 auto; padding: 48px 40px 80px; width: 100%;
  opacity: 0; transform: translateY(12px); transition: all 0.6s var(--ease-out);
}
.dashboard.dash-mounted { opacity: 1; transform: translateY(0); }

.dash-hero { margin-bottom: 48px; }
.dash-hero-content { max-width: 640px; }
.dash-greeting-badge {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 6px 14px; border-radius: 20px;
  background: rgba(59,130,246,0.08); border: 1px solid rgba(59,130,246,0.15);
  font-family: var(--mono); font-size: 11px; font-weight: 500;
  color: var(--accent-primary); margin-bottom: 20px; letter-spacing: 0.04em;
}
.dash-pulse {
  width: 6px; height: 6px; border-radius: 50%; background: #10b981;
  box-shadow: 0 0 8px rgba(16,185,129,0.6); animation: pulse 2s infinite;
}
@keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }

.dash-title { font-size: 48px; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; margin-bottom: 16px; }
.dash-title-line {
  background: linear-gradient(135deg, #e2e5ef 0%, #8b90a0 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.dash-subtitle { font-size: 16px; color: var(--text-secondary); line-height: 1.7; max-width: 520px; }
.dash-title-clickable { cursor: pointer; display: inline-flex; align-items: center; gap: 12px; }
.dash-title-clickable:hover .dash-name-edit-hint { opacity: 1; transform: translateX(0); }
.dash-name-edit-hint {
  font-size: 18px; color: var(--text-tertiary); opacity: 0; transform: translateX(-6px);
  transition: opacity 0.2s ease, transform 0.2s ease; -webkit-text-fill-color: var(--text-tertiary);
}
.dash-name-edit { display: inline-flex; align-items: baseline; gap: 8px; }
.dash-name-input {
  font: inherit; font-size: 48px; font-weight: 800; letter-spacing: -0.03em;
  background: transparent; border: none; outline: none;
  border-bottom: 2px dashed rgba(255,255,255,0.18);
  color: var(--text-primary); -webkit-text-fill-color: var(--text-primary);
  padding: 0 4px; min-width: 240px; max-width: 420px;
}
.dash-name-input:focus { border-bottom-color: var(--accent-primary); }
.dash-date { font-family: var(--mono); font-size: 12px; color: var(--text-tertiary); letter-spacing: 0.02em; }

.dash-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 48px; }
.stat-card {
  display: flex; align-items: center; gap: 14px; padding: 20px; border-radius: 16px;
  background: var(--bg-surface); border: 1px solid var(--border);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  transition: all 0.25s ease;
}
.stat-card:hover { background: var(--bg-surface-2); border-color: var(--border-2); transform: translateY(-2px); }
.stat-icon { font-size: 28px; flex-shrink: 0; }
.stat-body { flex: 1; }
.stat-value { font-size: 24px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.stat-label { font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); letter-spacing: 0.04em; margin-top: 2px; }
.sparkline { flex-shrink: 0; }

.dash-section-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.dash-section-title { font-size: 20px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
.dash-section-badge {
  font-family: var(--mono); font-size: 11px; color: var(--text-tertiary);
  padding: 4px 10px; border-radius: 6px; background: var(--bg-surface-2); border: 1px solid var(--border);
}

.dash-courses { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
.course-card {
  position: relative; text-align: left; cursor: pointer;
  padding: 28px; border-radius: 20px; overflow: hidden;
  background: var(--bg-surface); border: 1px solid var(--border);
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
  transition: all 0.35s var(--ease-out);
  animation: card-in 0.6s var(--ease-out) backwards; animation-delay: var(--delay);
}
@keyframes card-in { from { opacity: 0; transform: translateY(20px) scale(0.97); } }
.course-card:hover {
  border-color: rgba(var(--card-accent-rgb), 0.25); transform: translateY(-4px);
  box-shadow: 0 20px 60px -15px rgba(var(--card-accent-rgb), 0.15), 0 0 0 1px rgba(var(--card-accent-rgb), 0.1);
}
.card-glow {
  position: absolute; inset: 0; opacity: 0; transition: opacity 0.35s;
  background: radial-gradient(400px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(var(--card-accent-rgb), 0.06), transparent 60%);
  pointer-events: none;
}
.course-card:hover .card-glow { opacity: 1; }
.card-content { position: relative; z-index: 1; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
.card-icon { font-size: 28px; color: var(--card-accent); filter: drop-shadow(0 0 12px rgba(var(--card-accent-rgb), 0.4)); }
.card-badge {
  font-family: var(--mono); font-size: 10px; font-weight: 600; color: var(--card-accent);
  padding: 4px 10px; border-radius: 6px; background: rgba(var(--card-accent-rgb), 0.08);
  border: 1px solid rgba(var(--card-accent-rgb), 0.15); letter-spacing: 0.04em;
}
.card-title { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; margin-bottom: 10px; }
.card-desc {
  font-size: 13px; color: var(--text-secondary); line-height: 1.65; margin-bottom: 20px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.card-stats {
  display: flex; align-items: center; gap: 16px; margin-bottom: 20px;
  padding-bottom: 20px; border-bottom: 1px solid var(--border);
}
.card-meta { display: flex; flex-direction: column; gap: 6px; }
.card-meta-item { display: flex; align-items: center; gap: 6px; }
.card-meta-val { font-family: var(--mono); font-size: 11px; color: var(--text-secondary); font-weight: 500; }
.card-cta { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: var(--card-accent); letter-spacing: 0.02em; }
.card-arrow { font-size: 18px; transition: transform 0.25s var(--ease-spring); }
.course-card:hover .card-arrow { transform: translateX(4px); }

.dash-activity {
  display: flex; gap: 8px; align-items: flex-end; padding: 24px 20px;
  border-radius: 16px; background: var(--bg-surface); border: 1px solid var(--border); height: 160px;
}
.activity-day { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; height: 100%; }
.activity-bar-wrap { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
.activity-bar { width: 100%; max-width: 36px; border-radius: 6px 6px 2px 2px; transition: height 0.8s var(--ease-out); min-height: 4px; }
.activity-label { font-family: var(--mono); font-size: 10px; color: var(--text-tertiary); letter-spacing: 0.04em; }

.dash-footer {
  margin-top: 64px; padding-top: 24px; border-top: 1px solid var(--border);
  display: flex; justify-content: space-between; align-items: center;
}
.dash-footer-brand {
  display: flex; align-items: center; gap: 8px;
  font-family: var(--mono); font-size: 12px; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.08em;
}
.footer-logo { color: var(--accent-primary); filter: drop-shadow(0 0 6px rgba(59,130,246,0.4)); }
.dash-footer-dim { font-family: var(--mono); font-size: 11px; color: var(--text-tertiary); }

.progress-ring { display: block; }

.shell-right { display: flex; align-items: center; gap: 8px; height: 100%; }

.theme-toggle {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px; border: 1px solid var(--border);
  background: var(--bg-surface); color: var(--text-primary);
  cursor: pointer; font-size: 16px; transition: all 0.25s ease;
  backdrop-filter: var(--glass-blur); -webkit-backdrop-filter: var(--glass-blur);
}
.theme-toggle:hover { background: var(--bg-surface-2); border-color: var(--border-2); transform: scale(1.08); }

@media (max-width: 1024px) {
  .dash-courses { grid-template-columns: 1fr 1fr; }
  .dash-stats { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .shell-topbar { padding: 0 16px; }
  .shell-nav-label { display: none; }
  .shell-nav-btn { padding: 8px 12px; }
  .dashboard { padding: 32px 20px 60px; }
  .dash-title { font-size: 32px; }
  .dash-subtitle { font-size: 14px; }
  .dash-courses { grid-template-columns: 1fr; }
  .dash-stats { grid-template-columns: 1fr 1fr; }
  .course-card { padding: 20px; }
  .card-title { font-size: 18px; }
}
@media (max-width: 480px) { .dash-stats { grid-template-columns: 1fr; } }

/* ═══ Light Theme ═══ */
.shell.light {
  --bg-base: #f0f2f5;
  --bg-surface: rgba(255,255,255,0.7);
  --bg-surface-2: rgba(255,255,255,0.85);
  --bg-surface-3: rgba(255,255,255,0.95);
  --bg-glass: rgba(240,242,245,0.8);
  --border: rgba(0,0,0,0.08);
  --border-2: rgba(0,0,0,0.12);
  --border-3: rgba(0,0,0,0.18);
  --text-primary: #1a1d24;
  --text-secondary: #5a6070;
  --text-tertiary: #8890a0;
  --accent-primary: #2563eb;
  --accent-green: #059669;
  --accent-amber: #d97706;
  --accent-red: #dc2626;
}
.shell.light .bg-orbs { display: none; }
.shell.light .grid-overlay { display: none; }
.shell.light .shell-topbar { background: rgba(240,242,245,0.8); }
.shell.light .shell-topbar.scrolled { background: rgba(240,242,245,0.95); box-shadow: 0 2px 20px rgba(0,0,0,0.06); }
.shell.light .shell-logo { color: var(--accent-primary); filter: drop-shadow(0 0 6px rgba(37,99,235,0.3)); }
.shell.light .dash-title-line {
  background: linear-gradient(135deg, #1a1d24 0%, #5a6070 100%);
  -webkit-background-clip: text; background-clip: text;
}
.shell.light .stat-card { background: rgba(255,255,255,0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.shell.light .course-card { background: rgba(255,255,255,0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.shell.light .dash-activity { background: rgba(255,255,255,0.8); box-shadow: 0 1px 3px rgba(0,0,0,0.04); }
.shell.light .footer-logo { filter: drop-shadow(0 0 4px rgba(37,99,235,0.2)); }
`;
