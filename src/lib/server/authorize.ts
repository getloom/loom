import {OK, unwrap, type Result} from '@feltcoop/felt';

import type {Service} from '$lib/server/service';
import type {ErrorResponse} from '$lib/util/error';
import type {Repos} from '$lib/db/Repos';
import type {Persona} from '$lib/vocab/persona/persona';

// This currently only checks for the existence of an `account_id` on the request.
// We'll want to allow services to declare more complex rules.
export const authorize = async (
	service: Service,
	repos: Repos,
	account_id: number | undefined,
	params: {actor?: number; [key: string]: unknown},
): Promise<Result<{value?: {actor?: Persona}}, ErrorResponse & {status: number}>> => {
	// Authorize all services by default; each service can opt-out as needed.
	const requiresAuthentication = service.event.authenticate ?? true;
	if (!requiresAuthentication) return OK;

	// Authenticate by ensuring there's an account_id:
	if (!account_id) {
		return {ok: false, status: 401, message: 'not signed in'}; // TODO centralize error message strings
	}
	// TODO possibly check that the account still exists and is in good standing,
	// and if loading the account is required for the check, add it to the service request,
	// similar to the `persona` in the authorization code below

	// If the params have an `actor` property, authorize it for the account.
	// Params validation ensures that omitting `actor` is caught ahead of this function call.
	const requiresAuthorization = service.event.authorize ?? true;
	if (!requiresAuthorization) return OK;

	// Authorize the actor against the account_id:
	if (!params.actor) {
		return {ok: false, status: 400, message: 'actor is required'};
	}
	const actor = unwrap(await repos.persona.findById(params.actor));
	if (!actor) {
		return {ok: false, status: 400, message: 'actor cannot be found'};
	}
	if (actor.account_id !== account_id) {
		return {ok: false, status: 403, message: 'actor is not authorized for this account'};
	}
	return {ok: true, value: {actor}};
};
