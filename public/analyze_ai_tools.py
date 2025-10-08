#!/usr/bin/env python3
"""Analyze and categorize AI Tools vs non-AI tools with subcategories."""

import json
from pathlib import Path


def is_ai_tool(record):
    """Determine if a tool is an AI tool based on its category and characteristics."""
    name = record.get('name', '')
    category = record.get('category', '')

    # Pure AI tool categories
    ai_categories = {
        'Chat', 'Search', 'Roleplay', 'Image', 'Video', 'Audio',
        'Transcribe', 'Write', 'Speech-to-text', 'Other'
    }

    # AI-assisted development/build tools
    ai_build_tools = {
        'CURSOR', 'Lovable', 'replit', 'Bolt.new', 'v0', 'ChatPRD',
        'Claude Code', 'Hugging Face', 'Google AI Studio', 'DeepAI'
    }

    # AI design tools
    ai_design_tools = {
        'Magic Patterns'
    }

    # AI productivity tools
    ai_productivity_tools = {
        'Granola'  # AI note-taking
    }

    # Non-AI tools (infrastructure, traditional SaaS)
    non_ai_tools = {
        'Amadeus', 'Zapier', 'n8n', 'Supabase', 'Vercel', 'Figma',
        'Mobbin', 'Unsplash', 'Linear', 'Notion', 'Superhuman',
        'Raycast', 'Warp', 'Pinecone', 'Weaviate'
    }

    if name in non_ai_tools:
        return False

    if category in ai_categories:
        return True

    if name in ai_build_tools or name in ai_design_tools or name in ai_productivity_tools:
        return True

    return False


def get_ai_subcategory(record):
    """Determine appropriate subcategory for AI tools."""
    category = record.get('category', '')
    name = record.get('name', '')

    # Map to subcategories
    subcategory_map = {
        'Chat': {
            'default': 'Conversational AI',
            'ChatGPT': 'Conversational AI',
            'Claude': 'Conversational AI',
            'Gemini': 'Conversational AI',
            'deepseek': 'Conversational AI',
            'Meta AI': 'Conversational AI',
            'Grok': 'Conversational AI',
            'Poe': 'AI Chat Platform',
            'Monica': 'AI Assistant',
            'Kimi': 'Conversational AI',
            'Qwen3': 'Conversational AI',
            'Doubao': 'Conversational AI'
        },
        'Search': {
            'default': 'AI Search',
            'perplexity': 'AI Search',
            'Google Labs': 'AI Research'
        },
        'Roleplay': {
            'default': 'Character AI'
        },
        'Image': {
            'default': 'Image Generation',
            'Midjourney': 'Image Generation',
            'Leonardo.Ai': 'Image Generation',
            'CIVITAI': 'AI Art Community',
            'SEARRT.AI': 'Image Generation',
            'Photoroom': 'AI Photo Editing',
            'Pixelcut': 'AI Photo Editing',
            'remove.bg': 'Background Removal',
            'cutout.pro': 'AI Photo Editing',
            'ourdream.ai': 'Image Generation'
        },
        'Video': {
            'default': 'Video Generation',
            'VEED': 'Video Editing',
            'KlingAI': 'Video Generation',
            'Remaker': 'AI Video Editing',
            'Descript': 'Video Editing'
        },
        'Audio': {
            'default': 'Audio Generation',
            'ElevenLabs': 'Text-to-Speech',
            'SUNO': 'Music Generation'
        },
        'Transcribe': {
            'default': 'Transcription',
            'TurboScribe': 'Transcription'
        },
        'Speech-to-text': {
            'default': 'Speech Recognition',
            'WisprFlow': 'Speech Recognition'
        },
        'Write': {
            'default': 'AI Writing',
            'NotebookLM': 'Research Assistant',
            'GAMMA': 'Presentation AI',
            'QuillBot': 'Writing Assistant',
            'manus': 'AI Writing'
        },
        'Build': {
            'default': 'AI Development',
            'CURSOR': 'AI Code Editor',
            'replit': 'AI Coding Platform',
            'Lovable': 'AI App Builder',
            'Bolt.new': 'AI Code Generator',
            'v0': 'UI Generation',
            'ChatPRD': 'Product Requirements'
        },
        'Development': {
            'default': 'AI Development',
            'Hugging Face': 'ML Models Platform',
            'Google AI Studio': 'AI Development',
            'DeepAI': 'AI API',
            'Claude Code': 'AI Code Assistant'
        },
        'Design/Prototype': {
            'default': 'AI Design',
            'Magic Patterns': 'UI Generation'
        },
        'Productivity': {
            'default': 'AI Productivity',
            'Granola': 'AI Note-taking'
        },
        'Utils': {
            'default': 'AI Utilities',
            'ZeroGPT': 'AI Detection',
            'Quark': 'AI Browser'
        },
        'Other': {
            'default': 'AI Tools',
            'Hailuo AI': 'AI Platform',
            'PolyBuzz': 'AI Platform',
            'Adot': 'AI Search'
        }
    }

    if category in subcategory_map:
        category_map = subcategory_map[category]
        return category_map.get(name, category_map['default'])

    return 'AI Tools'


