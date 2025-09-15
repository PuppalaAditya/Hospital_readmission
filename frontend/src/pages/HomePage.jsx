// src/pages/HomePage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useAnimation, useViewportScroll, useTransform, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

/**
 * HomePage.jsx
 * - Light theme, Trae.ai-like feel: moving gradient hero, parallax layers, pinned sections, animated cards.
 * - Requirements: Tailwind CSS + framer-motion + sonner
 *
 * Paste into src/pages/HomePage.jsx and include in your router.
 * This file intentionally has no header/footer imports (per your request).
 */

export default function HomePage({ user = null }) {
  const navigate = useNavigate?.() || (() => {});
  const API_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:8000";
  const [status, setStatus] = useState("checking...");
  const controls = useAnimation();
  const heroRef = useRef(null);
  const blobRef = useRef(null);
  const { scrollY } = useViewportScroll();

  // reactive transforms used for subtle parallax & depth
  const parallax = useTransform(scrollY, [0, 1000], [0, -120]); // used for hero image translation
  const rotateHero = useTransform(scrollY, [0, 800], [0, 6]); // small rotation

  // quick health-check (non-blocking)
  useEffect(() => {
    let mounted = true;
    fetch(`${API_URL.replace(/\/$/, "")}/health`, { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => mounted && setStatus(d?.status || "ok"))
      .catch(() => mounted && setStatus("down"));
    return () => (mounted = false);
  }, [API_URL]);

  // welcome toast if user provided
  useEffect(() => {
    if (user && toast?.success) {
      toast.success("Welcome back — open the dashboard to run predictions!", { duration: 3000 });
    }
  }, [user]);

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  // Small accessibility: reduce motion preference detection
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = () => setReduceMotion(mq.matches);
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  // page-level motion variants (re-used)
  const fadeUp = { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } };
  const subtle = { hidden: { opacity: 0 }, visible: { opacity: 1 } };

  return (
    <div className="min-h-screen relative bg-white text-slate-900 antialiased overflow-x-hidden">
      {/* ------------------------------- */}
      {/* Animated background (gradient + blobs) */}
      {/* ------------------------------- */}
      <div aria-hidden className="absolute inset-0 -z-50">
        {/* moving gradient base */}
        <div className="absolute inset-0 animated-gradient" />

        {/* large slow blobs */}
        <motion.div
          ref={blobRef}
          style={{ translateY: parallax }}
          className="absolute -left-40 -top-24 w-[720px] h-[720px] rounded-full opacity-60 blur-3xl pointer-events-none"
        >
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <defs>
              <linearGradient id="bgg1" x1="0" x2="1">
                <stop offset="0" stopColor="#7c3aed" stopOpacity="0.12" />
                <stop offset="1" stopColor="#06b6d4" stopOpacity="0.10" />
              </linearGradient>
            </defs>
            <rect width="100%" height="100%" rx="360" fill="url(#bgg1)" />
          </svg>
        </motion.div>

        <motion.div className="absolute right-[-120px] top-40 w-[540px] h-[540px] rounded-full opacity-50 blur-3xl pointer-events-none" animate={{ y: [0, -12, 0] }} transition={{ duration: 10, repeat: Infinity }}>
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <defs><linearGradient id="bgg2" x1="0" x2="1"><stop offset="0" stopColor="#06b6d4" stopOpacity="0.10"/><stop offset="1" stopColor="#f472b6" stopOpacity="0.08"/></linearGradient></defs>
            <rect width="100%" height="100%" rx="360" fill="url(#bgg2)" />
          </svg>
        </motion.div>

        <motion.div className="absolute left-10 bottom-[-120px] w-[360px] h-[360px] rounded-full opacity-40 blur-2xl pointer-events-none" animate={{ y: [0, -8, 0] }} transition={{ duration: 9, repeat: Infinity }}>
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <defs><linearGradient id="bgg3" x1="0" x2="1"><stop offset="0" stopColor="#60a5fa" stopOpacity="0.08"/><stop offset="1" stopColor="#a78bfa" stopOpacity="0.06"/></linearGradient></defs>
            <rect width="100%" height="100%" rx="360" fill="url(#bgg3)" />
          </svg>
        </motion.div>
      </div>

      {/* ------------------------------- */}
      {/* HERO (top bar inside page, no header global) */}
      {/* ------------------------------- */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
            </div>

            <div className="flex items-center gap-3">
              {/* small status chip */}
              <div className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                API: {status}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* HERO CONTENT */}
        <section ref={heroRef} className="min-h-[72vh] flex items-center">
          <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left column */}
              <div className="lg:col-span-6">
                <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="text-4xl md:text-5xl font-extrabold leading-tight">
                  Predict & prevent hospital readmissions — <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-cyan-400 to-rose-400">explainably</span>
                </motion.h1>

                <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="mt-6 text-lg text-slate-700 max-w-xl">
                  ReadmitAI converts EHR extracts into clinically meaningful signals, uses robust tree-based ensembles, and surfaces SHAP explanations so clinicians see exactly why a patient is flagged.
                </motion.p>

                <motion.div className="mt-8 flex flex-wrap gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
                  <button onClick={() => (user ? navigate("/dashboard") : navigate("/sign-up"))} className="rounded-full px-6 py-3 bg-indigo-600 text-white font-semibold shadow hover:scale-[1.02] transform transition">Get started</button>
                  <button onClick={() => document.getElementById("architecture")?.scrollIntoView({ behavior: "smooth" })} className="rounded-full px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 transition">How it works</button>
                </motion.div>

                <motion.div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
                  <div className="inline-flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full shadow-sm border">⚡ Low-latency</div>
                  <div className="inline-flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full shadow-sm border">🔍 SHAP explainability</div>
                  <div className="inline-flex items-center gap-2 bg-white/80 px-3 py-1 rounded-full shadow-sm border">🛡️ Secure & auditable</div>
                </motion.div>
              </div>

              {/* Right column: animated composition */}
              <div className="lg:col-span-6 relative">
                <motion.div style={{ rotate: rotateHero }} animate={{ y: parallax }} transition={{ type: "spring", damping: 18, stiffness: 70 }} className="relative">
                  {/* stacked glass cards */}
                  <div className="absolute -right-6 -top-12 w-[420px] h-[280px] rounded-2xl bg-white/70 backdrop-blur-sm border border-white/40 shadow-lg p-5 transform-gpu">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Readmission snapshot</div>
                      <div className="text-xs text-slate-500">v1.0</div>
                    </div>

                    <div className="mt-4 space-y-4">
                      <ProgressRow label="Low" pct={22} color="bg-emerald-400" />
                      <ProgressRow label="Medium" pct={48} color="bg-amber-400" />
                      <ProgressRow label="High" pct={30} color="bg-rose-400" />
                    </div>

                    <div className="mt-4 flex gap-3">
                      <MiniAvatar emoji="🧑‍⚕️" />
                      <MiniAvatar emoji="👩‍⚕️" />
                      <MiniAvatar emoji="🩺" />
                      <MiniAvatar emoji="🏥" />
                    </div>
                  </div>

                  <div className="absolute -left-6 bottom-6 w-[360px] h-[300px] rounded-2xl bg-gradient-to-tr from-white via-slate-50 to-white/90 border border-white/30 shadow-xl p-6 transform-gpu">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">Model performance</div>
                      <div className="text-xs text-slate-500">simulated</div>
                    </div>
                    <div className="mt-4">
                      <SmallBar name="XGBoost" value={89} color="bg-amber-400" delay={0.1} />
                      <SmallBar name="LightGBM" value={87} color="bg-indigo-400" delay={0.28} />
                      <SmallBar name="RandomForest" value={85} color="bg-emerald-400" delay={0.46} />
                    </div>
                    <div className="mt-6 flex items-center justify-center">
                      <Donut percent={67} />
                    </div>
                  </div>

                  {/* floating 3D emoji ring */}
                  <div className="absolute -right-20 top-36 w-40 h-40 rounded-full flex items-center justify-center">
                    <AnimatedEmojiRing />
                  </div>

                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------ */}
        {/* HOW IT WORKS — step-by-step (explicit content requested) */}
        {/* ------------------------------ */}
        <section id="how-it-works" className="mt-16 py-16 bg-white/80 rounded-2xl p-8 shadow-inner">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-6">
            <motion.h2 variants={fadeUp} className="text-3xl font-bold text-slate-900 text-center">How it works — step-by-step</motion.h2>

            <motion.p variants={fadeUp} className="max-w-4xl mx-auto text-slate-700 text-center">
              ReadmitAI converts EHR extracts into clinically meaningful signals, uses robust tree-based ensembles,
              and surfaces SHAP explanations so clinicians see exactly why a patient is flagged.
            </motion.p>

            <div className="mt-8 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-white shadow border">
                <h4 className="font-semibold">• Data ingestion & cleaning</h4>
                <p className="text-sm mt-2 text-slate-700">EHR extracts, labs, meds; normalization, imputation, rolling trends and derived clinical signals.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-white shadow border">
                <h4 className="font-semibold">• Feature engineering</h4>
                <p className="text-sm mt-2 text-slate-700">ColumnTransformer pipelines, target encodings, temporal bucketing, comorbidity indices.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-white shadow border">
                <h4 className="font-semibold">• Modeling & evaluation</h4>
                <p className="text-sm mt-2 text-slate-700">XGBoost/LightGBM/RandomForest + stacking. Hyperparameter search & threshold tuning for clinical recall.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-white shadow border">
                <h4 className="font-semibold">• Explainability (SHAP)</h4>
                <p className="text-sm mt-2 text-slate-700">TreeExplainer + per-prediction narratives highlighting top drivers.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-white shadow border">
                <h4 className="font-semibold">• Serving (FastAPI)</h4>
                <p className="text-sm mt-2 text-slate-700">Low-latency /predict with joblib artifact loading and optional Redis caching.</p>
              </motion.div>

              <motion.div variants={fadeUp} className="rounded-2xl p-5 bg-white shadow border">
                <h4 className="font-semibold">• UX & Integration</h4>
                <p className="text-sm mt-2 text-slate-700">Interactive dashboard with risk, drivers and suggested clinical actions; SSO & audit logs supported.</p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ------------------------------ */}
        {/* Architecture area (animated connectors) */}
        {/* ------------------------------ */}
        <section id="architecture" className="mt-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.h2 initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="text-3xl font-bold text-center mb-8">System architecture — end-to-end</motion.h2>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow border">
              <AnimatedArchitectureLarge />
            </motion.div>
          </div>
        </section>

        {/* ------------------------------ */}
        {/* Technology stack — logos + animated cards */}
        {/* ------------------------------ */}
        <section className="mt-20">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <motion.h3 initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} className="text-2xl font-bold text-center">Technology stack</motion.h3>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <StackCard title="Frontend" items={[
                {name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg"},
                {name: "Vite", logo: "https://vitejs.dev/logo.svg"},
                {name: "Tailwind", logo: "https://www.vectorlogo.zone/logos/tailwindcss/tailwindcss-icon.svg"},
                {name: "Framer Motion", emoji: "✨"},
              ]}/>
              <StackCard title="Backend" items={[
                {name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg"},
                {name: "FastAPI", logo: "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"},
                {name: "Uvicorn", emoji: "🛰️"},
                {name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg"},
                {name: "Postgres", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg"},
              ]}/>
              <StackCard title="Machine Learning" items={[
                {name: "scikit-learn", logo: "https://upload.wikimedia.org/wikipedia/commons/0/05/Scikit_learn_logo_small.svg"},
                {name: "XGBoost / LightGBM", emoji: "🌲"},
                {name: "SHAP", emoji: "🔬"},
                {name: "pandas / numpy", emoji: "🧮"},
                {name: "Optuna", emoji: "🎯"},
                {name: "joblib", emoji: "🧾"},
              ]}/>
            </div>

            {/* Detailed ML breakdown (verbatim and crisp) */}
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="mt-8 bg-white rounded-xl p-6 shadow border">
              <h4 className="font-semibold text-slate-900">Machine Learning — detailed breakdown</h4>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
                <div>
                  <h5 className="font-semibold">Models & Ensembling</h5>
                  <p className="mt-2 text-sm">
                    Primary models are tree-based (XGBoost/LightGBM/RandomForest) because of their strong performance on tabular clinical data.
                    We ensemble with stacking (logistic meta-learner) to improve calibration and robustness.
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>Hyperparameter search (Optuna / hyperopt)</li>
                    <li>Class-weighting and SMOTE experiments for imbalance</li>
                    <li>Calibration (Platt scaling / isotonic)</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold">Feature Engineering & Pipelines</h5>
                  <p className="mt-2 text-sm">
                    Pipelines use scikit-learn ColumnTransformer to apply appropriate transforms per column group. Derived features include rolling means, deltas, medication counts, comorbidity scores and severity flags.
                  </p>
                  <ul className="list-disc list-inside mt-2 text-sm space-y-1">
                    <li>Numeric scaling (RobustScaler)</li>
                    <li>Categorical encoding (Target / OneHot)</li>
                    <li>Missing-value indicators & simple imputation</li>
                  </ul>
                </div>

                <div>
                  <h5 className="font-semibold">Explainability (SHAP)</h5>
                  <p className="mt-2 text-sm">
                    Use TreeExplainer for fast SHAP values on tree models; compute top-K contributors per prediction and synthesize a short clinical narrative (e.g., "High # medications and recent ER visits increased risk").
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold">Deployment & Monitoring</h5>
                  <p className="mt-2 text-sm">
                    Model artifacts stored as joblib in Blob Storage. FastAPI loads models and SHAP explainers at startup. We log predictions for monitoring, compute data drift metrics, and raise alerts for model performance degradation.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* final CTA */}
        <section className="mt-20 pb-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-600 to-cyan-400 p-8 rounded-3xl text-white shadow-lg text-center">
              <h3 className="text-2xl font-bold">Ready to reduce readmissions with explainable ML?</h3>
              <p className="mt-3 text-sm max-w-2xl mx-auto">Sign up to test with demo data or connect your EHR for a PoC.</p>
              <div className="mt-6 flex justify-center gap-4">
                <button onClick={() => (user ? navigate("/dashboard") : navigate("/sign-up"))} className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold">Get Started</button>
                <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="px-6 py-3 rounded-xl border border-white/30 text-white">Back to top</button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Local CSS to tune visuals (Tailwind covers most) */}
      <style>{`
        /* animated gradient shifting background */
        .animated-gradient {
          background: linear-gradient(120deg, rgba(255,255,255,0.95) 0%, rgba(249,250,251,0.96) 10%, rgba(99,102,241,0.03) 40%, rgba(6,182,212,0.03) 70%, #ffffff 100%);
          background-size: 300% 300%;
          animation: gradientShift 14s ease-in-out infinite;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          25% { background-position: 50% 75%; }
          50% { background-position: 100% 50%; }
          75% { background-position: 50% 25%; }
          100% { background-position: 0% 50%; }
        }

        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }

        /* small responsive adjustments */
        @media (max-width: 1024px) {
          .-right-6 { right: 0 !important; left: auto !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ------------------- Helper UI pieces ------------------- */

function ProgressRow({ label, pct, color = "bg-emerald-400" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-14 text-sm text-slate-700">{label}</div>
      <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} transition={{ duration: 1 }} className={`${color} h-2 rounded-full`} />
      </div>
      <div className="w-10 text-right text-xs text-slate-700">{pct}%</div>
    </div>
  );
}

function MiniAvatar({ emoji = "🩺" }) {
  return (
    <div className="w-9 h-9 rounded-md bg-white border flex items-center justify-center shadow text-lg">
      <span>{emoji}</span>
    </div>
  );
}

function SmallBar({ name, value = 80, color = "bg-indigo-400", delay = 0 }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-20 text-sm">{name}</div>
      <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${value}%` }} transition={{ duration: 1.1, delay }} className={`${color} h-3 rounded-full`} />
      </div>
      <div className="w-10 text-right text-sm">{value}%</div>
    </div>
  );
}

