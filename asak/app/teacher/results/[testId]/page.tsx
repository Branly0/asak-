"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getTestResults } from "@/lib/api";
import { TestResultsDashboard, TestResultSummary } from "@/types";
import ScoreRing from "@/components/ui/ScoreRing";
import { Trophy, ArrowUp, ArrowDown, Minus, Users, TrendingUp, Medal } from "lucide-react";

export default function TestResultsPage() {
  const { testId } = useParams<{ testId: string }>();
  const [data, setData] = useState<TestResultsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<"score" | "name" | "date">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [error, setError] = useState("");

  useEffect(() => {
    getTestResults(testId)
      .then((d) => setData(d as TestResultsDashboard))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [testId]);

  function toggleSort(field: typeof sort) {
    if (sort === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSort(field); setSortDir("desc"); }
  }

  const sorted = [...(data?.results ?? [])].sort((a, b) => {
    let cmp = 0;
    if (sort === "score") cmp = a.score - b.score;
    else if (sort === "name") cmp = a.student_name.localeCompare(b.student_name);
    else cmp = new Date(a.submitted_at).getTime() - new Date(b.submitted_at).getTime();
    return sortDir === "asc" ? cmp : -cmp;
  });

  const avg = data?.results.length
    ? Math.round(data.results.reduce((s, r) => s + r.score, 0) / data.results.length)
    : 0;
  const highest = data?.results.length ? Math.max(...data.results.map((r) => r.score)) : 0;
  const passed = data?.results.filter((r) => r.score >= 50).length ?? 0;

  function SortIcon({ field }: { field: typeof sort }) {
    if (sort !== field) return <Minus size={12} className="text-[#d1d5db]" />;
    return sortDir === "desc" ? <ArrowDown size={12} className="text-[#16a34a]" /> : <ArrowUp size={12} className="text-[#16a34a]" />;
  }

  function rankBadge(rank: number) {
    if (rank === 1) return <Medal size={16} className="text-yellow-500" />;
    if (rank === 2) return <Medal size={16} className="text-gray-400" />;
    if (rank === 3) return <Medal size={16} className="text-amber-700" />;
    return <span className="font-mono text-[#9ca3af] text-xs">#{rank}</span>;
  }

  // Score-sorted for rank assignment
  const rankMap = new Map<string, number>();
  [...(data?.results ?? [])].sort((a, b) => b.score - a.score).forEach((r, i) => {
    rankMap.set(r.student_id, i + 1);
  });

  if (loading) return <div className="text-center py-16 text-[#6b7280]">Loading results...</div>;
  if (error) return <div className="text-center py-16 text-red-500">{error}</div>;
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">{data.test_name}</h1>
        <p className="text-[#6b7280] mt-1">Results Dashboard</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: "Students", value: data.results.length, icon: <Users size={18} className="text-[#2563eb]" />, bg: "bg-[#eff6ff]", border: "border-[#bfdbfe]" },
          { label: "Average Score", value: `${avg}%`, icon: <TrendingUp size={18} className="text-[#16a34a]" />, bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]" },
          { label: "Highest Score", value: `${highest}%`, icon: <Trophy size={18} className="text-yellow-500" />, bg: "bg-[#fffbeb]", border: "border-[#fde68a]" },
          { label: "Pass Rate", value: `${data.results.length ? Math.round((passed / data.results.length) * 100) : 0}%`, icon: <Medal size={18} className="text-[#8b5cf6]" />, bg: "bg-[#f5f3ff]", border: "border-[#ddd6fe]" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-4`}>
            <div className="flex items-center gap-2 mb-1">
              {s.icon}
              <span className="text-xs text-[#6b7280] font-medium">{s.label}</span>
            </div>
            <p className="font-mono font-bold text-2xl text-[#0a0a0a]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Top 3 highlight */}
      {sorted.length >= 3 && (
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-[#374151] uppercase tracking-wide mb-3">Top Performers</h2>
          <div className="grid grid-cols-3 gap-4">
            {[...data.results]
              .sort((a, b) => b.score - a.score)
              .slice(0, 3)
              .map((r, i) => (
                <div
                  key={r.student_id}
                  className={`rounded-2xl p-4 border text-center ${
                    i === 0
                      ? "bg-gradient-to-b from-yellow-50 to-white border-yellow-200"
                      : i === 1
                      ? "bg-gradient-to-b from-gray-50 to-white border-gray-200"
                      : "bg-gradient-to-b from-amber-50 to-white border-amber-200"
                  }`}
                >
                  <div className="flex justify-center mb-3">
                    <ScoreRing score={r.score} size={72} />
                  </div>
                  <p className="font-semibold text-sm text-[#0a0a0a] truncate">{r.student_name}</p>
                  <p className="text-[#9ca3af] text-xs mt-0.5 truncate">{r.student_email}</p>
                  <div className="mt-2 flex justify-center">
                    {rankBadge(i + 1)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6]">
          <h2 className="font-semibold text-[#0a0a0a]">All Results</h2>
        </div>

        {data.results.length === 0 ? (
          <div className="p-12 text-center text-[#6b7280]">No submissions yet for this test.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#6b7280] text-xs font-semibold uppercase tracking-wide bg-[#f9fafb]">
                <th className="px-6 py-3">Rank</th>
                <th className="px-6 py-3">
                  <button className="flex items-center gap-1 hover:text-[#0a0a0a]" onClick={() => toggleSort("name")}>
                    Student <SortIcon field="name" />
                  </button>
                </th>
                <th className="px-6 py-3">
                  <button className="flex items-center gap-1 hover:text-[#0a0a0a]" onClick={() => toggleSort("score")}>
                    Score <SortIcon field="score" />
                  </button>
                </th>
                <th className="px-6 py-3">Questions</th>
                <th className="px-6 py-3">
                  <button className="flex items-center gap-1 hover:text-[#0a0a0a]" onClick={() => toggleSort("date")}>
                    Submitted <SortIcon field="date" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const rank = rankMap.get(r.student_id) ?? 0;
                return (
                  <tr key={r.student_id} className="border-t border-[#f3f4f6] hover:bg-[#fafafa] transition">
                    <td className="px-6 py-4 w-12">
                      <div className="flex justify-center">{rankBadge(rank)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#f0fdf4] border border-[#bbf7d0] flex items-center justify-center">
                          <span className="text-[#16a34a] font-bold text-xs">{r.student_name[0]?.toUpperCase()}</span>
                        </div>
                        <div>
                          <p className="font-medium text-sm text-[#0a0a0a]">{r.student_name}</p>
                          <p className="text-xs text-[#9ca3af]">{r.student_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <ScoreRing score={r.score} size={40} strokeWidth={4} />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-sm text-[#374151]">
                      {Math.round((r.score / 100) * r.total_questions)}/{r.total_questions}
                    </td>
                    <td className="px-6 py-4 text-[#9ca3af] text-sm font-mono">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
