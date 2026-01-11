# User Authentication & Authorization

Secure user authentication powered by Supabase Auth with OAuth providers.

---

## Overview

Decksmith uses **Supabase Auth** for complete authentication flows:
- Email/password registration with email confirmation
- OAuth providers (Google, GitHub)
- Password reset and account management
- Row-Level Security (RLS) for data isolation
- Session management with JWT tokens

**Goal:** Secure, user-friendly auth with minimal custom code.

---

## Features

### Email/Password Registration

**As a new user, I want to sign up with email/password so I can start building my collection.**

**Flow:**
1. User submits registration form (email, password, optional username)
2. Server validates input (Zod schema)
3. Supabase Auth creates user account
4. Confirmation email sent to user
5. User clicks confirmation link → Account activated
6. Auto-login after confirmation
7. UserPreferences record created with defaults

**Validation Rules:**
- Email: Valid format, unique
- Password: Minimum 8 chars, at least 1 uppercase, 1 lowercase, 1 number
- Username: Optional, 3-20 chars, alphanumeric + underscores only

**API Endpoint:**
```typescript
POST /api/auth/register
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "username": "mtg_player"  // optional
}

// Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "confirmed_at": null  // pending email confirmation
  },
  "message": "Confirmation email sent. Please check your inbox."
}
```

**Supabase Integration:**
```typescript
// apps/api/src/routes/auth.ts
import { supabase } from '@decksmith/db'

async function register(req, reply) {
  const { email, password, username } = req.body

  // Create user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }  // stored in user metadata
    }
  })

  if (error) {
    return reply.code(400).send({ error: error.message })
  }

  // Create UserPreferences record (via database trigger or explicit insert)
  await prisma.userPreferences.create({
    data: {
      userId: data.user!.id,
      language: 'en',
      units: 'mm',
      defaultCurrency: 'usd',
      theme: 'system'
    }
  })

  return { user: data.user, message: 'Confirmation email sent.' }
}
```

**Email Confirmation:**
- Supabase sends email with confirmation link
- Link format: `https://app.decksmith.com/auth/confirm?token=...`
- Token expires after 24 hours
- User clicks → Account activated → Redirects to login

---

### Email/Password Login

**As a registered user, I want to log in with my email/password so I can access my collection.**

**Flow:**
1. User submits login form (email, password)
2. Supabase Auth validates credentials
3. If valid: Issue JWT access token + refresh token
4. Tokens stored in httpOnly cookies (secure, SameSite=Strict)
5. Redirect to dashboard

**API Endpoint:**
```typescript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "mtg_player"
  },
  "session": {
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "expires_at": 1672531200
  }
}
```

**Implementation:**
```typescript
async function login(req, reply) {
  const { email, password } = req.body

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return reply.code(401).send({ error: 'Invalid credentials' })
  }

  // Set httpOnly cookies (secure)
  reply.setCookie('access_token', data.session.access_token, {
    httpOnly: true,
    secure: true,  // HTTPS only
    sameSite: 'strict',
    maxAge: 3600  // 1 hour
  })

  reply.setCookie('refresh_token', data.session.refresh_token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 604800  // 7 days
  })

  return { user: data.user, session: data.session }
}
```

**Security Measures:**
- Rate limiting: 5 failed attempts → 15 minute lockout
- Password hashing: bcrypt (Supabase handles this)
- Tokens in httpOnly cookies (prevents XSS attacks)
- HTTPS enforced in production

---

### OAuth Providers

**As a user, I want to log in with Google/GitHub so I can skip password management.**

**Supported Providers:**
1. **Google** (primary, most users)
2. **GitHub** (developer-friendly)
3. **Future:** Discord, Apple (if demand)

**OAuth Flow:**
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth consent screen
3. User approves → Google redirects to callback URL
4. Supabase exchanges code for tokens
5. User account created (if new) or logged in (if existing)
6. UserPreferences created for new accounts
7. Redirect to dashboard

**API Endpoint:**
```typescript
GET /api/auth/oauth/google
// Initiates OAuth flow, redirects to Google

GET /api/auth/callback?code=...
// Supabase handles callback, exchanges code for session
```

