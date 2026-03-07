import { NextResponse } from 'next/server';
import {
  SESSION_COOKIE_NAME,
  SESSION_DURATION_SECONDS,
  generateSessionToken,
  isAccessCodeConfigured,
  verifyPasscode,
} from '@/lib/auth';

interface VerifyRequestBody {
  passcode: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as VerifyRequestBody;
    const { passcode } = body;

    if (!passcode || typeof passcode !== 'string') {
      return NextResponse.json({ error: '请输入访问码' }, { status: 400 });
    }

    if (!isAccessCodeConfigured()) {
      return NextResponse.json({ error: '服务端未配置访问码' }, { status: 500 });
    }

    if (!verifyPasscode(passcode)) {
      return NextResponse.json({ error: '访问码错误' }, { status: 403 });
    }

    const token = generateSessionToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });
    response.headers.set('Cache-Control', 'no-store');

    return response;
  } catch {
    return NextResponse.json({ error: '请求格式错误' }, { status: 400 });
  }
}
