<script lang="ts">
	import {getViewContext} from '$lib/vocab/view/view';

	const viewContext = getViewContext();
	$: ({community} = $viewContext);

	export let href: string;

	$: absolute = href.startsWith('/');
	// Absolute paths are community-relative,
	// similar to how links work in markdown documents on GitHub repos.
	$: finalHref = absolute ? '/' + $community.name + href : href;

	$: external = !(absolute || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
	// TODO this no longer works: `sveltekit:prefetch={prefetch}`, see https://github.com/sveltejs/kit/pull/7776
	// $: prefetch = external ? undefined : (true as const);
</script>

<a {...$$restProps} href={finalHref} {rel} {target} on:click><slot /></a>
