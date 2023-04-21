<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import SessionActorContextmenuEntry from '$lib/app/contextmenu/SessionActorContextmenuEntry.svelte';
	import CreateAccountActorForm from '$lib/ui/CreateAccountActorForm.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import About from '$lib/ui/About.svelte';
	import AccountEditor from '$lib/ui/AccountEditor.svelte';
	import CreateActionForm from '$lib/ui/CreateActionForm.svelte';

	const {
		actions,
		ui: {account, session, sessionActors, actorSelection},
	} = getApp();

	$: selectedActor = $actorSelection;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="/" />
	</svelte:fragment>
	Account
	<svelte:fragment slot="menu">
		{#each $sessionActors.value as actor (actor)}
			<SessionActorContextmenuEntry {actor} />
		{/each}
		{#if !$session.guest}
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog({
						Component: CreateAccountActorForm,
						props: {done: () => actions.CloseDialog()},
					})}
			>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="@" />
				</svelte:fragment>
				Create Actor
			</ContextmenuEntry>
		{/if}
		{#if !$session.guest}
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog({
						Component: AccountEditor,
						props: {account},
					})}
			>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="$" />
				</svelte:fragment>
				Account settings
			</ContextmenuEntry>
		{/if}
		<ContextmenuSubmenu>
			<svelte:fragment slot="icon">
				<UnicodeIcon icon="*" />
			</svelte:fragment>
			Advanced
			<svelte:fragment slot="menu">
				<ContextmenuEntry
					run={() =>
						actions.OpenDialog({
							Component: CreateActionForm,
							props: {actor: selectedActor},
							dialogProps: {layout: 'page'},
						})}
				>
					Create a System Event
				</ContextmenuEntry>
			</svelte:fragment>
		</ContextmenuSubmenu>
		<ContextmenuEntry run={() => actions.OpenDialog({Component: About})}>
			<svelte:fragment slot="icon">
				<UnicodeIcon icon="?" />
			</svelte:fragment>
			About
		</ContextmenuEntry>
		{#if !$session.guest}
			<ContextmenuEntry run={() => actions.SignOut()}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="<" />
				</svelte:fragment>
				Sign out
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
