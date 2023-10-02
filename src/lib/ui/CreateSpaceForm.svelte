<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@fuz.dev/fuz_library/PendingButton.svelte';
	import Alert from '@fuz.dev/fuz_library/Alert.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import type {Hub} from '$lib/vocab/hub/hub';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {toCreatableViewTemplates} from '$lib/vocab/view/view';
	import type {AccountActor} from '$lib/vocab/actor/actor';
	import {parseSpaceIcon, renderDirectoryPath} from '$lib/vocab/space/spaceHelpers';
	import {toHubUrl, toAppSearchParams} from '$lib/util/url';
	import {ADMIN_HUB_ID} from '$lib/util/constants';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';

	const {
		actions,
		ui: {sessionActorIndexById, adminActors},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;
	export let initialName = ''; // TODO consider exporting `name` instead and delete this
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	$: admin = $hub.hub_id === ADMIN_HUB_ID && $adminActors.has(actor);
	$: creatableViewTemplates = toCreatableViewTemplates(admin);

	let name = initialName;
	$: selectedViewTemplate = creatableViewTemplates[0];
	$: ({icon} = selectedViewTemplate);

	let pending = false;
	let nameEl: HTMLInputElement;
	let iconEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO formalize this (probably through the schema)
	$: name = name.replace(/[^a-zA-Z0-9-]+/gu, '');

	const create = async () => {
		if (!name) {
			errorMessage = 'please enter a name for your new space';
			nameEl.focus();
			return;
		}
		const iconResult = parseSpaceIcon(icon);
		if (!iconResult.ok) {
			errorMessage = iconResult.message;
			iconEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		const result = await actions.CreateSpace({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			name,
			icon: iconResult.value,
			view: selectedViewTemplate.view,
		});
		pending = false;
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toHubUrl(
					$hub.name,
					renderDirectoryPath(result.value.directory.path),
					toAppSearchParams($sessionActorIndexById.get($actor.actor_id), $page.url.searchParams),
				),
			);
			done?.();
		} else {
			errorMessage = result.message;
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			await create();
		}
	};
</script>

<form class="prose padded_xl" {...attrs}>
	<h2>Create a new Space</h2>
	<ContextInfo {actor} {hub} />
	<fieldset>
		<label>
			<div class="title">name</div>
			<input
				name="name"
				placeholder=">"
				bind:value={name}
				bind:this={nameEl}
				use:autofocus
				on:keydown={onKeydown}
			/>
		</label>
		<label>
			<div class="title">type</div>
			<!-- TODO selectable menu -->
			<fieldset class="buttons type-selector">
				{#each creatableViewTemplates as viewTemplate (viewTemplate.name)}
					<button
						type="button"
						class:selected={selectedViewTemplate === viewTemplate}
						on:click={() => {
							selectedViewTemplate = viewTemplate;
						}}>{viewTemplate.icon} {viewTemplate.name}</button
					>
				{/each}
			</fieldset>
		</label>
		<label>
			<div class="title">icon</div>
			<input placeholder=">" bind:this={iconEl} bind:value={icon} on:keydown={onKeydown} />
		</label>
		<PendingButton on:click={create} {pending}>create space</PendingButton>
		{#if errorMessage}
			<Alert status="error">{errorMessage}</Alert>
		{/if}
	</fieldset>
</form>

<style>
	/* TODO refactor this into a more abstract component */
	.type-selector {
		display: flex;
		margin-left: var(--spacing_xs);
	}
	.type-selector button {
		white-space: nowrap;
		margin: 0;
		justify-content: flex-start;
	}
</style>
