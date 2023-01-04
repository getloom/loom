export type PermissionName = keyof typeof permissions;
export const permissions = {
	UpdateCommunitySettings: 'UpdateCommunitySettings',
	DeleteCommunity: 'DeleteCommunity',
	InviteToCommunity: 'InviteToCommunity',
	CreateRole: 'CreateRole',
	UpdateRole: 'UpdateRole',
	DeleteRole: 'DeleteRole',
	CreateAssignment: 'CreateAssignment',
	DeleteAssignment: 'DeleteAssignment',
};
export const permissionNames: PermissionName[] = Object.keys(permissions) as PermissionName[];
