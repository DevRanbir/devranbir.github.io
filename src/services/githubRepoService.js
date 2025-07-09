// GitHub Repository Service for fetching user repositories
class GitHubRepoService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.token = process.env.REACT_APP_GITHUB_TOKEN;
  }

  // Get authorization headers
  getHeaders() {
    const headers = {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }
    
    return headers;
  }

  // Fetch user repositories
  async getUserRepositories(username, options = {}) {
    try {
      const {
        type = 'owner', // 'all', 'owner', 'member'
        sort = 'updated', // 'created', 'updated', 'pushed', 'full_name'
        direction = 'desc', // 'asc', 'desc'
        per_page = 100, // max 100
        page = 1
      } = options;

      const params = new URLSearchParams({
        type,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const url = `${this.baseURL}/users/${username}/repos?${params}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`User not found: ${username}`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user repositories:', error);
      throw error;
    }
  }

  // Fetch authenticated user's repositories
  async getMyRepositories(options = {}) {
    try {
      const {
        visibility = 'all', // 'all', 'public', 'private'
        affiliation = 'owner', // 'owner', 'collaborator', 'organization_member'
        type = 'owner', // 'all', 'owner', 'public', 'private', 'member'
        sort = 'updated', // 'created', 'updated', 'pushed', 'full_name'
        direction = 'desc', // 'asc', 'desc'
        per_page = 100, // max 100
        page = 1
      } = options;

      const params = new URLSearchParams({
        visibility,
        affiliation,
        type,
        sort,
        direction,
        per_page: per_page.toString(),
        page: page.toString()
      });

      const url = `${this.baseURL}/user/repos?${params}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Unauthorized: Please check your GitHub token');
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my repositories:', error);
      throw error;
    }
  }

  // Convert GitHub repository to project format
  convertRepoToProject(repo) {
    // Determine project type based on language and topics
    const projectType = this.determineProjectType(repo.language, repo.topics || []);
    
    return {
      id: `github-${repo.id}`, // Prefix with 'github-' to identify GitHub repos
      name: repo.name,
      type: projectType,
      repoUrl: repo.html_url,
      liveUrl: repo.homepage || '', // GitHub Pages or custom homepage
      description: repo.description || '',
      dateAdded: repo.created_at ? new Date(repo.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      isFromGitHub: true, // Flag to identify GitHub-sourced projects
      githubData: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        updated_at: repo.updated_at,
        size: repo.size,
        default_branch: repo.default_branch,
        is_private: repo.private,
        is_fork: repo.fork
      }
    };
  }

  // Determine project type based on language and topics
  determineProjectType(language, topics) {
    // Check topics first for more specific categorization
    const topicSet = new Set(topics.map(topic => topic.toLowerCase()));
    
    if (topicSet.has('react') || topicSet.has('vue') || topicSet.has('angular') || 
        topicSet.has('web') || topicSet.has('frontend') || topicSet.has('website')) {
      return 'web';
    }
    
    if (topicSet.has('mobile') || topicSet.has('android') || topicSet.has('ios') || 
        topicSet.has('react-native') || topicSet.has('flutter')) {
      return 'mobile';
    }
    
    if (topicSet.has('desktop') || topicSet.has('electron') || topicSet.has('gui')) {
      return 'desktop';
    }
    
    if (topicSet.has('ai') || topicSet.has('ml') || topicSet.has('machine-learning') || 
        topicSet.has('deep-learning') || topicSet.has('neural-network') || 
        topicSet.has('tensorflow') || topicSet.has('pytorch')) {
      return 'ai';
    }
    
    if (topicSet.has('blockchain') || topicSet.has('cryptocurrency') || 
        topicSet.has('bitcoin') || topicSet.has('ethereum') || topicSet.has('web3')) {
      return 'blockchain';
    }
    
    // Fall back to language-based detection
    if (language) {
      const lang = language.toLowerCase();
      
      if (lang === 'javascript' || lang === 'typescript' || lang === 'html' || 
          lang === 'css' || lang === 'scss' || lang === 'vue' || lang === 'svelte') {
        return 'web';
      }
      
      if (lang === 'swift' || lang === 'kotlin' || lang === 'java' || lang === 'dart') {
        return 'mobile';
      }
      
      if (lang === 'c++' || lang === 'c#' || lang === 'c' || lang === 'rust' || 
          lang === 'go' || lang === 'java') {
        return 'desktop';
      }
      
      if (lang === 'python' || lang === 'r' || lang === 'jupyter notebook') {
        return 'ai';
      }
      
      if (lang === 'solidity') {
        return 'blockchain';
      }
    }
    
    // Default to web if unable to determine
    return 'web';
  }

  // Fetch repositories and convert to project format
  async getRepositoriesAsProjects(username = null, options = {}) {
    try {
      let repos;
      
      if (username) {
        repos = await this.getUserRepositories(username, options);
      } else {
        repos = await this.getMyRepositories(options);
      }
      
      // Filter options
      const {
        excludeForks = true,
        excludePrivate = false,
        minStars = 0,
        excludeTopics = [],
        includeTopics = []
      } = options;
      
      let filteredRepos = repos;
      
      if (excludeForks) {
        filteredRepos = filteredRepos.filter(repo => !repo.fork);
      }
      
      if (excludePrivate) {
        filteredRepos = filteredRepos.filter(repo => !repo.private);
      }
      
      if (minStars > 0) {
        filteredRepos = filteredRepos.filter(repo => repo.stargazers_count >= minStars);
      }
      
      if (excludeTopics.length > 0) {
        filteredRepos = filteredRepos.filter(repo => {
          const repoTopics = repo.topics || [];
          return !excludeTopics.some(topic => repoTopics.includes(topic));
        });
      }
      
      if (includeTopics.length > 0) {
        filteredRepos = filteredRepos.filter(repo => {
          const repoTopics = repo.topics || [];
          return includeTopics.some(topic => repoTopics.includes(topic));
        });
      }
      
      // Convert to project format
      return filteredRepos.map(repo => this.convertRepoToProject(repo));
    } catch (error) {
      console.error('Error fetching repositories as projects:', error);
      throw error;
    }
  }

  // Check if token is configured
  isTokenConfigured() {
    return !!this.token;
  }

  // Get rate limit information
  async getRateLimit() {
    try {
      const url = `${this.baseURL}/rate_limit`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching rate limit:', error);
      throw error;
    }
  }
}

const githubRepoService = new GitHubRepoService();
export default githubRepoService;