function Donut({ percent = 67 }) {
  const dash = `${percent} ${100 - percent}`;
  return (
    <svg width="84" height="84" viewBox="0 0 36 36">
      <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#e6e9ee" strokeWidth="3.6" />
      <motion.path initial={{ strokeDasharray: "0 100" }} whileInView={{ strokeDasharray: dash }} transition={{ duration: 1.1 }} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" stroke="#06b6d4" strokeWidth="3.6" strokeLinecap="round" fill="none" />
      <text x="18" y="20.2" textAnchor="middle" fontSize="5.2" fill="#0f172a">{percent}%</text>
    </svg>
  );
}

/* small animated ring of emojis (3D-ish tilt) */
function AnimatedEmojiRing() {
  const emojis = ["🧑‍⚕️", "👩‍⚕️", "🩺", "🏥", "📊", "🧾", "🔬"];
  return (
    <div className="relative w-40 h-40 rounded-full flex items-center justify-center">
      <motion.div className="absolute inset-0 rounded-full flex items-center justify-center" animate={{ rotate: [0, 360] }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}>
        {emojis.map((e, i) => {
          const angle = (i / emojis.length) * Math.PI * 2;
          const x = Math.cos(angle) * 68;
          const y = Math.sin(angle) * 68;
          return (
            <motion.div key={i} style={{ left: 70 + x, top: 70 + y }} className="absolute w-10 h-10 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border shadow flex items-center justify-center" whileHover={{ scale: 1.12, rotateY: 12 }} transition={{ type: "spring", stiffness: 250 }}>
              <span style={{ fontSize: 20 }}>{e}</span>
            </motion.div>
          );
        })}
      </motion.div>

      {/* concentric rings decorative */}
      <svg width="160" height="160" viewBox="0 0 160 160" className="absolute">
        <circle cx="80" cy="80" r="60" stroke="#e6eef9" strokeWidth="2" fill="none"/>
        <circle cx="80" cy="80" r="44" stroke="#f0f9ff" strokeWidth="1.5" fill="none"/>
      </svg>
    </div>
  );
}

