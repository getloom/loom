<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {throttle} from 'throttle-debounce';
	import HueInput from '@feltjs/felt-ui/HueInput.svelte';

	import {getApp} from '$lib/ui/app';
	import type {Hub} from '$lib/vocab/hub/hub';
	import type {AccountActor} from '$lib/vocab/actor/actor';

	const {actions} = getApp();

	export let persona: Readable<AccountActor>;
	export let hub: Readable<Hub>;

	const UPDATE_INTERVAL = 500; // TODO extract this to config
	const updateHue = throttle(UPDATE_INTERVAL, async (hue: number): Promise<void> => {
		await actions.UpdateHubSettings({
			actor: $persona.persona_id,
			hub_id: $hub.hub_id,
			settings: {...$hub.settings, hue},
		});
	});
</script>

<!-- TODO maybe add a title or tooltip explaining `hub.settings.hue` -->
<HueInput hue={$hub.settings.hue} on:input={(e) => updateHue(e.detail)} />
