<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {AccountPersona} from '$lib/vocab/actor/persona';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import PropertyPicker from '$lib/ui/PropertyPicker.svelte';
	import type {EventInfo} from '$lib/vocab/event/event';

	// TODO  what should be the interface here?
	// bind:params? on:create or on:input ?

	export let params: null | Record<string, any> = null; // TODO type?
	export let persona: Readable<AccountPersona>;
	export let eventInfo: EventInfo;

	$: paramsProperties = eventInfo.params?.properties;
	$: paramsPropertiesKeys = paramsProperties && Object.keys(paramsProperties);

	$: params = computeParams(eventInfo);

	const updateParam = (key: string, value: any): void => {
		params = {...params, [key]: value};
	};

	const computeParams = (eventInfo: EventInfo) => {
		if (!eventInfo.params || eventInfo.params.type === 'null') {
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
			return $persona.persona_id;
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
				<!-- TODO select any of the account's personas from here easily -->
				<div class="title">actor</div>
				<PersonaAvatar {persona} />
			{:else}
				<PropertyPicker
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
		font-size: var(--font_size_lg);
		font-weight: 700;
	}
</style>
