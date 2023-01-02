import {toRandomAlea} from '@feltcoop/util/random-alea.js';

// TODO design a color scheme instead of calculating a number of evenly spaced buckets
export const HUE_BUCKETS = 7;

// TODO upstream to Felt -- need to figure out patterns with seed and swappable prng,
// and refactor this to use a random int
export const randomHue = (seed: any = '', buckets: number | undefined = HUE_BUCKETS): number => {
	const v = toRandomAlea(seed)() * 360;
	if (buckets === undefined) {
		return Math.round(v);
	}
	return Math.round(v - (v % (360 / buckets)));
};
