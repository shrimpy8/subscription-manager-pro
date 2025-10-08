#!/usr/bin/env python3
"""Apply final modifications to JSON records in sequence."""

import json
from pathlib import Path


def main():
    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create backup
    with open("toolsSubscription2_before_final_mods.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Track changes
    changes_report = {
        'safe_for_work_true': 0,
        'safe_for_work_false': 0,
        'not_in_a16z_true': 0,
        'not_in_a16z_false': 0
    }

    # Apply modifications to each record
    for record in data:
        # 1. Set safe_for_work based on nsfw
        nsfw = record.get("nsfw", False)
        if nsfw is False:
            record["safe_for_work"] = True
            changes_report['safe_for_work_true'] += 1
        else:
            record["safe_for_work"] = False
            changes_report['safe_for_work_false'] += 1

        # 2. Add iam_using_it = true
        record["iam_using_it"] = True

        # 3. Add no_subscription = null
        record["no_subscription"] = None

        # 4. Add not_in_a16z based on a16z_rank
        a16z_rank = record.get("a16z_rank")
        if a16z_rank is None or a16z_rank == "":
            record["not_in_a16z"] = True
            changes_report['not_in_a16z_true'] += 1
        elif isinstance(a16z_rank, int) and 1 <= a16z_rank <= 50:
            record["not_in_a16z"] = False
            changes_report['not_in_a16z_false'] += 1
        else:
            # Edge case: non-null, non-empty, but not in range
            record["not_in_a16z"] = True
            changes_report['not_in_a16z_true'] += 1

        # 5. Drop nsfw element
        if "nsfw" in record:
            del record["nsfw"]

    # Save updated data
    with open("toolsSubscription2.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print report
    print("=" * 80)
    print("FINAL MODIFICATIONS REPORT")
    print("=" * 80)
    print()
    print("Applied changes in sequence:")
    print("-" * 80)
    print("1. Updated 'safe_for_work' based on 'nsfw' value")
    print(f"   - safe_for_work = true:  {changes_report['safe_for_work_true']} records")
    print(f"   - safe_for_work = false: {changes_report['safe_for_work_false']} records")
    print()
    print(f"2. Added 'iam_using_it' = true to all {len(data)} records")
    print()
    print(f"3. Added 'no_subscription' = null to all {len(data)} records")
    print()
    print("4. Added 'not_in_a16z' based on 'a16z_rank' value")
    print(f"   - not_in_a16z = true:  {changes_report['not_in_a16z_true']} records (a16z_rank is null/empty)")
    print(f"   - not_in_a16z = false: {changes_report['not_in_a16z_false']} records (a16z_rank 1-50)")
    print()
    print(f"5. Dropped 'nsfw' element from all {len(data)} records")
    print()
    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records processed: {len(data)}")
    print()
    print(f"✓ Backup saved to: toolsSubscription2_before_final_mods.json")
    print(f"✓ Updated file: toolsSubscription2.json")


if __name__ == "__main__":
    main()
