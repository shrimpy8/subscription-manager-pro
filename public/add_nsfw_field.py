#!/usr/bin/env python3
"""Add nsfw field to JSON records, set to true for Roleplay category."""

import json
from pathlib import Path


def main():
    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create backup
    with open("toolsSubscription2_before_nsfw.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Track updates
    nsfw_true = []
    nsfw_false = []

    # Add nsfw field to each record
    for record in data:
        category = record.get("category", "")

        if category == "Roleplay":
            record["nsfw"] = True
            nsfw_true.append(f"  ✓ {record.get('name', 'Unknown'):<30} (Roleplay) -> nsfw = true")
        else:
            record["nsfw"] = False
            nsfw_false.append(f"  • {record.get('name', 'Unknown'):<30} ({category}) -> nsfw = false")

    # Save updated data
    with open("toolsSubscription2.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print report
    print("=" * 80)
    print("NSFW FIELD UPDATE REPORT")
    print("=" * 80)
    print()

    if nsfw_true:
        print(f"NSFW = TRUE ({len(nsfw_true)} records):")
        print("-" * 80)
        for line in nsfw_true:
            print(line)
        print()

    print(f"NSFW = FALSE ({len(nsfw_false)} records):")
    print("-" * 80)
    for line in nsfw_false[:10]:  # Show first 10
        print(line)
    if len(nsfw_false) > 10:
        print(f"  ... and {len(nsfw_false) - 10} more")
    print()

    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records: {len(data)}")
    print(f"NSFW = true (Roleplay): {len(nsfw_true)}")
    print(f"NSFW = false (Other): {len(nsfw_false)}")
    print()
    print(f"✓ Backup saved to: toolsSubscription2_before_nsfw.json")
    print(f"✓ Updated file: toolsSubscription2.json")


if __name__ == "__main__":
    main()
