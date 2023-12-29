<script>
	import proj from '$lib/project.json';
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<body class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans md:px-10%" id="content">
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
							class="i-octicon-project-16 dark:text-white place-content-center place-self-center justify-center content-center text-center pl-0 md:pl-3 text-black text-5xl"
						/>
						<h1 class="text-black dark:text-white text-4xl md:pl-2 md:pr-2">Projects</h1>
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

				<div class="md:pl-4 md:gap-1 flex md:h-50% flex-col place-items-start">
					<div class="overflow-y-auto">
						{#each proj as { name, date, desc, url, image, imdes }, i}
							<a href={url}>
								<!-- Gotta fix this, it's gonna look ugly when there are too many projects in the list... -->
								<div
									in:fly={{ delay: 350, duration: 300 * i, y: -50, easing: quintOut }}
									out:fly={{ duration: 300, y: 50, easing: quintOut }}
									class="flex flex-col p-2 rounded dark:hover:bg-#082f49 hover:bg-blue-100"
								>
									<div class="my-auto">
										<div class="flex flex-row place-content-between">
											<div
												class="flex flex-col pl-4 md:pl-0 gap-3 my-auto py-2 text-left z-0 place-items-start"
											>
												<h3 class="text-3xl dark:text-white text-black text-center">{name}</h3>
												<p class="text-sm dark:text-white text-black text-center">{date}</p>
												<p class="dark:text-white text-black text-sm">{desc}</p>
											</div>
											<div
												class="md:h-10% h-100% md:w-50 w-50 object-cover rounded backdrop-opacity-10 md:object-contain float-right z-10 overflow-hidden md:block hidden"
												style="mask-image: linear-gradient(to left, rgba(0, 0, 0, 1.0) 50%, transparent 100%);"
											>
												<img
													class="transition duration-600 top-0 opacity-50 scale-110 hover:opacity-75 object-cover md:object-contain hover:scale-120"
													src={image}
													alt={imdes}
												/>
											</div>
										</div>
									</div>
								</div>
							</a>
							<hr
								in:fly={{ delay: 300, duration: 500 * i, y: 0, easing: quintOut }}
								out:fly={{ duration: 300, y: 50, easing: quintOut }}
								class="border-black dark:border-white justify-center mx-auto w-85% md:w-100% my-2"
							/>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div></body
>
