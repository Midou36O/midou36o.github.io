import type { MarkdownPost, Post } from '#lib/types.ts';
import type { RequestHandler } from './$types';

async function getPosts() {
	let posts: Post[] = [];

	const paths = import.meta.glob<MarkdownPost>('/src/routes/blog/posts/mds/*.md', { eager: true });

	for (const path in paths) {
		const file = paths[path];
		const slug = path.split('/').at(-1)?.replace('.md', '');

		if (slug) {
			const post = { ...file.metadata, slug } satisfies Post;
			if (post.published) {
				posts.push(post);
			}
		}
	}

	posts = posts.sort(
		(first, second) => new Date(second.date).getTime() - new Date(first.date).getTime()
	);

	return posts;
}

export const GET: RequestHandler = async () => {
	const posts = await getPosts();
	return Response.json(posts);
};
