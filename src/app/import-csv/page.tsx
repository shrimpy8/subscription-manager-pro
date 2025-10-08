"use client";

import { useState } from 'react';
import { PremiumButton } from '@/components/ui/premium-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Database, CheckCircle } from 'lucide-react';

export default function ImportCSVPage() {
  const [csvData, setCsvData] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string, count?: number} | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCsvData(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!csvData) return;
    
    setImporting(true);
    setResult(null);
    
    try {
      // Parse CSV data
      const lines = csvData.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const subscriptions = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const subscription: Record<string, string> = {};
        headers.forEach((header, index) => {
          subscription[header] = values[index] || '';
        });
        return subscription;
      }).filter(sub => sub.name); // Filter out empty rows
      
      // Import to database
      const response = await fetch('/api/import-subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptions })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResult({
          success: true,
          message: `Successfully imported ${data.count} subscriptions`,
          count: data.count
        });
      } else {
        setResult({
          success: false,
          message: data.error || 'Import failed'
        });
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Import failed: ' + (error as Error).message
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Import Subscriptions from CSV</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload CSV File
          </CardTitle>
        </CardHeader>
        <CardContent>
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="mb-4"
          />
          {csvData && (
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                CSV data loaded ({csvData.split('\n').length - 1} rows)
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {csvData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Import to Database
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PremiumButton 
              onClick={handleImport} 
              disabled={importing}
              variant="gradient"
              className="w-full"
            >
              {importing ? 'Importing...' : 'Import to Supabase Database'}
            </PremiumButton>
          </CardContent>
        </Card>
      )}
      
      {result && (
        <Card className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <div className="h-5 w-5 rounded-full bg-red-600" />
              )}
              <p className={result.success ? 'text-green-800' : 'text-red-800'}>
                {result.message}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
