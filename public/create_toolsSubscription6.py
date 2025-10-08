#!/usr/bin/env python3
"""Create toolsSubscription6.json with updated categories and subcategories."""

import json


def main():
    # Load the mapping
    with open('final_mapping.json', 'r', encoding='utf-8') as f:
        mapping = json.load(f)

    ai_tools_mapping = mapping['ai_tools']
    non_ai_tools_mapping = mapping['non_ai_tools']

    # Read toolsSubscription5.json
    with open('toolsSubscription5.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    print(f"Processing {len(data)} records...")
    print()

    # Track changes
    ai_tools_updated = 0
    non_ai_tools_updated = 0
    not_found = []

    # Update category and subcategory for each record
    for record in data:
        name = record.get('name', '')

        # Check if it's an AI Tool
        if name in ai_tools_mapping:
            record['category'] = 'AI Tools'
            record['subcategory'] = ai_tools_mapping[name]
            ai_tools_updated += 1

        # Check if it's a Non-AI Tool
        elif name in non_ai_tools_mapping:
            record['category'] = 'Tools'
            record['subcategory'] = non_ai_tools_mapping[name]
            non_ai_tools_updated += 1

        else:
            not_found.append(name)

    # Save to toolsSubscription6.json
    with open('toolsSubscription6.json', 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Print report
    print("=" * 80)
    print("TOOLSSUBSCRIPTION6.JSON CREATION REPORT")
    print("=" * 80)
    print()
    print("Category Updates:")
    print("-" * 80)
    print(f"  'AI Tools' category:  {ai_tools_updated} records updated")
    print(f"  'Tools' category:     {non_ai_tools_updated} records updated")
    print()

    if not_found:
        print("⚠️  Tools not found in mapping:")
        print("-" * 80)
        for name in not_found:
            print(f"  - {name}")
        print()

    # Verify categories
    categories = {}
    subcategories = {}
    for record in data:
        cat = record.get('category', '')
        subcat = record.get('subcategory', '')

        if cat not in categories:
            categories[cat] = 0
        categories[cat] += 1

        if subcat not in subcategories:
            subcategories[subcat] = 0
        subcategories[subcat] += 1

    print("=" * 80)
    print("VERIFICATION")
    print("=" * 80)
    print()
    print("Categories:")
    for cat in sorted(categories.keys()):
        print(f"  - {cat}: {categories[cat]} tools")
    print()
    print(f"Total unique subcategories: {len(subcategories)}")
    print()
    print("Subcategories:")
    for subcat in sorted(subcategories.keys()):
        print(f"  - {subcat}: {subcategories[subcat]} tools")
    print()

    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print(f"Total records: {len(data)}")
    print(f"AI Tools: {ai_tools_updated}")
    print(f"Non-AI Tools: {non_ai_tools_updated}")
    print()
    print(f"✓ Created file: toolsSubscription6.json")
    print(f"✓ Previous version preserved: toolsSubscription5.json")


if __name__ == "__main__":
    main()
