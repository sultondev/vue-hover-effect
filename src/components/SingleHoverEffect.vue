<script lang="ts" setup>
import { ref, onMounted, onUnmounted } from "vue";
import {
  createSingleHoverEffect, type SingleHoverEffectController, type SingleHoverEffectOptions,
} from "../libs/hover-effect/index.ts"

interface Props {
  hoverOptions?: SingleHoverEffectOptions;
  distortionClass?: string;
}


const container = ref<HTMLDivElement | null>(null);
// We will store the effect controller here so we can call effect methods.
let effectController: SingleHoverEffectController | undefined;
let resizeObserver: ResizeObserver | undefined;

const {
  hoverOptions = {
    image1:  '/lib-images/images/Img22.webp',
    image2:  '/lib-images/images/Img21.webp',
    displacementImage:  '/lib-images/displacements/3.webp',
    hover:  true,
    speedIn:  0.8,
    speedOut:  0.8,
  },
  distortionClass = ''
} = defineProps<Props>()
onMounted(() => {
  // Make sure the ref has a value (the div is in the DOM now).
  if (!container.value) return;
  effectController = createSingleHoverEffect({
    ...hoverOptions,
    parent: container.value,
    image1: hoverOptions.image1,
    image2: hoverOptions.image2,
    displacementImage: hoverOptions.displacementImage,
    hover: hoverOptions.hover,
    speedIn: hoverOptions.speedIn,
    speedOut: hoverOptions.speedOut,
  });


  // Create a ResizeObserver to watch for changes in the container’s size
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === container.value) {
          // Let's re-trigger the effect’s resizing logic.
          // We can do this in two ways:
          // 1) If you expose a 'resize()' method from createSingleHoverEffect, call that
          //    - or -
          // 2) Force a manual "window.resize" event or re-run its logic if you have it.

          // For the singleHoverEffect snippet, the effect itself
          // listens to window "resize" events. We can simulate that:

          // window.dispatchEvent(new Event("resize"));
          effectController?.resize(entry.target?.clientWidth, entry.target?.clientHeight)
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
  <!-- The container that will hold our effect -->
  <div ref="container" class="distortion-container" :class="distortionClass" />
  <slot name="controllers" :funcs="{goNext,goPrev}"></slot>
</template>

<style>
.distortion-container {
  width: 100%;
  height: 400px;
  /* Optionally, set relative or other styling. */
  position: relative;
  overflow: hidden;
}
</style>
