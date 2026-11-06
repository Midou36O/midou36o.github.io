<script lang="ts">
	import { resolve } from '$app/paths';

	// Menu
	let showMenu = $state(false);

	function toggleNav() {
		showMenu = !showMenu;
	}
</script>

<header>
	<div class="dark:bg-gray-900 bg-neutral-100 shadow-md w-screen top-0 z-50">
		<div class="flex grid">
			<div>
				<div class="flex flex-row">
					<h1 class="mx-4 md:mt-3 hidden md:block">
						<a
							class="text-black dark:text-white visited:dark:text-white visited:text-black md:text-4xl"
							href={resolve('/')}><strong>Home</strong></a
						>
					</h1>
					<nav
						class="flex md:flex-row flex-col md:flex md:gap-2 list-none md:justify-center md:place-content-center"
						aria-label="Main"
					>
						<div class="flex my-3 gap-3 md:flex-row">
							<div class="ml-5 md:hidden flex text-4xl i-material-symbols-home-outline-rounded">
								<a
									href={resolve('/')}
									class="text-black bg-black cursor-pointer dark:bg-white dark:text-white dark:hover:bg-indigo-5 hover:text-blue-700 hover:bg-blue-700 dark:hover:bg-indigo-5 dark:hover:text-indigo-5"
									>Home</a
								>
							</div>
							<div class="md:hidden flex md:text-5xl text-4xl i-ic-round-menu">
								<button
									class="text-black bg-black cursor-pointer dark:bg-white dark:text-white dark:hover:bg-indigo-5 dark:hover:text-indigo-5 hover:bg-blue-700 hover:text-blue-700"
									type="button"
									aria-controls="navigation-links"
									aria-expanded={showMenu}
									onclick={toggleNav}>Menu</button
								>
							</div>
						</div>
						<ul
							id="navigation-links"
							class="md:flex-row md:flex {showMenu
								? 'flex'
								: 'hidden'} flex-col md:place-content-center md:justify-center flex-1 ml-6 gap-3 md:gap-4"
						>
							<li
								class="{showMenu
									? 'flex'
									: 'hidden'} md:mt-0 md:flex rounded-b-xl shrink place-items-center grid hover:md:bg-gray-100 hover:shadow-lg hover:pt-2 dark:hover:md:shadow-sky-500/50 dark:md:hover:bg-sky-600 hover:duration-100"
							>
								<div
									class="md:hidden i-ri-information-line bg-black dark:bg-white text-3xl px-1"
								></div>
								<a
									href={resolve('/about')}
									class="text-black dark:text-white visited:text-black text-center pt-5 w-20 pb-2 dark:visited:text-white"
									>About</a
								>
							</li>
							<li
								class="{showMenu
									? 'flex'
									: 'hidden'} md:flex rounded-b-xl shrink place-items-center grid columns-3 hover:md:bg-gray-100 hover:shadow-lg hover:pt-2 dark:hover:md:shadow-sky-500/50 dark:md:hover:bg-sky-600 hover:duration-100"
							>
								<div
									class="md:hidden i-mdi-briefcase-outline bg-black dark:bg-white text-3xl px-1"
								></div>
								<a
									href={resolve('/projects')}
									class="text-black dark:text-white visited:text-black text-center w-20 pb-2 pt-5 dark:visited:text-white"
									>Projects</a
								>
							</li>
							<!--<div><li class="{showMenu ? 'flex' : 'hidden'} md:flex rounded-b-xl shrink place-items-center grid columns-3 hover:md:bg-gray-100 hover:shadow-lg hover:pt-2 dark:hover:md:shadow-sky-500/50 dark:md:hover:bg-sky-600 hover:duration-100 mb-2 md:mb-0 "><div class="md:hidden i-mingcute-pen-2-line bg-black dark:bg-white text-3xl px-1"></div><a href="/blog" class="text-black dark:text-white visited:text-black text-center w-20 pb-2 pt-5 dark:visited:text-white">Blog</a></li></div>-->
						</ul>
					</nav>
				</div>
			</div>
			<div class="flex-1 justify-center content-center float-right mr-6 my-4 h-7 w-7 md:my-5"></div>
		</div>
	</div>
</header>
