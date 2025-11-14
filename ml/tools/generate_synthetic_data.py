#!/usr/bin/env python3
"""
Synthetic Data Generation Tool
Generates synthetic training examples with clinician review support
"""

import json
import os
import sys
import random
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime, timedelta
import argparse

# Import OpenAI if available
try:
    import openai
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("⚠️  OpenAI not available. Using template-based generation only.")

# Template patterns for synthetic generation
USER_MESSAGE_TEMPLATES = {
    'self-worth': [
        "I keep thinking I'm not good enough.",
        "I feel like I'm a failure.",
        "I can't stop thinking that I'm worthless.",
        "I always feel like I don't measure up.",
        "I have this belief that I'm fundamentally flawed.",
    ],
    'anxiety': [
        "I've been feeling really anxious about {topic}.",
        "I'm worried that {concern}.",
        "I can't stop worrying about {topic}.",
        "I feel anxious whenever I think about {topic}.",
        "My anxiety about {topic} is overwhelming.",
    ],
    'relationships': [
        "I'm struggling with my relationship with {person}.",
        "I feel disconnected from {person}.",
        "I'm worried about how {person} sees me.",
        "I don't know how to communicate with {person}.",
        "I feel like {person} doesn't understand me.",
    ],
    'grief': [
        "I'm still struggling with the loss of {person}.",
        "I can't seem to move on from {event}.",
        "I feel stuck in my grief.",
        "I don't know how to process this loss.",
        "I'm having a hard time accepting what happened.",
    ],
    'stress': [
        "I'm feeling overwhelmed by {situation}.",
        "I can't handle all this stress.",
        "I feel like I'm drowning in responsibilities.",
        "Everything feels like too much right now.",
        "I'm stressed about {topic}.",
    ],
}

ASSISTANT_RESPONSE_PATTERNS = {
    'validate': [
        "That sounds {difficulty} — I'm sorry you're carrying that.",
        "That must be {difficulty} — I hear you.",
        "I understand. That's a lot to carry.",
        "That sounds really {difficulty}.",
        "I'm sorry you're going through that.",
    ],
    'probe_story': [
        "Would you like to tell me more about that?",
        "What happened that made you feel that way?",
        "Can you share more about what that was like?",
        "I'd like to understand better. What was that experience like?",
        "Tell me more about when that happened.",
    ],
    'probe_root': [
        "When did you first remember feeling this way?",
        "What do you think might be underneath that feeling?",
        "Where do you think this belief comes from?",
        "When did this pattern first start?",
        "What's the earliest memory you have of feeling this?",
    ],
    'reframe': [
        "Let's look at that thought together. What evidence supports it? And what contradicts it?",
        "I wonder if there's another way to see that.",
        "What if we looked at this from a different angle?",
        "Can we explore that thought together?",
        "Let's test that belief. What would someone who cares about you say?",
    ],
}

SESSION_TYPES = ['check-in', 'gentle_deep', 'micro_practice']
AGE_RANGES = ['18-25', '26-30', '31-35', '36-40', '41-50', '50+']
CONCERNS = ['self-worth', 'anxiety', 'relationships', 'grief', 'stress', 'depression', 'anger', 'loneliness']

