// GitHub API service for fetching repository data
class GitHubAPIService {
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

  // Fetch repository contents
  async getRepositoryContents(owner, repo, path = '', branch = 'main') {
    try {
      const url = `${this.baseURL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Repository or path not found: ${owner}/${repo}/${path}`);
        }
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository contents:', error);
      throw error;
    }
  }

  // Fetch repository branches
  async getRepositoryBranches(owner, repo) {
    try {
      const url = `${this.baseURL}/repos/${owner}/${repo}/branches`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch branches: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository branches:', error);
      throw error;
    }
  }

  // Fetch file content
  async getFileContent(owner, repo, path, branch = 'main') {
    try {
      const url = `${this.baseURL}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Decode base64 content
      if (data.content && data.encoding === 'base64') {
        data.decodedContent = atob(data.content);
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  // Get repository info
  async getRepositoryInfo(owner, repo) {
    try {
      const url = `${this.baseURL}/repos/${owner}/${repo}`;
      const response = await fetch(url, {
        headers: this.getHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Repository not found: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching repository info:', error);
      throw error;
    }
  }

  // Convert relative URLs in markdown to absolute GitHub URLs
  convertRelativeUrls(content, owner, repo, branch, currentPath) {
    const basePath = currentPath ? currentPath.split('/').slice(0, -1).join('/') : '';
    const baseUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${basePath}`;
    
    // Convert relative image URLs
    content = content.replace(
      /!\[([^\]]*)\]\((?!https?:\/\/)([^)]+)\)/g,
      `![$1](${baseUrl}/$2)`
    );
    
    // Convert relative links to GitHub blob URLs for better navigation
    content = content.replace(
      /\[([^\]]*)\]\((?!https?:\/\/)([^)]+\.md)\)/g,
      `[$1](https://github.com/${owner}/${repo}/blob/${branch}/${basePath}/$2)`
    );
    
    return content;
  }

  // Check if file is binary
  isBinaryFile(filename) {
    const binaryExtensions = [
      '.png', '.jpg', '.jpeg', '.gif', '.bmp', '.ico', '.svg',
      '.pdf', '.zip', '.tar', '.gz', '.exe', '.dmg', '.pkg',
      '.dll', '.so', '.dylib', '.class', '.jar', '.war'
    ];
    
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return binaryExtensions.includes(ext);
  }

  // Get file type for syntax highlighting
  getFileType(filename) {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    const typeMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.css': 'css',
      '.scss': 'scss',
      '.html': 'html',
      '.xml': 'xml',
      '.json': 'json',
      '.md': 'markdown',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.sh': 'bash',
      '.sql': 'sql',
      '.php': 'php',
      '.rb': 'ruby',
      '.go': 'go',
      '.rs': 'rust',
      '.swift': 'swift',
      '.kt': 'kotlin'
    };
    
    return typeMap[ext] || 'text';
  }
}

export default new GitHubAPIService();
