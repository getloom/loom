import type {Result} from '@feltcoop/felt';
import {Logger} from '@feltcoop/felt/util/log.js';
import {blue, gray} from 'kleur/colors';

import {PostgresRepo} from '$lib/db/PostgresRepo';
import type {Entity} from '$lib/vocab/entity/entity';
import type {DirectoryEntityData} from '$lib/vocab/entity/entityData';
import type {ClientAccountSession} from '$lib/session/clientSession';

const log = new Logger(gray('[') + blue('SessionRepo') + gray(']'));

export class SessionRepo extends PostgresRepo {
	async loadClientSession(account_id: number): Promise<Result<{value: ClientAccountSession}>> {
		log.trace('loadClientSession', account_id);
		const accountResult = await this.repos.account.findById(account_id);
		if (!accountResult.ok) return accountResult;
		const account = accountResult.value;

		// TODO make this a single query
		const [
			spacesResult,
			sessionPersonasResult,
			communitiesResult,
			membershipsResult,
			personasResult,
		] = await Promise.all([
			this.repos.space.filterByAccountWithDirectories(account.account_id),
			this.repos.persona.filterByAccount(account.account_id),
			this.repos.community.filterByAccount(account.account_id),
			this.repos.membership.filterByAccount(account.account_id),
			this.repos.persona.getAll(), //TODO don't getAll
		]);
		if (!spacesResult.ok) return spacesResult;
		if (!sessionPersonasResult.ok) return sessionPersonasResult;
		if (!communitiesResult.ok) return communitiesResult;
		if (!membershipsResult.ok) return membershipsResult;
		if (!personasResult.ok) return personasResult;

		const spaces = spacesResult.value.map((r) => r.space);
		const directories = spacesResult.value.map((r) => r.entity) as Array<
			Entity & {data: DirectoryEntityData}
		>;

		return {
			ok: true,
			value: {
				account,
				sessionPersonas: sessionPersonasResult.value,
				communities: communitiesResult.value,
				spaces,
				directories,
				memberships: membershipsResult.value,
				personas: personasResult.value,
			},
		};
	}
}
