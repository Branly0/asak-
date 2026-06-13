"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getAvailableTests, getTestById } from "@/lib/api";
import { Test } from "@/types";
import { Search, BookOpen, ArrowRight, Hash } from "lucide-react";

export default function StudentTestsPage() {
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [testIdSearch, setTestIdSearch] = useState("");
  const [idResult, setIdResult] = useState<Test | null>(null);
  const [idError, setIdError] = useState("");
  const [idLoading, setIdLoading] = useState(false);

  useEffect(() => {
    getAvailableTests()
      .then((d) => setTests((d as Test[]) || []))
      .finally(() => setLoading(false));
  }, []);

  async function handleIdSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!testIdSearch.trim()) return;
    setIdLoading(true);
    setIdError("");
    setIdResult(null);
    try {
      const result = await getTestById(testIdSearch.trim()) as Test;
      setIdResult(result);
    } catch (err: unknown) {
      setIdError(err instanceof Error ? err.message : "Test not found");
    } finally {
      setIdLoading(false);
    }
  }

  const filtered = tests.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">Available Tests</h1>
        <p className="text-[#6b7280] mt-1">Search by name or enter a test ID from your teacher</p>
      </div>

      {/* Search by Test ID */}
      <div className="bg-[#0a0a0a] rounded-2xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Hash size={16} className="text-[#16a34a]" />
          <span className="text-white font-semibold text-sm">Search by Test ID</span>
        </div>
        <form onSubmit={handleIdSearch} className="flex gap-3">
          <input
            value={testIdSearch}
            onChange={(e) => setTestIdSearch(e.target.value)}
            placeholder="Paste test ID here (e.g. 3f2a1b4c-...)"
            className="flex-1 px-4 py-2.5 bg-[#1f2937] border border-[#374151] rounded-xl text-white text-sm placeholder-[#6b7280] focus:outline-none focus:ring-2 focus:ring-[#16a34a] font-mono"
          />
          <button
            type="submit"
            disabled={idLoading}
            className="px-5 py-2.5 bg-[#16a34a] text-white rounded-xl text-sm font-semibold hover:bg-[#15803d] transition disabled:opacity-60"
          >
            {idLoading ? "Searching..." : "Find Test"}
          </button>
        </form>

        {idError && (
          <p className="mt-2 text-red-400 text-sm">{idError}</p>
        )}

        {idResult && (
          <div className="mt-3 bg-[#1f2937] border border-[#16a34a]/40 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold text-sm">{idResult.name}</p>
              <p className="text-[#9ca3af] text-xs mt-0.5">{idResult.description || "No description"}</p>
            </div>
            <Link
              href={`/student/take/${idResult.id}`}
              className="flex items-center gap-2 px-4 py-2 bg-[#16a34a] text-white rounded-xl text-sm font-medium hover:bg-[#15803d] transition"
            >
              Take Test <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Name search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by test name..."
          className="w-full pl-10 pr-4 py-3 border border-[#e5e7eb] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-[#6b7280]">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-[#e5e7eb] rounded-2xl">
          <BookOpen size={32} className="text-[#d1d5db] mx-auto mb-3" />
          <p className="text-[#6b7280] font-medium">No tests found</p>
          <p className="text-[#9ca3af] text-sm mt-1">Try a different search or ask your teacher for the test ID</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((test) => (
            <div
              key={test.id}
              className="bg-white border border-[#e5e7eb] rounded-2xl p-5 flex items-center justify-between hover:border-[#9ca3af] transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-center">
                  <BookOpen size={20} className="text-[#16a34a]" />
                </div>
                <div>
                  <p className="font-semibold text-[#0a0a0a]">{test.name}</p>
                  <p className="text-[#9ca3af] text-sm mt-0.5">{test.description || "No description"}</p>
                  <p className="text-[#d1d5db] text-xs font-mono mt-1">{test.id}</p>
                </div>
              </div>
              <Link
                href={`/student/take/${test.id}`}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#16a34a] transition whitespace-nowrap"
              >
                Take Test <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
