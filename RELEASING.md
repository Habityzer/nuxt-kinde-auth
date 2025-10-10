# Release Process

This project uses [semantic-release](https://semantic-release.gitbook.io/) for automated versioning and package publishing.

## Prerequisites

1. You must have write access to the GitHub repository
2. You must be logged in to npm (`npm login`)
3. Your npm account must have publish access to the package
4. All tests must pass
5. The working directory must be clean (all changes committed)

## Commit Message Convention

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Your commit messages must follow this format:

```
<type>(<scope>): <subject>
```

### Types and Version Bumps

- `feat:` - A new feature (triggers **minor** version bump, e.g., 1.0.0 → 1.1.0)
- `fix:` - A bug fix (triggers **patch** version bump, e.g., 1.0.0 → 1.0.1)
- `docs:` - Documentation changes (triggers **patch** version bump)
- `style:` - Code style changes (triggers **patch** version bump)
- `refactor:` - Code refactoring (triggers **patch** version bump)
- `perf:` - Performance improvements (triggers **patch** version bump)
- `test:` - Adding or updating tests (triggers **patch** version bump)
- `build:` - Build system changes (triggers **patch** version bump)
- `ci:` - CI/CD changes (triggers **patch** version bump)
- `chore(deps):` - Dependency updates (triggers **patch** version bump)

### Breaking Changes

For **major** version bumps (e.g., 1.0.0 → 2.0.0), include `BREAKING CHANGE:` in the commit footer:

```
feat: remove deprecated authentication method

BREAKING CHANGE: The `oldAuth()` method has been removed. Use `useKindeAuth()` instead.
```

Or use the `!` suffix:

```
feat!: remove deprecated authentication method
```

### Examples

```bash
# Minor version bump (new feature)
git commit -m "feat: add support for organization management"

# Patch version bump (bug fix)
git commit -m "fix: resolve cookie expiration issue"

# Patch version bump (documentation)
git commit -m "docs: update installation instructions"

# Major version bump (breaking change)
git commit -m "feat!: migrate to Nuxt 4 compatibility"
```

## Release Command

To create a new release:

```bash
pnpm release
```

This command will:

1. Build the project (`pnpm build`)
2. Run tests (`pnpm test`)
3. Analyze commits since the last release
4. Determine the next version number based on commit types
5. Generate/update the CHANGELOG.md
6. Update the version in package.json
7. Create a git tag
8. Commit the changes
9. Push to GitHub
10. Publish to npm

## What Gets Released

The semantic-release process will:

- **Analyze** all commits since the last release
- **Calculate** the next version based on commit types
- **Generate** release notes from commit messages
- **Update** CHANGELOG.md with new entries
- **Update** package.json version
- **Create** a git tag (e.g., v1.2.3)
- **Commit** changes with message: `chore(release): 1.2.3 [skip ci]`
- **Push** commits and tags to GitHub
- **Publish** to npm registry

## Dry Run (Testing)

To test the release process without actually publishing:

1. Temporarily update `.releaserc.json`:
   ```json
   {
     "dryRun": true
   }
   ```

2. Run the release:
   ```bash
   pnpm release
   ```

3. Review the output to see what would happen

4. Restore `.releaserc.json`:
   ```json
   {
     "dryRun": false
   }
   ```

## Manual Release Steps (If Needed)

If you need to manually release without semantic-release:

```bash
# 1. Update version in package.json
npm version patch  # or minor, or major

# 2. Build the project
pnpm build

# 3. Update CHANGELOG.md manually

# 4. Commit and tag
git add .
git commit -m "chore(release): X.Y.Z"
git tag vX.Y.Z

# 5. Push
git push && git push --tags

# 6. Publish to npm
npm publish
```

## Troubleshooting

### Release Failed

If the release fails:

1. Check the error message
2. Fix the issue (tests, build, authentication, etc.)
3. Commit the fix
4. Run `pnpm release` again

### Wrong Version Released

If semantic-release chose the wrong version:

1. Check your commit messages - they must follow the conventional format
2. Use `git log` to review recent commits
3. Consider squashing or amending commits if needed (before pushing)

### NPM Authentication

If you get authentication errors:

```bash
npm login
npm whoami  # Verify you're logged in
```

### GitHub Authentication

Make sure you have:
- SSH keys set up for GitHub
- Or a personal access token configured
- Write access to the repository

## Configuration

The release configuration is in `.releaserc.json`:

- **branches**: Which branches can trigger releases (currently: `master`)
- **repositoryUrl**: The GitHub repository URL
- **plugins**: The semantic-release plugins used
- **dryRun**: Set to `true` for testing (default: `false`)
- **ci**: Set to `false` to run locally (default: `false`)

## Best Practices

1. **Always** use conventional commit messages
2. **Test** your changes before committing
3. **Review** the CHANGELOG.md after each release
4. **Don't** manually edit version numbers in package.json
5. **Don't** create tags manually
6. **Keep** the master branch clean and stable
7. **Use** feature branches for development
8. **Squash** commits when merging PRs to maintain clean commit history

## Links

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
- [semantic-release](https://semantic-release.gitbook.io/)

