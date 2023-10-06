<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {
		to_contextmenu_params,
		type ContextmenuActionParams,
	} from '@fuz.dev/fuz_contextmenu/contextmenu.js';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers.js';
	import type {ClientActor} from '$lib/vocab/actor/actor.js';
	import ActorContextmenu from '$lib/ui/ActorContextmenu.svelte';

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
		? to_contextmenu_params(ActorContextmenu, {actor})
		: contextmenuParams}
	{inline}><slot /></Avatar
>
