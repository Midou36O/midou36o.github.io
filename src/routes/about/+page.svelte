<script>
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	// DayJS
	dayjs.extend(relativeTime);
	let yr = dayjs('2004-07-15').fromNow(true);
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<body
	class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans md:py-0 py-10%"
	id="content"
>
	<div class="min-h-screen">
		<!-- Primary content (Left) -->
		<div class="text-center">
			<div
				class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-screen"
			>
				<div
					in:fly={{ delay: 300, duration: 300, y: 50, easing: quintOut }}
					out:fly={{ duration: 300, y: -50, easing: quintOut }}
					class="flex flex-col"
				>
					<div class="flex flex-col md:flex-row">
						<div
							class="i-gridicons-info dark:text-white place-content-center place-self-center justify-center content-center text-center pl-0 md:pl-3 text-black text-5xl"
						/>
						<h1 class="text-black dark:text-white text-4xl md:pr-2">About me</h1>
					</div>
					<a href="/">
						<div
							class="flex place-content-center place-self-center justify-center content-center flex-row md:pl-25%"
						>
							<div class="i-ep-back text-4xl md:text-2xl my-auto mr-0 md:mr-1" />
							<p class="md:block hidden">Go back?</p>
						</div>
					</a>
				</div>
				<!-- Vertical line -->
				<div
					in:fly={{ delay: 300, duration: 300, y: 0, easing: quintOut }}
					out:fly={{ duration: 300, y: 0, easing: quintOut }}
					class="md:h-1/2 md:w-1 w-3/4 border-1 bg-black border-black dark:bg-white dark:border-white rounded-md"
				/>
				<!-- Secondary Content (Right) -->
				<div
					in:fly={{ delay: 300, duration: 300, y: -50, easing: quintOut }}
					out:fly={{ duration: 300, y: 50, easing: quintOut }}
					class="justify-center w-85% md:w-50% sm:h-75% h-100% flex flex-col items-center md:m-5 sm:m-1 shrink overflow-hidden h-screen"
				>
					<div class="text-xl text-center overflow-scroll md:text-left text-black dark:text-white">
						<p>
							I'm a passionate programmer who quite literally is interested in the inner workings of
							anything related to computers.<br />
							Such as what? Well it's pretty much anything that revolves around computers, from the hardware
							to the software.<br />
							Some examples are: decompiling, reverse engineering, programming, experimenting, and so
							on.<br />
							It's mostly something I love to do in my spare time, and I'm always looking for new things
							to learn.<br />
							I do hate JS though, but svelte is making it bearable.<br />
							This is just a brief summary of who I am, And I hope you enjoy your (rather short) stay
							on my website.<br />
							Oh, just in case, I'm a guy, and I'm {yr} old. You don't need to know more than that.<br
							/>
							Finally, feel free to contact me! I love receiving mails and messages from people, and I'll
							try to respond as soon as possible.<br />
							If it's a question or a request, I'll see if can also publicly document it so that others
							can benefit from it as well.<br />
							Until then, have a nice day!
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</body>
