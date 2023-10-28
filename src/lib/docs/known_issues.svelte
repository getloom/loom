<div class="prose">
	<h2>Known issues</h2>

	<p>
		Some of Felt's issues have no scheduled spot on the roadmap and no obvious use for discussion.
		We don't want these to clutter the GitHub issues, but we're open to feedback in our other dev
		community spaces and by email.
	</p>

	<ul>
		<li>
			<a href="#not-using-sveltekits-server-side-data-loading"
				>Not using SvelteKit's server-side data loading</a
			>
		</li>
		<li>
			<a href="#using-http-post-instead-of-get-for-endpoints-with-params"
				>Using HTTP <code>POST</code> instead of <code>GET</code> for endpoints with params</a
			>
		</li>
		<li>
			<a href="#overriding-the-contextmenu-breaks-web-platform-expectations"
				>Overriding the contextmenu breaks web platform expectations</a
			>
		</li>
		<li>
			<a href="#multi-actor-systems-are-more-complex">Multi-actor systems are more complex</a>
		</li>
	</ul>

	<h3 id="not-using-sveltekits-server-side-data-loading">
		Not using SvelteKit's server-side data loading
	</h3>
	<p>
		We currently load entity data, like posts and comments, only after the page loads, instead of
		using <a href="https://kit.svelte.dev/docs/load">SvelteKit's data loading</a> to render pages fully
		on the server.
	</p>
	<p>
		This means that when you refresh a page, you'll see loading animations as the actual content is
		loaded in a second request. This slows down the initial UX on page load, it's less robust and
		user-friendly because JS has to load and run, and it makes the HTML less accessible in contexts
		like scraping.
	</p>
	<p>
		The main reason we don't use SvelteKit's builtin data loading is that our protocol was designed
		to work with both websockets and HTTP, and the added complexity of SSR with full data loading
		was too much for us to consider until things stabilize.
	</p>
	<p>
		We expect to have the best of both worlds when the work is done: our server will be able to
		return the full HTML of resources, and clients can use whichever transport is best for their UX.
	</p>

	<h3 id="using-http-post-instead-of-get-for-endpoints-with-params">
		Using HTTP <code>POST</code> instead of <code>GET</code> for endpoints with params
	</h3>
	<p>
		Service HTTP endpoints that have params use <code>POST</code> not <code>GET</code>, even for
		"read" actions. This breaks standard server-side caching for GET requests and it's less RESTful
		than some would prefer.
	</p>
	<p>
		This is mostly because our action params, which can be any JSON, are nontrivial to serialize and
		parse from the querystring.
	</p>
	<p>
		Our schemas make this problem fixable, but it's not a priority. We feel it's an acceptable
		limitation for now, and GraphQL does the same thing, not that we want to use that excuse. We
		plan to revisit this during beta.
	</p>

	<h3 id="overriding-the-contextmenu-breaks-web-platform-expectations">
		Overriding the contextmenu breaks web platform expectations
	</h3>
	<p>We take two things very seriously, in no particular order:</p>
	<ol>
		<li>giving our users a powerful and customizable UX</li>
		<li>aligning with the web platform and not breaking its standard behaviors</li>
	</ol>
	<p>
		Part of our answer for 1) includes <a href="https://ui.felt.dev/library/Contextmenu"
			>a custom contextmenu</a
		>. Like Google Docs, when you right-click or tap-and-hold (aka longpress) on the page, you'll
		see options and actions specific to our application for your current context.
	</p>
	<p>
		This is a powerful UX pattern, but it violates 2). Our contextmenu breaks the normal browser
		behavior of showing the system contextmenu and device-specific behaviors like selecting text.
	</p>
	<p>
		Balancing these two concerns is going to be an ongoing challenge for us, and our current belief
		is that the contextmenu is too useful and powerful to ignore. We're open to constructive
		feedback, and we'll do what we can to minimize the harmful effects of choices like this.
	</p>
	<p>Mitigations we've implemented:</p>
	<ul>
		<li>
			Our contextmenu does not open on elements that allow clipboard pasting like inputs, textareas,
			and contenteditables.
		</li>
		<li>To bypass our contextmenu on a device with a keyboard, hold the Shift key.</li>
		<li>
			To bypass our contextmenu on a touch device, like to select text, tap one extra time before
			your longpress. This means double-tap-and-hold should behave the same as tap-and-hold on
			standard web pages.
		</li>
		<li>
			Triggering the contextmenu inside of our contextmenu shows your system contextmenu. This means
			you can either double-right-click or longpress twice to access your system contextmenu as an
			alternative to holding Shift or double-tap-and-hold, However a caveat is that the target of
			your action will be some element inside our contextmenu, so to select text or access a link's
			system contextmenu on a touch device, you must use double-tap-and-hold. When you open our
			contextmenu on a link, you'll see the link again in the menu under your pointer by default, so
			to access your system's functionality on links, tap-and-hold twice.
		</li>
	</ul>

	<h3 id="multi-actor-systems-are-more-complex">Multi-actor systems are more complex</h3>
	<p>
		Felt was designed from the beginning to support multiple users, or actors, for each account.
		This is a useful and powerful concept to integrate with a social app, and it helps support
		strong privacy mechanics with good UX. We're also excited to explore novel actor types with
		shared or automated control, like bot actors and group actors.
	</p>
	<p>
		This power brings complexity, and currently, end-users of Felt are exposed to this concept and
		have no options for a simpler experience. Fortunately, our system is being designed to support a
		fully customizable UI, so when it's ready, you'll be able to hide or disable this complexity
		completely.
	</p>
</div>
