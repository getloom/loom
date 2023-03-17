<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Hub} from '$lib/vocab/hub/hub.js';
	import {getApp} from '$lib/ui/app';
	import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Role} from '$lib/vocab/role/role';

	const {actions} = getApp();

	export let persona: Readable<AccountPersona>;
	export let assignmentPersona: Readable<ClientPersona>;
	export let hub: Readable<Hub>;
	export let role: Readable<Role>;

	const createAssignment = async () => {
		await actions.CreateAssignment({
			actor: $persona.persona_id,
			hub_id: $hub.hub_id,
			persona_id: $assignmentPersona.persona_id,
			role_id: $role.role_id,
		});
	};
</script>

<li>
	<button type="button" on:click={() => createAssignment()}>
		<PersonaAvatar persona={assignmentPersona} />
	</button>
</li>

<style>
	button {
		width: 100%;
		justify-content: flex-start;
	}
</style>
