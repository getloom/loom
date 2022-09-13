<script lang="ts">
	import type {AsyncStatus} from '@feltcoop/felt';
	import Message from '@feltcoop/felt/ui/Message.svelte';
	import PendingButton from '@feltcoop/felt/ui/PendingButton.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import CommunityAvatar from '$lib/ui/CommunityAvatar.svelte';
	import type {Community} from '$lib/vocab/community/community';
	import type {Persona} from '$lib/vocab/persona/persona';

	const {
		dispatch,
		ui: {personaSelection, spaceSelection},
	} = getApp();

	export let done: (() => void) | undefined = undefined;
	export let entityName = 'Entity';
	export let community: Readable<Community>;
	export let persona: Readable<Persona>;
	export let contentForm = false;

	$: selectedPersona = $personaSelection;
	$: persona_id = $selectedPersona!.persona_id;
	$: selectedSpace = $spaceSelection;
	$: source_id = $selectedSpace!.directory_id;

	let name = '';
	let content = '';
	let status: AsyncStatus = 'initial'; // TODO refactor
	let nameEl: HTMLInputElement;
	let contentEl: HTMLTextAreaElement;
	let errorMessage: string | null = null;

	// TODO add initial hue!

	const create = async () => {
		//TODO validate inputs
		name = name.trim();
		content = content.trim();
		if (!name) {
			errorMessage = `please enter a name for your new ${entityName}`;
			nameEl.focus();
			return;
		}
		if (contentForm && !content) {
			errorMessage = `please enter content for your new ${entityName}`;
			contentEl.focus();
			return;
		}
		status = 'pending';
		const result = await dispatch.CreateEntity({
			persona_id,
			//TODO genericize type for this form
			data: {type: 'Collection', name, content},
			source_id,
		});
		status = 'success'; // TODO handle failure (also refactor to be generic)
		if (result.ok) {
			errorMessage = null;
			name = '';
			content = '';
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

<div class="entity-input markup">
	<h1>New {entityName}</h1>
	<section class="row">
		<span class="spaced">in</span>
		<CommunityAvatar {community} />
	</section>
	<section class="row">
		<span class="spaced">as</span>
		<PersonaAvatar {persona} />
	</section>
	<form>
		<input
			placeholder="> name"
			bind:this={nameEl}
			bind:value={name}
			use:autofocus
			disabled={status === 'pending'}
			on:keydown={onKeydown}
		/>
		{#if contentForm}
			<textarea
				placeholder="> content"
				bind:this={contentEl}
				bind:value={content}
				use:autofocus
				disabled={status === 'pending'}
				on:keydown={onKeydown}
			/>
		{/if}
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
		<PendingButton on:click={create} pending={status === 'pending'}
			>Create {entityName}</PendingButton
		>
	</form>
</div>

<style>
	.entity-input {
		--icon_size: var(--icon_size_sm);
		padding: var(--spacing_xl);
	}
</style>
