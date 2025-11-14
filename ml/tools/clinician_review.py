#!/usr/bin/env python3
"""
Clinician Review Tool
Tool for clinicians to review and approve synthetic training data
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
from datetime import datetime
import argparse

class ClinicianReviewTool:
    """Tool for clinician review of synthetic data"""
    
    def __init__(self, data_file: str, output_file: str):
        self.data_file = Path(data_file)
        self.output_file = Path(output_file)
        self.data = self._load_data()
        self.reviews = []
        self.current_index = 0
    
    def _load_data(self) -> Dict:
        """Load data to review"""
        if not self.data_file.exists():
            print(f"Error: Data file not found: {self.data_file}")
            sys.exit(1)
        
        with open(self.data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _display_dialogue(self, dialogue: Dict):
        """Display dialogue for review"""
        print("\n" + "="*80)
        print(f"Dialogue {self.current_index + 1} of {len(self.data.get('dialogues', []))}")
        print("="*80)
        
        print(f"\nDialogue ID: {dialogue.get('dialogue_id', 'N/A')}")
        print(f"Session Type: {dialogue.get('session_type', 'N/A')}")
        print(f"Concern: {dialogue.get('user_profile', {}).get('concern', 'N/A')}")
        print(f"Mood Score: {dialogue.get('user_profile', {}).get('mood_score', 'N/A')}")
        
        if dialogue.get('labels', {}).get('synthetic'):
            print("⚠️  SYNTHETIC - Requires Review")
        
        print("\n--- Messages ---")
        for i, msg in enumerate(dialogue.get('messages', [])):
            role = msg.get('role', 'unknown')
            text = msg.get('text', '')
            intent = msg.get('intent', '')
            print(f"\n[{role.upper()}] {text}")
            if intent:
                print(f"    Intent: {intent}, Risk: {msg.get('risk_level', 'N/A')}")
        
        print("\n--- Labels ---")
        labels = dialogue.get('labels', {})
        print(f"Primary Intent: {labels.get('primary_intent', 'N/A')}")
        print(f"Sentiment: {labels.get('overall_sentiment', 'N/A')}")
        print(f"Risk Level: {labels.get('max_risk_level', 'N/A')}")
        print(f"Therapeutic Technique: {labels.get('therapeutic_technique', 'N/A')}")
    
    def review_dialogue(self, dialogue: Dict) -> Dict:
        """Review a single dialogue"""
        self._display_dialogue(dialogue)
        
        print("\n" + "="*80)
        print("Review Options:")
        print("  1. Approve - Ready for training")
        print("  2. Needs Revision - Requires changes")
        print("  3. Reject - Not suitable for training")
        print("  4. Skip - Review later")
        print("  5. Add Notes")
        print("="*80)
        
        while True:
            try:
                choice = input("\nSelect option (1-5): ").strip()
                
                if choice == '1':
                    status = 'approved'
                    break
                elif choice == '2':
                    status = 'needs_revision'
                    break
                elif choice == '3':
                    status = 'rejected'
                    break
                elif choice == '4':
                    return None  # Skip
                elif choice == '5':
                    notes = input("Enter notes: ").strip()
                    if notes:
                        dialogue.setdefault('review_notes', []).append({
                            'note': notes,
                            'timestamp': datetime.now().isoformat()
                        })
                    continue
                else:
                    print("Please enter 1-5")
            except KeyboardInterrupt:
                print("\n\nReview cancelled.")
                sys.exit(0)
        
        # Get additional feedback
        feedback = input("\nAdditional feedback (optional, press Enter to skip): ").strip()
        
        review = {
            'dialogue_id': dialogue.get('dialogue_id'),
            'status': status,
            'reviewed_at': datetime.now().isoformat(),
            'reviewer': input("Reviewer name (optional): ").strip() or 'clinician',
        }
        
        if feedback:
            review['feedback'] = feedback
        
        if dialogue.get('review_notes'):
            review['notes'] = dialogue['review_notes']
        
        return review
    
    def run(self):
        """Run review tool"""
        dialogues = self.data.get('dialogues', [])
        
        print(f"\n👨‍⚕️  Clinician Review Tool")
        print(f"File: {self.data_file}")
        print(f"Total dialogues: {len(dialogues)}")
        print("\nCommands:")
        print("  - Press Enter to review current dialogue")
        print("  - Type 'skip' to skip")
        print("  - Type 'save' to save and exit")
        print("  - Type 'quit' to exit without saving")
        print("  - Type 'prev' to go to previous")
        print("  - Type 'next' to go to next")
        
        while self.current_index < len(dialogues):
            dialogue = dialogues[self.current_index]
            
            command = input(f"\n[Dialogue {self.current_index + 1}/{len(dialogues)}] Command (Enter to review): ").strip().lower()
            
            if command == 'quit':
                if input("Exit without saving? (y/n): ").lower() == 'y':
                    sys.exit(0)
            elif command == 'save':
                self._save_reviews()
                print("Exiting...")
                break
            elif command == 'skip':
                self.current_index += 1
                continue
            elif command == 'prev':
                if self.current_index > 0:
                    self.current_index -= 1
                continue
            elif command == 'next':
                self.current_index += 1
                continue
            elif command == '' or command == 'review':
                review = self.review_dialogue(dialogue)
                if review:
                    self.reviews.append(review)
                
                self.current_index += 1
                
                # Auto-save every 10 reviews
                if len(self.reviews) % 10 == 0:
                    self._save_reviews()
                    print(f"\n💾 Auto-saved ({len(self.reviews)} reviews)")
            else:
                print(f"Unknown command: {command}")
        
        # Save final reviews
        if self.reviews:
            self._save_reviews()
            self._generate_summary()
    
    def _save_reviews(self):
        """Save reviews to file"""
        output_data = {
            'version': '1.0',
            'source_file': str(self.data_file),
            'reviewed_at': datetime.now().isoformat(),
            'total_reviews': len(self.reviews),
            'reviews': self.reviews
        }
        
        self.output_file.parent.mkdir(parents=True, exist_ok=True)
        
        with open(self.output_file, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Reviews saved to: {self.output_file}")
    
    def _generate_summary(self):
        """Generate review summary"""
        approved = sum(1 for r in self.reviews if r['status'] == 'approved')
        needs_revision = sum(1 for r in self.reviews if r['status'] == 'needs_revision')
        rejected = sum(1 for r in self.reviews if r['status'] == 'rejected')
        
        print("\n" + "="*80)
        print("REVIEW SUMMARY")
        print("="*80)
        print(f"Total Reviewed: {len(self.reviews)}")
        print(f"✅ Approved: {approved}")
        print(f"⚠️  Needs Revision: {needs_revision}")
        print(f"❌ Rejected: {rejected}")
        print("="*80)

def main():
    parser = argparse.ArgumentParser(description='Clinician Review Tool')
    parser.add_argument('--input', '-i', required=True, help='Input data file (JSON)')
    parser.add_argument('--output', '-o', required=True, help='Output reviews file (JSON)')
    
    args = parser.parse_args()
    
    tool = ClinicianReviewTool(args.input, args.output)
    tool.run()

if __name__ == '__main__':
    main()

