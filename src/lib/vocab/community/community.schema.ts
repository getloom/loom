import {randomHue} from '$lib/ui/color';
import type {CommunitySettings} from '$lib/vocab/community/community';

export const CommunitySchema = {
	$id: '/schemas/Community.json',
	type: 'object',
	description: `
		Communities represent the membrane around the places Personas can interact with each other or with system level data.
		They have self contained governance and ownership of Spaces within them.
		By default they are hidden & undiscoverable and are only visible to a user once a Persona has been invited in.
	`,
	properties: {
		community_id: {type: 'number'},
		type: {type: 'string', enum: ['standard', 'personal']},
		name: {type: 'string'},
		settings: {$ref: '/schemas/CommunitySettings.json', tsType: 'CommunitySettings'},
		created: {type: 'object', instanceof: 'Date', tsType: 'Date'},
		updated: {anyOf: [{type: 'object', instanceof: 'Date', tsType: 'Date'}, {type: 'null'}]},
	},
	required: ['community_id', 'type', 'name', 'settings', 'created', 'updated'],
	additionalProperties: false,
};

export const CommunitySettingsSchema = {
	$id: '/schemas/CommunitySettings.json',
	type: 'object',
	description: `
		A nested set of attributes on Community. Holds all community level settings.
	`,
	properties: {
		hue: {type: 'number'},
		defaultRoleId: {type: 'number'},
		instance: {
			type: 'object',
			properties: {
				allowedAccountNames: {type: 'array', items: {type: 'string'}},
			},
			additionalProperties: false,
		},
	},
	required: ['hue', 'defaultRoleId'],
	additionalProperties: false,
};

export const InitialCommunitySettingsSchema = {
	$id: '/schemas/InitialCommunitySettings.json',
	type: 'object',
	description: `
		A subset of CommunitySettings needed for defaults at the time of Community creation.
	`,
	properties: {
		hue: {type: 'number'},
	},
	required: ['hue'],
	additionalProperties: false,
};

export const toDefaultCommunitySettings = (name: string): CommunitySettings => ({
	hue: randomHue(name),
	//this is a hack to allow for creation of the community before it's default role is created
	defaultRoleId: -1,
});
