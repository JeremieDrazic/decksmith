import { prisma, supabase, SUPABASE_USER_ALREADY_EXISTS } from '@decksmith/db';
import {
  EMAIL_ALREADY_TAKEN,
  INVALID_CREDENTIALS,
  PASSWORD_RESET_FAILED,
  REGISTRATION_FAILED,
  SESSION_EXPIRED,
  UNAUTHORIZED,
} from '@decksmith/schema/errors/codes';
import {
  ForgotPasswordInputSchema,
  ForgotPasswordResponseSchema,
  LoginInputSchema,
  LoginResponseSchema,
  LogoutResponseSchema,
  RefreshResponseSchema,
  RegisterInputSchema,
  RegisterResponseSchema,
  ResetPasswordInputSchema,
  ResetPasswordResponseSchema,
} from '@decksmith/schema/auth';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';

import { toUserResponse } from '../user/user-mapper.js';
import { toRegisterResponse } from './auth-mapper.js';

import { config } from '@/config.js';
import { createHttpError } from '@/utils/http-errors.js';

// ---------------------------------------------------------------------------
// Cookie options
//
// access_token  — short-lived (1h), sent on every request to the API
// refresh_token — long-lived (7d), sent ONLY to the refresh endpoint
//                 (path restriction limits exposure if traffic is intercepted)
// ---------------------------------------------------------------------------

const ACCESS_COOKIE = {
  httpOnly: true, // JS cannot read this cookie (XSS protection)
  secure: config.nodeEnv === 'production', // HTTPS only in prod (localhost is HTTP)
  sameSite: 'lax' as const, // blocks silent cross-site requests, allows OAuth redirects
  path: '/',
  maxAge: 60 * 60, // 1 hour in seconds
};

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth/refresh', // only sent to this endpoint — limits exposure
  maxAge: 60 * 60 * 24 * 7, // 7 days in seconds
};

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * Auth domain routes.
 *
 * Handles registration, login, logout, token refresh, and password reset.
 * All routes are prefixed by the parent plugin (`/api/v1/auth`).
 */
