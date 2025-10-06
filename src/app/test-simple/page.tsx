"use client";

import { useState, useEffect } from 'react';

export default function TestSimple() {
  const [data, setData] = useState<string>('Loading...');

  useEffect(() => {
    // TestSimple useEffect running
    setData('Data loaded successfully!');
  }, []);

  return (
  <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-orange-600 mb-4">Test Simple Page</h1>
        <p className="text-gray-600">{data}</p>
        <p className="text-sm text-gray-500 mt-4">If you see this, the app is working!</p>
      </div>
    </div>
  );
}
