<script lang="ts">
	import {base} from '$app/paths';
</script>

<div class="prose">
	<h2>Hub types</h2>

	<blockquote>the <code>type</code> property of hubs</blockquote>

	<h3><code>'community'</code> hubs</h3>
	<p>
		Community hubs are the default kind; you can create them, invite other actors, and all the rest.
	</p>
	<p>
		Admin hubs are currently implemented as <code>'community'</code> hubs, but they may get their own
		type in the future.
	</p>
	<h3><code>'personal'</code> hubs</h3>

	<p>
		Felt has a special kind of hub called a **personal hub**. It's a private world scoped to one
		actor, similar to <code>'community'</code> hubs with some important differences:
	</p>

	<ul>
		<li>
			a personal hub is created automatically for every <a
				href="{base}/docs/guide/admin/actor-types"
				><code>'account'</code>
				actor</a
			>, and this is the only way they're created
		</li>
		<li>a personal hub has the same <code>name</code> as its actor</li>
		<li>
			a personal hub's assignment includes its owning actor, and **no other actors may be invited
			and given assignments**, including other actors under the same account
		</li>
	</ul>
</div>