**Implementation:**
```typescript
// Initiate OAuth
async function oauthGoogle(req, reply) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://app.decksmith.com/auth/callback'
    }
  })

  if (error) {
    return reply.code(500).send({ error: error.message })
  }

  // Redirect to Google consent screen
  return reply.redirect(data.url)
}

// Handle callback
async function oauthCallback(req, reply) {
  const { code } = req.query

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return reply.redirect('/login?error=oauth_failed')
  }

  // Check if new user (create UserPreferences if needed)
  const existingPrefs = await prisma.userPreferences.findUnique({
    where: { userId: data.user.id }
  })

  if (!existingPrefs) {
    await prisma.userPreferences.create({
      data: {
        userId: data.user.id,
        language: 'en',
        units: 'mm',
        defaultCurrency: 'usd',
        theme: 'system'
      }
    })
  }

  // Set session cookies
  reply.setCookie('access_token', data.session.access_token, { ... })
  reply.setCookie('refresh_token', data.session.refresh_token, { ... })

  return reply.redirect('/dashboard')
}
```

**Supabase Configuration:**
- Enable OAuth providers in Supabase dashboard
- Configure redirect URLs (allowlist)
- Set up Google/GitHub OAuth apps (client ID, secret)

---

### Password Reset

**As a user, I want to reset my password if I forgot it.**

**Flow:**
1. User clicks "Forgot password" on login page
2. Enters email address
3. Supabase sends password reset email
4. User clicks link in email → Redirects to reset form
5. User enters new password → Submit
6. Password updated → Auto-login

**API Endpoints:**
```typescript
POST /api/auth/forgot-password
{
  "email": "user@example.com"
}

// Response
{
  "message": "Password reset email sent. Check your inbox."
}

---

POST /api/auth/reset-password
{
  "token": "reset_token_from_email",
  "new_password": "NewSecurePass456"
}

// Response
{
  "message": "Password updated successfully."
}
```

**Implementation:**
```typescript
async function forgotPassword(req, reply) {
  const { email } = req.body

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://app.decksmith.com/auth/reset-password'
  })

  if (error) {
    // Don't reveal if email exists (security best practice)
    // Always return success message
  }

  return { message: 'Password reset email sent. Check your inbox.' }
}

async function resetPassword(req, reply) {
  const { token, new_password } = req.body

  // Verify token and update password
  const { error } = await supabase.auth.updateUser({
    password: new_password
  })

  if (error) {
    return reply.code(400).send({ error: 'Invalid or expired token' })
  }

  return { message: 'Password updated successfully.' }
}
```

**Business Rules:**
- Reset tokens expire after 1 hour
- Old passwords cannot be reused (Supabase tracks last 5 passwords)
- Rate limiting: Max 3 reset requests per hour per email

---

### Session Management

**As a user, I want to stay logged in so I don't have to re-authenticate constantly.**

**Token Lifecycle:**
- **Access token:** 1 hour expiry (JWT)
- **Refresh token:** 7 days expiry (JWT)
- **Automatic refresh:** Client refreshes access token using refresh token before expiry

**Session Refresh Flow:**
1. Client detects access token expiring soon (< 5 minutes remaining)
2. Sends refresh token to `/api/auth/refresh`
3. Supabase issues new access token (and optionally new refresh token)
4. Client updates cookies

**API Endpoint:**
```typescript
POST /api/auth/refresh
{
  "refresh_token": "jwt..."
}

// Response
{
  "access_token": "new_jwt...",
  "refresh_token": "new_jwt...",  // optional
  "expires_at": 1672531200
}
```

**Implementation:**
```typescript
async function refreshSession(req, reply) {
  const { refresh_token } = req.cookies

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token
  })

  if (error) {
    return reply.code(401).send({ error: 'Session expired. Please log in.' })
  }

  // Update cookies
  reply.setCookie('access_token', data.session.access_token, { ... })
  reply.setCookie('refresh_token', data.session.refresh_token, { ... })

  return { access_token: data.session.access_token }
}
```

**Frontend Integration:**
```typescript
// apps/web/src/lib/auth.ts
import { useQuery } from '@tanstack/react-query'

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session', {
        credentials: 'include'  // send cookies
      })
      return res.json()
    },
    refetchInterval: 1000 * 60 * 50,  // refresh every 50 minutes
    staleTime: 1000 * 60 * 60  // 1 hour
  })
}
```

