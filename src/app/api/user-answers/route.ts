import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const USER_ANSWERS_FILE = path.join(
  process.cwd(),
  "src",
  "data",
  "user-answers.json"
);

interface UserAnswer {
  id: number;
  value: "A" | "B" | "C" | "D";
}

interface UserAnswersData {
  [testId: string]: UserAnswer[];
}

// GET - Load user answers for a specific test
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    // Read user answers from JSON file
    let userAnswersData: UserAnswersData = {};

    if (fs.existsSync(USER_ANSWERS_FILE)) {
      const fileContent = fs.readFileSync(USER_ANSWERS_FILE, "utf8");
      userAnswersData = JSON.parse(fileContent);
    }

    const userAnswers = userAnswersData[testId] || [];

    return NextResponse.json({ userAnswers });
  } catch (error) {
    console.error("Error loading user answers:", error);
    return NextResponse.json(
      { error: "Failed to load user answers" },
      { status: 500 }
    );
  }
}

// POST - Save user answers for a specific test
export async function POST(request: NextRequest) {
  try {
    const { testId, userAnswers } = await request.json();

    if (!testId || !Array.isArray(userAnswers)) {
      return NextResponse.json(
        { error: "Test ID and user answers are required" },
        { status: 400 }
      );
    }

    // Read existing user answers
    let userAnswersData: UserAnswersData = {};

    if (fs.existsSync(USER_ANSWERS_FILE)) {
      const fileContent = fs.readFileSync(USER_ANSWERS_FILE, "utf8");
      userAnswersData = JSON.parse(fileContent);
    }

    // Update user answers for this test
    userAnswersData[testId] = userAnswers;

    // Ensure data directory exists
    const dataDir = path.dirname(USER_ANSWERS_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write updated data back to file
    fs.writeFileSync(
      USER_ANSWERS_FILE,
      JSON.stringify(userAnswersData, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving user answers:", error);
    return NextResponse.json(
      { error: "Failed to save user answers" },
      { status: 500 }
    );
  }
}

// DELETE - Clear user answers for a specific test
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testId = searchParams.get("testId");

    if (!testId) {
      return NextResponse.json(
        { error: "Test ID is required" },
        { status: 400 }
      );
    }

    // Read existing user answers
    let userAnswersData: UserAnswersData = {};

    if (fs.existsSync(USER_ANSWERS_FILE)) {
      const fileContent = fs.readFileSync(USER_ANSWERS_FILE, "utf8");
      userAnswersData = JSON.parse(fileContent);
    }

    // Remove user answers for this test
    delete userAnswersData[testId];

    // Write updated data back to file
    fs.writeFileSync(
      USER_ANSWERS_FILE,
      JSON.stringify(userAnswersData, null, 2)
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error clearing user answers:", error);
    return NextResponse.json(
      { error: "Failed to clear user answers" },
      { status: 500 }
    );
  }
}
