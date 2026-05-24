import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  const data = error.response?.data as
    | { message?: string; errors?: string[] | Record<string, string[]> }
    | undefined;

  if (data?.message) return data.message;

  if (Array.isArray(data?.errors) && data.errors.length > 0) {
    return data.errors.join('; ');
  }

  if (data?.errors && typeof data.errors === 'object') {
    const parts = Object.entries(data.errors).flatMap(([key, msgs]) =>
      (msgs as string[]).map((m) => `${key}: ${m}`)
    );
    if (parts.length > 0) return parts.join('; ');
  }

  if (error.response?.status === 401) return 'Invalid email or password';
  if (error.response?.status === 400) return 'Invalid data sent to the server';

  return fallback;
}
