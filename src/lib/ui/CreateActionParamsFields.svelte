<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {AccountActor} from '$lib/vocab/actor/actor';
	import ActorAvatar from '$lib/ui/ActorAvatar.svelte';
	import PropertyPicker from '$lib/ui/PropertyPicker.svelte';
	import type {ActionData} from '$lib/vocab/action/action';

	// TODO  what should be the interface here?
	// bind:params? on:create or on:input ?

	export let params: null | Record<string, any> = null; // TODO type?
	export let actor: Readable<AccountActor>;
	export let actionData: ActionData;

	$: paramsProperties = actionData.params?.properties;
	$: paramsPropertiesKeys = paramsProperties && Object.keys(paramsProperties);

	$: params = computeParams(actionData);

	const updateParam = (key: string, value: any): void => {
		params = {...params, [key]: value};
	};

	const computeParams = (actionData: ActionData) => {
		if (!actionData.params || actionData.params.type === 'null') {
			return null;
		}
		// TODO  maybe iterate through all children that register as a field via context?
		const p: Record<string, any> = {};
		if (paramsPropertiesKeys) {
			for (const key of paramsPropertiesKeys) {
				// TODO  how to compuete these? maybe take `fields` as an arg with `{value}`
				p[key] = getValue(key);
			}
		}
		return p;
	};
	const getValue = (key: string): any => {
		if (key === 'actor') {
			return $actor.actor_id;
		}
		return undefined;
	};
</script>

<!-- TODO need some way to pass back the params -- maybe emitting an event, calling a callback, exporting a store -->
<!-- TODO extract JsonSchemaForm component? -->
{#if paramsPropertiesKeys}
	{#each paramsPropertiesKeys as key (key)}
		<div class="field" style:--icon_size="var(--icon_size_sm)">
			{#if key === 'actor'}
				<!-- TODO select any of the account's actors from here easily -->
				<div class="title">actor</div>
				<ActorAvatar {actor} />
			{:else}
				<PropertyPicker
					{actor}
					value={params?.[key]}
					field={key}
					update={(value) => updateParam(key, value)}
				/>
			{/if}
		</div>
	{/each}
{/if}

<style>
	/* TODO copypasted from `PropertyPicker`, maybe extract a class? `.big-text`? */
	.field {
		padding: var(--spacing_xs) 0;
	}
	.title {
		font-size: var(--size_lg);
		font-weight: 700;
	}
</style>
