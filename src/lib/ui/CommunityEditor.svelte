<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {format} from 'date-fns';

	import type {Community} from '$lib/vocab/community/community';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import CommunitySettingsHue from '$lib/ui/CommunitySettingsHue.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import EditCommunityAdvanced from '$lib/ui/EditCommunityAdvanced.svelte';
	import DeleteCommunityForm from '$lib/ui/DeleteCommunityForm.svelte';
	import LeaveCommunityForm from '$lib/ui/LeaveCommunityForm.svelte';
	import {getApp} from '$lib/ui/app';

	const {dispatch} = getApp();

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;
</script>

<div class="community-editor column">
	<form {...$$restProps} class="markup">
		<header>
			<h2>Edit Community</h2>
			<p style:font-size="var(--font_size_xl)">
				<CommunityAvatar {community} />
			</p>
			<section>
				<p>created {format($community.created, 'PPPPp')}</p>
				{#if $community.updated !== null}
					<p>updated {format($community.updated, 'PPPPp')}</p>
				{/if}
			</section>
		</header>
		<fieldset>
			<legend>settings</legend>
			<CommunitySettingsHue {persona} {community} />
		</fieldset>
		<fieldset>
			<legend><span class="error-text">danger! zone</span></legend>
			<button
				title="leave community"
				on:click={() =>
					dispatch.OpenDialog({
						Component: LeaveCommunityForm,
						props: {
							persona,
							community,
							done: () => {
								dispatch.CloseDialog();
								done?.();
							},
						},
					})}>leave community</button
			>
			<button
				title="delete community"
				on:click={() =>
					dispatch.OpenDialog({
						Component: DeleteCommunityForm,
						props: {
							persona,
							community,
							done: () => {
								dispatch.CloseDialog();
								done?.();
							},
						},
					})}>delete community</button
			>
		</fieldset>
		<EditCommunityAdvanced actor={persona} {community} />
	</form>
</div>

<style>
	/* TODO maybe extract .dialog-content */
	.community-editor {
		display: flex;
		flex-direction: column;
		padding: var(--spacing_xl);
	}
</style>