/* info card used in "What we built" */
function InfoCard({ title, subtitle, icon = "📦" }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-2xl p-5 bg-white shadow border text-slate-800">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-lg bg-slate-50 flex items-center justify-center text-xl">{icon}</div>
        <div>
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-slate-600">{subtitle}</div>
        </div>
      </div>
    </motion.div>
  );
}

/* Stack card with logos/emoji */
function StackCard({ title, items = [] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl p-4 bg-white shadow border">
      <div className="font-semibold">{title}</div>
      <div className="mt-3 grid grid-cols-1 gap-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 transition">
            {it.logo ? (<img src={it.logo} alt={it.name} className="w-7 h-7 object-contain" />) : (<div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-sm">{it.emoji || "🔧"}</div>)}
            <div className="text-sm text-slate-800">{it.name}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* large animated architecture viz */
function AnimatedArchitectureLarge() {
  return (
    <div className="overflow-x-auto">
      <svg viewBox="0 0 1000 420" className="w-full h-[360px]">
        {/* Nodes */}
        <g>
          <rect x="40" y="40" rx="12" width="200" height="90" fill="#eef2ff" stroke="#c7d2fe" />
          <text x="140" y="90" textAnchor="middle" fill="#4c1d95" fontWeight="700">Data Ingest</text>

          <rect x="320" y="40" rx="12" width="260" height="90" fill="#ecfeff" stroke="#99f6e4" />
          <text x="450" y="90" textAnchor="middle" fill="#065f46" fontWeight="700">Preprocess & Feature Engineering</text>

          <rect x="640" y="40" rx="12" width="260" height="90" fill="#fff7ed" stroke="#fb923c" />
          <text x="770" y="90" textAnchor="middle" fill="#9a3412" fontWeight="700">Model Training (CV + tuning)</text>

          <rect x="320" y="220" rx="12" width="260" height="90" fill="#f0fdf4" stroke="#86efac" />
          <text x="450" y="265" textAnchor="middle" fill="#065f46" fontWeight="700">Model Serve (FastAPI)</text>

          <rect x="640" y="220" rx="12" width="260" height="90" fill="#fff1f2" stroke="#fb7185" />
          <text x="770" y="265" textAnchor="middle" fill="#be123c" fontWeight="700">SHAP Explainer & Dashboard</text>
        </g>

        {/* connectors (animated) */}
        <motion.path d="M240 85 L320 85" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
        <motion.path d="M580 85 L640 85" stroke="#fb923c" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.2 }} />
        <motion.path d="M450 130 L450 220" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.35 }} />
        <motion.path d="M770 130 L770 220" stroke="#fb7185" strokeWidth="3" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, delay: 0.45 }} />

        {/* moving circles along connectors */}
        <motion.circle cx="280" cy="85" r="6" fill="#60a5fa" animate={{ cx: [240, 280, 320], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.6 }} />
        <motion.circle cx="620" cy="85" r="6" fill="#fb923c" animate={{ cx: [580, 620, 640], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 2.8, delay: 0.3 }} />
      </svg>
    </div>
  );
}
