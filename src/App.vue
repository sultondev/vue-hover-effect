<script setup lang="ts">
import SingleHoverEffect from "./components/SingleHoverEffect.vue";
</script>

<template>
  <SingleHoverEffect
    image1="/lib-images/images/Img22.webp"
    image2="/lib-images/images/Img21.webp"
    displacement-image="/lib-images/displacements/3.webp"
    distortion-class="my-b"
    :hover="true"
    :speed-in="0.8"
    :speed-out="0.8"
  >
<!--    <template #controllers="{funcs}" >-->
<!--      <button @click="funcs.goPrev()">Prev</button>-->
<!--      <button @click="funcs.goNext()">Next</button>-->
<!--    </template>-->
  </SingleHoverEffect>
</template>

<style>
.my-b {
  width: 400px;
  height: 400px;
}

@media (max-width: 1400px) {
  .my-b {
    width: 800px;
    height: 800px;
  }
}
</style>
