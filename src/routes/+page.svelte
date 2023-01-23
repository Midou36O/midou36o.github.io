<script>
    import data from '$lib/data.json';
	import Navi from '$lib/navi.svelte';
</script>
    <Navi/>
    <body class="dark:bg-black bg-gray-300 font-sans" id="content">
        <div class="center">
            <div class="justify-center flex items-center h-screen">
                <div class="wrapper">
                    <div class="text-black dark:text-white"><h1>{data.name}</h1></div>
                    <div class="text-black dark:text-white"><p id="para" style="margin-top: -15px;">{@html data.description}</p></div>
                    <div>
                    <hr class="text-black bg-black dark:bg-white dark:text-white" style="width:60%;text-align:center;"/>
                </div>
                    <div class="justify-center flex flex-row items-center gap-3 text-3xl hover:text-yellow-500">
                    <div><a class="text-black dark:text-white i-carbon-logo-github" href="{data.github}{data.gh} " title="Midou's GitHub" >G</a></div>
                    <div><a class="text-black dark:text-white i-simple-icons-matrix" href="{data.matrix}{data.mtx}"title="Midou's Matrix">M</a></div>
                    <div><a class="text-black dark:text-white i-mdi-at" href="mailto:{data.mail}" title="Midou's E-Mail">M</a></div>
                    <div><a class="text-black dark:text-white i-ph-currency-circle-dollar-bold text-4xl" href="{data.github}sponsors/{data.donate}" title="Donate to Midou.">D</a></div>
                    </div>
                    </div>
                <br>
            </div>





    </body>
