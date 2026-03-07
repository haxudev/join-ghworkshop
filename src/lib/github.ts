import { Octokit } from '@octokit/core';
import { 
  OctokitError, 
  GitHubTeamMember, 
  GitHubTeam, 
  GitHubSeatAssignment 
} from '../types/github';

function getOctokitResponseMessage(data: unknown): string | null {
  if (typeof data === 'string' && data.trim()) {
    return data;
  }

  if (data && typeof data === 'object') {
    const message = Reflect.get(data, 'message');
    if (typeof message === 'string' && message.trim()) {
      return message;
    }
  }

  return null;
}

export function getErrorMessage(error: unknown, fallback = 'Unknown error'): string {
  if (error instanceof Error) {
    const responseMessage = getOctokitResponseMessage(
      (error as OctokitError).response?.data
    );

    if (responseMessage) {
      return responseMessage;
    }

    return error.message || fallback;
  }

  const responseMessage = getOctokitResponseMessage(error);
  return responseMessage || fallback;
}

function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN?.trim();

  if (!token) {
    throw new Error('缺少环境变量 GITHUB_TOKEN');
  }

  return token;
}

// Create and configure Octokit instance
export function createOctokit() {
  return new Octokit({
    auth: getGitHubToken()
  });
}

// List GitHub team members
export async function listTeamMembers(octokit: Octokit, org: string, team: string): Promise<GitHubTeamMember[]> {
  try {
    const response = await octokit.request(`GET /orgs/${org}/teams/${team}/members`, {
      org: org,
      team_slug: team,
      per_page: 100,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.data as GitHubTeamMember[];
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('获取团队成员失败:', errorMessage);
    throw error;
  }
}

// Invite a user to the team
export async function inviteTeamMember(octokit: Octokit, orgName: string, teamName: string, username: string) {
  try {
    const response = await octokit.request(`PUT /orgs/${orgName}/teams/${teamName}/memberships/${username}`, {
      org: orgName,
      team_slug: teamName,
      username: username,
      role: 'member',
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    console.log('成功邀请团队成员:', response.data);
    return response.data;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('邀请团队成员失败:', errorMessage);
    throw error;
  }
}

// Get team by name
export async function getTeamByName(octokit: Octokit, orgName: string, teamName: string): Promise<GitHubTeam> {
  try {
    const teamsResponse = await octokit.request('GET /orgs/{org}/teams', {
      org: orgName
    });
    
    const team = teamsResponse.data.find(team => team.name === teamName) as GitHubTeam | undefined;
    if (!team) {
      throw new Error(`团队 ${teamName} 未找到`);
    }
    
    return team;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('获取团队信息失败:', errorMessage);
    throw error;
  }
}

// List seats assigned to the organization
export async function listAssignedSeats(octokit: Octokit, orgName: string): Promise<GitHubSeatAssignment> {
  try {
    const response = await octokit.request(`GET /orgs/${orgName}/copilot/billing/seats`, {
      org: orgName,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    });
    return response.data as GitHubSeatAssignment;
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error('获取席位分配失败:', errorMessage);
    throw error;
  }
}
