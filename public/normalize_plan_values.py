#!/usr/bin/env python3
"""Normalize plan values to approved list and map old values."""

import json
from pathlib import Path


def normalize_plan(plan_value):
    """
    Normalize plan values to approved list.

    Approved values: advanced, enterprise, free, max, personal, premium, plus, pro, team, ultra, unlimited

    Mapping:
    - artisan -> premium (remove #2)
    - hacker -> pro (remove #5)
    - serverless -> free (remove #12)
    - subscription -> premium (remove #15)
    - unsplash+ -> premium (remove #17)
    - individual -> personal (similar concept)
    - professional -> pro (duplicate)
    - self-service -> free (similar concept)
    - creator -> premium (similar tier)
    - standard -> pro (standard tier)
    - starter -> free (entry level)
    """
    if not isinstance(plan_value, str):
        return plan_value

    plan_lower = plan_value.lower().strip()

    # Mapping old values to approved values
    plan_mapping = {
        'artisan': 'premium',
        'hacker': 'pro',
        'serverless': 'free',
        'subscription': 'premium',
        'unsplash+': 'premium',
        'individual': 'personal',
        'professional': 'pro',
        'self-service': 'free',
        'creator': 'premium',
        'standard': 'pro',
        'starter': 'free',
        # Keep approved values as-is
        'advanced': 'advanced',
        'enterprise': 'enterprise',
        'free': 'free',
        'max': 'max',
        'personal': 'personal',
        'premium': 'premium',
        'plus': 'plus',
        'pro': 'pro',
        'team': 'team',
        'ultra': 'ultra',
        'unlimited': 'unlimited'
    }

    return plan_mapping.get(plan_lower, plan_lower)


def main():
    # Read JSON data
    with open("toolsSubscription4.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Processing {len(data)} records...")
    print()

    # Track changes
    plan_changes = {}
    unchanged_count = 0

    # Normalize plan values
    for record in data:
        if 'plan' in record:
            old_plan = record['plan']
            new_plan = normalize_plan(old_plan)

            if old_plan != new_plan:
                if old_plan not in plan_changes:
                    plan_changes[old_plan] = {'new_value': new_plan, 'count': 0}
                plan_changes[old_plan]['count'] += 1
                record['plan'] = new_plan
            else:
                unchanged_count += 1

    # Save to new file
    with open("toolsSubscription5.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Get unique plan values after normalization
    unique_plans = sorted(set(r.get('plan', '') for r in data if r.get('plan')))

    # Print report
    print("=" * 80)
    print("PLAN VALUE NORMALIZATION REPORT")
    print("=" * 80)
    print()

    if plan_changes:
        print("Plan values mapped to approved list:")
        print("-" * 80)
        for old_plan, info in sorted(plan_changes.items()):
            print(f"  '{old_plan}' -> '{info['new_value']}' ({info['count']} records)")
        print()

    print(f"Unchanged plans (already approved): {unchanged_count} records")
    print()
    print("=" * 80)
    print("FINAL UNIQUE PLAN VALUES")
    print("=" * 80)
    print(f"Total unique plans: {len(unique_plans)}")
    print(f"Values: {', '.join(unique_plans)}")
    print()

    # Verify all values are in approved list
    approved_plans = {'advanced', 'enterprise', 'free', 'max', 'personal', 'premium',
                      'plus', 'pro', 'team', 'ultra', 'unlimited'}
    unapproved = [p for p in unique_plans if p not in approved_plans]

    if unapproved:
        print("⚠️  WARNING: Found unapproved plan values:")
        print(f"   {', '.join(unapproved)}")
    else:
        print("✓ All plan values are from the approved list!")

    print()
    print("Approved plan list:")
    print(f"  {', '.join(sorted(approved_plans))}")
    print()
    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records processed: {len(data)}")
    print(f"Plan values changed: {sum(info['count'] for info in plan_changes.values())}")
    print(f"Plan values unchanged: {unchanged_count}")
    print()
    print(f"✓ Created new file: toolsSubscription5.json")
    print(f"✓ Original preserved: toolsSubscription4.json")


if __name__ == "__main__":
    main()
