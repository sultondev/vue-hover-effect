<script setup lang="ts">
import {ref, onMounted, watch, computed, withDefaults} from "vue"
import HoverEffect from "src/lib/hover-effect.ts";
import 'src/style/style.css'
import type { HoverEffectFnOptions } from "src/types";


const container = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<{
  height?: string
  width?: string
  options?: HoverEffectFnOptions
}>(), {
  options: () => ({
    image1: '/lib-images/images/Img22.webp',
    image2: '/lib-images/images/Img22.webp',
    displacementImage: '/lib-images/displacements/8.webp'
  }),
  height: '100%',
  width: '100%'
})

onMounted(()=> {
  const element = container.value
  HoverEffect({
    parent: element,
    ...props.options
  })
})

watch(props.options, () => {
  const element = container.value
  HoverEffect({
    parent: element,
    ...props.options,
  })
})

const style = computed(() => {
  return `
    --box-height: ${props.height};
    --box-width: ${props.width};
  `
})
</script>

<template>
   <div ref="container" class="container" :style="style">
     <img :src="props.options.image1" alt="Image" class="container__img" />
     <img :src="props.options.image2" alt="Image" class="container__img" />
   </div>
</template>
