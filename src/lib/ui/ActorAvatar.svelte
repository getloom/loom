<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {toContextmenuParams, type ContextmenuActionParams} from '@feltjs/felt-ui/contextmenu.js';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import type {ClientActor} from '$lib/vocab/actor/actor';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';

	export let actor: Readable<ClientActor>;
	export let showName = true;
	export let showIcon = true;
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
