"use client";

import { useEffect, useState } from 'react';
import { loadSubscriptions } from '@/lib/subscription-storage';
import { initializeSampleData } from '@/lib/sample-data';
import { Subscription } from '@/types/subscription';

export default function TestPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    initializeSampleData();
    const loaded = loadSubscriptions();
    setSubscriptions(loaded);
    // Loaded subscriptions
  }, []);

  if (!isClient) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Page</h1>
      <p>Number of subscriptions loaded: {subscriptions.length}</p>
      <div className="mt-4">
        {subscriptions.map((sub) => (
          <div key={sub.id} className="p-2 border rounded mb-2">
            <strong>{sub.name}</strong> - ${sub.cost} - {sub.status}
          </div>
        ))}
      </div>
    </div>
  );
}
