<script lang="ts">
	import * as Components from '$lib/blog/components.svelte';
	export { Components };
</script>

<div
	class="blog mx-auto w-70% md:w-80% lg:w-100% beak-normal mt-8 leading-loose text-lg text-gray-700 dark:text-gray-300"
>
	<slot />
</div>

<style>
	/* I HATE OVERWRITING STYLES  I HATE OVERWRITING STYLES */
	.blog :global(h1) {
		@apply text-5xl font-bold;
	}
	.blog :global(h2) {
		@apply text-4xl font-bold;
	}
	.blog :global(h3) {
		@apply text-3xl font-bold;
	}
	.blog :global(h4) {
		@apply text-2xl font-bold;
	}
	.blog :global(h5) {
		@apply text-xl font-bold;
	}
	.blog :global(h6) {
		@apply text-lg font-bold;
	}
	.blog :global(p) {
		@apply text-lg py-2;
	}
	.blog :global(a) {
		@apply text-blue-500;
	}
	.blog :global(a:hover) {
		@apply text-blue-700;
	}
	.blog :global(ul) {
		@apply list-disc list-inside;
	}
	.blog :global(ol) {
		@apply list-decimal list-inside display-inline-block;
	}
	.blog :global(ul > li) {
		@apply ml-4;
	}
	.blog :global(ol > li > p) {
		@apply inline;
	}
	.blog :global(ol > li) {
		@apply ml-4;
	}
	.blog :global(blockquote) {
		@apply border-purple-700 pl-4 border-l-4;
	}
	.blog :global(pre) {
		@apply overflow-x-auto;
	}
	.blog :global(table) {
		@apply w-full border-collapse;
	}
	.blog :global(th) {
		@apply text-left p-2 border border-gray-600;
	}
	.blog :global(td) {
		@apply p-2 border border-gray-600 'dark:border-gray-700';
	}
	.blog :global(hr) {
		@apply my-4 border-gray-600 'dark:border-gray-700';
	}
	.blog :global(img) {
		@apply w-full;
	}
	.blog :global(code) {
		@apply text-gray-200;
		background-color: #282a36;
	}
	.blog :global(code) {
		@apply rounded-1 'md:p-2' p-0 text-left;
	}
	.blog :global(kbd) {
		@apply rounded-1 p-2;
	}
	.blog :global(samp) {
		@apply rounded-1 p-2;
	}
	.blog :global(pre) {
		@apply rounded-1 'md:p-2' text-left p-0 'w-100%' overflow-x-auto;
	}
	.blog :global(.prose) {
		@apply prose;
	}
	.blog::-webkit-scrollbar {
		display: none;
	}
	.blog {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
