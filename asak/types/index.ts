export type UserRole = "evaluator" | "pupil";
export type UserSex = "male" | "female";
export type QuestionType = "multiple_choice" | "true_false" | "short_answer";

export interface User {
  id: string;
  name: string;
  age: number;
  sex: UserSex;
  role: UserRole;
  email: string;
  created_at: string;
  updated_at?: string;
}

export interface Answer {
  id: string;
  answer_number: number;
  answer_text: string;
  is_correct: boolean;
}

export interface Question {
  id: string;
  question_text: string;
  question_type: QuestionType;
  question_number: number;
  answers: Answer[];
}

export interface Test {
  id: string;
  name: string;
  description?: string;
  is_published: boolean;
  evaluator_id: string;
  created_at: string;
  updated_at?: string;
}

export interface TestWithQuestions extends Test {
  questions: Question[];
}

export interface StudentAnswerResult {
  id: string;
  question_id: string;
  selected_answer_id?: string;
  answer_text?: string;
  is_correct: boolean;
  question_text?: string;
  correct_answer_id?: string;
  correct_answer_text?: string;
}

export interface Result {
  id: string;
  test_id: string;
  pupil_id: string;
  score: number;
  total_questions: number;
  submitted_at: string;
  student_answers?: StudentAnswerResult[];
}

export interface TestResultSummary {
  student_id: string;
  student_name: string;
  student_email: string;
  score: number;
  total_questions: number;
  submitted_at: string;
}

export interface TestResultsDashboard {
  test_id: string;
  test_name: string;
  results: TestResultSummary[];
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
