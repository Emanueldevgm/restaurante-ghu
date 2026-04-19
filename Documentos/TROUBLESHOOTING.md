# 🔧 Troubleshooting Rápido - Restaurante GHU

## ❌ Problema: "Não consigo conectar ao MySQL"

### Sintomas
```
Error: connect ECONNREFUSED 127.0.0.1:3306
Cannot reach database at localhost:3306
```

### Solução

**Opção 1: Com Docker (Recomendado)**
```bash
# Verificar se container está rodando
docker-compose ps

# Se não está, iniciar
docker-compose up -d mysql

# Verificar logs
docker-compose logs mysql

# Entrar no MySQL
docker-compose exec mysql mysql -u root -p
# Senha: root
```

**Opção 2: MySQL Manual**
```bash
# Verificar se está rodando
systemctl status mysql
# ou
service mysql status

# Iniciar se não estiver
sudo systemctl start mysql

# Verificar porta
netstat -tulpn | grep 3306

# Testar conexão
mysql -u root -p
```

**Opção 3: Verificar credenciais**
```bash
# Ver arquivo .env
cat api/.env | grep DB_

# Testar conexão com credenciais
mysql -h localhost -u root -p<PASSWORD> restaurante_angola_db

# Se falhar, resetar MySQL
mysql -u root -p -e "DROP DATABASE restaurante_angola_db;"
mysql -u root -p < api/database/schema.sql
```

---

## ❌ Problema: "Porta 3001 já está em uso"

### Sintomas
```
Error: listen EADDRINUSE :::3001
Port 3001 is already in use
```

### Solução

**Opção 1: Matar processo na porta**
```bash
# Encontrar PID
lsof -i :3001

# Matar processo
kill -9 <PID>

# Ou usar NPM
npm run dev  # Vai matar automaticamente
```

**Opção 2: Usar porta diferente**
```bash
# Editar .env
nano api/.env

# Mudar
PORT=3002

# Lembrar de atualizar frontend
# Em restaurante/.env
VITE_API_BASE_URL=http://localhost:3002/api
```

**Opção 3: Verificar o que está rodando**
```bash
# Listar todos os processos Node
ps aux | grep node

# Listar todas as portas em uso
netstat -tulpn
```

---

## ❌ Problema: "CORS error em requisições"

### Sintomas
```
Access to XMLHttpRequest... blocked by CORS policy
Origin not allowed by Access-Control-Allow-Origin
```

### Solução

**1. Verificar CORS_ORIGIN em .env**
```bash
cat api/.env | grep CORS_ORIGIN

# Deve ter sua URL frontend
# Exemplo:
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

**2. Em desenvolvimento, adicionar localhost**
```bash
# Para dev, adicione todas essas URLs
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:8080

# Importante: SEM HTTPS em desenvolvimento (use HTTP)
```

**3. Reiniciar backend**
```bash
npm run dev  # No diretório api/
```

**4. Verificar qual URL o frontend usa**
```bash
# Frontend em http://localhost:5173?
# Adicionar em CORS_ORIGIN

# Frontend em http://localhost:3000?
# Adicionar em CORS_ORIGIN
```

---

## ❌ Problema: "Erro 401 - Token inválido"

### Sintomas
```
{
  "success": false,
  "message": "Token inválido ou expirado"
}
```

### Solução

**1. Verificar localStorage no frontend**
```typescript
// No console do navegador
localStorage.getItem('restaurant_token')
localStorage.getItem('restaurant_user')

// Se vazios, fazer login novamente
```

**2. Verificar JWT_SECRET em .env**
```bash
cat api/.env | grep JWT_SECRET

# Deve ter valor FORTE (min 32 caracteres)
# Se mudar JWT_SECRET, tokens antigos viram inválidos!
```

**3. Tokens expirados**
```bash
# JWT_EXPIRES_IN padrão é 7d (7 dias)
# Se mudar, apenas novos logins usam novo tempo
```

**4. Fazer login novamente**
```bash
# No frontend, logout e login novamente
```

---

## ❌ Problema: "Erro de validação estranho"

### Sintomas
```
{
  "success": false,
  "message": "Validação falhou",
  "errors": [...]
}
```

### Solução

**1. Verificar mensagem de erro**
```bash
# A resposta deve ter array "errors"
{
  "errors": [
    {
      "path": "email",
      "message": "Email inválido"
    }
  ]
}
```

**2. Verificar tipo de dado**
```bash
# Zod é muito rigoroso. Exemplo:
{
  "data": {
    "numero_pessoas": "5"  # ❌ String, deve ser número
  }
}

# Corrigir:
{
  "numero_pessoas": 5  # ✅ Número
}
```

**3. Testar com curl**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Test User",
    "telefone": "923456789",
    "senha": "password123"
  }'
```

---

## ❌ Problema: "TypeScript compilation errors"

### Sintomas
```
error TS2307: Cannot find module '@utils/jwt.util'
error TS7030: Not all code paths return a value
```

### Solução

