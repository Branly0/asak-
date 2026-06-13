"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTestById, submitTest } from "@/lib/api";
import { TestWithQuestions, Question } from "@/types";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Send } from "lucide-react";

interface AnswerState {
  question_id: string;
  selected_answer_id?: string;
  answer_text?: string;
}

export default function TakeTestPage() {
  const { testId } = useParams<{ testId: string }>();
  const router = useRouter();
  const [test, setTest] = useState<TestWithQuestions | null>(null);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Map<string, AnswerState>>(new Map());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getTestById(testId)
      .then((d) => {
        const t = d as TestWithQuestions;
        // Sort by question number
        t.questions = t.questions.sort((a, b) => a.question_number - b.question_number);
        setTest(t);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [testId]);

  function selectAnswer(question: Question, answerId?: string, text?: string) {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(question.id, {
        question_id: question.id,
        selected_answer_id: answerId,
        answer_text: text,
      });
      return next;
    });
  }

  async function handleSubmit() {
    if (!test) return;
    setSubmitting(true);
    setError("");
    try {
      const payload = test.questions.map((q) => {
        const a = answers.get(q.id);
        return {
          question_id: q.id,
          selected_answer_id: a?.selected_answer_id,
          answer_text: a?.answer_text,
        };
      });
      const result = await submitTest(testId, payload) as { id: string };
      router.replace(`/student/results/${result.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Submission failed");
      setSubmitting(false);
    }
  }

  if (loading) return <div className="text-center py-16 text-[#6b7280]">Loading test...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!test) return null;

  const q = test.questions[current];
  const answered = answers.get(q?.id ?? "");
  const totalAnswered = test.questions.filter((q) => answers.has(q.id)).length;
  const progress = (totalAnswered / test.questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Test header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#0a0a0a]">{test.name}</h1>
        <div className="flex items-center justify-between mt-3">
          <span className="text-[#6b7280] text-sm">
            Question {current + 1} of {test.questions.length}
          </span>
          <span className="text-[#16a34a] text-sm font-medium">
            {totalAnswered} answered
          </span>
        </div>
        {/* Progress bar */}
        <div className="mt-2 h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#16a34a] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question dots */}
      <div className="flex flex-wrap gap-2 mb-6">
        {test.questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrent(i)}
            className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition ${
              i === current
                ? "bg-[#0a0a0a] text-white"
                : answers.has(q.id)
                ? "bg-[#16a34a] text-white"
                : "bg-[#f3f4f6] text-[#6b7280] hover:bg-[#e5e7eb]"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      {q && (
        <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 mb-4">
          <div className="flex items-start gap-3 mb-5">
            <div className="w-8 h-8 bg-[#0a0a0a] rounded-xl flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-mono font-bold">{current + 1}</span>
            </div>
            <p className="text-[#0a0a0a] font-medium text-base leading-relaxed">{q.question_text}</p>
          </div>

          {q.question_type === "short_answer" ? (
            <textarea
              value={answered?.answer_text || ""}
              onChange={(e) => selectAnswer(q, undefined, e.target.value)}
              placeholder="Type your answer here..."
              rows={3}
              className="w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] resize-none"
            />
          ) : (
            <div className="flex flex-col gap-2">
              {q.answers.map((a) => {
                const selected = answered?.selected_answer_id === a.id;
                return (
                  <button
                    key={a.id}
                    onClick={() => selectAnswer(q, a.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition text-sm ${
                      selected
                        ? "border-[#16a34a] bg-[#f0fdf4] text-[#0a0a0a]"
                        : "border-[#e5e7eb] hover:border-[#9ca3af] text-[#374151]"
                    }`}
                  >
                    {selected
                      ? <CheckCircle2 size={18} className="text-[#16a34a] shrink-0" />
                      : <Circle size={18} className="text-[#d1d5db] shrink-0" />
                    }
                    <span className="font-medium">{a.answer_text}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          className="flex items-center gap-2 px-4 py-2.5 border border-[#e5e7eb] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#f9fafb] disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} /> Previous
        </button>

        {current < test.questions.length - 1 ? (
          <button
            onClick={() => setCurrent((c) => Math.min(test.questions.length - 1, c + 1))}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#16a34a] transition"
          >
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#16a34a] text-white rounded-xl text-sm font-semibold hover:bg-[#15803d] transition disabled:opacity-60"
          >
            <Send size={15} />
            {submitting ? "Submitting..." : `Submit Test (${totalAnswered}/${test.questions.length})`}
          </button>
        )}
      </div>

      {error && (
        <p className="mt-4 text-center text-red-500 text-sm">{error}</p>
      )}
    </div>
  );
}
