# Simple Database Reset Instructions

## 🎯 Quick Steps (5 minutes)

### Step 1: Drop Tables in Supabase Studio
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `simple_drop_and_import.sql`
4. Click **Run** to drop all tables

### Step 2: Import Data
1. Go to **Table Editor** in Supabase Studio
2. Click **Import data from CSV/JSON**
3. Upload your `toolsSubscription6.json` file
4. Map the fields to your table columns
5. Click **Import**

## ✅ Done!

That's it! Much simpler than all those SQL scripts. You can now test the duplicate functionality and it should work properly with the updated category/subcategory values.

## 🔄 Alternative: Use the Generated SQL

If you prefer to use the generated SQL instead of importing JSON:

1. Run `simple_drop_and_import.sql` first
2. Then run `complete_data_insert.sql` (the generated one with all 73 records)

Both approaches will work - choose whichever you prefer!
