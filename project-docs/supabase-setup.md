# Supabase Local Development Setup

## Overview
Local Supabase instance running via Docker for the subscription-manager-pro project.

## Connection Details

### URLs
- **Studio Dashboard**: http://127.0.0.1:54323
  - Visual database management interface
  - Create tables, run queries, manage data
- **API URL**: http://127.0.0.1:54321
- **GraphQL URL**: http://127.0.0.1:54321/graphql/v1
- **Storage URL**: http://127.0.0.1:54321/storage/v1/s3
- **Database URL**: `postgresql://postgres:postgres@127.0.0.1:54322/postgres`

### API Keys (Local Development Only)
```
Publishable Key: sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
Secret Key: sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

### Storage Credentials (S3-compatible)
```
S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907
S3 Region: local
```

### Additional Services
- **Mailpit (Email Testing)**: http://127.0.0.1:54324
  - Captures all emails sent by the application
  - No actual emails are sent in local development
- **MCP URL**: http://127.0.0.1:54321/mcp

## Commands

### Start Supabase
```bash
supabase start
```

### Stop Supabase
```bash
supabase stop
```

### Stop and Reset Database
```bash
supabase stop --no-backup
```

### Database Migrations
```bash
# Create a new migration
supabase migration new <migration_name>

# Apply migrations
supabase db push

# Reset database and apply all migrations
supabase db reset
```

### Generate TypeScript Types
```bash
supabase gen types typescript --local > src/types/supabase.ts
```

## Environment Variables

Add these to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH
SUPABASE_SERVICE_ROLE_KEY=sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz
```

## Project Structure

```
subscription-manager-pro/
├── supabase/
│   ├── config.toml          # Supabase configuration
│   ├── seed.sql             # Seed data for development
│   └── migrations/          # Database migrations
│       └── [timestamp]_*.sql
```

## Usage in Code

### Initialize Supabase Client
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Server-Side with Service Role
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)
```

## Common Operations

### Create a Table
1. Open Studio Dashboard at http://127.0.0.1:54323
2. Navigate to Table Editor
3. Create new table with columns
4. Generate migration: `supabase db diff -f <migration_name>`

### Seed Development Data
Edit `supabase/seed.sql` and run:
```bash
supabase db reset
```

### View Logs
```bash
# All logs
supabase logs

# Specific service
supabase logs postgres
supabase logs api
```

## Troubleshooting

### Port Already in Use
```bash
# Stop Supabase
supabase stop

# Check for running containers
docker ps | grep supabase

# Force stop if needed
docker stop $(docker ps -q --filter ancestor=supabase/*)
```

### Reset Everything
```bash
supabase stop --no-backup
supabase start
```

### Database Connection Issues
- Ensure Docker is running
- Check that no other service is using ports 54321-54324
- Verify Supabase is started: `docker ps | grep supabase`

## Production Deployment

When deploying to production:
1. Create a project at https://supabase.com
2. Update environment variables with production URLs and keys
3. Run migrations: `supabase db push --linked`
4. Never commit API keys to version control

## Security Notes

⚠️ **Important**: The keys above are for LOCAL DEVELOPMENT ONLY
- Never use these keys in production
- Never commit production keys to version control
- Use environment variables for all credentials
- Production keys should be stored in secure secret management

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Local Development Guide](https://supabase.com/docs/guides/cli/local-development)
