#!/usr/bin/env python3
"""
Merge Labels Tool
Merges labels from multiple annotators using consensus or majority voting
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
from collections import Counter
import argparse

class LabelMerger:
    """Merge labels from multiple annotators"""
    
    def __init__(self, label_files: List[str], strategy: str = 'majority'):
        self.label_files = [Path(f) for f in label_files]
        self.strategy = strategy  # 'majority' or 'consensus'
        self.label_data = [self._load_labels(f) for f in self.label_files]
    
    def _load_labels(self, file_path: Path) -> Dict:
        """Load labels from file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        labels = {}
        for label in data.get('labels', []):
            item_id = label.get('item_id')
            if item_id:
                labels[item_id] = label
        
        return labels
    
    def merge(self) -> List[Dict]:
        """Merge labels using specified strategy"""
        # Get all item IDs
        all_item_ids = set()
        for labels in self.label_data:
            all_item_ids.update(labels.keys())
        
        merged_labels = []
        
        for item_id in all_item_ids:
            # Get labels from all annotators
            item_labels = [
                labels.get(item_id) for labels in self.label_data
                if item_id in labels
            ]
            
            if not item_labels:
                continue
            
            # Merge using strategy
            if self.strategy == 'majority':
                merged = self._merge_majority(item_id, item_labels)
            elif self.strategy == 'consensus':
                merged = self._merge_consensus(item_id, item_labels)
            else:
                raise ValueError(f"Unknown strategy: {self.strategy}")
            
            if merged:
                merged_labels.append(merged)
        
        return merged_labels
    
    def _merge_majority(self, item_id: str, labels: List[Dict]) -> Dict:
        """Merge using majority voting"""
        intents = [l.get('intent') for l in labels if l.get('intent')]
        sentiments = [l.get('sentiment') for l in labels if l.get('sentiment')]
        risk_levels = [l.get('risk_level') for l in labels if l.get('risk_level')]
        
        merged = {
            'item_id': item_id,
            'intent': Counter(intents).most_common(1)[0][0] if intents else None,
            'sentiment': Counter(sentiments).most_common(1)[0][0] if sentiments else None,
            'risk_level': Counter(risk_levels).most_common(1)[0][0] if risk_levels else None,
            'annotator_count': len(labels),
            'merged_at': __import__('datetime').datetime.now().isoformat()
        }
        
        # Add notes if any
        notes = [l.get('notes') for l in labels if l.get('notes')]
        if notes:
            merged['notes'] = ' | '.join(notes)
        
        return merged
    
    def _merge_consensus(self, item_id: str, labels: List[Dict]) -> Optional[Dict]:
        """Merge using consensus (all must agree)"""
        if len(labels) < 2:
            return self._merge_majority(item_id, labels)
        
        # Check if all agree
        intents = [l.get('intent') for l in labels if l.get('intent')]
        sentiments = [l.get('sentiment') for l in labels if l.get('sentiment')]
        risk_levels = [l.get('risk_level') for l in labels if l.get('risk_level')]
        
        intent_consensus = len(set(intents)) == 1 if intents else False
        sentiment_consensus = len(set(sentiments)) == 1 if sentiments else False
        risk_consensus = len(set(risk_levels)) == 1 if risk_levels else False
        
        if not (intent_consensus and sentiment_consensus and risk_consensus):
            # No consensus, skip or use majority
            return None
        
        return {
            'item_id': item_id,
            'intent': intents[0] if intents else None,
            'sentiment': sentiments[0] if sentiments else None,
            'risk_level': risk_levels[0] if risk_levels else None,
            'annotator_count': len(labels),
            'consensus': True,
            'merged_at': __import__('datetime').datetime.now().isoformat()
        }
    
    def save(self, output_file: str, merged_labels: List[Dict]):
        """Save merged labels"""
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        output_data = {
            'version': '1.0',
            'strategy': self.strategy,
            'source_files': [str(f) for f in self.label_files],
            'total_labels': len(merged_labels),
            'created_at': __import__('datetime').datetime.now().isoformat(),
            'labels': merged_labels
        }
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Merged labels saved to: {output_file}")
        print(f"   Strategy: {self.strategy}")
        print(f"   Total labels: {len(merged_labels)}")

def main():
    parser = argparse.ArgumentParser(description='Merge labels from multiple annotators')
    parser.add_argument('--files', '-f', nargs='+', required=True,
                       help='Label files to merge')
    parser.add_argument('--output', '-o', required=True,
                       help='Output file for merged labels')
    parser.add_argument('--strategy', '-s', default='majority',
                       choices=['majority', 'consensus'],
                       help='Merging strategy')
    
    args = parser.parse_args()
    
    merger = LabelMerger(args.files, args.strategy)
    merged = merger.merge()
    merger.save(args.output, merged)

if __name__ == '__main__':
    main()

