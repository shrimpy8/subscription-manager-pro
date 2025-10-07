"use client";

import { useState, useEffect } from 'react';

interface ColumnNameMapping {
  formField: string;
  formLabel: string;
  databaseColumn: string;
  reason: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  suggestion: string;
}

export default function ColumnNameMappingPage() {
  const [mappings, setMappings] = useState<ColumnNameMapping[]>([]);

  useEffect(() => {
    const columnMappings: ColumnNameMapping[] = [
      // Easy to understand mappings
      {
        formField: 'name',
        formLabel: 'Subscription Name',
        databaseColumn: 'name',
        reason: 'Direct match',
        difficulty: 'Easy',
        suggestion: 'Perfect match - no confusion'
      },
      {
        formField: 'category',
        formLabel: 'Category',
        databaseColumn: 'category',
        reason: 'Direct match',
        difficulty: 'Easy',
        suggestion: 'Perfect match - no confusion'
      },
      {
        formField: 'cost',
        formLabel: 'Cost',
        databaseColumn: 'cost',
        reason: 'Direct match',
        difficulty: 'Easy',
        suggestion: 'Perfect match - no confusion'
      },

      // Medium difficulty mappings
      {
        formField: 'billingCycle',
        formLabel: 'Billing Cycle',
        databaseColumn: 'billing_cycle',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Medium',
        suggestion: 'Standard database naming convention'
      },
      {
        formField: 'startDate',
        formLabel: 'Start Date',
        databaseColumn: 'start_date',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Medium',
        suggestion: 'Standard database naming convention'
      },
      {
        formField: 'renewalDate',
        formLabel: 'Renewal Date',
        databaseColumn: 'renewal_date',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Medium',
        suggestion: 'Standard database naming convention'
      },
      {
        formField: 'accountEmail',
        formLabel: 'Account Email',
        databaseColumn: 'account_email',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Medium',
        suggestion: 'Standard database naming convention'
      },
      {
        formField: 'autoRenew',
        formLabel: 'Auto Renew',
        databaseColumn: 'auto_renew',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Medium',
        suggestion: 'Standard database naming convention'
      },
      {
        formField: 'usageFrequency',
        formLabel: 'Usage Frequency',
        databaseColumn: 'usage_frequency',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Medium',
        suggestion: 'Standard database naming convention'
      },

      // Hard to understand mappings
      {
        formField: 'logoUrl',
        formLabel: 'Logo URL',
        databaseColumn: 'logo_url',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - logo vs logo_url'
      },
      {
        formField: 'fallbackIcon',
        formLabel: 'Fallback Icon',
        databaseColumn: 'fallback_icon',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - icon vs fallback_icon'
      },
      {
        formField: 'secretKey',
        formLabel: 'Secret Key',
        databaseColumn: 'secret_key',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - key vs secret_key'
      },
      {
        formField: 'chinaRegionOnly',
        formLabel: 'China Region Only',
        databaseColumn: 'china_region_only',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - region vs china_region_only'
      },
      {
        formField: 'safeForWork',
        formLabel: 'Safe for Work',
        databaseColumn: 'safe_for_work',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - work vs safe_for_work'
      },
      {
        formField: 'a16zRank',
        formLabel: 'A16Z Rank',
        databaseColumn: 'a16z_rank',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - rank vs a16z_rank'
      },

      // Very confusing mappings
      {
        formField: 'logo',
        formLabel: 'Logo',
        databaseColumn: 'logo',
        reason: 'Direct match but different from logo_url',
        difficulty: 'Hard',
        suggestion: 'Very confusing - logo vs logo_url distinction unclear'
      },
      {
        formField: 'promoCode',
        formLabel: 'Promo Code',
        databaseColumn: 'promo_code',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - code vs promo_code'
      },
      {
        formField: 'promoDiscount',
        formLabel: 'Promo Discount',
        databaseColumn: 'promo_discount',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - discount vs promo_discount'
      },
      {
        formField: 'productivityScore',
        formLabel: 'Productivity Score',
        databaseColumn: 'productivity_score',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - score vs productivity_score'
      },
      {
        formField: 'lastUsed',
        formLabel: 'Last Used',
        databaseColumn: 'last_used',
        reason: 'CamelCase to snake_case conversion',
        difficulty: 'Hard',
        suggestion: 'Could be confusing - used vs last_used'
      }
    ];

    setMappings(columnMappings);
  }, []);

  const easyMappings = mappings.filter(m => m.difficulty === 'Easy');
  const mediumMappings = mappings.filter(m => m.difficulty === 'Medium');
  const hardMappings = mappings.filter(m => m.difficulty === 'Hard');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Column Name Mapping Analysis</h1>
      
      {/* Problem Explanation */}
      <div className="bg-red-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-red-800">🚨 The Problem</h2>
          <p className="text-red-700 mb-4">
            Database column names don&apos;t match form field names, making it difficult to understand which column belongs to what form field.
          </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-red-600 mb-2">Form Field Names</h3>
            <ul className="text-sm space-y-1">
              <li>• <code>billingCycle</code> (camelCase)</li>
              <li>• <code>startDate</code> (camelCase)</li>
              <li>• <code>accountEmail</code> (camelCase)</li>
              <li>• <code>autoRenew</code> (camelCase)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-red-600 mb-2">Database Column Names</h3>
            <ul className="text-sm space-y-1">
              <li>• <code>billing_cycle</code> (snake_case)</li>
              <li>• <code>start_date</code> (snake_case)</li>
              <li>• <code>account_email</code> (snake_case)</li>
              <li>• <code>auto_renew</code> (snake_case)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Solutions */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">💡 Solutions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">1. Naming Convention</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Use consistent naming</li>
              <li>✅ Document mappings</li>
              <li>✅ Use aliases in queries</li>
              <li>✅ Create mapping tables</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">2. Documentation</h3>
            <ul className="text-sm space-y-1">
              <li>📝 Field mapping docs</li>
              <li>📝 Database schema docs</li>
              <li>📝 API documentation</li>
              <li>📝 Code comments</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-blue-600 mb-2">3. Code Organization</h3>
            <ul className="text-sm space-y-1">
              <li>🔧 Transformation functions</li>
              <li>🔧 Mapping utilities</li>
              <li>🔧 Type definitions</li>
              <li>🔧 Validation schemas</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Difficulty Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Easy Mappings */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-green-800">✅ Easy Mappings ({easyMappings.length})</h2>
          <p className="text-green-700 mb-4">Direct matches between form fields and database columns.</p>
          <div className="space-y-2">
            {easyMappings.map((mapping, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{mapping.formField}</span>
                  <span className="text-green-600">→</span>
                  <span className="font-mono text-sm">{mapping.databaseColumn}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Medium Mappings */}
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Medium Mappings ({mediumMappings.length})</h2>
          <p className="text-yellow-700 mb-4">CamelCase to snake_case conversion - standard but requires knowledge.</p>
          <div className="space-y-2">
            {mediumMappings.map((mapping, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{mapping.formField}</span>
                  <span className="text-yellow-600">→</span>
                  <span className="font-mono text-sm">{mapping.databaseColumn}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{mapping.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Hard Mappings */}
        <div className="bg-red-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-red-800">❌ Hard Mappings ({hardMappings.length})</h2>
          <p className="text-red-700 mb-4">Confusing mappings that are difficult to understand.</p>
          <div className="space-y-2">
            {hardMappings.map((mapping, index) => (
              <div key={index} className="bg-white p-3 rounded border">
                <div className="flex justify-between items-center">
                  <span className="font-mono text-sm">{mapping.formField}</span>
                  <span className="text-red-600">→</span>
                  <span className="font-mono text-sm">{mapping.databaseColumn}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">{mapping.suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Detailed Mappings Table */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Complete Field Mappings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form Label</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Column</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Difficulty</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Suggestion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mappings.map((mapping, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{mapping.formField}</td>
                  <td className="px-4 py-3 text-sm">{mapping.formLabel}</td>
                  <td className="px-4 py-3 text-sm font-mono">{mapping.databaseColumn}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      mapping.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                      mapping.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {mapping.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{mapping.reason}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">{mapping.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-indigo-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">🎯 Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-indigo-600 mb-2">Immediate Actions</h3>
            <ul className="text-sm space-y-1">
              <li>📝 Create field mapping documentation</li>
              <li>📝 Add comments to database schema</li>
              <li>📝 Document transformation functions</li>
              <li>📝 Create mapping utilities</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-indigo-600 mb-2">Long-term Solutions</h3>
            <ul className="text-sm space-y-1">
              <li>🔧 Standardize naming conventions</li>
              <li>🔧 Create automated mapping tools</li>
              <li>🔧 Implement field validation</li>
              <li>🔧 Add database constraints</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
