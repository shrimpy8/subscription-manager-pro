import { AIToolCategorizerDemo } from '@/components/ai-tool-categorizer-demo';

export default function CategorizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Tool Categorization System
          </h1>
          <p className="text-gray-600">
            Automatically categorize new AI tools using intelligent analysis
          </p>
        </div>
        
        <AIToolCategorizerDemo />
      </div>
    </div>
  );
}
