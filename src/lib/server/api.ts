import type {Result} from '@feltcoop/felt';

import type {ErrorResponse} from '$lib/util/error';

export type ApiResult<TValue> = Result<
	{status: number; value: TValue},
	{status: number | null} & ErrorResponse
>;
