"use client";

import { useState, useEffect } from 'react';
import { getLocalSubscriptions } from '@/lib/supabase-sync';
import { Subscription } from '@/types/subscription';

interface FieldMapping {
  localStorageField: string;
  supabaseField: string;
  table: string;
  dataType: string;
  required: boolean;
  mapped: boolean;
  sampleValue?: string | number | boolean | null | string[] | number[] | boolean[] | Record<string, unknown>;
}

export default function FieldMappingTestPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>([]);
  const [unmappedFields, setUnmappedFields] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      const data = getLocalSubscriptions();
      setSubscriptions(data);
      
      if (data.length > 0) {
        analyzeFieldMappings(data[0]);
      }
    }
  }, []);

  const analyzeFieldMappings = (sampleSubscription: Subscription) => {
    // Show the actual transformation that happens in the sync function
    console.log('Sample subscription keys:', Object.keys(sampleSubscription));
    
    // Define the Supabase schema mapping
    const supabaseSchema = {
      // Main subscriptions table fields
      subscriptions: {
        id: { type: 'UUID', required: true },
        name: { type: 'VARCHAR(255)', required: true },
        plan: { type: 'VARCHAR(100)', required: false },
        logo: { type: 'TEXT', required: false },
        logo_url: { type: 'TEXT', required: false },
        fallback_icon: { type: 'VARCHAR(10)', required: false },
        cost: { type: 'DECIMAL(10,2)', required: true },
        currency: { type: 'VARCHAR(3)', required: false },
        billing_cycle: { type: 'VARCHAR(20)', required: true },
        category: { type: 'VARCHAR(50)', required: true },
        subcategory: { type: 'VARCHAR(50)', required: false },
        description: { type: 'TEXT', required: false },
        url: { type: 'TEXT', required: false },
        notes: { type: 'TEXT', required: false },
        status: { type: 'VARCHAR(20)', required: true },
        auto_renew: { type: 'BOOLEAN', required: false },
        start_date: { type: 'TIMESTAMPTZ', required: true },
        renewal_date: { type: 'TIMESTAMPTZ', required: true },
        last_used: { type: 'TIMESTAMPTZ', required: false },
        account_email: { type: 'VARCHAR(255)', required: false },
        secret_key: { type: 'TEXT', required: false },
        promo_code: { type: 'VARCHAR(100)', required: false },
        promo_discount: { type: 'DECIMAL(5,2)', required: false },
        latest_promotion_code: { type: 'VARCHAR(100)', required: false },
        priority: { type: 'VARCHAR(10)', required: true },
        usage_frequency: { type: 'VARCHAR(20)', required: false },
        productivity_score: { type: 'INTEGER', required: false },
        safe_for_work: { type: 'BOOLEAN', required: false },
        china_region_only: { type: 'BOOLEAN', required: false },
        a16z_rank: { type: 'INTEGER', required: false },
        created_at: { type: 'TIMESTAMPTZ', required: false },
        updated_at: { type: 'TIMESTAMPTZ', required: false }
      },
      // Related tables
      subscription_tags: {
        subscription_id: { type: 'UUID', required: true },
        tag: { type: 'VARCHAR(100)', required: true }
      },
      subscription_alternatives: {
        subscription_id: { type: 'UUID', required: true },
        service_name: { type: 'VARCHAR(255)', required: true }
      },
      subscription_api_keys: {
        subscription_id: { type: 'UUID', required: true },
        key_name: { type: 'VARCHAR(100)', required: true },
        key_value: { type: 'TEXT', required: true }
      },
      subscription_emails: {
        subscription_id: { type: 'UUID', required: true },
        email: { type: 'VARCHAR(255)', required: true }
      },
      subscription_promotions: {
        subscription_id: { type: 'UUID', required: true },
        code: { type: 'VARCHAR(100)', required: true },
        discount_percentage: { type: 'DECIMAL(5,2)', required: false }
      }
    };

    // Field mapping rules
    const fieldMappings: FieldMapping[] = [
      // Direct mappings to subscriptions table
      { localStorageField: 'Name', supabaseField: 'name', table: 'subscriptions', dataType: 'VARCHAR(255)', required: true, mapped: true, sampleValue: sampleSubscription.name },
      { localStorageField: 'Category', supabaseField: 'category', table: 'subscriptions', dataType: 'VARCHAR(50)', required: true, mapped: true, sampleValue: sampleSubscription.category },
      { localStorageField: 'Subcategory', supabaseField: 'subcategory', table: 'subscriptions', dataType: 'VARCHAR(50)', required: false, mapped: true, sampleValue: sampleSubscription.subcategory ?? '' },
      { localStorageField: 'Plan', supabaseField: 'plan', table: 'subscriptions', dataType: 'VARCHAR(100)', required: false, mapped: true, sampleValue: sampleSubscription.plan },
      { localStorageField: 'Cost', supabaseField: 'cost', table: 'subscriptions', dataType: 'DECIMAL(10,2)', required: true, mapped: true, sampleValue: sampleSubscription.cost },
      { localStorageField: 'Currency', supabaseField: 'currency', table: 'subscriptions', dataType: 'VARCHAR(3)', required: false, mapped: true, sampleValue: sampleSubscription.currency },
      { localStorageField: 'Billing Cycle', supabaseField: 'billing_cycle', table: 'subscriptions', dataType: 'VARCHAR(20)', required: true, mapped: true, sampleValue: sampleSubscription.billing_cycle },
      { localStorageField: 'Status', supabaseField: 'status', table: 'subscriptions', dataType: 'VARCHAR(20)', required: true, mapped: true, sampleValue: sampleSubscription.status },
      { localStorageField: 'Start Date', supabaseField: 'start_date', table: 'subscriptions', dataType: 'TIMESTAMPTZ', required: true, mapped: true, sampleValue: sampleSubscription.start_date.toISOString() },
      { localStorageField: 'Renewal Date', supabaseField: 'renewal_date', table: 'subscriptions', dataType: 'TIMESTAMPTZ', required: true, mapped: true, sampleValue: sampleSubscription.renewal_date.toISOString() },
      { localStorageField: 'Priority', supabaseField: 'priority', table: 'subscriptions', dataType: 'VARCHAR(10)', required: true, mapped: true, sampleValue: sampleSubscription.usage_importance },
      { localStorageField: 'Usage Frequency', supabaseField: 'usage_frequency', table: 'subscriptions', dataType: 'VARCHAR(20)', required: false, mapped: true, sampleValue: sampleSubscription.usage_frequency },
      { localStorageField: 'URL', supabaseField: 'url', table: 'subscriptions', dataType: 'TEXT', required: false, mapped: true, sampleValue: sampleSubscription.url },
      { localStorageField: 'Description', supabaseField: 'description', table: 'subscriptions', dataType: 'TEXT', required: false, mapped: true, sampleValue: sampleSubscription.description },
      { localStorageField: 'Notes', supabaseField: 'notes', table: 'subscriptions', dataType: 'TEXT', required: false, mapped: true, sampleValue: sampleSubscription.notes ?? '' },
      { localStorageField: 'Account Email', supabaseField: 'account_email', table: 'subscriptions', dataType: 'VARCHAR(255)', required: false, mapped: true, sampleValue: sampleSubscription.account_email },
      { localStorageField: 'Auto Renew', supabaseField: 'auto_renew', table: 'subscriptions', dataType: 'BOOLEAN', required: false, mapped: true, sampleValue: sampleSubscription.auto_renew },
      { localStorageField: 'Safe for Work', supabaseField: 'safe_for_work', table: 'subscriptions', dataType: 'BOOLEAN', required: false, mapped: true, sampleValue: sampleSubscription.safe_for_work ?? false },
      { localStorageField: 'China Region Only', supabaseField: 'china_region_only', table: 'subscriptions', dataType: 'BOOLEAN', required: false, mapped: true, sampleValue: sampleSubscription.china_region_only ?? false },
      { localStorageField: 'a16z Rank', supabaseField: 'a16z_rank', table: 'subscriptions', dataType: 'INTEGER', required: false, mapped: true, sampleValue: sampleSubscription.a16z_rank ?? 0 },
      
      // Fields that need to be mapped to related tables
      { localStorageField: 'tags', supabaseField: 'tag', table: 'subscription_tags', dataType: 'VARCHAR(100)', required: false, mapped: false, sampleValue: sampleSubscription.tags ?? [] },
      { localStorageField: 'alternativeServices', supabaseField: 'service_name', table: 'subscription_alternatives', dataType: 'VARCHAR(255)', required: false, mapped: false, sampleValue: sampleSubscription.alternative_services ?? [] },
      { localStorageField: 'secretKey', supabaseField: 'key_value', table: 'subscription_api_keys', dataType: 'TEXT', required: false, mapped: false, sampleValue: sampleSubscription.secret_key ?? '' },
      { localStorageField: 'accountEmailsUsedPreviously', supabaseField: 'email', table: 'subscription_emails', dataType: 'VARCHAR(255)', required: false, mapped: false, sampleValue: sampleSubscription.account_emails_used_previously ?? [] },
      { localStorageField: 'previouslyUsedPromotionCode', supabaseField: 'code', table: 'subscription_promotions', dataType: 'VARCHAR(100)', required: false, mapped: false, sampleValue: sampleSubscription.previously_used_promotion_code ?? [] },
      { localStorageField: 'latestPromotionCode', supabaseField: 'code', table: 'subscription_promotions', dataType: 'VARCHAR(100)', required: false, mapped: false, sampleValue: sampleSubscription.latest_promocode ?? '' },
      { localStorageField: 'promoCode', supabaseField: 'code', table: 'subscription_promotions', dataType: 'VARCHAR(100)', required: false, mapped: false, sampleValue: sampleSubscription.promo_code ?? '' },
      { localStorageField: 'promoDiscount', supabaseField: 'discount_percentage', table: 'subscription_promotions', dataType: 'DECIMAL(5,2)', required: false, mapped: false, sampleValue: sampleSubscription.promo_discount ?? 0 },
    ];

    setFieldMappings(fieldMappings);

    // Find unmapped fields
    const allLocalStorageFields = Object.keys(sampleSubscription);
    const mappedFields = fieldMappings.map(f => f.localStorageField);
    const unmapped = allLocalStorageFields.filter(field => !mappedFields.includes(field));
    setUnmappedFields(unmapped);
  };

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Field Mapping Analysis</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Summary Stats */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Summary</h2>
          <div className="space-y-2">
            <p><strong>Total Subscriptions:</strong> {subscriptions.length}</p>
            <p><strong>Mapped Fields:</strong> {fieldMappings.filter(f => f.mapped).length}</p>
            <p><strong>Unmapped Fields:</strong> {unmappedFields.length}</p>
            <p><strong>Related Table Fields:</strong> {fieldMappings.filter(f => !f.mapped).length}</p>
          </div>
        </div>

        {/* Field Mappings */}
        <div className="bg-green-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Field Mappings</h2>
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">localStorage</th>
                  <th className="text-left p-2">Supabase</th>
                  <th className="text-left p-2">Table</th>
                  <th className="text-left p-2">Type</th>
                </tr>
              </thead>
              <tbody>
                {fieldMappings.map((mapping, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-mono text-xs">{mapping.localStorageField}</td>
                    <td className="p-2 font-mono text-xs">{mapping.supabaseField}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        mapping.table === 'subscriptions' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {mapping.table}
                      </span>
                    </td>
                    <td className="p-2 text-xs">{mapping.dataType}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Unmapped Fields */}
      {unmappedFields.length > 0 && (
        <div className="mt-6 bg-yellow-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">⚠️ Unmapped Fields</h2>
          <p className="text-yellow-700 mb-4">These fields exist in localStorage but are not mapped to any Supabase table:</p>
          <div className="flex flex-wrap gap-2">
            {unmappedFields.map((field, index) => (
              <span key={index} className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-sm">
                {field}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Related Tables */}
      <div className="mt-6 bg-orange-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-orange-800">📋 Related Table Fields</h2>
        <p className="text-orange-700 mb-4">These fields need to be stored in separate related tables:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {['subscription_tags', 'subscription_alternatives', 'subscription_api_keys', 'subscription_emails', 'subscription_promotions'].map(table => {
            const tableFields = fieldMappings.filter(f => f.table === table);
            return (
              <div key={table} className="bg-white p-4 rounded border">
                <h3 className="font-semibold text-orange-800 mb-2">{table}</h3>
                <ul className="text-sm space-y-1">
                  {tableFields.map((field, index) => (
                    <li key={index} className="text-gray-600">
                      {field.localStorageField} → {field.supabaseField}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missing Fields */}
      <div className="mt-6 bg-red-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-red-800">⚠️ Missing Fields</h2>
        <p className="text-red-700 mb-4">These database fields are NOT in your CSV data:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-red-600 mb-2">Database Fields Missing from CSV</h3>
            <ul className="text-sm space-y-1">
              <li>❌ <code>logo_url</code> - Not in CSV (only <code>logo</code> exists)</li>
              <li>❌ <code>fallback_icon</code> - Not in CSV (using default &apos;📦&apos;)</li>
              <li>❌ <code>created_at</code> - Auto-generated by database</li>
              <li>❌ <code>updated_at</code> - Auto-generated by database</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-600 mb-2">How They&apos;re Handled</h3>
            <ul className="text-sm space-y-1">
              <li>✅ <code>logo_url</code> → <code>NULL</code> (not set)</li>
              <li>✅ <code>fallback_icon</code> → <code>&apos;📦&apos;</code> (default value)</li>
              <li>✅ <code>created_at</code> → Auto-generated</li>
              <li>✅ <code>updated_at</code> → Auto-generated</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Transformation Example */}
      <div className="mt-6 bg-purple-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4 text-purple-800">🔄 Field Transformation</h2>
        <p className="text-purple-700 mb-4">How CSV field names are transformed to database field names:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-red-600 mb-2">CSV Format (localStorage)</h3>
            <ul className="text-sm space-y-1">
              <li>&quot;Name&quot; → &quot;name&quot;</li>
              <li>&quot;Billing Cycle&quot; → &quot;billing_cycle&quot;</li>
              <li>&quot;Start Date&quot; → &quot;start_date&quot;</li>
              <li>&quot;Account Email&quot; → &quot;account_email&quot;</li>
              <li>&quot;Auto Renew&quot; → &quot;auto_renew&quot;</li>
              <li>&quot;Safe for Work&quot; → &quot;safe_for_work&quot;</li>
              <li>&quot;China Region Only&quot; → &quot;china_region_only&quot;</li>
              <li>&quot;Usage Frequency&quot; → &quot;usage_frequency&quot;</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-600 mb-2">Database Format (Supabase)</h3>
            <ul className="text-sm space-y-1">
              <li>✅ &quot;name&quot; (lowercase)</li>
              <li>✅ &quot;billing_cycle&quot; (underscore)</li>
              <li>✅ &quot;start_date&quot; (underscore)</li>
              <li>✅ &quot;account_email&quot; (underscore)</li>
              <li>✅ &quot;auto_renew&quot; (underscore)</li>
              <li>✅ &quot;safe_for_work&quot; (underscore)</li>
              <li>✅ &quot;china_region_only&quot; (underscore)</li>
              <li>✅ &quot;usage_frequency&quot; (underscore)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sample Data */}
      {subscriptions.length > 0 && (
        <div className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Sample Subscription Data (After Transformation)</h2>
          <pre className="bg-white p-4 rounded text-xs overflow-auto max-h-96">
            {JSON.stringify(subscriptions[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
