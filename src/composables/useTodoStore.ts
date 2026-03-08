import { ref, onMounted } from "vue";
import { load } from "@tauri-apps/plugin-store";
import type { Store } from "@tauri-apps/plugin-store";
import type { Todo, DailyStats, TodayFocusSession } from "../types/todo";
import { STORE_KEY_TODOS } from "../types/todo";

const STORE_PATH = "store.json";
const STORE_KEY_LAST_OPEN_DATE = "lastOpenDate";
const STORE_KEY_HISTORY = "history";
const STORE_KEY_FOCUS_SECONDS_BY_DATE = "focusSecondsByDate";
let store: Store | null = null;

function todayLocalYYYYMMDD(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function normalizeTodo(t: Todo): Todo {
  return {
    ...t,
    completedAt: t.completed ? t.completedAt ?? t.createdAt : undefined,
  };
}

async function ensureStore(): Promise<Store> {
  if (!store) {
    store = await load(STORE_PATH, { defaults: {} });
  }
  return store;
}

function dateFromISO(iso: string): string {
  return iso.slice(0, 10);
}

export function useTodoStore() {
  const todos = ref<Todo[]>([]);
  const history = ref<DailyStats[]>([]);
  const todaySessions = ref<TodayFocusSession[]>([]);

  async function loadTodos() {
    const s = await ensureStore();
    const raw = await s.get<Todo[]>(STORE_KEY_TODOS);
    const list = Array.isArray(raw) ? raw.map(normalizeTodo) : [];
    const today = todayLocalYYYYMMDD();
    const lastOpen = (await s.get<string>(STORE_KEY_LAST_OPEN_DATE)) ?? "";
    const focusByDate =
      (await s.get<Record<string, number>>(STORE_KEY_FOCUS_SECONDS_BY_DATE)) ??
      {};
    const historyRaw = await s.get<DailyStats[]>(STORE_KEY_HISTORY);
    const historyList = Array.isArray(historyRaw) ? historyRaw : [];

    if (lastOpen !== today) {
      if (lastOpen) {
        const completedCount = list.filter(
          (item) => item.completedAt && dateFromISO(item.completedAt) === lastOpen
        ).length;
        const focusSeconds = focusByDate[lastOpen] ?? 0;
        historyList.push({
          date: lastOpen,
          completedCount,
          focusSeconds,
        });
        await s.set(STORE_KEY_HISTORY, historyList);
        delete focusByDate[lastOpen];
        await s.set(STORE_KEY_FOCUS_SECONDS_BY_DATE, focusByDate);
      }
      list.forEach((item) => {
        item.completed = false;
        delete item.completedAt;
      });
      await s.set(STORE_KEY_TODOS, list);
      await s.set(STORE_KEY_LAST_OPEN_DATE, today);
      await s.save();
    }

    todos.value = list;
    history.value = historyList.sort(
      (a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0)
    );
  }

  async function addFocusTime(seconds: number) {
    if (seconds <= 0) return;
    const s = await ensureStore();
    const today = todayLocalYYYYMMDD();
    const focusByDate =
      (await s.get<Record<string, number>>(STORE_KEY_FOCUS_SECONDS_BY_DATE)) ??
      {};
    focusByDate[today] = (focusByDate[today] ?? 0) + seconds;
    await s.set(STORE_KEY_FOCUS_SECONDS_BY_DATE, focusByDate);
    await s.save();
  }

  function addTodaySession(todoId: string | null, seconds: number) {
    if (seconds <= 0) return;
    todaySessions.value.push({ todoId, seconds });
  }

  async function saveTodos() {
    const s = await ensureStore();
    await s.set(STORE_KEY_TODOS, todos.value);
    await s.save();
  }

  function addTodo(title: string) {
    const t = title.trim();
    if (!t) return;
    todos.value.push({
      id: crypto.randomUUID(),
      title: t,
      completed: false,
      createdAt: new Date().toISOString(),
    });
    saveTodos();
  }

  function toggleTodo(id: string) {
    const item = todos.value.find((x) => x.id === id);
    if (item) {
      item.completed = !item.completed;
      if (item.completed) {
        item.completedAt = new Date().toISOString();
      } else {
        delete item.completedAt;
      }
      saveTodos();
    }
  }

  function deleteTodo(id: string) {
    todos.value = todos.value.filter((x) => x.id !== id);
    saveTodos();
  }

  onMounted(() => {
    loadTodos();
  });

  return {
    todos,
    history,
    todaySessions,
    loadTodos,
    addTodo,
    toggleTodo,
    deleteTodo,
    addFocusTime,
    addTodaySession,
  };
}
