export interface GithubIssue {
  url: string;
  repository_url: string;
  html_url: string;
  id: number;
  node_id: string;
  number: number;
  title: string;
  user: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
  labels: {
    id: number;
    node_id: string;
    url: string;
    name: string;
    color: string;
    default: boolean;
    description: string;
  }[];
  state: string;
  locked: boolean;
  assignee: any;
  assignees: any[];
  milestone: any;
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: string;
  author_association: string;
  active_lock_reason: any;
  body: string;
  reactions: any;
  timeline_url: string;
  performed_via_github_app: any;
  state_reason: any;
  pull_request?: any;
}

export async function fetchGithubIssue(owner: string, repo: string, issueNumber: string): Promise<GithubIssue> {
  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      // We do not include an Authorization header to keep it client-safe and strictly for public repos,
      // unless we allow the user to provide a PAT for private repos.
    },
    // We add cache control so users get fresh issue details when they re-analyze
    cache: 'no-store'
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('Issue or repository not found, or it is private.');
    }
    if (res.status === 403) {
      throw new Error('Rate limit exceeded or access forbidden.');
    }
    throw new Error(`Failed to fetch issue: ${res.statusText}`);
  }

  const data: GithubIssue = await res.json();
  
  if (data.pull_request) {
    throw new Error('This is a pull request, not an issue.');
  }

  return data;
}

export function parseGithubUrl(url: string): { owner: string, repo: string, issueNumber: string } | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length >= 4 && parts[2] === 'issues') {
      return {
        owner: parts[0],
        repo: parts[1],
        issueNumber: parts[3]
      };
    }
    return null;
  } catch {
    return null;
  }
}
