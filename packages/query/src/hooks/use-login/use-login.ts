import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { ErrorCode } from '@decksmith/api-client/errors';
import type { LoginInput, LoginResponse } from '@decksmith/schema/auth';

import { useApiClient } from '../../context/context.js';
import { getErrorCode } from '../../lib/get-error-code/get-error-code.js';
import { userKeys } from '../use-user/use-user.js';

type UseLoginResult = UseMutationResult<LoginResponse, Error, LoginInput> & {
  /** Typed error code from the API, or undefined if the error is not an ApiError. */
  errorCode: ErrorCode | undefined;
};

/**
 * Mutation hook for email + password login.
 *
 * On success, the server sets httpOnly cookies — the response body returns the user
 * profile which is written into the TanStack Query cache so the dashboard does not
 * need an extra fetch.
 *
 * Navigation is intentionally NOT done here — the caller (route component) decides
 * where to go after a successful login.
 *
 * @example
 * const { mutate: login, isPending, errorCode } = useLogin();
 * login({ email, password });
 */
export function useLogin(): UseLoginResult {
  const { auth } = useApiClient();
  const queryClient = useQueryClient();

  const mutation = useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: (input) => auth.login(input),
    onSuccess: (data) => {
      queryClient.setQueryData(userKeys.detail(data.user.id), data.user);
    },
  });

  return {
    ...mutation,
    errorCode: getErrorCode(mutation.error),
  };
}
