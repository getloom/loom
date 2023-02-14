import {
	gray as grayKleur,
	blue as blueKleur,
	green as greenKleur,
	red as redKleur,
	cyan as cyanKleur,
} from 'kleur/colors';
import {identity} from '@feltjs/util/function.js';

const dev = process.env.NODE_ENV !== 'production'; // TODO fixme in multiple places to use `$app/environment`

export const gray = dev ? grayKleur : identity;
export const blue = dev ? blueKleur : identity;
export const green = dev ? greenKleur : identity;
export const red = dev ? redKleur : identity;
export const cyan = dev ? cyanKleur : identity;
