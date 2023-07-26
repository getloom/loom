<script lang="ts">
	import {base} from '$app/paths';

	import Mermaid from '$lib/ui/Mermaid.svelte';
	import CodeExample from '$lib/ui/CodeExample.svelte';
</script>

<div class="prose">
	<h2>Admin</h2>
	<p>
		When a Felt server instance is first created, it has no communities, no accounts, and no actors.
		When the first actor is created, which happens when the first account signs up, the server
		creates a special hub, the "admin" hub, located at <code>$HOSTNAME/admin</code>, and adds that
		first actor to its assignments. This hub inherits all of the same functionality as normal
		community hubs, but all of its members are granted superpowers: they are instance admins.
	</p>
	<p>
		The admin system is orthogonal to the roles systems. Admins are not implemented as roles; roles
		are hub-specific, and admins wield instance-wide powers. If an actor has an assignment to the
		admin hub, they're an admin.
	</p>
	<p>
		Admins are superusers, which means they have full control over the instance. (it's possible
		we'll develop features to restrict admin powers, but that's speculative) Admins access their
		powers through the same web frontend as the rest of the app.
	</p>
	<p>
		For efficiency and ergonomics, the admin hub and admin actor are both hardcoded to have id <code
			>1</code
		>
		and name `"admin"`:
	</p>
	<!-- TODO Highlighted component? prism? with ts lang -->
	<CodeExample
		code={`const adminHub = {'{'}
	hub_id: 1,
	type: 'community',
	name: 'admin',
};
const adminActor = {'{'}
	actor_id: 1,
	type: 'community',
	name: 'admin',
	hub_id: 1,
};`}
	/>

	<blockquote>
		learn more about <a href="{base}/hub-types">hub types</a> and
		<a href="{base}/actor-types">actor types</a>
	</blockquote>

	<h3>Control and ownership diagram</h3>

	<Mermaid
		content={`flowchart
	subgraph Infrastructure
		O[Operators] -- delegate control --> A
		subgraph Instance
			U[Users] -- access --> C
			S[Stewards] -- steward --> C[Hubs]
			A[Admins] -- administer --> C
			A -- delegate control --> S
		end
	end
	Infrastructure -- host --> Instance
	O -- manages infrastructure --> O
	A -- manages instance --> A`}
	/>
</div>
