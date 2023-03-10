<script lang="ts">
	import {base} from '$app/paths';

	import {getViewContext} from '$lib/vocab/view/view';
	import {
		isHubRelativePath,
		isHubRelativePathValid,
		isNetworkRelativePath,
		isNetworkRelativePathValid,
		isSpaceRelativePath,
		isSpaceRelativePathValid,
	} from '$lib/util/fuz';
	import {renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';

	const viewContext = getViewContext();
	$: ({hub, directory} = $viewContext);

	export let href: string;

	$: networkRelative = isNetworkRelativePath(href);
	$: hubRelative = isHubRelativePath(href);
	$: spaceRelative = isSpaceRelativePath(href);
	$: valid = networkRelative
		? isNetworkRelativePathValid(href)
		: hubRelative
		? isHubRelativePathValid(href)
		: spaceRelative
		? isSpaceRelativePathValid(href)
		: true;
	$: finalHref = networkRelative
		? 'https:' + href
		: hubRelative
		? base + '/' + $hub.name + href
		: spaceRelative
		? base + '/' + $hub.name + renderDirectoryPath($directory.path) + '/' + href.substring(2)
		: href;
	$: external = !(hubRelative || spaceRelative || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
	// TODO this no longer works: `sveltekit:prefetch={prefetch}`, see https://github.com/sveltejs/kit/pull/7776
	// $: prefetch = external ? undefined : (true as const);
</script>

{#if valid}<a {...$$restProps} href={finalHref} {rel} {target} on:click><slot /></a>{:else}<slot
	/>{/if}
