# Troubleshooting

This page provides solutions to common issues you might encounter when developing or using the TMD Quasar Frontend.

## Development Issues

### Installation Problems

#### Node.js Version Issues

**Problem**: Installation fails with Node.js version errors.

**Solution**:
```bash
# Check Node.js version (requires v18+)
node --version

# If version is too old, install latest LTS
# Using nvm (recommended)
nvm install --lts
nvm use --lts

# Or download from https://nodejs.org/
```

#### PNPM Installation Issues

**Problem**: `pnpm` commands not working.

**Solution**:
```bash
# Install pnpm globally
npm install -g pnpm

# Or enable using corepack
corepack enable
corepack prepare pnpm@latest --activate
```

#### Dependency Installation Failures

**Problem**: `pnpm install` fails with network or dependency errors.

**Solutions**:
```bash
# Clear pnpm cache
pnpm store prune

# Delete node_modules and lockfile, reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install

# If network issues persist, try different registry
pnpm install --registry https://registry.npmjs.org/
```

### Development Server Issues

#### Port Already in Use

**Problem**: Development server fails to start with "port in use" error.

**Solutions**:
```bash
# Kill process using port 9000
lsof -ti:9000 | xargs kill -9

# Or start on different port
pnpm dev --port 9001
```

#### Hot Reload Not Working

**Problem**: Changes not reflected in browser.

**Solutions**:
1. **Check file watchers limit** (Linux/macOS):
   ```bash
   # Increase file watchers limit
   echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
   sudo sysctl -p
   ```

2. **Clear browser cache**: Hard refresh (Ctrl+F5 / Cmd+Shift+R)

3. **Restart development server**:
   ```bash
   # Stop server (Ctrl+C) then restart
   pnpm dev
   ```

### Build Issues

#### TypeScript Errors

**Problem**: Build fails with TypeScript compilation errors.

**Solutions**:
```bash
# Run type checking to see detailed errors
pnpm typecheck

# Common fixes:
# 1. Add missing type definitions
npm install --save-dev @types/package-name

# 2. Update tsconfig.json for strict mode compliance
# 3. Add explicit type annotations where needed
```

#### ESLint Errors

**Problem**: Build fails with ESLint errors.

**Solutions**:
```bash
# Run lint to see errors
pnpm lint

# Auto-fix fixable issues
pnpm format

# Common ESLint fixes:
# 1. Add void operator for floating promises
void asyncFunction()

# 2. Use optional chaining for nullable values
const value = obj?.property?.value

# 3. Add explicit return types for functions
const myFunction = (): ReturnType => {
  // function body
}
```

#### Build Performance Issues

**Problem**: Build takes too long or runs out of memory.

**Solutions**:
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" pnpm build

# Enable parallel processing
pnpm build --parallel

# Clean build cache
rm -rf dist .quasar
```

## API Integration Issues

### Connection Problems

#### API Endpoint Not Reachable

**Problem**: Frontend cannot connect to WordPress API.

**Solutions**:
1. **Check API URL in `.env`**:
   ```env
   # Local development
   VITE_WP_API_URL=http://localhost:10014/wp-json/tmd/v3
   
   # Production
   VITE_WP_API_URL=https://www.tangomarathons.com/wp-json/tmd/v2
   ```

2. **Test API manually**:
   ```bash
   # Test API endpoint
   curl http://localhost:10014/wp-json/tmd/v3/events
   
   # Check if WordPress is running
   curl http://localhost:10014/wp-json/
   ```

3. **Check CORS settings** in WordPress

#### Authentication Issues

**Problem**: API returns 401 or 403 errors.

**Solutions**:
1. **Check credentials in `.env`**:
   ```env
   VITE_WP_USERNAME=your_username
   VITE_WP_PASSWORD=your_password
   ```

2. **Verify WordPress user permissions**

3. **Check if TMD plugin is activated**

### Data Loading Issues

#### Empty or Missing Data

**Problem**: API calls succeed but return no data.

**Solutions**:
1. **Check WordPress content**:
   - Verify TMD custom post types exist
   - Check if events/DJs are published
   - Confirm meta fields are populated

2. **Verify API endpoints**:
   ```bash
   # Test specific endpoints
   curl "http://localhost:10014/wp-json/tmd/v3/events?per_page=1"
   curl "http://localhost:10014/wp-json/tmd/v3/djs?per_page=1"
   ```

3. **Check browser network tab** for API responses

#### Filtering Not Working

**Problem**: Filters don't affect results.

**Solutions**:
1. **Check filter parameters**:
   ```javascript
   // Correct parameter format
   const params = {
     search: 'marathon',
     country: 'Germany',
     date_after: '2024-01-01'
   }
   ```

2. **Verify meta field names** in WordPress

3. **Test filters manually**:
   ```bash
   curl "http://localhost:10014/wp-json/tmd/v3/events?country=Germany&search=marathon"
   ```

## Runtime Issues

### Performance Problems

#### Slow Page Loading

**Problem**: Pages load slowly, especially on mobile.

**Solutions**:
1. **Enable caching**:
   ```javascript
   // Implement request caching
   const cache = new Map()
   const cachedRequest = async (url) => {
     if (cache.has(url)) return cache.get(url)
     const response = await fetch(url)
     cache.set(url, response)
     return response
   }
   ```

2. **Optimize images**:
   - Use WebP format
   - Implement lazy loading
   - Resize images appropriately

3. **Reduce API calls**:
   - Implement pagination
   - Use selective meta fields
   - Debounce search inputs

#### Memory Leaks

**Problem**: Application memory usage grows over time.

**Solutions**:
1. **Clean up event listeners**:
   ```javascript
   onUnmounted(() => {
     // Remove event listeners
     window.removeEventListener('resize', handleResize)
   })
   ```

2. **Cancel ongoing requests**:
   ```javascript
   const controller = new AbortController()
   
   onUnmounted(() => {
     controller.abort()
   })
   ```

3. **Use Vue DevTools** to identify memory leaks

### UI/UX Issues

#### Layout Breaks on Mobile

**Problem**: UI doesn't display correctly on mobile devices.

**Solutions**:
1. **Test with responsive design tools**:
   - Browser DevTools device emulation
   - Physical device testing

2. **Use Quasar breakpoints**:
   ```vue
   <template>
     <div class="row">
       <div class="col-12 col-md-6">
         <!-- Responsive content -->
       </div>
     </div>
   </template>
   ```

3. **Check CSS viewport settings**:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1">
   ```

