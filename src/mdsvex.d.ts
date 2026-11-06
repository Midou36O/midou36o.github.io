declare module '*.md' {
	import type { MarkdownPost } from '#lib/types.ts';

	export const metadata: MarkdownPost['metadata'];
	const component: MarkdownPost['default'];
	export default component;
}
