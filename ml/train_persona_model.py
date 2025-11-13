"""
Persona Model Fine-tuning Script
Fine-tunes LLM with Ari persona using seed dialogues
"""

import os
import json
import openai
from dotenv import load_dotenv

load_dotenv()

# Configuration
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
SEED_DIALOGUES_PATH = '../SEED_DIALOGUES.json'
OUTPUT_FILE = 'training_data.jsonl'

SYSTEM_PROMPT = """You are "Ari", a compassionate, non-judgmental inner-work coach. Your job is to help users gently explore recurring negative beliefs and emotional patterns.

Core Principles:
1. Always begin with validation before probing deeper
2. Ask for consent before deeper exploration ("Are you ready to look at this together?")
3. Keep responses brief (2-4 sentences) unless user asks for longer reflection
4. Use reflective questions rather than direct advice
5. Offer one practical experiment at the end of a deep session
6. Avoid medical or legal advice

Safety Protocol:
- If user mentions self-harm or suicide, immediately:
  1. Acknowledge with compassion
  2. Ask about immediate safety
  3. Provide crisis resources
  4. Follow emergency escalation flow

Tone Guidelines:
- Compassionate and gentle
- Slightly poetic but grounded
- No clinical jargon (unless user asks)
- Short, reflective sentences
- Validate feelings first"""

def prepare_training_data():
    """Prepare training data in OpenAI format"""
    print("🔄 Loading seed dialogues...")
    
    with open(SEED_DIALOGUES_PATH, 'r') as f:
        seed_data = json.load(f)
    
    training_examples = []
    
    for dialogue in seed_data.get('dialogues', []):
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        
        for msg in dialogue.get('messages', []):
            if msg.get('role') == 'user':
                messages.append({
                    "role": "user",
                    "content": msg['text']
                })
            elif msg.get('role') == 'assistant':
                messages.append({
                    "role": "assistant",
                    "content": msg['text']
                })
        
        if len(messages) > 1:  # Has at least one user message
            training_examples.append({"messages": messages})
    
    print(f"✅ Prepared {len(training_examples)} training examples")
    return training_examples

def save_training_file(examples):
    """Save training data as JSONL for OpenAI"""
    print(f"💾 Saving training data to {OUTPUT_FILE}...")
    
    with open(OUTPUT_FILE, 'w') as f:
        for example in examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"✅ Saved {len(examples)} examples")

def upload_to_openai():
    """Upload training file to OpenAI"""
    print("🔄 Uploading to OpenAI...")
    
    openai.api_key = OPENAI_API_KEY
    
    with open(OUTPUT_FILE, 'rb') as f:
        file_response = openai.File.create(
            file=f,
            purpose='fine-tune'
        )
    
    print(f"✅ File uploaded: {file_response.id}")
    return file_response.id

def create_fine_tune_job(file_id):
    """Create fine-tuning job"""
    print("🚀 Creating fine-tuning job...")
    
    response = openai.FineTuningJob.create(
        training_file=file_id,
        model="gpt-3.5-turbo",
        hyperparameters={
            "n_epochs": 3,
            "learning_rate_multiplier": 0.1,
        }
    )
    
    print(f"✅ Fine-tuning job created: {response.id}")
    print(f"Status: {response.status}")
    return response.id

def main():
    """Main training pipeline"""
    print("=" * 50)
    print("Persona Model Fine-tuning")
    print("=" * 50)
    
    # Prepare data
    examples = prepare_training_data()
    save_training_file(examples)
    
    # Upload and fine-tune (if OpenAI API key is set)
    if OPENAI_API_KEY:
        file_id = upload_to_openai()
        job_id = create_fine_tune_job(file_id)
        print(f"\n📊 Monitor job: https://platform.openai.com/finetune/{job_id}")
    else:
        print("\n⚠️  OpenAI API key not set. Training file prepared but not uploaded.")
        print("   Set OPENAI_API_KEY in .env to enable fine-tuning")

if __name__ == "__main__":
    main()

