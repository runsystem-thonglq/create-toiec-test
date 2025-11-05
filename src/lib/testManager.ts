import { TestData, Answer } from "@/types";

export class TestManager {
  private static readonly STORAGE_KEY = "toeic-tests";

  // Get all tests from localStorage
  static getAllTests(): TestData[] {
    if (typeof window === "undefined") return [];

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Error loading tests:", error);
      return [];
    }
  }

  // Save a test to localStorage
  static saveTest(testData: TestData): void {
    if (typeof window === "undefined") return;

    try {
      const tests = this.getAllTests();
      const existingIndex = tests.findIndex((test) => test.id === testData.id);

      if (existingIndex !== -1) {
        tests[existingIndex] = testData;
      } else {
        tests.push(testData);
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tests));
    } catch (error) {
      console.error("Error saving test:", error);
    }
  }

  // Delete a test
  static deleteTest(testId: string): void {
    if (typeof window === "undefined") return;

    try {
      const tests = this.getAllTests();
      const filteredTests = tests.filter((test) => test.id !== testId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTests));
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  }

  // Get a specific test by ID
  static getTest(testId: string): TestData | null {
    const tests = this.getAllTests();
    return tests.find((test) => test.id === testId) || null;
  }

  // Generate random answers for testing
  static generateRandomAnswers(): Answer[] {
    const answers: Answer[] = [];
    for (let i = 1; i <= 200; i++) {
      const options: ("A" | "B" | "C" | "D")[] = ["A", "B", "C", "D"];
      const randomAnswer = options[Math.floor(Math.random() * options.length)];
      answers.push({ id: i, value: randomAnswer });
    }
    return answers;
  }

  // Create a new test with random answers
  static createNewTest(title: string, description?: string): TestData {
    const now = new Date().toISOString();
    return {
      id: `test_${Date.now()}`,
      title,
      description,
      answers: this.generateRandomAnswers(),
      timeLimitMinutes: 45,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Build a TestData object from AI generated content
  static createFromAI(params: {
    title: string;
    description?: string;
    timeLimitMinutes?: number;
    answers: Answer[];
    dataFile?: string;
  }): TestData {
    const now = new Date().toISOString();
    return {
      id: `test_${Date.now()}`,
      title: params.title,
      description: params.description,
      answers: params.answers,
      timeLimitMinutes: params.timeLimitMinutes,
      dataFile: params.dataFile,
      createdAt: now,
      updatedAt: now,
    };
  }

  // Validate test data
  static validateTestData(data: any): data is TestData {
    return (
      data &&
      typeof data.id === "string" &&
      typeof data.title === "string" &&
      Array.isArray(data.answers) &&
      data.answers.every(
        (answer: any) =>
          typeof answer.id === "number" &&
          ["A", "B", "C", "D"].includes(answer.value)
      )
    );
  }
}
