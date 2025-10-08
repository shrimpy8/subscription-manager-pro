#!/usr/bin/env python3
"""Normalize enum values to lowercase and fix boolean fields for database compatibility."""

import json
from pathlib import Path


def normalize_value(value):
    """Normalize enum values to lowercase."""
    if isinstance(value, str):
        return value.lower()
    return value


def string_to_boolean(value):
    """Convert string boolean representations to actual booleans."""
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        lower_val = value.lower()
        if lower_val in ["true", "yes", "1"]:
            return True
        elif lower_val in ["false", "no", "0"]:
            return False
    return value


def main():
    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Processing {len(data)} records...")
    print()

    # Track changes
    changes = {
        'status': 0,
        'billing_cycle': 0,
        'usage_importance': 0,
        'usage_frequency': 0,
        'china_region_only': 0,
        'safe_for_work': 0,
        'currency_kept_uppercase': 0
    }

    # Normalize each record
    for record in data:
        # Normalize enum fields to lowercase
        if 'status' in record and isinstance(record['status'], str):
            old_val = record['status']
            record['status'] = normalize_value(record['status'])
            if old_val != record['status']:
                changes['status'] += 1

        if 'billing_cycle' in record and isinstance(record['billing_cycle'], str):
            old_val = record['billing_cycle']
            record['billing_cycle'] = normalize_value(record['billing_cycle'])
            if old_val != record['billing_cycle']:
                changes['billing_cycle'] += 1

        if 'usage_importance' in record and isinstance(record['usage_importance'], str):
            old_val = record['usage_importance']
            record['usage_importance'] = normalize_value(record['usage_importance'])
            if old_val != record['usage_importance']:
                changes['usage_importance'] += 1

        if 'usage_frequency' in record and isinstance(record['usage_frequency'], str):
            old_val = record['usage_frequency']
            record['usage_frequency'] = normalize_value(record['usage_frequency'])
            if old_val != record['usage_frequency']:
                changes['usage_frequency'] += 1

        # Convert boolean-like strings to actual booleans
        if 'china_region_only' in record:
            old_val = record['china_region_only']
            record['china_region_only'] = string_to_boolean(record['china_region_only'])
            if old_val != record['china_region_only']:
                changes['china_region_only'] += 1

        if 'safe_for_work' in record:
            old_val = record['safe_for_work']
            record['safe_for_work'] = string_to_boolean(record['safe_for_work'])
            if old_val != record['safe_for_work']:
                changes['safe_for_work'] += 1

        # Keep currency uppercase (ISO standard) but track
        if 'currency' in record:
            changes['currency_kept_uppercase'] += 1

    # Save to new file
    with open("toolsSubscription3.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print report
    print("=" * 80)
    print("ENUM NORMALIZATION REPORT")
    print("=" * 80)
    print()
    print("Fields normalized to lowercase:")
    print("-" * 80)
    print(f"  status:            {changes['status']} records updated")
    print(f"  billing_cycle:     {changes['billing_cycle']} records updated")
    print(f"  usage_importance:  {changes['usage_importance']} records updated")
    print(f"  usage_frequency:   {changes['usage_frequency']} records updated")
    print()
    print("Boolean fields standardized:")
    print("-" * 80)
    print(f"  china_region_only: {changes['china_region_only']} records converted to boolean")
    print(f"  safe_for_work:     {changes['safe_for_work']} records converted to boolean")
    print()
    print("Fields kept as-is (following standards):")
    print("-" * 80)
    print(f"  currency:          {changes['currency_kept_uppercase']} records (kept uppercase - ISO standard)")
    print()
    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records processed: {len(data)}")
    print()
    print(f"✓ Created new file: toolsSubscription3.json")
    print(f"✓ Original file preserved: toolsSubscription2.json")


if __name__ == "__main__":
    main()
