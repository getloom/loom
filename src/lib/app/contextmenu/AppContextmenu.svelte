<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import SessionPersonaContextmenuEntry from '$lib/app/contextmenu/SessionPersonaContextmenuEntry.svelte';
	import CreateAccountPersonaForm from '$lib/ui/CreateAccountPersonaForm.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import About from '$lib/ui/About.svelte';
	import AccountEditor from '$lib/ui/AccountEditor.svelte';
	import CreateEventForm from '$lib/ui/CreateEventForm.svelte';

	const {
		dispatch,
		ui: {account, session, sessionPersonas, personaSelection},
	} = getApp();

	$: selectedPersona = $personaSelection;
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="/" />
	</svelte:fragment>
	Account
	<svelte:fragment slot="menu">
		{#each $sessionPersonas.value as persona (persona)}
			<SessionPersonaContextmenuEntry {persona} />
		{/each}
		{#if !$session.guest}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: CreateAccountPersonaForm,
						props: {done: () => dispatch.CloseDialog()},
					})}
			>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="@" />
				</svelte:fragment>
				Create Persona
			</ContextmenuEntry>
		{/if}
		{#if !$session.guest}
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
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
					action={() =>
						dispatch.OpenDialog({
							Component: CreateEventForm,
							props: {persona: selectedPersona},
							dialogProps: {layout: 'page'},
						})}
				>
					Create a System Event
				</ContextmenuEntry>
			</svelte:fragment>
		</ContextmenuSubmenu>
		<ContextmenuEntry action={() => dispatch.OpenDialog({Component: About})}>
			<svelte:fragment slot="icon">
				<UnicodeIcon icon="?" />
			</svelte:fragment>
			About
		</ContextmenuEntry>
		{#if !$session.guest}
			<ContextmenuEntry action={() => dispatch.SignOut()}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="<" />
				</svelte:fragment>
				Sign out
			</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
