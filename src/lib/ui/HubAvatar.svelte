<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams, type ContextmenuActionParams} from '@feltjs/felt-ui/contextmenu.js';

	import Avatar from '$lib/ui/Avatar.svelte';
	import type {Hub} from '$lib/vocab/hub/hub';
	import HubContextmenu from '$lib/app/contextmenu/HubContextmenu.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';

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
		? toContextmenuParams(HubContextmenu, {actor, hub})
		: contextmenuParams}
	{inline}><slot /></Avatar
>
