<script setup lang="ts">
import type { Todo } from "../types/todo";

defineProps<{ todo: Todo }>();
const emit = defineEmits<{
  toggle: [id: string];
  delete: [id: string];
}>();
</script>

<template>
  <li class="todo-item" :class="{ completed: todo.completed }">
    <input
      :id="`todo-${todo.id}`"
      type="checkbox"
      :checked="todo.completed"
      class="checkbox"
      :aria-label="(todo.completed ? 'Mark incomplete: ' : 'Mark complete: ') + todo.title"
      @change="emit('toggle', todo.id)"
    />
    <label :for="`todo-${todo.id}`" class="todo-label">{{ todo.title }}</label>
    <button
      type="button"
      class="btn btn-ghost delete-btn"
      aria-label="Delete this todo"
      @click="emit('delete', todo.id)"
    >
      Delete
    </button>
  </li>
</template>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 0;
  border-bottom: 1px solid var(--border);
}

.todo-item.completed .todo-label {
  text-decoration: line-through;
  color: var(--text-muted);
}

.checkbox {
  width: 1.1rem;
  height: 1.1rem;
  cursor: pointer;
}

.todo-label {
  flex: 1;
  cursor: pointer;
  user-select: none;
}

.delete-btn {
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
  opacity: 0.8;
}

.delete-btn:hover {
  opacity: 1;
}
</style>
