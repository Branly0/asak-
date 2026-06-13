"use client";
import Link from "next/link";
import { Trophy, ArrowRight } from "lucide-react";

// This page would normally fetch past results for the student
// The backend doesn't expose a "my results" endpoint, so we link to a placeholder
export default function MyResultsPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0a0a0a]">My Results</h1>
        <p className="text-[#6b7280] mt-1">Track your performance across all tests</p>
      </div>

      <div className="text-center py-20 border-2 border-dashed border-[#e5e7eb] rounded-2xl">
        <Trophy size={40} className="text-[#f59e0b] mx-auto mb-4" />
        <p className="text-[#374151] font-semibold text-lg mb-1">No results yet</p>
        <p className="text-[#9ca3af] text-sm mb-5">Take a test to see your results here</p>
        <Link
          href="/student/tests"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0a0a0a] text-white rounded-xl text-sm font-medium hover:bg-[#16a34a] transition"
        >
          Browse Tests <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
