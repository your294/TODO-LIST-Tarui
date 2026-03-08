<script setup lang="ts">
import { DURATION_PRESETS } from "../composables/useFocusTimer";
import type { Todo, TodayFocusSession } from "../types/todo";
import type { TimerStatus } from "../composables/useFocusTimer";

defineProps<{
  todos: Todo[];
  remainingSec: number;
  status: TimerStatus;
  selectedDurationMin: number;
  selectedTodoId: string | null;
  formatTime: (sec: number) => string;
  todaySessions: TodayFocusSession[];
}>();

const emit = defineEmits<{
  "update:selectedTodoId": [value: string | null];
  start: [];
  pause: [];
  reset: [];
  setDuration: [min: number];
}>();

const incompleteTodos = (todos: Todo[]) => todos.filter((x) => !x.completed);

function sessionsByTodo(todos: Todo[], sessions: TodayFocusSession[]) {
  const titleById = new Map<string, string>();
  for (const t of todos) {
    titleById.set(t.id, t.title);
  }

  const map = new Map<string, { label: string; count: number }>();
  for (const s of sessions) {
    const key = s.todoId ?? "__none__";
    const label =
      s.todoId != null
        ? titleById.get(s.todoId) ?? "Unknown todo"
        : "No specific todo";
    const existing = map.get(key);
    if (existing) existing.count += 1;
    else map.set(key, { label, count: 1 });
  }
  return Array.from(map.values());
}
</script>

<template>
  <section class="panel timer-panel" role="tabpanel">
    <h2 class="timer-title">Focus timer</h2>
    <div v-if="todaySessions.length" class="sessions-bubble">
      <span class="sessions-icon" aria-hidden="true">⏱</span>
      <div class="sessions-main">
        <span class="sessions-count">
          {{ todaySessions.length }}
          timer{{ todaySessions.length > 1 ? "s" : "" }} today
        </span>
        <ul class="sessions-list">
          <li
            v-for="sum in sessionsByTodo(todos, todaySessions)"
            :key="sum.label"
            class="sessions-item"
          >
            <span class="sessions-todo">{{ sum.label }}</span>
            <span class="sessions-x">×{{ sum.count }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div class="duration-row">
      <span class="duration-label">Duration:</span>
      <div class="duration-btns">
        <button
          v-for="min in DURATION_PRESETS"
          :key="min"
          type="button"
          class="btn btn-duration"
          :class="{ active: selectedDurationMin === min }"
          :disabled="status === 'running'"
          @click="emit('setDuration', min)"
        >
          {{ min }} min
        </button>
      </div>
    </div>
    <div class="task-select-row">
      <label for="timer-task" class="task-label">Focus on (optional):</label>
      <select
        id="timer-task"
        :value="selectedTodoId ?? ''"
        class="select"
        :disabled="status === 'running'"
        @change="
          emit(
            'update:selectedTodoId',
            (($event.target as HTMLSelectElement).value || null) as string | null
          )
        "
      >
        <option :value="null">None</option>
        <option
          v-for="t in incompleteTodos(todos)"
          :key="t.id"
          :value="t.id"
        >
          {{ t.title }}
        </option>
      </select>
    </div>
    <p class="timer-display" aria-live="polite">{{ formatTime(remainingSec) }}</p>
    <div class="timer-actions">
      <template v-if="status === 'idle'">
        <button type="button" class="btn btn-primary" @click="emit('start')">
          Start
        </button>
        <button type="button" class="btn btn-secondary" @click="emit('reset')">
          Reset
        </button>
      </template>
      <template v-else-if="status === 'running'">
        <button type="button" class="btn btn-secondary" @click="emit('pause')">
          Pause
        </button>
      </template>
      <template v-else>
        <button type="button" class="btn btn-primary" @click="emit('start')">
          Resume
        </button>
        <button type="button" class="btn btn-secondary" @click="emit('reset')">
          Reset
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.panel {
  animation: fade 0.15s ease;
}

@keyframes fade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.timer-panel {
  text-align: center;
}

.timer-title {
  font-size: 1.2rem;
  margin: 0 0 1.25rem 0;
}

.sessions-bubble {
  display: inline-flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 999px;
  background: var(--bg-hover);
  border: 1px solid var(--border);
  margin: 0 auto 1rem auto;
}

.sessions-icon {
  font-size: 0.9rem;
}

.sessions-main {
  text-align: left;
}

.sessions-count {
  font-size: 0.85rem;
  font-weight: 600;
  display: block;
  margin-bottom: 0.2rem;
}

.sessions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem 0.75rem;
}

.sessions-item {
  font-size: 0.8rem;
  color: var(--text-muted);
  display: inline-flex;
  gap: 0.25rem;
}

.sessions-todo {
  max-width: 10rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sessions-x {
  font-variant-numeric: tabular-nums;
}

.duration-row,
.task-select-row {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.duration-label,
.task-label {
  font-size: 0.9rem;
  color: var(--text-muted);
}

.duration-btns {
  display: flex;
  gap: 0.35rem;
}

.btn-duration {
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
}

.btn-duration:hover:not(:disabled) {
  background: var(--bg-hover);
}

.btn-duration.active {
  background: var(--accent);
  color: var(--accent-text);
  border-color: var(--accent);
}

.btn-duration:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.select {
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  min-width: 160px;
}

.timer-display {
  font-size: 3rem;
  font-variant-numeric: tabular-nums;
  margin: 1.5rem 0;
  font-weight: 600;
}

.timer-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
