"use client";

import { useState, useEffect } from 'react';

interface FormFieldMapping {
  formField: string;
  formComponent: string;
  databaseTable: string;
  databaseField: string;
  dataType: string;
  required: boolean;
  defaultValue?: string | number | boolean | null | string[] | number[] | boolean[] | Record<string, unknown>;
  validation?: string;
}

export default function FormDatabaseMappingPage() {
  const [mappings, setMappings] = useState<FormFieldMapping[]>([]);

  useEffect(() => {
    // Define form field to database mappings
    const formMappings: FormFieldMapping[] = [
      // Basic Information Fields
      {
        formField: 'name',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'name',
        dataType: 'VARCHAR(255)',
        required: true,
        validation: 'Required, max 255 characters'
      },
      {
        formField: 'category',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'category',
        dataType: 'VARCHAR(50)',
        required: true,
        defaultValue: 'AI Tools',
        validation: 'Must be one of: AI Tools, Productivity, Entertainment, Development, Design, Marketing, Other'
      },
      {
        formField: 'subcategory',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'subcategory',
        dataType: 'VARCHAR(50)',
        required: false,
        validation: 'Optional, max 50 characters'
      },
      {
        formField: 'description',
        formComponent: 'Textarea',
        databaseTable: 'subscriptions',
        databaseField: 'description',
        dataType: 'TEXT',
        required: false,
        validation: 'Optional, unlimited text'
      },
      {
        formField: 'url',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'url',
        dataType: 'TEXT',
        required: false,
        validation: 'Optional, must be valid URL'
      },
      {
        formField: 'logo',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'logo',
        dataType: 'TEXT',
        required: false,
        validation: 'Optional, logo URL or base64'
      },

      // Plan and Pricing Fields
      {
        formField: 'plan',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'plan',
        dataType: 'VARCHAR(100)',
        required: false,
        defaultValue: 'Free',
        validation: 'Must be one of: Free, Basic, Pro, Premium, Enterprise, Max, Ultra'
      },
      {
        formField: 'cost',
        formComponent: 'Input (number)',
        databaseTable: 'subscriptions',
        databaseField: 'cost',
        dataType: 'DECIMAL(10,2)',
        required: true,
        defaultValue: 0,
        validation: 'Required, must be number >= 0'
      },
      {
        formField: 'currency',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'currency',
        dataType: 'VARCHAR(3)',
        required: false,
        defaultValue: 'USD',
        validation: 'Must be valid currency code (USD, EUR, GBP, etc.)'
      },
      {
        formField: 'billingCycle',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'billing_cycle',
        dataType: 'VARCHAR(20)',
        required: true,
        defaultValue: 'Monthly',
        validation: 'Must be one of: Monthly, Yearly, Weekly, Quarterly, Free'
      },

      // Status and Lifecycle Fields
      {
        formField: 'status',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'status',
        dataType: 'VARCHAR(20)',
        required: true,
        defaultValue: 'active',
        validation: 'Must be one of: active, paused, canceled'
      },
      {
        formField: 'startDate',
        formComponent: 'Date Input',
        databaseTable: 'subscriptions',
        databaseField: 'start_date',
        dataType: 'TIMESTAMPTZ',
        required: true,
        defaultValue: 'Current date',
        validation: 'Required, must be valid date'
      },
      {
        formField: 'renewalDate',
        formComponent: 'Date Input',
        databaseTable: 'subscriptions',
        databaseField: 'renewal_date',
        dataType: 'TIMESTAMPTZ',
        required: true,
        defaultValue: '30 days from start',
        validation: 'Required, must be valid date'
      },
      {
        formField: 'autoRenew',
        formComponent: 'Checkbox',
        databaseTable: 'subscriptions',
        databaseField: 'auto_renew',
        dataType: 'BOOLEAN',
        required: false,
        defaultValue: true,
        validation: 'Boolean value'
      },

      // Usage and Priority Fields
      {
        formField: 'priority',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'priority',
        dataType: 'VARCHAR(10)',
        required: true,
        defaultValue: 'medium',
        validation: 'Must be one of: low, medium, high'
      },
      {
        formField: 'usageFrequency',
        formComponent: 'Select',
        databaseTable: 'subscriptions',
        databaseField: 'usage_frequency',
        dataType: 'VARCHAR(20)',
        required: false,
        defaultValue: 'monthly',
        validation: 'Must be one of: daily, weekly, monthly, rarely'
      },

      // Account and Contact Fields
      {
        formField: 'email',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'account_email',
        dataType: 'VARCHAR(255)',
        required: false,
        validation: 'Optional, must be valid email if provided'
      },
      {
        formField: 'notes',
        formComponent: 'Textarea',
        databaseTable: 'subscriptions',
        databaseField: 'notes',
        dataType: 'TEXT',
        required: false,
        validation: 'Optional, unlimited text'
      },

      // Advanced Fields (from AIToolSubscriptionForm)
      {
        formField: 'logoUrl',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'logo_url',
        dataType: 'TEXT',
        required: false,
        validation: 'Optional, must be valid URL'
      },
      {
        formField: 'fallbackIcon',
        formComponent: 'Input',
        databaseTable: 'subscriptions',
        databaseField: 'fallback_icon',
        dataType: 'VARCHAR(10)',
        required: false,
        defaultValue: '🤖',
        validation: 'Optional, emoji or icon'
      },
      {
        formField: 'secretKey',
        formComponent: 'Input (password)',
        databaseTable: 'subscriptions',
        databaseField: 'secret_key',
        dataType: 'TEXT',
        required: false,
        validation: 'Optional, sensitive data'
      },
      {
        formField: 'chinaRegionOnly',
        formComponent: 'Checkbox',
        databaseTable: 'subscriptions',
        databaseField: 'china_region_only',
        dataType: 'BOOLEAN',
        required: false,
        defaultValue: false,
        validation: 'Boolean value'
      },
      {
        formField: 'safeForWork',
        formComponent: 'Checkbox',
        databaseTable: 'subscriptions',
        databaseField: 'safe_for_work',
        dataType: 'BOOLEAN',
        required: false,
        defaultValue: true,
        validation: 'Boolean value'
      },

      // Array Fields (stored in related tables)
      {
        formField: 'previouslyUsedPromotionCode',
        formComponent: 'Array Input',
        databaseTable: 'subscription_promotions',
        databaseField: 'code',
        dataType: 'VARCHAR(100)',
        required: false,
        validation: 'Array of promotion codes'
      },
      {
        formField: 'accountEmailsUsedPreviously',
        formComponent: 'Array Input',
        databaseTable: 'subscription_emails',
        databaseField: 'email',
        dataType: 'VARCHAR(255)',
        required: false,
        validation: 'Array of email addresses'
      },
      {
        formField: 'apiAccessKeys',
        formComponent: 'Array Input',
        databaseTable: 'subscription_api_keys',
        databaseField: 'key_value',
        dataType: 'TEXT',
        required: false,
        validation: 'Array of API keys'
      },

      // Auto-generated Fields
      {
        formField: 'id',
        formComponent: 'Auto-generated',
        databaseTable: 'subscriptions',
        databaseField: 'id',
        dataType: 'UUID',
        required: true,
        defaultValue: 'Generated UUID',
        validation: 'Auto-generated unique identifier'
      },
      {
        formField: 'created_at',
        formComponent: 'Auto-generated',
        databaseTable: 'subscriptions',
        databaseField: 'created_at',
        dataType: 'TIMESTAMPTZ',
        required: true,
        defaultValue: 'Current timestamp',
        validation: 'Auto-generated timestamp'
      },
      {
        formField: 'updated_at',
        formComponent: 'Auto-generated',
        databaseTable: 'subscriptions',
        databaseField: 'updated_at',
        dataType: 'TIMESTAMPTZ',
        required: true,
        defaultValue: 'Current timestamp',
        validation: 'Auto-generated timestamp'
      }
    ];

    setMappings(formMappings);
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Add Subscription Form to Database Mapping</h1>
      
      {/* Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Form Components</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Input:</strong> Text fields</p>
            <p><strong>Select:</strong> Dropdown menus</p>
            <p><strong>Textarea:</strong> Multi-line text</p>
            <p><strong>Checkbox:</strong> Boolean values</p>
            <p><strong>Date Input:</strong> Date pickers</p>
            <p><strong>Array Input:</strong> Dynamic lists</p>
          </div>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
          <div className="space-y-2 text-sm">
            <p><strong>subscriptions:</strong> Main data</p>
            <p><strong>subscription_tags:</strong> Tags</p>
            <p><strong>subscription_alternatives:</strong> Alternatives</p>
            <p><strong>subscription_api_keys:</strong> API keys</p>
            <p><strong>subscription_emails:</strong> Email history</p>
            <p><strong>subscription_promotions:</strong> Promo codes</p>
          </div>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Data Types</h2>
          <div className="space-y-2 text-sm">
            <p><strong>VARCHAR:</strong> Text fields</p>
            <p><strong>TEXT:</strong> Long text</p>
            <p><strong>DECIMAL:</strong> Numbers</p>
            <p><strong>BOOLEAN:</strong> True/False</p>
            <p><strong>TIMESTAMPTZ:</strong> Dates</p>
            <p><strong>UUID:</strong> Unique IDs</p>
          </div>
        </div>

        <div className="bg-orange-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Validation</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Required:</strong> Must be filled</p>
            <p><strong>Optional:</strong> Can be empty</p>
            <p><strong>Format:</strong> Specific patterns</p>
            <p><strong>Range:</strong> Min/max values</p>
            <p><strong>Enum:</strong> Limited options</p>
            <p><strong>Auto:</strong> Generated values</p>
          </div>
        </div>
      </div>

      {/* Detailed Mappings */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b">
          <h2 className="text-xl font-semibold">Form Field Mappings</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Form Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Component</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Table</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Database Field</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Data Type</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Required</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Default</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Validation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {mappings.map((mapping, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono">{mapping.formField}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {mapping.formComponent}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {mapping.databaseTable}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">{mapping.databaseField}</td>
                  <td className="px-4 py-3 text-sm font-mono">{mapping.dataType}</td>
                  <td className="px-4 py-3 text-sm">
                    {mapping.required ? (
                      <span className="text-red-600 font-semibold">Yes</span>
                    ) : (
                      <span className="text-gray-500">No</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {(() => {
                      const v = mapping.defaultValue;
                      if (v === undefined || v === null || v === false) return '-';
                      if (Array.isArray(v)) return v.join(', ');
                      if (typeof v === 'object') return JSON.stringify(v);
                      return String(v);
                    })()}
                  </td>
                  <td className="px-4 py-3 text-sm text-xs text-gray-600 max-w-xs truncate">
                    {mapping.validation}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Flow */}
      <div className="mt-8 bg-indigo-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-indigo-800">📝 Form Submission Flow</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-indigo-600 mb-2">1. Form Validation</h3>
            <ul className="text-sm space-y-1">
              <li>✅ Required fields checked</li>
              <li>✅ Data types validated</li>
              <li>✅ Format validation (email, URL)</li>
              <li>✅ Range validation (cost &gt;= 0)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-indigo-600 mb-2">2. Data Transformation</h3>
            <ul className="text-sm space-y-1">
              <li>🔄 String to number (cost)</li>
              <li>🔄 String to date (startDate, renewalDate)</li>
              <li>🔄 String to boolean (autoRenew)</li>
              <li>🔄 Generate UUID (id)</li>
            </ul>
          </div>
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-indigo-600 mb-2">3. Database Storage</h3>
            <ul className="text-sm space-y-1">
              <li>💾 Insert into subscriptions table</li>
              <li>💾 Create related records (tags, emails)</li>
              <li>💾 Set timestamps (created_at, updated_at)</li>
              <li>💾 Return success/error response</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Array Fields Handling */}
      <div className="mt-8 bg-yellow-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-yellow-800">📋 Array Fields Handling</h2>
        <p className="text-yellow-700 mb-4">Some form fields are arrays that need special handling:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-yellow-600 mb-2">Form Arrays</h3>
            <ul className="text-sm space-y-1">
              <li>📝 <code>previouslyUsedPromotionCode[]</code></li>
              <li>📝 <code>accountEmailsUsedPreviously[]</code></li>
              <li>📝 <code>apiAccessKeys[]</code></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-600 mb-2">Database Storage</h3>
            <ul className="text-sm space-y-1">
              <li>🗄️ <code>subscription_promotions</code> table</li>
              <li>🗄️ <code>subscription_emails</code> table</li>
              <li>🗄️ <code>subscription_api_keys</code> table</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
