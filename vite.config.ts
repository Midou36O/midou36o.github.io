import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';
import UnoCSS from 'unocss/vite';
import presetIcons from '@unocss/preset-icons';

const config: UserConfig = {
	plugins: [sveltekit(), UnoCSS(
		{
			shortcuts: {
				// Shortcuts go here: Format: " class : "unocss" "
				sm: "640px"
			},
			rules : [
				['m-1', {margin : '0.25 em' }],
			]
		}
	),
	
]
};

export default config;
