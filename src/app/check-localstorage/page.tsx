"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getLocalSubscriptions } from '@/lib/supabase-sync';

export default function CheckLocalStoragePage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0);
  const [rawData, setRawData] = useState<Record<string, unknown> | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Get raw localStorage data
      const raw = localStorage.getItem('subscription-manager-data');
      if (raw) {
        const parsed = JSON.parse(raw);
        setRawData(parsed);
        setSubscriptionCount(parsed.subscriptions?.length || 0);
      }
      
      // Also test the sync function
      const syncData = getLocalSubscriptions();
      console.log('Sync function result:', syncData.length, 'subscriptions');
    }
  }, []);

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">localStorage Subscription Count</h1>
      
      <div className="space-y-4">
        <div className="bg-blue-100 p-4 rounded">
          <h2 className="text-lg font-semibold">Total Subscriptions in localStorage</h2>
          <p className="text-2xl font-bold text-blue-600">{subscriptionCount}</p>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">Raw Data Structure</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(rawData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">All localStorage Keys</h2>
          <ul className="list-disc list-inside">
            {typeof window !== 'undefined' && Object.keys(localStorage).map(key => (
              <li key={key}>
                <strong>{key}</strong>: {localStorage.getItem(key)?.length || 0} characters
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
