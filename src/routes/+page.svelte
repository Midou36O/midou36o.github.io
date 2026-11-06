<script lang="ts">
	import { resolve } from '$app/paths';
	import data from '#lib/data.json';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { onDestroy } from 'svelte';

	let revealPhase = $state('idle');
	let revealTimer: ReturnType<typeof setTimeout> | undefined;

	function startReveal() {
		clearTimeout(revealTimer);
		revealPhase = 'swapping';
		revealTimer = setTimeout(() => {
			revealPhase = 'isolated';
		}, 2800);
	}

	function endReveal(event: PointerEvent | FocusEvent) {
		if ((event.currentTarget as HTMLButtonElement).matches(':hover, :focus-visible')) return;
		clearTimeout(revealTimer);
		if (revealPhase !== 'isolated') {
			revealPhase = 'idle';
			return;
		}
		const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 1400;
		revealPhase = 'dismissing';
		revealTimer = setTimeout(() => {
			revealPhase = 'restoring';
			revealTimer = setTimeout(() => {
				revealPhase = 'idle';
			}, duration);
		}, duration);
	}

	onDestroy(() => clearTimeout(revealTimer));
</script>

<div
	class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans min-h-screen"
	id="content"
>
	<div
		class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-25% md:h-screen"
	>
		<!-- Primary content (left) -->
		<div
			in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut }}
			out:fly={{ delay: 100, duration: 200, y: 0, easing: quintOut }}
			class="text-center"
		>
			<div
				class="md:text-right justify-center flex flex-col items-center md:items-end m-auto shrink overflow-hidden md:pb-0 md:pt-0 pb-10% pt-110% h-1/2 md:h-screen"
			>
				<div
					in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut }}
					out:fly={{ duration: 300, x: -50, easing: quintOut }}
				>
					<h1 class="text-black dark:text-white text-4xl reveal-surroundings">{data.name}</h1>
					<p class="text-black dark:text-white pb-5">
						<strong
							><button
								type="button"
								class="programmer-reveal"
								data-phase={revealPhase}
								onpointerenter={startReveal}
								onpointerleave={endReveal}
								onfocus={startReveal}
								onblur={endReveal}
							>
								<span class="programmer-label">Programmer</span>
								<span class="vibecoder-label" aria-hidden="true">VIBECODER</span>
							</button></strong
						><span class="reveal-surroundings"
							>, Not a good <strong>Artist</strong>, <strong>Sysadmin</strong></span
						>
					</p>
				</div>
				<hr
					in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut }}
					out:fly={{ duration: 300, x: -50, easing: quintOut }}
					class="border-black dark:border-white w-100% reveal-surroundings"
				/>
				<div
					in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut }}
					out:fly={{ duration: 300, x: -50, easing: quintOut }}
					class="flex right text-right mt-1 justify-self-end md:flex-col flex-row px-3 md:px-0 place-items-end reveal-surroundings"
				>
					<a href="https://github.com/{data.gh}" aria-label="GitHub">
						<div
							class="flex flex-row p-1 md:dark:hover:bg-white md:dark:hover:text-black md:hover:bg-gray-400 rounded"
						>
							<p class="text-2xl md:block hidden md:pr-2">GitHub</p>
							<div class="i-carbon-logo-github px-2 md:px-0 my-auto text-3xl"></div>
						</div>
					</a>
					<a href="mailto:{data.mail}" aria-label="Mail">
						<div
							class="flex flex-row p-1 md:dark:hover:bg-white md:dark:hover:text-black md:hover:bg-gray-400 rounded"
						>
							<p class="text-2xl md:block hidden md:pr-2">Mail</p>
							<div class="i-mdi-at md:pl-3 px-2 md:px-0 my-auto text-3xl"></div>
						</div>
					</a>
					<a href={resolve('/donate')} aria-label="Donate">
						<div
							class="flex flex-row py-1 md:dark:hover:bg-white md:dark:hover:text-black md:hover:bg-gray-400 rounded"
						>
							<p class="text-2xl md:block hidden md:pr-2">Donate</p>
							<div
								class="i-ph-currency-circle-dollar-bold md:pl-1 mr-1 px-2 md:px-0 my-auto text-3xl"
							></div>
						</div>
					</a>
				</div>
			</div>
		</div>
		<!-- vertical line -->
		<div
			in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut }}
			out:fly={{ duration: 100, y: 0, easing: quintOut }}
			class="md:mx-4 md:h-1/4 md:w-1 w-3/4 border-1 bg-black border-black dark:border-white dark:bg-white rounded-md hidden md:block reveal-surroundings"
		></div>
		<!-- Secondary content (right) -->
		<div class="flex md:flex-col flex-row gap-2 md:gap-0 mx-5 md:mx-0 reveal-surroundings">
			<div
				in:fly={{ delay: 300, duration: 300, x: -20, easing: quintOut }}
				out:fly={{ delay: 50, duration: 250, y: 0, easing: quintOut }}
				class="flex flex-row rounded md:p-1 md:dark:hover:bg-white md:dark:hover:text-black md:hover:bg-gray-400"
			>
				<a
					href={resolve('/about')}
					aria-label="About"
					class="flex flex-row flex-1"
					data-sveltekit-preload-code
					><div class="flex flex-row flex-1">
						<div class="i-gridicons-info text-5xl md:text-4xl align-middle my-auto"></div>
						<h2 class="md:pl-2 text-4xl hidden md:block">About</h2>
					</div></a
				>
			</div>
			<div
				in:fly={{ delay: 350, duration: 300, x: -20, easing: quintOut }}
				out:fly={{ delay: 100, duration: 200, y: 0, easing: quintOut }}
				class="flex flex-row rounded md:p-1 md:dark:hover:bg-white md:dark:hover:text-black md:hover:bg-gray-400"
			>
				<a
					href={resolve('/projects')}
					aria-label="Projects"
					class="flex flex-row flex-1"
					data-sveltekit-preload-code
					><div class="flex flex-row">
						<div class="i-octicon-project-16 text-5xl md:text-4xl my-auto"></div>
						<h2 class="md:pl-2 text-4xl hidden md:block">Projects</h2>
					</div></a
				>
			</div>
			<div
				in:fly={{ delay: 400, duration: 300, x: -20, easing: quintOut }}
				out:fly={{ delay: 150, duration: 150, y: 0, easing: quintOut }}
				class="flex flex-row rounded md:p-1 md:dark:hover:bg-white md:dark:hover:text-black md:hover:bg-gray-400"
			>
				<a
					href={resolve('/blog')}
					aria-label="Blog"
					class="flex flex-row flex-1"
					data-sveltekit-preload-code
					><div class="flex flex-row">
						<div class="i-ph-book-bold text-5xl md:text-4xl my-auto"></div>
						<h2 class="md:pl-2 text-4xl hidden md:block">Blog</h2>
					</div></a
				>
			</div>
		</div>
	</div>
</div>

<style>
	.programmer-reveal {
		position: relative;
		display: inline-block;
		padding: 0;
		border: 0;
		background: none;
		color: inherit;
		font: inherit;
		text-align: inherit;
		vertical-align: baseline;
		cursor: pointer;
	}

	.programmer-label {
		display: block;
		opacity: var(--programmer-label-opacity, calc(1 - var(--programmer-reveal, 0)));
	}

	.vibecoder-label {
		position: absolute;
		inset: 0;
		color: #ef4444;
		white-space: nowrap;
		opacity: var(--programmer-reveal, 0);
	}

	.reveal-surroundings {
		opacity: calc(1 - var(--programmer-isolation, 0));
		transition: opacity var(--programmer-restore-duration, 0s) ease;
	}

	@media (prefers-reduced-motion: no-preference) {
		.programmer-label,
		.vibecoder-label {
			transition: opacity 1.4s ease;
		}
	}
</style>
