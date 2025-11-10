# Deploy Cannabis Fantasy League to Render

This guide will help you deploy your Cannabis Fantasy League application to Render, a reliable platform with excellent free tier support for full-stack applications.

## Why Render?

✅ **Free tier includes:**
- Web service hosting
- MySQL database (PostgreSQL also available)
- Automatic SSL certificates
- Automatic deployments from GitHub
- WebSocket support
- Easy environment variable management

✅ **Better than Railway for this project:**
- Simpler database setup
- More reliable free tier
- Better documentation
- Easier environment variable references

## Prerequisites

1. GitHub account (you already have this)
2. Render account (free) - Sign up at https://render.com
3. SendGrid API key (you'll need to regenerate this)

## Step-by-Step Deployment

### Step 1: Create Render Account

1. Go to https://render.com
2. Click "Get Started for Free"
3. Sign up with your GitHub account (recommended for easy integration)

### Step 2: Create MySQL Database

1. From Render Dashboard, click "New +" button
2. Select "MySQL"
3. Configure:
   - **Name:** `cannabis-fantasy-league-db`
   - **Database:** `cannabis_fantasy_league`
   - **User:** (auto-generated)
   - **Region:** Oregon (or closest to you)
   - **Plan:** Free
4. Click "Create Database"
5. Wait for database to be created (takes 1-2 minutes)
6. **Important:** Keep this tab open - you'll need the connection details

### Step 3: Create Web Service

1. Click "New +" button again
2. Select "Web Service"
3. Connect your GitHub repository:
   - Click "Connect account" if not already connected
   - Find and select `justinhartfield/cannabis-fantasy-league`
   - Click "Connect"
4. Configure the service:
   - **Name:** `cannabis-fantasy-league`
   - **Region:** Oregon (same as database)
   - **Branch:** `main`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Free

### Step 4: Configure Environment Variables

In the web service settings, scroll to "Environment Variables" section and add:

#### Required Variables:

1. **NODE_ENV**
   - Value: `production`

2. **DATABASE_URL**
   - Click "Add from Database"
   - Select your `cannabis-fantasy-league-db` database
   - Select "Internal Database URL" (faster, more secure)
   - This will automatically populate the connection string

3. **SESSION_SECRET**
   - Click "Generate Value" button
   - Or use a random 32+ character string

4. **APP_URL**
   - Value: `https://cannabis-fantasy-league.onrender.com`
   - (Or whatever your Render URL will be - you can update this after deployment)

5. **SENDGRID_API_KEY**
   - Get a new key from https://app.sendgrid.com/settings/api_keys
   - Create new key with "Mail Send" permission
   - Copy and paste the key (starts with `SG.`)

6. **SENDGRID_FROM_EMAIL**
   - Value: Your verified sender email in SendGrid
   - Example: `noreply@yourdomain.com`

### Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically:
   - Clone your repository
   - Install dependencies
   - Build the application
   - Start the server
3. Watch the logs for any errors
4. First deployment takes 5-10 minutes

### Step 6: Initialize Database

After the first successful deployment, you need to create the database tables.

**Option A: Using Render Shell (Easiest)**

1. Go to your web service in Render dashboard
2. Click "Shell" tab in the left sidebar
3. Run:
   ```bash
   npm run db:push
   ```
4. Wait for tables to be created
5. Type `exit` to close the shell

**Option B: Temporary Build Command**

1. Go to your web service settings
2. Change "Build Command" to:
   ```bash
   npm install && npm run build && npm run db:push
   ```
3. Click "Save Changes" (triggers redeploy)
4. After successful deployment, change it back to:
   ```bash
   npm install && npm run build
   ```

**Option C: Using Render API (Advanced)**

If you have Render CLI installed:
```bash
render run npm run db:push
```

### Step 7: Verify Deployment

1. Click on your web service URL (e.g., `https://cannabis-fantasy-league.onrender.com`)
2. You should see the Cannabis Fantasy League homepage
3. Try creating an account
4. Try creating a league
5. Test email invitations
6. Test the draft system

## Troubleshooting

### Build Fails

- Check the build logs in Render dashboard
- Verify all dependencies are in `package.json`
- Make sure `npm run build` works locally

### App Crashes on Start

- Check the deployment logs
- Verify all environment variables are set correctly
- Verify DATABASE_URL is connected to the database

### Database Connection Errors

- Use "Internal Database URL" not "External Database URL"
- Verify the database is in the same region as the web service
- Check database status in Render dashboard

### Email Not Sending

- Verify SendGrid API key is valid
- Verify sender email is verified in SendGrid
- Check SendGrid dashboard for activity

## Free Tier Limitations

Render free tier includes:

✅ **Included:**
- 750 hours/month of web service runtime
- MySQL database with 1GB storage
- Automatic SSL
- WebSocket support
- Automatic deployments

⚠️ **Limitations:**
- Services spin down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- 1GB database storage limit

💡 **Tip:** For $7/month, you can upgrade to a paid plan that keeps your service always running (no cold starts).

## Upgrading to Paid Plan (Optional)

If you want to eliminate cold starts:

1. Go to your web service settings
2. Click "Change Plan"
3. Select "Starter" plan ($7/month)
4. Your service will stay running 24/7

## Automatic Deployments

Render automatically redeploys when you push to GitHub:

1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push
   ```
3. Render detects the push and redeploys automatically
4. Watch the deployment in Render dashboard

## Monitoring

### View Logs

1. Go to your web service in Render dashboard
2. Click "Logs" tab
3. See real-time application logs

### View Metrics

1. Click "Metrics" tab
2. See CPU, memory, and request metrics

### Set Up Alerts

1. Go to service settings
2. Add notification email for deployment failures

## Custom Domain (Optional)

To use your own domain:

1. Go to web service settings
2. Click "Custom Domain"
3. Add your domain (e.g., `fantasyleague.yourdomain.com`)
4. Follow DNS instructions to point your domain to Render
5. Render automatically provisions SSL certificate

## Backup Strategy

### Database Backups

Render doesn't include automatic backups on free tier. To backup:

1. Use Render Shell to export database:
   ```bash
   mysqldump -u $MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE > backup.sql
   ```

2. Or upgrade to paid database plan for automatic backups

### Code Backups

Your code is already backed up on GitHub! 🎉

## Support

- Render Documentation: https://render.com/docs
- Render Community: https://community.render.com
- Status Page: https://status.render.com

## Next Steps After Deployment

1. ✅ Update APP_URL in environment variables with your actual Render URL
2. ✅ Test all features thoroughly
3. ✅ Set up custom domain (optional)
4. ✅ Configure SendGrid sender authentication for better deliverability
5. ✅ Consider upgrading to paid plan to eliminate cold starts
6. ✅ Set up monitoring and alerts

---

**Your app will be live at:** `https://cannabis-fantasy-league.onrender.com`

(The exact URL will be shown in your Render dashboard after deployment)
