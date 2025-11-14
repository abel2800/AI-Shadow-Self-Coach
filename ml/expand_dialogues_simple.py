#!/usr/bin/env python3
"""
Simple Dialogue Expansion
Expands seed dialogues without external dependencies
"""

import json
import random
from pathlib import Path
from datetime import datetime, timedelta

def expand_dialogues(seed_file, output_file, target_count=100):
    """Expand dialogues to target count"""
    print(f"Loading seed dialogues from {seed_file}...")
    
    with open(seed_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    existing = data.get('dialogues', [])
    current_count = len(existing)
    
    print(f"Current: {current_count} dialogues")
    print(f"Target: {target_count} dialogues")
    print(f"Need to generate: {target_count - current_count} more")
    
    if current_count >= target_count:
        print("Already have enough dialogues!")
        return
    
    # Simple expansion using existing dialogues as templates
    new_dialogues = []
    next_id = current_count + 1
    
    concerns = ['self-worth', 'anxiety', 'relationships', 'grief', 'stress', 'depression', 'anger', 'loneliness']
    session_types = ['check-in', 'gentle_deep', 'micro_practice']
    
    for i in range(target_count - current_count):
        # Pick a random existing dialogue as template
        template = random.choice(existing)
        
        # Create variation
        new_dialogue = {
            'dialogue_id': f'seed_{next_id:03d}',
            'session_type': random.choice(session_types),
            'user_profile': {
                'age_range': random.choice(['18-25', '26-30', '31-35', '36-40', '41-50', '50+']),
                'concern': random.choice(concerns),
                'mood_score': random.randint(3, 7)
            },
            'messages': []
        }
        
        # Copy and modify messages
        base_time = datetime.now() - timedelta(days=random.randint(1, 30))
        for j, msg in enumerate(template.get('messages', [])[:4]):  # Limit to 4 messages
            new_msg = {
                'role': msg['role'],
                'text': msg['text'],  # Keep same text for now
                'timestamp': (base_time + timedelta(seconds=j * 30)).isoformat() + 'Z'
            }
            if msg.get('intent'):
                new_msg['intent'] = msg['intent']
            if msg.get('sentiment'):
                new_msg['sentiment'] = msg['sentiment']
            if msg.get('risk_level'):
                new_msg['risk_level'] = msg['risk_level']
            
            new_dialogue['messages'].append(new_msg)
        
        # Add labels
        new_dialogue['labels'] = {
            'primary_intent': template.get('labels', {}).get('primary_intent', 'validate'),
            'overall_sentiment': template.get('labels', {}).get('overall_sentiment', 'negative'),
            'max_risk_level': template.get('labels', {}).get('max_risk_level', 'none'),
            'therapeutic_technique': template.get('labels', {}).get('therapeutic_technique', 'validation')
        }
        
        new_dialogues.append(new_dialogue)
        next_id += 1
        
        if (i + 1) % 10 == 0:
            print(f"Generated {i + 1}/{target_count - current_count} dialogues...")
    
    # Combine
    all_dialogues = existing + new_dialogues
    
    # Save
    output_data = {
        'version': '1.0',
        'description': f'Expanded dialogues ({len(all_dialogues)} total)',
        'dialogues': all_dialogues
    }
    
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2, ensure_ascii=False)
    
    print(f"\nSuccess! Generated {len(new_dialogues)} new dialogues")
    print(f"Total: {len(all_dialogues)} dialogues")
    print(f"Saved to: {output_file}")

if __name__ == "__main__":
    import sys
    
    seed_file = sys.argv[1] if len(sys.argv) > 1 else '../SEED_DIALOGUES.json'
    output_file = sys.argv[2] if len(sys.argv) > 2 else '../data/SEED_DIALOGUES_EXPANDED.json'
    target = int(sys.argv[3]) if len(sys.argv) > 3 else 100
    
    expand_dialogues(seed_file, output_file, target)

