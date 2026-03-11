<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import type { MultiImageEffectController, MultiImageEffectProps } from "../types";

interface Props extends MultiImageEffectProps {
  distortionClass?: string;
}

const props = defineProps<Props>();

const container = ref<HTMLDivElement | null>(null);
let effectController: MultiImageEffectController | undefined;

onMounted(async () => {
  if (!container.value) return;

  // Dynamic import keeps Three.js/GSAP out of the SSR bundle
  // and ensures WebGL code only runs in the browser.
  const { createMultiImageEffect } = await import("../libs/hover-effect");

  effectController = createMultiImageEffect({
    parent: container.value,
    images: props.images,
    displacementImage: props.displacementImage,
    imagesRatio: props.imagesRatio,
    speedIn: props.speedIn,
    speedOut: props.speedOut,
    intensity1: props.intensity1,
    intensity2: props.intensity2,
    angle1: props.angle1,
    angle2: props.angle2,
    hover: props.hover,
    easing: props.easing,
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

<template>
  <div ref="container" class="distortion-container" :class="distortionClass" />
  <slot name="controllers" :funcs="{ goNext, goPrev }"></slot>
</template>

<style scoped>
.distortion-container {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
}
</style>
