<script setup lang="ts">
import { computed, ref } from "vue";
import TodoItem from "./TodoItem.vue";
import type { Todo } from "../types/todo";

const props = defineProps<{ todos: Todo[] }>();
const emit = defineEmits<{
  add: [title: string];
  toggle: [id: string];
  delete: [id: string];
}>();

const sortTodos = computed(() => {
  return props.todos.toSorted((a, b) => {
    if (a.completed && !b.completed) {
      return 1;
    } else if (b.completed && !a.completed) {
      return -1;
    }
    return 1;
  })
});

const newTitle = ref("");
function submit() {
  const title = newTitle.value.trim();
  if (title) {
    emit("add", title);
    newTitle.value = "";
  }
}
</script>

<template>
  <section class="panel todo-panel" role="tabpanel">
    <form class="add-form" @submit.prevent="submit">
      <input
        v-model="newTitle"
        type="text"
        class="input"
        placeholder="What to do?"
        aria-label="New todo title"
        autocomplete="off"
      />
      <button type="submit" class="btn btn-primary">Add</button>
    </form>
    <ul class="todo-list" aria-label="Todo list">
      <TodoItem
        v-for="todo in sortTodos"
        :key="todo.id"
        :todo="todo"
        @toggle="(id) => emit('toggle', id)"
        @delete="(id) => emit('delete', id)"
      />
    </ul>
    <p v-if="todos.length === 0" class="empty">No todos yet. Add one above.</p>
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

.add-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.input {
  flex: 1;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 1rem;
  background: var(--bg);
  color: var(--text);
}

.input:focus {
  outline: none;
  border-color: var(--accent);
}

.todo-list {
  max-height: 45vh;
  overflow-y: auto;
  list-style: none;
  padding: 0;
  margin: 0;
}

.empty {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 1rem;
}
</style>
