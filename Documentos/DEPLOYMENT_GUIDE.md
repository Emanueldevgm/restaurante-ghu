# 🚀 Guia de Deployment - Restaurante GHU

## 📋 Pré-requisitos

- Servidor VPS ou Cloud (AWS, DigitalOcean, Azure, etc.)
- Node.js 18+ instalado
- MySQL 8.0+ ou PostgreSQL
- Docker (opcional mas recomendado)
- Domain SSL (Let's Encrypt)
- Git configurado

---

## 🔐 Segurança em Produção

### 1. Variáveis de Ambiente

```bash
# Backend (.env PRODUÇÃO)
NODE_ENV=production
PORT=3001
API_URL=https://api.restaurante-ghu.ao

# Database (usar credenciais fortes!)
DB_HOST=db.example.com
DB_USER=restaurante_prod
DB_PASSWORD=GERA_SENHA_SUPER_FORTE_AQUI

# JWT (GERAR CHAVE FORTE!)
JWT_SECRET=$(openssl rand -base64 32)  # Mínimo 32 chars

# CORS (apenas domínios permitidos)
CORS_ORIGIN=https://restaurante-ghu.ao,https://www.restaurante-ghu.ao

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=200
RATE_LIMIT_WINDOW_MS=900000

# Email
EMAIL_HOST=smtp.empresa.com
EMAIL_USER=noreply@restaurante-ghu.ao
EMAIL_PASSWORD=SENHA_FORTE

# Frontend (.env PRODUÇÃO)
VITE_API_BASE_URL=https://api.restaurante-ghu.ao
VITE_APP_NAME=Restaurante GHU
```

**⚠️ IMPORTANTE**: 
- Nunca comitar `.env` em git
- Usar variáveis de ambiente do servidor
- Rotar credentials regularmente

### 2. SSL/TLS Certificate

```bash
# Usando Let's Encrypt (gratuito)
sudo certbot certonly --standalone \
  -d restaurante-ghu.ao \
  -d api.restaurante-ghu.ao

# Nginx auto-renew
sudo certbot renew --dry-run
```

---

## 📦 Deploy com Docker (Recomendado)

### 1. Preparar Dockerfile

```dockerfile
# backend.Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

### 2. Docker Compose em Produção

```yaml
version: '3.8'

services:
  api:
    build:
      context: ./api
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    environment:
      NODE_ENV: production
      PORT: 3001
      DB_HOST: mysql
    depends_on:
      mysql:
        condition: service_healthy
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: restaurante_angola_db
    volumes:
      - mysql_data:/var/lib/mysql
      - ./api/database/schema.sql:/docker-entrypoint-initdb.d/schema.sql
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "mysqladmin", "ping"]
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  mysql_data:
```

### 3. Iniciar em Produção

```bash
# Fazer push do código
git push origin main

# No servidor
git clone https://github.com/seu-repo/restaurante.git
cd restaurante

# Criar .env com valores de produção
nano .env

# Iniciar com Docker
docker-compose up -d

# Verificar logs
docker-compose logs -f api

# Executar migrations se necessário
docker-compose exec api npm run db:init
```

---

## 🖥️ Deploy Manual (Sem Docker)

### 1. Preparar Servidor

```bash
# SSH no servidor
ssh user@server.com

# Criar diretórios
sudo mkdir -p /var/www/restaurante
cd /var/www/restaurante

# Clonar repositório
git clone https://github.com/seu-repo/restaurante.git .
cd api

# Instalar dependências
npm install --omit=dev

# Build
npm run build

# Criar arquivo .env com valores reais
nano .env
```

### 2. Usar PM2 para Gerenciar Processo

```bash
# Instalar PM2 globalmente
npm install -g pm2

# Iniciar aplicação
pm2 start dist/server.js --name "restaurante-api"

# Salvar configuração
pm2 save

# Auto-restart após reboot
pm2 startup

# Ver logs
pm2 logs restaurante-api

# Monitorar
pm2 monit
```

### 3. Nginx como Reverse Proxy

```nginx
# /etc/nginx/sites-available/restaurante-api

upstream restaurante_backend {
    server 127.0.0.1:3001;
}

upstream restaurante_frontend {
    server 127.0.0.1:3000;
}

# Redirecionar HTTP para HTTPS
server {
    listen 80;
    server_name api.restaurante-ghu.ao;
    return 301 https://$server_name$request_uri;
}

