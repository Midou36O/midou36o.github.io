<script>
    import data from '$lib/data.json';
    import { blur, scale } from 'svelte/transition';
    function LSDSim() {
            console.log("hovered");
            document.getElementById("back").style.filter = "animation: fadeIn";
    };
</script>

    <body id="content">
        <div class="center">
            <img id="backdesk" src="/images/BG_FHD_darker.png" alt="" style="" transition:blur="{{amount: 10, delay: 200, duration: 1000}}"/>
            <div class="middle">
                <div class="wrapper">
                    <img src="{data.avatar}45198486?v=4" title="Why are you hovering over everything?" alt="" id="profilepicture" on:mouseenter={LSDSim} transition:blur="{{amount: 10}}"/>
                    <div class="h1dance"><h1>{data.name}</h1></div>
                    <div class="paragraph-start"><p id="para" style="margin-top: -15px; color:#fff;">{@html data.description}</p></div>
                    <div>
                    <hr class="text-white" style="width:60%;text-align:center;color:#fff;border-color: #fff"/>
                </div>
                    <div class="justify-center flex flex-row items-center gap-3 text-3xl">
                    <div><a class="text-white i-carbon-logo-github" href="{data.github}{data.gh} " title="Midou's GitHub" >G</a></div>
                    <div><a class="text-white i-simple-icons-matrix" href="{data.matrix}{data.mtx}"title="Midou's Matrix">M</a></div>
                    <div><a class="text-white i-mdi-at" href="mailto:{data.mail}" title="Midou's E-Mail">M</a></div>
                    <div><a class="text-white i-ph-currency-circle-dollar-bold text-4xl" href="{data.github}sponsors/{data.donate}" title="Donate to Midou.">D</a></div>
                    </div>
                    <hr style="width:10%; height: 100; border: solid 0.5px; color:rgb(73, 81, 88);border-color: rgb(73, 81, 88);"/>
                    <div class="bio-and-projects">
                        <a id="bplink" href="/about" title="Midou's Bio" style="color:rgb(216, 213, 15);">Bio</a> | <a id="plink" href="/projects" title="Midou's Projects" style="color:rgb(216, 213, 15);">Projects</a>
                    </div>
                    <br>
                </div>
                <br>
            </div>





    </body>
