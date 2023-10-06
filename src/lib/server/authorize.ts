import {OK, type Result} from '@grogarden/util/result.js';

import type {Service} from '$lib/server/service.js';
import type {ErrorResponse} from '$lib/util/error.js';
import type {Repos} from '$lib/db/Repos.js';
import type {ActionActor, ActorId} from '$lib/vocab/actor/actor.js';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server.js';
import type {AccountId} from '$lib/vocab/account/account.js';

// This currently only checks for the existence of an `account_id` on the request.
// We'll want to allow services to declare more complex rules.
export const authorize = async (
	service: Service,
	repos: Repos,
	account_id: AccountId | undefined,
	params: {actor?: ActorId; [key: string]: unknown},
): Promise<Result<{value?: {actor?: ActionActor}}, ErrorResponse & {status: number}>> => {
	// Authorize all services by default; each service can opt-out as needed.
	const requiresAuthentication = service.action.authenticate ?? true;
	if (!requiresAuthentication) return OK;

	// Authenticate by ensuring there's an account_id:
	if (!account_id) {
		return {ok: false, status: 401, message: 'not signed in'}; // TODO centralize error message strings
	}
	// TODO possibly check that the account still exists and is in good standing,
	// and if loading the account is required for the check, add it to the service request,
	// similar to the `actor` in the authorization code below

	// If the params have an `actor` property, authorize it for the account.
	// Params validation ensures that omitting `actor` is caught ahead of this function call.
	const requiresAuthorization = service.action.authorize ?? true;
	if (!requiresAuthorization) return OK;

	// Authorize the actor against the account_id:
	if (!params.actor) {
		return {ok: false, status: 400, message: 'actor is required'};
	}
	const actor = await repos.actor.findById(params.actor, ACTOR_COLUMNS.all);
	if (!actor) {
		return {ok: false, status: 400, message: 'actor cannot be found'};
	}
	if (actor.type === 'ghost') {
		return {ok: false, status: 400, message: 'ghost cannot be an actor'};
	}
	if (actor.account_id !== account_id) {
		return {ok: false, status: 403, message: 'actor is not authorized for this account'};
	}
	// TODO this type hack shouldn't be necessary, but somehow the types are off,
	// looks like types aren't narrowing with `Pick` on the type union (see this comment in multiple places)
	return {ok: true, value: {actor: actor as ActionActor}};
};
