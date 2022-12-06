<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import Avatar from '$lib/ui/Avatar.svelte';
	import {toName, toIcon} from '$lib/vocab/entity/entityHelpers';
	import type {ClientPersona} from '$lib/vocab/persona/persona';
	import PersonaContextmenu from '$lib/app/contextmenu/PersonaContextmenu.svelte';
	import type {ContextmenuItems} from '$lib/ui/contextmenu/contextmenu';

	export let persona: Readable<ClientPersona>;
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
		? [[PersonaContextmenu, {persona}]]
		: contextmenuAction}
	{inline}><slot /></Avatar
>
