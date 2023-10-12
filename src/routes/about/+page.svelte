<script>
    import dayjs from "dayjs";
    import relativeTime from "dayjs/plugin/relativeTime";
    // DayJS
    dayjs.extend(relativeTime);
    let yr = dayjs('2004-07-15').fromNow(true);
    import { fly } from 'svelte/transition';  
    import { quintOut } from 'svelte/easing'; 
</script>

<body class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans md:px-10%" id="content"> 
    <div class="min-h-screen">
      <!-- Primary content (Left) -->
         <div class="text-center">
          <div
          class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-screen ">
          <div
         in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut}}  
         out:fly={{ duration: 300, y: -50, easing: quintOut}}              
          class="flex flex-col">
          <div class="flex flex-col md:flex-row">
             <div 
              class="i-gridicons-info dark:text-white place-content-center place-self-center justify-center content-center text-center pl-0 md:pl-3 text-black text-5xl"
              ></div>
             <h1 
              class="text-black dark:text-white text-4xl md:pr-2"
              >About me</h1>
              </div>
               <p class="md:hidden block text-gray-500 py-1"> I fucking hate css </p>
               <a href="/">
               <div class="flex place-content-center place-self-center justify-center content-center flex-row md:pl-25%">
               <div class="i-ep-back text-4xl md:text-2xl my-auto mr-0 md:mr-1"></div>
               <p class="md:block hidden"> Go back? </p>
               </div>
               </a>
               </div>
               <!-- Vertical line -->
             <div
              in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut}}
              out:fly={{ duration: 300, y: 0, easing: quintOut}}
              class="md:h-1/2 md:w-1 w-3/4 border-1 bg-black border-black dark:bg-white dark:border-white rounded-md"
              ></div>
                <!-- Secondary Content (Right) --> 
               <div
                in:fly={{ delay: 300, duration: 300, y: -50, easing: quintOut}}   
                out:fly={{ duration: 300, y: 50, easing: quintOut}}               
               class="justify-center w-85% md:w-50% h-100% flex flex-col items-center md:m-5 shrink overflow-hidden h-screen "> 
                   <div class="text-xl text-center overflow-scroll md:text-left text-black dark:text-white ">
                       <p>I'm a passionate programmer who has nothing to do with his life other than to just live in front of a computer and that's it.<br/> 
                           However i also have other passions and such.<br/> 
                           Well this is just temporary, don't really expect me to add something useful in it.<br/>
                           You can call me Midou. Anyway I live in Morocco, I'm {yr} old.<br/>
                           There are a tons of things i've done but you never know what's the point of doing all of this.<br/>
                           Hey are you listening? This is serious. No i really mean it's actually serious.<br/>
                           I'm trying to extend this enough to see if it works or not, because for some reason HTML loves stopping at a point without styling the BG.<br/>
                           Anyway how's it going? Lore ipsum bullshit yadda yadda yadda. Did you know that project + is actually nice? No? Too bad.<br/>
                       </p>
                   </div>
               </div>
             </div>
        </div> 
    </div>
</body>

