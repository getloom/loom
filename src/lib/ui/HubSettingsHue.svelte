<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import {throttle} from 'throttle-debounce';
	import Hue_Input from '@ryanatkn/fuz/Hue_Input.svelte';

	import {getApp} from '$lib/ui/app.js';
	import type {Hub} from '$lib/vocab/hub/hub.js';
	import type {AccountActor} from '$lib/vocab/actor/actor.js';

	const {actions} = getApp();

	export let actor: Readable<AccountActor>;
	export let hub: Readable<Hub>;

	const UPDATE_INTERVAL = 500; // TODO extract this to config
	const updateHue = throttle(UPDATE_INTERVAL, async (hue: number): Promise<void> => {
		await actions.UpdateHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			settings: {...$hub.settings, hue},
		});
	});
</script>

<!-- TODO maybe add a title or tooltip explaining `hub.settings.hue` -->
<Hue_Input hue={$hub.settings.hue} on:input={(e) => updateHue(e.detail)} />
