import { createHmac, timingSafeEqual } from 'crypto';

const SALT = 'join-ghworkshop-session-salt-v1';

function getAccessCode(): string {
  return process.env.ACCESS_CODE || '';
}

export function generateSessionToken(): string {
  const accessCode = getAccessCode();
  if (!accessCode) return '';
  return createHmac('sha256', accessCode + SALT)
    .update('authenticated-session')
    .digest('hex');
}

export function verifySessionToken(token: string): boolean {
  const expected = generateSessionToken();
  if (!expected || !token) return false;
  try {
    const a = Buffer.from(token, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyPasscode(passcode: string): boolean {
  const expected = getAccessCode();
  if (!expected || !passcode) return false;
  try {
    const a = Buffer.from(passcode, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
