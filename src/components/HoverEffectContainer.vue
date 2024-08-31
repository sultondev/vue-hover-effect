<script setup lang="ts">
import {ref, onMounted, watch, computed} from "vue"
import HoverEffect from "src/lib/hover-effect.ts";
import {HoverEffectFnOptions} from "src/types";
import 'src/style/main.css'
// import Image1 from "/img/Img22.jpg"
// import Image2 from "/img/Img21.jpg"
// const HoverEffect = (await import('../lib/anchor-tune')).default

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
