"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { login } from "@/lib/api";
import { Eye, EyeOff, BookOpen } from "lucide-react";

export default function LoginPage() {
  const { setUser, setAccessToken } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      setAccessToken(data.access_token);

      // --- URL SANITIZATION FIX ---
      const rawBaseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
      
      // 1. Remove any trailing slashes from the configured environment variable
      let cleanBaseUrl = rawBaseUrl.replace(/\/$/, "");
      
      // 2. Fallback check: If the user forgot 'https://' on Railway, force it.
      // Otherwise, the browser appends it as a relative path to your frontend URL.
      if (!cleanBaseUrl.startsWith("http://") && !cleanBaseUrl.startsWith("https://")) {
        cleanBaseUrl = `https://${cleanBaseUrl}`;
      }

      // Fetch user profile securely using the scrubbed url
      const res = await fetch(`${cleanBaseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${data.access_token}` },
      });
      // ----------------------------

      if (res.ok) {
        const user = await res.json();
        setUser(user);
        router.replace(user.role === "evaluator" ? "/teacher" : "/student");
      } else {
        // fallback: decode role from token or redirect to default
        router.replace("/");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0a0a0a] flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ASAK</span>
        </div>
        <div>
          <blockquote className="text-[#f0fdf4] text-3xl font-light leading-snug mb-6">
            "Assessment is the bridge between teaching and learning."
          </blockquote>
          <div className="flex gap-4 mt-8">
            {[
              { label: "Tests Created", val: "2,400+" },
              { label: "Students Assessed", val: "18K+" },
              { label: "Avg Score", val: "74%" },
            ].map((s) => (
              <div key={s.label} className="border border-[#374151] rounded-xl p-4 flex-1">
                <div className="text-[#16a34a] font-mono font-bold text-2xl">{s.val}</div>
                <div className="text-[#6b7280] text-xs mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[#374151] text-sm">© 2025 ASAK. Built for educators.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex flex-col justify-center px-8 lg:px-16">
        <div className="max-w-md w-full mx-auto">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-7 h-7 bg-[#16a34a] rounded-lg flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="font-bold text-lg">ASAK</span>
          </div>

          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-1">Welcome back</h1>
          <p className="text-[#6b7280] mb-8">Sign in to your account to continue</p>

          {error && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@school.edu"
                className="w-full px-4 py-3 border border-[#d1d5db] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-[#d1d5db] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition bg-white pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-[#374151]"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full py-3 bg-[#0a0a0a] text-white font-semibold rounded-xl hover:bg-[#16a34a] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#6b7280]">
            No account?{" "}
            <Link href="/auth/register" className="text-[#16a34a] font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}