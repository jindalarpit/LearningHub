// ─── Shared per-user progress store ───────────────────────────────────────
// Backed by localStorage so each individual (browser/profile) gets their
// own learner identity, course progress, and activity history.

const NAME_KEY = "learninghub.userName";
const ACTIVITY_KEY = "learninghub.activity";
const COURSE_PROGRESS_PREFIX = "learninghub.course.";   // per-course state dict
const COURSE_SUMMARY_PREFIX = "learninghub.summary.";   // per-course {done,total}

// ── Helpers ──────────────────────────────────────────────────────────────
function safeRead(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota errors */
  }
}

function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// ── User name ────────────────────────────────────────────────────────────
export function getUserName() {
  try {
    return localStorage.getItem(NAME_KEY) || "";
  } catch {
    return "";
  }
}

export function setUserName(name) {
  try {
    const trimmed = (name || "").trim();
    if (trimmed) localStorage.setItem(NAME_KEY, trimmed);
    else localStorage.removeItem(NAME_KEY);
    notifyChange();
  } catch {
    /* ignore */
  }
}

// ── Per-course progress dictionary (e.g. { "pat::0": true, ... }) ────────
export function loadCourseProgress(courseId) {
  return safeRead(COURSE_PROGRESS_PREFIX + courseId, {});
}

export function saveCourseProgress(courseId, progressDict) {
  safeWrite(COURSE_PROGRESS_PREFIX + courseId, progressDict || {});
  notifyChange();
}

// ── Per-course summary { done, total } shown on dashboard ────────────────
export function saveCourseSummary(courseId, summary) {
  safeWrite(COURSE_SUMMARY_PREFIX + courseId, {
    done: Number(summary?.done) || 0,
    total: Number(summary?.total) || 0,
  });
  notifyChange();
}

export function loadCourseSummary(courseId) {
  return safeRead(COURSE_SUMMARY_PREFIX + courseId, { done: 0, total: 0 });
}

export function loadAllSummaries() {
  return {
    dsa: loadCourseSummary("dsa"),
    ml: loadCourseSummary("ml"),
    sd: loadCourseSummary("sd"),
  };
}

// ── Activity log: { "YYYY-MM-DD": count } ────────────────────────────────
export function recordActivity(amount = 1) {
  const log = safeRead(ACTIVITY_KEY, {});
  const k = todayKey();
  log[k] = (log[k] || 0) + amount;
  safeWrite(ACTIVITY_KEY, log);
  notifyChange();
}

export function loadActivity() {
  return safeRead(ACTIVITY_KEY, {});
}

// Last 7 calendar days (Mon..Sun based on today's locale week) — simple
// approach: return last 7 days ending today, oldest first.
export function weeklyActivity() {
  const log = loadActivity();
  const out = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    out.push(log[todayKey(d)] || 0);
  }
  return out;
}

// Streak = consecutive days ending today (or yesterday if nothing today)
// that have any activity logged.
export function currentStreak() {
  const log = loadActivity();
  let streak = 0;
  const d = new Date();
  // If nothing today, start counting from yesterday so streak doesn't break
  // until a full day of inactivity passes.
  if (!log[todayKey(d)]) d.setDate(d.getDate() - 1);
  while (log[todayKey(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function totalItemsCompleted() {
  const sums = loadAllSummaries();
  return (sums.dsa.done || 0) + (sums.ml.done || 0) + (sums.sd.done || 0);
}

export function overallProgressPct() {
  const sums = loadAllSummaries();
  const done = (sums.dsa.done || 0) + (sums.ml.done || 0) + (sums.sd.done || 0);
  const total = (sums.dsa.total || 0) + (sums.ml.total || 0) + (sums.sd.total || 0);
  if (!total) return 0;
  return Math.round((done / total) * 100);
}

// ── Change notification (so the dashboard refreshes live) ────────────────
const CHANGE_EVENT = "learninghub:progress-change";

function notifyChange() {
  try {
    window.dispatchEvent(new CustomEvent(CHANGE_EVENT));
  } catch {
    /* SSR / non-browser */
  }
}

export function onProgressChange(handler) {
  const wrapped = () => handler();
  window.addEventListener(CHANGE_EVENT, wrapped);
  window.addEventListener("storage", wrapped);
  return () => {
    window.removeEventListener(CHANGE_EVENT, wrapped);
    window.removeEventListener("storage", wrapped);
  };
}
