# Setting Up Automated NPM Publishing

This project uses GitHub Actions with [semantic-release](https://semantic-release.gitbook.io/) (via [`cycjimmy/semantic-release-action@v6`](https://github.com/cycjimmy/semantic-release-action)) to automatically publish to npm when you push to **`main`** or **`master`**.

## Setup Instructions

### 1. Create NPM Access Token

> **Important**: As of December 9, 2025, npm classic tokens have been permanently revoked. You must use **granular access tokens** for CI/CD workflows.

**Option A: Using npm CLI (recommended):**
```bash
npm token create --type automation --scope @habityzer
```

**Option B: Using the web interface:**
1. Go to [npmjs.com/settings/~/tokens](https://www.npmjs.com/settings/~/tokens) and log in
2. Click **Generate New Token** → **Granular Access Token**
3. Configure your token:
   - **Token name**: `github-actions-nuxt-kinde-auth` (or any descriptive name)
   - **Expiration**: Up to 90 days (maximum for publish tokens)
   - **Packages and scopes**: Select `@habityzer/nuxt-kinde-auth` or `@habityzer` scope
   - **Permissions**: Select **Read and write**
   - ✅ **Enable "Bypass 2FA"** for automated workflows
4. Click **Generate Token**
5. Copy the token (starts with `npm_...`)

> **Note**: Granular tokens for publishing expire after a maximum of 90 days. Set a reminder to regenerate the token before expiration.

### 2. Add NPM Token to GitHub

1. Go to your GitHub repository: https://github.com/Habityzer/nuxt-kinde-auth
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token from step 1
6. Click **Add secret**

### 3. How It Works

The workflow (`.github/workflows/publish.yml`) will:

1. **Trigger**: Automatically runs when you push to **`main`** or **`master`**
2. **Analyze**: Semantic-release reads your commit messages (following conventional commits)
3. **Version**: Automatically bumps the version based on your commits:
   - `feat:` → minor version (1.0.0 → 1.1.0)
   - `fix:` → patch version (1.0.0 → 1.0.1)
   - `BREAKING CHANGE:` → major version (1.0.0 → 2.0.0)
4. **Changelog**: Updates `CHANGELOG.md`
5. **Git Tag**: Creates a git tag for the new version
6. **Publish**: Publishes to npm
7. **Commit**: Commits the changelog and version bump back to your repo

Releases run only in CI (not via a local `pnpm release` script).

### 4. Commit Message Format

Use conventional commits for automatic versioning:

```bash
# Patch release (1.0.0 → 1.0.1)
git commit -m "fix: resolve authentication bug"

# Minor release (1.0.0 → 1.1.0)
git commit -m "feat: add new login method"

# Major release (1.0.0 → 2.0.0)
git commit -m "feat: redesign API

BREAKING CHANGE: API structure has changed"

# No release (documentation, etc.)
git commit -m "docs: update README"
git commit -m "chore: update dependencies"
```

## Troubleshooting

### "No NPM_TOKEN found"
- Make sure you've added `NPM_TOKEN` as a GitHub secret
- Check that the secret name is exactly `NPM_TOKEN` (case-sensitive)

### "No release published"
- Check your commit messages follow conventional commits format
- Semantic-release only publishes if there are releasable commits
- View the GitHub Actions logs for details

### "Permission denied" or "Invalid npm token"
- Ensure you're using a **granular access token** (not classic token)
- Check that the token has **Read and write** permissions
- Ensure **"Bypass 2FA"** is enabled for CI/CD workflows
- Check that your npm account has publish access to the `@habityzer` scope
- Verify the token hasn't expired (granular tokens expire after max 90 days)

### "Package already published"
- Semantic-release automatically handles versions
- If you manually published the same version, semantic-release will skip it

## Current Configuration

- **Branches**: `main` and `master` (see `.releaserc.json` and `.github/workflows/publish.yml` `on.push.branches`)
- **Package**: `@habityzer/nuxt-kinde-auth`
- **Workflow**: `.github/workflows/publish.yml`
- **NPM Publish**: Enabled (set in `.releaserc.json`)

## Additional Resources

- [npm Granular Access Tokens Documentation](https://docs.npmjs.com/about-access-tokens#granular-access-tokens)
- [Semantic Release Documentation](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
