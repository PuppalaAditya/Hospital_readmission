// src/pages/DashPage.jsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

/**
 * DashPage (mock/demo mode)
 * - Initial cohort size: 28
 * - When no patient selected, right panel shows a random demo patient (realistic mock data)
 * - Upload parses client-side and synthesizes mock predictions
 */

const RISK_COLORS = {
  "Low risk": "#10b981",
  "Medium risk": "#f59e0b",
  "High risk": "#ef4444",
};

function riskBadge(label) {
  return (
    <span
      className="px-2 py-1 rounded-full text-xs font-semibold"
      style={{
        background: label === "High risk" ? "#fee2e2" : label === "Medium risk" ? "#fff7ed" : "#ecfdf5",
        color: RISK_COLORS[label] || "#0f172a",
      }}
    >
      {label}
    </span>
  );
}

function KPI({ title, value, subtitle }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border">
      <div className="text-sm text-slate-500">{title}</div>
      <div className="text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
    </div>
  );
}

function ShapBars({ contributions = [] }) {
  if (!contributions || contributions.length === 0) {
    return <div className="text-sm text-slate-500">No SHAP contributions available.</div>;
  }
  const maxAbs = Math.max(...contributions.map((c) => Math.abs(c.shap_value)), 1);
  return (
    <div className="space-y-2">
      {contributions.map((c, i) => {
        const width = Math.min(100, (Math.abs(c.shap_value) / maxAbs) * 100);
        const positive = c.shap_value >= 0;
        return (
          <div key={i} className="flex items-center gap-3">
            <div className="w-36 text-sm text-slate-700">{c.feature}</div>
            <div className="flex-1 bg-slate-100 h-3 rounded-full overflow-hidden">
              <div
                className="h-3 rounded-full"
                style={{
                  width: `${width}%`,
                  background: positive ? "linear-gradient(90deg,#fca5a5,#ef4444)" : "linear-gradient(90deg,#bbf7d0,#10b981)",
                }}
              />
            </div>
            <div className="w-14 text-right text-xs text-slate-700">{c.shap_value.toFixed(3)}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ----------------- utilities: random mock data ----------------- */
const AGE_BUCKETS = ["[20-30)", "[30-40)", "[40-50)", "[50-60)", "[60-70)", "[70-80)"];
const SPECIALTIES = ["Cardiology", "InternalMedicine", "Surgery", "Orthopedics", "Other"];
const DIAGS = ["Diabetes", "Circulatory", "Respiratory", "Digestive", "Injury", "Other"];

function rand(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

let _idCounter = 1000;
function nextId() {
  _idCounter += 1;
  return _idCounter;
}

function generateRandomContributions(count = 6) {
  return Array.from({ length: count }).map((_, i) => ({
    feature: pick(["age", "time_in_hospital", "n_medications", "n_lab_procedures", "n_procedures", "n_inpatient"]) + `__${i}`,
    shap_value: parseFloat(((Math.random() - 0.5) * 0.6).toFixed(4)),
  })).sort((a,b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));
}

function generateRandomPatient(seedIndex = 0) {
  const patient_id = `P-${nextId()}`;
  const prob = Math.min(0.99, Math.max(0.01, parseFloat((0.05 + Math.abs(Math.sin(seedIndex + rand())) * 0.9).toFixed(3))));
  const label = prob > 0.65 ? "High risk" : prob > 0.35 ? "Medium risk" : "Low risk";
  const top_contributions = generateRandomContributions(6);
  return {
    id: nextId(),
    patient_id,
    age: pick(AGE_BUCKETS),
    medical_specialty: pick(SPECIALTIES),
    readmission_probability: prob,
    risk_label: label,
    reasons: label === "High risk" ? ["High medication count", "Frequent inpatient visits"] : ["Routine follow-up"],
    top_contributions,
    input: {
      time_in_hospital: Math.round(rand()*10)+1,
      n_medications: Math.round(rand()*30),
      n_lab_procedures: Math.round(rand()*60)
    },
    created_at: new Date().toISOString()
  };
}

function generateCohort(n = 28) {
  return Array.from({ length: n }).map((_, i) => generateRandomPatient(i));
}

function generateMockMetrics() {
  const roc = [];
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    roc.push({ fpr: t, tpr: Math.min(1, Math.pow(t, 0.6) + rand()*0.05) });
  }
  const pr = [];
  for (let i = 0; i <= 20; i++) {
    const recall = i / 20;
    pr.push({ recall, precision: Math.max(0.1, 1 - recall * (0.5 + rand()*0.2)) });
  }
  const calib = [];
  for (let i = 0; i <= 10; i++) {
    const bin = (i / 10).toFixed(1);
    calib.push({ prob_bin: bin, predicted: parseFloat(bin), observed: Math.max(0, Math.min(1, parseFloat(bin) + (Math.random() - 0.5) * 0.12)) });
  }
  return { roc, pr, calibration: calib, suggested_threshold: 0.5 };
}

/* ----------------- MAIN COMPONENT ----------------- */
export default function DashPage() {
  // list + filters + pagination
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState({ key: "readmission_probability", dir: "desc" });
  const [query, setQuery] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [ageFilter, setAgeFilter] = useState("");

  // initial cohort 28
  const [patients, setPatients] = useState(() => generateCohort(28));
  const [loadingList, setLoadingList] = useState(false);

  // selected patient - null initially
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // show a random demo patient when none selected
  const [demoPlaceholder] = useState(() => generateRandomPatient(9999));

  // metrics & kpis
  const [metrics, setMetrics] = useState(() => generateMockMetrics());
  const [kpis, setKpis] = useState(() => computeKpisFromPatients(generateCohort(28)));
  const [threshold, setThreshold] = useState(metrics?.suggested_threshold ?? 0.5);

  // upload
  const fileInput = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    setTotal(patients.length);
    setKpis(computeKpisFromPatients(patients));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function computeKpisFromPatients(list) {
    const totalLocal = list.length;
    const high = list.filter((p) => p.risk_label === "High risk").length;
    const avg = totalLocal ? list.reduce((s, p) => s + (Number(p.readmission_probability) || 0), 0) / totalLocal : 0;
    return { total: totalLocal, high_pct: totalLocal ? Math.round((high / totalLocal) * 100) : 0, avg_prob: avg };
  }

  // filtered & paginated view
  const filteredPatients = useMemo(() => {
    let out = patients.slice();
    if (query) {
      const q = query.toLowerCase();
      out = out.filter((p) => String(p.patient_id).toLowerCase().includes(q) || (p.name || "").toLowerCase().includes(q));
    }
    if (specialtyFilter) out = out.filter((p) => p.medical_specialty === specialtyFilter);
    if (ageFilter) out = out.filter((p) => p.age === ageFilter);

    out = out.sort((a, b) => {
      const dir = sortBy.dir === "desc" ? -1 : 1;
      const aVal = a[sortBy.key] ?? 0;
      const bVal = b[sortBy.key] ?? 0;
      if (aVal < bVal) return dir * 1;
      if (aVal > bVal) return dir * -1;
      return 0;
    });

    setTotal(out.length);
    return out.slice((page - 1) * perPage, page * perPage);
  }, [patients, query, specialtyFilter, ageFilter, sortBy, page, perPage]);

  // mock "explain" call
  const loadDetail = useCallback(async (patientSummary) => {
    if (!patientSummary) {
      setSelected(null);
      return;
    }
    setDetailLoading(true);
    await new Promise((r) => setTimeout(r, 300));
    const details = patientSummary.details ?? {
      top_contributions: (patientSummary.top_contributions || generateRandomContributions(6)).slice(0, 10),
      suggested_actions: [
        "Arrange medication review",
        "Schedule post-discharge follow-up within 7 days",
        "Consider social work referral"
      ].slice(0, Math.max(1, Math.round(Math.random() * 3))),
      timeline: [
        { when: "2025-09-01", note: "Admitted — LOS 3 days" },
        { when: "2025-08-20", note: "ER visit — chest pain" }
      ]
    };
    setSelected({ ...patientSummary, details });
    setDetailLoading(false);
  }, []);

  // handle uploads (client-only mock predictions)
  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    setUploadProgress({ done: 0, total: 0 });
    try {
      const data = await file.arrayBuffer();
      const wb = XLSX.read(data, { type: "array" });
      const sheetName = wb.SheetNames[0];
      const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { defval: null });
      setUploadProgress({ done: 0, total: rows.length });

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const input = {
          patient_id: row.patient_id || row.id || `U-${nextId()}`,
          age: row.age || pick(AGE_BUCKETS),
          medical_specialty: row.medical_specialty || pick(SPECIALTIES),
          time_in_hospital: Number(row.time_in_hospital || 1),
          n_medications: Number(row.n_medications || Math.round(rand() * 20)),
          n_lab_procedures: Number(row.n_lab_procedures || Math.round(rand() * 50)),
        };

        const prob = parseFloat(Math.min(0.99, Math.max(0.01, (input.n_medications / 60) + (input.time_in_hospital / 20) + rand() * 0.2)).toFixed(3));
        const label = prob > 0.65 ? "High risk" : prob > 0.35 ? "Medium risk" : "Low risk";
        const contributions = [
          { feature: "n_medications", shap_value: parseFloat(((input.n_medications / 30) - 0.4).toFixed(4)) },
          { feature: "time_in_hospital", shap_value: parseFloat(((input.time_in_hospital / 10) - 0.1).toFixed(4)) },
          { feature: "n_lab_procedures", shap_value: parseFloat(((input.n_lab_procedures / 50) - 0.05).toFixed(4)) },
        ].concat(Array.from({ length: 3 }).map(() => ({ feature: pick(["age", "n_procedures", "n_inpatient"]), shap_value: parseFloat(((rand() - 0.5) / 4).toFixed(4)) })));

        const newPatient = {
          id: nextId(),
          patient_id: input.patient_id,
          age: input.age,
          medical_specialty: input.medical_specialty,
          readmission_probability: prob,
          risk_label: label,
          reasons: label === "High risk" ? ["High medication count", "Long stay"] : ["Routine risk"],
          top_contributions: contributions.sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value)),
          input,
          created_at: new Date().toISOString()
        };

        setPatients((prev) => [newPatient, ...prev].slice(0, 5000));
        setUploadProgress((p) => ({ ...p, done: p.done + 1, total: rows.length }));

        // update kpis
        setKpis((prev) => {
          const prevTotal = prev.total || patients.length;
          const totalNow = prevTotal + 1;
          const avg_prob = (((prev.avg_prob || 0) * prevTotal) + prob) / totalNow;
          const highCount = Math.round(((prev.high_pct || 0) / 100) * prevTotal) + (label === "High risk" ? 1 : 0);
          return { total: totalNow, avg_prob, high_pct: Math.round((highCount / totalNow) * 100) };
        });

        await new Promise((r) => setTimeout(r, 80));
      }

      setMetrics(generateMockMetrics());
    } catch (err) {
      console.error("Upload failed", err);
      alert("Failed to parse uploaded file: " + (err.message || err));
    } finally {
      setUploading(false);
    }
  };

  const onBrowse = () => fileInput.current?.click();

  const exportList = () => {
    if (!patients || patients.length === 0) {
      alert("No patients to export");
      return;
    }
    const rows = patients.map((r) => ({
      patient_id: r.patient_id,
      prob: r.readmission_probability,
      risk: r.risk_label,
      reasons: (r.reasons || []).join("; "),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "patients");
    XLSX.writeFile(wb, "patients_export.xlsx");
  };

  const exportPatientReport = (pt) => {
    if (!pt) return;
    const payload = {
      patient_id: pt.patient_id,
      probability: pt.readmission_probability,
      risk_label: pt.risk_label,
      reasons: pt.reasons,
      input: pt.input || pt.details?.input || null,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patient_${pt.patient_id || "report"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const rocData = useMemo(() => metrics?.roc || [], [metrics]);
  const prData = useMemo(() => metrics?.pr || [], [metrics]);
  const calibData = useMemo(() => metrics?.calibration || [], [metrics]);

  const onRowClick = (row) => {
    setSelected(null);
    loadDetail(row);
  };

  // selectedOrDemo: if a patient is selected show it, otherwise show the demo placeholder
  const selectedOrDemo = selected ?? demoPlaceholder;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-sky-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start gap-6">
          {/* LEFT COLUMN */}
          <div className="w-2/3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">Clinical Triage Dashboard (Demo)</h1>
                <div className="text-sm text-slate-600">Mock data — fully client-side demo</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={exportList} className="px-3 py-2 rounded bg-emerald-600 text-white text-sm">Export list (XLSX)</button>
                <button onClick={onBrowse} className="px-3 py-2 rounded bg-blue-600 text-white text-sm">{uploading ? "Uploading…" : "Upload Excel"}</button>
                <input ref={fileInput} type="file" accept=".xls,.xlsx,.csv" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="col-span-2 grid grid-cols-3 gap-3">
                <input placeholder="Search patient id or name" value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} className="p-2 border rounded" />
                <select value={specialtyFilter} onChange={(e) => { setSpecialtyFilter(e.target.value); setPage(1); }} className="p-2 border rounded">
                  <option value="">All specialties</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={ageFilter} onChange={(e) => { setAgeFilter(e.target.value); setPage(1); }} className="p-2 border rounded">
                  <option value="">All ages</option>
                  {AGE_BUCKETS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3">
                <div className="text-sm text-slate-500">Sort:</div>
                <select
                  value={`${sortBy.key}|${sortBy.dir}`}
                  onChange={(e) => {
                    const [k, d] = e.target.value.split("|");
                    setSortBy({ key: k, dir: d });
                    setPage(1);
                  }}
                  className="p-2 border rounded text-sm"
                >
                  <option value="readmission_probability|desc">Probability (high → low)</option>
                  <option value="readmission_probability|asc">Probability (low → high)</option>
                  <option value="created_at|desc">Newest</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <KPI title="Patients in view" value={kpis.total} subtitle="filtered / page" />
              <KPI title="% High risk" value={`${kpis.high_pct}%`} subtitle="High risk proportion" />
              <KPI title="Avg probability" value={`${(kpis.avg_prob * 100).toFixed(1)}%`} subtitle="Mean predicted probability" />
            </div>

            <div className="bg-white rounded-lg shadow border overflow-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs text-slate-500">#</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-500">Patient</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-500">Specialty</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-500">Probability</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-500">Risk</th>
                    <th className="px-4 py-2 text-left text-xs text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loadingList ? (
                    <tr><td colSpan={6} className="p-6 text-center">Loading…</td></tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr><td colSpan={6} className="p-6 text-center text-slate-500">No patients</td></tr>
                  ) : (
                    filteredPatients.map((p, idx) => (
                      <tr key={p.patient_id || p.id || idx} className="hover:bg-slate-50 cursor-pointer">
                        <td className="px-4 py-3 text-sm">{(page - 1) * perPage + idx + 1}</td>
                        <td className="px-4 py-3 text-sm">{p.patient_id || p.name || "-"}</td>
                        <td className="px-4 py-3 text-sm">{p.medical_specialty || "-"}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex items-center gap-3">
                            <div className="w-40 bg-slate-100 h-2 rounded overflow-hidden">
                              <div style={{ width: `${(Number(p.readmission_probability) || 0) * 100}%`, background: p.readmission_probability >= threshold ? "#ef4444" : "#60a5fa", height: 8 }} />
                            </div>
                            <div className="text-xs text-slate-600 w-14">{p.readmission_probability !== undefined ? (Number(p.readmission_probability) * 100).toFixed(1) + "%" : "-"}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">{riskBadge(p.risk_label || (p.readmission_probability >= threshold ? "High risk" : "Low risk"))}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex gap-2">
                            <button onClick={() => onRowClick(p)} className="px-2 py-1 rounded bg-blue-600 text-white text-xs">View</button>
                            <button onClick={() => exportPatientReport(p)} className="px-2 py-1 rounded bg-gray-200 text-xs">Export</button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <div className="flex items-center justify-between px-4 py-3 border-t">
                <div className="text-sm text-slate-600">Showing {Math.min((page - 1) * perPage + 1, total)} - {Math.min(page * perPage, total)} of {total}</div>
                <div className="flex items-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-2 py-1 rounded border">Prev</button>
                  <div className="px-2 py-1">{page}</div>
                  <button disabled={page * perPage >= total} onClick={() => setPage((p) => p + 1)} className="px-2 py-1 rounded border">Next</button>
                  <select value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); setPage(1); }} className="p-1 border rounded">
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-white p-4 rounded-lg shadow border">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold">Model performance (mock)</h3>
                  <div className="text-xs text-slate-500">ROC, Precision-Recall, Calibration and threshold tuning</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-slate-600">Threshold:</div>
                  <div className="px-3 py-1 bg-slate-100 rounded">{(threshold * 100).toFixed(0)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={rocData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fpr" name="FPR" />
                        <YAxis dataKey="tpr" name="TPR" domain={[0, 1]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="tpr" stroke="#2563eb" dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">ROC curve</div>
                </div>

                <div className="col-span-1">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={prData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="recall" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="precision" stroke="#f97316" fill="#ffedd5" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Precision-Recall</div>
                </div>

                <div className="col-span-1">
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={calibData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="prob_bin" />
                        <YAxis domain={[0, 1]} />
                        <Tooltip />
                        <Bar dataKey="observed" fill="#06b6d4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-slate-500 mt-2">Calibration (observed vs predicted)</div>
                </div>
              </div>

              <div className="mt-4">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={threshold}
                  onChange={(e) => setThreshold(Number(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <div>0%</div>
                  <div>100%</div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="w-1/3">
            <div className="sticky top-6 space-y-4">
              {/* Header card */}
              <div className="bg-white rounded-lg p-4 shadow border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-500">Selected patient</div>
                    <div className="text-lg font-semibold">{selected ? (selected.patient_id || "-") : (demoPlaceholder.patient_id)}</div>
                  </div>
                  <div>
                    {selectedOrDemo?.readmission_probability !== undefined ? (
                      <>
                        <div className="text-xs text-slate-500">Probability</div>
                        <div className="font-bold text-xl">{(Number(selectedOrDemo.readmission_probability) * 100).toFixed(1)}%</div>
                        <div className="mt-1">{riskBadge(selectedOrDemo.risk_label || (selectedOrDemo.readmission_probability >= threshold ? "High risk" : "Low risk"))}</div>
                      </>
                    ) : (
                      <div className="text-sm text-slate-400">No data</div>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button onClick={() => selectedOrDemo && exportPatientReport(selectedOrDemo)} className="px-3 py-1 rounded bg-gray-100 text-sm">Export report</button>
                  {!selected && <div className="text-xs text-slate-400">No selection — showing demo patient</div>}
                </div>
              </div>

              {/* SHAP drivers */}
              <div className="bg-white rounded-lg p-4 shadow border min-h-[220px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">Top SHAP drivers</div>
                  <div className="text-xs text-slate-400">{selected ? "Real explanation" : "Demo explanation"}</div>
                </div>

                {detailLoading ? (
                  <div className="text-sm text-slate-500">Loading…</div>
                ) : (selectedOrDemo?.details?.top_contributions || selectedOrDemo?.top_contributions) ? (
                  <ShapBars contributions={(selectedOrDemo.details?.top_contributions || selectedOrDemo.top_contributions || []).slice(0, 10)} />
                ) : (
                  <div className="text-sm text-slate-500">Select a patient to view explanations.</div>
                )}
              </div>

              {/* Suggested actions */}
              <div className="bg-white rounded-lg p-4 shadow border">
                <div className="text-sm font-semibold mb-2">Suggested actions</div>
                {(selectedOrDemo?.details?.suggested_actions || (selectedOrDemo && ["Arrange medication review", "Follow-up within 7 days"])) ? (
                  <ul className="list-disc pl-5 text-sm text-slate-700">
                    {(selectedOrDemo.details?.suggested_actions || ["Arrange medication review", "Follow-up within 7 days"]).map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                ) : (
                  <div className="text-sm text-slate-500">No suggested actions available.</div>
                )}
              </div>

              {/* Recent events */}
              <div className="bg-white rounded-lg p-4 shadow border">
                <div className="text-sm font-semibold mb-2">Recent events</div>
                {(selectedOrDemo?.details?.timeline || (selectedOrDemo && [
                  { when: "2025-09-01", note: "Admitted — LOS 3 days" },
                  { when: "2025-08-20", note: "ER visit — chest pain" }
                ])) ? (
                  <div className="text-sm text-slate-700 space-y-2">
                    {(selectedOrDemo.details?.timeline || [
                      { when: "2025-09-01", note: "Admitted — LOS 3 days" },
                      { when: "2025-08-20", note: "ER visit — chest pain" }
                    ]).slice(0, 6).map((ev, i) => (
                      <div key={i} className="text-xs">
                        <div className="font-semibold">{ev.when}</div>
                        <div className="text-slate-500">{ev.note}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No timeline available.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* upload progress footer */}
        {uploading && (
          <div className="mt-4 bg-white p-3 rounded shadow text-sm">
            Uploading: {uploadProgress.done}/{uploadProgress.total} processed
          </div>
        )}
      </div>
    </div>
  );
}