const authRoutes: FastifyPluginCallbackZod = (app, _opts, done) => {
  // -------------------------------------------------------------------------
  // POST /register — Create a new user account
  //
  // Flow:
  // 1. Supabase Auth creates the auth.users record
  // 2. We create the Prisma User + UserPreferences in a single nested write
  // 3. Supabase sends a confirmation email
  // 4. No session issued yet — user must confirm email first
  // -------------------------------------------------------------------------
  app.post(
    '/register',
    {
      schema: {
        body: RegisterInputSchema,
        response: { 201: RegisterResponseSchema },
      },
    },
    async (req, reply) => {
      const { email, password, username } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // username stored in user_metadata — readable later via req.user.user_metadata.username
          data: { username },
        },
      });

      if (error) {
        if (error.code === SUPABASE_USER_ALREADY_EXISTS) {
          throw createHttpError(EMAIL_ALREADY_TAKEN, 'Email is already registered', 409);
        }
        throw createHttpError(REGISTRATION_FAILED, 'Registration failed. Please try again.', 400);
      }

      if (!data.user) {
        throw createHttpError(REGISTRATION_FAILED, 'Registration failed. Please try again.', 500);
      }

      // id must equal the Supabase auth.users UUID — it is the bridge between
      // auth.users (Supabase-managed) and public.users (our profile data)
      await prisma.user.create({
        data: {
          id: data.user.id,
          email,
          username: username ?? null,
          // Nested write: create UserPreferences in the same operation
          preferences: {
            create: {
              language: 'en',
              units: 'mm',
              defaultCurrency: 'eur',
              theme: 'system',
            },
          },
        },
      });

      return reply.status(201).send(toRegisterResponse(data.user));
    }
  );

  // -------------------------------------------------------------------------
  // POST /login — Authenticate with email + password
  //
  // Tokens are stored in httpOnly cookies — never returned in the response body.
  // The body only returns the user profile so the frontend can populate its state.
  // -------------------------------------------------------------------------
  app.post(
    '/login',
    {
      config: {
        // Stricter than the global 100 req/min — protects against brute-force
        rateLimit: { max: 10, timeWindow: '15 minutes' },
      },
      schema: {
        body: LoginInputSchema,
        response: { 200: LoginResponseSchema },
      },
    },
    async (req, reply) => {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error ?? !data.session) {
        // Intentionally generic — never reveal whether the email or the password is wrong
        throw createHttpError(INVALID_CREDENTIALS, 'Invalid email or password', 401);
      }

      // Look up the Prisma User before issuing cookies — if the DB call fails,
      // we must not leave the client with valid auth cookies but no profile data
      const user = await prisma.user.findUnique({ where: { id: data.user.id } });

      if (!user) {
        throw createHttpError(UNAUTHORIZED, 'User profile not found', 401);
      }

      reply.setCookie('access_token', data.session.access_token, ACCESS_COOKIE);
      reply.setCookie('refresh_token', data.session.refresh_token, REFRESH_COOKIE);

      return reply.send({ user: toUserResponse(user) });
    }
  );

  // -------------------------------------------------------------------------
  // POST /logout — Invalidate session and clear cookies
  //
  // preHandler: authenticate ensures only logged-in users can log out.
  // 'global' scope invalidates all sessions across all devices.
  // -------------------------------------------------------------------------
  app.post(
    '/logout',
    {
      preHandler: app.authenticate,
      schema: {
        response: { 200: LogoutResponseSchema },
      },
    },
    async (req, reply) => {
      // Invalidate all sessions for this user on Supabase side
      await supabase.auth.admin.signOut(req.user.id, 'global');

      // Must pass the same path option that was used when setting the cookies
      reply.clearCookie('access_token', { path: '/' });
      reply.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });

      return reply.send({ message: 'Logged out successfully.' });
    }
  );

  // -------------------------------------------------------------------------
  // POST /refresh — Issue a new access token using the refresh token cookie
  //
  // The refresh token is read from its httpOnly cookie (not the request body).
  // On success, both cookies are overwritten with fresh tokens.
  // On failure, cookies are cleared to force a full re-login.
  // -------------------------------------------------------------------------
  app.post(
    '/refresh',
    {
      schema: {
        response: { 200: RefreshResponseSchema },
      },
    },
    async (req, reply) => {
      const refreshToken = req.cookies['refresh_token'];

      if (!refreshToken) {
        throw createHttpError(SESSION_EXPIRED, 'No refresh token found. Please log in.', 401);
      }

      const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

      if (error ?? !data.session) {
        // Clear stale cookies so the frontend knows to redirect to login
        reply.clearCookie('access_token', { path: '/' });
        reply.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
        throw createHttpError(SESSION_EXPIRED, 'Session expired. Please log in.', 401);
      }

      reply.setCookie('access_token', data.session.access_token, ACCESS_COOKIE);
      reply.setCookie('refresh_token', data.session.refresh_token, REFRESH_COOKIE);

      return reply.send({ message: 'Session refreshed.' });
    }
  );

  // -------------------------------------------------------------------------
  // POST /forgot-password — Send a password reset email
  //
  // Always returns the same success message regardless of whether the email
  // exists — prevents account enumeration attacks.
  // -------------------------------------------------------------------------
  app.post(
    '/forgot-password',
    {
      config: {
        rateLimit: { max: 3, timeWindow: '1 hour' },
      },
      schema: {
        body: ForgotPasswordInputSchema,
        response: { 200: ForgotPasswordResponseSchema },
      },
    },
    async (req, reply) => {
      // Error intentionally ignored — see comment above
      await supabase.auth.resetPasswordForEmail(req.body.email, {
        redirectTo: `${config.corsOrigin}/auth/reset-password`,
      });

      return reply.send({ message: 'If this email is registered, a reset link has been sent.' });
    }
  );

  // -------------------------------------------------------------------------
  // POST /reset-password — Update the user's password
  //
  // Requires authentication — the frontend must exchange the magic link token
  // for a session cookie before calling this endpoint.
  // Uses the admin API to update by user ID (avoids server-side session state issues).
  // -------------------------------------------------------------------------
  app.post(
    '/reset-password',
    {
      preHandler: app.authenticate,
      schema: {
        body: ResetPasswordInputSchema,
        response: { 200: ResetPasswordResponseSchema },
      },
    },
    async (req, reply) => {
      const { error } = await supabase.auth.admin.updateUserById(req.user.id, {
        password: req.body.newPassword,
      });

      if (error) {
        throw createHttpError(
          PASSWORD_RESET_FAILED,
          'Failed to reset password. Please try again.',
          400
        );
      }

      return reply.send({ message: 'Password updated successfully.' });
    }
  );

  done();
};

export default authRoutes;
