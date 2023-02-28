import type {PostgresSql} from '$lib/db/postgres';
import {AccountRepo} from '$lib/vocab/account/AccountRepo';
import {PersonaRepo} from '$lib/vocab/persona/PersonaRepo';
import {AssignmentRepo} from '$lib/vocab/assignment/AssignmentRepo';
import {HubRepo} from '$lib/vocab/hub/HubRepo';
import {SpaceRepo} from '$lib/vocab/space/SpaceRepo';
import {EntityRepo} from '$lib/vocab/entity/EntityRepo';
import {TieRepo} from '$lib/vocab/tie/TieRepo';
import {RoleRepo} from '$lib/vocab/role/RoleRepo';
import {PolicyRepo} from '$lib/vocab/policy/PolicyRepo';

/**
 * The `Repos` is instantiated with a `postgres.Sql` instance,
 * which can be a normal connection or transaction.
 */
export class Repos {
	readonly account: AccountRepo;
	readonly persona: PersonaRepo;
	readonly assignment: AssignmentRepo;
	readonly hub: HubRepo;
	readonly space: SpaceRepo;
	readonly entity: EntityRepo;
	readonly tie: TieRepo;
	readonly role: RoleRepo;
	readonly policy: PolicyRepo;

	constructor(public readonly sql: PostgresSql) {
		this.account = new AccountRepo(this, sql);
		this.persona = new PersonaRepo(this, sql);
		this.assignment = new AssignmentRepo(this, sql);
		this.hub = new HubRepo(this, sql);
		this.space = new SpaceRepo(this, sql);
		this.entity = new EntityRepo(this, sql);
		this.tie = new TieRepo(this, sql);
		this.role = new RoleRepo(this, sql);
		this.policy = new PolicyRepo(this, sql);
	}
}
