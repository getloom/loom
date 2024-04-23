<script lang="ts">
	import Pending_Button from '@ryanatkn/fuz/Pending_Button.svelte';
	import Alert from '@ryanatkn/fuz/Alert.svelte';
	import {writable, type Readable, type Writable} from '@feltcoop/svelte-gettable-stores';

	import {getApp} from '$lib/ui/app.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';
	import CreateActionParamsFields from '$lib/ui/CreateActionParamsFields.svelte';
	import {actionDatas} from '$lib/vocab/action/actionData.js';
	import type {ActionData} from '$lib/vocab/action/action.js';
	import ActionHistory, {type ActionHistoryItem} from '$lib/ui/ActionHistory.svelte';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let selectedActionData: ActionData | undefined = undefined; // TODO not reactive, see below
	export let done: (() => void) | undefined = undefined;
	export let attrs: any = undefined;

	let pending = false;
	let errorMessage: string | null = null;

	// TODO this is a hack due to a quirk in the dialog system -- `Dialogs` is rerendering when the dialogs list changes,
	// causing stale props to be send to any other open dialogs when one is opened --
	// it's possible a tweak in `Dialogs` can fix the updating behavior,
	// but the deeper problem is that opening dialogs programmatically like this breaks normal Svelte behaviors
	let selectedActionDataHack = selectedActionData;

	let formParams: any = null;

	const actionHistory: Writable<ActionHistoryItem[]> = writable([]);

	const performAction = async (actionData: ActionData, params: any): Promise<void> => {
		if (pending) return;
		// TODO confirmation dialog!
		formParams = params; // depending on where the action is actionHistory, the form params may not match, but we want to load the form with whatever was just sent for UX purposes
		pending = true;
		errorMessage = null;
		const d: ActionHistoryItem = {
			name: actionData.name,
			params,
			actionData,
			created: performance.now(),
			responded: 0,
			elapsed: 0,
			error: null,
		};
		const result = await (actions as any)[actionData.name](params);
		pending = false;
		if (result && 'ok' in result) {
			if (result.ok) {
				errorMessage = null;
				done?.();
			} else {
				errorMessage = d.error = result.message;
			}
		}
		d.responded = performance.now();
		d.elapsed = d.responded - d.created;
		$actionHistory = [d].concat($actionHistory); // TODO granularly update `responded`/`elapsed` updates so we see it immediately, maybe track `status` and `error` even
	};

	$: selectedActionDataHack, (formParams = null); // TODO should this be needed?

	$: paramsProperties = selectedActionDataHack?.params?.properties;
	$: paramsPropertiesKeys = paramsProperties && Object.keys(paramsProperties);
</script>

<form {...attrs} class="padded_1">
	<div class="prose">
		<h2>Create an Action</h2>
	</div>
	<div class="layout">
		<fieldset class="actions prose">
			<legend>available actions</legend>
			{#each actionDatas as actionData (actionData)}
				<label class="row">
					<input type="radio" bind:group={selectedActionDataHack} value={actionData} />
					<code class={actionData.type}>{actionData.name}</code>
				</label>
			{/each}
		</fieldset>
		<div class="content">
			{#if selectedActionDataHack}
				<div class="prose">
					<h3>
						<code class={selectedActionDataHack.type}>{selectedActionDataHack.name}</code><small
							>{selectedActionDataHack.type}</small
						>
					</h3>
				</div>
				<div class="spaced">
					{#if paramsPropertiesKeys?.length}
						<fieldset>
							<legend>params</legend>
							<code class="params"><pre>{JSON.stringify(formParams, null, 2)}</pre></code>
							<CreateActionParamsFields
								{actor}
								actionData={selectedActionDataHack}
								bind:params={formParams}
							/>
						</fieldset>
					{/if}
				</div>
				<div class="spaced">
					<!-- TODO `style="width: 100%"` is a hack -->
					<Pending_Button
						on:click={() =>
							selectedActionDataHack && performAction(selectedActionDataHack, formParams)}
						attrs={{style: 'width: 100%'}}
						{pending}
						disabled={pending}
					>
						perform action&nbsp;<code class={selectedActionDataHack.type}
							>{selectedActionDataHack.name}</code
						>
					</Pending_Button>
					<!-- TODO implement saving actions like any other data to a path/entity -->
					<!-- <Pending_Button on:click={save} pending={savePending} disabled={pending}
					>save action</Pending_Button
				> -->
					{#if errorMessage}
						<div class="error_message">
							<Alert status="error">{errorMessage}</Alert>
						</div>
					{/if}
				</div>
			{/if}
			<ActionHistory
				{actionHistory}
				on:perform={(e) => performAction(e.detail.actionData, e.detail.params)}
				on:remove={(e) => ($actionHistory = $actionHistory.filter((d) => d !== e.detail))}
				on:clear={() => ($actionHistory = [])}
			/>
		</div>
	</div>
</form>

<style>
	form {
		width: var(--width_md);
	}
	.layout {
		display: flex;
		align-items: flex-start;
	}
	h3 {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}
	.content {
		position: sticky;
		top: 0;
		padding-left: var(--spacing_3);
		flex: 1;
		overflow: hidden;
	}
	.actions {
		/* TODO maybe take `width: 100%` off .prose? could then delete this */
		width: auto;
	}
	.actions label {
		margin-bottom: 0;
	}
	/* TODO copypasted from `PropertyEditor`, maybe extract a class? `.big-text`? */
	.field {
		font-size: var(--size_lg);
		font-weight: 700;
	}
	.ServiceAction {
		color: var(--color_1);
	}
	.ClientAction {
		color: var(--color_2);
	}
	.params {
		margin-bottom: var(--spacing_lg);
	}
	.error_message {
		margin-top: var(--spacing_lg);
	}
</style>
