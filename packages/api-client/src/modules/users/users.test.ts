import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createFetcher } from '../../fetcher/fetcher.js';
import { createUsersModule } from './users.js';

const BASE_URL = 'http://localhost:3000';
const users = createUsersModule(createFetcher(BASE_URL));

const USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

const mockUser = {
  id: USER_ID,
  email: 'user@example.com',
  username: 'testuser',
  displayName: 'Test User',
  avatarUrl: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('users.getUser', () => {
  it('fetches the user at the correct path', async () => {
    server.use(http.get(`${BASE_URL}/api/v1/users/${USER_ID}`, () => HttpResponse.json(mockUser)));

    const result = await users.getUser(USER_ID);

    expect(result).toEqual(mockUser);
  });
});

describe('users.updateUser', () => {
  it('sends a PATCH with the input body and returns the updated user', async () => {
    let receivedBody: unknown;

    server.use(
      http.patch(`${BASE_URL}/api/v1/users/${USER_ID}`, async ({ request }) => {
        receivedBody = await request.json();
        return HttpResponse.json({ ...mockUser, displayName: 'New Name' });
      })
    );

    const result = await users.updateUser(USER_ID, { displayName: 'New Name' });

    expect(receivedBody).toEqual({ displayName: 'New Name' });
    expect(result.displayName).toBe('New Name');
  });
});

describe('users.getUserPreferences', () => {
  it('fetches preferences at the correct sub-path', async () => {
    const mockPrefs = {
      id: 'pref-id',
      userId: USER_ID,
      language: 'en',
      units: 'mm',
      currency: 'usd',
      theme: 'dark',
      defaultPrintSelection: 'latest',
      collectionViewConfig: {
        defaultView: 'grid',
        cardSize: 'medium',
        showPrices: true,
        showCondition: true,
      },
      notificationPreferences: { priceAlerts: false, pdfReady: true },
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    server.use(
      http.get(`${BASE_URL}/api/v1/users/${USER_ID}/preferences`, () =>
        HttpResponse.json(mockPrefs)
      )
    );

    const result = await users.getUserPreferences(USER_ID);

    expect(result.userId).toBe(USER_ID);
    expect(result.theme).toBe('dark');
  });
});
