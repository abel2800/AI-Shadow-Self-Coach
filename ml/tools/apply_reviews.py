#!/usr/bin/env python3
"""
Apply Reviews Tool
Applies clinician reviews to filter and update training data
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
import argparse

class ReviewApplier:
    """Apply clinician reviews to training data"""
    
    def __init__(self, data_file: str, reviews_file: str):
        self.data_file = Path(data_file)
        self.reviews_file = Path(reviews_file)
        self.data = self._load_data()
        self.reviews = self._load_reviews()
    
    def _load_data(self) -> Dict:
        """Load training data"""
        with open(self.data_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def _load_reviews(self) -> Dict:
        """Load reviews"""
        with open(self.reviews_file, 'r', encoding='utf-8') as f:
            return json.load(f)
    
    def apply_reviews(self, include_revision: bool = False) -> Dict:
        """Apply reviews to filter data"""
        dialogues = self.data.get('dialogues', [])
        reviews_dict = {r['dialogue_id']: r for r in self.reviews.get('reviews', [])}
        
        approved_dialogues = []
        rejected_dialogues = []
        needs_revision_dialogues = []
        unreviewed_dialogues = []
        
        for dialogue in dialogues:
            dialogue_id = dialogue.get('dialogue_id')
            review = reviews_dict.get(dialogue_id)
            
            if not review:
                unreviewed_dialogues.append(dialogue)
                continue
            
            status = review['status']
            
            if status == 'approved':
                # Mark as reviewed and approved
                dialogue['labels']['clinician_reviewed'] = True
                dialogue['labels']['clinician_approved'] = True
                dialogue['labels']['review_status'] = 'approved'
                if 'reviewed_at' in review:
                    dialogue['labels']['reviewed_at'] = review['reviewed_at']
                approved_dialogues.append(dialogue)
            elif status == 'needs_revision':
                if include_revision:
                    dialogue['labels']['clinician_reviewed'] = True
                    dialogue['labels']['clinician_approved'] = False
                    dialogue['labels']['review_status'] = 'needs_revision'
                    needs_revision_dialogues.append(dialogue)
                else:
                    rejected_dialogues.append(dialogue)
            elif status == 'rejected':
                rejected_dialogues.append(dialogue)
        
        return {
            'approved': approved_dialogues,
            'needs_revision': needs_revision_dialogues,
            'rejected': rejected_dialogues,
            'unreviewed': unreviewed_dialogues
        }
    
    def save_filtered(self, filtered_data: Dict, output_file: str, include_revision: bool = False):
        """Save filtered data"""
        approved = filtered_data['approved']
        if include_revision:
            approved.extend(filtered_data['needs_revision'])
        
        output_data = {
            'version': '1.0',
            'description': 'Clinician-reviewed training dialogues',
            'source_file': str(self.data_file),
            'reviews_file': str(self.reviews_file),
            'total_dialogues': len(approved),
            'approved': len(filtered_data['approved']),
            'needs_revision': len(filtered_data['needs_revision']),
            'rejected': len(filtered_data['rejected']),
            'unreviewed': len(filtered_data['unreviewed']),
            'dialogues': approved
        }
        
        output_path = Path(output_file)
        output_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(output_data, f, indent=2, ensure_ascii=False)
        
        print(f"\n✅ Filtered data saved to: {output_file}")
        print(f"   Approved: {len(filtered_data['approved'])}")
        if include_revision:
            print(f"   Needs Revision (included): {len(filtered_data['needs_revision'])}")
        print(f"   Rejected: {len(filtered_data['rejected'])}")
        print(f"   Unreviewed: {len(filtered_data['unreviewed'])}")

def main():
    parser = argparse.ArgumentParser(description='Apply clinician reviews to training data')
    parser.add_argument('--data', '-d', required=True, help='Training data file')
    parser.add_argument('--reviews', '-r', required=True, help='Reviews file')
    parser.add_argument('--output', '-o', required=True, help='Output file')
    parser.add_argument('--include-revision', action='store_true', 
                       help='Include dialogues that need revision')
    
    args = parser.parse_args()
    
    applier = ReviewApplier(args.data, args.reviews)
    filtered = applier.apply_reviews(include_revision=args.include_revision)
    applier.save_filtered(filtered, args.output, include_revision=args.include_revision)

if __name__ == '__main__':
    main()

