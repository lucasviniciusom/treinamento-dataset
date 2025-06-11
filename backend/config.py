# Arquivo de configuração para ambiente de produção
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

# Configurações específicas para produção
DEBUG = False
PORT = int(os.environ.get("PORT", 8000))
ALLOWED_ORIGINS = os.environ.get("ALLOWED_ORIGINS", "*").split(",")

# Configuração para armazenamento de modelos
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")
os.makedirs(MODELS_DIR, exist_ok=True)
