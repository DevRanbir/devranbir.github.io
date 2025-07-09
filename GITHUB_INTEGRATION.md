# GitHub Integration Setup Instructions

## 1. Create a GitHub Personal Access Token

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Set the following scopes:
   - `repo` (to access your repositories)
   - `user:read` (to access your user information)
4. Copy the generated token

## 2. Configure Environment Variables

Add these to your `.env` file:

```
REACT_APP_GITHUB_TOKEN=your_github_personal_access_token_here
REACT_APP_GITHUB_USERNAME=your_github_username_here
```

## 3. Usage

### Available Commands (in edit mode):

- `github-import` - Import repositories from your GitHub account
- `github-import username` - Import repositories from a specific GitHub user
- `github-sync` - Sync with your GitHub repositories (adds new ones, skips existing)

### Features:

- Automatically determines project type based on language and topics
- Fetches repository name, description, and URLs
- Filters out forks by default (configurable)
- Shows repository stats (stars, forks, language)
- Prevents duplicate imports

### Project Type Detection:

The service automatically categorizes repositories based on:
- Repository topics (e.g., 'react', 'mobile', 'ai', 'blockchain')
- Primary language (JavaScript → web, Swift → mobile, Python → ai, etc.)
- Falls back to 'web' if unable to determine

### Security:

- GitHub token is only used for API requests
- No write access to your repositories
- Token is stored as an environment variable (not in code)
