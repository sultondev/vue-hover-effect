/// <reference types="vite/client" />
/// <reference types="vite/client" />

/* eslint-disable */
declare module '*.vue' {
	import type { DefineComponent } from 'vue'
	// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
	const component: DefineComponent<{}, {}, any>
	export default component
}

declare module 'HoverEffectContainer.vue' {
	import type { DefineComponent } from 'vue'
	import type {HoverEffectFnOptions} from "src/types";

	const component: DefineComponent<HoverEffectFnOptions, {}, any>
	export default component
}