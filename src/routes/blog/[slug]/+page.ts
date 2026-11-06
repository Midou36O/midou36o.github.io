import { error } from '@sveltejs/kit';
import type { MarkdownPost } from '#lib/types.ts';
import type { PageLoad } from './$types';

const posts = import.meta.glob<MarkdownPost>('../posts/mds/*.md');

export const load = (async ({ params }) => {
	const loadPost = posts[`../posts/mds/${params.slug}.md`];
	if (!loadPost) {
		error(404, `Could not find ${params.slug}`);
	}

	const post = await loadPost();
	return {
		content: post.default,
		meta: post.metadata
	};
}) satisfies PageLoad;
