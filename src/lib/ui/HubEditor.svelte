<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Hub} from '$lib/vocab/hub/hub';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import HubSettingsHue from '$lib/ui/HubSettingsHue.svelte';
	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import EditHubAdvanced from '$lib/ui/EditHubAdvanced.svelte';
	import DeleteHubForm from '$lib/ui/DeleteHubForm.svelte';
	import LeaveHubForm from '$lib/ui/LeaveHubForm.svelte';
	import {getApp} from '$lib/ui/app';

	const {actions} = getApp();

	export let persona: Readable<AccountPersona>;
	export let hub: Readable<Hub>;
	export let done: (() => void) | undefined = undefined;
</script>

<div class="hub-editor column">
	<form class="markup" {...$$restProps}>
		<header>
			<h2>Edit Hub</h2>
			<p style:font-size="var(--font_size_xl)">
				<HubAvatar {hub} />
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
			<HubSettingsHue {persona} {hub} />
		</fieldset>
		<fieldset>
			<legend class="error-text">danger! zone</legend>
			<button
				title="leave hub"
				on:click={() =>
					actions.OpenDialog({
						Component: LeaveHubForm,
						props: {
							persona,
							hub,
							done: () => {
								actions.CloseDialog();
								done?.();
							},
						},
					})}>leave hub</button
			>
			<button
				title="delete hub"
				on:click={() =>
					actions.OpenDialog({
						Component: DeleteHubForm,
						props: {
							persona,
							hub,
							done: () => {
								actions.CloseDialog();
								done?.();
							},
						},
					})}>delete hub</button
			>
		</fieldset>
		<EditHubAdvanced actor={persona} {hub} />
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
