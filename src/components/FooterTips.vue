<script setup lang="ts">
defineProps<{ finished: number, todo: number }>();
</script>

<template>
    <footer class="footer-tips">
        <h3>Today you have finished {{ finished || 0 }} things</h3>
        <h3>But still have {{ todo || 0 }} not complete, rush!</h3>
    </footer>
</template>

<style scoped>
.footer-tips {
    position: sticky;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    flex-direction: column;
    align-items: center;
    border-top: 1px solid #e0e0e0;
    padding: 0.2em;
    background-color: aliceblue;
}

h3 {
  font-size: 1.2em; /* 设置相同的字体大小 */
  margin: 0.5em 0; /* 可选：增加一些间距 */
}

/* 完成的任务使用绿色 */
h3:first-of-type {
  color: #28a745; /* 绿色，代表成功 */
}

/* 未完成的任务使用橙色 */
h3:last-of-type {
  color: #ffc107; /* 橙色，代表需要关注 */
}
</style>