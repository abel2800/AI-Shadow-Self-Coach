#!/usr/bin/env python3
"""
Expand Seed Dialogues Tool
Expands seed dialogues from 20 to 500+ examples using templates and patterns
"""

import json
import os
import sys
import random
from pathlib import Path
from typing import Dict, List
from datetime import datetime, timedelta
import argparse
from collections import Counter

# Import synthetic generator components
sys.path.append(str(Path(__file__).parent))
try:
    from generate_synthetic_data import USER_MESSAGE_TEMPLATES, ASSISTANT_RESPONSE_PATTERNS
except ImportError:
    # Fallback if import fails
    USER_MESSAGE_TEMPLATES = {
        'self-worth': ["I keep thinking I'm not good enough.", "I feel like I'm a failure."],
        'anxiety': ["I've been feeling really anxious about {topic}.", "I'm worried that {concern}."],
        'relationships': ["I'm struggling with my relationship with {person}.", "I feel disconnected from {person}."],
        'grief': ["I'm still struggling with the loss of {person}.", "I can't seem to move on from {event}."],
        'stress': ["I'm feeling overwhelmed by {situation}.", "I can't handle all this stress."],
    }
    ASSISTANT_RESPONSE_PATTERNS = {
        'validate': ["That sounds {difficulty} — I'm sorry you're carrying that.", "That must be {difficulty} — I hear you."],
        'probe_story': ["Would you like to tell me more about that?", "What happened that made you feel that way?"],
        'probe_root': ["When did you first remember feeling this way?", "Where do you think this belief comes from?"],
        'reframe': ["Let's look at that thought together. What evidence supports it?", "I wonder if there's another way to see that."],
    }

SESSION_TYPES = ['check-in', 'gentle_deep', 'micro_practice']
AGE_RANGES = ['18-25', '26-30', '31-35', '36-40', '41-50', '50+']
CONCERNS = ['self-worth', 'anxiety', 'relationships', 'grief', 'stress', 'depression', 'anger', 'loneliness', 'perfectionism', 'shame', 'guilt']

INTENT_LABELS = [
    'validate', 'probe_story', 'probe_root', 'reframe',
    'suggest_experiment', 'offer_mindfulness', 'safety_check',
    'emergency', 'close', 'other'
]

SENTIMENT_LABELS = ['very_negative', 'negative', 'neutral', 'positive']
RISK_LEVEL_LABELS = ['none', 'low', 'medium', 'high']

THERAPEUTIC_TECHNIQUES = [
    'cognitive_reframing', 'compassion_focused', 'socratic_questioning',
    'grounding', 'breathing', 'body_scan', 'validation', 'exploration'
]

