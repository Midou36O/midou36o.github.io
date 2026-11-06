<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="blog">
	{@render children()}
</div>

<style>
	/* I HATE OVERWRITING STYLES  I HATE OVERWRITING STYLES */
	.blog {
		min-width: 0;
		color: inherit;
		font-size: inherit;
		line-height: inherit;
	}

	.blog :global(:where(p, ul, ol, blockquote, pre, table, hr)) {
		margin-block: 1.5rem;
	}

	.blog :global(:first-child) {
		margin-top: 0;
	}

	.blog :global(:last-child) {
		margin-bottom: 0;
	}

	.blog :global(:where(h1, h2, h3, h4, h5, h6)) {
		margin-block: 2.75rem 1rem;
		font-weight: 700;
		line-height: 1.3;
		letter-spacing: -0.02em;
		text-wrap: balance;
		scroll-margin-top: 1.5rem;
	}

	.blog :global(h1) {
		font-size: clamp(1.75rem, 1.3rem + 1.3vw, 2.25rem);
	}

	.blog :global(h2) {
		font-size: clamp(1.5rem, 1.2rem + 0.9vw, 1.875rem);
	}

	.blog :global(h3) {
		font-size: 1.375rem;
	}

	.blog :global(:where(h4, h5, h6)) {
		font-size: 1.125rem;
	}

	.blog :global(a) {
		color: var(--reader-link, #1d4ed8);
		text-decoration: underline;
		text-decoration-thickness: 1px;
		text-underline-offset: 0.2em;
	}

	.blog :global(a:hover) {
		text-decoration-thickness: 2px;
	}

	.blog :global(a:focus-visible) {
		outline: 2px solid currentColor;
		outline-offset: 4px;
	}

	.blog :global([id]) {
		scroll-margin-top: 1.5rem;
	}

	.blog :global(:where(ul, ol)) {
		padding-left: 1.5em;
		list-style-position: outside;
	}

	.blog :global(ul) {
		list-style-type: disc;
	}

	.blog :global(ol) {
		list-style-type: decimal;
	}

	.blog :global(li) {
		padding-left: 0.25em;
	}

	.blog :global(li + li) {
		margin-top: 0.5em;
	}

	.blog :global(li > :where(ul, ol)) {
		margin-block: 0.625em;
	}

	.blog :global(li > p) {
		margin-block: 0.75em;
	}

	.blog :global(blockquote) {
		padding: 0.125rem 0 0.125rem 1.25rem;
		border-left: 4px solid #7e22ce;
		color: inherit;
	}

	.blog :global(:where(code, kbd, samp)) {
		font-family: 'Fira Code Variable', monospace;
		font-size: 0.85em;
	}

	.blog :global(:not(pre) > code) {
		padding: 0.15em 0.35em;
		border-radius: 0.25rem;
		background: var(--reader-code-background, rgb(15 23 42 / 8%));
		color: #e5e7eb;
		overflow-wrap: anywhere;
	}

	.blog :global(pre) {
		max-width: 100%;
		overflow-x: auto;
		padding: 1.125rem;
		border-radius: 0.375rem;
		line-height: 1.65;
		tab-size: 2;
		overscroll-behavior-x: contain;
	}

	.blog :global(pre code) {
		display: block;
		min-width: max-content;
		padding: 0;
		border-radius: 0;
		background: none;
		overflow-wrap: normal;
		white-space: pre;
	}

	.blog :global(:where(kbd, samp)) {
		padding: 0.15em 0.35em;
		border: 1px solid var(--reader-border, #9ca3af);
		border-radius: 0.25rem;
	}

	.blog :global(table) {
		display: block;
		max-width: 100%;
		overflow-x: auto;
		border-collapse: collapse;
		font-size: 0.9em;
		line-height: 1.5;
		overscroll-behavior-x: contain;
	}

	.blog :global(:where(th, td)) {
		padding: 0.75em 1em;
		border: 1px solid var(--reader-border, #9ca3af);
		text-align: left;
		vertical-align: top;
	}

	.blog :global(th) {
		font-weight: 700;
	}

	.blog :global(img) {
		display: block;
		max-width: 100%;
		height: auto;
		margin: 1.75rem auto;
		padding: 0;
		border-radius: 0.25rem;
	}

	.blog :global(hr) {
		margin-block: 2.5rem;
		border: 0;
		border-top: 1px solid var(--reader-border, #9ca3af);
	}
</style>
