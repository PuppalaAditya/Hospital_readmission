// src/pages/AboutPage.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

/* Assets (keep your files in /src/assets and update paths if needed) */
import flowDiagram from '../assets/architecture.png';
import tailwindLogo from '../assets/tailwind-logo.png';
import scikitLogo from '../assets/Scikit-learn-Logo.jpg';
import shapLogo from '../assets/shap_logo.jpg';
import appServicesLogo from '../assets/AppServices.png';
import swaLogo from '../assets/SWA.jpg';
import AzureLogo from '../assets/AzureLogo.png';
import backend_icon from '../assets/backend_icon.jpg';
import frontend_icon from '../assets/frontend_icon.jpg';

export default function AboutPage() {
  const navigate = useNavigate();
  const architectureRef = useRef(null);

  // modern framer-motion scroll hook
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 800], [0, -22]);
  const blobX = useTransform(scrollY, [0, 1000], [0, -60]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('revealed');
        });
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      obs.observe(el);
    });

    return () => obs.disconnect();
  }, []);

  const clinicianEmojis = ['🧑‍⚕️', '👩‍⚕️', '🩺', '🏥', '📊', '🧾', '🔬'];

  const cardVariants = {
    hidden: { opacity: 0, y: 18, scale: 0.98 },
    visible: (i = 0) => ({ opacity: 1, y: 0, scale: 1, transition: { delay: 0.08 * i } }),
  };

  return (
    <div className="min-h-screen relative bg-white text-slate-900 antialiased overflow-x-hidden">
      {/* animated background */}
      <div className="absolute inset-0 -z-50">
        <div className="animated-gradient absolute inset-0" />
        <motion.div
          style={{ x: blobX }}
          className="absolute -left-44 top-6 w-[680px] h-[680px] rounded-full bg-blob-1 opacity-60 blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute right-[-120px] top-40 w-[460px] h-[460px] rounded-full bg-blob-2 opacity-40 blur-3xl pointer-events-none"
        />
        <div className="absolute left-10 bottom-[-140px] w-[360px] h-[360px] rounded-full bg-blob-3 opacity-30 blur-2xl pointer-events-none" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-16 lg:py-24">
        {/* HERO */}
        <motion.section
          style={{ translateY: heroY }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
              About — ReadmitAI{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-cyan-400 to-rose-400">
                Explainable predictions
              </span>
            </h1>

            <p className="text-lg text-slate-700 max-w-3xl">
              Empowering healthcare providers with machine learning-based insights to reduce readmission rates and
              improve patient outcomes. Our comprehensive solution leverages advanced classification algorithms and
              cloud technologies to deliver low-latency, explainable, and auditable predictions.
            </p>

            <div className="flex gap-4">
              <button
                onClick={() => navigate('/sign-up')}
                className="rounded-full px-6 py-3 bg-indigo-600 text-white font-semibold shadow hover:scale-105 transform transition"
              >
                Get started
              </button>
              <button
                onClick={() => architectureRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-full px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
              >
                View architecture
              </button>
            </div>

            <div className="mt-4 flex gap-3">
              <span className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border text-sm">
                🔍 SHAP explainability
              </span>
              <span className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border text-sm">
                ⚡ Low-latency
              </span>
              <span className="inline-flex items-center gap-2 bg-white/90 px-3 py-1 rounded-full border text-sm">
                🔒 Secure & auditable
              </span>
            </div>
          </div>

          {/* right composition */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Interactive preview</div>
                  <div className="text-xs text-slate-500">Simulated snapshot</div>
                </div>
                <div className="text-xs text-slate-400">v1.0</div>
              </div>

              <div className="mt-5 space-y-4">
                {[
                  { label: 'Low', pct: 24, color: 'bg-emerald-400' },
                  { label: 'Medium', pct: 46, color: 'bg-amber-400' },
                  { label: 'High', pct: 30, color: 'bg-rose-400' },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3">
                    <div className="w-16 text-sm text-slate-700">{row.label}</div>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${row.pct}%` }}
                        transition={{ duration: 1 }}
                        className={`${row.color} h-3 rounded-full`}
                      />
                    </div>
                    <div className="w-12 text-right text-sm text-slate-700">{row.pct}%</div>
                  </div>
                ))}
              </div>

              <div className="mt-5">
                <div className="text-xs text-slate-500 mb-2">Care team</div>
                <div className="flex gap-3">
                  {clinicianEmojis.map((e, i) => (
                    <motion.div key={i} whileHover={{ scale: 1.12 }} className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center text-xl shadow">
                      {e}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="absolute -right-6 -bottom-8 w-64 h-40 rounded-2xl bg-gradient-to-tr from-white via-slate-50 to-white/95 border border-white/30 shadow p-3"
            >
              <div className="text-xs text-slate-600">Model performance (simulated)</div>
              <div className="mt-3">
                <MiniBar name="XGBoost" value={89} color="bg-amber-400" />
                <MiniBar name="LightGBM" value={87} color="bg-indigo-400" />
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Problem statement & dataset */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-2xl">🏥</div>
              <div>
                <h3 className="text-xl font-semibold">Problem Statement</h3>
                <p className="mt-3 text-slate-700">
                  Hospital readmissions are one of the costliest challenges facing healthcare systems, but conventional models
                  often underperform. We build robust, explainable models that generalize across sites and provide actionable
                  reasons for each flagged patient.
                </p>

                <div className="mt-4 bg-red-50 rounded-xl p-4 border border-red-100">
                  <h4 className="font-semibold text-red-800">Key Challenges</h4>
                  <ul className="mt-2 text-sm text-red-700 space-y-1">
                    <li>• High cost of preventable readmissions</li>
                    <li>• Heterogeneous EHR data & missingness</li>
                    <li>• Need for interpretable predictions</li>
                    <li>• Real-time constraints in clinical workflows</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg border">
            <h3 className="text-xl font-semibold">Dataset & Training</h3>
            <div className="mt-4 space-y-4">
              <div>
                <div className="text-sm text-slate-600">Source</div>
                <a
                  href="https://www.kaggle.com/datasets/dubradave/hospital-readmissions"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Kaggle — Hospital Readmissions
                </a>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <SmallFact label="Records" value="~25,000" />
                <SmallFact label="Features" value="17 variables" />
                <SmallFact label="Target" value="30-day readmission" />
                <SmallFact label="Time period" value="~10 years" />
              </div>

              <div className="mt-2">
                <h4 className="font-semibold text-slate-900">Project Objective</h4>
                <p className="text-sm text-slate-700 mt-1">
                  Build a classifier that reliably flags 30-day readmissions while providing per-prediction SHAP explanations
                  so clinicians can act with confidence.
                </p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Learning problem statement */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 bg-white rounded-2xl p-8 shadow-lg border">
          <h2 className="text-3xl font-bold text-center mb-6">Learning Problem Statement</h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h4 className="font-semibold">Machine Learning Task</h4>
                <div className="mt-3 grid grid-cols-1 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" /> <div><strong>Task:</strong> Classification</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full" /> <div><strong>Target:</strong> 30-day readmission (Yes/No)</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" /> <div><strong>Evaluation:</strong> Accuracy, ROC-AUC, F1-score</div>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="font-semibold mb-3">Input features (selected)</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    ['age', 'time_in_hospital'],
                    ['n_procedures', 'n_lab_procedures'],
                    ['n_medications', 'n_outpatient'],
                    ['n_inpatient', 'n_emergency'],
                    ['medical_specialty', 'diag_1'],
                    ['diag_2', 'diag_3'],
                    ['glucose_test', 'A1Ctest'],
                    ['change', 'diabetes_med'],
                  ].map((pair, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      <div>
                        {pair[0]}
                        {pair[1] ? `, ${pair[1]}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Technical Challenges</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4">
                  <h4 className="font-semibold">Class imbalance</h4>
                  <p className="text-sm text-slate-600">Imbalanced target requires resampling, class weighting or threshold tuning.</p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <h4 className="font-semibold">Feature engineering</h4>
                  <p className="text-sm text-slate-600">Create rolling stats, comorbidity scores and event-based features to capture clinical risk.</p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold">Interpretability</h4>
                  <p className="text-sm text-slate-600">SHAP enables per-prediction narratives for clinician trust and auditability.</p>
                </div>
              </div>

              <div className="mt-6 bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold">Performance targets</h4>
                <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" /> Accuracy &gt; 78%
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" /> ROC-AUC &gt; 86%
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" /> F1-score &gt; 81%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Our approach */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
          <h2 className="text-3xl font-bold text-center mb-4">Our Approach</h2>
          <p className="text-center text-lg text-slate-700 max-w-3xl mx-auto">
            Ingest → Preprocess → Feature engineering → Train & tune → Explain (SHAP) → Serve (FastAPI) → Dashboard &
            monitor.
          </p>
        </motion.section>

        {/* Architecture */}
        <motion.section ref={architectureRef} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">System Architecture</h2>
          <motion.div className="bg-white rounded-2xl p-6 shadow border overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <div className="reveal-on-scroll opacity-0">
                <img src={flowDiagram} alt="architecture" className="w-full rounded-lg shadow-md border border-dashed border-slate-200" />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Detailed architecture components</h3>
                <ul className="list-disc list-inside text-slate-700 space-y-2">
                  <li>Data ingestion: HL7 adapters, batch ETL, secure uploads (SFTP)</li>
                  <li>Preprocessing: pandas pipelines, imputation, ColumnTransformer</li>
                  <li>Model training: scikit-learn pipelines, XGBoost/LightGBM/RandomForest, Optuna tuning</li>
                  <li>Explainability: SHAP TreeExplainer, top-K drivers and narrative synthesis</li>
                  <li>Serving: FastAPI endpoints, joblib model artifacts, Redis caching</li>
                  <li>Monitoring: prediction logs, drift detection, alerts</li>
                </ul>

                <div className="mt-3">
                  <svg viewBox="0 0 600 80" className="w-full h-20">
                    <g>
                      <rect x="10" y="12" width="140" height="56" rx="8" fill="#eef2ff" stroke="#c7d2fe" />
                      <text x="80" y="45" textAnchor="middle" fill="#4c1d95" fontWeight="700">
                        Ingest
                      </text>

                      <rect x="210" y="12" width="230" height="56" rx="8" fill="#ecfeff" stroke="#99f6e4" />
                      <text x="325" y="45" textAnchor="middle" fill="#065f46" fontWeight="700">
                        Preprocess & FE
                      </text>

                      <rect x="470" y="12" width="120" height="56" rx="8" fill="#fff7ed" stroke="#fb923c" />
                      <text x="530" y="45" textAnchor="middle" fill="#92400e" fontWeight="700">
                        Model
                      </text>
                    </g>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* Technology stack */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Stack
              title="Frontend"
              items={[
                { name: 'React', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
                { name: 'Vite', logo: 'https://vitejs.dev/logo.svg' },
                { name: 'Tailwind', logo: tailwindLogo },
                { name: 'Framer Motion', emoji: '✨' },
                { name: 'Firebase Auth', emoji: '🔐' },
              ]}
            />

            <Stack
              title="Backend"
              items={[
                { name: 'Python', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
                { name: 'FastAPI', logo: 'https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png' },
                { name: 'Uvicorn', emoji: '🛰️' },
                { name: 'Redis', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg' },
                { name: 'Postgres', logo: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
              ]}
            />

            <Stack
              title="Machine Learning"
              items={[
                { name: 'scikit-learn', logo: scikitLogo },
                { name: 'XGBoost / LightGBM', emoji: '🌲' },
                { name: 'SHAP', logo: shapLogo },
                { name: 'pandas / numpy', emoji: '🧮' },
                { name: 'Optuna', emoji: '🎯' },
                { name: 'joblib', emoji: '🧾' },
              ]}
            />
          </div>

          {/* ML detailed breakdown now presented as animated cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div initial="hidden" whileInView="visible" variants={cardVariants} custom={0} className="bg-white p-6 rounded-2xl shadow border">
              <h4 className="font-semibold text-lg mb-3">Models & Ensembling</h4>
              <p className="text-sm text-slate-700 mb-3">
                Primary models are tree-based (XGBoost/LightGBM/RandomForest) because of their strong performance on
                tabular clinical data. We ensemble with stacking (logistic meta-learner) to improve calibration and
                robustness.
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-slate-700">
                <li>Hyperparameter search (Optuna / hyperopt)</li>
                <li>Class-weighting and SMOTE experiments for imbalance</li>
                <li>Calibration (Platt scaling / isotonic)</li>
              </ul>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" variants={cardVariants} custom={1} className="bg-white p-6 rounded-2xl shadow border">
              <h4 className="font-semibold text-lg mb-3">Feature Engineering & Pipelines</h4>
              <p className="text-sm text-slate-700 mb-3">
                Pipelines use scikit-learn ColumnTransformer to apply appropriate transforms per column group. Derived
                features include rolling means, deltas, medication counts, comorbidity scores and severity flags.
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-slate-700">
                <li>Numeric scaling (RobustScaler)</li>
                <li>Categorical encoding (Target / OneHot)</li>
                <li>Missing-value indicators & simple imputation</li>
              </ul>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" variants={cardVariants} custom={2} className="bg-white p-6 rounded-2xl shadow border">
              <h4 className="font-semibold text-lg mb-3">Explainability (SHAP)</h4>
              <p className="text-sm text-slate-700 mb-3">
                Use TreeExplainer for fast SHAP values on tree models; compute top-K contributors per prediction and
                synthesize a short clinical narrative (e.g., "High # medications and recent ER visits increased risk").
              </p>
              <div className="text-sm text-slate-700">
                <strong>Why:</strong> Clinicians need per-prediction reasons — SHAP provides consistent, local explanations
                that map directly to patient features.
              </div>
            </motion.div>
          </div>

          {/* second row of ML cards: Deployment & Monitoring + Extras */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div initial="hidden" whileInView="visible" variants={cardVariants} custom={3} className="bg-white p-6 rounded-2xl shadow border">
              <h4 className="font-semibold text-lg mb-3">Deployment & Monitoring</h4>
              <p className="text-sm text-slate-700 mb-3">
                Model artifacts stored as joblib in Blob Storage. FastAPI loads models and SHAP explainers at startup. We
                log predictions for monitoring, compute data drift metrics, and raise alerts for model performance
                degradation.
              </p>
              <ul className="text-sm list-disc list-inside space-y-1 text-slate-700">
                <li>FastAPI low-latency /predict endpoint</li>
                <li>Joblib artifacts in blob storage or model registry</li>
                <li>Prediction logging, drift detection, alerts & retraining triggers</li>
              </ul>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" variants={cardVariants} custom={4} className="bg-white p-6 rounded-2xl shadow border">
              <h4 className="font-semibold text-lg mb-3">Extras & Best Practices</h4>
              <ul className="text-sm list-disc list-inside space-y-1 text-slate-700">
                <li>Model calibration & threshold tuning for clinical recall/precision tradeoffs</li>
                <li>Audit logs for predictions & explanations (compliance)</li>
                <li>CI/CD for training pipelines & deployment, containerization for reproducibility</li>
              </ul>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} className="mt-12 mb-24">
          <div className="bg-gradient-to-r from-indigo-600 to-cyan-400 p-8 rounded-3xl text-white shadow-lg text-center">
            <h3 className="text-2xl font-bold">Ready to reduce readmissions with explainable ML?</h3>
            <p className="mt-2 text-sm max-w-2xl mx-auto">Sign up to test with demo data or contact us to run a PoC with your hospital data.</p>
            <div className="mt-6 flex justify-center gap-4">
              <button onClick={() => navigate('/sign-up')} className="px-6 py-3 rounded-xl bg-white text-indigo-700 font-semibold">
                Get Started
              </button>
              <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-6 py-3 rounded-xl border border-white/30 text-white">
                Back to top
              </button>
            </div>
          </div>
        </motion.section>
      </main>

      {/* styles */}
      <style>{`
        .animated-gradient {
          background: linear-gradient(120deg, rgba(255,255,255,1) 0%, rgba(249,250,251,1) 10%, rgba(99,102,241,0.03) 40%, rgba(6,182,212,0.03) 70%, rgba(255,255,255,1) 100%);
          background-size: 300% 300%;
          animation: gradientShift 14s ease-in-out infinite;
          width: 100%;
          height: 100%;
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .bg-blob-1 { background: radial-gradient(circle at 20% 20%, rgba(6,182,212,0.12), transparent 40%); }
        .bg-blob-2 { background: radial-gradient(circle at 80% 80%, rgba(124,58,237,0.12), transparent 40%); }
        .bg-blob-3 { background: radial-gradient(circle at 40% 90%, rgba(99,102,241,0.08), transparent 40%); }

        .reveal-on-scroll { opacity: 0; transform: translateY(14px); transition: opacity .6s ease, transform .6s ease; }
        .reveal-on-scroll.revealed { opacity: 1; transform: translateY(0); }
      `}</style>
    </div>
  );
}

/* ---------------- Helper components ---------------- */

function MiniBar({ name, value = 80, color = 'bg-amber-400' }) {
  return (
    <div className="mb-3">
      <div className="flex items-center justify-between text-xs text-slate-700">
        <div>{name}</div>
        <div>{value}%</div>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 mt-1 overflow-hidden">
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${value}%` }} transition={{ duration: 1 }} className={`${color} h-2 rounded-full`} />
      </div>
    </div>
  );
}

function SmallFact({ label, value }) {
  return (
    <div className="rounded-lg p-3 bg-white border shadow-sm text-sm flex items-center justify-between">
      <div className="text-slate-700">{label}</div>
      <div className="font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Stack({ title, items = [] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="rounded-xl p-4 bg-white shadow border">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">{title}</div>
        <div className="text-xs text-slate-500">stack</div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50 transition">
            {it.logo ? (
              <img src={it.logo} alt={it.name} className="w-7 h-7 object-contain" />
            ) : (
              <div className="w-7 h-7 rounded bg-slate-100 flex items-center justify-center text-sm">{it.emoji || '🔧'}</div>
            )}
            <div className="text-sm text-slate-800">{it.name}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
