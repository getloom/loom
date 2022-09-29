import {
	gray as grayKleur,
	blue as blueKleur,
	green as greenKleur,
	red as redKleur,
	cyan as cyanKleur,
} from 'kleur/colors';
import {identity} from '@feltcoop/felt/util/function.js';

// TODO make sure kleur is not included in the build for production

const dev = process.env.NODE_ENV !== 'production';

export const gray = dev ? grayKleur : identity;
export const blue = dev ? blueKleur : identity;
export const green = dev ? greenKleur : identity;
export const red = dev ? redKleur : identity;
export const cyan = dev ? cyanKleur : identity;
