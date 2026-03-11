# vue-hover-effect

> WebGL-powered image hover transition effects for Vue 3, built on top of [Three.js](https://threejs.org/) and [GSAP](https://gsap.com/). Inspired by [Robin Delaporte's hover-effect](https://github.com/robin-dela/hover-effect).

## Features

- GPU-accelerated displacement map transitions between images
- Two ready-to-use components: single two-image transition and multi-image carousel
- Manual control via `next` / `previous` slot methods
- Video texture support
- Fully typed props — TypeScript autocompletion out of the box
- SSR / Nuxt compatible — Three.js and GSAP are lazy-loaded client-side only

---

## Installation

```bash
# npm
npm install vue-hover-effect

# pnpm
pnpm add vue-hover-effect

# yarn
yarn add vue-hover-effect
```

### Peer dependencies

Three.js and GSAP are peer dependencies. Install them alongside the package:

```bash
npm install three gsap
```

---

## Usage

### SingleHoverEffect

Transitions between two images on hover (or manually via `next` / `previous`).

```vue
<script setup lang="ts">
import { SingleHoverEffect } from 'vue-hover-effect'
</script>

<template>
  <SingleHoverEffect
    image1="/images/photo-a.webp"
    image2="/images/photo-b.webp"
    displacement-image="/displacements/displacement.webp"
  />
</template>
```

#### With custom size

Use the `distortion-class` prop to apply your own CSS class to the canvas container:

```vue
<template>
  <SingleHoverEffect
    image1="/images/photo-a.webp"
    image2="/images/photo-b.webp"
    displacement-image="/displacements/displacement.webp"
    distortion-class="my-effect"
  />
</template>

<style>
.my-effect {
  width: 600px;
  height: 400px;
}
</style>
```

#### With manual controls

Use the `controllers` slot to wire up your own buttons. The slot exposes `funcs.goNext()` and `funcs.goPrev()`:

```vue
<template>
  <SingleHoverEffect
    image1="/images/photo-a.webp"
    image2="/images/photo-b.webp"
    displacement-image="/displacements/displacement.webp"
    :hover="false"
    distortion-class="my-effect"
  >
    <template #controllers="{ funcs }">
      <button @click="funcs.goPrev()">Previous</button>
      <button @click="funcs.goNext()">Next</button>
    </template>
  </SingleHoverEffect>
</template>
```

#### With all options

```vue
<template>
  <SingleHoverEffect
    image1="/images/photo-a.webp"
    image2="/images/photo-b.webp"
    displacement-image="/displacements/displacement.webp"
    :images-ratio="1.5"
    :intensity="0.8"
    :speed-in="1.2"
    :speed-out="0.9"
    easing="power2.out"
    :hover="true"
  />
</template>
```

#### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `image1` | `string` | Yes | — | URL of the first image |
| `image2` | `string` | Yes | — | URL of the second image |
| `displacementImage` | `string` | Yes | — | URL of the displacement map texture |
| `imagesRatio` | `number` | No | `1.0` | Aspect ratio of the images (width / height) |
| `intensity` | `number` | No | `1` | Distortion intensity fallback for both images |
| `intensity1` | `number` | No | `1` | Distortion intensity for the first image |
| `intensity2` | `number` | No | `1` | Distortion intensity for the second image |
| `angle` | `number` | No | `Math.PI / 4` | Displacement rotation angle fallback |
| `angle1` | `number` | No | — | Rotation angle for the first image |
| `angle2` | `number` | No | — | Rotation angle for the second image |
| `speed` | `number` | No | — | Transition speed fallback for both directions |
| `speedIn` | `number` | No | `1.6` | Duration (seconds) of the enter transition |
| `speedOut` | `number` | No | `1.2` | Duration (seconds) of the exit transition |
| `hover` | `boolean` | No | `true` | Trigger transitions automatically on hover |
| `easing` | `string` | No | `'expo.out'` | GSAP easing string |
| `video` | `boolean` | No | `false` | Treat `image1` / `image2` as `<video>` sources |
| `distortionClass` | `string` | No | `''` | CSS class applied to the canvas container element |

---

### MultipleHoverEffect

Cycles through an array of images with displacement transitions. Requires at least two images.

```vue
<script setup lang="ts">
import { MultipleHoverEffect } from 'vue-hover-effect'
</script>

<template>
  <MultipleHoverEffect
    :images="[
      '/images/photo-a.webp',
      '/images/photo-b.webp',
      '/images/photo-c.webp',
    ]"
    displacement-image="/displacements/displacement.webp"
  />
</template>
```

#### With manual controls

```vue
<template>
  <MultipleHoverEffect
    :images="[
      '/images/photo-a.webp',
      '/images/photo-b.webp',
      '/images/photo-c.webp',
    ]"
    displacement-image="/displacements/displacement.webp"
    :hover="false"
    distortion-class="my-gallery"
  >
    <template #controllers="{ funcs }">
      <button @click="funcs.goPrev()">Previous</button>
      <button @click="funcs.goNext()">Next</button>
    </template>
  </MultipleHoverEffect>
</template>
```

#### Props

| Prop | Type | Required | Default | Description |
|---|---|---|---|---|
| `images` | `string[]` | Yes | — | Array of image URLs (minimum 2) |
| `displacementImage` | `string` | Yes | — | URL of the displacement map texture |
| `imagesRatio` | `number` | No | `1.0` | Aspect ratio of the images (width / height) |
| `intensity1` | `number` | No | `1` | Distortion intensity for the current image |
| `intensity2` | `number` | No | `1` | Distortion intensity for the next image |
| `angle1` | `number` | No | `Math.PI / 4` | Rotation angle for the current image |
| `angle2` | `number` | No | — | Rotation angle for the next image |
| `speedIn` | `number` | No | `1.2` | Duration (seconds) of the forward transition |
| `speedOut` | `number` | No | `1.0` | Duration (seconds) of the backward transition |
| `hover` | `boolean` | No | `false` | Advance to next image on hover |
| `easing` | `string` | No | `'expo.out'` | GSAP easing string |
| `distortionClass` | `string` | No | `''` | CSS class applied to the canvas container element |

---

## TypeScript

All prop types are exported and can be imported for use in your own components or composables:

```ts
import type {
  SingleHoverEffectProps,
  MultiImageEffectProps,
  SingleHoverEffectOptions,
  MultiImageEffectOptions,
  SingleHoverEffectController,
  MultiImageEffectController,
} from 'vue-hover-effect'
```

`SingleHoverEffectProps` and `MultiImageEffectProps` are the component-facing types (without `parent`, which is handled internally). `SingleHoverEffectOptions` / `MultiImageEffectOptions` are the full option types accepted by the underlying factory functions.

---

## Nuxt

The components are SSR-safe out of the box. Three.js and GSAP are dynamically imported inside `onMounted`, so they are never included in the server bundle and no WebGL code runs during server-side rendering.

No extra configuration is needed. Just import and use:

```vue
<!-- pages/index.vue -->
<script setup lang="ts">
import { SingleHoverEffect } from 'vue-hover-effect'
</script>

<template>
  <SingleHoverEffect
    image1="/images/photo-a.webp"
    image2="/images/photo-b.webp"
    displacement-image="/displacements/displacement.webp"
  />
</template>
```

If you prefer an explicit client-only guarantee, Nuxt's built-in `<ClientOnly>` wrapper also works:

```vue
<template>
  <ClientOnly>
    <SingleHoverEffect
      image1="/images/photo-a.webp"
      image2="/images/photo-b.webp"
      displacement-image="/displacements/displacement.webp"
    />
  </ClientOnly>
</template>
```

---

## Global registration

You can register both components globally in your Vue app:

```ts
// main.ts
import { createApp } from 'vue'
import { SingleHoverEffect, MultipleHoverEffect } from 'vue-hover-effect'
import App from './App.vue'

const app = createApp(App)
app.component('SingleHoverEffect', SingleHoverEffect)
app.component('MultipleHoverEffect', MultipleHoverEffect)
app.mount('#app')
```

For Nuxt, register them in a plugin:

```ts
// plugins/vue-hover-effect.client.ts
import { SingleHoverEffect, MultipleHoverEffect } from 'vue-hover-effect'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('SingleHoverEffect', SingleHoverEffect)
  nuxtApp.vueApp.component('MultipleHoverEffect', MultipleHoverEffect)
})
```

---

## Using the factory functions directly

The underlying factory functions are also exported for headless usage without the Vue components:

```ts
import { createSingleHoverEffect, createMultiImageEffect } from 'vue-hover-effect'

const controller = createSingleHoverEffect({
  parent: document.querySelector('#my-container') as HTMLElement,
  image1: '/images/photo-a.webp',
  image2: '/images/photo-b.webp',
  displacementImage: '/displacements/displacement.webp',
  speedIn: 1.2,
  speedOut: 0.9,
  hover: true,
})

// Manual control
controller?.next()     // transition to image2
controller?.previous() // transition back to image1
controller?.resize()   // recalculate on container resize
```

---

## License

MIT — [Sultonkhon](https://sulton.dev/)
