"use client";

import { useState } from "react";

export default function Home() {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [level, setLevel] = useState("Auto"); // new dropdown state

  async function generate() {
    setErr("");
    setResult("");

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
      form.append("level", level); // send selected level to backend

      const r = await fetch("/api/generate", {
        method: "POST",
        body: form
      });

      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Something went wrong");

      setResult(data.result || "");
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
      a.download = "JDMATCH_Resume.docx";
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      alert("Download failed: " + e.message);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ margin: 0, fontSize: 28, letterSpacing: 0.5 }}>JDMATCH</h1>
        <span style={{ fontSize: 13, opacity: 0.75 }}>ATS-safe • No fake skills</span>
      </div>

      {/* Intro */}
      <div style={{ background: "#fff", borderRadius: 14, padding: 20, marginBottom: 24, border: "1px solid #e5e5e5" }}>
        <p style={{ margin: 0, lineHeight: 1.6 }}>
          Align your resume to a specific job description — without adding fake experience or skills. Designed for <b>any experience level</b>.
        </p>
      </div>

      {/* Form */}
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e5e5" }}>
        <label style={{ fontWeight: 600 }}>Select Level</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)} style={{ display: "block", marginTop: 8, marginBottom: 16, padding: 10, borderRadius: 10, border: "1px solid #ccc" }}>
          <option>Auto</option>
          <option>Fresher</option>
          <option>Mid-level</option>
          <option>Senior-level</option>
        </select>

        <label style={{ fontWeight: 600 }}>Upload Resume (PDF / DOCX)</label>
        <input type="file" accept=".pdf,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} style={{ display: "block", marginTop: 8, marginBottom: 16 }} />

        <label style={{ fontWeight: 600 }}>Resume Text <span style={{ opacity: 0.6 }}>(optional)</span></label>
        <textarea rows={7} value={resumeText} onChange={(e) => setResumeText(e.target.value)} style={{ width: "100%", marginTop: 8, marginBottom: 16, padding: 12, borderRadius: 10, border: "1px solid #ccc" }} />

        <label style={{ fontWeight: 600 }}>Job Description</label>
        <textarea rows={7} value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} style={{ width: "100%", marginTop: 8, marginBottom: 20, padding: 12, borderRadius: 10, border: "1px solid #ccc" }} />

        <button onClick={generate} disabled={loading} style={{ width: "100%", padding: "14px 16px", borderRadius: 12, border: "none", background: loading ? "#aaa" : "#111", color: "#fff", fontWeight: 600, cursor: loading ? "not-allowed" : "pointer" }}>
          {loading ? "Generating…" : "Generate Aligned Resume"}
        </button>

        {err && <div style={{ marginTop: 16, padding: 12, background: "#ffecec", border: "1px solid #ffbdbd", borderRadius: 10, color: "#b00000" }}>{err}</div>}
      </div>

      {/* Output */}
      <div style={{ marginTop: 30, background: "#fff", borderRadius: 16, padding: 24, border: "1px solid #e5e5e5" }}>
        <h3 style={{ marginTop: 0 }}>Result</h3>
        <textarea rows={18} readOnly value={result} placeholder="Your tailored resume will appear here." style={{ width: "100%", padding: 12, borderRadius: 10, border: "1px solid #ccc" }} />
        {result && (
          <button onClick={downloadDocx} style={{ marginTop: 16, width: "100%", padding: "12px", borderRadius: 10, border: "none", background: "#0b66ff", color: "#fff", fontWeight: 600, cursor: "pointer" }}>
            Download DOCX
          </button>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 24, fontSize: 13, opacity: 0.7, textAlign: "center" }}>JDMATCH does not add fake skills or experience. Always review before applying.</p>
    </main>
  );
}
