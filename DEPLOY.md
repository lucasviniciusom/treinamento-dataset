# Documentação de Deploy do ML Data App

Este documento fornece instruções detalhadas para implantar o ML Data App em diferentes plataformas de hospedagem.

## Índice
1. [Execução Local com Docker](#execução-local-com-docker)
2. [Deploy no Render](#deploy-no-render)
3. [Deploy no Heroku](#deploy-no-heroku)
4. [Deploy em VPS (DigitalOcean, AWS)](#deploy-em-vps)
5. [Configuração de Variáveis de Ambiente](#configuração-de-variáveis-de-ambiente)
6. [Solução de Problemas Comuns](#solução-de-problemas-comuns)

## Execução Local com Docker

A maneira mais simples de executar o ML Data App é usando Docker Compose:

```bash
# Clone o repositório ou extraia os arquivos
git clone <repositório> ml-data-app
cd ml-data-app

# Inicie os containers
docker-compose up

# Para executar em segundo plano
docker-compose up -d

# Para parar os containers
docker-compose down
```

Acesse o frontend em: http://localhost:3000
Acesse o backend em: http://localhost:8000

## Deploy no Render

O Render é uma plataforma moderna que facilita o deploy de aplicações web.

### Backend (FastAPI)

1. Crie uma conta no [Render](https://render.com)
2. No dashboard, clique em "New" e selecione "Web Service"
3. Conecte seu repositório Git ou faça upload do código
4. Configure o serviço:
   - Nome: `ml-data-app-backend`
   - Runtime: `Python 3`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `cd src && uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Em "Advanced", adicione a variável de ambiente:
   - `ALLOWED_ORIGINS`: URL do seu frontend (ex: https://ml-data-app-frontend.onrender.com)
6. Clique em "Create Web Service"

### Frontend (React)

1. No dashboard do Render, clique em "New" e selecione "Static Site"
2. Conecte seu repositório Git ou faça upload do código frontend
3. Configure o serviço:
   - Nome: `ml-data-app-frontend`
   - Build Command: `npm install && npm run build`
   - Publish Directory: `build`
4. Em "Advanced", adicione a variável de ambiente:
   - `REACT_APP_API_URL`: URL do seu backend (ex: https://ml-data-app-backend.onrender.com)
5. Clique em "Create Static Site"

## Deploy no Heroku

### Backend (FastAPI)

1. Crie uma conta no [Heroku](https://heroku.com)
2. Instale o [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)
3. Faça login no Heroku CLI:
   ```bash
   heroku login
   ```
4. Navegue até a pasta do backend:
   ```bash
   cd ml-data-app/backend
   ```
5. Crie um arquivo `runtime.txt` com o conteúdo:
   ```
   python-3.10.0
   ```
6. Crie um aplicativo Heroku:
   ```bash
   heroku create ml-data-app-backend
   ```
7. Faça deploy do código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```
8. Configure a variável de ambiente:
   ```bash
   heroku config:set ALLOWED_ORIGINS=https://ml-data-app-frontend.herokuapp.com
   ```

### Frontend (React)

1. Navegue até a pasta do frontend:
   ```bash
   cd ml-data-app/frontend
   ```
2. Crie um aplicativo Heroku:
   ```bash
   heroku create ml-data-app-frontend
   ```
3. Adicione o buildpack para React:
   ```bash
   heroku buildpacks:set mars/create-react-app
   ```
4. Configure a variável de ambiente:
   ```bash
   heroku config:set REACT_APP_API_URL=https://ml-data-app-backend.herokuapp.com
   ```
5. Faça deploy do código:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git push heroku main
   ```

## Deploy em VPS

Para maior controle e flexibilidade, você pode implantar o ML Data App em uma VPS (Virtual Private Server).

### Configuração Inicial

1. Crie uma VM em um provedor de sua escolha (DigitalOcean, AWS, Google Cloud, etc.)
2. Conecte-se à VM via SSH:
   ```bash
   ssh usuario@ip-da-vm
   ```
3. Instale o Docker e Docker Compose:
   ```bash
   # Instalar Docker
   curl -fsSL https://get.docker.com -o get-docker.sh
   sudo sh get-docker.sh
   
   # Instalar Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

### Deploy do Aplicativo

1. Faça upload do projeto para a VM:
   ```bash
   scp -r ml-data-app/ usuario@ip-da-vm:~/
   ```
2. Conecte-se à VM e navegue até a pasta do projeto:
   ```bash
   ssh usuario@ip-da-vm
   cd ml-data-app
   ```
3. Edite o arquivo `.env.production` no frontend para apontar para o IP ou domínio da sua VM
4. Inicie os containers:
   ```bash
   docker-compose up -d
   ```

### Configuração do Nginx (Opcional)

Para expor o aplicativo com um domínio personalizado e HTTPS:

1. Instale o Nginx:
   ```bash
   sudo apt update
   sudo apt install nginx
   ```
2. Configure um proxy reverso criando `/etc/nginx/sites-available/ml-data-app`:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```
3. Ative a configuração:
   ```bash
   sudo ln -s /etc/nginx/sites-available/ml-data-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```
4. Configure HTTPS com Certbot:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d seu-dominio.com
   ```

## Configuração de Variáveis de Ambiente

### Backend (FastAPI)

- `PORT`: Porta em que o servidor será executado (padrão: 8000)
- `ALLOWED_ORIGINS`: URLs permitidos para CORS, separados por vírgula
- `DEBUG`: Define o modo de depuração (True/False)

### Frontend (React)

- `REACT_APP_API_URL`: URL completa do backend (ex: https://ml-data-app-backend.herokuapp.com)
- `PORT`: Porta em que o servidor de desenvolvimento será executado (padrão: 3000)

## Solução de Problemas Comuns

### CORS (Cross-Origin Resource Sharing)

Se você encontrar erros de CORS:

1. Verifique se a variável `ALLOWED_ORIGINS` no backend está configurada corretamente
2. Certifique-se de que o frontend está acessando o backend pelo URL exato configurado

### Problemas de Memória no Deploy

Se o backend falhar devido a limitações de memória:

1. Reduza o tamanho máximo de upload de arquivos
2. Otimize o processamento de dados grandes
3. Considere usar um plano com mais recursos na plataforma de hospedagem

### Erros de Dependências

Se houver problemas com dependências Python:

1. Verifique se todas as dependências estão listadas no `requirements.txt`
2. Certifique-se de que as versões são compatíveis
3. Tente especificar versões exatas para pacotes problemáticos
