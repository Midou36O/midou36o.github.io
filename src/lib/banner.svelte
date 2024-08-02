<script lang="ts">
  export let message = "";
  export let link = "#";
 let show = true;

  function hideBanner() {
    show = false;
  }
</script>


{#if show}
  <div class="bg-[#1976D2] text-white text-center p-2.5 fixed bottom-0 left-0 w-full z-1000 md:top-0 md:bottom-auto md:text-xl md:p-4 flex items-center">
    <!-- X button on the left -->
    <button on:click={hideBanner} class="text-white font-bold flex items-center p-1 rounded hover:bg-[#0d47a1] focus:outline-none">
      <div class="i-maki:cross w-6 h-6"></div> <!-- Cross icon -->
    </button>
    <!-- Spacer to push content to the center -->
    <div class="flex-1 mx-4 text-center">
      <a href={link} class="text-white no-underline font-bold flex items-center justify-center">
        {message}
        <div class="i-mdi:external-link w-8 h-8 ml-2"></div> <!-- External link icon -->
      </a>
    </div>
  </div>
{/if}
