import { TestData, Answer } from "@/types";
import axiosInstance from "@/utils/axios";

export class TestManager {
  // Get all tests from localStorage
  static async getAllTests(): Promise<TestData[]> {
    if (typeof window === "undefined") return [];

    try {
      const res = await axiosInstance.get("/toeic");
      console.log(res, 222, res.data);
      return res.data;
    } catch (error) {
      console.error("Error loading tests:", error);
      return [];
    }
  }

  // Save a test to localStorage
  static async saveTest(form: FormData): Promise<void> {
    if (typeof window === "undefined") return;

    try {
      const res = await axiosInstance.post("/toeic", form, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    } catch (error) {
      console.error("Error saving test:", error);
    }
  }

  // Delete a test
  static deleteTest(testId: string): void {
    if (typeof window === "undefined") return;

    try {
      // const tests = this.getAllTests();
      // const filteredTests = tests.filter((test) => test.id !== testId);
      // localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredTests));
    } catch (error) {
      console.error("Error deleting test:", error);
    }
  }

  // Get a specific test by ID
  static async getTest(testId: string): Promise<TestData> {
    try {
      const res = await axiosInstance.get(`toeic/${testId}`);
      return res.data as TestData;
    } catch (error) {
      console.error("Error loading tests:", error);
      return {} as TestData;
    }
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
    answers?: Answer[];
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