#### Dark Mode Issues

**Problem**: Dark mode not working or displaying incorrectly.

**Solutions**:
1. **Check Quasar dark mode setup**:
   ```javascript
   // In boot file
   import { Dark } from 'quasar'
   
   // Set dark mode
   Dark.set(true)
   ```

2. **Use CSS custom properties**:
   ```css
   .component {
     background-color: var(--q-dark);
     color: var(--q-dark-page);
   }
   ```

3. **Test in both light and dark modes**

## Browser-Specific Issues

### Chrome/Chromium

**Issue**: Dev tools console errors about extensions.

**Solution**: 
- Disable browser extensions during development
- Use incognito mode for testing

### Firefox

**Issue**: CORS errors in development.

**Solution**:
- Check `network.http.referer.XOriginPolicy` setting
- Use Firefox Developer Edition

### Safari

**Issue**: ES modules not supported.

**Solution**:
- Ensure build target includes Safari version
- Check `quasar.config.ts` build target settings

## Environment-Specific Issues

### Windows

#### Path Issues

**Problem**: File paths with backslashes cause errors.

**Solution**:
```javascript
// Use path.posix for consistent forward slashes
import path from 'path'
const filePath = path.posix.join('src', 'components', 'MyComponent.vue')
```

#### PowerShell Execution Policy

**Problem**: Cannot run npm scripts in PowerShell.

**Solution**:
```powershell
# Allow script execution
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### macOS

#### Permission Issues

**Problem**: Cannot install packages due to permission errors.

**Solution**:
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

### Linux

#### File Watcher Limits

**Problem**: Development server doesn't detect file changes.

**Solution**:
```bash
# Increase inotify watchers
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

## Getting Additional Help

### Debug Information to Collect

When reporting issues, include:

1. **Environment details**:
   ```bash
   node --version
   pnpm --version
   npx quasar info
   ```

2. **Error messages**: Full error output from console

3. **Steps to reproduce**: Exact steps that cause the issue

4. **Browser information**: Name, version, and any extensions

5. **Operating system**: Version and architecture

### Where to Get Help

1. **GitHub Issues**: [Report bugs and request features](https://github.com/danieldekay/tmd_quasar/issues)

2. **GitHub Discussions**: [Ask questions and get community help](https://github.com/danieldekay/tmd_quasar/discussions)

3. **Documentation**: 
   - [Development Guide](Development-Guide)
   - [API Documentation](API-Documentation)
   - [Architecture & Design](Architecture-&-Design)

4. **External Resources**:
   - [Quasar Documentation](https://quasar.dev/)
   - [Vue.js Documentation](https://vuejs.org/)
   - [TypeScript Documentation](https://www.typescriptlang.org/)

---

**Still having issues?** Open a [GitHub issue](https://github.com/danieldekay/tmd_quasar/issues/new) with your specific problem and the debug information listed above.