"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { register } from "@/lib/api";
import { BookOpen } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", age: "", sex: "male", email: "", password: "", role: "pupil",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, val: string) {
    setForm((f) => ({ ...f, [field]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({ ...form, age: parseInt(form.age) });
      router.replace("/auth/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full px-4 py-3 border border-[#d1d5db] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#16a34a] focus:border-transparent transition bg-white";

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-center px-6 py-12">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="font-bold text-xl">ASAK</span>
        </div>

        <h1 className="text-3xl font-bold text-[#0a0a0a] mb-1">Create account</h1>
        <p className="text-[#6b7280] mb-8">Join ASAK as a teacher or student</p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Role selector */}
          <div className="flex gap-3">
            {[
              { val: "evaluator", label: "Teacher" },
              { val: "pupil", label: "Student" },
            ].map((r) => (
              <button
                type="button"
                key={r.val}
                onClick={() => update("role", r.val)}
                className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition ${
                  form.role === r.val
                    ? "border-[#16a34a] bg-[#f0fdf4] text-[#16a34a]"
                    : "border-[#d1d5db] text-[#6b7280] hover:border-[#9ca3af]"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Full name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              required
              placeholder="Jane Doe"
              className={inputCls}
            />
          </div>

          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Age</label>
              <input
                type="number"
                value={form.age}
                onChange={(e) => update("age", e.target.value)}
                required
                min={5}
                max={100}
                placeholder="25"
                className={inputCls}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#374151] mb-1.5">Sex</label>
              <select
                value={form.sex}
                onChange={(e) => update("sex", e.target.value)}
                className={inputCls}
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
              placeholder="you@school.edu"
              className={inputCls}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1.5">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
              placeholder="••••••••"
              className={inputCls}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full py-3 bg-[#0a0a0a] text-white font-semibold rounded-xl hover:bg-[#16a34a] transition-colors disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#6b7280]">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-[#16a34a] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
