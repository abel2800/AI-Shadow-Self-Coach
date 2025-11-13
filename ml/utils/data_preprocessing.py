"""
Data Preprocessing Utilities
Process seed dialogues for training
"""

import json
import pandas as pd
from typing import List, Dict

def load_seed_dialogues(file_path: str = '../SEED_DIALOGUES.json') -> List[Dict]:
    """Load seed dialogues from JSON file"""
    with open(file_path, 'r') as f:
        data = json.load(f)
    return data.get('dialogues', [])

def extract_conversations(dialogues: List[Dict]) -> List[Dict]:
    """Extract user-assistant conversation pairs"""
    conversations = []
    
    for dialogue in dialogues:
        messages = dialogue.get('messages', [])
        user_messages = [m for m in messages if m.get('role') == 'user']
        assistant_messages = [m for m in messages if m.get('role') == 'assistant']
        
        # Pair user messages with next assistant response
        for i, user_msg in enumerate(user_messages):
            if i < len(assistant_messages):
                conversations.append({
                    'user': user_msg['text'],
                    'assistant': assistant_messages[i]['text'],
                    'intent': assistant_messages[i].get('intent', 'other'),
                    'sentiment': user_msg.get('sentiment', 'neutral'),
                    'risk_level': user_msg.get('risk_level', 'none'),
                })
    
    return conversations

def prepare_training_pairs(conversations: List[Dict]) -> pd.DataFrame:
    """Prepare training pairs for fine-tuning"""
    df = pd.DataFrame(conversations)
    return df

def augment_data(df: pd.DataFrame, num_augmentations: int = 3) -> pd.DataFrame:
    """Augment data with paraphrasing (placeholder - would use LLM in production)"""
    # In production, use LLM to generate paraphrases
    # For now, return original data
    return df

def split_train_test(df: pd.DataFrame, test_size: float = 0.2):
    """Split data into train and test sets"""
    from sklearn.model_selection import train_test_split
    return train_test_split(df, test_size=test_size, random_state=42)

if __name__ == "__main__":
    # Example usage
    dialogues = load_seed_dialogues()
    conversations = extract_conversations(dialogues)
    df = prepare_training_pairs(conversations)
    print(f"Loaded {len(df)} conversation pairs")
    print(df.head())

