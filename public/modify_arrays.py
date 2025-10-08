#!/usr/bin/env python3
"""Modify JSON arrays to match database schema requirements."""

import json
from pathlib import Path


def main():
    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create backup
    with open("toolsSubscription2_before_array_modification.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Modify each record
    for record in data:
        # 1. previously_used_promotion_code -> subscription_previous_promocodes
        if 'previously_used_promotion_code' in record:
            old_values = record.pop('previously_used_promotion_code')
            if old_values:
                record['subscription_previous_promocodes'] = [
                    {"promocode": code} for code in old_values
                ]
            else:
                record['subscription_previous_promocodes'] = []

        # 2. account_emails_used_previously -> subscription_previous_accountemails
        if 'account_emails_used_previously' in record:
            old_values = record.pop('account_emails_used_previously')
            if old_values:
                record['subscription_previous_accountemails'] = [
                    {"email": email} for email in old_values
                ]
            else:
                record['subscription_previous_accountemails'] = []

        # 3. api_access_keys -> subscription_api_keys
        if 'api_access_keys' in record:
            old_values = record.pop('api_access_keys')
            if old_values:
                record['subscription_api_keys'] = [
                    {"key_name": f"API Key {i+1}", "key_value": key}
                    for i, key in enumerate(old_values)
                ]
            else:
                record['subscription_api_keys'] = []

        # 4. latest_promotion_code -> latest_promocode
        if 'latest_promotion_code' in record:
            record['latest_promocode'] = record.pop('latest_promotion_code')

    # Save modified data
    with open("toolsSubscription2.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Array modifications complete!")
    print(f"✓ Total records modified: {len(data)}")
    print(f"✓ Backup saved to: toolsSubscription2_before_array_modification.json")
    print(f"\nChanges applied to each record:")
    print(f"  • 'previously_used_promotion_code' → 'subscription_previous_promocodes'")
    print(f"    (array of strings → array of {{promocode}} objects)")
    print(f"  • 'account_emails_used_previously' → 'subscription_previous_accountemails'")
    print(f"    (array of strings → array of {{email}} objects)")
    print(f"  • 'api_access_keys' → 'subscription_api_keys'")
    print(f"    (array of strings → array of {{key_name, key_value}} objects)")
    print(f"  • 'latest_promotion_code' → 'latest_promocode'")


if __name__ == "__main__":
    main()
