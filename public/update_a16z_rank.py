#!/usr/bin/env python3
"""Update a16z_rank in JSON from aiTool.ts originalRank values."""

import json
import re
from pathlib import Path


def parse_ts_file(file_path):
    """Parse TypeScript file to extract name and originalRank."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all tool entries using regex
    # Pattern: { id: X, originalRank: Y, name: "Name", ...
    pattern = r'\{\s*id:\s*\d+,\s*originalRank:\s*(\d+),\s*name:\s*"([^"]+)"'
    matches = re.findall(pattern, content)

    # Create dictionary of name -> originalRank (only for ranks 1-50)
    rank_map = {}
    for rank_str, name in matches:
        rank = int(rank_str)
        if 1 <= rank <= 50:
            rank_map[name] = rank

    return rank_map


def main():
    # Parse TS file to get rank mapping
    rank_map = parse_ts_file("aiTool.ts")

    print(f"Found {len(rank_map)} tools with originalRank 1-50 in aiTool.ts")
    print()

    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create backup
    with open("toolsSubscription2_before_rank_update.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Track updates
    matched = []
    unmatched = []

    # Update a16z_rank for each record
    for record in data:
        name = record.get("name", "")

        if name in rank_map:
            record["a16z_rank"] = rank_map[name]
            matched.append(f"  ✓ {name:<30} -> a16z_rank = {rank_map[name]}")
        else:
            record["a16z_rank"] = None
            unmatched.append(f"  ✗ {name:<30} -> a16z_rank = null (no match)")

    # Save updated data
    with open("toolsSubscription2.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print report
    print("=" * 80)
    print("A16Z RANK UPDATE REPORT")
    print("=" * 80)
    print()

    if matched:
        print(f"MATCHED ({len(matched)} records):")
        print("-" * 80)
        for line in matched:
            print(line)
        print()

    if unmatched:
        print(f"UNMATCHED ({len(unmatched)} records):")
        print("-" * 80)
        for line in unmatched:
            print(line)
        print()

    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records: {len(data)}")
    print(f"Matched and updated: {len(matched)}")
    print(f"No match (set to null): {len(unmatched)}")
    print()
    print(f"✓ Backup saved to: toolsSubscription2_before_rank_update.json")
    print(f"✓ Updated file: toolsSubscription2.json")


if __name__ == "__main__":
    main()
