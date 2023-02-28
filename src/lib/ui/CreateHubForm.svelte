<script lang="ts">
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import Message from '@feltjs/felt-ui/Message.svelte';
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import HueInput from '@feltjs/felt-ui/HueInput.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {AccountPersona} from '$lib/vocab/persona/persona';
	import {randomHue} from '$lib/ui/color';
	import {toSearchParams, toHubUrl} from '$lib/ui/url';
	import {checkPersonaName, scrubPersonaName} from '$lib/vocab/persona/personaHelpers';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';

	const {
		dispatch,
		ui: {sessionPersonaIndexById},
	} = getApp();

	export let persona: Readable<AccountPersona>;
	export let done: (() => void) | undefined = undefined;

	let name = '';

	let chosenHue: number | undefined;
	$: hue = chosenHue ?? randomHue(name);

	let pending = false;
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO formalize this (probably through the schema)
	$: name = name.replace(/[^a-zA-Z0-9-]+/gu, '');

	$: name, (errorMessage = null);

	const create = async (): Promise<void> => {
		name = scrubPersonaName(name);
		if (!name) {
			errorMessage = 'please enter a name for your new hub';
			nameEl.focus();
			return;
		}
		const nameErrorMessage = checkPersonaName(name);
		if (nameErrorMessage) {
			errorMessage = nameErrorMessage;
			nameEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		const result = await dispatch.CreateHub({
			actor: $persona.persona_id,
			template: {name, settings: {hue}},
		});
		pending = false;
		if (result.ok) {
			errorMessage = null;
			name = '';
			await goto(
				toHubUrl(
					result.value.hub.name,
					null,
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

<form class="markup padded-xl" {...$$restProps}>
	<h2>Create a new Hub</h2>
	<ContextInfo {persona} />
	<fieldset>
		<label>
			<div class="title">name</div>
			<input
				placeholder=">"
				bind:value={name}
				bind:this={nameEl}
				use:autofocus
				on:keydown={onKeydown}
			/>
		</label>
		<PendingButton on:click={create} {pending}>create hub</PendingButton>
		{#if errorMessage}
			<Message status="error">{errorMessage}</Message>
		{/if}
	</fieldset>
	{#if name}
		<section>
			<Avatar {name} type="Hub" {hue} />
		</section>
		<details>
			<summary>Customize</summary>
			<div>
				<HueInput {hue} on:input={(e) => (chosenHue = e.detail)} />
			</div>
		</details>
	{/if}
</form>

<style>
	details {
		font-size: var(--font_size_lg);
	}
</style>
