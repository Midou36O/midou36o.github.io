<script>
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
</script>

<body class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans" id="content">
  <!-- Primary content -->
  <div class="text-center">
   <div class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-screen ">
      <div>
       <div class="flex flex-col md:flex-row">
       <div 
       in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut}}
       out:fly={{ duration: 300, y: -50, easing: quintOut}}
       class="i-tabler-coin-monero dark:text-white mx-auto md:mx-0 pl-0 md:pl-3 text-black text-5xl"
       />
      <h1 
       in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut}}
       out:fly={{ duration: 300, y: -50, easing: quintOut}}
       class="text-black dark:text-white text-4xl md:pr-2"
       >Monero</h1>
      </div>
        <p class="md:hidden block text-gray-500"> I fucking hate css </p>
        <a href="/">                                                                                               
        <div class="flex place-content-center place-self-center justify-center content-center flex-row md:pl-25%"> 
        <div class="i-material-symbols-home-outline-rounded text-4xl md:text-2xl my-auto mr-0 md:mr-1"></div>                                    
        <p class="md:block hidden"> Go home? </p>
        </div>                                                                                                     
        </a>
       </div>
        <!-- Vertical line -->
      <div
       in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut}}
       out:fly={{ duration: 300, y: 0, easing: quintOut}}
       class="md:h-1/2 md:w-1 w-3/4 border-1 bg-black border-black dark:bg-white dark:border-white rounded-md"
       ></div>
       <!-- Secondary content -->
      <div
       in:fly={{ delay: 300, duration: 300, y: -50, easing: quintOut}}
       out:fly={{ duration: 300, y: 50, easing: quintOut}}
       class="flex flex-col md:px-2 text-center md:text-left"
       >
        <h1 class="text-3xl pb-3">QR code:</h1>
        <img src="/qr.png" alt="QR code" class="pb-5 justify-center md:w-1.5/4 md:mx-0 mx-auto md:h-1.5/4 w-80% text-center items-center h-auto"/>
        <h1 class="underline-offset-auto hover:underline text-3xl"><a href="monero:44UzWvWS9wELmqPXzLqiPphXVYBbsjkbC7r4RwCSoXC4UyzC2NbPEoPEjxZsGVfbSPbAHUGtpc8GUYUZ8fdu1a4bNAyBPDe"> Monero wallet:</a></h1>
        <p class="mx-2 md:mx-0 bg-black dark:bg-white dark:text-black text-white p-1 rounded-md "><code class="break-all ">44UzWvWS9wELmqPXzLqiPphXVYBbsjkbC7r4RwCSoXC4UyzC2NbPEoPEjxZsGVfbSPbAHUGtpc8GUYUZ8fdu1a4bNAyBPDe</code></p>
      </div>
  </div>
</body>
