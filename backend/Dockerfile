# Dockerfile para o backend (FastAPI)
FROM python:3.10-slim

# Diretório de trabalho dentro do container
WORKDIR /app

# Instalar dependências do sistema necessárias
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivo de dependências e instalar via pip
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar o restante do código do backend
COPY . .

# Expor a porta utilizada pelo Uvicorn/FastAPI
EXPOSE 8000

# Comando para iniciar o servidor FastAPI (produção)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
