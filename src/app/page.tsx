"use client";

import { useState, useEffect } from "react";
import { TestData } from "@/types";
import { TestManager } from "@/lib/testManager";
import TestList from "@/components/TestList";
import TestCreator from "@/components/TestCreator";
import TestRunner from "@/components/TestRunner";

export default function Home() {
  const [tests, setTests] = useState<TestData[]>([]);
  const [currentView, setCurrentView] = useState<"list" | "create" | "test">(
    "list"
  );
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const getAllTest = async () => {
    const res = await TestManager.getAllTests();
    console.log(res, 32323);
    setTests(res);
  };
  useEffect(() => {
    getAllTest();
  }, []);

  const handleCreateTest = (
    titleOrTest: string | TestData,
    description?: string
  ) => {
    if (typeof titleOrTest === "string") {
      const newTest = TestManager.createNewTest(titleOrTest, description);
      TestManager.saveTest(newTest);
    } else {
      TestManager.saveTest(titleOrTest);
    }
    getAllTest();
    setCurrentView("list");
  };

  const handleDeleteTest = (testId: string) => {
    TestManager.deleteTest(testId);
    getAllTest();
  };

  const handleStartTest = (test: TestData, customTimeLimit?: number) => {
    setSelectedTest({ ...test, timeLimitMinutes: customTimeLimit });
    setCurrentView("test");
  };

  const handleBackToList = () => {
    setCurrentView("list");
    setSelectedTest(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="card">
          <div className="bg-gradient-to-r from-slate-700 to-blue-600 text-white p-8 text-center">
            <h1 className="text-4xl font-bold mb-2">📝 TOEIC Test App</h1>
            <p className="text-lg opacity-90">
              Ứng dụng quản lý và thực hiện bài thi TOEIC
            </p>
          </div>

          <div className="p-6 bg-gray-50 border-b">
            <div className="flex gap-4 justify-center flex-wrap">
              <button
                onClick={() => setCurrentView("list")}
                className={`btn ${
                  currentView === "list" ? "btn-primary" : "btn-secondary"
                }`}
              >
                📋 Danh Sách Bài Test
              </button>
              <button
                onClick={() => setCurrentView("create")}
                className={`btn ${
                  currentView === "create" ? "btn-primary" : "btn-secondary"
                }`}
              >
                ➕ Tạo Bài Test Mới
              </button>
            </div>
          </div>

          <div className="p-6">
            {currentView === "list" && (
              <TestList
                tests={tests}
                onStartTest={handleStartTest}
                onDeleteTest={handleDeleteTest}
              />
            )}

            {currentView === "create" && (
              <TestCreator
                onCreateTest={handleCreateTest}
                onCancel={() => setCurrentView("list")}
              />
            )}

            {currentView === "test" && selectedTest && (
              <TestRunner test={selectedTest} onBack={handleBackToList} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
