# Setup Summary

This document summarizes the configuration of semantic versioning and automated releases for the nuxt-kinde-auth project.

## ✅ What's Been Configured

### 1. Semantic Release Setup

The project now uses [semantic-release](https://github.com/semantic-release/semantic-release) for automated versioning and publishing.

**Configuration file:** `.releaserc.json`

- Analyzes commit messages using conventional commits
- Automatically determines version bumps (major/minor/patch)
- Generates and updates CHANGELOG.md
- Creates git tags
- Publishes to npm
- Commits version changes back to the repository

### 2. Package.json Updates

**New Scripts:**
```json
{
  "typecheck": "nuxi typecheck",
  "prepublishOnly": "pnpm build && pnpm test",
  "release": "pnpm build && pnpm test && HUSKY=0 semantic-release"
}
```

**New Dependencies:**
- `@semantic-release/changelog` - Generates CHANGELOG.md
- `@semantic-release/commit-analyzer` - Analyzes commits for version bumps
- `@semantic-release/git` - Commits version and changelog
- `@semantic-release/release-notes-generator` - Generates release notes
- `conventional-changelog-conventionalcommits` - Conventional commits preset
- `semantic-release` - Main semantic-release package

**Metadata Updates:**
- Author: "Vazgen Manukyan"
- Repository: "git+https://github.com/Habityzer/nuxt-kinde-auth.git"
- Homepage and bug tracking URLs added
- Engine requirements specified (Node >=18.0.0, pnpm >=8.0.0)

### 3. Documentation

Three new documentation files:

1. **CHANGELOG.md** - Will be auto-updated with each release
2. **RELEASING.md** - Comprehensive release process documentation
3. **RELEASE_QUICKSTART.md** - Quick reference guide

### 4. Type Checking

Full TypeScript type checking is configured and working:
- `pnpm typecheck` script available
- All source files pass type checking
- Type declarations for Nuxt auto-imports
- H3 event context properly typed

## 🚀 How to Release

### Quick Release (if commits follow conventions):

```bash
pnpm release
```

This will:
1. Build the project
2. Run tests
3. Analyze commits
4. Bump version
5. Update CHANGELOG.md
6. Create git tag
7. Push to GitHub
8. Publish to npm

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Examples:**
```bash
feat: add SSO support                  # Minor version bump
fix: resolve cookie expiration         # Patch version bump
docs: update README                    # Patch version bump
feat!: migrate to Nuxt 4              # Major version bump (breaking)
```

## 📋 Pre-Release Checklist

Before running `pnpm release`:

- [ ] All changes are committed and pushed
- [ ] All tests pass (`pnpm test`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Type checking passes (`pnpm typecheck`)
- [ ] You're logged into npm (`npm whoami`)
- [ ] You have write access to the GitHub repository
- [ ] You're on the `master` branch

## 🔧 Configuration Details

### Release Rules

From `.releaserc.json`:

| Commit Type | Version Bump |
|-------------|--------------|
| `feat:` | Minor (1.0.0 → 1.1.0) |
| `fix:` | Patch (1.0.0 → 1.0.1) |
| `docs:`, `style:`, `refactor:`, `perf:`, `test:`, `build:`, `ci:` | Patch |
| `chore(deps):` | Patch |
| `feat!:` or `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) |

### Semantic Release Plugins

1. **@semantic-release/commit-analyzer** - Analyzes commits to determine release type
2. **@semantic-release/release-notes-generator** - Generates release notes
3. **@semantic-release/changelog** - Updates CHANGELOG.md
4. **@semantic-release/npm** - Publishes to npm registry
5. **@semantic-release/git** - Commits and tags the release

### Branch Configuration

- **Release Branch:** `master`
- **Repository:** `git@github.com:Habityzer/nuxt-kinde-auth.git`

## 📚 Additional Resources

- [RELEASING.md](./RELEASING.md) - Full release documentation
- [RELEASE_QUICKSTART.md](./RELEASE_QUICKSTART.md) - Quick reference
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [semantic-release docs](https://semantic-release.gitbook.io/)

## 🐛 Troubleshooting

### Release fails with authentication error

```bash
npm login
npm whoami  # Verify you're logged in
```

### Wrong version bump

Check that your commit messages follow the conventional commits format. Use `git log` to review recent commits.

### Dry run (test release)

Edit `.releaserc.json` and set `"dryRun": true`, then run `pnpm release` to see what would happen without actually releasing.

## 📝 Notes

- The release process is configured to run locally (`"ci": false`)
- Husky hooks are disabled during release (`HUSKY=0`)
- Version changes are committed with `[skip ci]` to avoid CI loops
- Git hooks are bypassed with `--no-verify` flag

## ✨ First Release

To make your first release:

1. Ensure all code is committed
2. Run `pnpm release`
3. semantic-release will determine the initial version based on commits
4. The package will be published to npm
5. A git tag will be created (e.g., `v0.1.0`)

## 🎉 Success!

Your project is now set up for automated semantic versioning! Just commit using conventional commit messages and run `pnpm release` when ready to publish.

