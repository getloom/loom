<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CreateSpaceForm from '$lib/ui/CreateSpaceForm.svelte';
	import InviteToHubForm from '$lib/ui/InviteToHubForm.svelte';
	import HubEditor from '$lib/ui/HubEditor.svelte';
	import LeaveHubForm from '$lib/ui/LeaveHubForm.svelte';
	import DeleteHubForm from '$lib/ui/DeleteHubForm.svelte';
	import ManageRolesForm from '$lib/ui/ManageRolesForm.svelte';

	const {dispatch} = getApp();

	export let hub: Readable<Hub>;
	export let persona: Readable<AccountPersona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<HubAvatar {hub} showName={false} />
	</svelte:fragment>
	<HubAvatar {hub} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: HubEditor,
					props: {persona, hub, done: () => dispatch.CloseDialog()},
				})}
		>
			Edit Hub
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: CreateSpaceForm,
					props: {persona, hub, done: () => dispatch.CloseDialog()},
				})}
		>
			Create Space
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: ManageRolesForm,
					dialogProps: {layout: 'page'},
					props: {persona, hub},
				})}
		>
			Manage Roles
		</ContextmenuEntry>
		{#if $hub.type !== 'personal'}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: InviteToHubForm,
						props: {persona, hub, done: () => dispatch.CloseDialog()},
					})}
			>
				Invite People
			</ContextmenuEntry>
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: LeaveHubForm,
						props: {persona, hub, done: () => dispatch.CloseDialog()},
					})}
			>
				Leave Hub
			</ContextmenuEntry>
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: DeleteHubForm,
						props: {persona, hub, done: () => dispatch.CloseDialog()},
					})}
			>
				Delete Hub
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
