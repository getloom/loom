// TODO Ideally this class doesn't exist because it's a lot of error-prone manual bookkeeping,
// and we'd prefer that mutations have automatic batching.
// The main blocking issue is that most batching store implementations don't allow async updates.
// We may want to change mutations to be sync, because currently they can do things like navigation.
// Instead of navigating in the mutations,
// we could have them push async effects that get executed after the mutation.

/**
 * Helper class for batching mutations to `Mutable` stores.
 * A single instance can be threaded through multiple mutation functions using a default value.
 * The `end` method applies the mutation if the `key` argument matches the constructor's `key`,
 * and all other calls are discarded, enabling seamless composition.
 */
export class Mutated {
	private mutated: Set<{mutate: () => void}> | undefined;

	constructor(private readonly key: any) {}

	end(key: any): void {
		if (this.key !== key) return;
		const {mutated} = this;
		if (!mutated) return;
		for (const m of mutated) m.mutate();
		this.mutated = undefined;
	}

	add(mutable: {mutate: () => void}): void {
		let {mutated} = this;
		if (!mutated) mutated = this.mutated = new Set();
		mutated.add(mutable);
	}
}
