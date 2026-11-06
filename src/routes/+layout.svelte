<script lang="ts">
	import 'uno.css';
	import '#lib/style.css';
	import { page } from '$app/state';
	import { onMount, type Snippet } from 'svelte';
	import { MediaQuery } from 'svelte/reactivity';
	import SceneBackground from '#lib/background/SceneBackground.svelte';
	import '@unocss/reset/tailwind.css';
	import '@fontsource-variable/outfit';
	import '@fontsource-variable/fira-code';

	let { children }: { children: Snippet } = $props();
	let readingBlog = $derived(page.url.pathname.startsWith('/blog/'));
	const mobile = new MediaQuery('(max-width: 720px)', false);
	let enhanced = $state(false);

	onMount(() => {
		enhanced = true;
	});
</script>

<main
	class="site-shell dark:bg-black bg-gray-300 overflow-hidden"
	class:blog-reading={readingBlog}
	class:enhanced
>
	{#if enhanced && (!readingBlog || !mobile.current)}
		<SceneBackground reading={readingBlog} />
	{/if}
	<div class="site-content">
		{@render children()}
	</div>
</main>

<style>
	.site-shell {
		position: relative;
		isolation: isolate;
		min-height: 100vh;
	}

	.site-shell:not(.enhanced) :global(.programmer-reveal) {
		pointer-events: none;
	}

	.site-shell:has(
		:global(.programmer-reveal:is([data-phase='swapping'], [data-phase='isolated']))
	) {
		--programmer-reveal: 1;
	}

	.site-shell:has(
		:global(.programmer-reveal:is([data-phase='isolated'], [data-phase='dismissing']))
	) {
		--programmer-isolation: 1;
		--programmer-label-opacity: 0;
	}

	.site-shell:has(:global(.programmer-reveal[data-phase='restoring'])) {
		--programmer-restore-duration: 1.4s;
	}

	@media (prefers-reduced-motion: reduce) {
		.site-shell:has(:global(.programmer-reveal[data-phase='restoring'])) {
			--programmer-restore-duration: 0s;
		}
	}

	.site-content {
		pointer-events: none;
	}

	@media (min-width: 721px) and (prefers-reduced-motion: no-preference) {
		.enhanced .site-content {
			transition: padding-inline-end 650ms cubic-bezier(0.22, 1, 0.36, 1);
		}

		.enhanced.blog-reading .site-content {
			animation: reading-enter 850ms ease both;
		}

		@keyframes reading-enter {
			0%,
			76% {
				opacity: 0;
				visibility: hidden;
			}
			100% {
				opacity: 1;
				visibility: visible;
			}
		}
	}

	@media (min-width: 721px) {
		.enhanced.blog-reading {
			--scene-rail-width: max(12rem, 23vw, calc(100vw - 72rem));
		}
	}

	.blog-reading {
		--scene-rail-width: 0px;
	}

	.blog-reading .site-content {
		display: grid;
		padding-inline-end: var(--scene-rail-width);
		container: blog-reading / inline-size;
	}

	.blog-reading .site-content > :global(*) {
		grid-area: 1 / 1;
		min-width: 0;
	}

	@media (max-width: 720px) {
		.blog-reading {
			--scene-rail-width: 0px;
		}

		.blog-reading :global(.scene-background) {
			display: none;
		}
	}

	.site-content :global(#content) {
		background-color: transparent;
	}

	.site-content
		:global(
			:is(
				a,
				button,
				input,
				textarea,
				select,
				summary,
				[tabindex],
				h1,
				h2,
				h3,
				h4,
				h5,
				h6,
				p,
				pre,
				blockquote,
				ul,
				ol,
				table,
				img,
				.blog
			)
		) {
		pointer-events: auto;
	}
</style>
