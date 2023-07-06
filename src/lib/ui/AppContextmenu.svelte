<script lang="ts">
	import ContextmenuEntry from '@feltjs/felt-ui/ContextmenuEntry.svelte';
	import ContextmenuSubmenu from '@feltjs/felt-ui/ContextmenuSubmenu.svelte';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

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
	<ContextmenuEntry run={() => actions.OpenDialog(toDialogParams(Settings, {}))}>
		<svelte:fragment slot="icon">
			<UnicodeIcon icon="$" />
		</svelte:fragment>
		Settings
	</ContextmenuEntry>
	<ContextmenuEntry run={() => actions.OpenDialog(toDialogParams(About, {}))}>
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
						toDialogParams(CreateAccountActorForm, {done: () => actions.CloseDialog()}),
					)}
			>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="@" />
				</svelte:fragment>
				Create Actor
			</ContextmenuEntry>
			<ContextmenuEntry run={() => actions.OpenDialog(toDialogParams(Settings, {}))}>
				<svelte:fragment slot="icon">
					<UnicodeIcon icon="$" />
				</svelte:fragment>
				Settings
			</ContextmenuEntry>
			<ContextmenuEntry run={() => actions.OpenDialog(toDialogParams(About, {}))}>
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
