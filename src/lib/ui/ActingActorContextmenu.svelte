<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import ContextmenuEntry from '@fuz.dev/fuz_contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@fuz.dev/fuz_contextmenu/ContextmenuSubmenu.svelte';
	import {to_dialog_params} from '@fuz.dev/fuz_dialog/dialog.js';

	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import CreateHubForm from '$lib/ui/CreateHubForm.svelte';
	import DeleteActorForm from '$lib/ui/DeleteActorForm.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<ActorAvatar {actor} showName={false} />
	</svelte:fragment>
	<ActorAvatar {actor} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
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
		</ContextmenuEntry>
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(DeleteActorForm, {actor, done: () => actions.CloseDialog()}),
				)}
		>
			Delete Actor
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
