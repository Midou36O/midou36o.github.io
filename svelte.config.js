// import adapter from '@sveltejs/adapter-auto';
//import adapter from '@sveltejs/adapter-static';
import adapter from '@sveltejs/adapter-node';
//import { vitePreprocess } from '@sveltejs/kit/vite';
import { mdsvex, escapeSvelte } from 'mdsvex';
import shiki from 'shiki';
import math from 'remark-math';
import rehype from 'remark-rehype';
import rehypeKatex from 'rehype-katex';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: [
		mdsvex({
			extensions: ['.md', 'svx'],
			layout: 'src/lib/blog/+post.svelte',
			highlight: {
				highlighter: async (code, lang = 'text') => {
					const highlighter = await shiki.getHighlighter({ theme: 'dracula' });
					const html = escapeSvelte(highlighter.codeToHtml(code, { lang }));
					return `{@html \`${html}\` }`;
				},
				alias: {
					js: 'javascript',
					sh: 'bash',
					glsl: 'glsl'
				}
			},
			remarkPlugins: [[math, rehype]],
			rehypePlugins: [[rehypeKatex]]
		})
	],
	extensions: ['.svelte', '.md', '.svx'],

	kit: {
		// adapter: adapter({
		// 	pages: 'build',
		// 	assets: 'build',
		// 	fallback: null,
		// 	precompress: false,
		// 	strict: false
		// })
		adapter: adapter()
	}
};

export default config;