class SyntheticDataGenerator:
    """Generate synthetic training dialogues"""
    
    def __init__(self, seed_file: Optional[str] = None, use_openai: bool = False):
        self.seed_file = Path(seed_file) if seed_file else None
        self.seed_dialogues = self._load_seed_dialogues() if seed_file else []
        self.use_openai = use_openai and OPENAI_AVAILABLE
        if self.use_openai:
            openai.api_key = os.getenv('OPENAI_API_KEY')
    
    def _load_seed_dialogues(self) -> List[Dict]:
        """Load seed dialogues for pattern extraction"""
        if not self.seed_file or not self.seed_file.exists():
            return []
        
        with open(self.seed_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        return data.get('dialogues', [])
    
    def generate_dialogue_template(self, concern: str, session_type: str) -> Dict:
        """Generate a dialogue using templates"""
        # Select user message template
        templates = USER_MESSAGE_TEMPLATES.get(concern, USER_MESSAGE_TEMPLATES['anxiety'])
        user_msg_template = random.choice(templates)
        
        # Fill template variables
        user_msg = user_msg_template.format(
            topic=random.choice(['work', 'relationships', 'the future', 'my health', 'family']),
            concern=random.choice(['I won\'t be able to handle it', 'something bad will happen', 'I\'ll fail']),
            person=random.choice(['my partner', 'my friend', 'my family', 'my colleague']),
            event=random.choice(['the breakup', 'the loss', 'what happened']),
            situation=random.choice(['work', 'family', 'everything']),
        )
        
        # Generate assistant response
        intent = random.choice(['validate', 'probe_story', 'probe_root', 'reframe'])
        response_patterns = ASSISTANT_RESPONSE_PATTERNS.get(intent, ASSISTANT_RESPONSE_PATTERNS['validate'])
        assistant_msg = random.choice(response_patterns).format(
            difficulty=random.choice(['difficult', 'hard', 'heavy', 'painful', 'challenging'])
        )
        
        # Determine sentiment and risk
        sentiment = random.choice(['negative', 'very_negative', 'neutral'])
        risk_level = 'none'  # Most synthetic data should be safe
        
        # Create dialogue structure
        dialogue = {
            'dialogue_id': f"synthetic_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{random.randint(1000, 9999)}",
            'session_type': session_type,
            'user_profile': {
                'age_range': random.choice(AGE_RANGES),
                'concern': concern,
                'mood_score': random.randint(3, 7)
            },
            'messages': [
                {
                    'role': 'user',
                    'text': user_msg,
                    'timestamp': datetime.now().isoformat()
                },
                {
                    'role': 'assistant',
                    'text': assistant_msg,
                    'timestamp': (datetime.now() + timedelta(seconds=5)).isoformat(),
                    'intent': intent,
                    'sentiment': sentiment,
                    'risk_level': risk_level
                }
            ],
            'labels': {
                'primary_intent': intent,
                'overall_sentiment': sentiment,
                'max_risk_level': risk_level,
                'therapeutic_technique': self._get_technique(intent),
                'synthetic': True,
                'generated_at': datetime.now().isoformat()
            }
        }
        
        return dialogue
    
    def generate_with_openai(self, concern: str, session_type: str) -> Optional[Dict]:
        """Generate dialogue using OpenAI API"""
        if not self.use_openai:
            return None
        
        try:
            system_prompt = """You are generating a therapeutic dialogue for training an AI coach. 
Generate a brief conversation (2-4 messages) where:
1. User expresses a concern about: {concern}
2. Assistant responds with compassion and validation
3. Assistant uses therapeutic techniques (validation, probing, reframing)
4. Keep responses brief (2-4 sentences)
5. Use gentle, non-judgmental language

Return JSON format with dialogue_id, session_type, messages array, and labels."""
            
            user_prompt = f"Generate a {session_type} session dialogue about {concern}. Include 2-4 messages total."
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": system_prompt.format(concern=concern)},
                    {"role": "user", "content": user_prompt}
                ],
                temperature=0.7,
                max_tokens=500
            )
            
            # Parse response (would need JSON parsing)
            # For now, return None and use template method
            return None
            
        except Exception as e:
            print(f"⚠️  OpenAI generation failed: {e}")
            return None
    
    def _get_technique(self, intent: str) -> str:
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
    
    def generate_batch(self, count: int, concerns: Optional[List[str]] = None, 
                      session_types: Optional[List[str]] = None) -> List[Dict]:
        """Generate a batch of synthetic dialogues"""
        concerns = concerns or CONCERNS
        session_types = session_types or SESSION_TYPES
        
        dialogues = []
        
        for i in range(count):
            concern = random.choice(concerns)
            session_type = random.choice(session_types)
            
            # Try OpenAI first if enabled
            if self.use_openai and random.random() < 0.3:  # 30% OpenAI, 70% templates
                dialogue = self.generate_with_openai(concern, session_type)
                if dialogue:
                    dialogues.append(dialogue)
                    continue
            
            # Use template-based generation
            dialogue = self.generate_dialogue_template(concern, session_type)
            dialogues.append(dialogue)
        
        return dialogues
    
    def save_dialogues(self, dialogues: List[Dict], output_file: str, 
                      metadata: Optional[Dict] = None):
        """Save generated dialogues to file"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_data = {
            'version': '1.0',
            'description': 'Synthetic training dialogues (requires clinician review)',
            'generated_at': datetime.now().isoformat(),
            'total_dialogues': len(dialogues),
            'metadata': metadata or {},
            'dialogues': dialogues
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Generated {len(dialogues)} dialogues")
        print(f"   Saved to: {output_file}")
        print(f"   ⚠️  IMPORTANT: These require clinician review before use in training")

def main():
    parser = argparse.ArgumentParser(description='Generate synthetic training dialogues')
    parser.add_argument('--count', '-n', type=int, default=10, help='Number of dialogues to generate')
    parser.add_argument('--output', '-o', required=True, help='Output file path')
    parser.add_argument('--seed', '-s', help='Seed dialogues file for pattern extraction')
    parser.add_argument('--concerns', '-c', nargs='+', help='Specific concerns to generate')
    parser.add_argument('--session-types', '-t', nargs='+', help='Session types to generate')
    parser.add_argument('--use-openai', action='store_true', help='Use OpenAI for generation (requires API key)')
    
    args = parser.parse_args()
    
    generator = SyntheticDataGenerator(
        seed_file=args.seed,
        use_openai=args.use_openai
    )
    
    dialogues = generator.generate_batch(
        count=args.count,
        concerns=args.concerns,
        session_types=args.session_types
    )
    
    metadata = {
        'generation_method': 'openai' if args.use_openai else 'template',
        'seed_file': str(args.seed) if args.seed else None,
    }
    
    generator.save_dialogues(dialogues, args.output, metadata)
    
    print("\n📋 Next Steps:")
    print("1. Review generated dialogues")
    print("2. Use labeling tool to add/verify labels")
    print("3. Have clinician review for quality")
    print("4. Merge with seed dialogues for training")

if __name__ == '__main__':
    main()

