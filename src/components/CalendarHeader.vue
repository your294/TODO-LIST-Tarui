<!-- src/components/CalendarHeader.vue -->
<script setup lang="ts">
import { computed }  from 'vue'
interface Props {
  year: number;
  month: number; // 0-based (0 = Jan, 11 = Dec)
}

const props = defineProps<Props>();

// 格式化显示月份和年份，例如 "March 2026"
const displayMonthYear = computed(() => {
  const date = new Date(props.year, props.month, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
});

// 定义 emit 事件
const emit = defineEmits<{
  (e: 'prev'): void;
  (e: 'next'): void;
  // 可选：未来可加 (e: 'goToday'): void;
}>();
</script>

<template>
  <div class="calendar-header">
    <button
      type="button"
      class="nav-btn"
      aria-label="Previous month"
      @click="emit('prev')"
    >
      &lt;
    </button>
    <h3 class="month-title">{{ displayMonthYear }}</h3>
    <button
      type="button"
      class="nav-btn"
      aria-label="Next month"
      @click="emit('next')"
    >
      &gt;
    </button>
  </div>
</template>

<style scoped>
.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
}

.nav-btn {
  background: none;
  border: 1px solid var(--border);
  width: 2rem;
  height: 2rem;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  color: var(--text);
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover {
  background-color: var(--background-hover);
}
</style>