<script>
    import data from '$lib/data.json';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
</script>
    <body class="dark:bg-black bg-gray-300 text-black dark:text-white font-sans" id="content">
        <div class="text-center">
            <div class="justify-center flex items-center m-auto shrink overflow-hidden h-screen ">
                <div class="items-center justify-center">
                    <div in:fly={{ delay: 300, duration: 300, x: 50, easing: quintOut}} out:fly={{ duration: 400, x: -50, easing: quintOut}} >
                    <div class="text-4xl"><h1>{data.name}</h1></div>
                    <div class="my-3"><p id="" style="margin-top: -15px;">{@html data.description}</p></div>
                    </div>
                    <hr in:fly={{ delay: 300,  duration: 300, x: 0, easing: quintOut}} out:fly={{ duration: 400, x: 0, easing: quintOut}} class="border-black dark:border-white w-100%"/>
                    <div in:fly={{ delay: 300, duration: 300, x: -50, easing: quintOut}} out:fly={{ duration: 400, x: 50, easing: quintOut}} >
                    <div class="justify-center flex flex-row items-center gap-3 text-3xl hover:text-black hover:dark:text-white">
                    <div><a class="i-carbon-logo-github" href="{data.github}{data.gh}" title="Midou's GitHub">G</a></div>
                    <div><a class="i-simple-icons-matrix" href="{data.matrix}{data.mtx}" title="Midou's Matrix">M</a></div>
                    <div><a class="i-mdi-at" href="mailto:{data.mail}" title="Midou's E-Mail">M</a></div>
                    <div><a class="i-ph-currency-circle-dollar-bold text-4xl" href="/donate" title="Donate to Midou.">D</a></div>
                    </div>
                    </div>
                    </div>
                <br>
            </div>





    </body>
