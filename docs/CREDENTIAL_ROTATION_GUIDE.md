# Supabase Credential Rotation Guide

**Date:** 2025-11-25
**Project:** subscription-manager-pro
**Security Level:** URGENT

---

## 🚨 Why Rotate Credentials?

The previous version of this project contained hardcoded Supabase credentials in `/src/lib/supabase.ts`. While these appear to be for a local development instance, they were committed to the codebase and should be rotated as a security precaution.

**Credentials that were hardcoded:**
- Supabase Anon Key: `sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH`
- Supabase Service Role Key: `sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz`
- Supabase URL: `http://127.0.0.1:55421` (local instance)

---

## ✅ What Has Been Fixed

1. **Removed hardcoded credentials** from `/src/lib/supabase.ts`
2. **Added validation** to require environment variables
3. **Improved error messages** when credentials are missing
4. **`.env.example` already exists** with proper template

---

## 🔐 Step-by-Step Credential Rotation

### If Using Local Supabase

If you're using a local Supabase instance (the hardcoded URL was `127.0.0.1:55421`):

#### Option A: Reset Local Instance
```bash
# Stop your local Supabase
supabase stop

# Remove the local database
supabase db reset

# Start fresh
supabase start
```

This will generate new credentials automatically.

#### Option B: Generate New Keys Manually
```bash
# Generate new anon key
supabase db anon-key --generate

# Generate new service role key
supabase db service-role-key --generate
```

---

### If Using Supabase Cloud

If you're using Supabase Cloud (supabase.co):

#### Step 1: Log into Supabase Dashboard
1. Go to https://app.supabase.com/
2. Log in to your account
3. Select your project

#### Step 2: Access API Settings
1. Click **Settings** (gear icon) in the left sidebar
2. Click **API** under Configuration

#### Step 3: Generate New Keys

**For Anon (Public) Key:**
1. Scroll to **Project API keys**
2. Find **anon** key section
3. Click **Regenerate key**
4. Confirm the action
5. Copy the new key immediately

**For Service Role Key:**
1. In the same **Project API keys** section
2. Find **service_role** key section
3. Click **Regenerate key**
4. ⚠️ **WARNING:** This is a sensitive operation
5. Confirm the action
6. Copy the new key immediately

#### Step 4: Update Your Environment
Update your `.env.local` file:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<NEW_ANON_KEY_HERE>
SUPABASE_SERVICE_ROLE_KEY=<NEW_SERVICE_ROLE_KEY_HERE>

NODE_ENV=development
```

#### Step 5: Update Production Environment
If deployed to production (Vercel, Netlify, etc.):

**Vercel:**
1. Go to https://vercel.com/
2. Select your project
3. Go to **Settings** > **Environment Variables**
4. Update:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. Redeploy your application

**Netlify:**
1. Go to https://app.netlify.com/
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Update the three variables above
5. Trigger a new deploy

#### Step 6: Revoke Old Keys (Important!)
1. Go back to Supabase Dashboard > Settings > API
2. Check if there's an option to **revoke old keys**
3. If not automatic, the old keys are already invalid after regeneration

---

## 🧪 Testing After Rotation

### 1. Test Local Development
```bash
# Navigate to project
cd /Users/harshh/Documents/GitHub/subscription-manager-pro

# Install dependencies (if needed)
npm install

# Run development server
npm run dev

