import type {Sql} from 'postgres';

const mapping = {
	Ephemera: 'ephemera',
	UpdateHub: 'update_hub',
	DeleteHub: 'delete_hub',
	InviteToHub: 'invite_to_hub',
	KickFromHub: 'kick_from_hub',
	CreateRole: 'create_role',
	UpdateRole: 'update_role',
	DeleteRole: 'delete_role',
	CreateAssignment: 'create_assignment',
	DeleteAssignment: 'delete_assignment',
	CreateSpace: 'create_space',
	UpdateSpace: 'update_space',
	DeleteSpace: 'delete_space',
	CreateEntity: 'create_entity',
	CreatePolicy: 'create_policy',
	DeletePolicy: 'delete_policy',
	UpdatePolicy: 'update_policy',
};

export const up = async (sql: Sql<any>): Promise<void> => {
	await Promise.all(
		Object.entries(mapping).map(([oldName, newName]) => {
			return sql`
        UPDATE policies
        SET name=${newName}
        WHERE name=${oldName};
    `;
		}),
	);
};
