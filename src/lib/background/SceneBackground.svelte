<script lang="ts">
	import { onMount } from 'svelte';
	import { BackgroundController } from './controller.ts';

	let { reading = false }: { reading?: boolean } = $props();
	let frame: HTMLDivElement;
	let canvas: HTMLCanvasElement;
	let ready = $state(false);
	let checked = $state(false);
	let revealDelay = $state(4000);

	onMount(() => {
		const revealAt = performance.now() + 4000;
		const controller = new BackgroundController(canvas, frame, () => {
			revealDelay = Math.max(0, revealAt - performance.now());
			checked = true;
		});
		ready = true;
		return () => controller.destroy();
	});
</script>

<div
	class="scene-background bg-gray-300 dark:bg-black"
	class:reading
	class:ready
	class:checked
	style:--background-reveal-delay={`${revealDelay}ms`}
	bind:this={frame}
>
	<canvas bind:this={canvas} aria-hidden="true"></canvas>
</div>

<style>
	.scene-background {
		position: fixed;
		inset: 0;
		inset-inline-start: auto;
		width: 100%;
		z-index: -1;
		height: 100dvh;
		overflow: hidden;
		pointer-events: auto;
		opacity: calc(1 - var(--programmer-isolation, 0));
		transition: opacity var(--programmer-restore-duration, 0s) ease;
	}

	.scene-background::after {
		content: '';
		position: absolute;
		inset: 0;
		background: inherit;
		mask-image: linear-gradient(to right, #000, transparent 22%);
		opacity: 0;
		pointer-events: none;
	}

	.reading {
		width: var(--scene-rail-width);
	}

	.reading::after {
		opacity: 1;
	}

	@media (prefers-reduced-motion: no-preference) {
		.ready.checked canvas {
			animation: background-reveal 900ms ease var(--background-reveal-delay) both;
		}

		@keyframes background-reveal {
			from {
				opacity: 0;
				visibility: hidden;
			}
			to {
				opacity: 1;
				visibility: visible;
			}
		}

		.scene-background {
			transition:
				width 650ms cubic-bezier(0.22, 1, 0.36, 1),
				opacity var(--programmer-restore-duration, 0s) ease;
		}

		.scene-background::after {
			transition: opacity 650ms ease;
		}

		.reading {
			animation: scene-enter 650ms cubic-bezier(0.22, 1, 0.36, 1);
		}

		.reading::after {
			animation: fade-enter 650ms ease;
		}

		@keyframes scene-enter {
			from {
				width: 100%;
			}
			to {
				width: var(--scene-rail-width);
			}
		}

		@keyframes fade-enter {
			from {
				opacity: 0;
			}
			to {
				opacity: 1;
			}
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.scene-background {
			pointer-events: none;
		}

		.scene-background canvas {
			cursor: default;
			touch-action: auto;
		}

		.ready canvas {
			opacity: 1;
			visibility: visible;
		}
	}

	canvas {
		display: block;
		width: 100%;
		height: 100%;
		touch-action: none;
		cursor: default;
		opacity: 0;
		visibility: hidden;
	}

	.ready.checked canvas {
		opacity: 1;
		visibility: visible;
	}
</style>
