"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { getTeacherTests } from "@/lib/api";
import { Test } from "@/types";
import { FileText, Users, TrendingUp, PlusCircle, BookOpen, Eye, ArrowRight } from "lucide-react";

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherTests()
      .then((data: unknown) => setTests((data as Test[]) || []))
      .catch(() => setTests([]))
      .finally(() => setLoading(false));
  }, []);

  const published = tests.filter((t) => t.is_published);
  const drafts = tests.filter((t) => !t.is_published);
  const recentTests = tests.slice(0, 5);

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0a0a0a]">
            Good morning, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-[#6b7280] mt-1">Here's what's happening with your tests today</p>
        </div>
        <Link
          href="/teacher/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#16a34a] transition-colors"
        >
          <PlusCircle size={16} />
          New Test
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        {[
          {
            label: "Total Tests",
            value: tests.length,
            icon: <FileText size={20} className="text-[#16a34a]" />,
            bg: "bg-[#f0fdf4]",
            border: "border-[#bbf7d0]",
          },
          {
            label: "Published",
            value: published.length,
            icon: <Eye size={20} className="text-[#2563eb]" />,
            bg: "bg-[#eff6ff]",
            border: "border-[#bfdbfe]",
          },
          {
            label: "Drafts",
            value: drafts.length,
            icon: <BookOpen size={20} className="text-[#f59e0b]" />,
            bg: "bg-[#fffbeb]",
            border: "border-[#fde68a]",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`${s.bg} border ${s.border} rounded-2xl p-5 flex items-center gap-4`}
          >
            <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shadow-sm">
              {s.icon}
            </div>
            <div>
              <p className="text-[#6b7280] text-xs font-medium">{s.label}</p>
              <p className="text-[#0a0a0a] font-mono font-bold text-2xl">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tests list */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#f3f4f6] flex items-center justify-between">
          <h2 className="font-semibold text-[#0a0a0a]">Recent Tests</h2>
          <Link href="/teacher/tests" className="text-sm text-[#16a34a] hover:underline flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-[#6b7280] text-sm">Loading tests...</div>
        ) : recentTests.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen size={32} className="text-[#d1d5db] mx-auto mb-3" />
            <p className="text-[#6b7280] font-medium">No tests yet</p>
            <p className="text-[#9ca3af] text-sm mt-1">Create your first test to get started</p>
            <Link
              href="/teacher/create"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#0a0a0a] text-white rounded-xl text-sm hover:bg-[#16a34a] transition-colors"
            >
              <PlusCircle size={14} /> Create Test
            </Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-[#6b7280] text-xs font-semibold uppercase tracking-wide bg-[#f9fafb]">
                <th className="px-6 py-3">Test Name</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Created</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentTests.map((test, i) => (
                <tr
                  key={test.id}
                  className={`border-t border-[#f3f4f6] hover:bg-[#fafafa] transition ${
                    i % 2 === 0 ? "" : "bg-[#fafafa]"
                  }`}
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-[#0a0a0a] text-sm">{test.name}</p>
                    <p className="text-[#9ca3af] text-xs mt-0.5 truncate max-w-xs">
                      {test.description || "No description"}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        test.is_published
                          ? "bg-[#f0fdf4] text-[#16a34a] border border-[#bbf7d0]"
                          : "bg-[#f3f4f6] text-[#6b7280] border border-[#e5e7eb]"
                      }`}
                    >
                      {test.is_published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[#6b7280] text-sm font-mono">
                    {new Date(test.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/teacher/results/${test.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#eff6ff] text-[#2563eb] rounded-lg text-xs font-medium hover:bg-[#dbeafe] transition"
                      >
                        <Users size={13} />
                        Results
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
