<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Contextmenu_Entry from '@ryanatkn/fuz/Contextmenu_Entry.svelte';
	import Contextmenu_Submenu from '@ryanatkn/fuz/Contextmenu_Submenu.svelte';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import CreateHubForm from '$lib/ui/CreateHubForm.svelte';
	import DeleteActorForm from '$lib/ui/DeleteActorForm.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
</script>

<Contextmenu_Submenu>
	<svelte:fragment slot="icon">
		<ActorAvatar {actor} showName={false} />
	</svelte:fragment>
	<ActorAvatar {actor} showIcon={false} />
	<svelte:fragment slot="menu">
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(
						CreateHubForm,
						{actor, done: () => actions.CloseDialog()},
						{layout: 'page'},
					),
				)}
		>
			Create Hub
		</Contextmenu_Entry>
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(DeleteActorForm, {actor, done: () => actions.CloseDialog()}),
				)}
		>
			Delete Actor
		</Contextmenu_Entry>
	</svelte:fragment>
</Contextmenu_Submenu>
