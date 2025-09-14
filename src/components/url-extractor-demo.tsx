"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { extractToolNameFromUrl, extractToolNamesFromUrls, formatToolsForATTools } from '@/lib/url-to-tool-name';
import { Link, Copy, Check } from 'lucide-react';

export function URLExtractorDemo() {
  const [urls, setUrls] = useState('');
  const [extractedTools, setExtractedTools] = useState<Array<{ url: string; name: string; isManual: boolean }>>([]);
  const [copied, setCopied] = useState(false);

  const handleExtract = () => {
    const urlList = urls.split('\n').filter(url => url.trim());
    const tools = extractToolNamesFromUrls(urlList).map(tool => ({ ...tool, isManual: false }));
    setExtractedTools(tools);
  };

  const handleManualEdit = (index: number, newName: string) => {
    setExtractedTools(prev => prev.map((tool, i) => 
      i === index ? { ...tool, name: newName, isManual: true } : tool
    ));
  };

  const handleCopy = async () => {
    const formatted = formatToolsForATTools(extractedTools);
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exampleUrls = [
    'https://chat.openai.com',
    'https://www.midjourney.com',
    'https://elevenlabs.io',
    'https://perplexity.ai',
    'https://character.ai',
    'https://cursor.sh',
    'https://zapier.com',
    'https://n8n.io'
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5" />
            URL to Tool Name Extractor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="urls">Paste URLs (one per line)</Label>
            <Textarea
              id="urls"
              placeholder="https://chat.openai.com&#10;https://www.midjourney.com&#10;https://elevenlabs.io"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              rows={6}
            />
          </div>
          
          <div className="flex gap-3">
            <Button onClick={handleExtract} className="flex-1">
              Extract Tool Names
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setUrls(exampleUrls.join('\n'))}
            >
              Load Examples
            </Button>
          </div>
        </CardContent>
      </Card>

      {extractedTools.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Extracted Tools</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Names'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {extractedTools.map((tool, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={tool.name}
                      onChange={(e) => handleManualEdit(index, e.target.value)}
                      className="font-medium bg-transparent border-none outline-none focus:bg-white focus:border focus:border-orange-300 focus:rounded px-2 py-1"
                      placeholder="Enter tool name"
                    />
                    <div className="text-sm text-gray-500">{tool.url}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {tool.isManual && (
                      <Badge variant="secondary" className="text-xs">Manual</Badge>
                    )}
                    <Badge variant="outline">{tool.name}</Badge>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold mb-2">Formatted for ATTools.txt:</h4>
              <code className="text-sm bg-white p-2 rounded border block">
                {formatToolsForATTools(extractedTools)}
              </code>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
