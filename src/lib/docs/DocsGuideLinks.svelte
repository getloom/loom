<script lang="ts">
	import {base} from '$app/paths';
	import {page} from '$app/stores';
	import {strip_start, strip_end} from '@grogarden/util/string.js';

	import DocsGuideLink from '$lib/docs/DocsGuideLink.svelte';
	import {getDocsSettings} from '$lib/docs/docs.js';

	// TODO this is all very hacky because we're mounting a component
	// from a library that wants to own a route directory like `/docs`

	const docsSettings = getDocsSettings();
	$: ({path} = $docsSettings);
	$: basePath = base + path;
	$: ({pathname} = $page.url);
	$: relativePath = strip_start(pathname, basePath);
	$: parts = strip_end(strip_start(relativePath, '/'), '/').split('/');
	$: showUnselected = parts.length <= 2;
	$: selectedGuide = parts[0] === 'guide' ? parts[1] : undefined;
</script>

<ul class="docs_content">
	{#if selectedGuide === 'user' || showUnselected}<li><DocsGuideLink guide="user" /></li>{/if}
	{#if selectedGuide === 'admin' || showUnselected}<li><DocsGuideLink guide="admin" /></li>{/if}
	{#if selectedGuide === 'dev' || showUnselected}<li><DocsGuideLink guide="dev" /></li>{/if}
</ul>

<style>
	.docs_content {
		display: flex;
		gap: var(--spacing_md);
	}
	li {
		display: contents;
	}
</style>
