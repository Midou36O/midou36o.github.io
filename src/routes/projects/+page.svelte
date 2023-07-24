<script>
    import proj from '$lib/project.json'; 
</script>
<div class="mb-50px md:mb-0 min-h-screen justify-center grid md:grid-rows-3 xl:grid-cols-2 place-items-center md:my-4 gap-3 mx-4 grid-cols-1">
    {#each proj as { name, date, desc, url, image, imdes }}
        <div class="dark:bg-slate-400 bg-slate-600 dark:text-white text-black rounded-lg w-[100-40] md:max-w-xl">
            <div class="md:flex"> 
                <div class="md:shrink-0">
                    <img class="md:rounded-l-lg md:rounded-none rounded-lg md:h-50 md:w-45 w-screen object-cover h-48" src="{image}" alt="{imdes}">
                </div>
                <div class="pb-20 pt-5 px-8 md:rounded-lg rounded-b-lg dark:text-white text-black dark:bg-slate-7 bg-slate-200 md:h-50">
                    <div><h3 class="text-3xl dark:text-white text-black text-center">{name}</h3></div>
                    <div class="text-sm dark:text-white text-black text-center">{date}</div>                    
                    <div><p class="dark:text-white text-black text-sm">{desc}</p></div>
                    <div><a class="text-xl bg-sky-5 hover:bg-sky-4 hover:text-white text-white outline-0 hover:shadow-md duration-300 shadow-sky-4/50 px-4 py-1 justify-end m-4 rounded-full float-right" href="{url}">Check it out</a></div>
                </div>
            </div> 
        </div>
    {/each}    
</div>