def main():
    # Read JSON data
    with open("toolsSubscription5.json", 'r', encoding='utf-8') as f:
        data = json.load(f)

    # Categorize tools
    ai_tools = []
    non_ai_tools = []

    for record in data:
        name = record.get('name', '')
        category = record.get('category', '')

        if is_ai_tool(record):
            subcategory = get_ai_subcategory(record)
            ai_tools.append({
                'name': name,
                'current_category': category,
                'suggested_subcategory': subcategory
            })
        else:
            non_ai_tools.append({
                'name': name,
                'category': category
            })

    # Write AI tools report
    with open("ai_tools_list.txt", 'w', encoding='utf-8') as f:
        f.write("=" * 80 + "\n")
        f.write("AI TOOLS LIST WITH SUGGESTED SUBCATEGORIES\n")
        f.write("=" * 80 + "\n")
        f.write(f"\nTotal AI Tools: {len(ai_tools)}\n")
        f.write(f"Total Non-AI Tools: {len(non_ai_tools)}\n\n")

        f.write("-" * 80 + "\n")
        f.write("AI TOOLS (Category: 'AI Tools')\n")
        f.write("-" * 80 + "\n\n")

        # Group by subcategory
        subcategories = {}
        for tool in ai_tools:
            subcat = tool['suggested_subcategory']
            if subcat not in subcategories:
                subcategories[subcat] = []
            subcategories[subcat].append(tool)

        for subcat in sorted(subcategories.keys()):
            tools = subcategories[subcat]
            f.write(f"\n{subcat} ({len(tools)} tools):\n")
            for tool in sorted(tools, key=lambda x: x['name']):
                f.write(f"  - {tool['name']:<30} (currently: {tool['current_category']})\n")

        f.write("\n\n")
        f.write("-" * 80 + "\n")
        f.write("NON-AI TOOLS (Keep current categories)\n")
        f.write("-" * 80 + "\n\n")

        for tool in sorted(non_ai_tools, key=lambda x: x['name']):
            f.write(f"  - {tool['name']:<30} ({tool['category']})\n")

    # Print summary
    print("=" * 80)
    print("AI TOOLS CATEGORIZATION REPORT")
    print("=" * 80)
    print()
    print(f"Total tools analyzed: {len(data)}")
    print(f"AI Tools identified: {len(ai_tools)}")
    print(f"Non-AI Tools: {len(non_ai_tools)}")
    print()
    print("Subcategories for AI Tools:")
    print("-" * 80)
    for subcat in sorted(subcategories.keys()):
        print(f"  {subcat:<30} ({len(subcategories[subcat])} tools)")
    print()
    print("=" * 80)
    print(f"✓ Report saved to: ai_tools_list.txt")


if __name__ == "__main__":
    main()
