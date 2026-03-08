<script setup lang="ts">
import { computed, ref, unref } from "vue";
import { useTodoStore } from "./composables/useTodoStore";
import { useFocusTimer } from "./composables/useFocusTimer";
import TabNav from "./components/TabNav.vue";
import TodoListPanel from "./components/TodoListPanel.vue";
import TimerPanel from "./components/TimerPanel.vue";
import HistoryPanel from "./components/HistoryPanel.vue";
import FooterTips from "./components/FooterTips.vue";

const activeTab = ref<"list" | "timer" | "history">("list");
const todoStore = useTodoStore();
const timer = useFocusTimer(() => todoStore.todos.value, {
  onFocusTime: (seconds) => todoStore.addFocusTime(seconds),
  onSessionComplete: (seconds, todoId) =>
    todoStore.addTodaySession(todoId, seconds),
});
// computed finished todos
const finishedCount = computed(() => {
  const finishedTodos = todoStore.todos.value.filter((thing) => thing.completed);
  return finishedTodos.length;
})
// computed unfinished
const unfinishedCount = computed(() => {
  return todoStore.todos.value.length - finishedCount.value
});

function handleDeleteTodo(id: string) {
  todoStore.deleteTodo(id);
  if (timer.selectedTodoId.value === id) {
    timer.selectedTodoId.value = null;
  }
}

function setSelectedTodoId(v: string | null) {
  timer.selectedTodoId.value = v;
}
</script>

<template>
  <main class="app">
    <header class="header">
      <h1 class="title">My Todos</h1>
      <TabNav v-model:active-tab="activeTab" />
    </header>

    <TodoListPanel
      v-show="activeTab === 'list'"
      :todos="unref(todoStore.todos)"
      @add="todoStore.addTodo"
      @toggle="todoStore.toggleTodo"
      @delete="handleDeleteTodo"
    />

    <TimerPanel
      v-show="activeTab === 'timer'"
      :todos="unref(todoStore.todos)"
      :remaining-sec="unref(timer.remainingSec)"
      :status="unref(timer.status)"
      :selected-duration-min="unref(timer.selectedDurationMin)"
      :selected-todo-id="unref(timer.selectedTodoId)"
      :format-time="timer.formatTime"
      :today-sessions="unref(todoStore.todaySessions)"
      @update:selected-todo-id="setSelectedTodoId"
      @start="timer.start()"
      @pause="timer.pause()"
      @reset="timer.reset()"
      @set-duration="timer.setDuration"
    />

    <HistoryPanel
      v-show="activeTab === 'history'"
      :history="unref(todoStore.history)"
    />

    <FooterTips
      v-if="activeTab === 'list'"
      :finished="finishedCount"
      :todo="unfinishedCount"
    />
  </main>
</template>

<style scoped>
.app {
  max-width: 520px;
  margin: 0 auto;
  padding: 1.5rem;
  height: 100vh;
  box-sizing: border-box;

  overflow-y: hidden;
}

.header {
  margin-bottom: 1.5rem;
}

.title {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem 0;
}
</style>

<style>
:root {
  font-family: Inter, Avenir, Helvetica, Arial, sans-serif;
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  color: var(--text);
  background-color: var(--bg);
  --text: #0f0f0f;
  --text-muted: #6b6b6b;
  --bg: #f6f6f6;
  --bg-hover: #ebebeb;
  --border: #d0d0d0;
  --accent: #396cd8;
  --accent-text: #fff;
  font-synthesis: none;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

@media (prefers-color-scheme: dark) {
  :root {
    --text: #f6f6f6;
    --text-muted: #a0a0a0;
    --bg: #2f2f2f;
    --bg-hover: #3a3a3a;
    --border: #4a4a4a;
    --accent: #5a8ef0;
    --accent-text: #fff;
  }
}

.btn {
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  border: 1px solid transparent;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
}

.btn-primary {
  background: var(--accent);
  color: var(--accent-text);
  border-color: var(--accent);
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
}

.btn-secondary:hover {
  background: var(--bg-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--text-muted);
  border: none;
}

.btn-ghost:hover {
  color: var(--text);
}
</style>
