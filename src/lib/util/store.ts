import type {Writable} from '@getloom/svelte-gettable-stores';

export const setIfUpdated = <T extends {updated?: Date | null}>(
	store: Writable<T | null | undefined>,
	value: T,
): boolean => {
	const $s = store.get();
	if (!$s?.updated || value.updated! >= $s.updated) {
		store.set(value);
		return true;
	}
	return false;
};
