<script lang="ts">
	import {base} from '$app/paths';

	import {getViewContext} from '$lib/vocab/view/view';
	import {
		isCommunityRelativePath,
		isCommunityRelativePathValid,
		isSpaceRelativePath,
		isSpaceRelativePathValid,
		SPACE_RELATIVE_PATH_PREFIX,
	} from '$lib/util/fuz';

	const viewContext = getViewContext();
	$: ({community, space} = $viewContext);

	export let href: string;

	$: communityRelative = isCommunityRelativePath(href);
	$: spaceRelative = isSpaceRelativePath(href);
	$: valid = communityRelative
		? isCommunityRelativePathValid(href)
		: spaceRelative
		? isSpaceRelativePathValid(href)
		: true;
	$: finalHref = communityRelative
		? base + '/' + $community.name + href
		: spaceRelative
		? base +
		  '/' +
		  $community.name +
		  $space.path +
		  '/' +
		  href.substring(SPACE_RELATIVE_PATH_PREFIX.length)
		: href;
	$: external = !(communityRelative || spaceRelative || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
	// TODO this no longer works: `sveltekit:prefetch={prefetch}`, see https://github.com/sveltejs/kit/pull/7776
	// $: prefetch = external ? undefined : (true as const);
</script>

{#if valid}<a {...$$restProps} href={finalHref} {rel} {target} on:click><slot /></a>{:else}<slot
	/>{/if}
