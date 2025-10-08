#!/usr/bin/env python3
"""Create final exact mapping including the 5 missing tools."""

import json


def main():
    # AI Tools mapping (67 tools total)
    ai_tools = {
        # Audio (2 tools)
        'ElevenLabs': 'Audio',
        'SUNO': 'Audio',

        # Build (6 tools)
        'Bolt.new': 'Build',
        'CURSOR': 'Build',
        'ChatPRD': 'Build',
        'Lovable': 'Build',
        'replit': 'Build',
        'v0': 'Build',

        # Chat (11 tools)
        'ChatGPT': 'Chat',
        'Claude': 'Chat',
        'Doubao': 'Chat',
        'Gemini': 'Chat',
        'Grok': 'Chat',
        'Kimi': 'Chat',
        'Meta AI': 'Chat',
        'Monica': 'Chat',
        'Poe': 'Chat',
        'Qwen3': 'Chat',
        'deepseek': 'Chat',

        # Design/Prototype (3 tools)
        'Figma': 'Design/Prototype',
        'Magic Patterns': 'Design/Prototype',
        'Mobbin': 'Design/Prototype',

        # Development (5 tools)
        'Claude Code': 'Development',
        'DeepAI': 'Development',
        'Google AI Studio': 'Development',
        'Hugging Face': 'Development',
        'Warp': 'Development',

        # Image (9 tools)
        'CIVITAI': 'Image',
        'Leonardo.Ai': 'Image',
        'Midjourney': 'Image',
        'Photoroom': 'Image',
        'Pixelcut': 'Image',
        'SEARRT.AI': 'Image',
        'cutout.pro': 'Image',
        'ourdream.ai': 'Image',
        'remove.bg': 'Image',

        # Other (1 tool)
        'Adot': 'Other',

        # Platform (3 tools) - includes Quark
        'Hailuo AI': 'Platform',
        'PolyBuzz': 'Platform',
        'Quark': 'Platform',

        # Productivity (5 tools) - includes Linear, Notion, Raycast, Granola, Superhuman
        'Granola': 'Productivity',
        'Superhuman': 'Productivity',
        'Linear': 'Productivity',
        'Notion': 'Productivity',
        'Raycast': 'Productivity',

        # Research (2 tools)
        'Google Labs': 'Research',
        'NotebookLM': 'Research',

        # Roleplay (7 tools)
        'Crushon AI': 'Roleplay',
        'JanitorAI': 'Roleplay',
        'Joi': 'Roleplay',
        'JuicyChat': 'Roleplay',
        'SPICYCHAT.AI': 'Roleplay',
        'candy.ai': 'Roleplay',
        'character.ai': 'Roleplay',

        # Search (1 tool)
        'perplexity': 'Search',

        # Speech-to-text (1 tool)
        'WisprFlow': 'Speech-to-text',

        # Transcribe (1 tool)
        'TurboScribe': 'Transcribe',

        # Utils (1 tool) - ZeroGPT
        'ZeroGPT': 'Utils',

        # Vector DB (2 tools)
        'Pinecone': 'Vector DB',
        'Weaviate': 'Vector DB',

        # Video (4 tools)
        'Descript': 'Video',
        'KlingAI': 'Video',
        'Remaker': 'Video',
        'VEED': 'Video',

        # Write (3 tools)
        'GAMMA': 'Write',
        'QuillBot': 'Write',
        'manus': 'Write',
    }

    # Non-AI Tools (6 tools)
    non_ai_tools = {
        'Amadeus': 'APIs',
        'Zapier': 'Automation',
        'n8n': 'Automation',
        'Supabase': 'DB',
        'Vercel': 'Deploy',
        'Unsplash': 'Image',
    }

    # Verify count
    print(f"AI Tools count: {len(ai_tools)}")
    print(f"Non-AI Tools count: {len(non_ai_tools)}")
    print()

    # Create report
    report = []
    report.append("=" * 80)
    report.append("FINAL CATEGORY & SUBCATEGORY MAPPING FOR APPROVAL")
    report.append("=" * 80)
    report.append("")
    report.append(f"Total AI Tools: {len(ai_tools)}")
    report.append(f"Total Non-AI Tools: {len(non_ai_tools)}")
    report.append(f"Total Tools: {len(ai_tools) + len(non_ai_tools)}")
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
    report.append("AI Tools subcategories:")
    for subcat in sorted(ai_by_subcat.keys()):
        report.append(f"  - {subcat}")
    report.append("")
    report.append("Tools subcategories:")
    for subcat in sorted(tools_by_subcat.keys()):
        report.append(f"  - {subcat}")
    report.append("")

    # Write report
    report_text = "\n".join(report)
    with open("final_category_mapping_for_approval.txt", 'w', encoding='utf-8') as f:
        f.write(report_text)

    print(report_text)
    print()
    print("✓ Report saved to: final_category_mapping_for_approval.txt")

    # Save JSON mapping
    mapping = {
        'ai_tools': ai_tools,
        'non_ai_tools': non_ai_tools
    }
    with open('final_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)

    print("✓ Mapping saved to: final_mapping.json")
    print()
    print("Please review and confirm. Once approved, I'll create toolsSubscription6.json")


if __name__ == "__main__":
    main()
