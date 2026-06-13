import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// Force-override the environment variable if running on Railway production
function getCleanBaseUrl(): string {
  if (typeof window !== "undefined") {
    // If the browser address bar shows you are on Railway, bypass the build cache completely
    if (window.location.hostname.includes("railway.app")) {
      return "https://asak-production-0269.up.railway.app";
    }
  }

  // Fallback cleanup for local development environment
  let cleanBase = BASE_URL.trim().replace(/\/$/, "");
  if (process.env.NODE_ENV === "production" || cleanBase.includes("railway.app")) {
    cleanBase = cleanBase.replace(/^http:\/\//, "https://");
    if (!cleanBase.startsWith("https://")) {
      cleanBase = `https://${cleanBase}`;
    }
  }
  return cleanBase;
}

function getToken(): string | null {
  return Cookies.get("access_token") || null;
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const cleanBase = getCleanBaseUrl();
  
  // Enforce leading slash and remove trailing slashes from path endpoints
  let cleanPath = path.trim().startsWith("/") ? path.trim() : `/${path.trim()}`;
  if (cleanPath.endsWith("/") && cleanPath.length > 1) {
    cleanPath = cleanPath.slice(0, -1);
  }

  const fullUrl = `${cleanBase}${cleanPath}`;

  const res = await fetch(fullUrl, { ...options, headers });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}

// Auth
export async function login(email: string, password: string) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);

  const cleanBase = getCleanBaseUrl();
  const res = await fetch(`${cleanBase}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }

  return res.json();
}

export async function register(data: {
  name: string;
  age: number;
  sex: string;
  email: string;
  password: string;
  role: string;
}) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function logout() {
  return request("/auth/logout", { method: "POST" });
}

export async function getCurrentUser() {
  return request("/auth/me");
}

// Tests (Teacher)
export async function createTest(data: { name: string; description?: string }) {
  return request("/tests/create", { method: "POST", body: JSON.stringify(data) });
}

export async function publishTest(testId: string) {
  return request(`/tests/${testId}/publish`, { method: "PATCH" });
}

export async function addQuestion(
  testId: string,
  data: {
    question_text: string;
    question_type: string;
    question_number: number;
    answers: { answer_text: string; is_correct: boolean }[];
  }
) {
  return request(`/tests/${testId}/questions`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getTestResults(testId: string) {
  return request(`/tests/${testId}/results`);
}

// Tests (Student)
export async function getAvailableTests() {
  return request("/tests/available");
}

export async function searchTests(params: { name?: string; evaluator_id?: string }) {
  const q = new URLSearchParams();
  if (params.name) q.set("name", params.name);
  if (params.evaluator_id) q.set("evaluator_id", params.evaluator_id);
  
  const queryString = q.toString();
  return request(`/tests${queryString ? `?${queryString}` : ""}`);
}

export async function getTestById(testId: string) {
  return request(`/tests/${testId}/questions`);
}

export async function submitTest(
  testId: string,
  answers: {
    question_id: string;
    selected_answer_id?: string;
    answer_text?: string;
  }[]
) {
  return request(`/tests/${testId}/submit`, {
    method: "POST",
    body: JSON.stringify({ answers }),
  });
}

export async function getResultDetail(resultId: string) {
  return request(`/tests/results/${resultId}`);
}

// Teacher: get all their tests
export async function getTeacherTests() {
  return request("/tests");
}