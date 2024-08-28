import type { App } from 'vue';
import { HoverEffectContainer } from "src/components";

export default {
	install: (app: App) => {
		app.component('HoverEffectContainer', HoverEffectContainer);
	}
};

export { HoverEffectContainer };