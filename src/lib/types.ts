import type { Component } from 'svelte';

export type PostMetadata = {
	title: string;
	author: string;
	description: string;
	date: string;
	categories: string[];
	published: boolean;
};

export type Post = PostMetadata & { slug: string };

export type MarkdownPost = {
	default: Component;
	metadata: PostMetadata;
};
