<script lang="ts">
	import { afterUpdate } from "svelte";
	import DarkMode from "svelte-dark-mode";

	let theme: "dark" | "light";

	afterUpdate(() => {
		document.documentElement.className = theme;
	});

	let toggle = () => {
		theme = theme === "dark" ? "light" : "dark";
	};
</script>

<DarkMode bind:theme />

<button
	on:click={toggle}
	class="cursor-pointer float-right flex items-center bg-transparent border-0 font-primary">
	<div class="i-ic:{theme === 'dark' ? 'outline-light-mode' : 'outline-dark-mode'} text-black dark:text-white hover:text-blue-700 text-3xl md:text-4xl dark:hover:text-indigo-5" />
	
</button>
