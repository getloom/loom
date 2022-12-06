export type PermissionName = keyof typeof permissions;
export const permissions = {
	UpdateCommunitySettings: 'UpdateCommunitySettings',
	DeleteCommunity: 'DeleteCommunity',
};
export const permissionNames: string[] = Object.keys(permissions);
