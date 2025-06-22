# CI/CD Configuration

## GitHub Actions Workflow

This project uses GitHub Actions for automated CI/CD pipeline.

### Workflow Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` branch

### Pipeline Steps

#### 1. Lint and Build Job
- **Environment**: Ubuntu latest
- **Node.js**: Version 20
- **Package Manager**: pnpm v9
- **Steps**:
  - Checkout code
  - Setup Node.js and pnpm
  - Cache pnpm dependencies
  - Install dependencies with `pnpm install --frozen-lockfile`
  - Run linter with `pnpm lint`
  - Build application with `pnpm build`
  - Upload build artifacts

#### 2. Deploy Job (main branch only)
- **Triggers**: Only on successful build of main branch
- **Target**: GitHub Pages
- **Steps**:
  - Download build artifacts
  - Configure GitHub Pages
  - Deploy SPA build to GitHub Pages

### Environment Configuration

The workflow is configured to:
- Use pnpm for dependency management
- Cache dependencies for faster builds
- Continue on linting errors (temporarily) to allow CI setup
- Deploy automatically to GitHub Pages from main branch

### Artifacts

Build artifacts are retained for 30 days and include the complete `dist/` directory.

### GitHub Pages Setup

To enable GitHub Pages deployment:
1. Go to repository Settings → Pages
2. Set Source to "GitHub Actions"
3. The application will be available at `https://[username].github.io/[repository-name]/`

### Local Development

The CI/CD pipeline mirrors local development commands:
```bash
pnpm install
pnpm lint
pnpm build
pnpm preview  # Local preview of production build
```