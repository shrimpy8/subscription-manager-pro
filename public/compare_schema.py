#!/usr/bin/env python3
"""Compare database schema with JSON data structure."""

import json
from pathlib import Path


def main():
    # Read database schema
    with open("dbTable.json", 'r', encoding='utf-8') as f:
        db_schema = json.load(f)

    # Read JSON data
    with open("toolsSubscription2.json", 'r', encoding='utf-8') as f:
        json_data = json.load(f)

    # Extract column names from database schema
    db_columns = {item["column_name"] for item in db_schema}

    # Extract keys from first JSON object (assuming all have same structure)
    json_keys = set(json_data[0].keys()) if json_data else set()

    # Find matches and differences
    exact_matches = db_columns & json_keys
    in_db_not_json = db_columns - json_keys
    in_json_not_db = json_keys - db_columns

    # Create report
    report = []
    report.append("=" * 80)
    report.append("DATABASE SCHEMA vs JSON DATA COMPARISON REPORT")
    report.append("=" * 80)
    report.append("")

    report.append(f"Total Database Columns: {len(db_columns)}")
    report.append(f"Total JSON Keys: {len(json_keys)}")
    report.append("")

    # Exact matches
    report.append("-" * 80)
    report.append(f"EXACT MATCHES ({len(exact_matches)} fields)")
    report.append("-" * 80)
    for field in sorted(exact_matches):
        report.append(f"  ✓ {field}")
    report.append("")

    # Missing in JSON (in database but not in JSON)
    report.append("-" * 80)
    report.append(f"MISSING IN JSON ({len(in_db_not_json)} fields)")
    report.append("(These columns exist in database but not in JSON data)")
    report.append("-" * 80)
    for field in sorted(in_db_not_json):
        # Find the column details
        col_details = next((col for col in db_schema if col["column_name"] == field), None)
        if col_details:
            nullable = "NULL" if col_details["is_nullable"] == "YES" else "NOT NULL"
            default = f"default: {col_details['column_default']}" if col_details['column_default'] else "no default"
            report.append(f"  ✗ {field:<25} ({col_details['data_type']}, {nullable}, {default})")
    report.append("")

    # Not in database (in JSON but not in database)
    report.append("-" * 80)
    report.append(f"NOT IN DATABASE ({len(in_json_not_db)} fields)")
    report.append("(These fields exist in JSON but not in database schema)")
    report.append("-" * 80)
    for field in sorted(in_json_not_db):
        # Get sample value from first record
        sample_value = json_data[0].get(field)
        value_type = type(sample_value).__name__
        report.append(f"  ! {field:<25} (sample type: {value_type})")
    report.append("")

    report.append("=" * 80)
    report.append("SUMMARY")
    report.append("=" * 80)
    match_percentage = (len(exact_matches) / max(len(db_columns), len(json_keys))) * 100
    report.append(f"Match Rate: {match_percentage:.1f}%")
    report.append(f"Exact Matches: {len(exact_matches)}")
    report.append(f"Missing in JSON: {len(in_db_not_json)}")
    report.append(f"Not in Database: {len(in_json_not_db)}")
    report.append("=" * 80)

    # Write report to file
    report_text = "\n".join(report)
    with open("schema_comparison_report.txt", 'w', encoding='utf-8') as f:
        f.write(report_text)

    # Print to console
    print(report_text)
    print(f"\n✓ Report saved to: schema_comparison_report.txt")


if __name__ == "__main__":
    main()
