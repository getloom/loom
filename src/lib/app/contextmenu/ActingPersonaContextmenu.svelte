<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import {getApp} from '$lib/ui/app';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import CreateCommunityForm from '$lib/ui/CreateCommunityForm.svelte';
	import ManageAssignmentForm from '$lib/ui/ManageAssignmentForm.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<AccountPersona>;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<PersonaAvatar {persona} showName={false} />
	</svelte:fragment>
	<PersonaAvatar {persona} showIcon={false} />
	<svelte:fragment slot="menu">
		<ContextmenuEntry
			action={() =>
				dispatch.OpenDialog({
					Component: CreateCommunityForm,
					props: {persona, done: () => dispatch.CloseDialog()},
					dialogProps: {layout: 'page'},
				})}
		>
			Create Community
		</ContextmenuEntry>
		<ContextmenuEntry action={() => dispatch.OpenDialog({Component: ManageAssignmentForm})}>
			Manage Assignments
		</ContextmenuEntry>
	</svelte:fragment>
</ContextmenuSubmenu>
