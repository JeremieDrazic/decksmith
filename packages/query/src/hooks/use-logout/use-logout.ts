import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query';

import type { ErrorCode } from '@decksmith/api-client/errors';
import type { LogoutResponse } from '@decksmith/schema/auth';

import { useApiClient } from '../../context/context.js';
import { getErrorCode } from '../../lib/get-error-code/get-error-code.js';

type UseLogoutResult = UseMutationResult<LogoutResponse, Error, void> & {
  /** Typed error code from the API, or undefined if the error is not an ApiError. */
  errorCode: ErrorCode | undefined;
};

/**
 * Mutation hook for logout.
 *
 * Calls the API logout endpoint — which clears the httpOnly session cookies —
 * then empties the whole TanStack Query cache, so no user-scoped data (profile,
 * preferences, later collection/decks) survives for the next person on this
 * machine.
 *
 * Navigation is intentionally NOT done here — the caller (the shell's account
 * menu) redirects to /login after a successful logout, same contract as
 * `useLogin`.
 *
 * @example
 * const { mutate: logout, isPending } = useLogout();
 * logout(undefined, { onSuccess: () => navigate({ to: '/login' }) });
 */
export function useLogout(): UseLogoutResult {
  const { auth } = useApiClient();
  const queryClient = useQueryClient();

  // TVariables is left to inference (void) — `mutationFn` takes no argument, so
  // `mutate()` is called with none. Writing `void` explicitly trips no-invalid-void-type.
  const mutation = useMutation<LogoutResponse, Error>({
    mutationFn: () => auth.logout(),
    onSuccess: () => {
      queryClient.clear();
    },
  });

  return {
    ...mutation,
    errorCode: getErrorCode(mutation.error),
  };
}
