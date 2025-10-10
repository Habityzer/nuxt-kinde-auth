# Release Quick Start

## TL;DR

```bash
# 1. Make changes and commit with conventional commit messages
git commit -m "feat: add new feature"
git commit -m "fix: resolve bug"

# 2. Push to master
git push

# 3. Release (this will auto-bump version, update changelog, and publish)
pnpm release
```

## Commit Message Format

```
<type>: <description>
```

### Common Types

| Type | Version Bump | Example |
|------|--------------|---------|
| `feat:` | Minor (1.0.0 → 1.1.0) | `feat: add SSO support` |
| `fix:` | Patch (1.0.0 → 1.0.1) | `fix: resolve login redirect` |
| `docs:` | Patch | `docs: update README` |
| `chore(deps):` | Patch | `chore(deps): update dependencies` |
| `feat!:` or `BREAKING CHANGE:` | Major (1.0.0 → 2.0.0) | `feat!: remove old API` |

## What Happens During Release

1. ✅ Builds project
2. ✅ Runs tests
3. ✅ Analyzes commits
4. ✅ Determines new version
5. ✅ Updates CHANGELOG.md
6. ✅ Updates package.json version
7. ✅ Creates git tag
8. ✅ Commits and pushes
9. ✅ Publishes to npm

## Pre-Release Checklist

- [ ] All changes committed
- [ ] Tests passing (`pnpm test`)
- [ ] Build successful (`pnpm build`)
- [ ] Logged into npm (`npm whoami`)
- [ ] On master branch
- [ ] Have push access to repo

## First Time Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Login to npm
npm login

# 3. Verify access
npm whoami
```

## See Also

- Full guide: [RELEASING.md](./RELEASING.md)
- [Conventional Commits](https://www.conventionalcommits.org/)

