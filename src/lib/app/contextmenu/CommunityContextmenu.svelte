<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {Community} from '$lib/vocab/community/community';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CreateSpaceForm from '$lib/ui/CreateSpaceForm.svelte';
	import InviteToCommunityForm from '$lib/ui/InviteToCommunityForm.svelte';
	import CommunityEditor from '$lib/ui/CommunityEditor.svelte';
	import LeaveCommunityForm from '$lib/ui/LeaveCommunityForm.svelte';
	import DeleteCommunityForm from '$lib/ui/DeleteCommunityForm.svelte';
	import ManageRolesForm from '$lib/ui/ManageRolesForm.svelte';

	const {dispatch} = getApp();

	export let community: Readable<Community>;
	export let persona: Readable<AccountPersona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<CommunityAvatar {community} showName={false} />
	</svelte:fragment>
	<CommunityAvatar {community} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: CommunityEditor,
					props: {persona, community, done: () => dispatch.CloseDialog()},
				})}
		>
			Edit Community
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: CreateSpaceForm,
					props: {persona, community, done: () => dispatch.CloseDialog()},
				})}
		>
			Create Space
		</ContextmenuEntry>
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: ManageRolesForm,
					dialogProps: {layout: 'page'},
					props: {persona, community},
				})}
		>
			Manage Roles
		</ContextmenuEntry>
		{#if $community.type !== 'personal'}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: InviteToCommunityForm,
						props: {persona, community, done: () => dispatch.CloseDialog()},
					})}
			>
				Invite People
			</ContextmenuEntry>
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: LeaveCommunityForm,
						props: {persona, community, done: () => dispatch.CloseDialog()},
					})}
			>
				Leave Community
			</ContextmenuEntry>
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: DeleteCommunityForm,
						props: {persona, community, done: () => dispatch.CloseDialog()},
					})}
			>
				Delete Community
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
