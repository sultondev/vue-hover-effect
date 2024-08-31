import type { App } from 'vue';
import { HoverEffectContainer } from "src/components";
import 'src/style.css'

export default {
	install: (app: App) => {
		app.component('HoverEffectContainer', HoverEffectContainer);
	}
};

export { HoverEffectContainer };