export const AUTH_TOKEN_KEY = 'auth_token';

export const HTTP_STATUS = {
  UNAUTHORIZED: 401,
  UNPROCESSABLE: 422,
  FORBIDDEN: 403,
  NO_CONTENT: 204,
} as const;

export const BATCH_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;
