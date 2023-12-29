import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
//import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
//import presetIcons from '@unocss/preset-icons';
//import presetWebFonts from '@unocss/preset-web-fonts';

const config: UserConfig = {
	plugins: [
		sveltekit(),
		UnoCSS()
		/* Self note: Don't add a config between the (), it just overrides the external config. */
	],
	optimizeDeps: {
		include: ['dayjs/plugin/relativeTime.js']
	}
};

export default config;
