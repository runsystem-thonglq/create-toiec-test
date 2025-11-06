import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as unknown as File | null;
    const title = String(form.get("title") || "TOEIC Test");
    const timeLimit = Number(form.get("timeLimit") || 45);

    if (!file) {
      return NextResponse.json({ error: "Missing PDF file" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const b64 = Buffer.from(arrayBuffer).toString("base64");

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompts = [
      path.join(process.cwd(), "AI", "promt", "part5.md"),
      path.join(process.cwd(), "AI", "promt", "part6.md"),
      path.join(process.cwd(), "AI", "promt", "part7.md"),
    ].map((p) => fs.readFileSync(p, "utf-8"));
    // Fire 3 requests concurrently
    const [r5, r6, r7] = await Promise.all(
      prompts.map((p) =>
        model.generateContent([
          { inlineData: { data: b64, mimeType: "application/pdf" } },
          { text: p },
        ])
      )
    );

    const parseJson = (text: string) => {
      const m = text.match(/```json[\s\S]*?```/i);
      const t = m ? m[0].replace(/```json|```/g, "").trim() : text;
      return JSON.parse(t);
    };

    const raw5 = parseJson(r5.response.text());
    const raw6 = parseJson(r6.response.text());
    const raw7 = parseJson(r7.response.text());

    // Normalize shapes and ensure part field exists
    const norm5 = Array.isArray(raw5)
      ? raw5.map((q: any) => ({ part: 5, ...q }))
      : [];
    const norm6 = Array.isArray(raw6) ? raw6 : [];
    const norm7 = Array.isArray(raw7) ? raw7 : [];

    const questions = [...norm5, ...norm6, ...norm7];

    // Save to public/tests for client fetching
    const publicDir = path.join(process.cwd(), "public", "tests");
    fs.mkdirSync(publicDir, { recursive: true });
    const filename = `${Date.now()}_${title.replace(
      /[^a-z0-9-_]+/gi,
      "_"
    )}.json`;
    const outPath = path.join(publicDir, filename);
    fs.writeFileSync(outPath, JSON.stringify(questions, null, 2), "utf-8");

    // Build answers array for quick scoring across parts
    const answers: { id: number; value: string }[] = [];
    for (const item of questions) {
      if (item?.part === 5) {
        answers.push({ id: item.id, value: item.answer });
      } else if (item?.part === 6 || item?.part === 7) {
        for (const q of item.questions || []) {
          answers.push({ id: q.id, value: q.answer });
        }
      }
    }

    return NextResponse.json({
      file: `/tests/${filename}`,
      answers,
      timeLimit,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Failed to generate test" },
      { status: 500 }
    );
  }
}
