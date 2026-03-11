<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import type { SingleHoverEffectController, SingleHoverEffectProps } from "../types";
import { DEFAULT_DISPLACEMENT } from "../constants/cdn";

interface Props extends SingleHoverEffectProps {
  distortionClass?: string;
}

const props = defineProps<Props>();

const container = ref<HTMLDivElement | null>(null);
let effectController: SingleHoverEffectController | undefined;
let resizeObserver: ResizeObserver | undefined;

onMounted(async () => {
  if (!container.value) return;

  // Dynamic import keeps Three.js/GSAP out of the SSR bundle
  // and ensures WebGL code only runs in the browser.
  const { createSingleHoverEffect } = await import("../libs/hover-effect");

  effectController = createSingleHoverEffect({
    parent: container.value,
    image1: props.image1,
    image2: props.image2,
    displacementImage: props.displacementImage ?? DEFAULT_DISPLACEMENT,
    imagesRatio: props.imagesRatio,
    intensity: props.intensity,
    intensity1: props.intensity1,
    intensity2: props.intensity2,
    angle: props.angle,
    angle1: props.angle1,
    angle2: props.angle2,
    speed: props.speed,
    speedIn: props.speedIn,
    speedOut: props.speedOut,
    hover: props.hover,
    easing: props.easing,
    video: props.video,
  });

  if (typeof ResizeObserver !== "undefined") {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container.value) {
          effectController?.resize(entry.target.clientWidth, entry.target.clientHeight);
        }
      }
    });
    resizeObserver.observe(container.value);
  }
});

function goNext() {
  effectController?.next();
}
function goPrev() {
  effectController?.previous();
}

onUnmounted(() => {
  effectController = undefined;
  if (resizeObserver && container.value) {
    resizeObserver.unobserve(container.value);
    resizeObserver.disconnect();
  }
});
</script>

<template>
  <div ref="container" class="distortion-container" :class="distortionClass" />
  <slot name="controllers" :funcs="{ goNext, goPrev }"></slot>
</template>

<style>
.distortion-container {
  width: 100%;
  height: 400px;
  position: relative;
  overflow: hidden;
}
</style>
