# Troubleshooting Guide

## Module Loading Error after Login

### Symptom
```
TypeError: error loading dynamically imported module: http://localhost:9000/src/pages/IndexPage.vue
```

### Root Cause
- Vite dev server WebSocket connection lost
- Hot Module Replacement (HMR) failed
- Dynamic imports stopped working

### Solutions (try in order)

#### 1. **Restart Dev Server** ✅ (Most Common)
```bash
# Stop the server (Ctrl+C in terminal)
pnpm dev
```

#### 2. **Clear Browser Cache**
- Firefox: Ctrl+Shift+Delete → Clear cache
- Chrome: Ctrl+Shift+Delete → Clear cache
- Hard refresh: Ctrl+F5 (Windows) or Cmd+Shift+R (Mac)

#### 3. **Clear Vite Cache**
```bash
cd /Users/dekay/Dokumente/projects/programmieren/tmd_quasar
rm -rf node_modules/.vite
rm -rf .quasar
pnpm dev
```

#### 4. **Check Port Conflicts**
```bash
# See if something is using port 9000
lsof -i :9000
# Kill the process if needed
kill -9 <PID>
```

#### 5. **Rebuild Node Modules**
```bash
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
pnpm dev
```

#### 6. **Check for Syntax Errors**
```bash
pnpm lint
pnpm type-check  # If you have this script
```

### Prevention

1. **Don't keep dev server running for days** - restart periodically
2. **Close browser dev tools** when not debugging - they can hold connections
3. **Use stable network** - network changes can break WebSocket
4. **Update dependencies** regularly
5. **Clear caches** before debugging

### Related Issues

- **WebSocket failed**: Check firewall/antivirus blocking port 9000
- **CORS errors**: Check API_BASE_URL in .env matches your WordPress URL
- **Import errors**: Check file paths are correct and files exist
- **Memory issues**: Restart computer if dev server is sluggish

### Verification

After fixing, verify these work:
```bash
# 1. Dev server starts without errors
pnpm dev

# 2. Login works
# Visit http://localhost:9000/#/login
# Log in with credentials

# 3. Navigation works
# After login, you should see IndexPage without errors

# 4. API calls work
curl http://localhost:10014/wp-json/tmd/v4/events?per_page=1
```

### Current Status (2025-10-02)

✅ **Fixed**: API was returning 500 errors - RESOLVED  
✅ **Fixed**: Dev server restarted successfully  
⚠️ **Note**: Sass deprecation warnings present (not critical)  

### Quick Check Commands

```bash
# Check if dev server is running
lsof -i :9000

# Check if WordPress is accessible
curl -I http://localhost:10014

# Check if API is working
curl http://localhost:10014/wp-json/tmd/v4/events?per_page=1

# Check for errors in dev server
# Look at terminal where pnpm dev is running

# Check browser console
# F12 → Console tab → Look for errors
```
