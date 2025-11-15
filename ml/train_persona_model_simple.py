#!/usr/bin/env python3
"""
Simple Persona Model Preparation
Creates training data file for OpenAI fine-tuning
"""

import json
import os
import sys
from pathlib import Path

SYSTEM_PROMPT = """You are "Ari", a compassionate, non-judgmental inner-work coach. Your job is to help users gently explore recurring negative beliefs and emotional patterns.

Core Principles:
1. Always begin with validation before probing deeper
2. Ask for consent before deeper exploration ("Are you ready to look at this together?")
3. Keep responses brief (2-4 sentences) unless user asks for longer reflection
4. Use reflective questions rather than direct advice
5. Offer one practical experiment at the end of a deep session
6. Avoid medical or legal advice

Safety Protocol:
- If user mentions self-harm or suicide, immediately:
  1. Acknowledge with compassion
  2. Ask about immediate safety
  3. Provide crisis resources
  4. Follow emergency escalation flow

Tone Guidelines:
- Compassionate and gentle
- Slightly poetic but grounded
- No clinical jargon (unless user asks)
- Short, reflective sentences
- Validate feelings first"""

def prepare_training_data():
    """Prepare training data in OpenAI format"""
    print("Loading training dialogues...")
    
    # Try to load expanded dialogues first, fall back to seed
    expanded_file = Path(__file__).parent.parent / 'data' / 'SEED_DIALOGUES_EXPANDED.json'
    seed_file = Path(__file__).parent.parent / 'SEED_DIALOGUES.json'
    
    data_file = expanded_file if expanded_file.exists() else seed_file
    
    if not data_file.exists():
        print(f"Error: No data file found at {data_file}")
        return False
    
    print(f"   Using: {data_file}")
    
    with open(data_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    training_examples = []
    
    for dialogue in data.get('dialogues', []):
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for msg in dialogue.get('messages', []):
            if msg.get('role') == 'user':
                messages.append({
                    "role": "user",
                    "content": msg['text']
                })
            elif msg.get('role') == 'assistant':
                messages.append({
                    "role": "assistant",
                    "content": msg['text']
                })
        
        if len(messages) > 1:  # Has at least one user message
            training_examples.append({"messages": messages})
    
    print(f"Prepared {len(training_examples)} training examples")
    
    # Save as JSONL
    output_file = Path(__file__).parent / 'training_data.jsonl'
    with open(output_file, 'w', encoding='utf-8') as f:
        for example in training_examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"Saved training data to: {output_file}")
    print(f"Total examples: {len(training_examples)}")
    
    return True

def main():
    """Main function"""
    print("=" * 60)
    print("Persona Model Training Data Preparation")
    print("=" * 60)
    print()
    
    success = prepare_training_data()
    
    if success:
        print()
        print("=" * 60)
        print("Next Steps")
        print("=" * 60)
        print("1. Review training_data.jsonl")
        print("2. If OpenAI API key is set, upload to OpenAI:")
        print("   python train_persona_model.py")
        print("3. Or manually upload via OpenAI dashboard")
        print()
    else:
        print("Failed to prepare training data")
        sys.exit(1)

if __name__ == "__main__":
    main()

