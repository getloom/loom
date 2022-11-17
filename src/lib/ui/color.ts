import {toRandomAlea} from '@feltcoop/util/random-alea.js';

// TODO upstream to Felt -- need to figure out patterns with seed and swappable prng,
// and refactor this to use a random int
export const randomHue = (seed: any = ''): number => Math.round(toRandomAlea(seed)() * 360);
