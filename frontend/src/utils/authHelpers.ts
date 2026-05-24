import type { LoginResponse } from '../types';

/** Normalize API login payload (camelCase or PascalCase). */
export function normalizeLoginResponse(data: LoginResponse): LoginResponse {
  const raw = data as LoginResponse & { BusinessType?: string; BusinessName?: string };
  return {
    ...data,
    businessType: data.businessType ?? raw.BusinessType,
    businessName: data.businessName ?? raw.BusinessName,
  };
}
