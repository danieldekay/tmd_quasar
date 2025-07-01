export interface JwtPayload {
  exp?: number;
  [key: string]: unknown;
}

/**
 * Decode a JWT without verifying signature.
 * WARNING: Do NOT use the decoded data for security-critical decisions.
 */
export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]!));
    return payload as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Extract expiration time (ms since epoch) from a JWT.
 */
export const getJwtExpiration = (token: string): number | null => {
  const payload = decodeJwt(token);
  if (payload?.exp && typeof payload.exp === 'number') {
    return payload.exp * 1000; // convert seconds -> ms
  }
  return null;
};
