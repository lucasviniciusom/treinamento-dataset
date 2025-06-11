# Dockerfile para o frontend (React + Tailwind)
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package.json package-lock.json* ./
RUN npm install

# Copiar o código do frontend
COPY . .

# Expor a porta que o React usará
EXPOSE 3000

# Comando para iniciar o servidor de desenvolvimento React
CMD ["npm", "start"]