**1. Verificar imports**
```typescript
// ❌ ERRADO
import { func } from '../utils/jwt.util'

// ✅ CERTO (com alias)
import { func } from '@utils/jwt.util'
```

**2. Verificar tsconfig.json**
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["src/*"],
      "@utils/*": ["src/utils/*"]
    }
  }
}
```

**3. Compilar novamente**
```bash
cd api
npx tsc --noEmit  # Apenas verificar
npm run build      # Build completo
```

**4. Limpar cache**
```bash
rm -rf dist node_modules
npm install
npm run build
```

---

## ❌ Problema: "Frontend não carrega"

### Sintomas
```
Blank page
Erro em console do navegador
Cannot read property of undefined
```

### Solução

**1. Verificar .env existe**
```bash
cd restaurante
catter .env.example  # Copiar para .env
nano .env           # Editar VITE_API_BASE_URL
```

**2. Verificar VITE_API_BASE_URL**
```bash
# .env deve ter
VITE_API_BASE_URL=http://localhost:3001/api

# Testar se backend está rodando
curl http://localhost:3001/health
```

**3. Ver console do navegador**
```
F12 -> Console
Copiar todos os erros
```

**4. Reconstruir**
```bash
cd restaurante
rm -rf node_modules dist
npm install
npm run dev
```

---

## ❌ Problema: "Erro ao fazer upload de arquivos"

### Sintomas
```
413 Payload Too Large
File exceeds maximum size
```

### Solução

**1. Verificar MAX_FILE_SIZE em .env**
```bash
# Padrão é 5MB (5242880 bytes)
MAX_FILE_SIZE=5242880

# Aumentar se necessário
MAX_FILE_SIZE=10485760  # 10MB
```

**2. Reiniciar backend**
```bash
npm run dev
```

**3. Verificar tamanho do arquivo**
```bash
# Linux/Mac
ls -lh arquivo.jpg

# Windows
Get-ChildItem arquivo.jpg | Select-Object Length
```

---

## ❌ Problema: "Performance lenta"

### Sintomas
```
Requisições demoram muito
Página carrega lentamente
```

### Solução

**1. Verificar conexão ao MySQL**
```bash
# Fazer query diretamente
mysql -u root -p restaurante_angola_db
SELECT COUNT(*) FROM usuarios;
```

**2. Verificar índices**
```bash
# Mostrar índices
SHOW INDEXES FROM usuarios;

# Adicionar índice se não houver
CREATE INDEX idx_email ON usuarios(email);
```

**3. Ver logs de tempo**
```bash
tail -f logs/app.log | grep duration
```

**4. Usar DevTools**
```
Chrome DevTools -> Network
Ver qual requisição demora mais
Pode ser backend ou frontend
```

---

## ✅ Sintomas de OK

Se você ver:

```bash
# Backend iniciando
✅ Conexão com MySQL estabelecida com sucesso!
✅ Servidor rodando na porta: 3001
🌍 URL: http://localhost:3001

# Frontend iniciando
VITE v4.x.x ready in xxx ms

# Requisição sucesso
200 OK
{
  "success": true,
  "data": {...}
}
```

Tudo está funcionando! 🎉

---

## 📞 Se Nada Funcionar

**1. Verificar o óbvio**
- [ ] Backend está rodando? (`npm run dev` em /api)
- [ ] Frontend está rodando? (`npm run dev` em /restaurante)
- [ ] MySQL está rodando? (docker-compose ou systemctl)
- [ ] Portas corretas no .env?

**2. Limpar tudo**
```bash
# Backend
cd api
rm -rf node_modules dist
npm install
npm run build
npm run dev

# Frontend
cd ../restaurante
rm -rf node_modules dist
npm install
npm run dev

# Docker
docker-compose down -v
docker-compose up -d
```

**3. Ver todos os logs**
```bash
# Backend
npm run dev

# Frontend
npm run dev

# MySQL
docker-compose logs mysql

# Copiar todos os erros
```

**4. Resetar banco de dados**
```bash
# Backup primeiro!
mysqldump -u root -p restaurante_angola_db > backup.sql

# Remover
mysql -u root -p -e "DROP DATABASE restaurante_angola_db;"

# Recriar
mysql -u root -p < api/database/schema.sql
```

**5. Buscar na documentação**
- Ver [README_SETUP.md](README_SETUP.md) para setup
- Ver [BEST_PRACTICES.md](BEST_PRACTICES.md) para padrões
- Ver [TESTING_GUIDE.md](TESTING_GUIDE.md) para testes

---

## 🆘 Pedir Ajuda

Quando pedir ajuda, incluir:

```
1. Que comando rodou?
   npm run dev

2. Qual o erro exato?
   (copiar todo o texto)

3. Qual o seu sistema?
   Windows / Mac / Linux

4. Qual a versão do Node?
   node --version

5. O que já tentou?
   Reiniciar, limpar cache, etc
```

---

**Última atualização**: 20 de fevereiro de 2026
**Teste seus troubleshoots**: `npm run dev` ✅
