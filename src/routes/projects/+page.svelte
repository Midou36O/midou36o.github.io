<script>
    import proj from '$lib/project.json'; 
</script>
<div class="min-h-screen justify-center gap-1 flex flex-col place-items-center">
    {#each proj as { name, date, desc, url, image, imdes }}
        <div class="flex flex-col bg-gray-800">
            <div class="my-auto"> 
                <div class="flex flex-row">
                    <div class="flex flex-col">
                   <h3 class="text-3xl dark:text-white text-black text-center">{name}</h3>
                    <p class="text-sm dark:text-white text-black text-center">{date}</p>                    
                    <p class="dark:text-white text-black text-sm">{desc}</p>
                    </div>                
                    <div class="h-10% w-50 overflow-hidden"> 
                        <img class="transition -py-20 duration-400 static top-0 opacity-75 object-contain hover:scale-120" src="{image}" alt="{imdes}">  
                        <div class="h-30 top-0 static bg-gradient-to-l from-gray-800"/>  
                    </div>
                </div>
            </div> 
        </div>
    {/each}    
</div>