---

### Logout

**As a user, I want to log out to secure my account on shared devices.**

**Flow:**
1. User clicks "Logout"
2. Client sends logout request
3. Server revokes session (Supabase invalidates tokens)
4. Clear cookies
5. Redirect to login page

**API Endpoint:**
```typescript
POST /api/auth/logout

// Response
{
  "message": "Logged out successfully."
}
```

**Implementation:**
```typescript
async function logout(req, reply) {
  const { access_token } = req.cookies

  // Revoke session on Supabase side
  await supabase.auth.signOut()

  // Clear cookies
  reply.clearCookie('access_token')
  reply.clearCookie('refresh_token')

  return { message: 'Logged out successfully.' }
}
```

---

## Row-Level Security (RLS)

**Database-level access control using Postgres RLS policies.**

### RLS Policies

**1. CollectionEntries (Users can only access their own cards)**
```sql
-- Enable RLS
ALTER TABLE collection_entries ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own entries
CREATE POLICY select_own_collection ON collection_entries
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own entries
CREATE POLICY insert_own_collection ON collection_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own entries
CREATE POLICY update_own_collection ON collection_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can DELETE their own entries
CREATE POLICY delete_own_collection ON collection_entries
  FOR DELETE
  USING (auth.uid() = user_id);
```

**2. Decks (Users own decks, public decks readable by all)**
```sql
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;

-- SELECT: Own decks OR public decks
CREATE POLICY select_decks ON decks
  FOR SELECT
  USING (
    auth.uid() = user_id OR is_public = true
  );

-- INSERT: Can only create own decks
CREATE POLICY insert_own_decks ON decks
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- UPDATE: Can only update own decks
CREATE POLICY update_own_decks ON decks
  FOR UPDATE
  USING (auth.uid() = user_id);

-- DELETE: Can only delete own decks
CREATE POLICY delete_own_decks ON decks
  FOR DELETE
  USING (auth.uid() = user_id);
```

**3. Tags (Users can only access their own tags)**
```sql
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_tags ON tags
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY insert_own_tags ON tags
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_own_tags ON tags
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY delete_own_tags ON tags
  FOR DELETE
  USING (auth.uid() = user_id);
```

**4. UserPreferences (1:1 with user)**
```sql
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY select_own_preferences ON user_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY update_own_preferences ON user_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);
```

**5. Public Tables (No RLS needed)**
- `cards`: Public read-only (Scryfall cache)
- `card_prints`: Public read-only
- `craft_guide_articles`: Public read-only

---

## API Security

### Authentication Middleware

**Fastify plugin to verify JWT tokens on protected routes.**

```typescript
// apps/api/src/plugins/auth.ts
import { FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { supabase } from '@decksmith/db'

const authPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.decorate('authenticate', async (req, reply) => {
    const token = req.cookies.access_token

    if (!token) {
      return reply.code(401).send({ error: 'Unauthorized' })
    }

    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) {
      return reply.code(401).send({ error: 'Invalid token' })
    }

    // Attach user to request
    req.user = data.user
  })
}

export default fp(authPlugin)
```

**Usage in routes:**
```typescript
// apps/api/src/routes/collection.ts
fastify.get('/api/collection', {
  preHandler: [fastify.authenticate]
}, async (req, reply) => {
  const userId = req.user.id

  const entries = await prisma.collectionEntry.findMany({
    where: { userId }
  })

  return { data: entries }
})
```

---

### Rate Limiting

**Prevent brute-force attacks and API abuse.**

```typescript
// apps/api/src/plugins/rate-limit.ts
import rateLimit from '@fastify/rate-limit'

fastify.register(rateLimit, {
  max: 100,  // 100 requests
  timeWindow: '1 minute',  // per minute
  cache: 10000,  // cache 10k users
  allowList: ['127.0.0.1'],  // whitelist localhost
  redis: redisClient,  // use Redis for distributed rate limiting
  keyGenerator: (req) => req.user?.id || req.ip  // rate limit per user
})

// Stricter limit for auth endpoints
fastify.register(rateLimit, {
  max: 5,
  timeWindow: '15 minutes'
}, { prefix: '/api/auth/login' })
```

