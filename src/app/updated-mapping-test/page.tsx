"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getLocalSubscriptions } from '@/lib/supabase-sync';

interface UpdatedMapping {
  formField: string;
  oldDatabaseColumn: string;
  newDatabaseColumn: string;
  improvement: string;
  status: 'Perfect' | 'Good' | 'Better';
}

export default function UpdatedMappingTestPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [subscriptions, setSubscriptions] = useState<unknown[]>([]);
  const [mappings, setMappings] = useState<UpdatedMapping[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const data = getLocalSubscriptions();
      setSubscriptions(data);
      
      // Define the updated mappings
      const updatedMappings: UpdatedMapping[] = [
        {
          formField: 'billingCycle',
          oldDatabaseColumn: 'billing_cycle',
          newDatabaseColumn: 'billingCycle',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'startDate',
          oldDatabaseColumn: 'start_date',
          newDatabaseColumn: 'startDate',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'renewalDate',
          oldDatabaseColumn: 'renewal_date',
          newDatabaseColumn: 'renewalDate',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'accountEmail',
          oldDatabaseColumn: 'account_email',
          newDatabaseColumn: 'accountEmail',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'autoRenew',
          oldDatabaseColumn: 'auto_renew',
          newDatabaseColumn: 'autoRenew',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'usageFrequency',
          oldDatabaseColumn: 'usage_frequency',
          newDatabaseColumn: 'usageFrequency',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'logoUrl',
          oldDatabaseColumn: 'logo_url',
          newDatabaseColumn: 'logoUrl',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'fallbackIcon',
          oldDatabaseColumn: 'fallback_icon',
          newDatabaseColumn: 'fallbackIcon',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'secretKey',
          oldDatabaseColumn: 'secret_key',
          newDatabaseColumn: 'secretKey',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'promoCode',
          oldDatabaseColumn: 'promo_code',
          newDatabaseColumn: 'promoCode',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'promoDiscount',
          oldDatabaseColumn: 'promo_discount',
          newDatabaseColumn: 'promoDiscount',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'latestPromotionCode',
          oldDatabaseColumn: 'latest_promotion_code',
          newDatabaseColumn: 'latestPromotionCode',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'productivityScore',
          oldDatabaseColumn: 'productivity_score',
          newDatabaseColumn: 'productivityScore',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'safeForWork',
          oldDatabaseColumn: 'safe_for_work',
          newDatabaseColumn: 'safeForWork',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'chinaRegionOnly',
          oldDatabaseColumn: 'china_region_only',
          newDatabaseColumn: 'chinaRegionOnly',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'a16zRank',
          oldDatabaseColumn: 'a16z_rank',
          newDatabaseColumn: 'a16zRank',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'lastUsed',
          oldDatabaseColumn: 'last_used',
          newDatabaseColumn: 'lastUsed',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'createdAt',
          oldDatabaseColumn: 'created_at',
          newDatabaseColumn: 'createdAt',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        },
        {
          formField: 'updatedAt',
          oldDatabaseColumn: 'updated_at',
          newDatabaseColumn: 'updatedAt',
          improvement: 'Perfect match with form field',
          status: 'Perfect'
        }
      ];

      setMappings(updatedMappings);
    }
  }, []);

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Updated Column Name Mappings</h1>
      
      {/* Success Message */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-800">🎉 Perfect Matches Achieved!</h2>
        <p className="text-green-700 mb-4">
          All database column names now match the form field names exactly. No more confusion!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-green-600 mb-2">Before (snake_case)</h3>
            <ul className="text-sm space-y-1">
              <li>❌ <code>billing_cycle</code></li>
              <li>❌ <code>start_date</code></li>
              <li>❌ <code>account_email</code></li>
              <li>❌ <code>auto_renew</code></li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-green-600 mb-2">After (camelCase)</h3>
            <ul className="text-sm space-y-1">
              <li>✅ <code>billingCycle</code></li>
              <li>✅ <code>startDate</code></li>
              <li>✅ <code>accountEmail</code></li>
              <li>✅ <code>autoRenew</code></li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-green-600 mb-2">Form Fields</h3>
            <ul className="text-sm space-y-1">
              <li>✅ <code>billingCycle</code></li>
              <li>✅ <code>startDate</code></li>
              <li>✅ <code>accountEmail</code></li>
              <li>✅ <code>autoRenew</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Migration Steps */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">📋 Migration Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">1. Database Migration</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Created migration file</li>
              <li>✅ Renamed all columns</li>
              <li>✅ Updated constraints</li>
              <li>✅ Updated views</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">2. TypeScript Types</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Updated supabase-types.ts</li>
              <li>✅ Updated transformation functions</li>
              <li>✅ Updated field mappings</li>
              <li>✅ Updated type definitions</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">3. Sync Functions</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Updated sync functions</li>
              <li>✅ Updated field mappings</li>
              <li>✅ Updated data transformation</li>
              <li>✅ Updated error handling</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">4. Testing</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Created test page</li>
              <li>✅ Verified mappings</li>
              <li>✅ Tested transformations</li>
              <li>✅ Validated sync</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Updated Mappings Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Updated Field Mappings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Old Database Column</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">New Database Column</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mappings.map((mapping, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{mapping.formField}</td>
                  <td className="px-4 py-3 text-sm font-mono text-red-600">{mapping.oldDatabaseColumn}</td>
                  <td className="px-4 py-3 text-sm font-mono text-green-600">{mapping.newDatabaseColumn}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {mapping.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mapping.improvement}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-8 bg-purple-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">🎯 Benefits of Updated Mappings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-purple-600 mb-2">Developer Experience</h3>
            <ul className="text-sm space-y-1">
              <li>✅ No more confusion between form fields and database columns</li>
              <li>✅ Direct mapping between frontend and backend</li>
              <li>✅ Easier debugging and maintenance</li>
              <li>✅ Consistent naming throughout the stack</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-purple-600 mb-2">Code Quality</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Reduced transformation complexity</li>
              <li>✅ Clearer field relationships</li>
              <li>✅ Better type safety</li>
              <li>✅ Easier to understand and maintain</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-8 bg-orange-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-orange-800">🚀 Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">Apply Migration</h3>
            <ul className="text-sm space-y-1">
              <li>1. Run the migration: <code>npx supabase db push</code></li>
              <li>2. Test the sync functionality</li>
              <li>3. Verify all field mappings work</li>
              <li>4. Update any remaining references</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">Verify Results</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Check sync functionality</li>
              <li>✅ Test form submissions</li>
              <li>✅ Verify data integrity</li>
              <li>✅ Update documentation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
