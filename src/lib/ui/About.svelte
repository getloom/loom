<script lang="ts">
	import {VITE_GIT_HASH, VITE_HELP_EMAIL_ADDRESS} from '$lib/config';
</script>

<div class="markup padded-xl">
	<h1>About this Instance</h1>
	<p class="title">
		💚
		<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
			>felt-server</a
		>
		version
		<a
			href="https://github.com/feltcoop/felt-server/commit/{VITE_GIT_HASH}"
			target="_blank"
			rel="noreferrer"
		>
			{VITE_GIT_HASH}
		</a>
	</p>
	<p>
		Questions, comments, concerns? Email us at <a href="mailto:{VITE_HELP_EMAIL_ADDRESS}"
			>{VITE_HELP_EMAIL_ADDRESS}</a
		>
	</p>
</div>
