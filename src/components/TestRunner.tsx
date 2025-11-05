"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TestData,
  UserAnswer,
  TestStats,
  CombinedItem,
  Part5Question,
  Part6Passage,
  Part7Passage,
} from "@/types";
import defaultQuestions from "@/data/a.json";
import Part5 from "@/components/parts/Part5";
import Part6 from "@/components/parts/Part6";
import Part7 from "@/components/parts/Part7";

interface TestRunnerProps {
  test: TestData;
  onBack: () => void;
}

type Choice = "A" | "B" | "C" | "D";

type Question = {
  id: number;
  question: string;
  options: Record<Choice, string>;
  answer: Choice;
  explanation?: {
    vi?: {
      question_intro?: string;
      option_analysis?: Partial<Record<Choice, string>>;
      correct_answer?: string;
      sentence_explanation?: string;
      translation?: string;
      vocab_notes?: string;
      grammar_notes?: string;
    };
  };
};

export default function TestRunner({ test, onBack }: TestRunnerProps) {
  const [questions, setQuestions] = useState<Question[]>(
    defaultQuestions as unknown as Question[]
  );
  const [part5, setPart5] = useState<Part5Question[]>([]);
  const [part6, setPart6] = useState<Part6Passage[]>([]);
  const [part7, setPart7] = useState<Part7Passage[]>([]);
  const [selectedParts, setSelectedParts] = useState<{
    5: boolean;
    6: boolean;
    7: boolean;
  }>({ 5: true, 6: true, 7: true });

  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<TestStats>({
    correct: 0,
    incorrect: 0,
    answered: 0,
    score: 0,
  });
  const [highlightContent, setHighlightContent] = useState(true);
  const [isReview, setIsReview] = useState(false);
  const [timeLeft, setTimeLeft] = useState((test.timeLimitMinutes || 45) * 60);

  // Load questions from attached data file if provided
  useEffect(() => {
    const load = async () => {
      if (test.dataFile) {
        try {
          const res = await fetch(test.dataFile);
          const json = await res.json();
          if (Array.isArray(json)) {
            const p5: Part5Question[] = [];
            const p6: Part6Passage[] = [];
            const p7: Part7Passage[] = [];
            for (const item of json as CombinedItem[]) {
              if ((item as any)?.part === 5) p5.push(item as Part5Question);
              else if ((item as any)?.part === 6) p6.push(item as Part6Passage);
              else if ((item as any)?.part === 7) p7.push(item as Part7Passage);
            }
            setPart5(p5);
            setPart6(p6);
            setPart7(p7);
            if (p5.length && !p6.length && !p7.length)
              setQuestions(p5 as unknown as Question[]);
          } else {
            setQuestions(json as Question[]);
          }
        } catch (e) {
          console.error("Cannot load test dataFile, fallback to default", e);
        }
      }
    };
    load();
  }, [test.dataFile]);

  // Build correct answers map from JSON
  const correctAnswerMap = useMemo(() => {
    const m = new Map<number, Choice>();
    if (part5.length + part6.length + part7.length > 0) {
      for (const q of part5) m.set(q.id, q.answer);
      for (const p of part6) for (const q of p.questions) m.set(q.id, q.answer);
      for (const p of part7) for (const q of p.questions) m.set(q.id, q.answer);
    } else {
      for (const q of questions) m.set(q.id, q.answer);
    }
    return m;
  }, [questions, part5, part6, part7]);

  useEffect(() => {
    const loadUserAnswers = async () => {
      try {
        const response = await fetch(`/api/user-answers?testId=${test.id}`);
        if (response.ok) {
          const data = await response.json();
          setUserAnswers(data.userAnswers || []);
        }
      } catch (error) {
        console.error("Error loading saved answers:", error);
      }
    };
    loadUserAnswers();
  }, [test.id]);

  useEffect(() => {
    const saveUserAnswers = async () => {
      try {
        await fetch("/api/user-answers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testId: test.id, userAnswers }),
        });
      } catch (error) {
        console.error("Error saving answers:", error);
      }
    };
    if (userAnswers.length > 0) saveUserAnswers();
  }, [userAnswers, test.id]);

  // Timer countdown
  useEffect(() => {
    if (isReview) return; // stop timer on review
    const id = setInterval(() => {
      setTimeLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(id);
  }, [isReview]);

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const selectOption = (questionId: number, value: Choice) => {
    if (isReview) return;
    setUserAnswers((prev) => {
      const existingIndex = prev.findIndex((a) => a.id === questionId);
      if (existingIndex !== -1) {
        const next = [...prev];
        next[existingIndex].value = value;
        return next;
      }
      return [...prev, { id: questionId, value }];
    });
  };

  const resetAnswers = async () => {
    if (confirm("Bạn có chắc chắn muốn xóa tất cả câu trả lời?")) {
      try {
        await fetch(`/api/user-answers?testId=${test.id}`, {
          method: "DELETE",
        });
        setUserAnswers([]);
        setShowStats(false);
        setIsReview(false);
        setTimeLeft((test.timeLimitMinutes || 45) * 60);
      } catch (error) {
        console.error("Error clearing answers:", error);
        alert("Có lỗi xảy ra khi xóa câu trả lời");
      }
    }
  };

  const finishAndReview = () => {
    // compute stats using correct answers, only for selected parts
    const includedIds = new Set<number>();
    if (part5.length + part6.length + part7.length > 0) {
      if (selectedParts[5]) for (const q of part5) includedIds.add(q.id);
      if (selectedParts[6])
        for (const p of part6)
          for (const q of p.questions) includedIds.add(q.id);
      if (selectedParts[7])
        for (const p of part7)
          for (const q of p.questions) includedIds.add(q.id);
    } else {
      for (const q of questions) includedIds.add(q.id);
    }

    let correct = 0;
    let answered = 0;
    for (const ua of userAnswers) {
      if (!includedIds.has(ua.id)) continue;
      answered += 1;
      if (ua.value === correctAnswerMap.get(ua.id)) correct += 1;
    }
    const incorrect = Math.max(0, answered - correct);
    const score = answered ? Math.round((correct / answered) * 100) : 0;
    setStats({ correct, incorrect, answered, score });
    setIsReview(true);
    setShowStats(true);
  };

  const isAnswered = (id: number) => userAnswers.some((a) => a.id === id);
  const getUserChoice = (id: number): Choice | undefined =>
    userAnswers.find((a) => a.id === id)?.value as Choice | undefined;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 relative">
      <div>
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="btn btn-secondary">
            ← Quay lại
          </button>
          <h2 className="text-2xl font-bold text-gray-800">📝 {test.title}</h2>
          <div className="w-24"></div>
        </div>

        {showStats && (
          <div className="card mb-6">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                📊 Thống Kê
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.correct}
                  </div>
                  <div className="text-sm text-green-700">Câu Đúng</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {stats.incorrect}
                  </div>
                  <div className="text-sm text-red-700">Câu Sai</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.answered}
                  </div>
                  <div className="text-sm text-blue-700">Đã Trả Lời</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.score}%
                  </div>
                  <div className="text-sm text-purple-700">Điểm</div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {part5.length + part6.length + part7.length === 0 &&
            questions.map((q, idx) => {
              const userChoice = getUserChoice(q.id);
              const correct = correctAnswerMap.get(q.id);
              const isCorrect =
                isReview && userChoice && correct && userChoice === correct;
              const isIncorrect =
                isReview && userChoice && correct && userChoice !== correct;
              return (
                <div
                  key={q.id}
                  id={`q-${q.id}`}
                  className={`question-item ${
                    isCorrect ? "correct" : isIncorrect ? "incorrect" : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-lg font-bold text-gray-700">
                      {idx + 1}. Câu {q.id}
                    </div>
                  </div>
                  <div
                    className={`mb-4 ${
                      highlightContent ? "bg-gray-50 p-3 rounded" : ""
                    }`}
                  >
                    {q.question}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(Object.keys(q.options) as Choice[]).map((opt) => (
                      <label
                        key={opt}
                        className={`option ${
                          isReview
                            ? opt === correct
                              ? "incorrect"
                              : userChoice === opt && userChoice !== correct
                              ? "correct"
                              : ""
                            : userChoice === opt
                            ? "selected"
                            : ""
                        }`}
                      >
                        <input
                          type="radio"
                          className="mr-3 scale-125"
                          name={`q-${q.id}`}
                          checked={userChoice === opt}
                          onChange={() => selectOption(q.id, opt)}
                        />
                        <span className="font-medium mr-2">{opt}.</span>
                        <span>{q.options[opt]}</span>
                      </label>
                    ))}
                  </div>

                  {isReview && q.explanation?.vi && (
                    <div className="mt-4 border-t pt-4 text-md text-gray-800">
                      <div className="flex items-center gap-2 font-semibold mb-3">
                        <span>📘</span>
                        <span>Giải thích chi tiết đáp án</span>
                      </div>

                      {q.explanation.vi.correct_answer && (
                        <div className="mb-3 p-3 rounded bg-green-50 text-green-800 border border-green-200">
                          {/* <span className="mr-2">✅</span> */}
                          <span className="font-medium">
                            {q.explanation.vi.correct_answer}
                          </span>
                        </div>
                      )}

                      {q.explanation.vi.question_intro && (
                        <p className="mb-3 text-gray-700">
                          {q.explanation.vi.question_intro}
                        </p>
                      )}

                      <div className="flex items-center gap-2 font-medium mb-2">
                        <span>🧠</span>
                        <span>Phân tích lựa chọn</span>
                      </div>
                      {q.explanation.vi.option_analysis && (
                        <div className="mb-3 bg-white p-2">
                          <ul className="space-y-2">
                            {(Object.keys(q.options) as Choice[]).map((opt) => {
                              const text =
                                q.explanation!.vi!.option_analysis?.[opt];
                              if (!text) return null;
                              return (
                                <li key={opt} className="flex">
                                  <span className="w-8 font-semibold">
                                    {opt}.
                                  </span>
                                  <span className="text-gray-700">{text}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      )}

                      {q.explanation.vi.sentence_explanation && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <span>💡</span>
                            <span>Lý giải câu</span>
                          </div>
                          <p className="text-gray-700">
                            {q.explanation.vi.sentence_explanation}
                          </p>
                        </div>
                      )}

                      {q.explanation.vi.translation && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 font-medium mb-1">
                            <span>🌐</span>
                            <span>Dịch câu</span>
                          </div>
                          <p className="italic text-gray-600">
                            {q.explanation.vi.translation}
                          </p>
                        </div>
                      )}

                      {(q.explanation.vi.vocab_notes ||
                        q.explanation.vi.grammar_notes) && (
                        <div className="grid md:grid-cols-2 gap-3">
                          {q.explanation.vi.vocab_notes && (
                            <div className="p-3 rounded border bg-blue-50 border-blue-200">
                              <div className="flex items-center gap-2 font-medium mb-1 text-blue-800">
                                <span>🗂️</span>
                                <span>Từ vựng</span>
                              </div>
                              <div className="whitespace-pre-wrap text-blue-900 text-[13px]">
                                {q.explanation.vi.vocab_notes}
                              </div>
                            </div>
                          )}
                          {q.explanation.vi.grammar_notes && (
                            <div className="p-3 rounded border bg-purple-50 border-purple-200">
                              <div className="flex items-center gap-2 font-medium mb-1 text-purple-800">
                                <span>📏</span>
                                <span>Ngữ pháp</span>
                              </div>
                              <div className="whitespace-pre-wrap text-purple-900 text-[13px]">
                                {q.explanation.vi.grammar_notes}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

          {selectedParts[5] && part5.length > 0 && (
            <Part5
              items={part5}
              isReview={isReview}
              userAnswers={userAnswers}
              selectOption={selectOption}
              correctOf={(id) => correctAnswerMap.get(id)}
            />
          )}

          {selectedParts[6] && part6.length > 0 && (
            <Part6
              items={part6}
              isReview={isReview}
              userAnswers={userAnswers}
              selectOption={selectOption}
              correctOf={(id) => correctAnswerMap.get(id)}
            />
          )}

          {selectedParts[7] && part7.length > 0 && (
            <Part7
              items={part7}
              isReview={isReview}
              userAnswers={userAnswers}
              selectOption={selectOption}
              correctOf={(id) => correctAnswerMap.get(id)}
            />
          )}
        </div>
      </div>

      <aside className="h-fit lg:fixed lg:right-6 lg:top-24 lg:w-80">
        <div className="card">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Thời gian làm bài</div>
              <div
                className={`px-3 py-1 rounded text-white ${
                  timeLeft === 0 ? "bg-red-600" : "bg-slate-700"
                }`}
              >
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="highlight"
                type="checkbox"
                className="scale-110"
                checked={highlightContent}
                onChange={(e) => setHighlightContent(e.target.checked)}
              />
              <label htmlFor="highlight" className="text-sm">
                Highlight nội dung
              </label>
            </div>

            {part5.length + part6.length + part7.length > 0 && (
              <div className="space-y-2">
                <div className="font-semibold">Chọn phần</div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedParts[5]}
                    onChange={(e) =>
                      setSelectedParts((s) => ({ ...s, 5: e.target.checked }))
                    }
                  />
                  <span>Part 5</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedParts[6]}
                    onChange={(e) =>
                      setSelectedParts((s) => ({ ...s, 6: e.target.checked }))
                    }
                  />
                  <span>Part 6</span>
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedParts[7]}
                    onChange={(e) =>
                      setSelectedParts((s) => ({ ...s, 7: e.target.checked }))
                    }
                  />
                  <span>Part 7</span>
                </label>
              </div>
            )}

            <button
              onClick={isReview ? resetAnswers : finishAndReview}
              className={`w-full btn ${
                isReview ? "btn-danger" : "btn-success"
              }`}
            >
              {isReview ? "Làm lại" : "Nộp Bài"}
            </button>

            <div>
              <div className="font-semibold mb-2">Câu hỏi</div>
              <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto">
                {(part5.length + part6.length + part7.length === 0
                  ? questions
                  : [
                      ...(selectedParts[5]
                        ? part5.map((q: any) => ({ id: q.id }))
                        : []),
                      ...(selectedParts[6]
                        ? part6.flatMap((p: any) =>
                            p.questions.map((q: any) => ({ id: q.id }))
                          )
                        : []),
                      ...(selectedParts[7]
                        ? part7.flatMap((p: any) =>
                            p.questions.map((q: any) => ({ id: q.id }))
                          )
                        : []),
                    ]
                ).map((q: any, i: number) => {
                  const userChoice = getUserChoice(q.id);
                  const correct = correctAnswerMap.get(q.id);
                  const stateClass = isReview
                    ? userChoice
                      ? userChoice === correct
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                      : "bg-gray-200"
                    : userChoice
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100";
                  return (
                    <a
                      key={q.id}
                      href={`#q-${q.id}`}
                      className={`text-center rounded p-2 text-xs ${stateClass}`}
                    >
                      {q.id}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
