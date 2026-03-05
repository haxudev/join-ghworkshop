import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createOctokit, listTeamMembers } from '@/lib/github';
import { OctokitError } from '../../../types/github';
import { verifySessionToken } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('session_token')?.value;
  if (!token || !verifySessionToken(token)) {
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

  try {
    const octokit = createOctokit();
    const members = await listTeamMembers(octokit, orgName, teamName);
    return NextResponse.json(members);
  } catch (error: unknown) {
  const errorMessage = error instanceof Error ? 
      (error as OctokitError).response?.data || error.message : 
      'Unknown error';
    console.error('获取团队成员列表失败:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}