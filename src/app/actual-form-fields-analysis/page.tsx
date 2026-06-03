"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';

interface FormFieldAnalysis {
  formField: string;
  formName: string;
  currentType: string;
  databaseColumn: string;
  reason: string;
  status: 'Match' | 'Convert' | 'Missing';
}

export default function ActualFormFieldsAnalysisPage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }

  const [analyses, setAnalyses] = useState<FormFieldAnalysis[]>([]);

  useEffect(() => {
    // Analyze fields from both forms
    const formAnalyses: FormFieldAnalysis[] = [
      // Add Subscription Modal fields
      {
        formField: 'name',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'name',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'category',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'category',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'subcategory',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'subcategory',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'status',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'status',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'cost',
        formName: 'Add Subscription Modal',
        currentType: 'number',
        databaseColumn: 'cost',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'currency',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'currency',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'billingCycle',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'billing_cycle',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'plan',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'plan',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'renewalDate',
        formName: 'Add Subscription Modal',
        currentType: 'Date',
        databaseColumn: 'renewal_date',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'startDate',
        formName: 'Add Subscription Modal',
        currentType: 'Date',
        databaseColumn: 'start_date',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'priority',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'priority',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'usageFrequency',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'usage_frequency',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'notes',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'notes',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'url',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'url',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'email',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'account_email',
        reason: 'Convert to account_email',
        status: 'Convert'
      },
      {
        formField: 'description',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'description',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'logo',
        formName: 'Add Subscription Modal',
        currentType: 'string',
        databaseColumn: 'logo',
        reason: 'Direct match',
        status: 'Match'
      },
      {
        formField: 'autoRenew',
        formName: 'Add Subscription Modal',
        currentType: 'boolean',
        databaseColumn: 'auto_renew',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },

      // AI Tool Subscription Form fields (additional fields)
      {
        formField: 'logoUrl',
        formName: 'AI Tool Subscription Form',
        currentType: 'string',
        databaseColumn: 'logo_url',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'fallbackIcon',
        formName: 'AI Tool Subscription Form',
        currentType: 'string',
        databaseColumn: 'fallback_icon',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'accountEmailInUse',
        formName: 'AI Tool Subscription Form',
        currentType: 'string',
        databaseColumn: 'account_email',
        reason: 'Convert to account_email',
        status: 'Convert'
      },
      {
        formField: 'previouslyUsedPromotionCode',
        formName: 'AI Tool Subscription Form',
        currentType: 'string[]',
        databaseColumn: 'subscription_promotions',
        reason: 'Array field - stored in related table',
        status: 'Convert'
      },
      {
        formField: 'latestPromotionCode',
        formName: 'AI Tool Subscription Form',
        currentType: 'string',
        databaseColumn: 'latest_promotion_code',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'usageImportance',
        formName: 'AI Tool Subscription Form',
        currentType: 'string',
        databaseColumn: 'priority',
        reason: 'Maps to existing priority field (usageImportance → priority)',
        status: 'Convert'
      },
      {
        formField: 'accountEmailsUsedPreviously',
        formName: 'AI Tool Subscription Form',
        currentType: 'string[]',
        databaseColumn: 'subscription_emails',
        reason: 'Array field - stored in related table',
        status: 'Convert'
      },
      {
        formField: 'apiAccessKeys',
        formName: 'AI Tool Subscription Form',
        currentType: 'string[]',
        databaseColumn: 'subscription_api_keys',
        reason: 'Array field - stored in related table',
        status: 'Convert'
      },
      {
        formField: 'secretKey',
        formName: 'AI Tool Subscription Form',
        currentType: 'string',
        databaseColumn: 'secret_key',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'chinaRegionOnly',
        formName: 'AI Tool Subscription Form',
        currentType: 'boolean',
        databaseColumn: 'china_region_only',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      },
      {
        formField: 'safeForWork',
        formName: 'AI Tool Subscription Form',
        currentType: 'boolean',
        databaseColumn: 'safe_for_work',
        reason: 'Convert camelCase to snake_case',
        status: 'Convert'
      }
    ];

    setAnalyses(formAnalyses);
  }, []);

  const matchFields = analyses.filter(f => f.status === 'Match');
  const convertFields = analyses.filter(f => f.status === 'Convert');
  const addSubscriptionFields = analyses.filter(f => f.formName === 'Add Subscription Modal');
  const aiToolFields = analyses.filter(f => f.formName === 'AI Tool Subscription Form');

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Actual Form Fields Analysis</h1>
      
      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Direct Matches</h2>
          <p className="text-2xl font-bold text-green-600">{matchFields.length}</p>
          <p className="text-green-700 text-sm">No conversion needed</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Need Conversion</h2>
          <p className="text-2xl font-bold text-yellow-600">{convertFields.length}</p>
          <p className="text-yellow-700 text-sm">camelCase → snake_case</p>
        </div>
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Add Subscription</h2>
          <p className="text-2xl font-bold text-blue-600">{addSubscriptionFields.length}</p>
          <p className="text-blue-700 text-sm">Basic form fields</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">AI Tool Form</h2>
          <p className="text-2xl font-bold text-purple-600">{aiToolFields.length}</p>
          <p className="text-purple-700 text-sm">Advanced form fields</p>
        </div>
      </div>

      {/* Add Subscription Modal Fields */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-blue-800">📝 Add Subscription Modal Fields</h2>
        <p className="text-blue-700 mb-4">Basic subscription form with essential fields:</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Column</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {addSubscriptionFields.map((field, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{field.formField}</td>
                  <td className="px-4 py-3 text-sm">{field.currentType}</td>
                  <td className="px-4 py-3 text-sm font-mono">{field.databaseColumn}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      field.status === 'Match' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {field.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{field.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Tool Subscription Form Fields */}
      <div className="bg-purple-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">🤖 AI Tool Subscription Form Fields</h2>
        <p className="text-purple-700 mb-4">Advanced form with additional metadata fields:</p>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Column</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {aiToolFields.map((field, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{field.formField}</td>
                  <td className="px-4 py-3 text-sm">{field.currentType}</td>
                  <td className="px-4 py-3 text-sm font-mono">{field.databaseColumn}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`px-2 py-1 rounded text-xs ${
                      field.status === 'Match' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {field.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{field.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Summary */}
      <div className="bg-yellow-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">🔄 Fields That Need Conversion</h2>
        <p className="text-yellow-700 mb-4">These fields need to be converted from camelCase to snake_case:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {convertFields.map((field, index) => (
            <div key={index} className="bg-white p-4 rounded border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-sm">{field.formField}</span>
                <span className="text-yellow-600">→</span>
                <span className="font-mono text-sm text-green-600">{field.databaseColumn}</span>
              </div>
              <div className="text-xs text-gray-600">{field.reason}</div>
              <div className="text-xs text-blue-600 mt-1">{field.formName}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Database-only Fields */}
      <div className="bg-red-50 p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-4 text-red-800">⚠️ Database Fields NOT in Forms</h2>
        <p className="text-red-700 mb-4">These fields exist in the database but are NOT in either form:</p>
        <div className="bg-white p-4 rounded border">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-sm text-red-600">productivity_score</span>
            <span className="text-red-600">❌</span>
            <span className="text-sm text-gray-600">Not in any form</span>
          </div>
          <div className="text-xs text-gray-600">This field was added to the database but is not in your forms</div>
        </div>
      </div>

      {/* Array Fields */}
      <div className="bg-orange-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-orange-800">📋 Array Fields (Related Tables)</h2>
        <p className="text-orange-700 mb-4">These fields are stored in separate related tables:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">Array Fields</h3>
            <ul className="text-sm space-y-1">
              <li>📝 <code>previouslyUsedPromotionCode[]</code> → <code>subscription_promotions</code></li>
              <li>📝 <code>accountEmailsUsedPreviously[]</code> → <code>subscription_emails</code></li>
              <li>📝 <code>apiAccessKeys[]</code> → <code>subscription_api_keys</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-orange-600 mb-2">Related Tables</h3>
            <ul className="text-sm space-y-1">
              <li>🗄️ <code>subscription_promotions</code> - Promotion codes</li>
              <li>🗄️ <code>subscription_emails</code> - Email history</li>
              <li>🗄️ <code>subscription_api_keys</code> - API keys</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
