<script setup lang="ts">
import {ref, onMounted, toRefs, computed, watch} from "vue"
import HoverEffect from "../lib/hover-effect.ts";
import {HoverEffectFnOptions} from "@/types";
import Image1 from "@/img/Img22.jpg"
import Image2 from "@/img/Img21.jpg"
import displacementImg from "@/img/displacement/8.jpg"
interface PropTypes {
  height?: string
  width?: string
  options: HoverEffectFnOptions
}

const container = ref<HTMLElement | null>(null)
const props = withDefaults(defineProps<PropTypes>(), {
  height: '200px',
  width: '200px'
})

onMounted(()=> {
  const element = container.value
  HoverEffect({
    parent: element,
    ...props.options
  })
})

watch(props.options, (value) => {
  const element = container.value
  HoverEffect({
    parent: element,
    ...props.options,
  })
})

const style = computed(() => {
  return $`
    --box-height: ${height};
    --box-width: ${width};
  `
})
</script>

<template>
   <div ref="container" class="container">
     <img :src="Image1" alt="Image" class="container__img" />
     <img :src="Image2" alt="Image" class="container__img" />
   </div>
</template>

<style lang="postcss" scoped>
.container {
  position: relative;
  height: v-bind(height);
  width: v-bind(width);
  min-height: 100%;
  img {
    width: inherit;
    height: inherit;
    position: absolute;
    left: 0;
    top: 0;
    z-index: -1;
    min-height: 200px;
    min-width: 200px;
    max-width: 100%;
  }
}
</style>
