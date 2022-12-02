<script lang="ts">
	export let href: string;

	$: external = !(href.startsWith('/') || href.startsWith('.'));
	$: rel = external ? 'external noreferrer nofollow' : undefined;
	$: target = external ? '_blank' : undefined;
	// TODO this no longer works: `sveltekit:prefetch={prefetch}`
	// $: prefetch = external ? undefined : (true as const);
</script>

<a {...$$restProps} {href} {rel} {target}><slot /></a>
