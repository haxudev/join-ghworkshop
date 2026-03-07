import 'server-only';

import { cookies } from 'next/headers';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';

const SESSION_SALT = 'join-ghworkshop-session-salt-v2';

export const SESSION_COOKIE_NAME = 'session_token';
export const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getAccessCode(): string {
  return process.env.ACCESS_CODE?.trim() || '';
}

function getSessionSecret(): string {
  const configuredSecret = process.env.SESSION_SECRET?.trim();
  return configuredSecret || `${getAccessCode()}:${SESSION_SALT}`;
}

function signValue(value: string): string {
  return createHmac('sha256', getSessionSecret())
    .update(value)
    .digest('base64url');
}

function safeEqual(left: string, right: string): boolean {
  try {
    const a = Buffer.from(left, 'utf8');
    const b = Buffer.from(right, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function isAccessCodeConfigured(): boolean {
  return getAccessCode().length > 0;
}

export async function hasValidSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? '';
  return verifySessionToken(sessionToken);
}

export function generateSessionToken(): string {
  if (!isAccessCodeConfigured()) return '';

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_DURATION_SECONDS;
  const payload = Buffer.from(
    JSON.stringify({ expiresAt, nonce: randomUUID() }),
    'utf8'
  ).toString('base64url');

  return `${payload}.${signValue(payload)}`;
}

export function verifySessionToken(token: string): boolean {
  if (!token) return false;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;

  const expectedSignature = signValue(payload);
  if (!safeEqual(signature, expectedSignature)) return false;

  try {
    const rawPayload = Buffer.from(payload, 'base64url').toString('utf8');
    const parsed = JSON.parse(rawPayload) as { expiresAt?: number };
    if (typeof parsed.expiresAt !== 'number') return false;
    return parsed.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export function verifyPasscode(passcode: string): boolean {
  const expected = getAccessCode();
  if (!expected || !passcode) return false;
  return safeEqual(passcode.trim(), expected);
}
