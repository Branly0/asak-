"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace("/auth/login"); return; }
    if (user.role === "evaluator") router.replace("/teacher");
    else router.replace("/student");
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-full border-2 border-[#16a34a] border-t-transparent animate-spin" />
        <span className="text-sm text-[#6b7280] font-medium">Loading ASAK...</span>
      </div>
    </div>
  );
}
