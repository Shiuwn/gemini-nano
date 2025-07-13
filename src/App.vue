<script setup lang="ts">
import ChatDialog from './components/ChatDialog.vue'

</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
    <!-- Chat Dialog -->
    <ChatDialog />
  </div>
</template>

<style scoped>
/* 保留一些特殊的 hover 效果 */
a:hover img {
  filter: drop-shadow(0 0 2em #646cffaa);
}

a:last-child:hover img {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
