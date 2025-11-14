#!/usr/bin/env python3
"""
Label Validator
Validates and checks quality of labeled data
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

class LabelValidator:
    """Validate labeled data"""
    
    def __init__(self, labels_file: str):
        self.labels_file = Path(labels_file)
        self.data = self._load_data()
        self.errors = []
        self.warnings = []
        self.stats = {}
    
    def _load_data(self) -> Dict:
        """Load labels file"""
        if not self.labels_file.exists():
            print(f"Error: Labels file not found: {self.labels_file}")
            sys.exit(1)
        
        with open(self.labels_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def validate(self) -> bool:
        """Validate all labels"""
        labels = self.data.get('labels', [])
        
        if not labels:
            self.errors.append("No labels found in file")
            return False
        
        # Validate each label
        for i, label in enumerate(labels):
            self._validate_label(label, i)
        
        # Calculate statistics
        self._calculate_stats(labels)
        
        return len(self.errors) == 0
    
    def _validate_label(self, label: Dict, index: int):
        """Validate a single label"""
        # Check required fields
        if 'intent' not in label:
            self.errors.append(f"Label {index}: Missing 'intent' field")
        elif label['intent'] not in INTENT_LABELS:
            self.errors.append(f"Label {index}: Invalid intent '{label['intent']}'")
        
        if 'sentiment' not in label:
            self.errors.append(f"Label {index}: Missing 'sentiment' field")
        elif label['sentiment'] not in SENTIMENT_LABELS:
            self.errors.append(f"Label {index}: Invalid sentiment '{label['sentiment']}'")
        
        if 'risk_level' not in label:
            self.errors.append(f"Label {index}: Missing 'risk_level' field")
        elif label['risk_level'] not in RISK_LEVEL_LABELS:
            self.errors.append(f"Label {index}: Invalid risk_level '{label['risk_level']}'")
        
        # Check for inconsistencies
        if label.get('risk_level') == 'high' and label.get('intent') != 'emergency':
            self.warnings.append(
                f"Label {index}: High risk but intent is not 'emergency'"
            )
        
        if label.get('intent') == 'emergency' and label.get('risk_level') != 'high':
            self.warnings.append(
                f"Label {index}: Emergency intent but risk_level is not 'high'"
            )
    
    def _calculate_stats(self, labels: List[Dict]):
        """Calculate label statistics"""
        intents = [l.get('intent') for l in labels]
        sentiments = [l.get('sentiment') for l in labels]
        risk_levels = [l.get('risk_level') for l in labels]
        
        self.stats = {
            'total': len(labels),
            'intent_distribution': dict(Counter(intents)),
            'sentiment_distribution': dict(Counter(sentiments)),
            'risk_level_distribution': dict(Counter(risk_levels)),
        }
    
    def print_report(self):
        """Print validation report"""
        print("\n" + "="*80)
        print("LABEL VALIDATION REPORT")
        print("="*80)
        
        print(f"\nFile: {self.labels_file}")
        print(f"Total Labels: {self.stats.get('total', 0)}")
        
        # Errors
        if self.errors:
            print(f"\n❌ ERRORS ({len(self.errors)}):")
            for error in self.errors:
                print(f"  - {error}")
        else:
            print("\n✅ No errors found")
        
        # Warnings
        if self.warnings:
            print(f"\n⚠️  WARNINGS ({len(self.warnings)}):")
            for warning in self.warnings:
                print(f"  - {warning}")
        else:
            print("\n✅ No warnings")
        
        # Statistics
        print("\n📊 STATISTICS:")
        print(f"\nIntent Distribution:")
        for intent, count in self.stats.get('intent_distribution', {}).items():
            percentage = (count / self.stats['total']) * 100
            print(f"  {intent}: {count} ({percentage:.1f}%)")
        
        print(f"\nSentiment Distribution:")
        for sentiment, count in self.stats.get('sentiment_distribution', {}).items():
            percentage = (count / self.stats['total']) * 100
            print(f"  {sentiment}: {count} ({percentage:.1f}%)")
        
        print(f"\nRisk Level Distribution:")
        for risk, count in self.stats.get('risk_level_distribution', {}).items():
            percentage = (count / self.stats['total']) * 100
            print(f"  {risk}: {count} ({percentage:.1f}%)")
        
        print("\n" + "="*80)
    
    def export_for_training(self, output_file: str):
        """Export validated labels in training format"""
        labels = self.data.get('labels', [])
        
        training_data = []
        for label in labels:
            training_data.append({
                'text': label.get('text', ''),
                'intent': label['intent'],
                'sentiment': label['sentiment'],
                'risk_level': label['risk_level'],
            })
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(training_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Training data exported to: {output_file}")

def main():
    parser = argparse.ArgumentParser(description='Validate labeled data')
    parser.add_argument('--input', '-i', required=True, help='Labels file to validate')
    parser.add_argument('--export', '-e', help='Export validated data to training format')
    
    args = parser.parse_args()
    
    validator = LabelValidator(args.input)
    is_valid = validator.validate()
    validator.print_report()
    
    if args.export and is_valid:
        validator.export_for_training(args.export)
    
    sys.exit(0 if is_valid else 1)

if __name__ == '__main__':
    main()

