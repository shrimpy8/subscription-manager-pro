#!/usr/bin/env python3
"""Compile category and subcategory mapping from ai_tools_list.txt."""

import json


def main():
    # Define the complete mapping based on ai_tools_list.txt

    # AI Tools (67 tools) - category: "AI Tools"
    ai_tools_mapping = {
        # AI API
        'DeepAI': 'AI API',

        # AI App Builder
        'Lovable': 'AI App Builder',

        # AI Art Community
        'CIVITAI': 'AI Art Community',

        # AI Assistant
        'Monica': 'AI Assistant',

        # AI Chat Platform
        'Poe': 'AI Chat Platform',

        # AI Code Assistant
        'Claude Code': 'AI Code Assistant',

        # AI Code Editor
        'CURSOR': 'AI Code Editor',

        # AI Code Generator
        'Bolt.new': 'AI Code Generator',

        # AI Coding Platform
        'replit': 'AI Coding Platform',

        # AI Development
        'Google AI Studio': 'AI Development',

        # AI Note-taking (updated with Superhuman)
        'Granola': 'AI Note-taking',
        'Superhuman': 'AI Note-taking',

        # AI Photo Editing
        'Photoroom': 'AI Photo Editing',
        'Pixelcut': 'AI Photo Editing',
        'cutout.pro': 'AI Photo Editing',

        # Platform (updated from "AI Platform")
        'Hailuo AI': 'Platform',
        'PolyBuzz': 'Platform',

        # Research (updated from "AI Research")
        'Google Labs': 'Research',

        # AI Search
        'Adot': 'AI Search',
        'perplexity': 'AI Search',

        # AI Video Editing
        'Remaker': 'AI Video Editing',

        # AI Writing
        'manus': 'AI Writing',

        # Background Removal
        'remove.bg': 'Background Removal',

        # Character AI
        'Crushon AI': 'Character AI',
        'JanitorAI': 'Character AI',
        'Joi': 'Character AI',
        'JuicyChat': 'Character AI',
        'SPICYCHAT.AI': 'Character AI',
        'candy.ai': 'Character AI',
        'character.ai': 'Character AI',

        # Conversational AI
        'ChatGPT': 'Conversational AI',
        'Claude': 'Conversational AI',
        'Doubao': 'Conversational AI',
        'Gemini': 'Conversational AI',
        'Grok': 'Conversational AI',
        'Kimi': 'Conversational AI',
        'Meta AI': 'Conversational AI',
        'Qwen3': 'Conversational AI',
        'deepseek': 'Conversational AI',

        # Image Generation
        'Leonardo.Ai': 'Image Generation',
        'Midjourney': 'Image Generation',
        'SEARRT.AI': 'Image Generation',
        'ourdream.ai': 'Image Generation',

        # ML Models Platform
        'Hugging Face': 'ML Models Platform',

        # Music Generation
        'SUNO': 'Music Generation',

        # Presentation AI
        'GAMMA': 'Presentation AI',

        # Product Requirements
        'ChatPRD': 'Product Requirements',

        # Research (updated from "Research Assistant")
        'NotebookLM': 'Research',

        # Speech Recognition
        'WisprFlow': 'Speech Recognition',

        # Text-to-Speech
        'ElevenLabs': 'Text-to-Speech',

        # Transcription
        'TurboScribe': 'Transcription',

        # UI Generation
        'Magic Patterns': 'UI Generation',
        'Figma': 'UI Generation',
        'Mobbin': 'UI Generation',
        'v0': 'UI Generation',

        # Video Editing
        'Descript': 'Video Editing',
        'VEED': 'Video Editing',

        # Video Generation
        'KlingAI': 'Video Generation',

        # Writing Assistant
        'QuillBot': 'Writing Assistant',

        # Additional AI Tools from updated list
        'Weaviate': 'Vector DB',
        'Pinecone': 'Vector DB',
        'Warp': 'Development',  # updated from Utils
        'Linear': 'Productivity',
        'Notion': 'Productivity',
        'ZeroGPT': 'Utils',
        'Raycast': 'Productivity',
        'Quark': 'Platform',  # updated from Utils
    }

    # Non-AI Tools (6 tools) - category: "Tools"
    tools_mapping = {
        'Amadeus': 'APIs',
        'Supabase': 'DB',
        'Unsplash': 'Image',
        'Vercel': 'Deploy',
        'Zapier': 'Automation',
        'n8n': 'Automation',
    }

    # Read current data
    with open('toolsSubscription5.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Create report
    report = []
    report.append("=" * 80)
    report.append("CATEGORY & SUBCATEGORY MAPPING FOR APPROVAL")
    report.append("=" * 80)
    report.append("")
    report.append(f"Total tools: {len(data)}")
    report.append(f"AI Tools: {len(ai_tools_mapping)}")
    report.append(f"Non-AI Tools: {len(tools_mapping)}")
    report.append("")

    # AI Tools section
    report.append("-" * 80)
    report.append("CATEGORY: 'AI Tools' (67 tools)")
    report.append("-" * 80)
    report.append("")

    # Group by subcategory
    ai_by_subcat = {}
    for name, subcat in ai_tools_mapping.items():
        if subcat not in ai_by_subcat:
            ai_by_subcat[subcat] = []
        ai_by_subcat[subcat].append(name)

    for subcat in sorted(ai_by_subcat.keys()):
        tools = sorted(ai_by_subcat[subcat])
        report.append(f"{subcat} ({len(tools)} tools):")
        for tool in tools:
            report.append(f"  - {tool}")
        report.append("")

    # Non-AI Tools section
    report.append("-" * 80)
    report.append("CATEGORY: 'Tools' (6 tools)")
    report.append("-" * 80)
    report.append("")

    # Group by subcategory
    tools_by_subcat = {}
    for name, subcat in tools_mapping.items():
        if subcat not in tools_by_subcat:
            tools_by_subcat[subcat] = []
        tools_by_subcat[subcat].append(name)

    for subcat in sorted(tools_by_subcat.keys()):
        tools = sorted(tools_by_subcat[subcat])
        report.append(f"{subcat} ({len(tools)} tools):")
        for tool in tools:
            report.append(f"  - {tool}")
        report.append("")

    report.append("=" * 80)
    report.append("SUMMARY")
    report.append("=" * 80)
    report.append(f"AI Tools subcategories: {len(ai_by_subcat)}")
    report.append(f"Tools subcategories: {len(tools_by_subcat)}")
    report.append("")

    # Write report
    report_text = "\n".join(report)
    with open("category_mapping_for_approval.txt", 'w', encoding='utf-8') as f:
        f.write(report_text)

    print(report_text)
    print()
    print("✓ Report saved to: category_mapping_for_approval.txt")
    print()
    print("Please review and approve. Once approved, I'll create toolsSubscription6.json")

    # Save mapping for later use
    mapping_data = {
        'ai_tools': ai_tools_mapping,
        'tools': tools_mapping
    }
    with open('category_mapping.json', 'w', encoding='utf-8') as f:
        json.dump(mapping_data, f, indent=2, ensure_ascii=False)

    print("✓ Mapping saved to: category_mapping.json")


if __name__ == "__main__":
    main()
