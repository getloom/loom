<script lang="ts">
	import {base} from '$app/paths';
	import {PUBLIC_ADMIN_EMAIL, PUBLIC_GIT_HASH} from '$env/static/public';
	import {VERSION as SVELTEKIT_VERSION} from '@sveltejs/kit';

	import {VERSION as LOOM_VERSION} from '$lib/util/constants.js';
</script>

<div class="prose padded_1">
	<h1>About this Instance</h1>
	<p>Need help? Have questions, comments, concerns?</p>
	<ul>
		<li>
			see <a href="{base}/docs">the docs</a>
		</li>
		<li>
			email the admin at <a href="mailto:{PUBLIC_ADMIN_EMAIL}">{PUBLIC_ADMIN_EMAIL}</a>
		</li>
	</ul>
	<blockquote>
		<p class="title">
			<a href="https://github.com/getloom/loom" target="_blank" rel="noreferrer">🧺</a>
			<a href="https://www.getloom.org/" target="_blank" rel="noreferrer">Loom</a>
			version
			<a
				href="https://github.com/getloom/loom/releases/tag/v{LOOM_VERSION}"
				target="_blank"
				rel="noreferrer"
			>
				{LOOM_VERSION}
			</a>
			commit
			<a
				href="https://github.com/getloom/loom/commit/{PUBLIC_GIT_HASH}"
				target="_blank"
				rel="noreferrer"
			>
				{PUBLIC_GIT_HASH.substring(0, 7)}
			</a>
		</p>
		<p class="title">
			<a href="https://github.com/sveltejs/kit" target="_blank" rel="noreferrer">🧡</a>
			<a href="https://kit.svelte.dev/" target="_blank" rel="noreferrer">SvelteKit</a>
			version
			<a
				href="https://github.com/sveltejs/kit/releases/tag/%40sveltejs%2Fkit%40{SVELTEKIT_VERSION}"
				target="_blank"
				rel="noreferrer"
			>
				{SVELTEKIT_VERSION}
			</a>
		</p>
	</blockquote>
</div>

<style>
	/* TODO utility class */
	h1 {
		margin-top: 0;
	}
</style>
