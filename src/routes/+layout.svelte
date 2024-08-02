<script>
	import 'uno.css';
	import '$lib/style.css';
	import Foote from '$lib/foote.svelte';
	import '@unocss/reset/tailwind.css';
	import Navi from '$lib/navi.svelte';
	import Banner from '$lib/banner.svelte';
</script>

<body>
	<Banner message="If you are an european, please save gaming by signing this initiative!" link="https://www.stopkillinggames.com/eci" />
	<main class="dark:bg-black bg-gray-300 overflow-hidden">
		<slot />
	</main>
</body>

