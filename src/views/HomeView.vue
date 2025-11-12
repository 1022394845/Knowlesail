<template>
  <div class="home-view">
    <ChatInterface />
  </div>
</template>

<script setup>
import ChatInterface from '@/components/Home/ChatInterface.vue'
</script>

<style scoped>
.home-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
</style>
