<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import type {ClientActor} from '$lib/vocab/actor/persona';
	import ActorContextmenu from '$lib/app/contextmenu/ActorContextmenu.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';

	export let persona: Readable<ClientActor>;
	export let showName = true;
	export let showIcon = true;
	export let contextmenuAction: ContextmenuItems | null | undefined = undefined;
	export let inline = false;
</script>

<Avatar
	name={toName($persona)}
	icon={toIcon($persona)}
	{showName}
	{showIcon}
	contextmenuAction={contextmenuAction === undefined
		? [[ActorContextmenu, {persona}]]
		: contextmenuAction}
	{inline}><slot /></Avatar
>
