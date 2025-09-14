import { URLExtractorDemo } from '@/components/url-extractor-demo';

export default function URLExtractorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <div className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">URL to Tool Name Extractor</h1>
          <p className="text-gray-600">Extract meaningful tool names from URLs for your AI tools list</p>
        </div>
        <URLExtractorDemo />
      </div>
    </div>
  );
}
