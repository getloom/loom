<script lang="ts">
	import {base} from '$app/paths';

	import {getViewContext} from '$lib/vocab/view/view';
	import {
		isCommunityRelativePath,
		isCommunityRelativePathValid,
		isNetworkRelativePath,
		isNetworkRelativePathValid,
		isSpaceRelativePath,
		isSpaceRelativePathValid,
	} from '$lib/util/fuz';

	const viewContext = getViewContext();
	$: ({community, space} = $viewContext);

	export let href: string;

	$: networkRelative = isNetworkRelativePath(href);
	$: communityRelative = isCommunityRelativePath(href);
	$: spaceRelative = isSpaceRelativePath(href);
	$: valid = networkRelative
		? isNetworkRelativePathValid(href)
		: communityRelative
		? isCommunityRelativePathValid(href)
		: spaceRelative
		? isSpaceRelativePathValid(href)
		: true;
	$: finalHref = networkRelative
		? 'https:' + href
		: communityRelative
		? base + '/' + $community.name + href
		: spaceRelative
		? base + '/' + $community.name + $space.path + '/' + href.substring(2)
		: href;
	$: external = !(communityRelative || spaceRelative || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
	// TODO this no longer works: `sveltekit:prefetch={prefetch}`, see https://github.com/sveltejs/kit/pull/7776
	// $: prefetch = external ? undefined : (true as const);
</script>

{#if valid}<a {...$$restProps} href={finalHref} {rel} {target} on:click><slot /></a>{:else}<slot
	/>{/if}
