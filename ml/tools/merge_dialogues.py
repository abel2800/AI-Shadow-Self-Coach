#!/usr/bin/env python3
"""
Merge Dialogues Tool
Merges multiple dialogue files into one
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
from datetime import datetime
import argparse
from collections import Counter

class DialogueMerger:
    """Merge multiple dialogue files"""
    
    def __init__(self, input_files: List[str]):
        self.input_files = [Path(f) for f in input_files]
        self.all_dialogues = []
        self.seen_ids = set()
    
    def load_all(self) -> List[Dict]:
        """Load dialogues from all files"""
        for file_path in self.input_files:
            if not file_path.exists():
                print(f"Warning: File not found: {file_path}")
                continue
            
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            dialogues = data.get('dialogues', [])
            print(f"Loaded {len(dialogues)} dialogues from {file_path.name}")
            
            for dialogue in dialogues:
                dialogue_id = dialogue.get('dialogue_id')
                if dialogue_id and dialogue_id in self.seen_ids:
                    print(f"Warning: Duplicate dialogue_id: {dialogue_id}")
                    continue
                
                if dialogue_id:
                    self.seen_ids.add(dialogue_id)
                
                self.all_dialogues.append(dialogue)
        
        return self.all_dialogues
    
    def deduplicate(self, dialogues: List[Dict]) -> List[Dict]:
        """Remove duplicate dialogues based on content"""
        seen_content = set()
        unique = []
        
        for dialogue in dialogues:
            # Create content hash (first user message + first assistant message)
            messages = dialogue.get('messages', [])
            if len(messages) < 2:
                continue
            
            user_msg = messages[0].get('text', '').lower().strip()
            assistant_msg = messages[1].get('text', '').lower().strip() if len(messages) > 1 else ''
            content_hash = f"{user_msg}|{assistant_msg}"
            
            if content_hash not in seen_content:
                seen_content.add(content_hash)
                unique.append(dialogue)
            else:
                print(f"Removed duplicate: {dialogue.get('dialogue_id', 'unknown')}")
        
        return unique
    
    def save(self, dialogues: List[Dict], output_file: str):
        """Save merged dialogues"""
        # Calculate statistics
        stats = {
            'total_dialogues': len(dialogues),
            'session_types': dict(Counter(d.get('session_type') for d in dialogues)),
            'concerns': dict(Counter(d.get('user_profile', {}).get('concern') for d in dialogues))
        }
        
        output_data = {
            'version': '1.0',
            'description': f'Merged seed dialogues ({len(dialogues)} examples)',
            'merged_at': datetime.now().isoformat(),
            'source_files': [str(f) for f in self.input_files],
            'dialogues': dialogues,
            'statistics': stats
        }
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Merged dialogues saved to: {output_file}")
        print(f"   Total dialogues: {len(dialogues)}")
        print(f"   Session types: {stats['session_types']}")

def main():
    parser = argparse.ArgumentParser(description='Merge dialogue files')
    parser.add_argument('--files', '-f', nargs='+', required=True, help='Input files to merge')
    parser.add_argument('--output', '-o', required=True, help='Output file')
    parser.add_argument('--deduplicate', action='store_true', help='Remove duplicates')
    
    args = parser.parse_args()
    
    merger = DialogueMerger(args.files)
    dialogues = merger.load_all()
    
    if args.deduplicate:
        print(f"\nDeduplicating {len(dialogues)} dialogues...")
        dialogues = merger.deduplicate(dialogues)
        print(f"After deduplication: {len(dialogues)} dialogues")
    
    merger.save(dialogues, args.output)

if __name__ == '__main__':
    main()

