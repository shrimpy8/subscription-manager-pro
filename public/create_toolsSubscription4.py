#!/usr/bin/env python3
"""Create toolsSubscription4.json with proper boolean handling and exact enum values."""

import json
from pathlib import Path


def normalize_enum(value, field_name):
    """Normalize enum values to exact lowercase specifications."""
    if not isinstance(value, str):
        return value

    normalized = value.lower().strip()

    # Map variations to standard values
    enum_mappings = {
        'usage_importance': {
            'high': 'high',
            'low': 'low',
            'medium': 'medium',
            'critical': 'critical'
        },
        'usage_frequency': {
            'daily': 'daily',
            'weekly': 'weekly',
            'monthly': 'monthly',
            'occasionally': 'occasionally',
            'rarely': 'rarely'
        },
        'billing_cycle': {
            'one-time': 'one-time',
            'pay-per-use': 'pay-per-use',
            'monthly': 'monthly',
            'yearly': 'yearly',
            'annual': 'yearly',  # Map annual to yearly
            'annually': 'yearly'
        },
        'status': {
            'active': 'active',
            'paused': 'paused',
            'canceled': 'canceled',
            'cancelled': 'canceled',  # Handle spelling variation
            'trial': 'trial',
            'expired': 'expired'
        }
    }

    if field_name in enum_mappings:
        return enum_mappings[field_name].get(normalized, normalized)

    return normalized


def ensure_boolean(value, default=False):
    """Ensure value is a proper boolean, convert null to default."""
    if value is None:
        return default
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lower_val = value.lower()
        if lower_val in ["true", "yes", "1"]:
            return True
        elif lower_val in ["false", "no", "0"]:
            return False
    return default


