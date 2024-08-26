<template>
  <div ref="threeContainer" style="width: 100%; height: 100vh;"></div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import testHover from "@/lib/test-hover.ts";

const threeContainer = ref(null);

onMounted(() => {
  const parent = threeContainer.value
  testHover(parent)
});
</script>

<!--<style>-->
<!--body {-->
<!--  margin: 0;-->
<!--  overflow: hidden;-->
<!--}-->
<!--</style>-->
