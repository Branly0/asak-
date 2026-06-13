"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createTest, addQuestion } from "@/lib/api";
import { PlusCircle, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, FileText, Upload, Loader2 } from "lucide-react";

interface AnswerDraft {
  answer_text: string;
  is_correct: boolean;
}

interface QuestionDraft {
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  answers: AnswerDraft[];
  expanded: boolean;
}

const defaultAnswers: AnswerDraft[] = [
  { answer_text: "", is_correct: false },
  { answer_text: "", is_correct: false },
];

function newQuestion(): QuestionDraft {
  return {
    question_text: "",
    question_type: "multiple_choice",
    answers: [...defaultAnswers],
    expanded: true,
  };
}

export default function CreateTestPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState<"info" | "questions">("info");
  const [testId, setTestId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([newQuestion()]);
  const [saving, setSaving] = useState(false);
  const [extractingPdf, setExtractingPdf] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccessMsg("");
    try {
      const test = await createTest({ name, description }) as { id: string };
      setTestId(test.id);
      setStep("questions");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create test");
    } finally {
      setSaving(false);
    }
  }

  // Handle PDF Upload to the Backend Endpoint
  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !testId) return;

    setExtractingPdf(true);
    setError("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Direct call matching your FastAPI route: /tests/{test_id}/upload-pdf
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/tests/${testId}/upload-pdf`, {
        method: "POST",
        headers: {
          // If you use bearer tokens, grab it from your cookie/auth context here:
          "Authorization": `Bearer ${document.cookie.split("access_token=")[1]?.split(";")[0]}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to extract questions from PDF");
      }

      setSuccessMsg(`Successfully extracted ${data.questions_count} questions from your PDF!`);
      
      // Optionally re-fetch test questions from the backend or redirect directly to view them
      setTimeout(() => {
        router.replace("/teacher/tests");
      }, 2000);

    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred during extraction");
    } finally {
      setExtractingPdf(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateQuestion(idx: number, field: keyof QuestionDraft, value: unknown) {
    setQuestions((prev) => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  }

  function updateAnswer(qIdx: number, aIdx: number, field: keyof AnswerDraft, value: unknown) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const newAnswers = q.answers.map((a, j) => j === aIdx ? { ...a, [field]: value } : a);
        return { ...q, answers: newAnswers };
      })
    );
  }

  function setCorrect(qIdx: number, aIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        return {
          ...q,
          answers: q.answers.map((a, j) => ({ ...a, is_correct: j === aIdx })),
        };
      })
    );
  }

  function addAnswer(qIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) => i === qIdx ? { ...q, answers: [...q.answers, { answer_text: "", is_correct: false }] } : q)
    );
  }

  function removeAnswer(qIdx: number, aIdx: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIdx ? { ...q, answers: q.answers.filter((_, j) => j !== aIdx) } : q
      )
    );
  }

  function changeType(qIdx: number, type: QuestionDraft["question_type"]) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        let answers: AnswerDraft[] = q.answers;
        if (type === "true_false") {
          answers = [
            { answer_text: "True", is_correct: true },
            { answer_text: "False", is_correct: false },
          ];
        } else if (type === "short_answer") {
          answers = [{ answer_text: "", is_correct: true }];
        } else if (type === "multiple_choice" && q.question_type !== "multiple_choice") {
          answers = [...defaultAnswers];
        }
        return { ...q, question_type: type, answers };
      })
    );
  }

  async function handleSaveQuestions() {
    if (!testId) return;
    setError("");
    setSaving(true);
    try {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.question_text.trim()) continue;
        await addQuestion(testId, {
          question_text: q.question_text,
          question_type: q.question_type,
          question_number: i + 1,
          answers: q.answers.filter((a) => a.answer_text.trim()),
        });
      }
      router.replace("/teacher/tests");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save questions");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full px-4 py-3 border border-[#e5e7eb] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition bg-white";

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Create New Test</h1>
        <div className="flex items-center gap-3 mt-3">
          {["Test Info", "Add Questions"].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  (step === "info" ? 0 : 1) >= i
                    ? "bg-[#16a34a] text-white"
                    : "bg-[#e5e7eb] text-[#6b7280]"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm font-medium ${(step === "info" ? 0 : 1) >= i ? "text-[#0a0a0a]" : "text-[#9ca3af]"}`}>
                {label}
              </span>
              {i < 1 && <div className="w-8 h-px bg-[#e5e7eb] mx-1" />}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>
      )}

      {successMsg && (
        <div className="mb-5 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">{successMsg}</div>
      )}

      {step === "info" && (
        <form onSubmit={handleCreateTest} className="bg-white border border-[#e5e7eb] rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Test name *</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Biology Chapter 3 Quiz" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Description (optional)</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="What is this test about?" className={inputCls + " resize-none"} />
          </div>
          <button type="submit" disabled={saving} className="w-full py-3 bg-[#0a0a0a] text-white rounded-xl font-semibold hover:bg-[#16a34a] transition disabled:opacity-60">
            {saving ? "Creating..." : "Continue to Questions →"}
          </button>
        </form>
      )}

      {step === "questions" && (
        <div className="flex flex-col gap-4">
          
          {/* NEW: PDF Extraction Tool Container */}
          <div className="bg-white border border-dashed border-[#e5e7eb] rounded-2xl p-6 text-center shadow-sm">
            <div className="flex flex-col items-center justify-center gap-2">
              <div className="w-12 h-12 bg-green-50 text-[#16a34a] rounded-full flex items-center justify-center">
                <FileText size={24} />
              </div>
              <h3 className="text-sm font-bold text-[#0a0a0a] mt-1">Populate test via PDF</h3>
              <p className="text-xs text-[#6b7280] max-w-sm mb-2">
                Have an existing exam sheet? Upload it, and Gemini will automatically extract and structure your questions.
              </p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePdfUpload} 
                accept="application/pdf" 
                className="hidden" 
              />
              
              <button
                type="button"
                disabled={extractingPdf}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border border-[#e5e7eb] rounded-xl text-xs font-semibold text-[#374151] hover:bg-[#f9fafb] transition disabled:opacity-50"
              >
                {extractingPdf ? (
                  <>
                    <Loader2 size={14} className="animate-spin text-[#16a34a]" />
                    Analyzing Document...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Upload Quiz PDF
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center my-2">
            <div className="flex-1 h-px bg-[#e5e7eb]" />
            <span className="px-3 text-xs uppercase font-bold text-[#9ca3af] tracking-wider">Or design manually</span>
            <div className="flex-1 h-px bg-[#e5e7eb]" />
          </div>

          {/* Render manual questions array */}
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
              <div
                className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-[#f9fafb]"
                onClick={() => updateQuestion(qIdx, "expanded", !q.expanded)}
              >
                <div className="w-7 h-7 bg-[#0a0a0a] rounded-lg flex items-center justify-center">
                  <span className="text-white text-xs font-bold font-mono">{qIdx + 1}</span>
                </div>
                <span className="flex-1 font-medium text-sm text-[#0a0a0a] truncate">
                  {q.question_text || `Question ${qIdx + 1}`}
                </span>
                <div className="flex items-center gap-2">
                  {questions.length > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setQuestions((prev) => prev.filter((_, i) => i !== qIdx)); }}
                      className="text-[#9ca3af] hover:text-red-500 transition"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                  {q.expanded ? <ChevronUp size={16} className="text-[#9ca3af]" /> : <ChevronDown size={16} className="text-[#9ca3af]" />}
                </div>
              </div>

              {q.expanded && (
                <div className="px-5 pb-5 flex flex-col gap-4 border-t border-[#f3f4f6]">
                  <div className="pt-4">
                    <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1.5">Question</label>
                    <textarea
                      value={q.question_text}
                      onChange={(e) => updateQuestion(qIdx, "question_text", e.target.value)}
                      placeholder="Type your question here..."
                      rows={2}
                      className={inputCls + " resize-none"}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-1.5">Type</label>
                    <div className="flex gap-2">
                      {(["multiple_choice", "true_false", "short_answer"] as const).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => changeType(qIdx, t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                            q.question_type === t
                              ? "bg-[#0a0a0a] text-white border-[#0a0a0a]"
                              : "bg-white text-[#6b7280] border-[#e5e7eb] hover:border-[#9ca3af]"
                          }`}
                        >
                          {t.replace("_", " ")}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#6b7280] uppercase tracking-wide mb-2">
                      {q.question_type === "short_answer" ? "Correct answer" : "Answer options (select correct)"}
                    </label>
                    <div className="flex flex-col gap-2">
                      {q.answers.map((a, aIdx) => (
                        <div key={aIdx} className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => q.question_type !== "short_answer" && setCorrect(qIdx, aIdx)}
                            className={`shrink-0 transition ${q.question_type === "short_answer" ? "cursor-default" : ""}`}
                          >
                            {a.is_correct
                              ? <CheckCircle2 size={18} className="text-[#16a34a]" />
                              : <Circle size={18} className="text-[#d1d5db] hover:text-[#9ca3af]" />
                            }
                          </button>
                          <input
                            type="text"
                            value={a.answer_text}
                            onChange={(e) => updateAnswer(qIdx, aIdx, "answer_text", e.target.value)}
                            placeholder={q.question_type === "short_answer" ? "Expected answer..." : `Option ${aIdx + 1}`}
                            disabled={q.question_type === "true_false"}
                            className="flex-1 px-3 py-2 border border-[#e5e7eb] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] disabled:bg-[#f9fafb] disabled:text-[#6b7280]"
                          />
                          {q.question_type === "multiple_choice" && q.answers.length > 2 && (
                            <button onClick={() => removeAnswer(qIdx, aIdx)} className="text-[#d1d5db] hover:text-red-400 transition">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {q.question_type === "multiple_choice" && (
                      <button
                        type="button"
                        onClick={() => addAnswer(qIdx)}
                        className="mt-2 flex items-center gap-1.5 text-[#16a34a] text-xs font-medium hover:underline"
                      >
                        <PlusCircle size={13} /> Add option
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={() => setQuestions((prev) => [...prev, newQuestion()])}
            className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#d1d5db] rounded-2xl text-[#6b7280] text-sm font-medium hover:border-[#16a34a] hover:text-[#16a34a] transition"
          >
            <PlusCircle size={16} /> Add Question
          </button>

          <div className="flex gap-3">
            <button
              onClick={() => router.replace("/teacher/tests")}
              className="flex-1 py-3 border border-[#e5e7eb] text-[#374151] rounded-xl font-medium text-sm hover:bg-[#f9fafb] transition"
            >
              Save as Draft
            </button>
            <button
              onClick={handleSaveQuestions}
              disabled={saving}
              className="flex-1 py-3 bg-[#0a0a0a] text-white rounded-xl font-semibold text-sm hover:bg-[#16a34a] transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Test"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}