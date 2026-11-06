# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/master/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

```bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
```

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

## Main-menu profession reveal

Hovering or keyboard-focusing “Programmer” crossfades only that word to red
“VIBECODER” over 1.4 seconds, preserving its font and layout space. Holding for
2.8 seconds cuts the rest of the page away. Leaving the isolated word fades it out
first, then fades the page back with “Programmer” restored. Leaving before isolation
only reverses the word crossfade. Reduced motion skips the fades.

## Background fallback

Pages and navigation are server-rendered HTML. Without JavaScript, the background
is hidden and posts use the full reading width without the scene rail or entry
animation.

If WebGL2 is unavailable or fails during initialization, Canvas 2D renders a fixed
preset at the current viewport size and pixel density. It preserves model proportions
at custom resolutions, with no animation frames, physics stepping, or dragging.
Layout, content-boundary, and theme changes redraw the still image as needed.

The animated scene measures its own CPU work in batches of eight frames. If a batch
averages more than 16.7ms per frame, it switches to the fixed preset for that scene's
lifetime, retaining WebGL when available. This handles costly interpreter-only
execution without attempting to detect or bypass the browser's JIT policy. Dragging
and animation stop, while resize and theme changes can still redraw the preset.
