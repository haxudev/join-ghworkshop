import { NextResponse } from 'next/server';
import { createOctokit, listTeamMembers } from '@/lib/github';
import { hasValidSession } from '@/lib/auth';
import { OctokitError } from '../../../types/github';

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