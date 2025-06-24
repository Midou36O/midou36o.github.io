import type { Post } from '$lib/types';

export async function GET({ fetch }) {
	const response = await fetch('api/posts');
	const posts: Post[] = await response.json();

	const headers = { 'Content-Type': 'application/xml' };

	const xml = `
		<rss xmlns:atom="http://www.w3.org/2005/Atom" version="2.0">
			<channel>
				<title>Midou's blog</title>
				<description>A blog covering about anything that comes into my mind!</description>
				<link>https://midou.dev/</link>
				<atom:link href="https://midou.dev/rss.xml" rel="self" type="application/rss+xml"/>
				${posts
					.map(
						(post) => `
						<item>
							<title>${post.title}</title>
							<description>${post.description}</description>
							<link>https://midou.dev/blog/${post.slug}</link>
							<guid isPermaLink="true">https://midou.dev/blog/${post.slug}</guid>
							<pubDate>${new Date(post.date).toUTCString()}</pubDate>
						</item>
					`
					)
					.join('')}
			</channel>
		</rss>
	`.trim();

	return new Response(xml, { headers });
}
