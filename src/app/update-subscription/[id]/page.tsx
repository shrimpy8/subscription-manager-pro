import UpdateSubscriptionForm from '@/components/update-subscription-form';

interface UpdateSubscriptionPageProps {
  params: Promise<{ id: string }>;
}

export default async function UpdateSubscriptionPage({ params }: UpdateSubscriptionPageProps) {
  const { id } = await params;
  return <UpdateSubscriptionForm subscriptionId={id} />;
}
