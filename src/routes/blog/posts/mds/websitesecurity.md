---
title: How to secure your website (for dummies)
description: "It's not a bug, it's a feature...apparently"
author: midou
date: '2025-12-10'
categories:
  - Security
  - Developement
  - Sysadmin
  - IT
published: true
---

I've discovered that a lot of websites here do not seem to care that much about cyber-security or protection of the personal information of their users. Some even go to egregious levels where they don't even try to protect their endpoints, thinking they'll be fine. Until they realize their mistake and there's no going back. Most breaches don’t happen because of genius hackers. They happen because of lazy infrastructure decisions.

> But hold on, I Just want to get my website up and running as possible ! (I have a static website)

Good! You don't have to worry much about vulnerabilities because there is usually no way for some hacker to get into your system, <b><i><u>as long as the sysadmin that manages your website is able to secure his services properly!</u></i></b>
Static doesn’t mean it's safe from exploits, it just means your **server is now the main target**, not your code.

> Okay, what if I AM a sysadmin and I bought a subscription to host my website through some cheap phpmyadmin or cPanel or whatever web ui software is installed to my server !

Then CANCEL YOUR SUBSCRIPTION and learn how to use a proper VPS or a service that offer you full system control over your OS of choice. If you don't control the OS, you don't control your security.

#### OS Choices

Linux is (very) a good choice to pick, the popular distributions are the usual:

- **Debian**
- **Ubuntu (LTS preferably)**
- **Red Hat Enterprise Linux**
- **AlmaLinux**
- **RockyLinux**
  The majority will choose Debian or Ubuntu due to their unarguable popularity, including me.

Windows Server is usable, but I have no experience field in it, and there is honestly _no reason_ to use windows unless you need some proprietary feature Microsoft offers, which at this point... [I wonder if you even care about security that much.](https://www.bleepingcomputer.com/news/security/over-29-000-exchange-servers-unpatched-against-high-severity-flaw/)

> You're disregarding windows server sysadmins by saying this ! There are a lot of useful things to do on windows servers, like Active Directory, and Microsoft Entra, and a lot more !

Yes it is true that windows servers have undeniable services like ActiveDirectory and a _way better_ ACL manager than linux. Nonetheless; That doesn't mean it's a good idea _for a public-facing web server_. Windows Server significantly increases attack surface due to legacy services, complex permission inheritance, and its tight coupling with remote management features like RDP and SMB. While it excels in enterprise identity management, domain control, and corporate authentication flows, it is objectively heavier, harder to audit at a low level, and more frequently targeted by automated exploit campaigns than a minimal Linux server.

> Okay, I got a Linux server, and I own the OS in it, and can install anything I want there.

When was the last time you updated it ?

> ...8 years ago

**UPDATE** YOUR **SYSTEM** PACKAGES.
Your server is literally waiting for someone to penetrate it and do nasty things to it. You don't even know what could happen, rootkits? botnet? Who the hell knows !
If you are too lazy to do this, you can use [unattended upgrades](https://wiki.debian.org/PeriodicUpdates) to let the system do it for you.

> Okay I actually updated or did just that, what is going to be the next thing you're going to yell at me for ?

How much permission did you give to your web server ?

Are you running:

- Some prehistoric Apache + PHP stack?
- A Node.js app that hasn’t been updated in years?
- A web user that can read your entire filesystem?

If someone gets access to your web service **right now**, how much power do they gain? If you can't answer this, then consider yourself screwed even if it didn't happen yet.

> Uhhhh...

### The semi-virtual system: Docker

Docker is an interesting piece of technology that uses various features from the kernel and overlayfs (it hides your real file system to the application running) to "virtualise" your software, while keeping the exact same host kernel shared. This allows you to have near bare metal performance while making sure the application can only get access to its "fake" OS and "fake" filesystem<a id="1orig" href="#1">¹</a>.I know it's hard for you (even if you got some sort of networking degree) but you need to learn the modern ways of protecting your system.

The 5 essential rules that I follow are the following:

- **DO NOT** trust the client, EVER.
  - Clients can be modifiable by any user if they have enough experience, obfuscation may deter some users but it might attract actual dangerous people who have nothing to lose or risk.
- **Close** every door that can lead you to remote access to the server.
  - Like I said previously, docker can save you from a lot of mistakes and protects you in case your application is compromised. This doesn't mean that it will protect you from database exfiltration, just that environment variables contained in your application will be isolated from other services (like admin panels or tools). Just think of it as a damage reducer, you won't get as badly hurt as a undockerized app.
  - Don't open too many ports either! Port scanning tools exist and make this task easier for adversaries.
- If it's possible to **do something**, it **will happen** sooner or later.
  - Don't neglect security just because a programmer believes that if it works it's good enough. Some services don't even protect their APIs with some cookie or authentication header that expires. Those are easy to exploit and VERY problematic if found.
- **Do security checks**, contract with a cyber-security firm that will happily try to exploit your services, and report to you the vulnerabilities they've found.
  - Really, nobody's going to shame you if you have exploits, at best it might give you some positive praise because you care about your customer's information security, at worst it might make your developers a lot more careful about what they're puking.
- **Use a VPN** to access confidential information/critical infrastructure.
  - A VPN will protect you from any unwanted requests, and makes sure the only people that are able to access your server is the ones who have a configuration file to connect.
  - It's easy to deploy and use.

Haven't slept yet ? Good! You may have noticed that I didn't try to write any guide, becasue those keep getting updated and you have to look around to see the latest available technology to use for your security.

With the age of AI Scrapers trying to take your website down while also stealing all of your content for free, we are supposed to be able to secure our services a bit more, especially when it has to communicate with APIs instead of serving a static page. Security is not a feature you add. It is a condition you maintain.

---

<p id="1"><a href="#1orig">1:</a> When I say "fake", it doesn't mean that it's not doing its job. I'm just oversimplifying the concepts here.</p>
