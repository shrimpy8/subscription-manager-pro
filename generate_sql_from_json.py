#!/usr/bin/env python3
"""
Generate SQL INSERT statements from toolsSubscription6.json
This script processes the JSON data and creates complete SQL insertion statements
with proper handling of relationships and data types.
"""

import json
import sys
from datetime import datetime
from typing import Dict, List, Any, Optional

def load_json_data(file_path: str) -> List[Dict[str, Any]]:
    """Load and parse JSON data from file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print(f"Error: File {file_path} not found")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON in {file_path}: {e}")
        sys.exit(1)

def format_sql_value(value: Any, field_type: str = 'text') -> str:
    """Format a value for SQL insertion with proper escaping."""
    if value is None:
        return 'NULL'
    
    if isinstance(value, bool):
        return 'true' if value else 'false'
    
    if isinstance(value, (int, float)):
        return str(value)
    
    if isinstance(value, str):
        # Escape single quotes for SQL
        escaped = value.replace("'", "''")
        return f"'{escaped}'"
    
    return f"'{str(value)}'"

def generate_subscription_insert(data: Dict[str, Any]) -> str:
    """Generate SQL INSERT statement for a subscription."""
    # Map JSON fields to database columns
    fields = {
        'id': data.get('id'),
        'name': data.get('name'),
        'category': data.get('category'),
        'subcategory': data.get('subcategory'),
        'description': data.get('description'),
        'url': data.get('url'),
        'logo_url': data.get('logo_url'),
        'plan': data.get('plan'),
        'cost': data.get('cost'),
        'currency': data.get('currency'),
        'billing_cycle': data.get('billing_cycle'),
        'status': data.get('status'),
        'notes': data.get('notes'),
        'renewal_date': data.get('renewal_date'),
        'start_date': data.get('start_date'),
        'fallback_icon': data.get('fallback_icon'),
        'usage_frequency': data.get('usage_frequency'),
        'usage_importance': data.get('usage_importance'),
        'secret_key': data.get('secret_key'),
        'china_region_only': data.get('china_region_only'),
        'safe_for_work': data.get('safe_for_work'),
        'a16z_rank': data.get('a16z_rank'),
        'account_email': data.get('account_email'),
        'auto_renew': data.get('auto_renew'),
        'iam_using_it': data.get('iam_using_it'),
        'no_subscription': data.get('no_subscription'),
        'not_in_a16z': data.get('not_in_a16z')
    }
    
    # Generate INSERT statement
    columns = list(fields.keys())
    values = [format_sql_value(fields[col]) for col in columns]
    
    return f"""INSERT INTO subscriptions ({', '.join(columns)}) VALUES ({', '.join(values)});"""

def generate_relationship_inserts(data: Dict[str, Any]) -> List[str]:
    """Generate SQL INSERT statements for relationship data."""
    inserts = []
    subscription_id = data.get('id')
    
    if not subscription_id:
        return inserts
    
    # API Keys
    api_keys = data.get('subscription_api_keys', [])
    for key_data in api_keys:
        key_name = key_data.get('key_name', '')
        key_value = key_data.get('key_value', '')
        if key_name and key_value:
            inserts.append(f"""INSERT INTO subscription_api_keys (subscription_id, key_name, key_value) VALUES ('{subscription_id}', {format_sql_value(key_name)}, {format_sql_value(key_value)});""")
    
    # Promo Codes
    promo_codes = data.get('subscription_previous_promocodes', [])
    for promo_data in promo_codes:
        promo_code = promo_data.get('promocode', '')
        if promo_code:
            inserts.append(f"""INSERT INTO subscription_promo_codes (subscription_id, promo_code) VALUES ('{subscription_id}', {format_sql_value(promo_code)});""")
    
    # Account Emails
    account_emails = data.get('subscription_previous_accountemails', [])
    for email_data in account_emails:
        email = email_data.get('email', '')
        if email:
            inserts.append(f"""INSERT INTO subscription_account_emails (subscription_id, email) VALUES ('{subscription_id}', {format_sql_value(email)});""")
    
    return inserts

def generate_complete_sql(json_file: str, output_file: str):
    """Generate complete SQL file from JSON data."""
    data = load_json_data(json_file)
    
    sql_statements = [
        "-- ============================================================================",
        "-- INSERT SUBSCRIPTION DATA FROM toolsSubscription6.json",
        "-- ============================================================================",
        "-- Generated on: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "-- ============================================================================",
        "",
        "BEGIN;",
        "",
        "-- ============================================================================",
        "-- INSERT MAIN SUBSCRIPTION DATA",
        "-- ============================================================================",
        ""
    ]
    
    # Generate subscription inserts
    for item in data:
        sql_statements.append(generate_subscription_insert(item))
        sql_statements.append("")
    
    sql_statements.extend([
        "-- ============================================================================",
        "-- INSERT RELATIONSHIP DATA",
        "-- ============================================================================",
        ""
    ])
    
    # Generate relationship inserts
    for item in data:
        relationship_inserts = generate_relationship_inserts(item)
        sql_statements.extend(relationship_inserts)
        if relationship_inserts:
            sql_statements.append("")
    
    sql_statements.extend([
        "COMMIT;",
        "",
        "-- ============================================================================",
        "-- END OF DATA INSERTION",
        "-- ============================================================================"
    ])
    
    # Write to output file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write('\n'.join(sql_statements))
    
    print(f"Generated SQL file: {output_file}")
    print(f"Processed {len(data)} subscriptions")

def main():
    """Main function."""
    if len(sys.argv) != 3:
        print("Usage: python generate_sql_from_json.py <input_json_file> <output_sql_file>")
        print("Example: python generate_sql_from_json.py public/toolsSubscription6.json complete_data_insert.sql")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    generate_complete_sql(input_file, output_file)

if __name__ == "__main__":
    main()
