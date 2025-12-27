"use client";

import { useState } from "react";

export default function Home() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [level, setLevel] = useState("Auto");
  const [scores, setScores] = useState({ originalScore: 0, newScore: 0 });

  async function generate() {
    setErr("");
    setResult("");
    setScores({ originalScore: 0, newScore: 0 });

    if (!resumeText.trim() && !resumeFile) {
      setErr("Please upload a resume or paste resume text.");
      return;
    }
    if (!jobDescription.trim()) {
      setErr("Please paste the job description.");
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      if (resumeFile) form.append("resumeFile", resumeFile);
      form.append("resumeText", resumeText);
      form.append("jobDescription", jobDescription);
      form.append("level", level);

      const r = await fetch("/api/generate", { method: "POST", body: form });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Something went wrong");

      setResult(data.result || "");
      setScores({ originalScore: data.originalScore, newScore: data.newScore });
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadDocx() {
    if (!result) return;
    try {
      const r = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: result }),
      });
      const blob = await r.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `JDMATCH_Resume_${level}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed: " + e.message);
    }
  }

  return (
    <main style={{ maxWidth: 960, margin: "50px auto", padding: 24, fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 700, color: "#0b66ff" }}>JDMATCH</h1>
        <span style={{ fontSize: 14, opacity: 0.8 }}>ATS-safe • No fake skills</span>
      </div>

      {/* Intro */}
      <div style={{ background: "#f0f4ff", borderRadius: 16, padding: 22, marginBottom: 30, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <p style={{ margin: 0, lineHeight: 1.7, fontSize: 15 }}>
          Align your resume to a specific job description — without adding fake experience or skills. Now supports <b>all experience levels</b> (Fresher, Mid, Senior).
        </p>
      </div>

      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e5e5e5", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
        <label style={{ fontWeight: 600 }}>Select Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ display: "block", marginTop: 8, marginBottom: 18, padding: 12, borderRadius: 12, border: "1px solid #ccc", fontSize: 14 }}>
          <option>Auto</option>
          <option>Fresher</option>
          <option>Mid-level</option>
          <option>Senior-level</option>
        </select>

        <label style={{ fontWeight: 600 }}>Upload Resume (PDF / DOCX)</label>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} style={{ display: "block", marginTop: 8, marginBottom: 16 }} />

        <label style={{ fontWeight: 600 }}>Resume Text <span style={{ opacity: 0.6 }}>(optional)</span></label>
        <textarea rows={7} value={resumeText} onChange={(e) => setResumeText(e.target.value)} style={{ width: "100%", marginTop: 8, marginBottom: 16, padding: 14, borderRadius: 12, border: "1px solid #ccc", fontSize: 14 }} />

        <label style={{ fontWeight: 600 }}>Job Description</label>
        <textarea rows={7} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ width: "100%", marginTop: 8, marginBottom: 20, padding: 14, borderRadius: 12, border: "1px solid #ccc", fontSize: 14 }} />

        <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "16px", borderRadius: 14, border: "none", background: loading ? "#aaa" : "#0b66ff", color: "#fff", fontWeight: 600, fontSize: 16, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Generating…" : "Generate Aligned Resume"}
        </button>

        {err && <div style={{ marginTop: 16, padding: 14, background: "#ffecec", border: "1px solid #ffbdbd", borderRadius: 12, color: "#b00000", fontSize: 14 }}>{err}</div>}
      </div>

      {/* Output */}
      {result && (
        <div style={{ marginTop: 36, background: "#fff", borderRadius: 20, padding: 28, border: "1px solid #e5e5e5", boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}>
          <h3 style={{ marginTop: 0, fontSize: 20, color: "#0b66ff" }}>Tailored Resume</h3>

          {/* Match % */}
          <div style={{ marginBottom: 16, background: "#eef6ff", padding: 16, borderRadius: 12, border: "1px solid #cce0ff" }}>
            <p style={{ margin: 4, fontWeight: 600 }}>Resume match improvement:</p>
            <p style={{ margin: 2 }}>Before: {scores.originalScore ?? 0}%</p>
            <p style={{ margin: 2 }}>After: {scores.newScore ?? 0}%</p>
          </div>

          <textarea rows={18} readOnly value={result} placeholder="Your tailored resume will appear here." style={{ width: "100%", padding: 14, borderRadius: 12, border: "1px solid #ccc", fontSize: 14 }} />

          {/* Download */}
          <button onClick={downloadDocx} style={{ marginTop: 16, width: "100%", padding: "14px", borderRadius: 12, border: "none", background: "#0b66ff", color: "#fff", fontWeight: 600, fontSize: 15, cursor: "pointer" }}>
            Download DOCX
          </button>
        </div>
      )}

      {/* Footer */}
      <p style={{ marginTop: 40, fontSize: 13, opacity: 0.7, textAlign: "center" }}>JDMATCH does not add fake skills or experience. Always review before applying.</p>
    </main>
  );
}
