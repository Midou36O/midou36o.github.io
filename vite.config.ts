import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import presetIcons from '@unocss/preset-icons';

const config: UserConfig = {
	plugins: [sveltekit(), UnoCSS(),
		/* Self note: Don't add a config between the (), it just overrides the external config. */
	
]
};

export default config;
