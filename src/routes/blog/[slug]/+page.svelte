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
				class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-screen"
			>
				<div
					in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut }}
					out:fly={{ duration: 300, y: -50, easing: quintOut }}
					class="flex flex-col pr-3"
				>
					<div class="flex flex-col md:flex-row">
						<div
							class="i-gridicons-info dark:text-white place-content-center place-self-center justify-center content-center text-center pl-0 md:pl-3 text-black text-5xl"
						/>
						<h1 class="text-black dark:text-white font-bold text-4xl md:px-2">{data.meta.title}</h1>
					</div>
					<!-- dirty hack to give the illusion the text is properly visible on both light and dark mode -->
					<p class="block text-gray-800 md:text-gray-500 p-3 py-1">
						Tags:
						{#each data.meta.categories as category}
							<span class="surface-4"> &num;{category} </span>
						{/each}
					</p>
					<!-- dirty hack to give the illusion the text is properly visible on both light and dark mode -->
					<p class="block text-gray-800 md:text-gray-500 p-3 py-1">
						{convertDate(data.meta.date)}
					</p>
					<a href="/blog" data-sveltekit-preload-code>
						<div
							class="flex place-content-center place-self-center justify-center content-center flex-row md:px-25%"
						>
							<div class="i-ep-back text-4xl md:text-2xl my-auto mr-0 md:mr-1" />
							<p class="md:block hidden">Go back?</p>
						</div>
					</a>
				</div>
				<!-- Vertical line -->
				<div
					in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut }}
					out:fly={{ duration: 300, y: 0, easing: quintOut }}
					class="md:h-1/2 md:w-1 w-3/4 border-1 bg-black border-black dark:bg-white dark:border-white rounded-md"
				/>
				<!-- Secondary Content (Right) -->
				<div
					in:fly={{ delay: 400, duration: 300, y: -50, easing: quintOut }}
					out:fly={{ duration: 300, y: 50, easing: quintOut }}
					class="justify-center w-85% md:min-w-20% md:max-w-50% h-100% flex flex-col items-center md:m-5 shrink overflow-hidden h-screen"
				>
					<div
						class="text-xl text-center overflow-scroll md:text-left text-black dark:text-white my-10%"
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
