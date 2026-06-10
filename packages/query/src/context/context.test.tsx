import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ApiClientProvider, useApiClient } from './context.js';

const mockClient = {
  auth: {
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
    refresh: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
  },
  users: {
    getUser: vi.fn(),
    updateUser: vi.fn(),
    getUserPreferences: vi.fn(),
    updateUserPreferences: vi.fn(),
  },
};

describe('useApiClient', () => {
  it('returns the client provided by ApiClientProvider', () => {
    const { result } = renderHook(() => useApiClient(), {
      wrapper: ({ children }) => (
        <ApiClientProvider client={mockClient}>{children}</ApiClientProvider>
      ),
    });

    expect(result.current).toBe(mockClient);
  });

  it('throws when called outside of ApiClientProvider', () => {
    expect(() => renderHook(() => useApiClient())).toThrow(
      'useApiClient must be used within an <ApiClientProvider>'
    );
  });
});
