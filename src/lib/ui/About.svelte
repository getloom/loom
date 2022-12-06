<div class="markup padded-xl">
	<h1>About this Instance</h1>
	<p>Need help? Have questions, comments, concerns?</p>
	<p>
		Email the admin at <a href="mailto:{import.meta.env.PUBLIC_ADMIN_EMAIL_ADDRESS}"
			>{import.meta.env.PUBLIC_ADMIN_EMAIL_ADDRESS}</a
		>
	</p>
	<p class="title">
		{import.meta.env.PUBLIC_ADMIN_ICON}
		<a href="https://github.com/feltcoop/felt-server" target="_blank" rel="noreferrer"
			>felt-server</a
		>
		version
		<a
			href="https://github.com/feltcoop/felt-server/commit/{import.meta.env.PUBLIC_GIT_HASH}"
			target="_blank"
			rel="noreferrer"
		>
			{import.meta.env.PUBLIC_GIT_HASH}
		</a>
	</p>
</div>
