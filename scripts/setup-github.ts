import { getUncachableGitHubClient } from '../server/github-client';

async function setupGitHubRepo() {
  try {
    console.log('🔧 Setting up GitHub repository...');
    
    const octokit = await getUncachableGitHubClient();
    
    // Get the authenticated user
    const { data: user } = await octokit.users.getAuthenticated();
    console.log(`✅ Authenticated as: ${user.login}`);
    
    // Create a new public repository
    const repoName = 'fittrack-habit-exercise-tracker';
    console.log(`📦 Creating repository: ${repoName}...`);
    
    const { data: repo } = await octokit.repos.createForAuthenticatedUser({
      name: repoName,
      description: 'A comprehensive habit and exercise tracker with workout logging, streak tracking, and progress visualization',
      private: false,
      auto_init: false,
    });
    
    console.log(`✅ Repository created: ${repo.html_url}`);
    console.log(`🌐 Clone URL: ${repo.clone_url}`);
    
    return {
      repoUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      owner: user.login,
      repoName: repoName,
    };
  } catch (error: any) {
    if (error.status === 422 && error.message.includes('already exists')) {
      console.log('⚠️  Repository already exists. Using existing repository.');
      const octokit = await getUncachableGitHubClient();
      const { data: user } = await octokit.users.getAuthenticated();
      const repoName = 'fittrack-habit-exercise-tracker';
      return {
        repoUrl: `https://github.com/${user.login}/${repoName}`,
        cloneUrl: `https://github.com/${user.login}/${repoName}.git`,
        owner: user.login,
        repoName: repoName,
      };
    }
    throw error;
  }
}

setupGitHubRepo()
  .then((result) => {
    console.log('\n✨ GitHub setup complete!');
    console.log(`Repository: ${result.repoUrl}`);
  })
  .catch((error) => {
    console.error('❌ Error setting up GitHub:', error.message);
    process.exit(1);
  });
