#!/bin/bash

# Fix Logo Mapping Script
# This script runs the migration to move logo data from logo column to logo_url column

echo "🔧 Fixing logo mapping in Supabase database..."

# Check if Supabase is running
if ! pgrep -f "supabase" > /dev/null; then
    echo "❌ Supabase is not running. Please start it first with: npx supabase start"
    exit 1
fi

# Run the migration
echo "📝 Running logo mapping migration..."
npx supabase db reset --linked

echo "✅ Logo mapping migration completed!"
echo "📊 Data has been moved from 'logo' column to 'logo_url' column"
echo "🔄 Future syncs will now correctly use logo_url column"