**Business Rules:**
- Login: 5 attempts per 15 minutes
- Registration: 3 accounts per hour per IP
- Password reset: 3 requests per hour per email
- General API: 100 requests per minute per user

---

### CORS Configuration

**Allow web app origin only (security best practice).**

```typescript
// apps/api/src/index.ts
import cors from '@fastify/cors'

fastify.register(cors, {
  origin: [
    'https://app.decksmith.com',  // production
    'http://localhost:5173'  // development
  ],
  credentials: true,  // allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE']
})
```

---

## Business Rules

1. **Email confirmation required** for email/password signups (prevent spam)
2. **OAuth auto-confirms** accounts (trusted providers)
3. **Passwords never stored plaintext** (bcrypt via Supabase)
4. **Tokens in httpOnly cookies** (XSS protection)
5. **Refresh tokens rotate** on use (security best practice)
6. **Sessions expire after 7 days** of inactivity (auto-logout)
7. **RLS enforced** for all user-owned data (defense in depth)
8. **Rate limiting** on all auth endpoints (brute-force protection)
9. **UserPreferences auto-created** on signup (with sensible defaults)
10. **Public decks readable by anonymous users** (no auth required for sharing)

---

## User Roles (Future Feature)

**For MVP:** Single role (authenticated user), no admin panel.

**Future expansion:**
- **Admin:** Manage craft guide articles, moderate user content
- **Pro:** Unlimited PDF generation, priority queue, ultra DPI
- **Free:** 10 PDFs/month, standard features

**RLS policy example (with roles):**
```sql
CREATE POLICY admin_manage_articles ON craft_guide_articles
  FOR ALL
  USING (
    auth.jwt() ->> 'role' = 'admin'
  );
```

---

## UI Patterns

### Login Page

```
┌─────────────────────────────────┐
│ Decksmith                       │
│                                 │
│ ┌───────────────────────────┐  │
│ │ Email                     │  │
│ │ [                       ] │  │
│ └───────────────────────────┘  │
│ ┌───────────────────────────┐  │
│ │ Password                  │  │
│ │ [                       ] │  │
│ └───────────────────────────┘  │
│                                 │
│ [Forgot password?]              │
│                                 │
│ [         Login          ]      │
│                                 │
│ ────── OR ──────                │
│                                 │
│ [ Sign in with Google  ]        │
│ [ Sign in with GitHub  ]        │
│                                 │
│ Don't have an account?          │
│ [Sign up]                       │
└─────────────────────────────────┘
```

---

### Registration Page

```
┌─────────────────────────────────┐
│ Create Account                  │
│                                 │
│ ┌───────────────────────────┐  │
│ │ Email                     │  │
│ │ [                       ] │  │
│ └───────────────────────────┘  │
│ ┌───────────────────────────┐  │
│ │ Username (optional)       │  │
│ │ [                       ] │  │
│ └───────────────────────────┘  │
│ ┌───────────────────────────┐  │
│ │ Password                  │  │
│ │ [                       ] │  │
│ └───────────────────────────┘  │
│                                 │
│ Password must:                  │
│ ✓ Be at least 8 characters      │
│ ✓ Include uppercase letter      │
│ ✓ Include number                │
│                                 │
│ [      Create Account      ]    │
│                                 │
│ ────── OR ──────                │
│                                 │
│ [ Sign up with Google  ]        │
│ [ Sign up with GitHub  ]        │
│                                 │
│ Already have an account?        │
│ [Log in]                        │
└─────────────────────────────────┘
```

---

### Email Confirmation

**Email Template:**
```
Subject: Confirm your Decksmith account

Hi there!

Thanks for signing up for Decksmith. Click the link below to confirm your email:

[Confirm Email]

This link expires in 24 hours.

If you didn't create an account, you can safely ignore this email.

---
Decksmith Team
```

**Confirmation Success Page:**
```
┌─────────────────────────────────┐
│ ✓ Email Confirmed!              │
│                                 │
│ Your account is now active.     │
│ Redirecting to login...         │
└─────────────────────────────────┘
```

---

## Related Specs

- [Data Model](./data-model.md) — User, UserPreferences schemas
- [User Preferences](./user-preferences.md) — Settings created on signup
- [Collection](./collection.md) — RLS policies for collection access
- [Deck Management](./deck-management.md) — Public deck sharing permissions
