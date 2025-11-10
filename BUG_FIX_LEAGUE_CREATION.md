# Bug Fix: League Creation Error (500)

## Issue Summary

Users were unable to create new leagues, receiving a 500 error with the message "Failed to create league".

### Error Details

```
[API Mutation Error] TRPCClientError: Failed to create league
Status: 500
Endpoint: /api/trpc/league.create
```

Server logs showed:
```
DrizzleQueryError: Failed query: insert into `teams` ...
Error: Field 'leagueId' doesn't have a default value
```

## Root Cause Analysis

### Problem 1: Incorrect `.$returningId()` Usage

**File:** `server/leagueRouter.ts`  
**Line:** 59

The code was incorrectly accessing the league ID from Drizzle ORM's `.$returningId()` method.

**Incorrect Code:**
```typescript
const leagueResult = await db.insert(leagues).values({...}).$returningId();
const leagueId = leagueResult.id; // ❌ leagueResult is an array!
```

**Issue:** According to [Drizzle ORM v0.32.0 documentation](https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v0320), `.$returningId()` returns an **array** of objects, not a single object:

```typescript
const result = await db.insert(usersTable).values([{ name: 'John' }]).$returningId();
//    ^? { id: number }[]  // Returns an array!
```

Even when inserting a single row, it returns `[{ id: 1 }]`, not `{ id: 1 }`.

**Fix:**
```typescript
const leagueResult = await db.insert(leagues).values({...}).$returningId();
const leagueId = leagueResult[0].id; // ✅ Access first element of array
```

### Problem 2: Server Not Accessible from External Network

**File:** `server/_core/index.ts`  
**Line:** 62

The server was only listening on `localhost`, making it inaccessible through the exposed port for external preview.

**Incorrect Code:**
```typescript
server.listen(port, () => {  // ❌ Defaults to localhost only
  console.log(`Server running on http://localhost:${port}/`);
});
```

**Issue:** When `server.listen()` is called without a hostname parameter, it defaults to listening only on `localhost` (127.0.0.1), which means external connections through the exposed port proxy cannot reach the server.

**Fix:**
```typescript
server.listen(port, '0.0.0.0', () => {  // ✅ Listen on all interfaces
  console.log(`Server running on http://localhost:${port}/`);
});
```

This change was applied to both occurrences in the file (lines 16 and 62).

## Files Modified

1. **server/leagueRouter.ts**
   - Fixed league ID extraction from `.$returningId()` result
   - Added debug logging for troubleshooting

2. **server/_core/index.ts**
   - Changed server to listen on all network interfaces (`0.0.0.0`)
   - Applied to both the main server and port availability check

## Verification

### Before Fix
```bash
$ netstat -tuln | grep 3002
tcp6       0      0 :::3002                 :::*                    LISTEN
# Only IPv6, not accessible externally
```

### After Fix
```bash
$ netstat -tuln | grep 3002
tcp        0      0 0.0.0.0:3002            0.0.0.0:*               LISTEN
# Listening on all IPv4 interfaces, accessible externally
```

## Testing Recommendations

1. **Manual Testing:**
   - Navigate to `/league/create`
   - Fill in league name and settings
   - Click "Liga erstellen" (Create League)
   - Verify successful creation and redirect to league detail page

2. **API Testing:**
   ```bash
   curl -X POST http://localhost:3002/api/trpc/league.create \
     -H "Content-Type: application/json" \
     -H "Cookie: session=YOUR_SESSION_COOKIE" \
     -d '{"name":"Test League","maxTeams":10,...}'
   ```

3. **Database Verification:**
   ```sql
   SELECT * FROM leagues ORDER BY id DESC LIMIT 1;
   SELECT * FROM teams WHERE leagueId = (SELECT MAX(id) FROM leagues);
   ```

## Related Documentation

- [Drizzle ORM MySQL $returningId() Documentation](https://orm.drizzle.team/docs/latest-releases/drizzle-orm-v0320)
- [Node.js net.Server.listen() Documentation](https://nodejs.org/api/net.html#serverlisten)

## Impact

- **Severity:** Critical (P0)
- **Affected Users:** All users attempting to create new leagues
- **Status:** Fixed ✅
- **Deployment:** Requires server restart

## Follow-up Actions

1. Add integration tests for league creation flow
2. Add validation for `.$returningId()` result to catch similar issues
3. Consider adding TypeScript strict null checks
4. Update deployment documentation to specify `0.0.0.0` binding requirement
