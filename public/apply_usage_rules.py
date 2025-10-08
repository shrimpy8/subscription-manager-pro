#!/usr/bin/env python3
"""Apply usage rules based on category, region, and tools_list2.txt."""

import json
import re
from pathlib import Path


def parse_tools_list(file_path):
    """Parse tools_list2.txt to extract tool names."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract tool names using regex: name: ToolName
    pattern = r'name:\s*([^,]+),'
    matches = re.findall(pattern, content)

    # Strip whitespace from names
    return [name.strip() for name in matches]


def main():
    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Parse tools_list2.txt
    tools_list2_names = parse_tools_list("tools_list2.txt")
    print(f"Found {len(tools_list2_names)} tools in tools_list2.txt")

    # Create backup
    with open("toolsSubscription2_before_usage_rules.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Track changes
    roleplay_count = 0
    china_region_count = 0
    tools_list2_count = 0
    no_change_count = 0

    # Apply rules to each record
    for record in data:
        name = record.get("name", "")
        category = record.get("category", "")
        china_region_only = record.get("china_region_only")

        # Convert china_region_only to boolean if it's a string
        if isinstance(china_region_only, str):
            china_region_only = china_region_only.lower() in ["true", "yes", "1"]

        changed = False

        # Rule 1: Roleplay category
        if category == "Roleplay":
            record["no_subscription"] = True
            record["iam_using_it"] = False
            record["start_date"] = None
            record["renewal_date"] = None
            roleplay_count += 1
            changed = True

        # Rule 2: China region only
        elif china_region_only is True:
            record["no_subscription"] = True
            record["iam_using_it"] = False
            record["start_date"] = None
            record["renewal_date"] = None
            china_region_count += 1
            changed = True

        # Rule 3: In tools_list2.txt
        elif name in tools_list2_names:
            record["no_subscription"] = True
            record["iam_using_it"] = False
            record["start_date"] = None
            record["renewal_date"] = None
            tools_list2_count += 1
            changed = True

        if not changed:
            no_change_count += 1

    # Save updated data
    with open("toolsSubscription2.json", 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print report
    print()
    print("=" * 80)
    print("USAGE RULES APPLICATION REPORT")
    print("=" * 80)
    print()
    print("Applied rules in priority order:")
    print("-" * 80)
    print(f"1. Roleplay category:           {roleplay_count} records updated")
    print(f"2. China region only:           {china_region_count} records updated")
    print(f"3. From tools_list2.txt:        {tools_list2_count} records updated")
    print(f"4. No changes (already active): {no_change_count} records")
    print()
    print("Changes applied to matching records:")
    print("  - no_subscription = true")
    print("  - iam_using_it = false")
    print("  - start_date = null")
    print("  - renewal_date = null")
    print()
    print("=" * 80)
    print(f"SUMMARY")
    print("=" * 80)
    print(f"Total records: {len(data)}")
    print(f"Records modified: {roleplay_count + china_region_count + tools_list2_count}")
    print(f"Records unchanged: {no_change_count}")
    print()
    print(f"✓ Backup saved to: toolsSubscription2_before_usage_rules.json")
    print(f"✓ Updated file: toolsSubscription2.json")


if __name__ == "__main__":
    main()
