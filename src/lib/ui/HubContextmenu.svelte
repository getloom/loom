<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import Contextmenu_Entry from '@fuz.dev/fuz_contextmenu/Contextmenu_Entry.svelte';
	import Contextmenu_Submenu from '@fuz.dev/fuz_contextmenu/Contextmenu_Submenu.svelte';
	import {to_dialog_params} from '@fuz.dev/fuz_dialog/dialog.js';

	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import {getApp} from '$lib/ui/app.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import CreateSpaceForm from '$lib/ui/CreateSpaceForm.svelte';
	import InviteToHubForm from '$lib/ui/InviteToHubForm.svelte';
	import KickFromHubForm from '$lib/ui/KickFromHubForm.svelte';
	import HubEditor from '$lib/ui/HubEditor.svelte';
	import LeaveHubForm from '$lib/ui/LeaveHubForm.svelte';
	import DeleteHubForm from '$lib/ui/DeleteHubForm.svelte';
	import ManageRolesForm from '$lib/ui/ManageRolesForm.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
</script>

<Contextmenu_Submenu>
	<svelte:fragment slot="icon">
		<HubAvatar {actor} {hub} showName={false} />
	</svelte:fragment>
	<HubAvatar {actor} {hub} showIcon={false} />
	<svelte:fragment slot="menu">
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(HubEditor, {actor, hub, done: () => actions.CloseDialog()}),
				)}
		>
			Edit Hub
		</Contextmenu_Entry>
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(
					to_dialog_params(CreateSpaceForm, {actor, hub, done: () => actions.CloseDialog()}),
				)}
		>
			Create Space
		</Contextmenu_Entry>
		<Contextmenu_Entry
			run={() =>
				actions.OpenDialog(to_dialog_params(ManageRolesForm, {actor, hub}, {layout: 'page'}))}
		>
			Manage Roles
		</Contextmenu_Entry>
		{#if $hub.type !== 'personal'}
			<Contextmenu_Entry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(InviteToHubForm, {actor, hub, done: () => actions.CloseDialog()}),
					)}
			>
				Invite People
			</Contextmenu_Entry>
			<Contextmenu_Entry
				run={() => actions.OpenDialog(to_dialog_params(KickFromHubForm, {actor, hub}))}
			>
				Kick People
			</Contextmenu_Entry>
			<Contextmenu_Entry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(LeaveHubForm, {actor, hub, done: () => actions.CloseDialog()}),
					)}
			>
				Leave Hub
			</Contextmenu_Entry>
			<Contextmenu_Entry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(DeleteHubForm, {actor, hub, done: () => actions.CloseDialog()}),
					)}
			>
				Delete Hub
			</Contextmenu_Entry>
		{/if}
	</svelte:fragment>
</Contextmenu_Submenu>
