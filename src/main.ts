import type { App } from 'vue';
import { HoverEffectContainer } from "src/components";
import 'src/style.css'
import {createApp} from "vue";
import AppVue from 'src/App.vue'

export default {
	install: (app: App) => {
		app.component('HoverEffectContainer', HoverEffectContainer);
	}
};

createApp(AppVue).mount('#app')

export { HoverEffectContainer };