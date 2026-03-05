// Define type for Octokit error responses
export interface OctokitError extends Error {
  response?: {
    data?: unknown;
    status?: number;
  };
}

// Type for GitHub team member
export interface GitHubTeamMember {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  url: string;
  html_url: string;
  type: string;
}

// Type for GitHub team
export interface GitHubTeam {
  id: number;
  node_id: string;
  name: string;
  slug: string;
  description: string | null;
  privacy: string;
  url: string;
  html_url: string;
  members_url: string;
  repositories_url: string;
  permission: string;
  parent?: GitHubTeam;
}

// Type for seat assignment
export interface GitHubSeatAssignment {
  seats_breakdown: {
    total: number;
    added_this_cycle: number;
    pending_cancellation: number;
    pending_invitation: number;
    active_this_cycle: number;
    inactive_this_cycle: number;
  };
  assigned_seats: Array<{
    assignee_type: string;
    assignee: {
      id: number;
      login: string;
    };
    assigned_by: {
      id: number;
      login: string;
    };
    created_at: string;
  }>;
}
