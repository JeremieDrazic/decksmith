import type { AuthUser } from '@decksmith/db';
import type { RegisterResponse } from '@decksmith/schema/auth';

/**
 * Maps a newly created Supabase auth user to the register response DTO.
 *
 * Only exposes id + email — the account is pending confirmation,
 * no profile data exists yet.
 *
 * @param user - The Supabase AuthUser returned by signUp
 * @returns Minimal register response with next-step message
 */
export function toRegisterResponse(user: AuthUser): RegisterResponse {
  return {
    user: {
      id: user.id,
      email: user.email ?? '',
    },
    message: 'Confirmation email sent. Please check your inbox.',
  };
}
