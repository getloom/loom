import {Logger} from '@feltcoop/util/log.js';
import {unwrap} from '@feltcoop/util';

import {blue, gray} from '$lib/server/colors';
import type {ServiceByName} from '$lib/app/eventTypes';
import {CreateTie, ReadTies, DeleteTie} from '$lib/vocab/tie/tieEvents';

const log = new Logger(gray('[') + blue('CreateTie') + gray(']'));

//Creates a new community for an instance
// TODO think about extracting this to a `.services.` file
// that imports a generated type and declares only `perform`
export const CreateTieService: ServiceByName['CreateTie'] = {
	event: CreateTie,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			log.trace('[CreateTie] params', params);
			const tie = unwrap(await repos.tie.create(params.source_id, params.dest_id, params.type));
			log.trace('[CreateTie] result', tie);
			return {ok: true, status: 200, value: {tie}};
		}),
};

//TODO may want to remove this & collapse behavior into ReadEntities(Paginated)
export const ReadTiesService: ServiceByName['ReadTies'] = {
	event: ReadTies,
	perform: async ({repos, params}) => {
		const ties = unwrap(await repos.tie.filterBySourceId(params.source_id));
		return {ok: true, status: 200, value: {ties}};
	},
};

//deletes a single tie
export const DeleteTieService: ServiceByName['DeleteTie'] = {
	event: DeleteTie,
	perform: ({transact, params}) =>
		transact(async (repos) => {
			log.trace('[DeleteTie] deleting tie with ids:', params.tie_id);
			unwrap(await repos.tie.deleteById(params.tie_id));
			return {ok: true, status: 200, value: null};
		}),
};
