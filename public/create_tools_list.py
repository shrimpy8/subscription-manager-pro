#!/usr/bin/env python3
"""Extract tool names from aiTool.ts and create formatted list."""

import re
from pathlib import Path


def parse_ts_file(file_path):
    """Parse TypeScript file to extract tool names."""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Extract all tool entries using regex
    # Pattern: name: "Name"
    pattern = r'name:\s*"([^"]+)"'
    matches = re.findall(pattern, content)

    return matches


def main():
    # Parse TS file to get tool names
    tool_names = parse_ts_file("aiTool.ts")

    print(f"Found {len(tool_names)} tools in aiTool.ts")

    # Create formatted output
    output_lines = []
    for name in tool_names:
        line = f'name: {name}, "iam_using_it": false, "no_subscription": true, "start_date": null, "renewal_date": null'
        output_lines.append(line)

    # Write to file
    output_file = "tools_list.txt"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(output_lines))

    # Print preview
    print(f"\n✓ Created {output_file} with {len(output_lines)} tools")
    print(f"\nPreview (first 5 lines):")
    print("-" * 80)
    for line in output_lines[:5]:
        print(line)
    print(f"...")


if __name__ == "__main__":
    main()
