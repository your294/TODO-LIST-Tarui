<script setup lang="ts">
import type { DailyStats } from "../types/todo";

defineProps<{ history: DailyStats[] }>();

function formatFocusTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
</script>

<template>
  <section class="panel history-panel" role="tabpanel">
    <h2 class="history-title">History</h2>
    <p class="history-desc">Completed todos and focus time per day.</p>
    <ul class="history-list" aria-label="Daily history">
      <li
        v-for="day in history"
        :key="day.date"
        class="history-item"
      >
        <time class="history-date" :datetime="day.date">
          {{ formatDate(day.date) }}
        </time>
        <div class="history-stats">
          <span class="stat">
            <span class="stat-value">{{ day.completedCount }}</span>
            <span class="stat-label">todos done</span>
          </span>
          <span class="stat">
            <span class="stat-value">{{ formatFocusTime(day.focusSeconds) }}</span>
            <span class="stat-label">focus time</span>
          </span>
        </div>
      </li>
    </ul>
    <p v-if="history.length === 0" class="empty">No history yet. Complete todos and use the timer to see daily stats here.</p>
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

.history-panel {
  padding-top: 0.5rem;
}

.history-title {
  font-size: 1.2rem;
  margin: 0 0 0.25rem 0;
}

.history-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1.25rem 0;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.history-item {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 1rem;
}

.history-date {
  font-weight: 500;
  color: var(--text);
  min-width: 10rem;
}

.history-stats {
  display: flex;
  gap: 1.25rem;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.stat-value {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.empty {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-top: 1rem;
}
</style>
