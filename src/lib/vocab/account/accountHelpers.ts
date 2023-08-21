export const scrubAccountName = (name: string): string => name.trim();

const ACCOUNT_NAME_MATCHER = /^.+@.+\..+$/u;
const DEFAULT_MIN_PASSWORD_LENGTH = 8;

export const checkAccountName = (name: string): string | null => {
	if (!ACCOUNT_NAME_MATCHER.test(name)) {
		return `name must be an email address`;
	}
	return null;
};

export const checkPasswordStrength = (
	password: string,
	minLength: number = DEFAULT_MIN_PASSWORD_LENGTH,
): string | null => {
	if (password.length < minLength) {
		return `password must be at least ${minLength} characters long`;
	}
	return null;
};
