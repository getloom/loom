import type {Assignable} from '@ryanatkn/belt/types.js';
import {Logger} from '@ryanatkn/belt/log.js';

import {blue, gray} from '$lib/server/colors.js';
import {PostgresRepo} from '$lib/db/PostgresRepo.js';
import type {Hub, HubId, HubSettings} from '$lib/vocab/hub/hub.js';
import {ADMIN_HUB_ID} from '$lib/util/constants.js';
import type {ActorId, ClientActor} from '$lib/vocab/actor/actor.js';
import type {Role, RoleId} from '$lib/vocab/role/role.js';
import type {AccountId} from '$lib/vocab/account/account.js';
import type {Policy} from '$lib/vocab/policy/policy.js';
import type {Space} from '$lib/vocab/space/space.js';
import type {Directory} from '$lib/vocab/entity/entityData.js';
import {HUB_COLUMNS, type HubColumn} from '$lib/vocab/hub/hubHelpers.server.js';
import {ACTOR_COLUMNS} from '$lib/vocab/actor/actorHelpers.server.js';

const log = new Logger(gray('[') + blue('HubRepo') + gray(']'));

export class HubRepo extends PostgresRepo {
	async create<T extends HubColumn>(
		type: Hub['type'],
		name: string,
		settings: HubSettings,
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Pick<Hub, T>> {
		const data = await this.sql<Hub[]>`
			INSERT INTO hubs (type, name, settings) VALUES (
				${type}, ${name}, ${this.sql.json(settings as any)}
			) RETURNING ${this.sql(columns as string[])}
		`;
		log.debug('[db] created hub', data[0]);
		const hub = data[0];
		return hub;
	}

	async findById<T extends HubColumn>(
		hub_id: HubId,
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Pick<Hub, T> | undefined> {
		log.debug(`[findById] ${hub_id}`);
		const data = await this.sql<Hub[]>`
			SELECT ${this.sql(columns as string[])}
			FROM hubs WHERE hub_id=${hub_id}
		`;
		return data[0];
	}

	async findByName<T extends HubColumn>(
		name: string,
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Pick<Hub, T> | undefined> {
		log.debug('[findByName]', name);
		const data = await this.sql<Hub[]>`
			SELECT ${this.sql(columns as string[])}
			FROM hubs WHERE LOWER(name)=${name.toLowerCase()}
		`;
		return data[0];
	}

	async filterByAccount<T extends HubColumn>(
		account_id: AccountId,
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Array<Pick<Hub, T>>> {
		log.debug(`[filterByAccount] ${account_id}`);
		const data = await this.sql<Hub[]>`
			SELECT ${this.sql(columns.map((c) => 'h.' + c))}
			FROM hubs h
			JOIN (
				SELECT DISTINCT a2.hub_id FROM actors a3
				JOIN assignments a2 ON a3.actor_id=a2.actor_id AND a3.account_id=${account_id}
			) a
			ON h.hub_id=a.hub_id;
		`;
		log.debug('[filterByAccount]', data.length);
		return data;
	}

	async filterByActor<T extends HubColumn>(
		actor_id: ActorId,
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Array<Pick<Hub, T>>> {
		const data = await this.sql<Hub[]>`
			SELECT ${this.sql(columns.map((c) => 'h.' + c))}
			FROM hubs h
			JOIN (
				SELECT DISTINCT hub_id FROM assignments
				WHERE actor_id=${actor_id}
			) a
			ON h.hub_id=a.hub_id;
		`;
		return data;
	}

	async updateSettings(hub_id: HubId, settings: Hub['settings']): Promise<void> {
		const data = await this.sql`
			UPDATE hubs
			SET updated=NOW(), settings=${this.sql.json(settings as any)}
			WHERE hub_id=${hub_id}
		`;
		if (!data.count) throw Error('no hub found');
	}

	async deleteById(hub_id: HubId): Promise<void> {
		log.debug('[deleteById]', hub_id);
		const data = await this.sql`
			DELETE FROM hubs
			WHERE hub_id=${hub_id}
		`;
		if (!data.count) throw Error('no hub found');
	}

	// This seems safe to cache globally except for possibly tests,
	// but they can fix it themselves.
	static readonly hasAdminHub: boolean = false;

	async hasAdminHub(): Promise<boolean> {
		if (HubRepo.hasAdminHub) return true;
		const [{exists}] = await this.sql`
			SELECT EXISTS(SELECT 1 FROM hubs WHERE hub_id=${ADMIN_HUB_ID});
		`;
		if (exists) {
			(HubRepo as Assignable<typeof HubRepo, 'hasAdminHub'>).hasAdminHub = true;
		}
		return exists;
	}

	async loadAdminHub<T extends HubColumn>(
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Pick<Hub, T> | undefined> {
		return this.findById(ADMIN_HUB_ID, columns);
	}

	async findByRole<T extends HubColumn>(
		role_id: RoleId,
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Pick<Hub, T> | undefined> {
		log.debug(`[findByRole] ${role_id}`);
		const data = await this.sql<Hub[]>`
			SELECT ${this.sql(columns.map((c) => 'h.' + c))}
			FROM hubs h
			JOIN roles r
			ON r.hub_id=h.hub_id
			WHERE r.role_id=${role_id}
		`;
		return data[0];
	}

	async filterByIds<T extends HubColumn>(
		hubIds: HubId[],
		columns: T[] = HUB_COLUMNS.all as T[],
	): Promise<Array<Pick<Hub, T>>> {
		log.debug(`[filterByIds] ${hubIds}`);
		const data = await this.sql<Hub[]>`
			SELECT ${this.sql(columns as string[])}
			FROM hubs WHERE hub_id IN ${this.sql(hubIds)}
		`;
		return data;
	}

	async loadHubContext(hub_id: HubId): Promise<{
		hubActors: ClientActor[];
		hubRoles: Role[];
		hubPolicies: Policy[];
		hubSpaces: Space[];
		hubDirectories: Directory[];
	}> {
		log.debug('loadHubContext', hub_id);

		const [hubSpaces, hubDirectories, hubRoles, hubPolicies, hubActors] = await Promise.all([
			this.repos.space.filterByHub(hub_id),
			this.repos.entity.filterDirectoriesByHub(hub_id),
			this.repos.role.filterByHub(hub_id),
			this.repos.policy.filterByHub(hub_id),
			this.repos.actor.filterAssociatesByHub(hub_id, ACTOR_COLUMNS.public),
		]);

		return {hubActors, hubRoles, hubPolicies, hubSpaces, hubDirectories};
	}
}
