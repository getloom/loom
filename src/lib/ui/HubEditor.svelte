<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';
	import {toDialogParams} from '@feltjs/felt-ui/dialog.js';

	import type {Hub} from '$lib/vocab/hub/hub';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import HubSettingsHue from '$lib/ui/HubSettingsHue.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import EditHubAdvanced from '$lib/ui/EditHubAdvanced.svelte';
	import DeleteHubForm from '$lib/ui/DeleteHubForm.svelte';
	import LeaveHubForm from '$lib/ui/LeaveHubForm.svelte';
	import {getApp} from '$lib/ui/app';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;
</script>

<div class="hub-editor width_md">
	<form class="prose" {...attrs}>
		<header>
			<h2>Edit Hub</h2>
			<p style:font-size="var(--size_xl)">
				<HubAvatar {actor} {hub} />
			</p>
			<section>
				<p>created {format($hub.created, 'PPPPp')}</p>
				{#if $hub.updated !== null}
					<p>updated {format($hub.updated, 'PPPPp')}</p>
				{/if}
			</section>
		</header>
		<fieldset>
			<legend>settings</legend>
			<HubSettingsHue {actor} {hub} />
		</fieldset>
		<fieldset>
			<legend class="error_text">danger zone</legend>
			<button
				title="leave hub"
				on:click={() =>
					actions.OpenDialog(
						toDialogParams(LeaveHubForm, {
							actor,
							hub,
							done: () => {
								actions.CloseDialog();
								done?.();
							},
						}),
					)}
			>
				leave hub
			</button>
			<button
				title="delete hub"
				on:click={() =>
					actions.OpenDialog(
						toDialogParams(DeleteHubForm, {
							actor,
							hub,
							done: () => {
								actions.CloseDialog();
								done?.();
							},
						}),
					)}
			>
				delete hub
			</button>
		</fieldset>
		<EditHubAdvanced {actor} {hub} />
	</form>
</div>

<style>
	/* TODO maybe extract .dialog-content */
	.hub-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl);
	}
</style>
