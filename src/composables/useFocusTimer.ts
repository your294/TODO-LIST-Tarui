import { ref } from "vue";
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from "@tauri-apps/plugin-notification";
import type { Todo } from "../types/todo";

const DEFAULT_DURATION_MIN = 25;
export const DURATION_PRESETS = [1, 15, 25, 45] as const;

export type TimerStatus = "idle" | "running" | "paused";

export function useFocusTimer(
  getTodos: () => Todo[],
  options?: {
    onFocusTime?: (focusSeconds: number) => void;
    onSessionComplete?: (focusSeconds: number, todoId: string | null) => void;
  }
) {
  const remainingSec = ref(DEFAULT_DURATION_MIN * 60);
  const status = ref<TimerStatus>("idle");
  const selectedDurationMin = ref(DEFAULT_DURATION_MIN);
  const selectedTodoId = ref<string | null>(null);

  let interval: ReturnType<typeof setInterval> | null = null;
  let targetAt: number | null = null;
  let sessionStartRemaining = 0;

  async function notifyTimerDone() {
    let granted = await isPermissionGranted();
    if (!granted) {
      const permission = await requestPermission();
      granted = permission === "granted";
    }
    if (granted) {
      const task = getTodos().find((t) => t.id === selectedTodoId.value);
      const body = task ? `Completed: ${task.title}` : "Focus session done.";
      sendNotification({ title: "Timer finished", body });
    } else {
      console.error('---The user deny our notification permission---')
    }
  }

  function updateFromClock() {
    if (targetAt == null) return;
    const msLeft = targetAt - Date.now();
    const secLeft = Math.max(0, Math.round(msLeft / 1000));
    remainingSec.value = secLeft;
    if (secLeft <= 0) {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
      const elapsed = sessionStartRemaining;
      if (elapsed > 0) {
        options?.onFocusTime?.(elapsed);
        options?.onSessionComplete?.(elapsed, selectedTodoId.value);
      }
      targetAt = null;
      status.value = "idle";
      remainingSec.value = selectedDurationMin.value * 60;
      notifyTimerDone();
    }
  }

  function start() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    sessionStartRemaining = remainingSec.value;
    targetAt = Date.now() + remainingSec.value * 1000;
    status.value = "running";
    interval = setInterval(updateFromClock, 1000);
  }

  function pause() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    if (targetAt != null) {
      const msLeft = targetAt - Date.now();
      const secLeft = Math.max(0, Math.round(msLeft / 1000));
      const elapsed = Math.max(0, sessionStartRemaining - secLeft);
      if (elapsed > 0) options?.onFocusTime?.(elapsed);
      remainingSec.value = secLeft;
    }
    targetAt = null;
    status.value = "paused";
  }

  function reset() {
    if (interval) {
      clearInterval(interval);
      interval = null;
    }
    targetAt = null;
    status.value = "idle";
    remainingSec.value = selectedDurationMin.value * 60;
  }

  function setDuration(min: number) {
    if (status.value !== "running") {
      selectedDurationMin.value = min;
      if (status.value === "idle") {
        remainingSec.value = min * 60;
      }
    }
  }

  function formatTime(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  return {
    remainingSec,
    status,
    selectedDurationMin,
    selectedTodoId,
    start,
    pause,
    reset,
    setDuration,
    formatTime,
  };
}
