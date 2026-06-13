"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getResultDetail } from "@/lib/api";
import { Result } from "@/types";
import ScoreRing from "@/components/ui/ScoreRing";
import { CheckCircle2, XCircle, ArrowLeft, Trophy } from "lucide-react";

export default function ResultDetailPage() {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getResultDetail(resultId)
      .then((d) => setResult(d as Result))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [resultId]);

  if (loading) return <div className="text-center py-16 text-[#6b7280]">Loading result...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!result) return null;

  const correct = result.student_answers?.filter((a) => a.is_correct).length ?? 0;
  const total = result.total_questions;
  const msg =
    result.score >= 80 ? "Excellent work! 🎉" :
    result.score >= 60 ? "Good job! Keep it up 👍" :
    result.score >= 40 ? "Keep practising 📚" :
    "Don't give up, review the material 💪";

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <Link
        href="/student/results"
        className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#0a0a0a] mb-6 transition"
      >
        <ArrowLeft size={16} /> Back to My Results
      </Link>

      {/* Score card */}
      <div className="bg-[#0a0a0a] rounded-2xl p-8 mb-6 text-center">
        <div className="flex justify-center mb-4">
          <ScoreRing score={result.score} size={120} strokeWidth={10} />
        </div>
        <h1 className="text-white text-2xl font-bold mb-1">{msg}</h1>
        <p className="text-[#6b7280]">
          You answered <span className="text-[#16a34a] font-semibold">{correct}</span> out of{" "}
          <span className="text-white font-semibold">{total}</span> questions correctly
        </p>
        <div className="flex justify-center gap-6 mt-6">
          <div className="text-center">
            <p className="text-[#16a34a] font-mono font-bold text-2xl">{correct}</p>
            <p className="text-[#6b7280] text-xs mt-0.5">Correct</p>
          </div>
          <div className="w-px bg-[#1f2937]" />
          <div className="text-center">
            <p className="text-red-400 font-mono font-bold text-2xl">{total - correct}</p>
            <p className="text-[#6b7280] text-xs mt-0.5">Incorrect</p>
          </div>
          <div className="w-px bg-[#1f2937]" />
          <div className="text-center">
            <p className="text-[#9ca3af] font-mono font-bold text-2xl">{total}</p>
            <p className="text-[#6b7280] text-xs mt-0.5">Total</p>
          </div>
        </div>
      </div>

      {/* Review answers */}
      {result.student_answers && result.student_answers.length > 0 && (
        <div>
          <h2 className="font-semibold text-[#0a0a0a] mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-[#f59e0b]" /> Answer Review
          </h2>
          <div className="flex flex-col gap-3">
            {result.student_answers.map((a, i) => (
              <div
                key={a.id}
                className={`bg-white border-2 rounded-2xl p-5 ${
                  a.is_correct ? "border-[#16a34a]/30" : "border-red-200"
                }`}
              >
                <div className="flex items-start gap-3 mb-3">
                  {a.is_correct
                    ? <CheckCircle2 size={20} className="text-[#16a34a] shrink-0 mt-0.5" />
                    : <XCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  }
                  <p className="text-[#0a0a0a] font-medium text-sm leading-relaxed">
                    <span className="text-[#9ca3af] font-mono mr-2">Q{i + 1}.</span>
                    {a.question_text}
                  </p>
                </div>

                <div className="pl-8 flex flex-col gap-1.5">
                  {a.answer_text && (
                    <p className="text-sm">
                      <span className="text-[#6b7280]">Your answer: </span>
                      <span className={a.is_correct ? "text-[#16a34a] font-medium" : "text-red-500 font-medium"}>
                        {a.answer_text}
                      </span>
                    </p>
                  )}
                  {!a.is_correct && a.correct_answer_text && (
                    <p className="text-sm">
                      <span className="text-[#6b7280]">Correct: </span>
                      <span className="text-[#16a34a] font-medium">{a.correct_answer_text}</span>
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        <Link
          href="/student/tests"
          className="flex-1 py-3 text-center border border-[#e5e7eb] text-[#374151] rounded-xl font-medium text-sm hover:bg-[#f9fafb] transition"
        >
          Take Another Test
        </Link>
        <Link
          href="/student"
          className="flex-1 py-3 text-center bg-[#0a0a0a] text-white rounded-xl font-semibold text-sm hover:bg-[#16a34a] transition"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
