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
import { UserResponseSchema } from '@decksmith/schema/user/user';
import {
  getMe,
  loginUser,
  logoutUser,
  refreshSession,
  registerUser,
  requestPasswordReset,
  resetPassword,
} from '@decksmith/services';
import { SESSION_EXPIRED } from '@decksmith/schema/errors/codes';
import type { FastifyPluginCallbackZod } from 'fastify-type-provider-zod';

import { toRegisterResponse } from './auth-mapper.js';
import { toUserResponse } from '../user/user-mapper.js';

import { config } from '../../config.js';
import { createHttpError } from '../../utils/http-errors/http-errors.js';

// ---------------------------------------------------------------------------
// Cookie options
//
// access_token  — short-lived (1h), sent on every request to the API
// refresh_token — long-lived (7d), sent ONLY to the refresh endpoint
//                 (path restriction limits exposure if traffic is intercepted)
// ---------------------------------------------------------------------------

const ACCESS_COOKIE = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60,
};

const REFRESH_COOKIE = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  path: '/api/v1/auth/refresh',
  maxAge: 60 * 60 * 24 * 7,
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
  app.post(
    '/register',
    {
      config: { rateLimit: { max: 5, timeWindow: '1 hour' } },
      schema: {
        body: RegisterInputSchema,
        response: { 201: RegisterResponseSchema },
      },
    },
    async (req, reply) => {
      const user = await registerUser(req.body);
      return reply.status(201).send(toRegisterResponse(user));
    }
  );

  app.post(
    '/login',
    {
      config: { rateLimit: { max: 10, timeWindow: '15 minutes' } },
      schema: {
        body: LoginInputSchema,
        response: { 200: LoginResponseSchema },
      },
    },
    async (req, reply) => {
      const { accessToken, refreshToken, user } = await loginUser(
        req.body.email,
        req.body.password
      );
      reply.setCookie('access_token', accessToken, ACCESS_COOKIE);
      reply.setCookie('refresh_token', refreshToken, REFRESH_COOKIE);
      return reply.send({ user: toUserResponse(user) });
    }
  );

  app.post(
    '/logout',
    {
      preHandler: app.authenticate,
      schema: { response: { 200: LogoutResponseSchema } },
    },
    async (req, reply) => {
      try {
        await logoutUser(req.user.id);
      } catch (error) {
        // Global sign-out failed (e.g. Supabase outage). Log it for monitoring, but
        // still clear cookies and return 200 — the user IS logged out of this browser.
        req.log.error({ error }, 'global sign-out failed during logout');
      }
      reply.clearCookie('access_token', { path: '/' });
      reply.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
      return reply.send({ message: 'Logged out successfully.' });
    }
  );

  app.post(
    '/refresh',
    {
      config: { rateLimit: { max: 20, timeWindow: '15 minutes' } },
      schema: { response: { 200: RefreshResponseSchema } },
    },
    async (req, reply) => {
      const token = req.cookies['refresh_token'];

      if (!token) {
        throw createHttpError(SESSION_EXPIRED, 'No refresh token found. Please log in.', 401);
      }

      // On session expiry the service throws SERVICE_ERROR_STATUS[SESSION_EXPIRED] → 401.
      // Cookies must be cleared before Fastify's error handler sends the response.
      // We intercept only to clear them, then re-throw so the handler formats the error.
      try {
        const { accessToken, refreshToken } = await refreshSession(token);
        reply.setCookie('access_token', accessToken, ACCESS_COOKIE);
        reply.setCookie('refresh_token', refreshToken, REFRESH_COOKIE);
        return reply.send({ message: 'Session refreshed.' });
      } catch (error) {
        reply.clearCookie('access_token', { path: '/' });
        reply.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
        throw error;
      }
    }
  );

  app.post(
    '/forgot-password',
    {
      config: { rateLimit: { max: 3, timeWindow: '1 hour' } },
      schema: {
        body: ForgotPasswordInputSchema,
        response: { 200: ForgotPasswordResponseSchema },
      },
    },
    async (req, reply) => {
      await requestPasswordReset(req.body.email, `${config.corsOrigin}/auth/reset-password`);
      return reply.send({ message: 'If this email is registered, a reset link has been sent.' });
    }
  );

  app.get(
    '/me',
    {
      preHandler: app.authenticate,
      schema: { response: { 200: UserResponseSchema } },
    },
    async (req, reply) => {
      const user = await getMe(req.user.id);
      return reply.send(toUserResponse(user));
    }
  );

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
      await resetPassword(req.user.id, req.body.newPassword);
      return reply.send({ message: 'Password updated successfully.' });
    }
  );

  done();
};

export default authRoutes;