def main():
    # Read JSON data from toolsSubscription3.json
    with open("toolsSubscription3.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Processing {len(data)} records...")
    print()

    # Track changes
    stats = {
        'no_subscription_null_to_false': 0,
        'china_region_only_fixed': 0,
        'safe_for_work_fixed': 0,
        'iam_using_it_fixed': 0,
        'auto_renew_fixed': 0,
        'not_in_a16z_fixed': 0,
        'usage_importance_normalized': 0,
        'usage_frequency_normalized': 0,
        'billing_cycle_normalized': 0,
        'status_normalized': 0,
        'plan_normalized': 0
    }

    # Process each record
    for record in data:
        # Handle no_subscription: null -> false
        if 'no_subscription' in record:
            old_val = record['no_subscription']
            record['no_subscription'] = ensure_boolean(record['no_subscription'], default=False)
            if old_val is None and record['no_subscription'] is False:
                stats['no_subscription_null_to_false'] += 1

        # Ensure all boolean fields are proper booleans (no null)
        if 'china_region_only' in record:
            old_val = record['china_region_only']
            record['china_region_only'] = ensure_boolean(record['china_region_only'], default=False)
            if old_val != record['china_region_only']:
                stats['china_region_only_fixed'] += 1

        if 'safe_for_work' in record:
            old_val = record['safe_for_work']
            record['safe_for_work'] = ensure_boolean(record['safe_for_work'], default=True)
            if old_val != record['safe_for_work']:
                stats['safe_for_work_fixed'] += 1

        if 'iam_using_it' in record:
            old_val = record['iam_using_it']
            record['iam_using_it'] = ensure_boolean(record['iam_using_it'], default=False)
            if old_val != record['iam_using_it']:
                stats['iam_using_it_fixed'] += 1

        if 'auto_renew' in record:
            old_val = record['auto_renew']
            record['auto_renew'] = ensure_boolean(record['auto_renew'], default=False)
            if old_val != record['auto_renew']:
                stats['auto_renew_fixed'] += 1

        if 'not_in_a16z' in record:
            old_val = record['not_in_a16z']
            record['not_in_a16z'] = ensure_boolean(record['not_in_a16z'], default=True)
            if old_val != record['not_in_a16z']:
                stats['not_in_a16z_fixed'] += 1

        # Normalize enum fields to exact specifications
        if 'usage_importance' in record:
            old_val = record['usage_importance']
            record['usage_importance'] = normalize_enum(record['usage_importance'], 'usage_importance')
            if old_val != record['usage_importance']:
                stats['usage_importance_normalized'] += 1

        if 'usage_frequency' in record:
            old_val = record['usage_frequency']
            record['usage_frequency'] = normalize_enum(record['usage_frequency'], 'usage_frequency')
            if old_val != record['usage_frequency']:
                stats['usage_frequency_normalized'] += 1

        if 'billing_cycle' in record:
            old_val = record['billing_cycle']
            record['billing_cycle'] = normalize_enum(record['billing_cycle'], 'billing_cycle')
            if old_val != record['billing_cycle']:
                stats['billing_cycle_normalized'] += 1

        if 'status' in record:
            old_val = record['status']
            record['status'] = normalize_enum(record['status'], 'status')
            if old_val != record['status']:
                stats['status_normalized'] += 1

        if 'plan' in record:
            old_val = record['plan']
            record['plan'] = record['plan'].lower() if isinstance(record['plan'], str) else record['plan']
            if old_val != record['plan']:
                stats['plan_normalized'] += 1

    # Save to new file
    with open("toolsSubscription4.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Generate unique values report
    unique_values = {
        'usage_importance': sorted(set(r.get('usage_importance', '') for r in data if r.get('usage_importance'))),
        'usage_frequency': sorted(set(r.get('usage_frequency', '') for r in data if r.get('usage_frequency'))),
        'billing_cycle': sorted(set(r.get('billing_cycle', '') for r in data if r.get('billing_cycle'))),
        'status': sorted(set(r.get('status', '') for r in data if r.get('status'))),
        'plan': sorted(set(r.get('plan', '') for r in data if r.get('plan')))
    }

    # Print report
    print("=" * 80)
    print("TOOLSSUBSCRIPTION4.JSON CREATION REPORT")
    print("=" * 80)
    print()
    print("Boolean fields fixed (null -> true/false):")
    print("-" * 80)
    print(f"  no_subscription (null -> false):  {stats['no_subscription_null_to_false']} records")
    print(f"  china_region_only:                {stats['china_region_only_fixed']} records")
    print(f"  safe_for_work:                    {stats['safe_for_work_fixed']} records")
    print(f"  iam_using_it:                     {stats['iam_using_it_fixed']} records")
    print(f"  auto_renew:                       {stats['auto_renew_fixed']} records")
    print(f"  not_in_a16z:                      {stats['not_in_a16z_fixed']} records")
    print()
    print("Enum fields normalized:")
    print("-" * 80)
    print(f"  usage_importance:  {stats['usage_importance_normalized']} records")
    print(f"  usage_frequency:   {stats['usage_frequency_normalized']} records")
    print(f"  billing_cycle:     {stats['billing_cycle_normalized']} records")
    print(f"  status:            {stats['status_normalized']} records")
    print(f"  plan:              {stats['plan_normalized']} records")
    print()
    print("=" * 80)
    print("UNIQUE ENUM VALUES")
    print("=" * 80)
    print()
    print(f"usage_importance: {', '.join(unique_values['usage_importance'])}")
    print(f"usage_frequency:  {', '.join(unique_values['usage_frequency'])}")
    print(f"billing_cycle:    {', '.join(unique_values['billing_cycle'])}")
    print(f"status:           {', '.join(unique_values['status'])}")
    print(f"plan:             {', '.join(unique_values['plan'])}")
    print()
    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records processed: {len(data)}")
    print()
    print(f"✓ Created new file: toolsSubscription4.json")
    print(f"✓ All boolean fields are now true/false (no null)")
    print(f"✓ All enum values normalized to lowercase")


if __name__ == "__main__":
    main()
