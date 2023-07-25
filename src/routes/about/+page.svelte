<script>
    import dayjs from "dayjs";
    import relativeTime from "dayjs/plugin/relativeTime";
    // DayJS
    dayjs.extend(relativeTime);
    let yr = dayjs('2004-07-15').fromNow(true);



</script>

<div class="min-h-screen">
    <div class="justify-center flex flex-col items-center m-auto shrink overflow-hidden h-screen "> 
        <div class="text-xl pt-2 px-5 md:px-40 text-center md:text-left mb-50px text-black dark:text-white ">
            <p>I'm a passionate programmer who has nothing to do with his life other than to just live in front of a computer and that's it. 
                However i also have other passions and such. 
                Well this is just temporary, don't really expect me to add something useful in it.
                You can call me Midou. Anyway I live in Morocco, I'm {yr} old.
                There are a tons of things i've done but you never know what's the point of doing all of this.
                Hey are you listening? This is serious. No i really mean it's actually serious.
                I'm trying to extend this enough to see if it works or not, because for some reason HTML loves stopping at a point without styling the BG.
                Anyway how's it going? Lore ipsum bullshit yadda yadda yadda. Did you know that project + is actually nice? No? Too bad.
            </p>
        </div>
    </div>
</div>