# API HTTPS
server {
    listen 443 ssl http2;
    server_name api.restaurante-ghu.ao;

    ssl_certificate /etc/letsencrypt/live/api.restaurante-ghu.ao/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.restaurante-ghu.ao/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "SAMEORIGIN" always;

    location / {
        proxy_pass http://restaurante_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Timeout
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}

# Frontend HTTPS
server {
    listen 443 ssl http2;
    server_name restaurante-ghu.ao www.restaurante-ghu.ao;

    ssl_certificate /etc/letsencrypt/live/restaurante-ghu.ao/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/restaurante-ghu.ao/privkey.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    root /var/www/restaurante/dist;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Habilitar:
```bash
sudo ln -s /etc/nginx/sites-available/restaurante-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🗄️ Backup Banco de Dados

### Backup Automático

```bash
#!/bin/bash
# /home/user/backup-db.sh

BACKUP_DIR="/backups/restaurante"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/restaurante_$DATE.sql"

# Criar diretório
mkdir -p $BACKUP_DIR

# Fazer backup
mysqldump -u root -p$DB_PASSWORD restaurante_angola_db > $BACKUP_FILE

# Comprimir
gzip $BACKUP_FILE

# Remover backups antigos (>30 dias)
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Enviar para storage remoto (optional)
# aws s3 cp $BACKUP_FILE.gz s3://seu-bucket/backups/
```

Agendar com cron:
```bash
# Diariamente às 2AM
0 2 * * * /home/user/backup-db.sh

# Editar crontab
crontab -e
```

### Restaurar Backup

```bash
# Descompactar
gunzip restaurante_2026-02-20_02-00-00.sql.gz

# Restaurar
mysql -u root -p restaurante_angola_db < restaurante_2026-02-20_02-00-00.sql
```

---

## 📊 Monitoramento

### Logs Centralizados

```bash
# Verificar espaço de logs
du -sh logs/

# Rotacionar logs com logrotate
sudo vim /etc/logrotate.d/restaurante

# Conteúdo:
/var/www/restaurante/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### Alertas de Erro

```bash
# Monitorar logs em tempo real
tail -f logs/app.log | grep ERROR

# Contar erros por hora
grep ERROR logs/app.log | awk '{print $1}' | sort | uniq -c

# Enviar alerta se muitos erros
if [ $(grep ERROR logs/app.log | wc -l) -gt 100 ]; then
    echo "Muitos erros!" | mail -s "Alerta - Restaurante API" admin@restaurante.ao
fi
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions em Produção

Adicionar secrets no GitHub:

```
API_HOST: seu-servidor.com
API_SSH_KEY: sua-chave-ssh-privada
API_USER: deploy-user
```

Workflow para auto-deploy:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build
        run: |
          cd api
          npm install
          npm run build

      - name: Deploy
        env:
          SSH_PRIVATE_KEY: ${{ secrets.API_SSH_KEY }}
          HOST: ${{ secrets.API_HOST }}
          USER: ${{ secrets.API_USER }}
        run: |
          mkdir -p ~/.ssh
          echo "$SSH_PRIVATE_KEY" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh -o StrictHostKeyChecking=no $USER@$HOST "cd /var/www/restaurante && git pull && npm install && npm run build && pm2 restart restaurante-api"
```

---

## ✅ Checklist Pré-Deploy

- [ ] Variáveis de ambiente corretas em produção
- [ ] SSL certificate instalado
- [ ] Banco de dados criado e testado
- [ ] Backup strategy implementada
- [ ] Rate limiting configurado
- [ ] CORS apenas para domínios permitidos
- [ ] JWT_SECRET forte (min 32 chars)
- [ ] Logs configurados
- [ ] Nginx/reverse proxy funcionando
- [ ] PM2/Docker rodando corretamente
- [ ] Domain DNS apontando corretamente
- [ ] Health check: `curl https://api.restaurante-ghu.ao/health`

---

## 🚨 Troubleshooting Produção

### Aplicação não inicia

```bash
# Ver erro
pm2 logs restaurante-api

# Verificar porta ocupada
lsof -i :3001

# Reiniciar
pm2 restart restaurante-api
```

### Conexão ao banco falha

```bash
# Testar conexão
mysql -h DB_HOST -u DB_USER -p

# Verificar credenciais em .env
cat .env | grep DB_

# Verificar firewall
sudo ufw status
sudo ufw allow from servidor_api to DB_PORT
```

### Performance lenta

```bash
# Ver uso de memória
free -h

# Ver CPU
top -n 1

# Ver plano de query MySQL
EXPLAIN SELECT * FROM pedidos WHERE usuario_id = '123';

# Adicionar índices se necessário
ALTER TABLE pedidos ADD INDEX idx_usuario (usuario_id);
```

---

## 📞 Suporte

Para problemas em produção:
1. Verificar logs: `tail -f logs/app.log`
2. Health check: `curl https://api.restaurante-ghu.ao/health`
3. Verificar database conecta
4. Reiniciar PM2: `pm2 restart all`
5. Se nada funciona, reverter último deploy

---

**Última atualização**: 20 de fevereiro de 2026
**Versão**: 1.0.0 Production Ready ✅
