import type { RegisterResponse } from '@decksmith/schema/auth';

/**
 * Maps a newly created user identity to the register response DTO.
 *
 * @param user - Minimal identity returned by the auth service (id + email)
 * @returns Register response with next-step message
 */
export function toRegisterResponse(user: { id: string; email: string }): RegisterResponse {
  return {
    user: {
      id: user.id,
      email: user.email,
    },
    message: 'Confirmation email sent. Please check your inbox.',
  };
}
