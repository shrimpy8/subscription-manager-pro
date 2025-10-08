#!/usr/bin/env python3
"""Modify JSON records to align with database schema."""

import json
from pathlib import Path


def main():
    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create backup
    with open("toolsSubscription2_before_modification.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Modify each record
    for record in data:
        # Add a16z_rank with value 0
        record['a16z_rank'] = 0

        # Rename account_email_in_use to account_email
        if 'account_email_in_use' in record:
            record['account_email'] = record.pop('account_email_in_use')

        # Add auto_renew with value False
        record['auto_renew'] = False

    # Save modified data
    with open("toolsSubscription2.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✓ Modifications complete!")
    print(f"✓ Total records modified: {len(data)}")
    print(f"✓ Backup saved to: toolsSubscription2_before_modification.json")
    print(f"\nChanges applied to each record:")
    print(f"  • Added 'a16z_rank': 0")
    print(f"  • Renamed 'account_email_in_use' → 'account_email'")
    print(f"  • Added 'auto_renew': false")


if __name__ == "__main__":
    main()
