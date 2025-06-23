# Getting Started

This guide will help you set up and run the TMD Quasar Frontend application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download Node.js](https://nodejs.org/)
- **pnpm** (recommended) or npm - Install pnpm: `npm install -g pnpm`
- **WordPress installation** with TMD plugin and REST API v3 enabled
- **Local development environment** at `http://localhost:10014` (for API testing)

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/danieldekay/tmd_quasar.git
cd tmd_quasar
```

### 2. Install Dependencies

```bash
pnpm install
# or
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` and set the following variables:

```env
# WordPress REST API URL
VITE_WP_API_URL=http://localhost:10014/wp-json/tmd/v3

# WordPress API credentials (if required)
VITE_WP_USERNAME=your_username
VITE_WP_PASSWORD=your_password
```

#### API Endpoint Configuration

- **Local development**: `http://localhost:10014/wp-json/tmd/v3`
- **Production**: `https://www.tangomarathons.com/wp-json/tmd/v2`

### 4. Start Development Server

```bash
pnpm dev
# or
npm run dev
```

The application will be available at `http://localhost:9000` (default Quasar dev port).

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Development | `pnpm dev` | Start development server with hot reload |
| Build | `pnpm build` | Build for production |
| Preview | `pnpm preview` | Preview production build locally |
| Lint | `pnpm lint` | Run ESLint with strict rules |
| Format | `pnpm format` | Format code with Prettier |
| Type Check | `pnpm typecheck` | Run TypeScript type checking |

## Development Configuration

### Default Settings

- **Port**: 9000 (development)
- **Host**: localhost
- **Target**: Client-side rendering with SSR support
- **Cookie Settings**: 30-day expiry for filter persistence
- **API Pagination**: Default 20 items per page

### Filter Persistence Configuration

The application uses cookies to persist user filter preferences:

- **Cookie Name**: `tmd_event_filters`
- **Expiry**: 30 days
- **Scope**: Path `/`, SameSite Strict
- **Stored Data**: Search query, country selection, date ranges, past events toggle, sorting preferences, rows per page

## WordPress Integration Setup

### Required WordPress Components

1. **WordPress Installation** - Standard WordPress installation
2. **TMD Plugin** - Custom plugin providing the REST API endpoints
3. **REST API v3** - Enabled and accessible

### Custom Post Types

The application expects these WordPress custom post types:

- `tmd_event` - Events and festivals
- `tmd_dj` - DJ profiles  
- `tmd_teacher` - Teacher profiles
- `tmd_event_series` - Series of related events

### API Endpoints

The application uses these primary endpoints:

- `/tmd/v3/events` - Event listings with advanced filtering
- `/tmd/v3/djs` - DJ profiles with embedded events
- `/tmd/v3/teachers` - Teacher profiles
- `/tmd/v3/event-series` - Event series management

## Verification Steps

After setup, verify everything is working:

1. **Development server starts**: `pnpm dev` runs without errors
2. **API connection**: Application loads event data from WordPress
3. **TypeScript compilation**: No type errors in console
4. **Linting passes**: `pnpm lint` completes successfully

## Next Steps

- Explore the [Development Guide](Development-Guide) for detailed development workflow
- Review [Architecture & Design](Architecture-&-Design) to understand the technical structure
- Check [API Documentation](API-Documentation) for detailed API integration information

## Common Issues

If you encounter issues, check the [Troubleshooting](Troubleshooting) page for solutions to common problems.

---

**Ready to contribute?** See our [Contributing Guidelines](Contributing) for development process details.