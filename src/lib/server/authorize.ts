import {OK, type Result} from '@feltcoop/felt';

import type {Service} from '$lib/server/service';
import type {ErrorResponse} from '$lib/util/error';
import type {Repos} from '$lib/db/Repos';

// This currently only checks for the existence of an `account_id` on the request.
// We'll want to allow services to declare more complex rules.
export const authorize = async (
	service: Service<any, any>,
	repos: Repos,
	account_id: number | undefined,
	params: {actor?: number},
): Promise<Result<object, ErrorResponse & {status: number}>> => {
	// Authorize all services by default; each service can opt-out as needed.
	const requiresAuthentication = service.event.authenticate ?? true;
	if (!requiresAuthentication) return OK;

	// Authenticate by ensuring there's an account_id:
	if (!account_id) {
		return {ok: false, status: 401, message: 'not logged in'}; // TODO centralize error message strings
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
	const personaResult = await repos.persona.findById(params.actor);
	if (!personaResult.ok) {
		return {ok: false, status: 400, message: 'actor cannot be found'};
	}
	if (personaResult.value.account_id !== account_id) {
		return {ok: false, status: 403, message: 'actor is not authorized for this account'};
	}
	// TODO return the persona object and forward with the request?
	// We could also use the same pattern to fix the problem where
	// `account_id` is available for some but not all service requests.
	// Maybe three types of service requests:
	// `AuthorizedServiceRequest`	- yes `account_id`, yes `persona`/`params.actor`
	// `UnauthorizedServiceRequest` - yes `account_id`, no `persona`/`params.actor`
	// `UnathenticatedServiceRequest` - no `account_id`, no `persona`/`params.actor`
	return OK;
};
