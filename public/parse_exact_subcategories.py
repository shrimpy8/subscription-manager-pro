#!/usr/bin/env python3
"""Parse exact subcategories from ai_tools_list.txt following user's specifications."""

import re


def main():
    with open('ai_tools_list.txt', 'r', encoding='utf-8') as f:
        content = f.read()

    ai_tools = {}  # name -> subcategory
    non_ai_tools = {}  # name -> subcategory

    lines = content.split('\n')

    in_ai_section = False
    in_non_ai_section = False

    for line in lines:
        # Check section markers
        if 'AI TOOLS (Category:' in line:
            in_ai_section = True
            in_non_ai_section = False
            continue
        elif 'NON-AI TOOLS' in line:
            in_ai_section = False
            in_non_ai_section = True
            continue

        # Parse tool lines starting with "  - "
        if line.strip().startswith('- '):
            # Extract tool name and subcategory info
            # Format: "  - ToolName    (currently: Category) => NewSubcategory"
            # Or: "  - ToolName    (Category) => NewSubcategory"
            # Or: "  - ToolName    (currently: Category)"
            # Or: "  - ToolName    (Category)"

            match = re.match(r'\s*-\s+([^\s]+(?:\s+[^\s]+)*?)\s+\((?:currently:\s*)?([^)]+)\)(?:\s*=>\s*(.+))?', line)

            if match:
                tool_name = match.group(1).strip()
                original_subcat = match.group(2).strip()
                new_subcat = match.group(3).strip() if match.group(3) else None

                # Use new subcategory if arrow exists, otherwise use original
                subcategory = new_subcat if new_subcat else original_subcat

                if in_ai_section:
                    ai_tools[tool_name] = subcategory
                elif in_non_ai_section:
                    non_ai_tools[tool_name] = subcategory

    # Create approval report
    report = []
    report.append("=" * 80)
    report.append("EXACT CATEGORY & SUBCATEGORY MAPPING (From Your Specifications)")
    report.append("=" * 80)
    report.append("")
    report.append(f"Total AI Tools: {len(ai_tools)}")
    report.append(f"Total Non-AI Tools: {len(non_ai_tools)}")
    report.append("")

    # AI Tools
    report.append("-" * 80)
    report.append("CATEGORY: 'AI Tools' (67 tools)")
    report.append("-" * 80)
    report.append("")

    # Group by subcategory
    ai_by_subcat = {}
    for name, subcat in ai_tools.items():
        if subcat not in ai_by_subcat:
            ai_by_subcat[subcat] = []
        ai_by_subcat[subcat].append(name)

    for subcat in sorted(ai_by_subcat.keys()):
        tools = sorted(ai_by_subcat[subcat])
        report.append(f"Subcategory: '{subcat}' ({len(tools)} tools)")
        for tool in tools:
            report.append(f"  - {tool}")
        report.append("")

    # Non-AI Tools
    report.append("-" * 80)
    report.append("CATEGORY: 'Tools' (6 tools)")
    report.append("-" * 80)
    report.append("")

    # Group by subcategory
    tools_by_subcat = {}
    for name, subcat in non_ai_tools.items():
        if subcat not in tools_by_subcat:
            tools_by_subcat[subcat] = []
        tools_by_subcat[subcat].append(name)

    for subcat in sorted(tools_by_subcat.keys()):
        tools = sorted(tools_by_subcat[subcat])
        report.append(f"Subcategory: '{subcat}' ({len(tools)} tools)")
        for tool in tools:
            report.append(f"  - {tool}")
        report.append("")

    report.append("=" * 80)
    report.append("SUMMARY")
    report.append("=" * 80)
    report.append(f"AI Tools unique subcategories: {len(ai_by_subcat)}")
    report.append(f"Tools unique subcategories: {len(tools_by_subcat)}")
    report.append("")

    # Write report
    report_text = "\n".join(report)
    with open("exact_category_mapping.txt", 'w', encoding='utf-8') as f:
        f.write(report_text)

    print(report_text)
    print()
    print("✓ Report saved to: exact_category_mapping.txt")

    # Save JSON mapping
    import json
    mapping = {
        'ai_tools': ai_tools,
        'non_ai_tools': non_ai_tools
    }
    with open('exact_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)

    print("✓ Mapping saved to: exact_mapping.json")
    print()
    print("Please review and confirm. Once approved, I'll create toolsSubscription6.json")


if __name__ == "__main__":
    main()
