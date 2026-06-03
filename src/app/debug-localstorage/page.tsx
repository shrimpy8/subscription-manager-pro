"use client";

import { useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import { getLocalSubscriptions } from '@/lib/supabase-sync';

export default function DebugLocalStoragePage() {
  if (process.env.NODE_ENV !== 'development') {
    notFound();
  }
  const [localData, setLocalData] = useState<Record<string, unknown> | null>(null);
  const [count, setCount] = useState(0);
  const [allKeys, setAllKeys] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    if (typeof window !== 'undefined') {
      // Check what's in localStorage
      const rawData = localStorage.getItem('subscription-manager-subscriptions');
      const parsedData = rawData ? JSON.parse(rawData) : null;
      
      setLocalData(parsedData);
      setCount(parsedData ? parsedData.length : 0);
      
      // Get all localStorage keys
      const keys = Object.keys(localStorage);
      setAllKeys(keys);
      
      // Also test the sync function
      const syncData = getLocalSubscriptions();
      console.log('Sync function result:', syncData.length, syncData);
    }
  }, []);

  if (!isClient) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">localStorage Debug</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Raw localStorage Data</h2>
          <p>Count: {count}</p>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
            {JSON.stringify(localData, null, 2)}
          </pre>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold">All localStorage Keys</h2>
          <ul className="list-disc list-inside">
            {allKeys.map(key => (
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
