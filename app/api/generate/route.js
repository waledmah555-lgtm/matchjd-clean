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

    const prompt = `
You are MatchJD, a resume alignment engine.

RULES:
- Do NOT add skills, experience, or facts not in the resume
- Do NOT invent anything
- Reorder and rephrase ONLY
- Output ONLY the resume

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`;

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
