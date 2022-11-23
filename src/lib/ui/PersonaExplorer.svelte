<script lang="ts">
	import {getApp} from '$lib/ui/app';
	import Avatar from '$lib/ui/Avatar.svelte';
	import type {ClientPersona} from '$lib/vocab/persona/persona';

	const {
		ui: {personas: allPersonas},
	} = getApp();

	let personas: ClientPersona[] | undefined;
	const loadAllPersonas = async () => {
		// TODO needs to be fixed when personas on session are scoped
		// const result = await dispatch.ReadPersonas({actor: $persona.persona_id});
		// if (!result.ok) throw Error(); // TODO querying helpers
		personas = Array.from($allPersonas.value).map((v) => v.get());
	};
</script>

<h2>personas</h2>
{#if personas}
	<ul>
		{#each personas as persona (persona)}
			<Avatar name={persona.name} />
		{/each}
	</ul>
{:else}
	<!-- TODO pending status with query state -->
	<button on:click={loadAllPersonas}>load all personas</button>
{/if}
