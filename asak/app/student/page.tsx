"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getAvailableTests } from "@/lib/api";
import { Test } from "@/types";
import { Search, BookOpen, ArrowRight, ClipboardList } from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableTests()
      .then((d) => setTests((d as Test[]) || []))
      .finally(() => setLoading(false));
  }, []);

  const recent = tests.slice(0, 4);

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">
          Hello, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-[#6b7280] mt-1">Ready to test your knowledge today?</p>
      </div>

      {/* Search by ID card */}
      <div className="bg-[#0a0a0a] rounded-2xl p-6 mb-8 flex items-center gap-6">
        <div className="flex-1">
          <p className="text-[#bbf7d0] text-xs font-semibold uppercase tracking-widest mb-1">Have a test code?</p>
          <h2 className="text-white text-xl font-bold mb-1">Enter Test ID</h2>
          <p className="text-[#6b7280] text-sm">Your teacher will share a unique ID for each test</p>
        </div>
        <Link
          href="/student/tests"
          className="flex items-center gap-2 px-5 py-3 bg-[#16a34a] text-white rounded-xl font-semibold text-sm hover:bg-[#15803d] transition whitespace-nowrap"
        >
          <Search size={16} />
          Search by ID
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Available Tests", value: tests.length, bg: "bg-[#f0fdf4]", border: "border-[#bbf7d0]", color: "text-[#16a34a]" },
          { label: "Tests Taken", value: "—", bg: "bg-[#eff6ff]", border: "border-[#bfdbfe]", color: "text-[#2563eb]" },
          { label: "Avg Score", value: "—", bg: "bg-[#f5f3ff]", border: "border-[#ddd6fe]", color: "text-[#8b5cf6]" },
        ].map((s) => (
          <div key={s.label} className={`${s.bg} border ${s.border} rounded-2xl p-5`}>
            <p className="text-[#6b7280] text-xs font-medium mb-1">{s.label}</p>
            <p className={`font-mono font-bold text-3xl ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Available tests */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <h2 className="font-semibold text-[#0a0a0a]">Available Tests</h2>
          <Link href="/student/tests" className="text-sm text-[#16a34a] hover:underline flex items-center gap-1">
            Browse all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6b7280] text-sm">Loading tests...</div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <ClipboardList size={32} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[#6b7280] font-medium">No tests available yet</p>
            <p className="text-[#9ca3af] text-sm mt-1">Ask your teacher to publish a test</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f3f4f6]">
            {recent.map((test) => (
              <div key={test.id} className="flex items-center justify-between px-6 py-4 hover:bg-[#fafafa] transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#f0fdf4] border border-[#bbf7d0] rounded-xl flex items-center justify-center">
                    <BookOpen size={18} className="text-[#16a34a]" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-[#0a0a0a]">{test.name}</p>
                    <p className="text-[#9ca3af] text-xs mt-0.5">{test.description || "No description"}</p>
                  </div>
                </div>
                <Link
                  href={`/student/take/${test.id}`}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#16a34a] transition"
                >
                  Take Test <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
