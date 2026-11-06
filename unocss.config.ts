import {
	defineConfig,
	presetIcons,
	presetTypography,
	transformerVariantGroup,
	transformerDirectives,
	presetWind3
} from 'unocss';

import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	extractors: [extractorSvelte()],

	presets: [
		presetIcons(),
		presetTypography({
			cssExtend: {
				'h1,h2,h3,h4,h5,h6': {
					'font-weight': '800'
				}
			}
		}),
		presetWind3({
			dark: 'media'
			/* use dark: "class"  when adding manual JS*/
		})
	],

	theme: {
		fontFamily: {
			primary: ['var(--font-primary)'],
			sans: ['Outfit Variable', 'Comic Sans MS', 'sans-serif'],
			mono: ['Fira Code Variable', 'monospace']
		},
		margin: {
			'0-auto': '0 auto'
		},
		colors: {
			accent: 'var(--accent)',
			accentTranslucent: 'var(--accent-translucent)',
			primary: 'var(--primary)',
			secondary: 'var(--secondary)',
			tertiary: 'var(--tertiary)',
			text: 'var(--text)',
			grey: 'var(--grey)',
			alt: 'var(--alt)',
			altText: 'var(--alt-text)'
		},
		breakpoints: {
			sm: '640px',
			md: '768px',
			lg: '1024px',
			xl: '1280px',
			'2xl': '1536px',
			nav: '1030px'
		}
	},

	transformers: [transformerVariantGroup(), transformerDirectives()]
});
