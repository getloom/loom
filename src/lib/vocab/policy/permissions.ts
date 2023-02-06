export type PermissionName = keyof typeof permissions;
export const permissions = {
	Ephemera: 'Ephemera',
	UpdateCommunitySettings: 'UpdateCommunitySettings',
	DeleteCommunity: 'DeleteCommunity',
	InviteToCommunity: 'InviteToCommunity',
	KickFromCommunity: 'KickFromCommunity',
	CreateRole: 'CreateRole',
	UpdateRole: 'UpdateRole',
	DeleteRole: 'DeleteRole',
	CreateAssignment: 'CreateAssignment',
	DeleteAssignment: 'DeleteAssignment',
	CreateSpace: 'CreateSpace',
	UpdateSpace: 'UpdateSpace',
	DeleteSpace: 'DeleteSpace',
	CreateEntity: 'CreateEntity',
	CreatePolicy: 'CreatePolicy',
	DeletePolicy: 'DeletePolicy',
	UpdatePolicy: 'UpdatePolicy',
} as const;
export const permissionNames: PermissionName[] = Object.keys(permissions) as PermissionName[];
