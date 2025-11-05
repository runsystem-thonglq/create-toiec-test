"use client";

import { Choice, Part6Passage, UserAnswer } from "@/types";

interface Props {
  items: Part6Passage[];
  isReview: boolean;
  userAnswers: UserAnswer[];
  selectOption: (id: number, v: Choice) => void;
  correctOf: (id: number) => Choice | undefined;
}

export default function Part6({
  items,
  isReview,
  userAnswers,
  selectOption,
  correctOf,
}: Props) {
  const getUserChoice = (id: number) =>
    userAnswers.find((a) => a.id === id)?.value;

  return (
    <div className="space-y-8">
      {items.map((p) => (
        <div key={p.passage_id} className="card">
          <div className="p-4 grid lg:grid-cols-2 gap-6">
            <div>
              {p.title && (
                <div className="font-bold text-lg mb-2">{p.title}</div>
              )}
              <div className="whitespace-pre-line bg-gray-50 p-3 rounded leading-relaxed">
                {p.context}
              </div>
            </div>
            <div className="space-y-4">
              {p.questions.map((q) => {
                const userChoice = getUserChoice(q.id);
                const correct = correctOf(q.id);
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
                    <div className="font-semibold mb-2">
                      {q.id}. {q.question}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                            className="mr-3"
                            name={`q-${q.id}`}
                            checked={userChoice === opt}
                            onChange={() => selectOption(q.id, opt)}
                          />
                          <span className="font-medium mr-2">{opt}.</span>
                          <span>{q.options[opt]}</span>
                        </label>
                      ))}
                    </div>

                    {isReview && (q as any).explanation?.vi && (
                      <div className="mt-4 border-t pt-4 text-sm text-gray-800">
                        <div className="flex items-center gap-2 font-semibold mb-3">
                          <span>📘</span>
                          <span>Giải thích chi tiết đáp án</span>
                        </div>
                        {(q as any).explanation.vi.correct_answer && (
                          <div className="mb-3 p-3 rounded bg-green-50 text-green-800 border border-green-200">
                            <span className="font-medium">
                              {(q as any).explanation.vi.correct_answer}
                            </span>
                          </div>
                        )}
                        {(q as any).explanation.vi.question_intro && (
                          <p className="mb-3 text-gray-700">
                            {(q as any).explanation.vi.question_intro}
                          </p>
                        )}
                        {(q as any).explanation.vi.option_analysis && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 font-medium mb-2">
                              <span>🧠</span>
                              <span>Phân tích lựa chọn</span>
                            </div>
                            <ul className="space-y-2">
                              {(Object.keys(q.options) as Choice[]).map(
                                (opt) => {
                                  const text = (q as any).explanation.vi
                                    .option_analysis?.[opt];
                                  if (!text) return null;
                                  return (
                                    <li key={opt} className="flex">
                                      <span className="w-8 font-semibold">
                                        {opt}.
                                      </span>
                                      <span className="text-gray-700">
                                        {text}
                                      </span>
                                    </li>
                                  );
                                }
                              )}
                            </ul>
                          </div>
                        )}
                        {(q as any).explanation.vi.sentence_explanation && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 font-medium mb-1">
                              <span>💡</span>
                              <span>Lý giải câu</span>
                            </div>
                            <p className="text-gray-700">
                              {(q as any).explanation.vi.sentence_explanation}
                            </p>
                          </div>
                        )}
                        {(q as any).explanation.vi.translation && (
                          <div className="mb-3">
                            <div className="flex items-center gap-2 font-medium mb-1">
                              <span>🌐</span>
                              <span>Dịch câu</span>
                            </div>
                            <p className="italic text-gray-600">
                              {(q as any).explanation.vi.translation}
                            </p>
                          </div>
                        )}
                        {((q as any).explanation.vi.vocab_notes ||
                          (q as any).explanation.vi.grammar_notes) && (
                          <div className="grid md:grid-cols-2 gap-3">
                            {(q as any).explanation.vi.vocab_notes && (
                              <div className="p-3 rounded border bg-blue-50 border-blue-200">
                                <div className="flex items-center gap-2 font-medium mb-1 text-blue-800">
                                  <span>🗂️</span>
                                  <span>Từ vựng</span>
                                </div>
                                <div className="whitespace-pre-wrap text-blue-900 text-[13px]">
                                  {(q as any).explanation.vi.vocab_notes}
                                </div>
                              </div>
                            )}
                            {(q as any).explanation.vi.grammar_notes && (
                              <div className="p-3 rounded border bg-purple-50 border-purple-200">
                                <div className="flex items-center gap-2 font-medium mb-1 text-purple-800">
                                  <span>📏</span>
                                  <span>Ngữ pháp</span>
                                </div>
                                <div className="whitespace-pre-wrap text-purple-900 text-[13px]">
                                  {(q as any).explanation.vi.grammar_notes}
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
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
