import UpdateSubscriptionForm from '@/components/update-subscription-form';
import { isUuidLike } from '@/lib/url-params';
import Link from 'next/link';

interface UpdateSubscriptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateSubscriptionPage({ params }: UpdateSubscriptionPageProps) {
  const { id } = await params;
  if (!id || !isUuidLike(id)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-100 to-neutral-200">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-white border border-neutral-200 rounded-lg p-6">
            <h1 className="text-h3 text-neutral-900 mb-2">Invalid subscription link</h1>
            <p className="text-sm text-neutral-600 mb-4">The provided subscription ID is malformed or not recognized.</p>
            <Link href="/" className="text-primary-600 hover:text-primary-700">Back to dashboard</Link>
          </div>
        </div>
      </div>
    );
  }
  return <UpdateSubscriptionForm subscriptionId={id} />;
}
