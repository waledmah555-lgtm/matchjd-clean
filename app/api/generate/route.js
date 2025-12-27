import { OpenAI } from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req) {
  try {
    const form = await req.formData();
    const resumeText = form.get("resumeText")?.toString() || "";
    const jobDescription = form.get("jobDescription")?.toString() || "";
    const levelValue = form.get("level")?.toString() || "Auto";

    if (!resumeText && !form.get("resumeFile")) {
      return Response.json({ error: "Please provide resume text or file." }, { status: 400 });
    }
    if (!jobDescription) {
      return Response.json({ error: "Please provide a job description." }, { status: 400 });
    }

    // Level-based prompt selection
    let prompt;
    switch (levelValue) {
      case "Fresher":
        prompt = `
You are JDMATCH, a resume alignment engine specialized for Indian freshers.
RULES:
1. Do NOT add any skills, experience, or facts not present in the resume.
2. Focus on projects, internships, coursework, certifications, volunteering.
3. Reorder and rephrase for clarity and ATS optimization.
4. Match keywords from job description naturally.
5. Keep bullet points concise; no fluff.
6. Output ONLY the revised resume text.
RESUME:
${resumeText}
JOB DESCRIPTION:
${jobDescription}
`;
        break;

      case "Mid-level":
        prompt = `
You are JDMATCH, specialized for Indian mid-level professionals.
RULES:
1. Do NOT add any skills or experience not present.
2. Focus on measurable achievements, projects, KPIs.
3. Reorder and rephrase for clarity and ATS optimization.
4. Match keywords from job description naturally.
5. Keep bullet points concise; no fluff.
6. Output ONLY the revised resume text.
RESUME:
${resumeText}
JOB DESCRIPTION:
${jobDescription}
`;
        break;

      case "Senior-level":
        prompt = `
You are JDMATCH, specialized for Indian senior-level professionals.
RULES:
1. Do NOT add any skills or experience not present.
2. Focus on leadership, strategy, team management, impact.
3. Reorder and rephrase for clarity and ATS optimization.
4. Match keywords from job description naturally.
5. Keep bullet points concise; no fluff.
6. Output ONLY the revised resume text.
RESUME:
${resumeText}
JOB DESCRIPTION:
${jobDescription}
`;
        break;

      default: // Auto
        prompt = `
You are JDMATCH, specialized for all experience levels.
RULES:
1. Do NOT add any skills or experience not present.
2. Detect experience level from resume.
3. Apply fresher, mid-level, or senior-level rules as appropriate.
4. Reorder and rephrase for clarity and ATS optimization.
5. Output ONLY the revised resume text.
RESUME:
${resumeText}
JOB DESCRIPTION:
${jobDescription}
`;
        break;
    }

    // OpenAI API call
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const aiResult = response.choices?.[0]?.message?.content?.trim() || "";

    // Calculate resume match %
    function calculateMatch(resume, jd) {
      const jdWords = jd.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const jdSet = new Set(jdWords);
      const resumeWords = resume.toLowerCase().split(/\W+/);
      const matched = resumeWords.filter((w) => jdSet.has(w));
      return Math.min(100, Math.round((matched.length / jdSet.size) * 100));
    }

    const originalScore = calculateMatch(resumeText, jobDescription);
    const newScore = calculateMatch(aiResult, jobDescription);

    return Response.json({
      result: aiResult,
      originalScore,
      newScore,
    });

  } catch (error) {
    console.error(error);
    return Response.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
