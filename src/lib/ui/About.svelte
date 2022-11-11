<script lang="ts">
	import {PUBLIC_GIT_HASH, PUBLIC_HELP_EMAIL_ADDRESS} from '$env/static/public';
</script>

<div class="markup padded-xl">
	<h1>About this Instance</h1>
	<p>Need help? Have questions, comments, concerns?</p>
	<p>Email us at <a href="mailto:{PUBLIC_HELP_EMAIL_ADDRESS}">{PUBLIC_HELP_EMAIL_ADDRESS}</a></p>
	<p class="title">
		💚
		<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
			>felt-server</a
		>
		version
		<a
			href="https://github.com/feltcoop/felt-server/commit/{PUBLIC_GIT_HASH}"
			target="_blank"
			rel="noreferrer"
		>
			{PUBLIC_GIT_HASH}
		</a>
	</p>
</div>
