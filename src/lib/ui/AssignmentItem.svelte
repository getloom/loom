<script lang="ts">
	import {getApp} from '$lib/ui/app';

	import type {Readable} from '@feltcoop/svelte-gettable-stores';
	import PersonaAvatar from '$lib/ui/PersonaAvatar.svelte';
	import type {Assignment} from '$lib/vocab/assignment/assignment';

	const {
		ui: {personaById},
	} = getApp();

	export let assignment: Readable<Assignment>;
	$: persona = personaById.get($assignment.persona_id)!;
</script>

<div class="assignment-item">
	<PersonaAvatar {persona} showIcon={false} />
</div>
