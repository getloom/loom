<script lang="ts">
	import ContextmenuEntry from '@fuz.dev/fuz/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@fuz.dev/fuz/ContextmenuSubmenu.svelte';
	import {to_dialog_params} from '@fuz.dev/fuz/dialog.js';

	import {getApp} from '$lib/ui/app';
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
	<ContextmenuEntry run={() => actions.OpenDialog(to_dialog_params(Settings, {}))}>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="$" />
		</svelte:fragment>
		Settings
	</ContextmenuEntry>
	<ContextmenuEntry run={() => actions.OpenDialog(to_dialog_params(About, {}))}>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="?" />
		</svelte:fragment>
		About
	</ContextmenuEntry>
{:else}
	<ContextmenuSubmenu>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="/" />
		</svelte:fragment>
		Account
		<svelte:fragment slot="menu">
			{#each $sessionActors.value as actor (actor)}
				<SessionActorContextmenuEntry {actor} />
			{/each}
			<ContextmenuEntry
				run={() =>
					actions.OpenDialog(
						to_dialog_params(CreateAccountActorForm, {done: () => actions.CloseDialog()}),
					)}
			>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="@" />
				</svelte:fragment>
				Create Actor
			</ContextmenuEntry>
			<ContextmenuEntry run={() => actions.OpenDialog(to_dialog_params(Settings, {}))}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="$" />
				</svelte:fragment>
				Settings
			</ContextmenuEntry>
			<ContextmenuEntry run={() => actions.OpenDialog(to_dialog_params(About, {}))}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="?" />
				</svelte:fragment>
				About
			</ContextmenuEntry>
			<ContextmenuEntry run={() => actions.SignOut()}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="<" />
				</svelte:fragment>
				Sign out
			</ContextmenuEntry>
		</svelte:fragment>
	</ContextmenuSubmenu>
{/if}
