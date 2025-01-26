<script setup lang="ts">
import { onMounted, ref } from "vue";
import HoverEffect from "hover-effect";

interface HoverEffectProps {
  image1: string;
  image2: string;
  displacementImage: string;
  intensity?: number;
  speedIn?: number;
  speedOut?: number;
  angle?: number;
}

const props = withDefaults(defineProps<HoverEffectProps>(), {
  intensity: 0.5,
  speedIn: 1,
  speedOut: 1,
  angle: Math.PI / 4,
});

const container = ref<HTMLDivElement | null>(null);

onMounted(() => {
  if (container.value) {
    new HoverEffect({
      parent: container.value,
      image1: props.image1,
      image2: props.image2,
      displacementImage: props.displacementImage,
      intensity: props.intensity,
      speedIn: props.speedIn,
      speedOut: props.speedOut,
      angle: props.angle,
    });
  }
});
</script>

<template>
  <div ref="container" class="hover-effect-container"></div>
</template>

<style scoped>
.hover-effect-container {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>
