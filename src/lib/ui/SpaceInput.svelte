<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PendingButton from '@feltcoop/felt/PendingButton.svelte';
	import Message from '@feltcoop/felt/Message.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import {toCreatableViewTemplates} from '$lib/vocab/view/view';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {parseSpaceIcon} from '$lib/vocab/space/spaceHelpers';
	import {toSearchParams, toCommunityUrl} from '$lib/ui/url';
	import {ADMIN_COMMUNITY_ID} from '$lib/app/constants';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';

	const {
		dispatch,
		ui: {sessionPersonaIndexById, adminPersonas},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let community: Readable<Community>;
	export let done: (() => void) | undefined = undefined;

	$: admin = $community.community_id === ADMIN_COMMUNITY_ID && $adminPersonas.has(persona);
	$: creatableViewTemplates = toCreatableViewTemplates(admin);

	let name = '';
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
		const result = await dispatch.CreateSpace({
			actor: $persona.persona_id,
			community_id: $community.community_id,
			name,
			url: `/${name}`,
			icon: iconResult.value,
			view: selectedViewTemplate.view,
		});
		pending = false;
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toCommunityUrl(
					$community.name,
					result.value.space.url,
					toSearchParams($page.url.searchParams, {
						persona: $sessionPersonaIndexById.get($persona.persona_id) + '',
					}),
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

<div class="markup padded-xl">
	<form>
		<legend>Create a new Space</legend>
		<ContextInfo {persona} {community} />
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
							value={viewTemplate}
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
				<Message status="error">{errorMessage}</Message>
			{/if}
		</fieldset>
	</form>
</div>

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
