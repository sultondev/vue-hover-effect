<script setup lang="ts">
import SingleHoverEffect from "./components/SingleHoverEffect.vue";
</script>

<template>
  <SingleHoverEffect distortion-class="my-b">
<!--    <template #controllers="{funcs}" >-->
<!--      <button @click="funcs.goPrev()">Prev</button>-->
<!--      <button @click="funcs.goNext()">Next</button>-->
<!--    </template>-->
  </SingleHoverEffect>
</template>

<style >
.my-b {
  width: 400px !important;
  height: 400px !important;
}


.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
