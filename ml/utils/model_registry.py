"""
Model Registry
Manages model versions and metadata
"""

import json
import os
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Optional

class ModelRegistry:
    """Manages model versions and deployment"""
    
    def __init__(self, registry_path='models/registry.json'):
        self.registry_path = Path(registry_path)
        self.registry_path.parent.mkdir(parents=True, exist_ok=True)
        self.registry = self._load_registry()
    
    def _load_registry(self) -> Dict:
        """Load model registry from file"""
        if self.registry_path.exists():
            with open(self.registry_path, 'r') as f:
                return json.load(f)
        return {
            'models': {},
            'deployments': {},
            'last_updated': datetime.now().isoformat()
        }
    
    def _save_registry(self):
        """Save registry to file"""
        self.registry['last_updated'] = datetime.now().isoformat()
        with open(self.registry_path, 'w') as f:
            json.dump(self.registry, f, indent=2)
    
    def register_model(self, model_type: str, version: str, metadata: Dict):
        """Register a new model version"""
        if model_type not in self.registry['models']:
            self.registry['models'][model_type] = {}
        
        self.registry['models'][model_type][version] = {
            'version': version,
            'registered_at': datetime.now().isoformat(),
            'status': 'registered',
            **metadata
        }
        
        self._save_registry()
    
    def deploy_model(self, model_type: str, version: str, environment: str = 'production'):
        """Mark model as deployed in an environment"""
        if model_type not in self.registry['deployments']:
            self.registry['deployments'][model_type] = {}
        
        self.registry['deployments'][model_type][environment] = {
            'version': version,
            'deployed_at': datetime.now().isoformat(),
            'status': 'active'
        }
        
        # Update model status
        if model_type in self.registry['models'] and version in self.registry['models'][model_type]:
            self.registry['models'][model_type][version]['status'] = f'deployed_{environment}'
        
        self._save_registry()
    
    def get_latest_version(self, model_type: str) -> Optional[str]:
        """Get latest version of a model type"""
        if model_type not in self.registry['models']:
            return None
        
        versions = list(self.registry['models'][model_type].keys())
        if not versions:
            return None
        
        # Sort by registration date
        versions.sort(key=lambda v: self.registry['models'][model_type][v]['registered_at'], reverse=True)
        return versions[0]
    
    def get_deployed_version(self, model_type: str, environment: str = 'production') -> Optional[str]:
        """Get currently deployed version in an environment"""
        if model_type not in self.registry['deployments']:
            return None
        
        if environment not in self.registry['deployments'][model_type]:
            return None
        
        return self.registry['deployments'][model_type][environment]['version']
    
    def list_versions(self, model_type: str) -> List[Dict]:
        """List all versions of a model type"""
        if model_type not in self.registry['models']:
            return []
        
        return list(self.registry['models'][model_type].values())
    
    def get_model_info(self, model_type: str, version: str) -> Optional[Dict]:
        """Get information about a specific model version"""
        if model_type not in self.registry['models']:
            return None
        
        if version not in self.registry['models'][model_type]:
            return None
        
        return self.registry['models'][model_type][version]

