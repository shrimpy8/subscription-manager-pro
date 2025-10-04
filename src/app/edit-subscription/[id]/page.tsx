import EditSubscriptionForm from '@/components/edit-subscription-form';

interface EditSubscriptionPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSubscriptionPage({ params }: EditSubscriptionPageProps) {
  const { id } = await params;
  return <EditSubscriptionForm subscriptionId={id} />;
}