class SeedDialogueExpander:
    """Expand seed dialogues using patterns and templates"""
    
    def __init__(self, seed_file: str):
        self.seed_file = Path(seed_file)
        self.seed_data = self._load_seed_data()
        self.existing_dialogues = self.seed_data.get('dialogues', [])
        self.next_id = len(self.existing_dialogues) + 1
    
    def _load_seed_data(self) -> Dict:
        """Load existing seed dialogues"""
        if not self.seed_file.exists():
            print(f"Error: Seed file not found: {self.seed_file}")
            sys.exit(1)
        
        with open(self.seed_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _generate_dialogue_id(self) -> str:
        """Generate unique dialogue ID"""
        dialogue_id = f"seed_{self.next_id:03d}"
        self.next_id += 1
        return dialogue_id
    
    def _create_multi_turn_dialogue(self, concern: str, session_type: str, num_turns: int = 4) -> Dict:
        """Create a multi-turn dialogue"""
        messages = []
        base_time = datetime.now() - timedelta(days=random.randint(1, 30))
        
        # First user message
        user_templates = USER_MESSAGE_TEMPLATES.get(concern, USER_MESSAGE_TEMPLATES['anxiety'])
        first_user_msg = random.choice(user_templates).format(
            topic=random.choice(['work', 'relationships', 'the future', 'my health', 'family', 'school']),
            concern=random.choice(['I won\'t be able to handle it', 'something bad will happen', 'I\'ll fail', 'I\'m not good enough']),
            person=random.choice(['my partner', 'my friend', 'my family', 'my colleague', 'my parent']),
            event=random.choice(['the breakup', 'the loss', 'what happened', 'the argument']),
            situation=random.choice(['work', 'family', 'everything', 'my relationships']),
        )
        
        messages.append({
            'role': 'user',
            'text': first_user_msg,
            'timestamp': base_time.isoformat() + 'Z'
        })
        
        # Generate conversation turns
        current_intent = 'validate'
        for i in range(num_turns - 1):
            # Assistant response
            if i == 0:
                # First response: validate
                intent = 'validate'
                patterns = ASSISTANT_RESPONSE_PATTERNS['validate']
            elif i == 1:
                # Second response: probe story
                intent = 'probe_story'
                patterns = ASSISTANT_RESPONSE_PATTERNS['probe_story']
            elif i == 2:
                # Third response: probe root or reframe
                intent = random.choice(['probe_root', 'reframe'])
                patterns = ASSISTANT_RESPONSE_PATTERNS.get(intent, ASSISTANT_RESPONSE_PATTERNS['probe_root'])
            else:
                # Later responses: mix of techniques
                intent = random.choice(['probe_root', 'reframe', 'suggest_experiment', 'offer_mindfulness'])
                patterns = ASSISTANT_RESPONSE_PATTERNS.get(intent, ASSISTANT_RESPONSE_PATTERNS['probe_root'])
            
            assistant_text = random.choice(patterns).format(
                difficulty=random.choice(['difficult', 'hard', 'heavy', 'painful', 'challenging'])
            )
            
            messages.append({
                'role': 'assistant',
                'text': assistant_text,
                'timestamp': (base_time + timedelta(seconds=5 + i * 30)).isoformat() + 'Z',
                'intent': intent,
                'sentiment': random.choice(['negative', 'very_negative', 'neutral']),
                'risk_level': 'none'
            })
            
            # User response (if not last turn)
            if i < num_turns - 2:
                user_responses = self._generate_user_response(concern, intent)
                messages.append({
                    'role': 'user',
                    'text': user_responses,
                    'timestamp': (base_time + timedelta(seconds=10 + i * 30)).isoformat() + 'Z'
                })
        
        # Determine labels
        intents_used = [m.get('intent') for m in messages if m.get('role') == 'assistant' and m.get('intent')]
        primary_intent = intents_used[-1] if intents_used else 'validate'
        
        sentiments = [m.get('sentiment') for m in messages if m.get('sentiment')]
        overall_sentiment = max(set(sentiments), key=sentiments.count) if sentiments else 'negative'
        
        risk_levels = [m.get('risk_level') for m in messages if m.get('risk_level')]
        max_risk = max(risk_levels, key=RISK_LEVEL_LABELS.index) if risk_levels else 'none'
        
        technique = self._map_intent_to_technique(primary_intent)
        
        return {
            'dialogue_id': self._generate_dialogue_id(),
            'session_type': session_type,
            'user_profile': {
                'age_range': random.choice(AGE_RANGES),
                'concern': concern,
                'mood_score': random.randint(3, 7)
            },
            'messages': messages,
            'labels': {
                'primary_intent': primary_intent,
                'overall_sentiment': overall_sentiment,
                'max_risk_level': max_risk,
                'therapeutic_technique': technique
            }
        }
    
    def _generate_user_response(self, concern: str, last_intent: str) -> str:
        """Generate contextual user response"""
        responses = {
            'validate': [
                "Yes, I think so.",
                "I'm not sure.",
                "Maybe.",
                "I guess I could try.",
                "That makes sense."
            ],
            'probe_story': [
                "It happened last week.",
                "I'm not sure when it started.",
                "It's been going on for a while.",
                "Recently, I guess.",
                "I can't remember exactly."
            ],
            'probe_root': [
                "I think it started when I was younger.",
                "I'm not sure where it comes from.",
                "Maybe from my childhood?",
                "I don't know.",
                "It's hard to say."
            ],
            'reframe': [
                "I never thought about it that way.",
                "That's an interesting perspective.",
                "I'm not sure I see it that way.",
                "Maybe you're right.",
                "I'll think about that."
            ]
        }
        
        return random.choice(responses.get(last_intent, responses['validate']))
    
    def _map_intent_to_technique(self, intent: str) -> str:
        """Map intent to therapeutic technique"""
        mapping = {
            'validate': 'validation',
            'probe_story': 'exploration',
            'probe_root': 'exploration',
            'reframe': 'cognitive_reframing',
            'suggest_experiment': 'behavioral_experiment',
            'offer_mindfulness': 'mindfulness',
        }
        return mapping.get(intent, 'other')
    
    def expand(self, target_count: int = 500, distribution: Dict = None) -> List[Dict]:
        """Expand dialogues to target count"""
        current_count = len(self.existing_dialogues)
        needed = target_count - current_count
        
        if needed <= 0:
            print(f"Already have {current_count} dialogues, target is {target_count}")
            return self.existing_dialogues
        
        print(f"Expanding from {current_count} to {target_count} dialogues ({needed} new dialogues)")
        
        # Default distribution
        if not distribution:
            distribution = {
                'session_types': {'gentle_deep': 0.5, 'check-in': 0.3, 'micro_practice': 0.2},
                'concerns': {c: 1.0 / len(CONCERNS) for c in CONCERNS}
            }
        
        new_dialogues = []
        
        # Generate new dialogues
        for i in range(needed):
            # Select session type based on distribution
            session_type = random.choices(
                list(distribution['session_types'].keys()),
                weights=list(distribution['session_types'].values())
            )[0]
            
            # Select concern based on distribution
            concern = random.choices(
                list(distribution['concerns'].keys()),
                weights=list(distribution['concerns'].values())
            )[0]
            
            # Determine number of turns based on session type
            if session_type == 'check-in':
                num_turns = random.randint(2, 4)
            elif session_type == 'micro_practice':
                num_turns = random.randint(2, 3)
            else:  # gentle_deep
                num_turns = random.randint(4, 8)
            
            dialogue = self._create_multi_turn_dialogue(concern, session_type, num_turns)
            new_dialogues.append(dialogue)
            
            if (i + 1) % 50 == 0:
                print(f"Generated {i + 1}/{needed} dialogues...")
        
        # Combine with existing
        all_dialogues = self.existing_dialogues + new_dialogues
        
        print(f"✅ Generated {len(new_dialogues)} new dialogues")
        print(f"   Total: {len(all_dialogues)} dialogues")
        
        return all_dialogues
    
    def calculate_statistics(self, dialogues: List[Dict]) -> Dict:
        """Calculate statistics for dialogues"""
        stats = {
            'total_dialogues': len(dialogues),
            'session_types': Counter(d.get('session_type') for d in dialogues),
            'concerns': Counter(d.get('user_profile', {}).get('concern') for d in dialogues),
            'intent_distribution': Counter(),
            'sentiment_distribution': Counter(),
            'risk_level_distribution': Counter(),
            'therapeutic_techniques': Counter()
        }
        
        for dialogue in dialogues:
            # Count intents from messages
            for msg in dialogue.get('messages', []):
                if msg.get('intent'):
                    stats['intent_distribution'][msg['intent']] += 1
                if msg.get('sentiment'):
                    stats['sentiment_distribution'][msg['sentiment']] += 1
                if msg.get('risk_level'):
                    stats['risk_level_distribution'][msg['risk_level']] += 1
            
            # Count labels
            labels = dialogue.get('labels', {})
            if labels.get('therapeutic_technique'):
                stats['therapeutic_techniques'][labels['therapeutic_technique']] += 1
        
        # Convert Counters to dicts
        for key in stats:
            if isinstance(stats[key], Counter):
                stats[key] = dict(stats[key])
        
        return stats
    
    def save(self, dialogues: List[Dict], output_file: str):
        """Save expanded dialogues"""
        stats = self.calculate_statistics(dialogues)
        
        output_data = {
            'version': '1.0',
            'description': f'Expanded seed dialogues for training the AI Shadow-Self Coach persona ({len(dialogues)} examples)',
            'expanded_at': datetime.now().isoformat(),
            'dialogues': dialogues,
            'statistics': stats
        }
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Expanded dialogues saved to: {output_file}")
        print(f"\n📊 Statistics:")
        print(f"   Total dialogues: {stats['total_dialogues']}")
        print(f"   Session types: {dict(stats['session_types'])}")
        print(f"   Concerns: {len(stats['concerns'])} unique concerns")
        print(f"   Intents: {len(stats['intent_distribution'])} unique intents")
        print(f"   Therapeutic techniques: {len(stats['therapeutic_techniques'])} unique techniques")

def main():
    parser = argparse.ArgumentParser(description='Expand seed dialogues')
    parser.add_argument('--input', '-i', default='../SEED_DIALOGUES.json', help='Input seed dialogues file')
    parser.add_argument('--output', '-o', default='../SEED_DIALOGUES_EXPANDED.json', help='Output file')
    parser.add_argument('--target', '-t', type=int, default=500, help='Target number of dialogues')
    parser.add_argument('--validate', action='store_true', help='Validate output before saving')
    
    args = parser.parse_args()
    
    expander = SeedDialogueExpander(args.input)
    expanded = expander.expand(target_count=args.target)
    
    if args.validate:
        # Basic validation
        print("\n🔍 Validating dialogues...")
        errors = []
        for i, dialogue in enumerate(expanded):
            if not dialogue.get('dialogue_id'):
                errors.append(f"Dialogue {i}: Missing dialogue_id")
            if not dialogue.get('messages'):
                errors.append(f"Dialogue {i}: Missing messages")
            if len(dialogue.get('messages', [])) < 2:
                errors.append(f"Dialogue {i}: Too few messages")
        
        if errors:
            print(f"❌ Found {len(errors)} errors:")
            for error in errors[:10]:  # Show first 10
                print(f"   - {error}")
            if len(errors) > 10:
                print(f"   ... and {len(errors) - 10} more")
            sys.exit(1)
        else:
            print("✅ Validation passed")
    
    expander.save(expanded, args.output)
    
    print("\n📋 Next Steps:")
    print("1. Review expanded dialogues for quality")
    print("2. Use labeling tool to verify/add labels")
    print("3. Have clinician review sample")
    print("4. Use for model training")

if __name__ == '__main__':
    main()

