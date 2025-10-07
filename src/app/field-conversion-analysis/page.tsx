"use client";

import { useState, useEffect } from 'react';

interface FieldConversion {
  currentField: string;
  currentType: string;
  proposedField: string;
  reason: string;
  impact: 'Low' | 'Medium' | 'High';
  category: string;
}

export default function FieldConversionAnalysisPage() {
  const [conversions, setConversations] = useState<FieldConversion[]>([]);

  useEffect(() => {
    // Analyze all field conversions needed
    const fieldConversions: FieldConversion[] = [
      // Basic fields - no change needed
      {
        currentField: 'id',
        currentType: 'string',
        proposedField: 'id',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'name',
        currentType: 'string',
        proposedField: 'name',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'plan',
        currentType: 'string',
        proposedField: 'plan',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'logo',
        currentType: 'string',
        proposedField: 'logo',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'cost',
        currentType: 'number',
        proposedField: 'cost',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'currency',
        currentType: 'string',
        proposedField: 'currency',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'category',
        currentType: 'string',
        proposedField: 'category',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'subcategory',
        currentType: 'string',
        proposedField: 'subcategory',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'description',
        currentType: 'string',
        proposedField: 'description',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'url',
        currentType: 'string',
        proposedField: 'url',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'status',
        currentType: 'string',
        proposedField: 'status',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'notes',
        currentType: 'string',
        proposedField: 'notes',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },
      {
        currentField: 'priority',
        currentType: 'string',
        proposedField: 'priority',
        reason: 'Already matches database',
        impact: 'Low',
        category: 'Basic'
      },

      // Fields that need conversion from camelCase to snake_case
      {
        currentField: 'billingCycle',
        currentType: 'string',
        proposedField: 'billing_cycle',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'accountEmail',
        currentType: 'string',
        proposedField: 'account_email',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'promoCode',
        currentType: 'string',
        proposedField: 'promo_code',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'promoDiscount',
        currentType: 'number',
        proposedField: 'promo_discount',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'renewalDate',
        currentType: 'Date',
        proposedField: 'renewal_date',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'startDate',
        currentType: 'Date',
        proposedField: 'start_date',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'usageFrequency',
        currentType: 'string',
        proposedField: 'usage_frequency',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'productivityScore',
        currentType: 'number',
        proposedField: 'productivity_score',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'alternativeServices',
        currentType: 'string[]',
        proposedField: 'alternative_services',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'lastUsed',
        currentType: 'Date',
        proposedField: 'last_used',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'autoRenew',
        currentType: 'boolean',
        proposedField: 'auto_renew',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'logoUrl',
        currentType: 'string',
        proposedField: 'logo_url',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'fallbackIcon',
        currentType: 'string',
        proposedField: 'fallback_icon',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'safeForWork',
        currentType: 'boolean',
        proposedField: 'safe_for_work',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'chinaRegionOnly',
        currentType: 'boolean',
        proposedField: 'china_region_only',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'a16zRank',
        currentType: 'number',
        proposedField: 'a16z_rank',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'apiAccessKeys',
        currentType: 'string[]',
        proposedField: 'api_access_keys',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'secretKey',
        currentType: 'string',
        proposedField: 'secret_key',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'previouslyUsedPromotionCode',
        currentType: 'string[]',
        proposedField: 'previously_used_promotion_code',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'latestPromotionCode',
        currentType: 'string',
        proposedField: 'latest_promotion_code',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      },
      {
        currentField: 'accountEmailsUsedPreviously',
        currentType: 'string[]',
        proposedField: 'account_emails_used_previously',
        reason: 'Convert camelCase to snake_case to match database',
        impact: 'High',
        category: 'Conversion'
      }
    ];

    setConversations(fieldConversions);
  }, []);

  const basicFields = conversions.filter(f => f.category === 'Basic');
  const conversionFields = conversions.filter(f => f.category === 'Conversion');
  const lowImpact = conversions.filter(f => f.impact === 'Low');
  const mediumImpact = conversions.filter(f => f.impact === 'Medium');
  const highImpact = conversions.filter(f => f.impact === 'High');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Field Conversion Analysis</h1>
      
      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Basic Fields</h2>
          <p className="text-2xl font-bold text-green-600">{basicFields.length}</p>
          <p className="text-green-700 text-sm">No changes needed</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Conversion Fields</h2>
          <p className="text-2xl font-bold text-yellow-600">{conversionFields.length}</p>
          <p className="text-yellow-700 text-sm">Need camelCase → snake_case</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Low Impact</h2>
          <p className="text-2xl font-bold text-blue-600">{lowImpact.length}</p>
          <p className="text-blue-700 text-sm">Minimal changes</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">High Impact</h2>
          <p className="text-2xl font-bold text-red-600">{highImpact.length}</p>
          <p className="text-red-700 text-sm">Major changes required</p>
        </div>
      </div>

      {/* Basic Fields (No Changes) */}
      <div className="bg-green-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-green-800">✅ Basic Fields (No Changes Needed)</h2>
        <p className="text-green-700 mb-4">These fields already match the database column names:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
          {basicFields.map((field, index) => (
            <div key={index} className="bg-white p-3 rounded border">
              <div className="font-mono text-sm">{field.currentField}</div>
              <div className="text-xs text-gray-600">{field.currentType}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Fields */}
      <div className="bg-yellow-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">🔄 Fields That Need Conversion</h2>
        <p className="text-yellow-700 mb-4">These fields need to be converted from camelCase to snake_case:</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Current Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Proposed Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Impact</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {conversionFields.map((field, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{field.currentField}</td>
                  <td className="px-4 py-3 text-sm">{field.currentType}</td>
                  <td className="px-4 py-3 text-sm font-mono text-green-600">{field.proposedField}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      field.impact === 'Low' ? 'bg-green-100 text-green-800' :
                      field.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {field.impact}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{field.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">Low Impact ({lowImpact.length})</h2>
          <p className="text-green-700 mb-4">Fields that require minimal changes:</p>
          <ul className="text-sm space-y-1">
            {lowImpact.map((field, index) => (
              <li key={index} className="flex justify-between">
                <span className="font-mono">{field.currentField}</span>
                <span className="text-green-600">→</span>
                <span className="font-mono text-green-600">{field.proposedField}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">Medium Impact ({mediumImpact.length})</h2>
          <p className="text-yellow-700 mb-4">Fields that require moderate changes:</p>
          <ul className="text-sm space-y-1">
            {mediumImpact.map((field, index) => (
              <li key={index} className="flex justify-between">
                <span className="font-mono">{field.currentField}</span>
                <span className="text-yellow-600">→</span>
                <span className="font-mono text-yellow-600">{field.proposedField}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-800">High Impact ({highImpact.length})</h2>
          <p className="text-red-700 mb-4">Fields that require major changes:</p>
          <ul className="text-sm space-y-1">
            {highImpact.map((field, index) => (
              <li key={index} className="flex justify-between">
                <span className="font-mono">{field.currentField}</span>
                <span className="text-red-600">→</span>
                <span className="font-mono text-red-600">{field.proposedField}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Files That Need Updates */}
      <div className="bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">📁 Files That Need Updates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-600 mb-2">Core Type Files</h3>
            <ul className="text-sm space-y-1">
              <li>📄 <code>src/types/subscription.ts</code> - Main interface</li>
              <li>📄 <code>src/lib/supabase-types.ts</code> - Transformation functions</li>
              <li>📄 <code>src/lib/supabase-sync.ts</code> - Sync functions</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-blue-600 mb-2">Component Files</h3>
            <ul className="text-sm space-y-1">
              <li>📄 <code>src/components/add-subscription-modal.tsx</code></li>
              <li>📄 <code>src/components/update-subscription-form.tsx</code></li>
              <li>📄 <code>src/components/subscriptions-table.tsx</code></li>
              <li>📄 <code>src/components/enhanced-subscription-card.tsx</code></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-purple-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">🎯 Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-purple-600 mb-2">Conversion Strategy</h3>
            <ul className="text-sm space-y-1">
              <li>1. Start with type definitions</li>
              <li>2. Update transformation functions</li>
              <li>3. Update form components</li>
              <li>4. Update display components</li>
              <li>5. Test thoroughly</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-purple-600 mb-2">Testing Strategy</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Test form submissions</li>
              <li>✅ Test data display</li>
              <li>✅ Test sync functionality</li>
              <li>✅ Test all field mappings</li>
              <li>✅ Verify no data loss</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
