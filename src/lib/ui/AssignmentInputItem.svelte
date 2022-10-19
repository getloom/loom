<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import {getApp} from '$lib/ui/app';
	import type {Persona} from '$lib/vocab/persona/persona';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';

	const {dispatch} = getApp();

	export let persona: Readable<Persona>;
	export let assignmentPersona: Readable<Persona>;
	export let community: Readable<Community>;
</script>

<p>
	<button
		type="button"
		class="button-join"
		on:click={() =>
			dispatch.CreateAssignment({
				actor: $persona.persona_id,
				community_id: $community.community_id,
				persona_id: $assignmentPersona.persona_id,
			})}
	>
		<PersonaAvatar persona={assignmentPersona} />
	</button>
</p>
