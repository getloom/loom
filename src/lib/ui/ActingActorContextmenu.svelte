<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import ContextmenuEntry from '@feltjs/felt-ui/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@feltjs/felt-ui/ContextmenuSubmenu.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

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
					toDialogParams(
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
					toDialogParams(DeleteActorForm, {actor, done: () => actions.CloseDialog()}),
				)}
		>
			Delete Actor
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
