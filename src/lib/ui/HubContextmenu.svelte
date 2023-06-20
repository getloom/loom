<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import ContextmenuEntry from '@feltjs/felt-ui/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@feltjs/felt-ui/ContextmenuSubmenu.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';
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

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<HubAvatar {actor} {hub} showName={false} />
	</svelte:fragment>
	<HubAvatar {actor} {hub} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog(
					toDialogParams(HubEditor, {actor, hub, done: () => actions.CloseDialog()}),
				)}
		>
			Edit Hub
		</ContextmenuEntry>
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog(
					toDialogParams(CreateSpaceForm, {actor, hub, done: () => actions.CloseDialog()}),
				)}
		>
			Create Space
		</ContextmenuEntry>
		<ContextmenuEntry
			run={() =>
				actions.OpenDialog(toDialogParams(ManageRolesForm, {actor, hub}, {layout: 'page'}))}
		>
			Manage Roles
		</ContextmenuEntry>
		{#if $hub.type !== 'personal'}
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog(
						toDialogParams(InviteToHubForm, {actor, hub, done: () => actions.CloseDialog()}),
					)}
			>
				Invite People
			</ContextmenuEntry>
			<ContextmenuEntry
				run={() => actions.OpenDialog(toDialogParams(KickFromHubForm, {actor, hub}))}
			>
				Kick People
			</ContextmenuEntry>
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog(
						toDialogParams(LeaveHubForm, {actor, hub, done: () => actions.CloseDialog()}),
					)}
			>
				Leave Hub
			</ContextmenuEntry>
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog(
						toDialogParams(DeleteHubForm, {actor, hub, done: () => actions.CloseDialog()}),
					)}
			>
				Delete Hub
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
