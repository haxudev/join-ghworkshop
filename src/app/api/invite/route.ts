import { NextResponse } from "next/server";
import { createOctokit, inviteTeamMember, getTeamByName, listTeamMembers } from "@/lib/github";

interface InviteRequestBody {
  username: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as InviteRequestBody;
    const { username } = body;
    
    if (!username) {
      return NextResponse.json({ error: "用户名是必须的" }, { status: 400 });
    }

    // 获取环境变量
    const orgName = process.env.GITHUB_ORG_NAME;
    const teamName = process.env.GITHUB_TEAM_NAME;
    
    if (!orgName || !teamName) {
      return NextResponse.json({ error: "环境变量未正确配置" }, { status: 500 });
    }
    
    // 创建 Octokit 实例
    const octokit = createOctokit();

    try {
      // 获取团队信息
      const team = await getTeamByName(octokit, orgName, teamName);
      
      // 邀请用户加入团队
      try {
        await inviteTeamMember(octokit, orgName, team.slug, username);
      } catch (error: unknown) {
        console.error("邀请用户失败:", error);
        let errorMessage = '邀请用户失败';
        if ((error as any).response?.data?.message) {
          errorMessage = (error as any).response.data.message;
        }
        return NextResponse.json({ error: errorMessage }, { status: 500 });
      }

      // 获取团队成员列表
      try {
        const members = await listTeamMembers(octokit, orgName, team.slug);
        console.log(`团队 ${teamName} 的成员:`, members.map((m: any) => m.login));
      } catch (error) {
        console.error("获取团队成员失败:", error);
        // 获取成员失败不应阻止成功的邀请响应
      }

      return NextResponse.json({ 
        success: true,
        message: `成功邀请 ${username} 加入团队 ${teamName}`
      });

    } catch (error: unknown) {
      console.error("GitHub API 错误:", error);
      let errorMessage = '操作失败';
      if ((error as any).response?.data?.message) {
        errorMessage = (error as any).response.data.message;
      } else if ((error as any).message) {
        errorMessage = (error as any).message;
      }
      return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
  } catch (error) {
    console.error("服务器错误:", error);
    return NextResponse.json({ error: "服务器内部错误" }, { status: 500 });
  }
}