import { NextResponse } from 'next/server';
import { createOctokit, getErrorMessage, listTeamMembers } from '@/lib/github';
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

  try {
    const octokit = createOctokit();
    const members = await listTeamMembers(octokit, orgName, teamName);
    return NextResponse.json(members);
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error, '获取团队成员列表失败');
    console.error('获取团队成员列表失败:', errorMessage);
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}