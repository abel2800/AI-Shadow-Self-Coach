#!/usr/bin/env python3
"""
Data Labeling Tool
Interactive tool for labeling training data
"""

import json
import os
import sys
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
import argparse

# Label schemas
INTENT_LABELS = [
    'validate',
    'probe_story',
    'probe_root',
    'reframe',
    'suggest_experiment',
    'offer_mindfulness',
    'safety_check',
    'emergency',
    'close',
    'other'
]

SENTIMENT_LABELS = [
    'very_negative',
    'negative',
    'neutral',
    'positive'
]

RISK_LEVEL_LABELS = [
    'none',
    'low',
    'medium',
    'high'
]

class LabelingTool:
    """Interactive labeling tool for training data"""
    
    def __init__(self, data_file: str, output_file: str):
        self.data_file = Path(data_file)
        self.output_file = Path(output_file)
        self.data = self._load_data()
        self.current_index = 0
        self.labels = []
        
    def _load_data(self) -> List[Dict]:
        """Load data to label"""
        if not self.data_file.exists():
            print(f"Error: Data file not found: {self.data_file}")
            sys.exit(1)
        
        with open(self.data_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Extract dialogues or messages
        if 'dialogues' in data:
            return data['dialogues']
        elif 'messages' in data:
            return data['messages']
        else:
            return data if isinstance(data, list) else [data]
    
    def _save_labels(self):
        """Save labels to output file"""
        output_data = {
            'version': '1.0',
            'created_at': datetime.now().isoformat(),
            'source_file': str(self.data_file),
            'total_items': len(self.data),
            'labeled_items': len(self.labels),
            'labels': self.labels
        }
        
        # Create output directory if needed
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Labels saved to: {self.output_file}")
    
    def _display_item(self, item: Dict):
        """Display item for labeling"""
        print("\n" + "="*80)
        print(f"Item {self.current_index + 1} of {len(self.data)}")
        print("="*80)
        
        if 'messages' in item:
            # Dialogue format
            print(f"\nSession Type: {item.get('session_type', 'N/A')}")
            print(f"Dialogue ID: {item.get('dialogue_id', 'N/A')}")
            print("\n--- Messages ---")
            for i, msg in enumerate(item['messages']):
                role = msg.get('role', 'unknown')
                text = msg.get('text', '')
                print(f"\n[{role.upper()}] {text}")
        elif 'text' in item:
            # Single message format
            print(f"\nText: {item['text']}")
            if 'role' in item:
                print(f"Role: {item['role']}")
        else:
            print(f"\nItem: {json.dumps(item, indent=2)}")
    
    def _get_label(self, label_type: str, options: List[str], current: Optional[str] = None) -> str:
        """Get label from user"""
        print(f"\n{label_type.upper()}:")
        for i, option in enumerate(options, 1):
            marker = "←" if option == current else " "
            print(f"  {i}. {marker} {option}")
        
        while True:
            try:
                choice = input(f"\nSelect {label_type} (1-{len(options)}): ").strip()
                if choice == '' and current:
                    return current
                
                index = int(choice) - 1
                if 0 <= index < len(options):
                    return options[index]
                else:
                    print(f"Please enter a number between 1 and {len(options)}")
            except ValueError:
                print("Please enter a valid number")
            except KeyboardInterrupt:
                print("\n\nLabeling cancelled.")
                sys.exit(0)
    
    def label_item(self, item: Dict) -> Dict:
        """Label a single item"""
        self._display_item(item)
        
        # Get labels
        intent = self._get_label(
            'Intent',
            INTENT_LABELS,
            item.get('intent') if 'intent' in item else None
        )
        
        sentiment = self._get_label(
            'Sentiment',
            SENTIMENT_LABELS,
            item.get('sentiment') if 'sentiment' in item else None
        )
        
        risk_level = self._get_label(
            'Risk Level',
            RISK_LEVEL_LABELS,
            item.get('risk_level') if 'risk_level' in item else None
        )
        
        # Optional notes
        notes = input("\nNotes (optional, press Enter to skip): ").strip()
        
        # Create label entry
        label_entry = {
            'item_id': item.get('dialogue_id') or item.get('message_id') or f"item_{self.current_index}",
            'intent': intent,
            'sentiment': sentiment,
            'risk_level': risk_level,
            'labeled_at': datetime.now().isoformat(),
        }
        
        if notes:
            label_entry['notes'] = notes
        
        return label_entry
    
    def run(self):
        """Run labeling tool"""
        print(f"\n📝 Data Labeling Tool")
        print(f"Source: {self.data_file}")
        print(f"Output: {self.output_file}")
        print(f"Total items: {len(self.data)}")
        print("\nCommands:")
        print("  - Press Enter to label current item")
        print("  - Type 'skip' to skip current item")
        print("  - Type 'save' to save and exit")
        print("  - Type 'quit' to exit without saving")
        print("  - Type 'prev' to go to previous item")
        print("  - Type 'next' to go to next item")
        
        while self.current_index < len(self.data):
            item = self.data[self.current_index]
            
            command = input(f"\n[Item {self.current_index + 1}/{len(self.data)}] Command (Enter to label): ").strip().lower()
            
            if command == 'quit':
                if input("Exit without saving? (y/n): ").lower() == 'y':
                    sys.exit(0)
            elif command == 'save':
                self._save_labels()
                print("Exiting...")
                break
            elif command == 'skip':
                self.current_index += 1
                continue
            elif command == 'prev':
                if self.current_index > 0:
                    self.current_index -= 1
                else:
                    print("Already at first item")
                continue
            elif command == 'next':
                self.current_index += 1
                continue
            elif command == '' or command == 'label':
                # Label current item
                label = self.label_item(item)
                self.labels.append(label)
                
                # Move to next
                self.current_index += 1
                
                # Auto-save every 10 items
                if len(self.labels) % 10 == 0:
                    self._save_labels()
                    print(f"\n💾 Auto-saved ({len(self.labels)} items labeled)")
            else:
                print(f"Unknown command: {command}")
        
        # Save final labels
        if self.labels:
            self._save_labels()
            print(f"\n✅ Labeling complete! {len(self.labels)} items labeled.")

def main():
    parser = argparse.ArgumentParser(description='Data Labeling Tool')
    parser.add_argument('--input', '-i', required=True, help='Input data file (JSON)')
    parser.add_argument('--output', '-o', required=True, help='Output labels file (JSON)')
    
    args = parser.parse_args()
    
    tool = LabelingTool(args.input, args.output)
    tool.run()

if __name__ == '__main__':
    main()

