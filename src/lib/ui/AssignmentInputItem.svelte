<script lang="ts">
	import type {Readable} from '@feltcoop/svelte-gettable-stores';

	import type {Community} from '$lib/vocab/community/community.js';
	import {getApp} from '$lib/ui/app';
	import type {AccountPersona, ClientPersona} from '$lib/vocab/persona/persona';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Role} from '$lib/vocab/role/role';

	const {dispatch} = getApp();

	export let persona: Readable<AccountPersona>;
	export let assignmentPersona: Readable<ClientPersona>;
	export let community: Readable<Community>;
	export let role: Readable<Role>;

	const createAssignment = async () => {
		await dispatch.CreateAssignment({
			actor: $persona.persona_id,
			community_id: $community.community_id,
			persona_id: $assignmentPersona.persona_id,
			role_id: $role.role_id,
		});
	};
</script>

<p>
	<button type="button" class="button-join" on:click={() => createAssignment()}>
		<PersonaAvatar persona={assignmentPersona} />
	</button>
</p>
