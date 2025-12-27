"use client";

import { useState } from "react";

export default function Home() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

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

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <h1>MatchJD</h1>
      <p>
        Upload your resume or paste text, add the job description, and generate
        an ATS-friendly aligned resume.
      </p>

      <label><b>Upload Resume (PDF/DOCX)</b></label>
      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
      />

      <br /><br />

      <label><b>Resume Text (optional)</b></label>
      <textarea
        rows={8}
        value={resumeText}
        onChange={(e) => setResumeText(e.target.value)}
        style={{ width: "100%" }}
      />

      <br /><br />

      <label><b>Job Description</b></label>
      <textarea
        rows={8}
        value={jobDescription}
        onChange={(e) => setJobDescription(e.target.value)}
        style={{ width: "100%" }}
      />

      <br /><br />

      <button onClick={generate} disabled={loading}>
        {loading ? "Generating..." : "Generate"}
      </button>

      {err && <p style={{ color: "red" }}>{err}</p>}

      <br />

      <textarea
        rows={18}
        readOnly
        value={result}
        style={{ width: "100%" }}
        placeholder="Result will appear here"
      />
    </main>
  );
}
