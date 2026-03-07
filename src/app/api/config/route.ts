import { NextResponse } from 'next/server';
import { hasValidSession } from '@/lib/auth';

export async function GET() {
  if (!(await hasValidSession())) {
    return NextResponse.json({ error: '未授权访问' }, { status: 401 });
  }

  const orgName = process.env.GITHUB_ORG_NAME;
  const teamName = process.env.GITHUB_TEAM_NAME;

  if (!orgName || !teamName) {
    return NextResponse.json(
      { error: '环境变量未正确配置' },
      { status: 500 }
    );
  }

  return NextResponse.json({ orgName, teamName });
}