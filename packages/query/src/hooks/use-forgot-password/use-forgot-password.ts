import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import type { ErrorCode } from '@decksmith/api-client/errors';
import type { ForgotPasswordInput, ForgotPasswordResponse } from '@decksmith/schema/auth';

import { useApiClient } from '../../context/context.js';
import { getErrorCode } from '../../lib/get-error-code/get-error-code.js';

type UseForgotPasswordResult = UseMutationResult<
  ForgotPasswordResponse,
  Error,
  ForgotPasswordInput
> & {
  /** Typed error code from the API, or undefined if the error is not an ApiError. */
  errorCode: ErrorCode | undefined;
};

/**
 * Mutation hook for requesting a password reset email.
 *
 * The API always returns success regardless of whether the email exists —
 * this prevents email enumeration attacks. The response `message` is shown
 * inline to the user; no redirect is performed.
 *
 * @example
 * const { mutate: forgotPassword, isPending, isSuccess, data } = useForgotPassword();
 * forgotPassword({ email });
 */
export function useForgotPassword(): UseForgotPasswordResult {
  const { auth } = useApiClient();

  const mutation = useMutation<ForgotPasswordResponse, Error, ForgotPasswordInput>({
    mutationFn: (input) => auth.forgotPassword(input),
  });

  return {
    ...mutation,
    errorCode: getErrorCode(mutation.error),
  };
}
