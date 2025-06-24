<script lang="ts">
	export let message = '';
	export let link = '#';
	let show = true;
	let backgroundColor = '#1976D2';
	let displayMessage = message;
	let tooLate = false;
	const now = new Date();
	const deadline = new Date('2025-07-31T23:59:59');
	const hideAfter = new Date('2025-08-14T23:59:59');

	if (now > hideAfter) {
		show = false;
	} else if (now > deadline) {
		backgroundColor = '#444';
		displayMessage = 'There is nothing to save anymore.';
		tooLate = true;
	} else {
		const totalMs = deadline.getTime() - new Date('2025-01-01').getTime();
		const remainingMs = deadline.getTime() - now.getTime();
		const progress = 1 - remainingMs / totalMs;

		// Blend from blue to red (HSL hues: 210 → 0)
		const hue = 210 - progress * 210;
		// Don't change color if the hue is less than 0
		if (hue < 0) {
			backgroundColor = '#1976D2'; // fallback blue
		}
		backgroundColor = `hsl(${hue}, 80%, 45%)`;
	}

	function hideBanner() {
		const el = document.querySelector('.glass-banner');
		if (!(el instanceof HTMLElement)) return;

		show = false;
		const rect = el.getBoundingClientRect();

		// Create shards container
		const container = document.createElement('div');
		container.style.position = 'fixed';
		container.style.left = '0';
		container.style.top = '0';
		container.style.width = '100vw';
		container.style.height = '100vh';
		container.style.pointerEvents = 'none';
		document.body.appendChild(container);

		const shards = 15;
		for (let i = 0; i < shards; i++) {
			const shard = document.createElement('div');
			shard.style.position = 'absolute';
			shard.style.left = `${rect.left}px`;
			shard.style.top = `${rect.top}px`;
			shard.style.width = `${rect.width}px`;
			shard.style.height = `${rect.height}px`;
			shard.style.background = `${backgroundColor}`;
			shard.style.clipPath = triangle();
			shard.style.transition = 'transform 5s cubic-bezier(0.3, 1.5, 0.5, 1), opacity 2s';
			shard.style.zIndex = '10000';

			const hueShift = Math.random() * 10 - 5;
			const baseColor = 210 + hueShift; // hue of #1976D2 is around 210

			const lightness = 45 + Math.random() * 10;

			shard.style.transitionDelay = `${Math.random() * 100}ms`;
			shard.style.background = `hsl(${baseColor}, 90%, ${lightness}%)`;

			if (tooLate) {
				shard.style.background = '#444'; // gray
			}
			container.appendChild(shard);

			// Force reflow
			shard.getBoundingClientRect();

			const dx = (Math.random() - 0.5) * 100;
			const dy = 1000 + Math.random() * 2000;
			const angle = (Math.random() - 0.5) * 90;

			shard.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}deg)`;
			shard.style.opacity = '0';
		}

		setTimeout(() => {
			container.remove();
		}, 5000);
	}

	function triangle() {
		const x1 = Math.random() * 100;
		const y1 = Math.random() * 100;
		const x2 = Math.random() * 100;
		const y2 = Math.random() * 100;
		const x3 = Math.random() * 100;
		const y3 = Math.random() * 100;
		return `polygon(${x1}% ${y1}%, ${x2}% ${y2}%, ${x3}% ${y3}%)`;
	}
</script>

{#if show}
	<div
		class="glass-banner text-white text-center p-2.5 fixed bottom-0 left-0 w-full z-1000 md:top-0 md:bottom-auto md:text-xl md:p-4 flex items-center"
		style="background-color: {backgroundColor};"
	>
		<!-- X button on the left -->
		<button
			on:click={hideBanner}
			class="text-white font-bold flex items-center p-1 rounded hover:bg-[#0d47a1] focus:outline-none"
		>
			<div class="i-maki:cross w-6 h-6"></div>
			<!-- Cross icon -->
		</button>
		<!-- Spacer to push content to the center -->
		{#if !tooLate}
			<div class="flex-1 mx-4 text-center">
				<a href={link} class="text-white no-underline font-bold flex items-center justify-center">
					{displayMessage}
					<div class="i-mdi:external-link w-8 h-8 ml-2"></div>
					<!-- External link icon -->
				</a>
			</div>
		{:else}
			<div class="flex-1 mx-4 text-center">
				{displayMessage}
			</div>
		{/if}
	</div>
{/if}
