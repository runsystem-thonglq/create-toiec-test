"use client";

import { useState } from "react";
import { TestData } from "@/types";

interface TestListProps {
  tests: TestData[];
  onStartTest: (test: TestData, customTimeLimit?: number) => void; // Thêm parameter customTimeLimit
  onDeleteTest: (testId: string) => void;
}

export default function TestList({
  tests,
  onStartTest,
  onDeleteTest,
}: TestListProps) {
  const [selectedTest, setSelectedTest] = useState<TestData | null>(null);
  const [customTimeLimit, setCustomTimeLimit] = useState<number>(15);

  const handleDelete = (testId: string, testTitle: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa bài test "${testTitle}"?`)) {
      onDeleteTest(testId);
    }
  };

  const handleStartTestClick = (test: TestData) => {
    setSelectedTest(test);
    // setCustomTimeLimit(test.timeLimitMinutes || 15);
  };

  const handleConfirmStartTest = () => {
    if (selectedTest) {
      const timeLimit = customTimeLimit;
      onStartTest(selectedTest, timeLimit);
      setSelectedTest(null);
    }
  };

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Chưa có bài test nào
        </h3>
        <p className="text-gray-500">Hãy tạo bài test đầu tiên của bạn!</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        📋 Danh Sách Bài Test ({tests.length})
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.map((test) => (
          <div
            key={test.id}
            className="card hover:shadow-xl transition-shadow duration-300"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    {test.title}
                  </h3>
                  {test.description && (
                    <p className="text-sm text-gray-600 mb-3">
                      {test.description}
                    </p>
                  )}
                </div>
                <div className="text-2xl">📚</div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>📅 Tạo:</span>
                  <span>
                    {new Date(test.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>📝 Số câu:</span>
                  <span>{test.answers.length}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>🔄 Cập nhật:</span>
                  <span>
                    {new Date(test.updatedAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStartTestClick(test)}
                  className="flex-1 btn btn-primary text-sm"
                >
                  ▶️ Bắt Đầu Test
                </button>
                <button
                  onClick={() => handleDelete(test.id, test.title)}
                  className="btn btn-danger text-sm px-3"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal chọn thời gian */}
      {selectedTest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              Bắt đầu bài test: {selectedTest.title}
            </h3>

            <div className="mb-4">
              {/* <div className="flex items-center mb-3">
                <input
                  type="checkbox"
                  id="useCustomTime"
                  checked={useCustomTime}
                  onChange={(e) => setUseCustomTime(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="useCustomTime" className="text-sm font-medium">
                  Sử dụng thời gian tùy chỉnh
                </label>
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏱️ Thời gian làm bài (phút)
                </label>
                <select
                  value={customTimeLimit}
                  onChange={(e) => setCustomTimeLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {[15, 30, 45, 60, 75, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} phút
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTest(null)}
                className="flex-1 btn btn-secondary"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmStartTest}
                className="flex-1 btn btn-primary"
              >
                Bắt đầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
