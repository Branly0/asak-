import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

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

  // Clean the BASE_URL to ensure it doesn't end with a slash, 
  // and ensure path starts with a single slash.
  const cleanBase = BASE_URL.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
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

  const cleanBase = BASE_URL.replace(/\/$/, "");
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
  return request(`/tests?${q.toString()}`); // Cleaned trailing slash before query string
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
  return request("/tests"); // Cleaned trailing slash
}