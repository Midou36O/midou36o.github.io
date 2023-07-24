<script>
    import dayjs from "dayjs";
    import relativeTime from "dayjs/plugin/relativeTime";
    // DayJS
    dayjs.extend(relativeTime);
    let yr = dayjs('2004-15-07').fromNow(true);



</script>

<div class="min-h-screen">
    <div class="mt-70px md:mt-100px flex place-content-center content-center place-items-center gap-3 rounded-2xl mx-7 md:mx-30 my-6 outline outline-offset-0 bg-blue-200 outline-blue-500 dark:outline-indigo-500 dark:bg-indigo-900/50">
        <div class="flex flex-row gap-2 my-4">
            <div class="i-zondicons-information-solid m-1 text-stone-700 dark:text-indigo-300 text-4xl"></div>
            <h1 class="text-stone-700 dark:text-indigo-400 text-4xl">About</h1>
        </div>
    </div>
    <div class="text-center content-center items-center flex flex-col md:inline-flex justify-center place-items-center md:text-left">
        <div class="flex flex-row gap-3 md:pl-30">
            <div class="i-mdi-head-question-outline text-black dark:text-white text-5xl">Head</div>
            <h2 class="text-5xl text-black dark:text-white ">Who i am</h2>
        </div>
        </div>
        <div class="text-xl pt-2 px-5 md:px-40 md:text-left mb-50px text-black dark:text-white ">
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
