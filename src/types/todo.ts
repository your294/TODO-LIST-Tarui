export interface Todo {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
  /** ISO date string when the todo was completed; cleared when marked incomplete or when day flushes */
  completedAt?: string;
}

export const STORE_KEY_TODOS = "todos";

/** One day's summary: how many todos completed and how many seconds in focus timer */
export interface DailyStats {
  date: string; // YYYY-MM-DD
  completedCount: number;
  focusSeconds: number;
}

/** One focus timer session within the current day */
export interface TodayFocusSession {
  todoId: string | null;
  /** Duration of this session in seconds */
  seconds: number;
}
