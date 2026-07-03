import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ErrorCode } from '@decksmith/api-client/errors';
import type { RegisterInput, RegisterResponse } from '@decksmith/schema/auth';

import { useApiClient } from '../../context/context.js';
import { getErrorCode } from '../../lib/get-error-code/get-error-code.js';

type UseRegisterResult = UseMutationResult<RegisterResponse, Error, RegisterInput> & {
  /** Typed error code from the API, or undefined if the error is not an ApiError. */
  errorCode: ErrorCode | undefined;
};

/**
 * Mutation hook for account registration.
 *
 * On success, no session is issued — the account is pending email confirmation.
 * The response contains a `message` to display to the user ("Check your inbox.").
 *
 * Navigation is intentionally NOT done here — the caller decides what to show
 * after a successful registration (typically an inline confirmation message).
 *
 * @example
 * const { mutate: register, isPending, isSuccess, data, errorCode } = useRegister();
 * register({ email, password });
 */
export function useRegister(): UseRegisterResult {
  const { auth } = useApiClient();

  const mutation = useMutation<RegisterResponse, Error, RegisterInput>({
    mutationFn: (input) => auth.register(input),
  });

  return {
    ...mutation,
    errorCode: getErrorCode(mutation.error),
  };
}
