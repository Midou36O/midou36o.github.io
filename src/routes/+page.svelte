<script>
    import data from '$lib/data.json';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
</script>                                                                                      

<body class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans" id="content"> 
<div class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-25% md:h-screen">
    <!-- Primary content (left) --> 
    <div in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut}} out:fly={{ delay: 100, duration: 200, y: 0, easing: quintOut}} class="text-center">                                                                                                                  
      <div class="justify-center flex flex-col items-center m-auto shrink overflow-hidden md:pb-0 md:pt-0 pb-10% pt-110% h-1/2 md:h-screen">                                          
          <div in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut}} animate=true out:fly={{ duration: 300, x: -50, easing: quintOut}} >  
              <h1 class="text-black dark:text-white text-4xl">{data.name}</h1>
              <p class="text-black dark:text-white pb-5" style="">{@html data.description}</p>                                                                    
          </div>
        <hr transition:fly={{ duration: 300, x: 0, easing: quintOut}} class="border-black dark:border-white w-100%"/>
          <div in:fly={{ delay: 300, duration: 300, x: -50, easing: quintOut}} out:fly={{ duration: 300, x: 50, easing: quintOut}} class="flex md:flex-col flex-row px-3 md:px-0" >
              <a href="{data.github}{data.gh}">
                <div class="flex flex-row py-1">
                  <div class="i-carbon-logo-github text-black dark:text-white px-2 md:px-0 text-3xl"></div><p class="text-1xl md:block hidden dark:text-white text-black md:pl-2">GitHub</p>
                </div>
              </a>
              <a href="{data.matrix}{data.mtx}">
                <div class="flex flex-row py-1">
                  <div class="i-tabler-brand-matrix md:pl-3 text-black dark:text-white px-2 md:px-0 text-3xl"></div><p class="text-1xl md:block hidden dark:text-white text-black md:pl-2">Matrix</p>
                </div>
              </a>
              <a href="mailto:{data.mail}">
                <div class="flex flex-row py-1">
                  <div class="i-mdi-at md:pl-3 text-black dark:text-white px-2 md:px-0 text-3xl"></div><p class="text-1xl md:block hidden text-black dark:text-white md:pl-2">Mail</p>
                </div>
              </a>
              <a href="/donate">
                <div class="flex flex-row py-1">
                  <div class="i-ph-currency-circle-dollar-bold md:pl-3 text-black px-2 md:px-0 dark:text-white text-3xl"></div><p class="text-1xl md:block hidden text-black dark:text-white md:pl-2">Donate</p>
                </div>
              </a>
          </div>
      </div>
    </div>
           <!-- vertical line -->
       <div                                                                            
       in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut}}
       out:fly={{ duration: 300, y: 0, easing: quintOut}}
       class="md:mx-4 md:h-1/4 md:w-1 w-3/4 border-1 bg-black border-black dark:border-white dark:bg-white rounded-md hidden md:block"        
       ></div>
       <!-- Secondary content (right) -->
        <div class="flex md:flex-col flex-row px-5 md:px-0 ">
            <div in:fly={{ delay: 300, duration: 300, x: -20, easing: quintOut}}
                 out:fly={{ delay: 50, duration: 250, y: 0, easing: quintOut}}
                 class="flex flex-row">
                <a href="/about"><div class="flex flex-row"><div class="i-gridicons-info text-5xl md:text-4xl"></div><h2 class="md:pl-2 text-4xl hidden md:block">About</h2></div></a>
            </div>
            <div in:fly={{ delay: 350, duration: 300, x: -20, easing: quintOut}}
                 out:fly={{ delay: 100, duration: 200, y: 0, easing: quintOut}}
                 class="flex flex-row"> 
                <a href="/projects"><div class="flex flex-row"><div class="i-octicon-project-16 text-5xl md:text-4xl"></div><h2 class="md:pl-2 text-4xl hidden md:block">Projects</h2></div></a> 
            </div>
            <div in:fly={{ delay: 400, duration: 300, x: -20, easing: quintOut}}
                out:fly={{ delay: 150, duration: 150, y: 0, easing: quintOut}}
                 class="flex flex-row"> 
                <a href="/blog"><div class="flex flex-row"><div class="i-ph-book-bold text-5xl md:text-4xl"></div><h2 class="md:pl-2 text-4xl hidden md:block">Blog</h2></div></a>
            </div>
        </div>
</body>                                                                                                                                      
