<script lang="ts">
	import { convertDate } from '$lib/utils';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import 'github-markdown-css/github-markdown.css';

	export let data;
</script>

<!-- SEO -->
<svelte:head>
	<title>{data.meta.title}</title>
	<meta property="og:type" content="article" />
	<meta property="og:title" content={data.meta.title} />
</svelte:head>

<article>
	<div class="min-h-screen">
		<!-- Primary content (Left) -->
		<div class="text-center">
			<div
				class="md:justify-start justify-center flex md:flex-row flex-col items-center md:item-start m-auto shrink pt-3 md:pt-0 overflow-hidden h-screen"
			>
				<div
					in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut }}
					out:fly={{ duration: 300, y: -50, easing: quintOut }}
					class="flex flex-col md:mx-7 pr-3 md:w-60"
				>
					<div class="flex flex-col md:flex-col">
						<div
							class="i-ph-book-bold dark:text-white place-self-center md:place-self-start pl-0 md:pl-3 text-black text-5xl"
						/>
						<h1
							class="text-black dark:text-white md:break-normal md:w-60 text-center md:text-left font-bold text-4xl"
						>
							{data.meta.title}
						</h1>
					</div>

					<p class="block text-gray-600 dark:text-gray-500 text-center md:text-start py-1">
						{convertDate(data.meta.date)}
					</p>
					<p class="inline text-gray-600 dark:text-gray-500 py-1 text-center md:text-start">
						Tags:
					</p>
					<div class="pl-2 inline text-gray-600 dark:text-gray-500 py-1 text-cetner md:text-start">
						{#each data.meta.categories as category}
							<span class="surface-4"> &num;{category} </span>
						{/each}
					</div>

					<a href="/blog" data-sveltekit-preload-code>
						<div class="flex justify-center content-center md:justify-end md:content-end flex-row">
							<div class="i-ep-back text-4xl md:text-2xl my-auto mr-0 md:mr-1" />
							<p class="md:block hidden">Go back?</p>
						</div>
					</a>
				</div>
				<!-- Vertical line -->
				<div
					in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut }}
					out:fly={{ duration: 300, y: 0, easing: quintOut }}
					class="md:h-100% md:w-1 w-3/4 border-1 bg-black border-black dark:bg-white dark:border-white rounded-md"
				/>
				<!-- Secondary Content (Right) -->
				<div
					in:fly={{ delay: 400, duration: 300, y: -50, easing: quintOut }}
					out:fly={{ duration: 300, y: 50, easing: quintOut }}
					class="justify-center md:min-w-50% md:max-w-50% h-50% flex flex-col items-center md:m-auto md:m-5 shrink overflow-hidden h-screen"
				>
					<div
						class="text-xl md:justify-center text-start overflow-scroll md:text-left text-black dark:text-white"
					>
						<div class="prose" />
						<svelte:component this={data.content} />
					</div>
				</div>
			</div>
		</div>
	</div>
</article>

<style>
	article {
		max-inline-size: var(--size-content-3);
		margin-inline: auto;
	}

	h1 {
		text-transform: capitalize;
	}
</style>
