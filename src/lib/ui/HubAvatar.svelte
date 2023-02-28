<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import HubContextmenu from '$lib/app/contextmenu/HubContextmenu.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';

	export let hub: Readable<Hub>;
	export let showName = true;
	export let showIcon = true;
	export let contextmenuAction: ContextmenuItems | null | undefined = undefined;
	export let inline = false;
</script>

<Avatar
	name={$hub.name}
	type="Hub"
	hue={$hub.settings.hue}
	{showName}
	{showIcon}
	contextmenuAction={contextmenuAction === undefined
		? [[HubContextmenu, {hub}]]
		: contextmenuAction}
	{inline}><slot /></Avatar
>
