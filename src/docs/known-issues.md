# Known issues

Some of felt-server's issues have no scheduled spot on the roadmap
and no obvious use for discussion.
We don't want these to clutter the GitHub issues,
but we're open to feedback in our other dev community spaces and by email.

- [Not using SvelteKit's server-side data loading](#not-using-sveltekits-server-side-data-loading)
- [Using HTTP `POST` instead of `GET` for endpoints with params](#using-http-post-instead-of-get-for-endpoints-with-params)
- [Overriding the contextmenu breaks web platform expectations](#overriding-the-contextmenu-breaks-web-platform-expectations)

## Not using SvelteKit's server-side data loading

We currently load entity data, like posts and comments, only after the page loads,
instead of using [SvelteKit's data loading](https://kit.svelte.dev/docs/load)
to render pages fully on the server.

This means that when you refresh a page,
you'll see loading animations as the actual content is loaded in a second request.
This slows down the initial UX on page load,
it's less robust and user-friendly because JS has to load and run,
and it makes the HTML less accessible in contexts like scraping.

The main reason we don't use SvelteKit's builtin data loading
is that our protocol was designed to work with both websockets and HTTP,
and the added complexity of SSR with full data loading
was too much for us to consider until things stabilized.

We expect to have the best of both worlds when the work is done:
our server will be able to return the full HTML of resources,
and clients can use whichever transport is best for their UX.

## Using HTTP `POST` instead of `GET` for endpoints with params

Service HTTP endpoints that have params use `POST` not `GET`, even for "read" actions.
This breaks standard server-side caching for GET requests
and it's less RESTful than some would prefer.

This is mostly because our action params, which can be any JSON,
are nontrivial to serialize and parse from the querystring.

Our schemas make this problem fixable, but it's not a priority.
We feel it's an acceptable limitation for now,
and GraphQL does the same thing, not that we want to use that excuse.
We plan to revisit this during beta.

## Overriding the contextmenu breaks web platform expectations

We take two things very seriously, in no particular order:

1. giving our users a powerful and customizable UX
2. aligning with the web platform and not breaking its standard behaviors

Part of our answer for 1) includes a custom contextmenu.
Like Google Docs, when you right-click or longpress on the page,
you'll see options and actions specific to our application for your current context.

This is a powerful UX pattern, but it violates 2).
Our contextmenu breaks the normal browser behavior of showing the system contextmenu
and device-specific behaviors like selecting text.

Balancing these two concerns is going to be an ongoing challenge for us,
and our current belief is that the contextmenu is too useful and powerful to ignore.
We're open to constructive feedback, and we'll do what
we can to minimize the harmful effects of choices like this.

Mitigations we've implemented:

- To bypass our contextmenu on a device with a keyboard, hold the Shift key.
- To bypass our contextmenu on a touch device, like to select text,
  tap one extra time before your longpress.
  Double-tap-and-hold should behave the same as tap-and-hold on standard web pages.
- When you open our contextmenu on a link,
  you'll see the link again in the menu, and that link has the default browser contextmenu behavior,
  so it becomes a two-step process to access the original functionality in the case of links.
