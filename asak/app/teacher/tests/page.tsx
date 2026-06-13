"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getTeacherTests, publishTest } from "@/lib/api";
import { Test } from "@/types";
import { PlusCircle, Eye, Lock, Users, Copy, Check } from "lucide-react";

export default function MyTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  useEffect(() => {
    getTeacherTests()
      .then((data: unknown) => setTests((data as Test[]) || []))
      .finally(() => setLoading(false));
  }, []);

  async function handlePublish(testId: string) {
    setPublishing(testId);
    try {
      const updated = await publishTest(testId) as Test;
      setTests((prev) => prev.map((t) => (t.id === testId ? updated : t)));
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Failed to publish");
    } finally {
      setPublishing(null);
    }
  }

  function copyId(testId: string) {
    navigator.clipboard.writeText(testId);
    setCopied(testId);
    setTimeout(() => setCopied(null), 2000);
  }

  const filtered = tests.filter((t) => {
    if (filter === "published") return t.is_published;
    if (filter === "draft") return !t.is_published;
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">My Tests</h1>
          <p className="text-[#6b7280] mt-1">{tests.length} test{tests.length !== 1 ? "s" : ""} total</p>
        </div>
        <Link
          href="/teacher/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#16a34a] transition-colors"
        >
          <PlusCircle size={16} /> New Test
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(["all", "published", "draft"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition capitalize ${
              filter === f
                ? "bg-[#0a0a0a] text-white"
                : "bg-white border border-[#e5e7eb] text-[#6b7280] hover:border-[#9ca3af]"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#6b7280]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#e5e7eb] rounded-2xl">
          <p className="text-[#6b7280] font-medium">No tests found</p>
          <Link href="/teacher/create" className="inline-block mt-3 text-[#16a34a] text-sm hover:underline">
            Create one →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-5 hover:border-[#9ca3af] transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-[#0a0a0a] text-base">{test.name}</h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${
                        test.is_published
                          ? "bg-[#f0fdf4] text-[#16a34a] border-[#bbf7d0]"
                          : "bg-[#f3f4f6] text-[#6b7280] border-[#e5e7eb]"
                      }`}
                    >
                      {test.is_published ? <Eye size={11} /> : <Lock size={11} />}
                      {test.is_published ? "Published" : "Draft"}
                    </span>
                  </div>
                  <p className="text-[#9ca3af] text-sm mb-3">{test.description || "No description"}</p>

                  {/* Test ID */}
                  <div className="flex items-center gap-2">
                    <span className="text-[#9ca3af] text-xs">Test ID:</span>
                    <code className="font-mono text-xs bg-[#f3f4f6] px-2 py-0.5 rounded text-[#374151] truncate max-w-xs">
                      {test.id}
                    </code>
                    <button
                      onClick={() => copyId(test.id)}
                      className="text-[#9ca3af] hover:text-[#16a34a] transition"
                      title="Copy test ID"
                    >
                      {copied === test.id ? <Check size={14} className="text-[#16a34a]" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/teacher/results/${test.id}`}
                    className="flex items-center gap-1.5 px-3 py-2 bg-[#eff6ff] text-[#2563eb] rounded-xl text-sm font-medium hover:bg-[#dbeafe] transition"
                  >
                    <Users size={14} /> Results
                  </Link>
                  {!test.is_published && (
                    <button
                      onClick={() => handlePublish(test.id)}
                      disabled={publishing === test.id}
                      className="flex items-center gap-1.5 px-3 py-2 bg-[#16a34a] text-white rounded-xl text-sm font-medium hover:bg-[#15803d] transition disabled:opacity-60"
                    >
                      <Eye size={14} />
                      {publishing === test.id ? "Publishing..." : "Publish"}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-[#f3f4f6] text-[#9ca3af] text-xs font-mono">
                Created {new Date(test.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
