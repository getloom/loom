<script lang="ts">
	import type {Readable} from '@getloom/svelte-gettable-stores';

	import type {Space} from '$lib/vocab/space/space.js';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';

	export let space: Readable<Space>;
	export let iconAttrs: any = undefined;
</script>

<UnicodeIcon icon={$space.icon} title={$space.name} {...iconAttrs} />
