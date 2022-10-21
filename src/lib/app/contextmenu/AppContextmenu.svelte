<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import ContextmenuEntry from '$lib/ui/contextmenu/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '$lib/ui/contextmenu/ContextmenuSubmenu.svelte';
	import SessionPersonaContextmenuEntry from '$lib/app/contextmenu/SessionPersonaContextmenuEntry.svelte';
	import PersonaInput from '$lib/ui/PersonaInput.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import About from '$lib/ui/About.svelte';
	import AccountEditor from '$lib/ui/AccountEditor.svelte';

	const {
		dispatch,
		ui: {account, session, sessionPersonas},
	} = getApp();
</script>

<ContextmenuSubmenu>
	<svelte:fragment slot="icon">
		<UnicodeIcon icon="⚙️" />
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
						Component: AccountEditor,
						props: {account},
					})}
			>
				Account Settings
			</ContextmenuEntry>
			<ContextmenuEntry
				action={() =>
					dispatch.OpenDialog({
						Component: PersonaInput,
						props: {done: () => dispatch.CloseDialog()},
					})}
			>
				Create Persona
			</ContextmenuEntry>
		{/if}
		<ContextmenuEntry action={() => dispatch.OpenDialog({Component: About})}>
			About
		</ContextmenuEntry>
		{#if !$session.guest}
			<ContextmenuEntry action={() => dispatch.SignOut()}>Sign out</ContextmenuEntry>
		{/if}
	</svelte:fragment>
</ContextmenuSubmenu>
