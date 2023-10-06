<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {
		to_contextmenu_params,
		type ContextmenuActionParams,
	} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import HubContextmenu from '$lib/ui/HubContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let showName = true;
	export let showIcon = true;
	export let contextmenuParams: ContextmenuActionParams | null | undefined = undefined;
	export let inline = false;
</script>

<Avatar
	name={$hub.name}
	type="Hub"
	hue={$hub.settings.hue}
	{showName}
	{showIcon}
	contextmenuParams={contextmenuParams === undefined
		? to_contextmenu_params(HubContextmenu, {actor, hub})
		: contextmenuParams}
	{inline}><slot /></Avatar
>
