"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { logout } from "@/lib/api";
import {
  BookOpen, LayoutDashboard, FileText, Users, LogOut, Search, ClipboardList, Trophy,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const teacherNav: NavItem[] = [
  { href: "/teacher", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/teacher/tests", label: "My Tests", icon: <FileText size={18} /> },
  { href: "/teacher/create", label: "Create Test", icon: <ClipboardList size={18} /> },
];

const studentNav: NavItem[] = [
  { href: "/student", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { href: "/student/tests", label: "Available Tests", icon: <Search size={18} /> },
  { href: "/student/results", label: "My Results", icon: <Trophy size={18} /> },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isTeacher = user?.role === "evaluator";
  const nav = isTeacher ? teacherNav : studentNav;

  async function handleLogout() {
    try { await logout(); } catch {}
    signOut();
    router.replace("/auth/login");
  }

  return (
    <aside className="w-64 min-h-screen bg-[#0a0a0a] flex flex-col fixed left-0 top-0 z-40">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1f2937]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#16a34a] rounded-lg flex items-center justify-center">
            <BookOpen size={16} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">ASAK</span>
        </div>
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-[#1f2937]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#16a34a]/20 border border-[#16a34a]/40 flex items-center justify-center">
            <span className="text-[#16a34a] font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-white font-medium text-sm truncate">{user?.name}</p>
            <p className="text-[#6b7280] text-xs capitalize">{isTeacher ? "Teacher" : "Student"}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4">
        <p className="text-[#374151] text-[10px] font-semibold uppercase tracking-widest px-3 mb-2">
          {isTeacher ? "Manage" : "Learn"}
        </p>
        <ul className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    active
                      ? "bg-[#16a34a] text-white"
                      : "text-[#9ca3af] hover:text-white hover:bg-[#1f2937]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-[#1f2937]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#9ca3af] hover:text-white hover:bg-[#1f2937] transition w-full"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
