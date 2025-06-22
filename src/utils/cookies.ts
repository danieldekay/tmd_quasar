/**
 * Cookie utilities for JWT token storage
 * Uses secure, httpOnly-like settings for better security
 */

interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  httpOnly?: boolean;
}

const DEFAULT_OPTIONS: CookieOptions = {
  path: '/',
  secure: window.location.protocol === 'https:', // Only secure on HTTPS
  sameSite: 'lax', // Changed from 'strict' to 'lax' for better compatibility
  maxAge: 60 * 60, // 60 minutes in seconds
};

/**
 * Set a cookie with JWT token
 */
export const setCookie = (name: string, value: string, options: CookieOptions = {}): void => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (opts.expires) {
    cookieString += `; expires=${opts.expires.toUTCString()}`;
  }

  if (opts.maxAge) {
    cookieString += `; max-age=${opts.maxAge}`;
  }

  if (opts.path) {
    cookieString += `; path=${opts.path}`;
  }

  if (opts.domain) {
    cookieString += `; domain=${opts.domain}`;
  }

  if (opts.secure) {
    cookieString += '; secure';
  }

  if (opts.sameSite) {
    cookieString += `; samesite=${opts.sameSite}`;
  }

  // Note: httpOnly can only be set by server-side code
  // For client-side, we rely on other security measures

  document.cookie = cookieString;
};

/**
 * Get a cookie value
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = `${encodeURIComponent(name)}=`;
  const cookies = document.cookie.split(';');

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    if (!cookie) continue;

    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1, cookie.length);
    }
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length, cookie.length));
    }
  }

  return null;
};

/**
 * Delete a cookie
 */
export const deleteCookie = (name: string, options: CookieOptions = {}): void => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  setCookie(name, '', { ...opts, maxAge: -1 });
};

/**
 * JWT Token specific cookie functions
 */
export const JWT_COOKIE_NAME = 'tmd_jwt_token';
export const JWT_REFRESH_COOKIE_NAME = 'tmd_refresh_token';

export const setJWTToken = (token: string, rememberMe = false): void => {
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days vs 60 minutes
  setCookie(JWT_COOKIE_NAME, token, { maxAge });
};

export const getJWTToken = (): string | null => {
  return getCookie(JWT_COOKIE_NAME);
};

export const setRefreshToken = (token: string, rememberMe = false): void => {
  const maxAge = rememberMe ? 7 * 24 * 60 * 60 : 60 * 60; // 7 days vs 60 minutes
  setCookie(JWT_REFRESH_COOKIE_NAME, token, { maxAge });
};

export const getRefreshToken = (): string | null => {
  return getCookie(JWT_REFRESH_COOKIE_NAME);
};

export const clearJWTTokens = (): void => {
  deleteCookie(JWT_COOKIE_NAME);
  deleteCookie(JWT_REFRESH_COOKIE_NAME);
};

/**
 * Check if cookies are supported/enabled
 */
export const areCookiesEnabled = (): boolean => {
  try {
    setCookie('test_cookie', 'test');
    const value = getCookie('test_cookie');
    deleteCookie('test_cookie');
    return value === 'test';
  } catch {
    return false;
  }
};
