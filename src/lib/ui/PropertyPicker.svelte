<script lang="ts">
	import Message from '@feltjs/felt-ui/Message.svelte';
	import {identity} from '@feltjs/util/function.js';
	import type {Result} from '@feltjs/util';
	import PendingButton from '@feltjs/felt-ui/PendingButton.svelte';
	import {afterUpdate} from 'svelte';

	import {autofocus} from '$lib/ui/actions';
	import {getApp} from '$lib/ui/app';
	import HubPicker from '$lib/ui/HubPicker.svelte';
	import HubAvatar from '$lib/ui/HubAvatar.svelte';
	import type {HubId} from '$lib/vocab/hub/hub';

	// TODO have an API to click-to-pick for even string values (with a button for more) for things like strings (like actor names, space names, etc, from templates or random)
	// TODO pick hub and the others
	// TODO optional properties

	const {
		actions,
		ui: {hubById},
	} = getApp();

	type TValue = $$Generic;

	export let value: TValue;
	export let field: string;
	export let update:
		| ((updated: TValue, field: string) => void | Promise<Result<unknown, {message: string}>>)
		| null = null;
	export let parse: (serialized: string) => Result<{value: TValue}, {message: string}> = (
		serialized,
	) => ({ok: true, value: serialized as any}); // TODO consider extracting an `ok` helper
	export let serialize: (value: TValue, print?: boolean) => string = identity as any; // TODO type

	let fieldValue: any; // initialized by `reset`
	let serialized: string | undefined;
	$: {
		const parsed = parse(fieldValue);
		if (parsed.ok) {
			serialized = serialize(parsed.value, true);
			errorMessage = null;
		} else {
			serialized = '';
			errorMessage = parsed.message;
		}
	}
	let pending = false;
	let fieldValueEl: HTMLTextAreaElement;
	let shouldFocusEl = false;
	let errorMessage: string | null = null;

	const reset = () => {
		fieldValue = serialize(value);
	};
	reset();

	afterUpdate(() => {
		if (shouldFocusEl) {
			shouldFocusEl = false;
			fieldValueEl.focus(); // in case it somehow stopped editing in between
		}
	});

	const save = (): void | Promise<void> => {
		if (!update) return;
		errorMessage = null;
		const parsed = parse(fieldValue);
		if (!parsed.ok) {
			errorMessage = parsed.message;
			return;
		}
		const updating = update(parsed.value, field);
		if (updating && 'then' in updating) {
			pending = true;
			return updating.then((result) => {
				pending = false;
				if (!result.ok) {
					errorMessage = result.message;
				}
			});
		}
	};

	const onKeydown = async (e: KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			await save();
		}
	};

	$: currentSerialized = serialize(value, true);
	$: changed = serialized !== currentSerialized;

	// picker dialog
	// optional

	const doneWithHubPicker = async (hub_id: HubId) => {
		fieldValue = hub_id;
		await save();
		actions.CloseDialog();
	};

	// TODO everything referencing `hub_id` is a hack, this component should be generic

	$: hub = field === 'hub_id' ? hubById.get(value as any) : null;
</script>

<div class="field">{field}</div>
{#if field !== 'hub_id' || hub}
	<div class="preview markup panel" style:--icon_size="var(--icon_size_sm)">
		{#if field === 'hub_id' && hub}
			<HubAvatar {hub} />
		{:else if value === undefined}
			<em>undefined</em>
			<!-- TODO add a button to add/instantiate the field with some value -->
		{:else}
			<pre>{currentSerialized}</pre>
		{/if}
	</div>
{/if}
{#if field === 'hub_id'}
	<button
		type="button"
		on:click={() =>
			actions.OpenDialog({
				Component: HubPicker,
				props: {done: doneWithHubPicker},
			})}
	>
		pick hub
	</button>
{:else}
	<textarea
		placeholder="> value"
		bind:this={fieldValueEl}
		bind:value={fieldValue}
		use:autofocus
		disabled={pending}
		on:keydown={onKeydown}
	/>
	{#if changed}
		<div class="buttons">
			<button type="button" on:click={reset}> reset </button>
			<PendingButton on:click={save} {pending} disabled={pending || !!errorMessage}>
				save
			</PendingButton>
		</div>
	{/if}
	{#if errorMessage}
		<Message status="error">{errorMessage}</Message>
	{:else if changed}
		<div class="preview markup panel">
			<p>
				{#if fieldValue}<pre>{serialized}</pre>{:else}<em>(empty)</em>{/if}
			</p>
		</div>
	{/if}
{/if}

<style>
	.field {
		font-size: var(--font_size_lg);
		font-weight: 700;
	}
	.preview {
		overflow: auto;
		padding: var(--spacing_sm);
	}
	textarea {
		/* TODO customize this for different values */
		height: 120px;
	}
	pre {
		white-space: pre-wrap;
	}
</style>
