"use client";

import { useState } from "react";
import { TestData, Answer } from "@/types";
import { TestManager } from "@/lib/testManager";

interface TestCreatorProps {
  onCreateTest: (test: TestData | string, description?: string) => void;
  onCancel: () => void;
}

export default function TestCreator({
  onCreateTest,
  onCancel,
}: TestCreatorProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [timeLimit, setTimeLimit] = useState<number>(45);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert("Vui lòng nhập tiêu đề bài test!");
      return;
    }

    setIsCreating(true);

    try {
      if (pdfFile) {
        const form = new FormData();
        form.append("file", pdfFile);
        form.append("title", title.trim());
        form.append("description", description.trim());
        form.append("timeLimit", String(timeLimit));

        const res = await fetch("/toeic/api/generate-test", {
          method: "POST",
          body: form,
        });
        if (!res.ok) throw new Error("Không tạo được dữ liệu từ AI");
        const data: {
          file: string;
          answers: { id: number; value: "A" | "B" | "C" | "D" }[];
        } = await res.json();

        const test = TestManager.createFromAI({
          title: title.trim(),
          description: description.trim() || undefined,
          timeLimitMinutes: timeLimit,
          answers: data.answers as Answer[],
          dataFile: `/toeic/${data.file}`,
        });
        TestManager.saveTest(test);
        onCreateTest(test);
      } else {
        // fallback: no PDF -> create random answers
        const test = TestManager.createNewTest(
          title.trim(),
          description.trim() || undefined
        );
        test.timeLimitMinutes = timeLimit;
        TestManager.saveTest(test);
        onCreateTest(test);
      }
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        ➕ Tạo Bài Test Mới
      </h2>

      <div className="card">
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                📝 Tiêu đề bài test *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Ví dụ: TOEIC Test 1, Bài thi thử TOEIC..."
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ⏱️ Thời gian làm bài (phút)
                </label>
                <select
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[15, 30, 45, 60, 75, 90, 120].map((m) => (
                    <option key={m} value={m}>
                      {m} phút
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  📄 File PDF đề thi (kéo & thả)
                </label>
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    setPdfFile(e.dataTransfer.files?.[0] || null);
                  }}
                  className={`border-2 border-dashed rounded-lg p-4 text-sm ${
                    dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"
                  }`}
                >
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    id="pdfInput"
                    onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                  />
                  <label
                    htmlFor="pdfInput"
                    className="cursor-pointer block text-center"
                  >
                    {pdfFile
                      ? `📎 ${pdfFile.name}`
                      : "Kéo thả PDF vào đây hoặc bấm để chọn"}
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                📄 Mô tả (tùy chọn)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                placeholder="Mô tả ngắn về bài test này..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="text-blue-500 text-xl mr-3">ℹ️</div>
                <div className="text-sm text-blue-700">
                  <p className="font-medium mb-1">Thông tin:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Bài test sẽ có 200 câu hỏi trắc nghiệm</li>
                    <li>• Đáp án sẽ được tạo ngẫu nhiên</li>
                    <li>• Bạn có thể chỉnh sửa đáp án sau khi tạo</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 btn btn-secondary"
                disabled={isCreating}
              >
                ❌ Hủy
              </button>
              <button
                type="submit"
                className="flex-1 btn btn-primary"
                disabled={isCreating || !title.trim()}
              >
                {isCreating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Đang tạo...
                  </>
                ) : (
                  "✅ Tạo Bài Test"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
