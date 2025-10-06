"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
// Note: Using custom alert styling since alert component is not available
import { categorizeAITool, suggestNewCategoryName, type CategorizationResult } from '@/lib/ai-tool-categorizer';
import { handleError } from '@/utils/error-handler';
import { getAIToolsByCategory } from '@/lib/ai-tools-data';
import { CheckCircle, AlertCircle, Lightbulb, Brain, X, Edit3 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AIToolCategorizerDemo() {
  const [toolName, setToolName] = useState('');
  const [toolUrl, setToolUrl] = useState('');
  const [toolDescription, setToolDescription] = useState('');
  const [result, setResult] = useState<CategorizationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [overrideCategory, setOverrideCategory] = useState<string>('');

  const handleAnalyze = async () => {
    if (!toolName.trim() || !toolUrl.trim()) {
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      const categorizationResult = categorizeAITool(toolName, toolUrl, toolDescription);
      setResult(categorizationResult);
    } catch (error) {
      handleError(
        error as Error,
        { component: 'ai-tool-categorizer-demo', action: 'categorization' }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClear = () => {
    setToolName('');
    setToolUrl('');
    setToolDescription('');
    setResult(null);
    setOverrideCategory('');
  };

  const handleOverrideCategory = (value: string) => {
    setOverrideCategory(value);
  };

  // Available categories with real tool names from our dataset (alphabetically ordered)
  const availableCategories = [
    { name: 'APIs', examples: getAIToolsByCategory('APIs').slice(0, 3).map(tool => tool.name) },
    { name: 'Audio', examples: getAIToolsByCategory('Audio').slice(0, 3).map(tool => tool.name) },
    { name: 'Automation', examples: getAIToolsByCategory('Automation').slice(0, 3).map(tool => tool.name) },
    { name: 'Build', examples: getAIToolsByCategory('Build').slice(0, 3).map(tool => tool.name) },
    { name: 'Chat', examples: getAIToolsByCategory('Chat').slice(0, 3).map(tool => tool.name) },
    { name: 'DB', examples: getAIToolsByCategory('DB').slice(0, 3).map(tool => tool.name) },
    { name: 'Deploy', examples: getAIToolsByCategory('Deploy').slice(0, 3).map(tool => tool.name) },
    { name: 'Design/Prototype', examples: getAIToolsByCategory('Design/Prototype').slice(0, 3).map(tool => tool.name) },
    { name: 'Dev', examples: getAIToolsByCategory('Dev').slice(0, 3).map(tool => tool.name) },
    { name: 'Image', examples: getAIToolsByCategory('Image').slice(0, 3).map(tool => tool.name) },
    { name: 'Other', examples: getAIToolsByCategory('Other').slice(0, 3).map(tool => tool.name) },
    { name: 'Planning', examples: getAIToolsByCategory('Planning').slice(0, 3).map(tool => tool.name) },
    { name: 'Productivity', examples: getAIToolsByCategory('Productivity').slice(0, 3).map(tool => tool.name) },
    { name: 'Roleplay', examples: getAIToolsByCategory('Roleplay').slice(0, 3).map(tool => tool.name) },
    { name: 'Search', examples: getAIToolsByCategory('Search').slice(0, 3).map(tool => tool.name) },
    { name: 'Speech-to-text', examples: getAIToolsByCategory('Speech-to-text').slice(0, 3).map(tool => tool.name) },
    { name: 'Transcribe', examples: getAIToolsByCategory('Transcribe').slice(0, 3).map(tool => tool.name) },
    { name: 'Utils', examples: getAIToolsByCategory('Utils').slice(0, 3).map(tool => tool.name) },
    { name: 'Vector DB', examples: getAIToolsByCategory('Vector DB').slice(0, 3).map(tool => tool.name) },
    { name: 'Video', examples: getAIToolsByCategory('Video').slice(0, 3).map(tool => tool.name) },
    { name: 'Write', examples: getAIToolsByCategory('Write').slice(0, 3).map(tool => tool.name) }
  ];

  // Get the final category (override or suggested)
  const finalCategory = overrideCategory || result?.suggestedCategory || 'Other';

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.7) return 'bg-green-100 text-green-800 border-green-300';
    if (confidence >= 0.4) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.7) return <CheckCircle className="w-4 h-4" />;
    if (confidence >= 0.4) return <AlertCircle className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI Tool Categorization System
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="toolName">Tool Name *</Label>
              <Input
                id="toolName"
                placeholder="e.g., ChatGPT, Midjourney, ElevenLabs"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="toolUrl">Tool URL *</Label>
              <Input
                id="toolUrl"
                placeholder="e.g., https://chat.openai.com"
                value={toolUrl}
                onChange={(e) => setToolUrl(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="toolDescription">Description (Optional)</Label>
            <Textarea
              id="toolDescription"
              placeholder="Brief description of what the tool does..."
              value={toolDescription}
              onChange={(e) => setToolDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={handleAnalyze} 
              disabled={!toolName.trim() || !toolUrl.trim() || isAnalyzing}
              className="flex-1"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze & Categorize'}
            </Button>
            <Button 
              onClick={handleClear}
              variant="outline"
              className="px-4"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Categorization Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Analysis Results */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Analysis
                </h3>
                
                {/* Main Result */}
                <div className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-semibold">Suggested Category</h4>
                    <p className="text-2xl font-bold text-orange-600">{result.suggestedCategory}</p>
                  </div>
                  <Badge className={`${getConfidenceColor(result.confidence)} flex items-center gap-1`}>
                    {getConfidenceIcon(result.confidence)}
                    {Math.round(result.confidence * 100)}% Confidence
                  </Badge>
                </div>

                {/* Reasoning */}
                <div className="space-y-2">
                  <h4 className="font-semibold">Analysis Reasoning:</h4>
                  <ul className="space-y-1">
                    {result.reasoning.map((reason, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Alternative Categories */}
                {result.alternativeCategories && result.alternativeCategories.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-semibold">Alternative Categories:</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.alternativeCategories.map((category, index) => (
                        <Badge key={index} variant="outline" className="text-sm">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Category Suggestion */}
                {result.isNewCategory && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-orange-200 bg-orange-50">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-orange-800">New Category Suggested:</strong> This tool doesn&apos;t fit well into existing categories. 
                      Consider creating a new category: <strong className="text-orange-800">{suggestNewCategoryName(toolName, toolUrl, toolDescription)}</strong>
                    </div>
                  </div>
                )}

                {/* Low Confidence Warning */}
                {result.confidence < 0.4 && (
                  <div className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <strong className="text-yellow-800">Low Confidence:</strong> The categorization has low confidence. 
                      Please review manually and consider the alternative categories or creating a new category.
                    </div>
                  </div>
                )}
              </div>

              {/* Right Panel - Manual Override */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Edit3 className="w-5 h-5" />
                  Manual Override
                </h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryOverride">Override Category</Label>
                    <Select value={overrideCategory} onValueChange={handleOverrideCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category to override" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category.name} value={category.name}>
                            <div className="flex flex-col">
                              <span className="font-medium">{category.name}</span>
                              <span className="text-xs text-gray-500">
                                Examples: {category.examples.join(', ')}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Final Category Display */}
                  <div className="p-4 rounded-lg border bg-gray-50">
                    <h4 className="font-semibold mb-2">Final Category</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-lg px-3 py-1">
                        {finalCategory}
                      </Badge>
                      {overrideCategory && (
                        <Badge variant="secondary" className="text-xs">
                          Overridden
                        </Badge>
                      )}
                    </div>
                    
                    {/* Show examples for the selected category */}
                    {(() => {
                      const selectedCategory = availableCategories.find(cat => cat.name === finalCategory);
                      return selectedCategory && (
                        <div className="text-sm">
                          <span className="text-gray-600">Similar tools: </span>
                          <span className="text-gray-800 font-medium">
                            {selectedCategory.examples.join(', ')}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Clear Override Button */}
                  {overrideCategory && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setOverrideCategory('')}
                      className="w-full"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Clear Override
                    </Button>
                  )}

                  {/* Tool Summary */}
                  <div className="p-4 rounded-lg border bg-orange-50">
                    <h4 className="font-semibold mb-2 text-orange-800">Tool Summary</h4>
                    <div className="space-y-1 text-sm">
                      <div><strong>Name:</strong> {toolName}</div>
                      <div><strong>URL:</strong> {toolUrl}</div>
                      <div><strong>Category:</strong> {finalCategory}</div>
                      {toolDescription && (
                        <div><strong>Description:</strong> {toolDescription}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Example Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Try These Examples</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'ChatGPT', url: 'https://chat.openai.com', description: 'AI chatbot for conversations' },
              { name: 'Midjourney', url: 'https://midjourney.com', description: 'AI image generation tool' },
              { name: 'ElevenLabs', url: 'https://elevenlabs.io', description: 'AI voice synthesis platform' },
              { name: 'Perplexity', url: 'https://perplexity.ai', description: 'AI-powered search engine' },
              { name: 'Character.ai', url: 'https://character.ai', description: 'AI character roleplay platform' },
              { name: 'Cursor', url: 'https://cursor.sh', description: 'AI-powered code editor' },
              { name: 'Zapier', url: 'https://zapier.com', description: 'Workflow automation platform' },
              { name: 'n8n', url: 'https://n8n.io', description: 'Open-source workflow automation' }
            ].map((example, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-3 text-left justify-start"
                onClick={() => {
                  setToolName(example.name);
                  setToolUrl(example.url);
                  setToolDescription(example.description);
                }}
              >
                <div>
                  <div className="font-medium">{example.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{example.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
