<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams, type ContextmenuActionParams} from '@feltjs/felt-ui/contextmenu.js';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import type {ClientActor} from '$lib/vocab/actor/actor';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';

	export let actor: Readable<ClientActor>;
	export let showName = true;
	export let showIcon = true;
	// TODO this eslint hack shouldn't be necessary, introduced with Svelte 4 and seems like the TS plugin's fault, if it doesn't get solved, maybe disable the rule
	/* eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents */
	export let contextmenuParams: ContextmenuActionParams | null | undefined = undefined;
	export let inline = false;
</script>

<Avatar
	name={toName($actor)}
	icon={toIcon($actor)}
	{showName}
	{showIcon}
	contextmenuParams={contextmenuParams === undefined
		? toContextmenuParams(ActorContextmenu, {actor})
		: contextmenuParams}
	{inline}><slot /></Avatar
>
