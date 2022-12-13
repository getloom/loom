export type PermissionName = keyof typeof permissions;
export const permissions = {
	UpdateCommunitySettings: 'UpdateCommunitySettings',
	DeleteCommunity: 'DeleteCommunity',
	InviteToCommunity: 'InviteToCommunity',
};
export const permissionNames: PermissionName[] = Object.keys(permissions) as PermissionName[];
