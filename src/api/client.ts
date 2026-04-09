import { AUTH_TOKEN_KEY, HTTP_STATUS, SUBSCRIPTION_ERROR_CODES } from '@/constants/api';
import { fireSubscriptionBlocked, fireSubscriptionUnavailable } from '@/utils/subscriptionEvents';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

function getToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

export { ApiError };

export function isSubscriptionError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  const body = error.body as Record<string, unknown> | undefined;
  const code = body?.error_code as string | undefined;
  if (!code) return false;
  return (
    (SUBSCRIPTION_ERROR_CODES as readonly string[]).includes(code) ||
    code === 'license_unavailable'
  );
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets it with boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === HTTP_STATUS.UNAUTHORIZED) {
    clearToken();
    window.location.href = '/login';
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, { message: 'No autorizado' });
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: 'Error desconocido' }));

    // Subscription blocked (403 with license error code)
    if (
      res.status === HTTP_STATUS.FORBIDDEN &&
      body?.error_code &&
      (SUBSCRIPTION_ERROR_CODES as readonly string[]).includes(body.error_code)
    ) {
      fireSubscriptionBlocked(body.error_code, body.message);
      throw new ApiError(res.status, body);
    }

    // Subscription Manager unavailable (503)
    if (
      res.status === HTTP_STATUS.SERVICE_UNAVAILABLE &&
      body?.error_code === 'license_unavailable'
    ) {
      fireSubscriptionUnavailable(
        body.message || 'El sistema de suscripciones no está disponible. Intenta de nuevo en unos minutos.',
      );
      throw new ApiError(res.status, body);
    }

    throw new ApiError(res.status, body);
  }

  if (res.status === HTTP_STATUS.NO_CONTENT) return undefined as T;
  return res.json();
}

export const api = {
  get: <T>(url: string) => request<T>(url),
  post: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),
  put: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  patch: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
  delete: <T>(url: string, data?: unknown) =>
    request<T>(url, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }),
};
