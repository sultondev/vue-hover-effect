<template>
  <div ref="container" class="distortion-container" />
  <slot name="controllers" :funcs="{ goNext, goPrev }"></slot>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import type { SingleHoverEffectController } from "../types";

const container = ref<HTMLDivElement | null>(null);
let effectController: SingleHoverEffectController | undefined;

onMounted(async () => {
  if (!container.value) return;

  const { createSingleHoverEffect } = await import("../libs/hover-effect");

  effectController = createSingleHoverEffect({
    parent: container.value,
    image1: '/lib-images/images/Img22.webp',
    image2: '/lib-images/images/Img21.webp',
    displacementImage: '/lib-images/displacements/13.webp',
    hover: true,
    speedIn: 0.8,
    speedOut: 0.8,
  });
});

function goNext() {
  effectController?.next();
}
function goPrev() {
  effectController?.previous();
}

onUnmounted(() => {
  effectController = undefined;
});
</script>

<style scoped>
.distortion-container {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
}
</style>
