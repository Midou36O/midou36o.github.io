<script>                                    
  import { fly } from 'svelte/transition';  
  import { quintOut } from 'svelte/easing'; 
</script>                                   
                                            
  <div class="text-center">
    <div class="justify-center flex flex-col items-center m-auto shrink overflow-hidden h-screen "> 
      <div in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut}} animate=true out:fly={{ duration: 300, x: -50, easing: quintOut}} > 
        <h1 class="text-black dark:text-white text-4xl">Donate</h1>
        <p class="text-black dark:text-white pb-5" style="">Thanks a lot!</p>
      </div>
      <hr transition:fly={{ duration: 300, x: 0, easing: quintOut}} class="border-black dark:border-white w-1/6"/>
      <div in:fly={{ delay: 300, duration: 300, x: -50, easing: quintOut}} out:fly={{ duration: 300, x: 50, easing: quintOut}} >
      <a href="https://github.com/sponsors/midou36o">
        <div class="flex flex-row mt-5 md:dark:hover:bg-white p-1 md:dark:hover:text-black md:hover:bg-gray-400 rounded">
          <div class="i-carbon-logo-github my-auto text-3xl"></div><p class="text-2xl pl-2">GitHub Sponsors</p>
        </div>  
      </a> 
       <a href="/donate/monero">
        <div class="flex flex-row md:dark:hover:bg-white p-1 md:dark:hover:text-black md:hover:bg-gray-400 rounded">
          <div class="i-tabler-coin-monero pl-3 my-auto text-3xl"></div><p class="text-2xl pl-2">Monero</p>
        </div>  
      </a> 
      </div>
   </div> 
  </div>
