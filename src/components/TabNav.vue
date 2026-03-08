<script setup lang="ts">
defineProps<{ activeTab: "list" | "timer" | "history" }>();
const emit = defineEmits<{ "update:activeTab": ["list" | "timer" | "history"] }>();
</script>

<template>
  <nav class="tabs" role="tablist">
    <button
      type="button"
      class="tab"
      :class="{ active: activeTab === 'list' }"
      role="tab"
      :aria-selected="activeTab === 'list'"
      @click="emit('update:activeTab', 'list')"
    >
      List
    </button>
    <button
      type="button"
      class="tab"
      :class="{ active: activeTab === 'timer' }"
      role="tab"
      :aria-selected="activeTab === 'timer'"
      @click="emit('update:activeTab', 'timer')"
    >
      Timer
    </button>
    <button
      type="button"
      class="tab"
      :class="{ active: activeTab === 'history' }"
      role="tab"
      :aria-selected="activeTab === 'history'"
      @click="emit('update:activeTab', 'history')"
    >
      History
    </button>
  </nav>
</template>

<style scoped>
.tabs {
  display: flex;
  gap: 0.25rem;
}

.tab {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  cursor: pointer;
}

.tab:hover {
  background: var(--bg-hover);
}

.tab.active {
  background: var(--accent);
  color: var(--accent-text);
  border-color: var(--accent);
}
</style>
