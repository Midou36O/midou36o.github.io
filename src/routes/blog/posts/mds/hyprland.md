---
title: Moving from Sway to Hyprland
description: My journey to using Hyprland
author: midou
date: '2024-1-22'
categories:
  - sway
  - hyprland
  - WM
published: true
---

So I've been using hyprland for a while now and it's an interesting WM to use. I was a Sway user back then and before that an i3-wm user.
While I'm not going to explain why I use a TWM as there are so many reasons as to why. I'm going to tell you about how I adapted my sway config
to work on Hyprland.

## What is Hyprland?

[Hyprland](https://github.com/hyprwm/Hyprland) is a **T**iling **W**indow **M**anager that aims to be highly customizable and modular. It's also bleeding edge
so you might want to actually be a little bit careful as it could crash or have breaking changes at some point. But it's recently stabilized a bit so there is little to no crashes
if you don't do anything _stupid_

[![Image of an Hyprland ricing taken from the github repo.](/blog/images/hyprland/preview.png)](https://midou.dev/blog/images/hyprland/preview.png)

## And sway?

[Sway](https://github.com/swaywm/sway) is an [i3](https://i3wm.org/) compatible TWM that aims to be as close and faithful to i3, if i3 does not provide it, Sway will not provide it too minus minor exceptions.
It's a solid and stable WM that don't get too many changes. Unfortunately for my use case, it's a little bit _too_ basic.

Now I'm going to tell you my first time experience with Hyprland.

# Installing Hyprland.

Installing it on arch is as simple as

```bash
sudo pacman -S hyprland --noconfirm
```

And now, time to open it from the terminal!
[![First experience](/blog/images/hyprland/firstexperience.png)](https://midou.dev/blog/images/hyprland/firstexperience.png)
...Great. Some anime weaboo made this thing.

So what would be the first thing that anyone should do?

![Don't let them corrupt your brain.](/blog/images/hyprland/destroy-anime.gif)

Now to the serious part.

# Configuring Hyprland.

We all know that Sway and Hyprland have different configs. Fortunately, [Hyprland has a wiki.](https://wiki.hyprland.org/) Unfortunately, Hyprland's wiki has such a bad search bar that you're better off searXing everything off reddit.
(Discord is not an option, I looked at it, it's mostly the typical non-serious guilds. God I wish every open source project was on Matrix already...)

The pre-generated config file we edited earlier (It should be in `~/.config/hypr/hyprland.conf`) has links you can go to and find the important parts you will need.
Now porting the sway config to Hyprland wasn't really all that hard, [Catppuccin already had a Hyprland repo color scheme i could snatch](https://github.com/catppuccin/hyprland/), and a lot of the small programs and scripts i use/made were compatible with it.

The things to note here are:

- `exec` in sway is `exec =` in Hyprland
- `exec-once` is available in Hyprland while sway doesn't
- Plugins can be used using the `plugin = /path/to/plugin/lib.so`
- Theme color schemes can be used using `source= /path/to/color.conf`
- The layouts are completely different than sway, so please configure hyprland in Sway first (by opening it as a nested compositor.) and then edit it until it's good enough
- `bindsym` in sway is `bind[type-of-bind]` in Hyprland, be careful as Hyprland uses `,` to separate things instead of regular spaces in sway.
- The generic format of Hyprland is `command = input-or-option1, input-or-option2, input-or-option3, ...`
- Gesutres

I might release the dotfiles when i feel like it. I'll update this page if it's available.

Now that we got a proper base config. We can install plugins!

# Installing plugins

Now you might say, "Midou, If Hyprland is better than Sway, why do you need plugins when you didn't even need them in Sway?"
Well that's a good question! In my use case (and probably all the i3/Sway users), **Hyprland barely supports any i3 layout**. It only supports the default one, and Dwindle, apparently coming from DWM.
But that's _not_ what I want. I use grouped tabs almost daily and I prefer to be able to resize and move things however I want.

## Introducing hy3

[Hy3](https://github.com/outfoxxed/hy3) is a plugin that aims to recreate and restore some of the beloved i3/Sway features with extra optional features.
It supports grouped apps with tabs. Well, the usual i3 stuff we're used to, feel free to check the repo.

On arch installing hy3 is as easy as

```bash
sudo pacman -S hy3 --noconfirm
```

And adding the proper line in the config file of hyprland.

```
plugin = /usr/lib/libhy3.so
```

Congrats! Now you've installed hy3!
Now you will have to create a `plugin` category in the config. A snippet of my config is as follows.

```

plugin {
    hy3 {
        no_gaps_when_only = 1
        tab_first_window = 0
        tabs {
            col.active = $lavender
            col.inactive = $surface0
            col.urgent = $red
            col.text.active = $base
            col.text.urgent = $text
            col.text.inactive = $lavender
        }
        autotile {
            enable = 1
        }
    }
}
```

You can check the README.md and see what the configs mean.

We also have to replace some commands to hy3 compatible ones. For my personnal experience it's not that necessary, but some features won't work without them and hy3 already works with vanilla Hyprland commands.
The most norable ones are

```

# Killing the window

bind = $mainMod SHIFT, Q, hy3:killactive,

# Moving the window focus

bind = $mainMod, left, hy3:movefocus, l
bind = $mainMod, right, hy3:movefocus, r
bind = $mainMod, up, hy3:movefocus, u
bind = $mainMod, down, hy3:movefocus, d

# Moving the window itself

bind = $mainMod SHIFT, left, hy3:movewindow, l
bind = $mainMod SHIFT, right, hy3:movewindow, r
bind = $mainMod SHIFT, up, hy3:movewindow, u
bind = $mainMod SHIFT, down, hy3:movewindow, d

# Hy3 specific binds

# Mostly tab commands and similar.

bind = $mainMod, Z, hy3:changegroup, toggletab
bind = $mainMod, S, hy3:makegroup, v
bind = $mainMod, A, hy3:changefocus, raise
bind = $mainMod SHIFT, A, hy3:changefocus, lower
bind = $mainMod, T, hy3:expand, expand
bind = $mainMod SHIFT, T, hy3:expand, base
bind = $mainMod, R, hy3:changegroup, opposite

```

# Installing Waybar.

Waybar is a good status bar, similar to polybar on X11, you can customize it using css and modify its config using json.
To install Waybar you can just run

```bash
sudo pacman -S waybar --noconfirm
```

But the -git version is recommended in some cases.

The general goal here is to adapt the waybar config to be compatible with Hyprland. Notably:

- replacing all `sway/` occurences with `hyprland/`.
- Editing the workspace and adding

```css
#workspaces button.active {
	background-color: @mantle;
	box-shadow: inset 0 -3px @lavender;
}
```

- Adding this config

```json
  "hyprland/window": {
    "on-click": "activate"
  },
```

- Not forgetting to uncomment (if commented)

```json
  "layer": "top", // Waybar at top layer
```

And you should be good to go.

# And the wallpaper?

Oh right! We removed that anime thing, so we have to replace it with something you actually want!

You could use sway's wallpaper thing but I used [Hyprland wallpaper (aka Hyprpaper)](https://github.com/hyprwm/hyprpaper) for fun. So let's install that.

```bash
sudo pacman -S hyprpaper -y
```

Make a new file named `~/.config/hypr/hyprpaper.conf`.

You can add this to the config and edit it to your liking.

```
preload = /path/to/imge.png

wallpaper = ,/path/to/image.png

#enable splash text rendering over the wallpaper
splash = false

#fully disable ipc
# ipc = off
```

More details in the [hyprpaper](https://github.com/hyprwm/hyprpaper/blob/main/README.md) readme.

Congratulations, you now know how to (roughly) setup hyprland!

Now what?
Well you can start ricing your TWM like a madman in [r/unixporn](https://lr.psf.lt/r/unixporn) or snatch the dotfiles and adapt it to your liking. But i'm not that type of guy, my desktop is simple.

[![My desktop](/blog/images/hyprland/desktop.png)](https://midou.dev/blog/images/hyprland/desktop.png)

Have fun, and see you later!
