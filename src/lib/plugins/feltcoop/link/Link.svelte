<script lang="ts">
	import {base} from '$app/paths';

	import {getViewContext} from '$lib/vocab/view/view';
	import {isAbsolutePathValid} from '$lib/util/fuz';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	export let href: string;

	$: absolute = href.startsWith('/');
	$: valid = absolute ? isAbsolutePathValid(href) : true;
	// Absolute paths are community-relative,
	// similar to how links work in markdown documents on GitHub repos.
	$: finalHref = absolute ? base + '/' + $community.name + href : href;
	$: external = !(absolute || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
	// TODO this no longer works: `sveltekit:prefetch={prefetch}`, see https://github.com/sveltejs/kit/pull/7776
	// $: prefetch = external ? undefined : (true as const);
</script>

{#if valid}<a {...$$restProps} href={finalHref} {rel} {target} on:click><slot /></a>{:else}<slot
	/>{/if}
