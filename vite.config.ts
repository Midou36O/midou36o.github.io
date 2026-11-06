// import adapter from '@sveltejs/adapter-auto'
//import adapter from '@sveltejs/adapter-static'
//import { vitePreprocess } from '@sveltejs/kit/vite'
import { fileURLToPath } from 'node:url';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex, escapeSvelte } from 'mdsvex';
import { codeToHtml } from 'shiki';
import { defineConfig } from 'vite';
import UnoCSS from 'unocss/vite';
//import { defineConfig } from 'vite'
//import presetIcons from '@unocss/preset-icons'
//import presetWebFonts from '@unocss/preset-web-fonts'

export default defineConfig({
	plugins: [
		UnoCSS(),
		/* Self note: Don't add a config between the (), it just overrides the external config. */
		sveltekit({
			// adapter: adapter({
			// 	pages: 'build',
			// 	assets: 'build',
			// 	fallback: null,
			// 	precompress: false,
			// 	strict: false
			// })
			adapter: adapter(),
			extensions: ['.svelte', '.md', '.svx'],
			// Consult https://kit.svelte.dev/docs/integrations#preprocessors
			// for more information about preprocessors
			preprocess: [
				vitePreprocess(),
				mdsvex({
					extensions: ['.md', '.svx'],
					layout: fileURLToPath(new URL('./src/lib/blog/+post.svelte', import.meta.url)),
					highlight: {
						highlighter: async (code, lang) => {
							const html = escapeSvelte(
								await codeToHtml(code, { lang: lang || 'text', theme: 'dracula' })
							);
							return `{@html \`${html}\`}`;
						},
						alias: { js: 'javascript', sh: 'bash' }
					}
				})
			]
		})
	],
	server: { port: 3000 },
	preview: { port: 3020 }
});
