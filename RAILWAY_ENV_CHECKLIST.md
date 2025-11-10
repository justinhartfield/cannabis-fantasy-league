# Railway Environment Variables Checklist

## ✅ Required Variables

### 1. DATABASE_URL
**Status:** ⚠️ VERIFY THIS
**Value:** `${{MySQL.DATABASE_URL}}`

**Important:** This must be set as a **reference** to your MySQL service, NOT a raw string.

**How to set:**
1. Go to your Railway project dashboard
2. Click on your web service (cannabis-fantasy-league)
3. Go to "Variables" tab
4. Click "New Variable"
5. Variable name: `DATABASE_URL`
6. Click the "Variable Reference" button (looks like `${}`)
7. Select your MySQL service from the dropdown
8. Select `DATABASE_URL` from the list
9. Save

The final value should look like: `${{MySQL.DATABASE_URL}}` (where "MySQL" is your service name)

### 2. SESSION_SECRET
**Status:** ✅ Should already be set
**Value:** Any random string (at least 32 characters)
**Example:** `your-super-secret-session-key-change-this-in-production`

### 3. APP_URL
**Status:** ✅ Should already be set
**Value:** `https://cannabis-fantasy-league-production.up.railway.app`
(or whatever your Railway app URL is)

### 4. SENDGRID_API_KEY
**Status:** 🔴 **NEEDS REGENERATION** (old key was exposed)
**Value:** Your SendGrid API key starting with `SG.`

**Action Required:**
1. Go to https://app.sendgrid.com/settings/api_keys
2. Delete the old exposed key
3. Create a new API key with "Full Access" or "Mail Send" permission
4. Copy the new key
5. Update this variable in Railway

### 5. SENDGRID_FROM_EMAIL
**Status:** ✅ Should already be set
**Value:** The verified sender email in SendGrid
**Example:** `noreply@yourdomain.com`

### 6. NODE_ENV
**Status:** ✅ Should already be set
**Value:** `production`

## ⚠️ Optional Variables (Can Add Later)

### OAUTH_SERVER_URL
**Status:** Optional - only needed if using OAuth features
**Value:** URL of your OAuth server
**Note:** If not using OAuth, you can ignore the warning about this variable

### VITE_* Variables
**Status:** Optional - frontend build-time variables
**Note:** These are baked into the frontend during build, not strictly required for deployment

## 🚀 After Setting Variables

Once all required variables are set:

1. Railway will automatically redeploy
2. Wait for the build to complete
3. Check the deployment logs for any errors
4. If the app starts successfully, you'll need to initialize the database

## 📊 Database Initialization

After the app starts successfully, run ONE of these commands:

**Option 1: Using Railway CLI**
```bash
npx @railway/cli run npm run db:push
```

**Option 2: Temporarily change start command**
In Railway service settings, temporarily change the start command to:
```bash
npx drizzle-kit push && npm run start
```
Then change it back to `npm run start` after first successful deployment.

**Option 3: Use Railway web shell** (if available)
Navigate to your service → Shell tab → Run:
```bash
npm run db:push
```

## 🔍 Verification Steps

1. ✅ App builds successfully
2. ✅ App starts without crashing
3. ✅ Database tables are created
4. ✅ Can access the app URL in browser
5. ✅ Can create a league
6. ✅ Can send email invitations
7. ✅ Draft system works

---

**Current Priority:** 
1. Fix DATABASE_URL reference (most critical)
2. Regenerate SendGrid API key (security issue)
3. Wait for successful deployment
4. Initialize database
