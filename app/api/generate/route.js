import OpenAI from "openai";
import mammoth from "mammoth";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

async function fileToText(file) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();

  if (name.endsWith(".docx")) {
    const { value } = await mammoth.extractRawText({ buffer });
    return value || "";
  }

  if (name.endsWith(".pdf")) {
    const data = await pdfParse(buffer);
    return data.text || "";
  }

  throw new Error("Unsupported file type");
}

export async function POST(req) {
  try {
    const form = await req.formData();
    const resumeFile = form.get("resumeFile");
    const resumeText =
      resumeFile && resumeFile.size > 0
        ? await fileToText(resumeFile)
        : (form.get("resumeText") || "").toString();

    const jobDescription = (form.get("jobDescription") || "").toString();

    if (!resumeText.trim() || !jobDescription.trim()) {
      return Response.json(
        { error: "Missing resume or job description" },
        { status: 400 }
      );
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

let prompt;

const levelValue = form.get("level")?.toString() || "Auto";

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
}


    const response = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2
    });

    return Response.json({
      result: response.choices[0].message.content
    });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
