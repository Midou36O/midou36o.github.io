<script lang="ts">
	import { resolve } from '$app/paths';
	import { convertDate } from '#lib/utils.js';

	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let published = $derived(
		data.meta.date
			.split('-')
			.map((part) => part.padStart(2, '0'))
			.join('-')
	);
</script>

<!-- SEO -->
<svelte:head>
	<title>{data.meta.title}</title>
	<meta name="description" content={data.meta.description} />
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article class="reader" aria-labelledby="post-title">
	<!-- Primary content (Left) -->
	<header class="post-header">
		<span class="i-ph-book-bold post-icon" aria-hidden="true"></span>
		<h1 id="post-title">{data.meta.title}</h1>
		<div class="post-meta">
			<time datetime={published}>{convertDate(data.meta.date)}</time>
		</div>
		{#if data.meta.categories.length}
			<p class="tags-label">Tags:</p>
			<ul class="post-tags" aria-label="Tags">
				{#each data.meta.categories as category (category)}
					<li>&num;{category}</li>
				{/each}
			</ul>
		{/if}
		<nav class="reader-navigation" aria-label="Blog navigation">
			<a href={resolve('/blog')} aria-label="Go back to blog" data-sveltekit-preload-code>
				<span class="i-ep-back" aria-hidden="true"></span>
				Go back?
			</a>
		</nav>
	</header>

	<!-- Vertical line -->
	<div class="post-divider" aria-hidden="true"></div>

	<!-- Secondary Content (Right) -->
	<!-- svelte-ignore a11y_no_noninteractive_tabindex (The scrollable article needs keyboard access) -->
	<div class="post-content" role="region" aria-label="Article content" tabindex="0">
		<div class="article-body">
			<div id="article-start" tabindex="-1"></div>
			<data.content />
			<footer class="reader-navigation post-footer" aria-label="Article navigation">
				<a href={resolve('/blog')} aria-label="Go back to blog">
					<span class="i-ep-back" aria-hidden="true"></span>
					Go back?
				</a>
				<a href="#article-start">Back to top <span aria-hidden="true">↑</span></a>
			</footer>
		</div>
	</div>
</article>

<style>
	.reader {
		--reader-text: #374151;
		--reader-heading: #000;
		--reader-muted: #4b5563;
		--reader-border: #9ca3af;
		--reader-link: #3b82f6;
		--reader-code-background: #282a36;
		display: grid;
		grid-template-columns: minmax(13rem, 17rem) 2px minmax(0, 1fr);
		column-gap: clamp(1.5rem, 3.5vw, 3.25rem);
		width: min(100% - 3rem, 80rem);
		height: 100dvh;
		margin-inline: auto;
		padding-block: clamp(1.25rem, 4vh, 3rem);
		color: var(--reader-text);
		overflow-wrap: anywhere;
	}

	.post-header {
		align-self: center;
		min-height: 0;
		max-height: 100%;
		overflow-y: auto;
		padding: 0.25rem;
		scrollbar-color: var(--reader-border) transparent;
		scrollbar-width: thin;
	}

	.post-icon {
		display: block;
		margin-bottom: 1rem;
		color: var(--reader-heading);
		font-size: 2.75rem;
	}

	h1 {
		margin: 0;
		color: var(--reader-heading);
		font-size: clamp(1.875rem, 2.7vw, 2.5rem);
		font-weight: 800;
		line-height: 1.15;
		letter-spacing: -0.025em;
		text-wrap: balance;
	}

	.post-meta {
		margin-top: 1rem;
		color: var(--reader-muted);
		font-size: 0.875rem;
	}

	.tags-label {
		margin-top: 1.25rem;
		color: var(--reader-muted);
		font-size: 0.875rem;
	}

	.post-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem 0.75rem;
		margin-top: 0.375rem;
		padding: 0;
		list-style: none;
		color: var(--reader-muted);
		font-size: 0.875rem;
		line-height: 1.6;
	}

	.reader-navigation {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		font-size: 0.9375rem;
		line-height: 1.5;
	}

	.post-header .reader-navigation {
		margin-top: 1.5rem;
	}

	.reader-navigation a {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding-block: 0.5rem;
		text-underline-offset: 0.25em;
	}

	.reader-navigation a:hover {
		text-decoration: underline;
	}

	.reader-navigation a:focus-visible,
	.post-content:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 4px;
		border-radius: 0.125rem;
	}

	.post-divider {
		background: var(--reader-heading);
		border-radius: 999px;
	}

	.post-content {
		min-width: 0;
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior-y: contain;
		scrollbar-color: var(--reader-border) transparent;
		scrollbar-gutter: stable;
		scrollbar-width: thin;
		pointer-events: auto;
	}

	.article-body {
		width: min(100%, 44rem);
		margin-inline: auto;
		padding: 0.5rem 1.25rem 1.5rem 0.25rem;
		font-size: clamp(1.0625rem, 0.98rem + 0.3vw, 1.1875rem);
		line-height: 1.8;
		scroll-margin-top: 0.5rem;
	}

	.post-footer {
		margin-top: 3rem;
		padding-top: 1rem;
		border-top: 1px solid var(--reader-border);
	}

	@container blog-reading (max-width: 720px) {
		.reader {
			grid-template-columns: minmax(0, 1fr);
			grid-template-rows: auto 2px minmax(0, 1fr);
			row-gap: 1rem;
			width: calc(100% - 2rem);
			padding-block: 1rem;
		}

		.post-header {
			max-height: 38dvh;
		}

		.post-icon {
			display: none;
		}

		h1 {
			font-size: clamp(1.5rem, 5.5vw, 1.875rem);
			text-wrap: pretty;
		}

		.post-meta,
		.tags-label {
			margin-top: 0.5rem;
		}

		.tags-label {
			display: none;
		}

		.post-header .reader-navigation {
			margin-top: 0.5rem;
		}

		.article-body {
			padding-right: 0.75rem;
		}
	}

	@media (prefers-color-scheme: dark) {
		.reader {
			--reader-text: #d1d5db;
			--reader-heading: #fff;
			--reader-muted: #6b7280;
			--reader-border: #374151;
		}
	}
</style>
