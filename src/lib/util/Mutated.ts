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
