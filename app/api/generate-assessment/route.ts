import { NextResponse } from "next/server";

const allowedLevels = ["beginner", "intermediate", "advanced"];

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const body = await request.json();

    const skill = String(body.skill || "").trim();
    const level = String(body.level || "").toLowerCase().trim();

    if (!skill) {
      return NextResponse.json(
        { error: "Skill is required." },
        { status: 400 }
      );
    }

    if (!allowedLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid assessment level." },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert technical assessment generator.

Generate EXACTLY 10 multiple-choice questions for:

Skill: ${skill}
Difficulty: ${level}

Rules:
- Exactly 10 questions.
- Every question must be relevant to ${skill}.
- Difficulty must strictly match ${level}.
- Each question must have exactly 4 options.
- There must be exactly one correct answer.
- Do not repeat questions.
- Avoid ambiguous questions.
- Do not use trick questions.
- Questions should test actual understanding, not only memorization.
- Return JSON only.
- Do not include markdown.
- Do not include explanations.

Return exactly this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": 0
    }
  ]
}

The answer value must be the zero-based index of the correct option.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Gemini API error:", errorText);

      return NextResponse.json(
        { error: "AI question generation failed." },
        { status: 500 }
      );
    }

    const data = await response.json();

    const generatedText =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      return NextResponse.json(
        { error: "AI returned an empty response." },
        { status: 500 }
      );
    }

    let parsed;

    try {
      parsed = JSON.parse(generatedText);
    } catch {
      console.error("Invalid AI JSON:", generatedText);

      return NextResponse.json(
        { error: "AI returned invalid question data." },
        { status: 500 }
      );
    }

    if (
      !parsed.questions ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length !== 10
    ) {
      return NextResponse.json(
        { error: "AI did not generate exactly 10 questions." },
        { status: 500 }
      );
    }

    const validQuestions = parsed.questions.every(
      (question: any) =>
        typeof question.question === "string" &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        question.options.every(
          (option: any) => typeof option === "string"
        ) &&
        Number.isInteger(question.answer) &&
        question.answer >= 0 &&
        question.answer <= 3
    );

    if (!validQuestions) {
      return NextResponse.json(
        { error: "AI generated an invalid question format." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      questions: parsed.questions,
      skill,
      level,
    });
  } catch (error) {
    console.error("Assessment generation error:", error);

    return NextResponse.json(
      { error: "Something went wrong while generating the assessment." },
      { status: 500 }
    );
  }
}