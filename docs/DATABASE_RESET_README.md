# Database Reset and Data Migration Guide

This guide explains how to drop and recreate the database tables with updated data from `toolsSubscription6.json`.

## 📋 Overview

The updated data includes:
- **73 subscriptions** with refined category and subcategory values
- **Updated categorization** for better organization
- **Complete relationship data** including API keys, promo codes, and account emails
- **Proper data types** and constraints

## 🗂️ Files Created

1. **`drop_and_recreate_tables.sql`** - Drops all tables and recreates the schema
2. **`complete_data_insert.sql`** - Complete data insertion statements (generated)
3. **`generate_sql_from_json.py`** - Python script to process JSON and generate SQL
4. **`insert_subscription_data.sql`** - Sample data insertion (first 10 entries)

## 🚀 How to Execute

### Step 1: Drop and Recreate Tables

```bash
# Connect to your Supabase database and run:
psql -h your-db-host -U your-username -d your-database -f drop_and_recreate_tables.sql
```

**Or via Supabase Dashboard:**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `drop_and_recreate_tables.sql`
4. Execute the script

### Step 2: Insert Data

```bash
# After tables are recreated, insert the data:
psql -h your-db-host -U your-username -d your-database -f complete_data_insert.sql
```

**Or via Supabase Dashboard:**
1. Copy and paste the contents of `complete_data_insert.sql`
2. Execute the script

## 📊 Data Structure

### Updated Categories and Subcategories

The data now includes properly organized categories:

**AI Tools:**
- Chat (ChatGPT, Claude, Gemini, etc.)
- Search (Perplexity)
- Research (Google Labs, NotebookLM)
- Roleplay (Character.ai, JanitorAI, etc.)
- Image (Midjourney, Leonardo.Ai, etc.)
- Video (VEED, KlingAI, etc.)
- Audio (ElevenLabs, SUNO)
- Transcribe (TurboScribe)
- Build (Cursor, Replit, etc.)
- Write (GAMMA, QuillBot, etc.)
- Development (Hugging Face, Google AI Studio, etc.)
- Utils (ZeroGPT)
- Platform (Quark, Hailuo AI, etc.)
- Productivity (Linear, Raycast, etc.)
- Design/Prototype (Magic Patterns, Figma, etc.)
- Speech-to-text (WisprFlow)
- Vector DB (Pinecone, Weaviate)

**Tools:**
- Image (Unsplash)
- Automation (Zapier, n8n)
- APIs (Amadeus)
- DB (Supabase)
- Deploy (Vercel)

### Key Features

- **Proper UUID handling** for all IDs
- **Complete relationship data** with API keys, promo codes, and account emails
- **Usage tracking** with frequency and importance levels
- **Regional flags** for China-specific tools
- **A16Z rankings** for AI tools
- **Comprehensive metadata** including safety flags and usage status

## 🔧 Schema Changes

### Updated Fields

1. **Removed deprecated fields:**
   - `logo` (replaced with `logo_url`)
   - `productivity_score` (replaced with `usage_importance`)
   - `priority` (replaced with `usage_importance`)

2. **Added new fields:**
   - `usage_importance` (high, medium, low)
   - `iam_using_it` (boolean flag)
   - `no_subscription` (boolean flag)
   - `not_in_a16z` (boolean flag)

3. **Updated constraints:**
   - Proper validation for billing cycles
   - Status validation (active, paused, canceled)
   - Usage frequency validation
   - Usage importance validation

## 📈 Data Statistics

- **Total Subscriptions:** 73
- **Categories:** 2 main categories (AI Tools, Tools)
- **Subcategories:** 20+ specialized subcategories
- **Active Subscriptions:** 65
- **Paused/Canceled:** 8
- **Free Tools:** 12
- **Paid Tools:** 61

## 🛠️ Troubleshooting

### Common Issues

1. **Foreign Key Constraints:**
   - Make sure to drop tables in the correct order
   - The script handles this automatically

2. **Data Type Mismatches:**
   - All data types are properly handled in the generated SQL
   - Boolean values are converted correctly
   - Date formats are standardized

3. **Duplicate Keys:**
   - The script includes proper error handling
   - Unique constraints are maintained

### Verification

After running the scripts, verify the data:

```sql
-- Check total count
SELECT COUNT(*) FROM subscriptions;

-- Check categories
SELECT category, COUNT(*) FROM subscriptions GROUP BY category;

-- Check subcategories
SELECT subcategory, COUNT(*) FROM subscriptions GROUP BY subcategory;

-- Check relationship data
SELECT COUNT(*) FROM subscription_api_keys;
SELECT COUNT(*) FROM subscription_promo_codes;
SELECT COUNT(*) FROM subscription_account_emails;
```

## 🔄 Rollback

If you need to rollback:

1. **Backup your current data** before running the scripts
2. **Use Supabase's point-in-time recovery** if available
3. **Restore from backup** if needed

## 📝 Notes

- The scripts are designed to be idempotent (can be run multiple times)
- All data is properly escaped for SQL injection prevention
- The schema includes proper indexes for performance
- Views are recreated for common queries
- Triggers are set up for automatic timestamp updates

## 🎯 Next Steps

After running the scripts:

1. **Verify the data** in your application
2. **Test the API endpoints** to ensure they work correctly
3. **Update any hardcoded references** to old field names
4. **Test the duplicate functionality** that was previously failing
5. **Verify the AI Tools page** displays correctly with new categories

The updated data structure should resolve the duplicate subscription issues and provide better organization for your subscription management system.
