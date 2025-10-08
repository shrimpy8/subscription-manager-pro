import { NextRequest, NextResponse } from 'next/server';
import { Subscription } from '@/types/subscription';

// Mock data store (in production, this would be a database)
const subscriptions: Subscription[] = [];

/**
 * GET /api/subscriptions/export
 * Export all subscriptions to CSV format
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawFormat = (searchParams.get('format') || '').toLowerCase();
    const format = rawFormat === 'json' ? 'json' : 'csv';

    if (format === 'csv') {
      const headers = [
        'Name',
        'Category',
        'Subcategory',
        'Plan',
        'Cost',
        'Currency',
        'Billing Cycle',
        'Status',
        'Start Date',
        'Renewal Date',
        'Priority',
        'Usage Frequency',
        'URL',
        'Description',
        'Notes',
        'Account Email',
        'Auto Renew',
        'Safe for Work',
        'China Region Only'
      ];

      const rows = subscriptions.map(sub => [
        sub.name,
        sub.category,
        sub.subcategory || '',
        sub.plan || '',
        sub.cost.toString(),
        sub.currency,
        sub.billing_cycle,
        sub.status,
        sub.start_date.toISOString().split('T')[0],
        sub.renewal_date.toISOString().split('T')[0],
        sub.usage_importance,
        sub.usage_frequency,
        sub.url,
        sub.description,
        sub.notes,
        sub.account_email,
        sub.auto_renew ? 'Yes' : 'No',
        sub.safe_for_work ? 'Yes' : 'No',
        sub.china_region_only ? 'Yes' : 'No'
      ]);

      const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
        .join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="subscriptions-${new Date().toISOString().split('T')[0]}.csv"`
        }
      });
    }

    // Default JSON export
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
