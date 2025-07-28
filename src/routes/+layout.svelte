<script>
	import 'uno.css';
	import '$lib/style.css';
	import Foote from '$lib/foote.svelte';
	import '@unocss/reset/tailwind.css';
	import Navi from '$lib/navi.svelte';
</script>

<body>
	<main class="dark:bg-black bg-gray-300 overflow-hidden">
		<slot />
	</main>
</body>
