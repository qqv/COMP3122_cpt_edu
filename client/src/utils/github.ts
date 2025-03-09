export const getGithubAvatarUrl = (githubId: string | undefined) => 
  githubId ? `https://avatars.githubusercontent.com/${githubId}` : '/default-avatar.png'