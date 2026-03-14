<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { DailyStats } from "../types/todo";
import CalendarHeader from './CalendarHeader.vue'; // 👈 导入

const props = defineProps<{ history: DailyStats[] }>();

// 将 history 转为 Map，便于 O(1) 查找
const historyMap = computed(() => {
  const map = new Map<string, DailyStats>();
  props.history.forEach(day => {
    map.set(day.date, day);
  });
  return map;
});

// 当前选中的日期（默认选今天，或最近有数据的一天）
const selectedDate = ref<string | null>(null);

// 日历相关逻辑
const today = new Date();
const currentMonth = ref(today.getMonth());
const currentYear = ref(today.getFullYear());

// 获取某年某月的所有日期（用于渲染日历）
function getDaysInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const days: Date[] = [];
  // 补全上个月的空白（从周日开始）
  const startDayOfWeek = firstDay.getDay(); // 0 = Sunday
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(firstDay);
    prevDate.setDate(-i);
    days.push(prevDate);
  }
  // 本月日期
  for (let d = 1; d <= lastDay.getDate(); d++) {
    days.push(new Date(year, month, d));
  }
  // 补全下个月的空白（到周六）
  const remaining = 42 - days.length; // 6周 * 7天 = 42
  for (let d = 1; d <= remaining; d++) {
    if (month === 11) {
        days.push(new Date(year + 1, 0, d))
    } else {
        days.push(new Date(year, month + 1, d))
    }
  }
  console.log(days);
  return days;
}

const calendarDays = computed(() => {
  return getDaysInMonth(currentYear.value, currentMonth.value);
});

function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // 0-based → +1
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isCurrentMonth(date: Date): boolean {
  return date.getMonth() === currentMonth.value && date.getFullYear() === currentYear.value;
}

function hasData(date: Date): boolean {
  return historyMap.value.has(formatDateKey(date));
}

function selectDate(date: Date) {
  if (!isCurrentMonth(date)) return; // 只允许选择当前月的日期（可选）
  selectedDate.value = formatDateKey(date);
}

function navigateMonth(direction: 'prev' | 'next') {
  if (direction === 'prev') {
    if (currentMonth.value === 0) {
      currentYear.value--;
      currentMonth.value = 11;
    } else {
      currentMonth.value--;
    }
  } else {
    if (currentMonth.value === 11) {
      currentYear.value++;
      currentMonth.value = 0;
    } else {
      currentMonth.value++;
    }
  }
  // 自动选中该月第一天（如果有数据）或清空
  selectedDate.value = null;
}

// 初始化选中日期：优先选今天，否则选最近有数据的一天
onMounted(() => {
  const todayKey = formatDateKey(today);
  if (historyMap.value.has(todayKey)) {
    selectedDate.value = todayKey;
  } else if (props.history.length > 0) {
    // 选最新的一天
    const sorted = [...props.history].sort((a, b) => 
      b.date.localeCompare(a.date)
    );
    selectedDate.value = sorted[0].date;
  }
});

// 格式化专注时间（复用你原有的函数）
function formatFocusTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (s === 0) return `${m} min`;
  return `${m} min ${s}s`;
}
</script>

<template>
  <section class="panel history-panel" role="tabpanel">
    <!-- <h2 class="history-title">History Calendar</h2>
    <p class="history-desc">Click a date to view completed todos and focus time.</p> -->

    <!-- 使用新组件 -->
    <CalendarHeader
      :year="currentYear"
      :month="currentMonth"
      @prev="navigateMonth('prev')"
      @next="navigateMonth('next')"
    />

    <!-- 日历网格（保持不变） -->
    <div class="calendar-grid">
      <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="calendar-weekday">
        {{ day }}
      </div>
      <div
        v-for="day in calendarDays"
        :key="day.toISOString()"
        class="calendar-day"
        :class="{
          'other-month': !isCurrentMonth(day),
          'has-data': hasData(day),
          'selected': selectedDate === formatDateKey(day),
          'today': formatDateKey(day) === formatDateKey(new Date()),
        }"
        @click="selectDate(day)"
      >
        {{ day.getDate() }}
      </div>
    </div>

    <!-- 详情区域（保持不变） -->
    <div v-if="selectedDate" class="selected-day-detail">
      <h4 class="detail-date">
        {{ new Date(selectedDate).toLocaleDateString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) }}
      </h4>
      <div class="history-stats">
        <span class="stat">
          <span class="stat-value">{{ historyMap.get(selectedDate)?.completedCount ?? 0 }}</span>
          <span class="stat-label">todos done</span>
        </span>
        <span class="stat">
          <span class="stat-value">{{ formatFocusTime(historyMap.get(selectedDate)?.focusSeconds ?? 0) }}</span>
          <span class="stat-label">focus time</span>
        </span>
      </div>
    </div>

    <p v-else-if="history.length === 0" class="empty">
      No history yet. Complete todos and use the timer to see daily stats here.
    </p>
    <p v-else class="empty">
      Select a date from the calendar above to view details.
    </p>
  </section>
</template>

<!-- 样式部分：移除 .calendar-nav 相关样式（已移到 CalendarHeader.vue） -->
<style scoped>
.panel { animation: fade 0.15s ease; }

@keyframes fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.history-panel {
  padding-top: 0.5rem;
  height: 70%;
  overflow-y: auto;
}

.history-title {
  font-size: 1.2rem;
  margin: 0 0 0.25rem 0;
}

.history-desc {
  font-size: 0.9rem;
  color: var(--text-muted);
  margin: 0 0 1rem 0;
}

/* 日历网格 */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: 1.5rem;
}

.calendar-weekday {
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  padding: 0.25rem 0;
}

.calendar-day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  color: var(--text);
  background: transparent;
  border: 1px solid transparent;
}

.calendar-day.other-month {
  color: #808080; /* 中等灰色 */
  background: #f0f0f0; /* 非常浅的灰色背景 */
}

.calendar-day.has-data {
  background-color: var(--background-accent); /* 你需要定义这个 CSS 变量，或换成具体颜色 */
  /* 例如：background-color: #e6f7ff; */
}

.calendar-day.today {
  border: 2px solid var(--primary); /* 今日高亮边框 */
}

.calendar-day.selected {
  background-color: var(--primary);
  color: white;
}

.calendar-day:hover:not(.other-month) {
  background-color: var(--background-hover);
}

/* 选中日期详情 */
.selected-day-detail {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.detail-date {
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
  font-weight: 500;
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
  text-align: center;
}
</style>