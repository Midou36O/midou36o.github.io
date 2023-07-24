<script>
    import data from '$lib/data.json';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
</script>                                                                                      

<body class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans" id="content"> 
<div class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-screen">
    <!-- Primary content (left) --> 
    <div in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut}} animate=true out:fly={{ duration: 300, y: -50, easing: quintOut}} class="text-center">                                                                                                                  
      <div class="justify-center flex flex-col items-center m-auto shrink overflow-hidden h-screen">                                          
          <div in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut}} animate=true out:fly={{ duration: 300, x: -50, easing: quintOut}} >  
              <h1 class="text-black dark:text-white text-4xl">{data.name}</h1>
              <p class="text-black dark:text-white pb-5" style="">{@html data.description}</p>                                                                    
          </div>
        <hr transition:fly={{ duration: 300, x: 0, easing: quintOut}} class="border-black w-100%"/>
          <div in:fly={{ delay: 300, duration: 300, x: -50, easing: quintOut}} out:fly={{ duration: 300, x: 50, easing: quintOut}} >
              <a href="{data.github}{data.gh}">
                <div class="flex flex-row py-1">
                  <div class="i-carbon-logo-github text-black text-3xl"></div><p class="text-1xl text-black pl-2">GitHub</p>
                </div>
              </a>
              <a href="{data.matrix}{data.mtx}">
                <div class="flex flex-row py-1">
                  <div class="i-tabler-brand-matrix pl-3 text-black text-3xl"></div><p class="text-1xl text-black pl-2">Matrix</p>
                </div>
              </a>
              <a href="mailto:{data.mail}">
                <div class="flex flex-row py-1">
                  <div class="i-mdi-at pl-3 text-black text-3xl"></div><p class="text-1xl text-black pl-2">Mail</p>
                </div>
              </a>
              <a href="/donate">
                <div class="flex flex-row py-1">
                  <div class="i-ph-currency-circle-dollar-bold pl-3 text-black text-3xl"></div><p class="text-1xl text-black pl-2">Donate</p>
                </div>
              </a>
          </div>
      </div>
    </div>
           <!-- vertical line -->
       <div                                                                            
       in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut}}                  
       out:fly={{ duration: 300, y: 0, easing: quintOut}}                             
       class="md:mx-4 md:h-1/2 md:w-1 w-3/4 border-1 bg-black border-black rounded-md"        
       ></div>
       <!-- Secondary content (right) -->
        <div class="i-gridicons-info text-4xl"></div><h2 class="text-4xl">About</h2>
</div>
</body>                                                                                                                                      
