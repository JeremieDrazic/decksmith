import type {
  ForgotPasswordInput,
  ForgotPasswordResponse,
  LoginInput,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  ResetPasswordResponse,
} from '@decksmith/schema/auth';

import type { Fetcher } from '../../fetcher/fetcher.js';

/**
 * Creates the auth module — all functions for the `/api/v1/auth` routes.
 *
 * @param fetcher - Pre-configured fetch wrapper from `createFetcher`.
 */
export function createAuthModule(fetcher: Fetcher) {
  return {
    /**
     * Register a new account.
     *
     * The account is pending email confirmation — no session is issued yet.
     *
     * @param input - Email, password, and optional username.
     */
    register: (input: RegisterInput): Promise<RegisterResponse> =>
      fetcher({ method: 'POST', path: '/api/v1/auth/register', body: input }),

    /**
     * Log in with email and password.
     *
     * On success, the API sets httpOnly cookie tokens — not returned in the body.
     *
     * @param input - Email and password.
     */
    login: (input: LoginInput): Promise<LoginResponse> =>
      fetcher({ method: 'POST', path: '/api/v1/auth/login', body: input }),

    /**
     * Log out the current session.
     *
     * Clears the httpOnly cookie tokens. Requires an active session.
     */
    logout: (): Promise<LogoutResponse> => fetcher({ method: 'POST', path: '/api/v1/auth/logout' }),

    /**
     * Refresh the access token using the refresh cookie.
     *
     * The refresh token is read from the httpOnly cookie — nothing to pass in.
     * New tokens are set as httpOnly cookies on success.
     */
    refresh: (): Promise<RefreshResponse> =>
      fetcher({ method: 'POST', path: '/api/v1/auth/refresh' }),

    /**
     * Send a password reset email.
     *
     * Always returns success — never reveals whether the email is registered
     * (prevents email enumeration attacks).
     *
     * @param input - Email address.
     */
    forgotPassword: (input: ForgotPasswordInput): Promise<ForgotPasswordResponse> =>
      fetcher({ method: 'POST', path: '/api/v1/auth/forgot-password', body: input }),

    /**
     * Set a new password using the reset token from the email link.
     *
     * @param input - New password.
     */
    resetPassword: (input: ResetPasswordInput): Promise<ResetPasswordResponse> =>
      fetcher({ method: 'POST', path: '/api/v1/auth/reset-password', body: input }),
  };
}
