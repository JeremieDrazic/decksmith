import { ApiError, type ApiErrorResponse } from '../errors/errors.js';

type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

type FetcherOptions = {
  method: HttpMethod;
  path: string;
  body?: unknown;
};

/**
 * Internal fetch wrapper. Not exported from the package.
 *
 * Returns a pre-configured async function that all module methods delegate to.
 * Centralises: base URL, cookie credentials, JSON serialisation, and error mapping.
 *
 * @param baseUrl - e.g. "http://localhost:3000"
 */
export function createFetcher(baseUrl: string) {
  return async function fetcher<T>(options: FetcherOptions): Promise<T> {
    const { method, path, body } = options;

    const headers: Record<string, string> = {};
    if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      // Always send cookies — auth tokens live in httpOnly cookies set by the API.
      // Without this flag the browser strips them on cross-origin requests.
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (response.ok) {
      // Intentional cast: we trust the API contract defined in packages/schema.
      // Re-running Zod.parse here would duplicate the server-side validation.
      return response.json() as Promise<T>;
    }

    let errorBody: ApiErrorResponse;
    try {
      errorBody = (await response.json()) as ApiErrorResponse;
    } catch {
      // The API returned a non-JSON body (e.g. Fastify's built-in 404 HTML page).
      // Map it to a generic REQUEST_ERROR so callers always deal with ApiError.
      errorBody = {
        statusCode: response.status,
        error: response.statusText,
        code: 'REQUEST_ERROR',
        message: `HTTP ${response.status}: ${response.statusText}`,
      };
    }
    throw new ApiError(errorBody);
  };
}

/** The type of the function returned by createFetcher — used internally by module factories. */
export type Fetcher = ReturnType<typeof createFetcher>;
