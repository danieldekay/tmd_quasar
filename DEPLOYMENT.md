# TMD Quasar App Deployment Guide

This guide covers multiple deployment options for your TMD Quasar SPA application.

## 🚀 Quick Start

Your app is already built and ready for deployment! The build output is in `dist/spa/`.

## 📋 Prerequisites

- Node.js 20+ installed
- pnpm package manager
- Git repository (for automated deployments)

## 🔧 Build Commands

```bash
# Install dependencies
pnpm install

# Build for production
pnpm build

# Test the build locally
pnpm serve
```

## 🌐 Deployment Options

### Option 1: Netlify (Recommended)

**Pros:** Free tier, automatic deployments, great for SPAs
**Best for:** Personal projects, small to medium apps

1. **Connect your repository:**

   - Push your code to GitHub/GitLab
   - Sign up at [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your repository

2. **Configure build settings:**

   - Build command: `pnpm build`
   - Publish directory: `dist/spa`
   - Node version: `20`

3. **Deploy:**
   - Netlify will automatically build and deploy on every push to main branch

**Configuration files provided:**

- `netlify.toml` - Build configuration
- `dist/spa/.htaccess` - Apache configuration for SPA routing

### Option 2: Vercel

**Pros:** Excellent performance, automatic deployments, great developer experience
**Best for:** Production apps, teams

1. **Install Vercel CLI:**

   ```bash
   npm i -g vercel
   ```

2. **Deploy:**

   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Link to existing project or create new
   - Confirm build settings

**Configuration files provided:**

- `vercel.json` - Vercel configuration

### Option 3: GitHub Pages

**Pros:** Free, integrated with GitHub
**Best for:** Open source projects, documentation sites

1. **Enable GitHub Pages:**

   - Go to your repository settings
   - Navigate to "Pages"
   - Select "GitHub Actions" as source

2. **Deploy:**
   - Push to main branch
   - GitHub Actions will automatically build and deploy

**Configuration files provided:**

- `.github/workflows/deploy.yml` - GitHub Actions workflow

### Option 4: Manual Deployment

**Pros:** Full control, custom domain, SSL
**Best for:** Production servers, custom hosting

1. **Build the app:**

   ```bash
   pnpm build
   ```

2. **Upload files:**

   ```bash
   # Using the provided script
   ./deploy.sh your-server.com /var/www/html

   # Or manually upload dist/spa/ contents to your web server
   ```

3. **Configure web server:**

   **Apache (.htaccess provided):**

   - Upload `dist/spa/.htaccess` to your web root
   - Ensure mod_rewrite is enabled

   **Nginx (nginx.conf provided):**

   - Copy `nginx.conf` to your server
   - Update `server_name` to your domain
   - Restart nginx

## 🔒 Environment Configuration

### API Endpoints

Your app connects to the TMD API. Make sure to update API endpoints for production:

1. **Check your API configuration:**

   - Review `src/services/baseService.ts`
   - Update base URL if needed

2. **Environment variables:**
   - Create `.env.production` for production settings
   - Set `VITE_API_BASE_URL` to your production API URL

### CORS Configuration

If your API is on a different domain, ensure CORS is properly configured on your backend.

## 📱 PWA Configuration (Optional)

To enable Progressive Web App features:

1. **Update quasar.config.ts:**

   ```typescript
   pwa: {
     workboxMode: 'GenerateSW',
     injectPwaMetaTags: true,
     swFilename: 'sw.js',
     manifestFilename: 'manifest.json'
   }
   ```

2. **Build with PWA:**
   ```bash
   quasar build -m pwa
   ```

## 🔍 Testing Your Deployment

1. **Check routing:**

   - Navigate to different pages
   - Test direct URL access
   - Verify browser refresh works

2. **Check API connectivity:**

   - Test login functionality
   - Verify data loading
   - Check error handling

3. **Performance:**
   - Use Lighthouse for performance audit
   - Check Core Web Vitals
   - Verify caching works

## 🛠️ Troubleshooting

### Common Issues

1. **404 errors on direct page access:**

   - Ensure SPA routing is configured (see .htaccess or nginx.conf)
   - Check that all routes redirect to index.html

2. **API connection issues:**

   - Verify API endpoint URLs
   - Check CORS configuration
   - Ensure SSL certificates are valid

3. **Build failures:**
   - Check Node.js version (requires 20+)
   - Clear node_modules and reinstall: `rm -rf node_modules pnpm-lock.yaml && pnpm install`

### Debug Commands

```bash
# Test build locally
pnpm serve

# Check build output
ls -la dist/spa/

# Validate HTML
npx html-validate dist/spa/index.html
```

## 📈 Monitoring & Analytics

Consider adding:

- Google Analytics
- Error tracking (Sentry)
- Performance monitoring
- Uptime monitoring

## 🔄 Continuous Deployment

For automated deployments:

1. **Set up webhooks** in your hosting provider
2. **Configure branch protection** in GitHub
3. **Add deployment notifications** (Slack, email)
4. **Set up staging environment** for testing

## 📞 Support

If you encounter issues:

1. Check the [Quasar documentation](https://quasar.dev)
2. Review the [Vue.js deployment guide](https://vuejs.org/guide/best-practices/production-deployment.html)
3. Check your hosting provider's documentation

---

**Happy deploying! 🎉**
