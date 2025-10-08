#!/usr/bin/env python3
"""Convert JSON keys from camelCase to snake_case."""

import json
import re
from pathlib import Path


def camel_to_snake(name: str) -> str:
    """Convert camelCase string to snake_case."""
    # Insert underscore before uppercase letters and convert to lowercase
    s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
    return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()


def convert_keys(obj):
    """Recursively convert all keys in object from camelCase to snake_case."""
    if isinstance(obj, dict):
        return {camel_to_snake(key): convert_keys(value) for key, value in obj.items()}
    elif isinstance(obj, list):
        return [convert_keys(item) for item in obj]
    else:
        return obj


def main():
    input_file = Path("toolsSubscription2.json")
    output_file = Path("toolsSubscription2.json")
    backup_file = Path("toolsSubscription2.json.backup")

    # Read original JSON
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create backup
    with open(backup_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    # Convert keys
    converted_data = convert_keys(data)

    # Write converted JSON
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(converted_data, f, indent=2, ensure_ascii=False)

    print(f"✓ Conversion complete!")
    print(f"✓ Original backed up to: {backup_file}")
    print(f"✓ Converted file saved to: {output_file}")


if __name__ == "__main__":
    main()
