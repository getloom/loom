<script lang="ts">
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import type {Readable} from '@getloom/svelte-gettable-stores';
	import Hue_Input from '@ryanatkn/fuz/Hue_Input.svelte';
	import {goto} from '$app/navigation';
	import {page} from '$app/stores';

	import {autofocus} from '$lib/ui/actions.js';
	import {getApp} from '$lib/ui/app.js';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import {randomHue} from '$lib/util/color.js';
	import {toHubUrl, toAppSearchParams} from '$lib/util/url.js';
	import {checkActorName, scrubActorName} from '$lib/vocab/actor/actorHelpers.js';
	import ContextInfo from '$lib/ui/ContextInfo.svelte';

	const {
		actions,
		ui: {sessionActorIndexById},
	} = getApp();

	export let actor: Readable<AccountActor>;
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	let name = '';

	let chosenHue: number | undefined;
	$: hue = chosenHue ?? randomHue(name);

	let pending = false;
	let nameEl: HTMLInputElement;
	let errorMessage: string | null = null;

	// TODO formalize this (probably through the schema)
	$: name = name.replace(/[^a-zA-Z0-9_]+/gu, '');

	$: name, (errorMessage = null);

	const create = async (): Promise<void> => {
		name = scrubActorName(name);
		if (!name) {
			errorMessage = 'please enter a name for your new hub';
			nameEl.focus();
			return;
		}
		const nameErrorMessage = checkActorName(name);
		if (nameErrorMessage) {
			errorMessage = nameErrorMessage;
			nameEl.focus();
			return;
		}
		if (pending) return;
		pending = true;
		errorMessage = null;
		const result = await actions.CreateHub({
			actor: $actor.actor_id,
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

<form class="prose padded_1" {...attrs}>
	<h2>Create a new Hub</h2>
	<ContextInfo {actor} />
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
		<Pending_Button on:click={create} {pending}>create hub</Pending_Button>
		{#if errorMessage}
			<Alert status="error">{errorMessage}</Alert>
		{/if}
	</fieldset>
	{#if name}
		<section>
			<Avatar {name} type="Hub" {hue} />
		</section>
		<details>
			<summary>Customize</summary>
			<div>
				<Hue_Input {hue} on:input={(e) => (chosenHue = e.detail)} />
			</div>
		</details>
	{/if}
</form>

<style>
	details {
		font-size: var(--size_lg);
	}
</style>
