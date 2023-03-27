<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CreateHubForm from '$lib/ui/CreateHubForm.svelte';
	import DeleteActorForm from '$lib/ui/DeleteActorForm.svelte';

	const {actions} = getApp();

	export let persona: Readable<AccountPersona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<ActorAvatar {persona} showName={false} />
	</svelte:fragment>
	<ActorAvatar {persona} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog({
					Component: CreateHubForm,
					props: {persona, done: () => actions.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			Create Hub
		</ContextmenuEntry>
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog({
					Component: DeleteActorForm,
					props: {persona, done: () => actions.CloseDialog()},
				})}
		>
			Delete Persona
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
