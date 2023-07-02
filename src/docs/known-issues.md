# Known issues

Some of felt-server's issues have no current spot on the roadmap
and no obvious use for discussion.
We track them here instead of GitHub issues,
mainly because we expect them to remain stale for the foreseeable future.

- Service http endpoints use `POST` not `GET`, even for "read" actions.
  This is mostly because our query params are nontrivial to serialize to the querystring.
  This is less than ideal because it breaks standard server-side caching for GET requests,
  and it's less RESTful than some would prefer.
  We feel it's an acceptable limitation for now,
  and GraphQL does the same thing, not that we want to use that excuse.
