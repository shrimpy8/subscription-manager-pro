import { NextRequest, NextResponse } from 'next/server';
import { getSubscriptions } from '@/lib/subscription-store';
import { exportSubscriptionsToCSV } from '@/lib/subscription-persistence';
import { assertWriteAllowed } from '@/lib/api-guard';

/**
 * GET /api/subscriptions/export
 * Export all subscriptions to CSV format
 */
export async function GET(request: NextRequest) {
  // Export exposes all user data — enforce same-origin even for GET
  const guard = assertWriteAllowed(request, 'GET');
  if (guard) return guard;

  try {
    const { searchParams } = new URL(request.url);
    const rawFormat = (searchParams.get('format') || '').toLowerCase();
    const format = rawFormat === 'json' ? 'json' : 'csv';
    const subscriptions = getSubscriptions();

    if (format === 'csv') {
      const csvContent = exportSubscriptionsToCSV(subscriptions);

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscriptions-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: subscriptions,
      count: subscriptions.length,
      exportedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error exporting subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export subscriptions' },
      { status: 500 }
    );
  }
}
