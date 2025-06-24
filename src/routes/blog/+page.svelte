<script lang="ts">
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
	import { convertDate } from '$lib/utils';
	export let data;
	// So the data is: title, date, descriptionription,slug.
	//{#each data.posts as post}
	// {:else}
	// <p>Ayo wait a second</p>
	// {/each}
</script>

<link rel="alternate" type="application/atom+xml" href="/rss.xml" />
<body class="text-black dark:text-white dark:bg-black bg-gray-300 font-sans md:px-10%" id="content">
	<div class="min-h-screen">
		<!-- Primary content (Left) -->
		<div class="text-center">
			<div
				class="justify-center flex md:flex-row flex-col items-center m-auto shrink overflow-hidden h-screen"
			>
				<div
					in:fly={{ delay: 350, duration: 350, y: 50, easing: quintOut }}
					out:fly={{ duration: 350, y: -50, easing: quintOut }}
					class="flex flex-col md:pr-3"
				>
					<div class="flex flex-col md:flex-row">
						<div
							class="i-ph-book-bold dark:text-white place-content-center place-self-center justify-center content-center text-center pl-0 md:pl-3 text-black text-5xl"
						/>
						<h1 class="text-black dark:text-white text-4xl md:pl-3 md:pr-2">Blog</h1>
					</div>
					<a href="/">
						<div
							class="flex place-content-center place-self-center justify-center content-center md:mt-2 flex-row md:pl-25%"
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
					class="md:pl-4 md:gap-1 flex md:h-50% flex-col place-items-start"
				>
					<div class="overflow-y-auto">
						{#each data.posts as { title, date, description, slug }, i}
							<a href="blog/{slug}">
								<!-- Gotta fix this, it's gonna look ugly when there are too many projects in the list... -->
								<div
									in:fly={{ delay: 300, duration: 300 * i, y: -50, easing: quintOut }}
									out:fly={{ duration: 300, y: 50, easing: quintOut }}
									class="flex flex-col p-2 rounded dark:hover:bg-#082f49 hover:bg-blue-100"
								>
									<div class="my-auto">
										<div class="flex flex-row place-content-between">
											<div
												class="flex flex-col pl-4 md:pl-0 gap-3 my-auto py-2 text-left z-0 place-items-start"
											>
												<h3 class="text-3xl dark:text-white text-black text-center">{title}</h3>
												<p class="text-sm dark:text-white text-black text-center">
													{convertDate(date)}
												</p>
												<p class="dark:text-white text-black text-sm">{description}</p>
											</div>
											<div
												class="md:h-10% h-100% md:w-50 w-50 object-cover rounded backdrop-opacity-10 md:object-contain float-right z-10 overflow-hidden md:block hidden"
												style="mask-image: linear-gradient(to left, rgba(0, 0, 0, 1.0) 50%, transparent 100%);"
											>
												<img
													class="transition duration-600 top-0 opacity-50 scale-110 hover:opacity-75 object-cover md:object-contain hover:scale-120"
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
						{:else}
							<p>Ayo wait a second</p>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</div></body
>
