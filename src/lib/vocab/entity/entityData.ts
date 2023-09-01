import type {Entity, EntityId} from '$lib/vocab/entity/entity';

export type EntityData =
	| BaseEntityData
	| CollectionEntityData
	| OrderedCollectionEntityData
	| NoteEntityData
	| TombstoneEntityData;

export interface BaseEntityData {
	type?: string;
	content?: string;
	name?: string;
	checked?: boolean;
	orderedItems?: EntityId[];
	formerType?: string;
	deleted?: string;
	previousType?: string;
}

export interface CollectionEntityData extends BaseEntityData {
	type: 'Collection';
}

export interface OrderedCollectionEntityData extends BaseEntityData {
	type: 'OrderedCollection';
	orderedItems: EntityId[];
}

export interface NoteEntityData extends BaseEntityData {
	type?: 'Note' | undefined;
	content: string;
}

export interface TombstoneEntityData extends BaseEntityData {
	type: 'Tombstone';
	formerType: string;
	deleted: string;
	previousType: string;
}

// TODO move to a schema
export interface Directory extends Entity {
	path: string; // directories always have a `path`, can't be `null`
	data: CollectionEntityData;
}
