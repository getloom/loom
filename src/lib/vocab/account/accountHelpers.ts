export const scrubAccountName = (name: string): string => name.trim();

const ACCOUNT_NAME_MATCHER = /^.+@.+\..+$/u;

export const checkAccountName = (name: string): string | null => {
	if (!ACCOUNT_NAME_MATCHER.test(name)) {
		return `name must be an email address`;
	}
	return null;
};
