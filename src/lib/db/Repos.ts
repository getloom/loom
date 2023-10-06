import type {PostgresSql} from '$lib/db/postgres.js';
import {AccountRepo} from '$lib/vocab/account/AccountRepo.js';
import {ActorRepo} from '$lib/vocab/actor/ActorRepo.js';
import {AssignmentRepo} from '$lib/vocab/assignment/AssignmentRepo.js';
import {HubRepo} from '$lib/vocab/hub/HubRepo.js';
import {SpaceRepo} from '$lib/vocab/space/SpaceRepo.js';
import {EntityRepo} from '$lib/vocab/entity/EntityRepo.js';
import {TieRepo} from '$lib/vocab/tie/TieRepo.js';
import {RoleRepo} from '$lib/vocab/role/RoleRepo.js';
import {PolicyRepo} from '$lib/vocab/policy/PolicyRepo.js';

/**
 * The `Repos` is instantiated with a `postgres.Sql` instance,
 * which can be a normal connection or transaction.
 */
export class Repos {
	readonly account: AccountRepo;
	readonly actor: ActorRepo;
	readonly assignment: AssignmentRepo;
	readonly hub: HubRepo;
	readonly space: SpaceRepo;
	readonly entity: EntityRepo;
	readonly tie: TieRepo;
	readonly role: RoleRepo;
	readonly policy: PolicyRepo;

	constructor(public readonly sql: PostgresSql) {
		this.account = new AccountRepo(this, sql);
		this.actor = new ActorRepo(this, sql);
		this.assignment = new AssignmentRepo(this, sql);
		this.hub = new HubRepo(this, sql);
		this.space = new SpaceRepo(this, sql);
		this.entity = new EntityRepo(this, sql);
		this.tie = new TieRepo(this, sql);
		this.role = new RoleRepo(this, sql);
		this.policy = new PolicyRepo(this, sql);
	}
}
