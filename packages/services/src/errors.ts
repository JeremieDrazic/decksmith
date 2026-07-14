export class ServiceError extends Error {
  constructor(
    public readonly code: string,
    message?: string
  ) {
    super(message ?? code);
    this.name = 'ServiceError';
  }
}

/**
 * @returns true if `error` is a {@link ServiceError} thrown by a service function.
 */
export function isServiceError(error: unknown): error is ServiceError {
  return error instanceof ServiceError;
}
