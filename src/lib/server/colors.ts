import {
	gray as grayKleur,
	blue as blueKleur,
	green as greenKleur,
	red as redKleur,
	cyan as cyanKleur,
} from 'kleur/colors';
import {identity} from '@grogarden/util/function.js';

export const gray = import.meta.env.DEV ? grayKleur : identity;
export const blue = import.meta.env.DEV ? blueKleur : identity;
export const green = import.meta.env.DEV ? greenKleur : identity;
export const red = import.meta.env.DEV ? redKleur : identity;
export const cyan = import.meta.env.DEV ? cyanKleur : identity;
