# TMD API Status Report

**Date**: 2025-01-21  
**Status**: ✅ **ALL APIS WORKING**

## Summary

All TMD WordPress APIs are **accessible and functioning correctly**:

- ✅ WordPress REST API root is accessible
- ✅ TMD v4 REST API endpoints are working (recently fixed)
- ✅ GraphQL endpoint is accessible at the correct location
- ✅ Quasar app axios configuration is correct

## Recent Fix (2025-01-21)

**Issue**: API was returning 500 Internal Server Error with certain query parameters  
**Root Cause**: `BaseController::prepare_item_for_response()` was wrapping items in `WP_REST_Response` objects  
**Solution**: Changed to return plain data arrays for proper WordPress REST API collection handling  
**Details**: See `tmd_core/API_FIX_2025_01_21.md`

### Previously Failing Requests (Now Working)

```bash
# These parameters previously caused 500 errors, now work correctly
curl "http://localhost:10014/wp-json/tmd/v4/events?include_relationships=true&include_taxonomies=true"
# Result: ✅ 200 OK
```

## Test Results

### 1. WordPress REST API Root
```bash
curl http://localhost:10014/wp-json/
```
✅ **Result**: Returns full API discovery document with all endpoints

### 2. TMD v4 Events Endpoint
```bash
curl http://localhost:10014/wp-json/tmd/v4/events
```
✅ **Result**: Returns event data successfully
```json
[
  {
    "data": {
      "id": 54198,
      "title": {"rendered": "La Maravillosa"},
      "event_name": "La Maravillosa",
      "start_date": "2025-06-16T00:00:00+00:00",
      ...
    }
  }
]
```

### 3. GraphQL API
```bash
curl http://localhost:10014/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __type(name: \"RootQuery\") { name } }"}'
```
✅ **Result**: GraphQL responds correctly
```json
{
  "data": {
    "__type": {
      "name": "RootQuery"
    }
  }
}
```

## Quasar App Configuration

The Quasar app's axios configuration is correct:

**File**: `src/boot/axios.ts`
```typescript
const api = axios.create({
  baseURL:
    process.env.API_BASE_URL ||
    (isLocalhost
      ? 'http://localhost:10014/wp-json/tmd/v4'
      : 'https://www.tangomarathons.com/wp-json/tmd/v4'),
  ...
});
```

**Environment**: `.env`
```bash
API_BASE_URL=http://localhost:10014/wp-json/tmd/v4
WORDPRESS_URL=http://localhost:10014
```

## Important Notes

1. **GraphQL Endpoint**: GraphQL is at `/graphql`, NOT `/wp-json/graphql`
2. **TMD REST API**: Version 4 is active (`/tmd/v4`), version 3 exists but requires auth
3. **Authentication**: Some endpoints require JWT authentication for write operations
4. **Plugin Status**: `tmd_core` plugin is symlinked and active

## GraphQL Configuration

For GraphQL authentication (used by login):
```bash
GRAPHQL_ENDPOINT=http://localhost:10014/graphql
```

Example login mutation:
```graphql
mutation Login {
  login(input: {
    clientMutationId: "tmd-frontend"
    username: "your-username"
    password: "your-password"
  }) {
    authToken
    refreshToken
    user {
      id
      username
      email
    }
  }
}
```

## Testing Commands

### Check API Root
```bash
curl -s http://localhost:10014/wp-json/ | head -50
```

### Check TMD Events
```bash
curl -s http://localhost:10014/wp-json/tmd/v4/events | jq '.[0]'
```

### Check GraphQL
```bash
curl -s http://localhost:10014/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ __schema { queryType { name } } }"}'
```

### Check TMD Plugin
```bash
ls -la /Users/dekay/Local_Sites/tmd/app/public/wp-content/plugins/ | grep tmd
```

## Troubleshooting

If the frontend can't connect:

1. **Check dev server is running**: `pnpm dev`
2. **Check Local WordPress is running**: Visit http://localhost:10014
3. **Check environment variables**: Verify `.env` has correct URLs
4. **Check browser console**: Look for CORS or network errors
5. **Check axios configuration**: Review `src/boot/axios.ts`

## Conclusion

✅ **All APIs are accessible and working correctly**  
✅ **Quasar app configuration is correct**  
✅ **GraphQL endpoint is at `/graphql` (not `/wp-json/graphql`)**

The issue was likely that you were checking `/wp-json/graphql` instead of `/graphql`.

---
*Last updated: October 2, 2025*
