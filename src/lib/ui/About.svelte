<script lang="ts">
	import {PUBLIC_ADMIN_EMAIL_ADDRESS, PUBLIC_ADMIN_ICON, PUBLIC_GIT_HASH} from '$env/static/public';
</script>

<div class="markup padded-xl">
	<h1>About this Instance</h1>
	<p>Need help? Have questions, comments, concerns?</p>
	<p>
		Email the admin at <a href="mailto:{PUBLIC_ADMIN_EMAIL_ADDRESS}">{PUBLIC_ADMIN_EMAIL_ADDRESS}</a
		>
	</p>
	<p class="title">
		{PUBLIC_ADMIN_ICON}
		<a href="https://github.com/feltjs/felt-server" target="_blank" rel="noreferrer">felt-server</a>
		version
		<a
			href="https://github.com/feltjs/felt-server/commit/{PUBLIC_GIT_HASH}"
			target="_blank"
			rel="noreferrer"
		>
			{PUBLIC_GIT_HASH}
		</a>
	</p>
</div>
