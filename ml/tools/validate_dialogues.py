#!/usr/bin/env python3
"""
Validate Dialogues Tool
Validates seed dialogues for structure and quality
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
from collections import Counter
import argparse

INTENT_LABELS = [
    'validate', 'probe_story', 'probe_root', 'reframe',
    'suggest_experiment', 'offer_mindfulness', 'safety_check',
    'emergency', 'close', 'other'
]

SENTIMENT_LABELS = ['very_negative', 'negative', 'neutral', 'positive']
RISK_LEVEL_LABELS = ['none', 'low', 'medium', 'high']
SESSION_TYPES = ['check-in', 'gentle_deep', 'micro_practice']

class DialogueValidator:
    """Validate dialogue structure and quality"""
    
    def __init__(self, dialogues_file: str):
        self.dialogues_file = Path(dialogues_file)
        self.data = self._load_data()
        self.errors = []
        self.warnings = []
        self.stats = {}
    
    def _load_data(self) -> Dict:
        """Load dialogues file"""
        if not self.dialogues_file.exists():
            print(f"Error: File not found: {self.dialogues_file}")
            sys.exit(1)
        
        with open(self.dialogues_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def validate(self) -> bool:
        """Validate all dialogues"""
        dialogues = self.data.get('dialogues', [])
        
        if not dialogues:
            self.errors.append("No dialogues found in file")
            return False
        
        # Validate each dialogue
        for i, dialogue in enumerate(dialogues):
            self._validate_dialogue(dialogue, i)
        
        # Calculate statistics
        self._calculate_stats(dialogues)
        
        # Check distribution
        self._check_distribution(dialogues)
        
        return len(self.errors) == 0
    
    def _validate_dialogue(self, dialogue: Dict, index: int):
        """Validate a single dialogue"""
        # Required fields
        if 'dialogue_id' not in dialogue:
            self.errors.append(f"Dialogue {index}: Missing 'dialogue_id'")
        
        if 'session_type' not in dialogue:
            self.errors.append(f"Dialogue {index}: Missing 'session_type'")
        elif dialogue['session_type'] not in SESSION_TYPES:
            self.errors.append(f"Dialogue {index}: Invalid session_type '{dialogue['session_type']}'")
        
        if 'messages' not in dialogue:
            self.errors.append(f"Dialogue {index}: Missing 'messages'")
        elif not isinstance(dialogue['messages'], list):
            self.errors.append(f"Dialogue {index}: 'messages' must be an array")
        elif len(dialogue['messages']) < 2:
            self.errors.append(f"Dialogue {index}: Must have at least 2 messages")
        else:
            # Validate messages
            for j, msg in enumerate(dialogue['messages']):
                self._validate_message(msg, index, j)
        
        if 'user_profile' not in dialogue:
            self.errors.append(f"Dialogue {index}: Missing 'user_profile'")
        else:
            profile = dialogue['user_profile']
            if 'concern' not in profile:
                self.errors.append(f"Dialogue {index}: Missing 'user_profile.concern'")
            if 'mood_score' not in profile:
                self.warnings.append(f"Dialogue {index}: Missing 'user_profile.mood_score'")
            elif not (1 <= profile['mood_score'] <= 10):
                self.errors.append(f"Dialogue {index}: Invalid mood_score (must be 1-10)")
        
        if 'labels' not in dialogue:
            self.warnings.append(f"Dialogue {index}: Missing 'labels'")
        else:
            labels = dialogue['labels']
            if 'primary_intent' not in labels:
                self.warnings.append(f"Dialogue {index}: Missing 'labels.primary_intent'")
            elif labels['primary_intent'] not in INTENT_LABELS:
                self.errors.append(f"Dialogue {index}: Invalid primary_intent '{labels['primary_intent']}'")
    
    def _validate_message(self, message: Dict, dialogue_index: int, message_index: int):
        """Validate a single message"""
        if 'role' not in message:
            self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Missing 'role'")
        elif message['role'] not in ['user', 'assistant']:
            self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Invalid role '{message['role']}'")
        
        if 'text' not in message:
            self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Missing 'text'")
        elif not message['text'] or len(message['text'].strip()) == 0:
            self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Empty text")
        
        if message.get('role') == 'assistant':
            if 'intent' in message and message['intent'] not in INTENT_LABELS:
                self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Invalid intent '{message['intent']}'")
            
            if 'sentiment' in message and message['sentiment'] not in SENTIMENT_LABELS:
                self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Invalid sentiment '{message['sentiment']}'")
            
            if 'risk_level' in message and message['risk_level'] not in RISK_LEVEL_LABELS:
                self.errors.append(f"Dialogue {dialogue_index}, Message {message_index}: Invalid risk_level '{message['risk_level']}'")
    
    def _calculate_stats(self, dialogues: List[Dict]):
        """Calculate statistics"""
        self.stats = {
            'total': len(dialogues),
            'session_types': Counter(d.get('session_type') for d in dialogues),
            'concerns': Counter(d.get('user_profile', {}).get('concern') for d in dialogues),
            'intents': Counter(),
            'sentiments': Counter(),
            'risk_levels': Counter(),
            'avg_messages_per_dialogue': sum(len(d.get('messages', [])) for d in dialogues) / len(dialogues) if dialogues else 0
        }
        
        for dialogue in dialogues:
            for msg in dialogue.get('messages', []):
                if msg.get('intent'):
                    self.stats['intents'][msg['intent']] += 1
                if msg.get('sentiment'):
                    self.stats['sentiments'][msg['sentiment']] += 1
                if msg.get('risk_level'):
                    self.stats['risk_levels'][msg['risk_level']] += 1
        
        # Convert Counters to dicts
        for key in ['session_types', 'concerns', 'intents', 'sentiments', 'risk_levels']:
            self.stats[key] = dict(self.stats[key])
    
    def _check_distribution(self, dialogues: List[Dict]):
        """Check if distribution is balanced"""
        session_types = self.stats['session_types']
        total = self.stats['total']
        
        # Check session type distribution
        for session_type in SESSION_TYPES:
            count = session_types.get(session_type, 0)
            percentage = (count / total) * 100 if total > 0 else 0
            
            if percentage < 10:
                self.warnings.append(f"Low representation of '{session_type}': {percentage:.1f}%")
            elif percentage > 70:
                self.warnings.append(f"High representation of '{session_type}': {percentage:.1f}%")
    
    def print_report(self):
        """Print validation report"""
        print("\n" + "="*80)
        print("DIALOGUE VALIDATION REPORT")
        print("="*80)
        
        print(f"\nFile: {self.dialogues_file}")
        print(f"Total Dialogues: {self.stats.get('total', 0)}")
        
        # Errors
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors[:20]:  # Show first 20
                print(f"  - {error}")
            if len(self.errors) > 20:
                print(f"  ... and {len(self.errors) - 20} more errors")
        else:
            print("\n✅ No errors found")
        
        # Warnings
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings[:10]:  # Show first 10
                print(f"  - {warning}")
            if len(self.warnings) > 10:
                print(f"  ... and {len(self.warnings) - 10} more warnings")
        else:
            print("\n✅ No warnings")
        
        # Statistics
        print("\n📊 STATISTICS:")
        print(f"\nSession Type Distribution:")
        for session_type, count in self.stats.get('session_types', {}).items():
            percentage = (count / self.stats['total']) * 100
            print(f"  {session_type}: {count} ({percentage:.1f}%)")
        
        print(f"\nConcern Distribution:")
        for concern, count in list(self.stats.get('concerns', {}).items())[:10]:
            percentage = (count / self.stats['total']) * 100
            print(f"  {concern}: {count} ({percentage:.1f}%)")
        
        print(f"\nIntent Distribution:")
        for intent, count in self.stats.get('intents', {}).items():
            percentage = (count / sum(self.stats.get('intents', {}).values())) * 100 if self.stats.get('intents') else 0
            print(f"  {intent}: {count} ({percentage:.1f}%)")
        
        print(f"\nAverage Messages per Dialogue: {self.stats.get('avg_messages_per_dialogue', 0):.1f}")
        
        print("\n" + "="*80)

def main():
    parser = argparse.ArgumentParser(description='Validate seed dialogues')
    parser.add_argument('--input', '-i', required=True, help='Dialogues file to validate')
    
    args = parser.parse_args()
    
    validator = DialogueValidator(args.input)
    is_valid = validator.validate()
    validator.print_report()
    
    sys.exit(0 if is_valid else 1)

if __name__ == '__main__':
    main()

