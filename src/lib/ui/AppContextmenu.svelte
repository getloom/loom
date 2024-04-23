<script lang="ts">
	import Contextmenu_Entry from '@ryanatkn/fuz/Contextmenu_Entry.svelte';
	import Contextmenu_Submenu from '@ryanatkn/fuz/Contextmenu_Submenu.svelte';
	import {to_dialog_params} from '@ryanatkn/fuz/dialog.js';

	import {getApp} from '$lib/ui/app.js';
	import SessionActorContextmenuEntry from '$lib/ui/SessionActorContextmenuEntry.svelte';
	import CreateAccountActorForm from '$lib/ui/CreateAccountActorForm.svelte';
	import UnicodeIcon from '$lib/ui/UnicodeIcon.svelte';
	import About from '$lib/ui/About.svelte';
	import Settings from '$lib/ui/Settings.svelte';

	const {
		actions,
		ui: {session, sessionActors},
	} = getApp();
</script>

{#if $session.guest}
	<Contextmenu_Entry run={() => actions.OpenDialog(to_dialog_params(Settings, {}))}>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="$" />
		</svelte:fragment>
		Settings
	</Contextmenu_Entry>
	<Contextmenu_Entry run={() => actions.OpenDialog(to_dialog_params(About, {}))}>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="?" />
		</svelte:fragment>
		About
	</Contextmenu_Entry>
{:else}
	<Contextmenu_Submenu>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="/" />
		</svelte:fragment>
		Account
		<svelte:fragment slot="menu">
			{#each $sessionActors.value as actor (actor)}
				<SessionActorContextmenuEntry {actor} />
			{/each}
			<Contextmenu_Entry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(CreateAccountActorForm, {done: () => actions.CloseDialog()}),
					)}
			>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="@" />
				</svelte:fragment>
				Create Actor
			</Contextmenu_Entry>
			<Contextmenu_Entry run={() => actions.OpenDialog(to_dialog_params(Settings, {}))}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="$" />
				</svelte:fragment>
				Settings
			</Contextmenu_Entry>
			<Contextmenu_Entry run={() => actions.OpenDialog(to_dialog_params(About, {}))}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="?" />
				</svelte:fragment>
				About
			</Contextmenu_Entry>
			<Contextmenu_Entry run={() => actions.SignOut()}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="<" />
				</svelte:fragment>
				Sign out
			</Contextmenu_Entry>
		</svelte:fragment>
	</Contextmenu_Submenu>
{/if}
