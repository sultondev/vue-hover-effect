<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  createMultiImageEffect,
  type MultiImageEffectController,
} from "../libs/hover-effect/index.ts"
const container = ref<HTMLDivElement | null>(null);

// We will store the effect controller here so we can call effect methods.
// @ts-ignore
let effectController: MultiImageEffectController | undefined;

onMounted(() => {
  // Make sure the ref has a value (the div is in the DOM now).
  if (!container.value) return;

  effectController = createMultiImageEffect({
    parent: container.value,
    images: [
      '/lib-images/images/Img22.webp',
      '/lib-images/images/Img21.webp',
      '/lib-images/images/Img19.webp',
      '/lib-images/images/Img18.webp',
    ],
    displacementImage: '/lib-images/displacements/13.webp',
    hover: true,           // or false if you want manual control
    speedIn: 0.8,
    speedOut: 0.8,
    // ... any other options
  });
});

function goNext() {
  effectController?.next();
}
function goPrev() {
  effectController?.previous();
}

onUnmounted(() => {
  // If your createHoverEffect code attaches listeners or so,
  // you might manually remove them here—though some is handled automatically.
  // There's no explicit destroy in the snippet, but you could add one.
  effectController = undefined;
});
</script>

<template>
  <!-- The container that will hold our effect -->
  <div ref="container" class="distortion-container" />
  <slot name="controllers" :funcs="{goNext,goPrev}"></slot>
</template>


<style scoped>
.distortion-container {
  width: 100%;
  height: 400px;
  /* Optionally, set relative or other styling. */
  position: relative;
  overflow: hidden;
}
</style>
