<script>
    import "uno.css";
    import "$lib/style.css";
    import Foote from "$lib/foote.svelte";
    import "@unocss/reset/tailwind.css";
</script>

<style>
</style>   

<main class="dark:bg-black bg-gray-300">
   <slot />
</main>

<Foote/>