# Open browser
open http://localhost:3000
```

### 2. Verify Connection
The application should:
- ✅ Start without errors about missing environment variables
- ✅ Connect to Supabase successfully
- ✅ Load subscription data (if any exists)

If you see errors:
```
Missing Supabase environment variables. Please set...
```
This means your `.env.local` is missing or incorrect.

### 3. Test Supabase Queries
Try performing basic operations:
- View subscriptions
- Add a subscription
- Edit a subscription
- Delete a subscription

All should work without errors.

---

## 📋 Verification Checklist

After completing rotation, verify:

- [ ] Old hardcoded credentials removed from code
- [ ] New credentials generated in Supabase
- [ ] `.env.local` updated with new credentials
- [ ] Application starts without environment variable errors
- [ ] Supabase connection test passes
- [ ] Production environment variables updated (if deployed)
- [ ] Production application redeployed
- [ ] Old credentials revoked/invalidated
- [ ] No hardcoded credentials anywhere in codebase
- [ ] `.env.local` is in `.gitignore` (verify: `git check-ignore .env.local`)

---

## 🔍 Audit Previous Access (If Cloud Instance)

If you were using Supabase Cloud with the hardcoded credentials:

### Check for Unauthorized Access
1. Go to Supabase Dashboard > **Logs** > **Auth Logs**
2. Look for suspicious:
   - Unknown IP addresses
   - Failed login attempts
   - Unusual query patterns
   - Geographic locations you don't recognize

3. Go to **Database** > **Roles**
4. Review all database roles and permissions
5. Remove any unknown or suspicious roles

### Review Recent Database Activity
```sql
-- Check recent modifications to your tables
SELECT
  schemaname,
  tablename,
  last_analyzed,
  last_autovacuum
FROM pg_stat_user_tables
ORDER BY last_analyzed DESC;

-- Check for unusual record creation
SELECT
  'subscriptions' as table_name,
  COUNT(*) as total_records,
  MAX(created_at) as last_created
FROM subscriptions;
```

---

## 🛡️ Prevention Best Practices

### 1. Never Commit Credentials
```bash
# Always check before committing
git diff --cached

# If you accidentally committed credentials:
git reset HEAD~1
git add -p  # Stage files carefully
```

### 2. Use Environment Variables
```typescript
// ✅ GOOD
const apiKey = process.env.API_KEY

// ❌ BAD
const apiKey = 'hardcoded-key-here'
```

### 3. Use `.env.example` as Template
```bash
# Copy template for new developers
cp .env.example .env.local

# Never commit .env.local
echo ".env.local" >> .gitignore
```

### 4. Use Secret Management Tools
For production:
- **Vercel:** Built-in environment variables
- **Netlify:** Built-in environment variables
- **AWS:** AWS Secrets Manager
- **Google Cloud:** Secret Manager
- **Azure:** Key Vault

### 5. Rotate Credentials Regularly
Set a reminder to rotate credentials every:
- **3 months** for development keys
- **6 months** for production keys
- **Immediately** if credentials are compromised

### 6. Use Different Credentials Per Environment
```bash
# Development (.env.local)
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:55421
NEXT_PUBLIC_SUPABASE_ANON_KEY=dev_key_here

# Production (Vercel/Netlify)
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=prod_key_here
```

---

## 📞 Support & Questions

### Supabase Documentation
- [API Keys Documentation](https://supabase.com/docs/guides/api/api-keys)
- [Security Best Practices](https://supabase.com/docs/guides/platform/security-best-practices)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

### Project-Specific
- Check `/Users/harshh/Documents/GitHub/subscription-manager-pro/README.md`
- Review `.env.example` for required variables
- Test connection: http://localhost:3000 (in development)

---

## ⚠️ Important Notes

1. **Service Role Key** is extremely powerful and can bypass Row Level Security (RLS). Keep it secret and only use server-side.

2. **Anon Key** is safe to expose in frontend code, but still rotate it if compromised.

3. **Local Development** keys (127.0.0.1) are less critical but should still be rotated as best practice.

4. **Production Credentials** should NEVER match development credentials.

5. After rotation, the old keys are immediately invalid. Update all environments before they break.

---

## 🎯 Quick Command Reference

```bash
# Check if .env.local is ignored by git
git check-ignore .env.local

# Verify environment variables are loaded
npm run dev
# Look for startup errors about missing variables

# Test Supabase connection (if you have a test script)
npm run test:supabase

# Check what's in your .env.local (be careful not to share output)
cat .env.local

# Generate new local Supabase instance
supabase start
```

---

**Last Updated:** 2025-11-25
**Status:** ✅ Hardcoded credentials removed
**Action Required:** Rotate credentials if using cloud instance
