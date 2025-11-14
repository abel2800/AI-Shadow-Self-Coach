#!/usr/bin/env python3
"""
Inter-Annotator Agreement Calculator
Calculates agreement between multiple labelers
"""

import json
import sys
from pathlib import Path
from typing import Dict, List
from collections import defaultdict
import argparse
from sklearn.metrics import cohen_kappa_score
import numpy as np

class InterAnnotatorAgreement:
    """Calculate inter-annotator agreement"""
    
    def __init__(self, label_files: List[str]):
        self.label_files = [Path(f) for f in label_files]
        self.label_data = [self._load_labels(f) for f in self.label_files]
        self.agreement_scores = {}
    
    def _load_labels(self, file_path: Path) -> Dict:
        """Load labels from file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Convert to dict by item_id
        labels = {}
        for label in data.get('labels', []):
            item_id = label.get('item_id')
            if item_id:
                labels[item_id] = label
        
        return labels
    
    def calculate_agreement(self):
        """Calculate agreement metrics"""
        if len(self.label_data) < 2:
            print("Error: Need at least 2 label files for agreement calculation")
            sys.exit(1)
        
        # Get common items
        all_item_ids = set()
        for labels in self.label_data:
            all_item_ids.update(labels.keys())
        
        common_items = []
        for item_id in all_item_ids:
            if all(item_id in labels for labels in self.label_data):
                common_items.append(item_id)
        
        if not common_items:
            print("Error: No common items found across label files")
            sys.exit(1)
        
        print(f"\nFound {len(common_items)} common items")
        
        # Calculate agreement for each label type
        for label_type in ['intent', 'sentiment', 'risk_level']:
            self._calculate_label_agreement(common_items, label_type)
    
    def _calculate_label_agreement(self, item_ids: List[str], label_type: str):
        """Calculate agreement for a specific label type"""
        # Extract labels for each annotator
        annotator_labels = []
        for labels in self.label_data:
            annotator_labels.append([
                labels.get(item_id, {}).get(label_type, 'unknown')
                for item_id in item_ids
            ])
        
        # Calculate pairwise agreement
        agreements = []
        for i in range(len(annotator_labels)):
            for j in range(i + 1, len(annotator_labels)):
                labels1 = annotator_labels[i]
                labels2 = annotator_labels[j]
                
                # Exact agreement
                exact_agreement = sum(
                    1 for l1, l2 in zip(labels1, labels2) if l1 == l2
                ) / len(labels1)
                
                # Cohen's Kappa
                try:
                    kappa = cohen_kappa_score(labels1, labels2)
                except:
                    kappa = None
                
                agreements.append({
                    'annotator1': i + 1,
                    'annotator2': j + 1,
                    'exact_agreement': exact_agreement,
                    'kappa': kappa
                })
        
        # Calculate average
        avg_exact = np.mean([a['exact_agreement'] for a in agreements])
        avg_kappa = np.mean([a['kappa'] for a in agreements if a['kappa'] is not None])
        
        self.agreement_scores[label_type] = {
            'pairwise': agreements,
            'average_exact_agreement': avg_exact,
            'average_kappa': avg_kappa
        }
    
    def print_report(self):
        """Print agreement report"""
        print("\n" + "="*80)
        print("INTER-ANNOTATOR AGREEMENT REPORT")
        print("="*80)
        
        for label_type, scores in self.agreement_scores.items():
            print(f"\n{label_type.upper()} Agreement:")
            print(f"  Average Exact Agreement: {scores['average_exact_agreement']:.3f}")
            if scores['average_kappa'] is not None:
                print(f"  Average Cohen's Kappa: {scores['average_kappa']:.3f}")
            
            print(f"\n  Pairwise Agreements:")
            for pair in scores['pairwise']:
                print(f"    Annotator {pair['annotator1']} vs {pair['annotator2']}: "
                      f"{pair['exact_agreement']:.3f} "
                      f"(κ={pair['kappa']:.3f if pair['kappa'] else 'N/A'})")
        
        print("\n" + "="*80)
        
        # Interpretation
        print("\nInterpretation:")
        print("  Kappa < 0.00: Poor agreement")
        print("  0.00 ≤ Kappa < 0.20: Slight agreement")
        print("  0.20 ≤ Kappa < 0.40: Fair agreement")
        print("  0.40 ≤ Kappa < 0.60: Moderate agreement")
        print("  0.60 ≤ Kappa < 0.80: Substantial agreement")
        print("  0.80 ≤ Kappa ≤ 1.00: Almost perfect agreement")

def main():
    parser = argparse.ArgumentParser(description='Calculate inter-annotator agreement')
    parser.add_argument('--files', '-f', nargs='+', required=True,
                       help='Label files to compare')
    
    args = parser.parse_args()
    
    calculator = InterAnnotatorAgreement(args.files)
    calculator.calculate_agreement()
    calculator.print_report()

if __name__ == '__main__':
    main()

