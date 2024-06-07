<script lang="ts">
	import {getApp} from '$lib/ui/app.js';
	import {getSpaceContext} from '$lib/vocab/view/view.js';
	import {parseJson, serializeJson} from '$lib/util/json.js';
	import PropertyEditor from '$lib/ui/PropertyEditor.svelte';	
	import {ADMIN_HUB_ID} from '$lib/util/constants.js';

	const {actor, hub} = getSpaceContext();
	const {actions} = getApp();	

    $: instanceSettings = $hub.settings.instance;
	$: siteSettings = $hub.settings.instance ? $hub.settings.instance.site : undefined;

	let pending = false;

	const updateHubSetting = async (updated: any, field: string) =>
		actions.UpdateHub({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			settings: {...$hub.settings, instance: {...instanceSettings, site: {...siteSettings, [field]: updated}}}
        });

	const deploy = async () => {
		if (pending) return;
		pending = true;		
		const result = await actions.RunTask({
			actor: $actor.actor_id,
			hub_id: $hub.hub_id,
			task: 'siteDeploy',
		});
		console.log(result);
		pending = false;
	};
</script>

<div class="prose padded_1">
	<h1>home site admin</h1>
	{#if $hub.hub_id === ADMIN_HUB_ID}
		<fieldset>						
			<PropertyEditor
				value={siteSettings?.sourceRepo}
				field="sourceRepo"
				update={updateHubSetting}
				deletable={true}
				parse={parseJson}
				serialize={serializeJson}
			/>
		</fieldset>
		<button type="button" on:click={deploy} disabled={pending}>deploy</button>
	{/if}
</div>

<style>
	.prose {
		min-height: 100%;
	}
</style>