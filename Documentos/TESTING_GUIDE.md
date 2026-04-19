# 🧪 Guia de Testing - Restaurante GHU

## 🚀 Quick Start com Docker

```bash
# Iniciar banco de dados e PHPMyAdmin
docker-compose up -d

# Verificar se está rodando
docker-compose ps

# Ver logs do MySQL
docker-compose logs mysql

# Parar tudo
docker-compose down
```

Após iniciar:
- **MySQL**: localhost:3306 (root/root)
- **PHPMyAdmin**: http://localhost:8081

---

## ✅ Validar TypeScript

### Backend
```bash
cd api
npx tsc --noEmit        # Verifica erros
npm run build           # Compila
```

### Frontend
```bash
cd restaurante
npx tsc --noEmit        # Verifica erros
npm run build           # Compila
```

**Esperado**: Sem erros de compilação

---

## 🔍 Testar Validação Zod

### Backend - Teste via curl/Postman

```bash
# ✅ DEVE FUNCIONAR - Query válida
curl http://localhost:3001/api/menu/items?status=disponivel

# ✅ DEVE FUNCIONAR - Login dengan email
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@gmail.com",
    "senha": "senha123"
  }'

# ❌ DEVE FALHAR - Email inválido
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "senha": "senha123"
  }'
# Resposta esperada: 400 com errors array

# ❌ DEVE FALHAR - Senha fraca (<6 chars)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Test User",
    "telefone": "923456789",
    "senha": "123"
  }'
# Resposta esperada: 400 com mensagem de erro
```

### Frontend - Teste de Validação de Forms

Abrir componente de login/registro e testar:

```typescript
// ✅ DEVE FUNCIONAR
- Email: user@example.com
- Senha: SecurePass123

// ❌ DEVE FALHAR COM MSG
- Email: invalid-email (não é email)
- Senha: 123 (menos de 6 caracteres)
- Confirmar Senha: diferente de Senha
```

---

## 🔐 Testar Segurança

### Rate Limiting

```bash
# Executar 10 logins rápidos (limite é 5 em 15 min)
for i in {1..10}; do
  curl -X POST http://localhost:3001/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"telefone":"123","senha":"123"}'
done

# Esperado: Após 5º, retorna 429 Too Many Requests
```

### CORS

```bash
# Teste com origem bloqueada
curl -H "Origin: http://hack.com" \
  http://localhost:3001/api/menu/items

# Esperado: Erro CORS (sem header Access-Control-Allow-Origin)

# Teste com origem permitida (localhost:5173)
curl -H "Origin: http://localhost:5173" \
  http://localhost:3001/api/menu/items

# Esperado: Response normal com CORS headers
```

### JWT Validation

```bash
# ❌ Sem token
curl http://localhost:3001/api/auth/profile
# Esperado: 401 Unauthorized

# ❌ Token inválido
curl -H "Authorization: Bearer invalid.token.here" \
  http://localhost:3001/api/auth/profile
# Esperado: 401 Token inválido

# ✅ Token válido (após login)
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3001/api/auth/profile
# Esperado: 200 com perfil do usuário
```

---

## 🧬 Testar Erros

### Validação de Input

```bash
# ❌ Deve retornar 400
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "Test",
    "telefone": "123",      # Muito curto!
    "senha": "password123"
  }'

# Resposta esperada:
{
  "success": false,
  "message": "Validação falhou",
  "errors": [
    {
      "path": "telefone",
      "message": "Telefone deve ter pelo menos 7 dígitos"
    }
  ]
}
```

### Recurso Não Encontrado

```bash
# ❌ Item inexistente
curl http://localhost:3001/api/menu/items/invalid-uuid

# Esperado: 404 Not Found
{
  "success": false,
  "message": "invalid-uuid não encontrado(a)"
}
```

### Acesso Negado

```bash
# Login como cliente (não admin)
TOKEN=$(curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"telefone":"923456789","senha":"password"}' \
  | jq -r '.data.token')

# Tentar acessar rota admin
curl -X POST http://localhost:3001/api/menu/items \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"item"}'

# Esperado: 403 Forbidden
{
  "success": false,
  "message": "Acesso negado. Apenas administradores e gerentes..."
}
```

---

## 📊 Testar Logging

### Backend

1. **Ver logs em tempo real**:
```bash
cd api
npm run dev

# Monitor no terminal
```

2. **Logs em arquivo**:
```bash
tail -f logs/app.log

# Ver último 50 logs
tail -50 logs/app.log

# Buscar erros
grep ERROR logs/app.log
```

3. **Estrutura esperada**:
```
[2026-02-20T10:30:45.123Z] [INFO] HTTP POST /api/auth/login 200 | Context: {"duration":"45ms"}
[2026-02-20T10:30:46.456Z] [DEBUG] DB SELECT on usuarios | Context: {"duration":"12ms"}
[2026-02-20T10:30:47.789Z] [ERROR] Validação falhou | Context: {"path":"email","message":"..."}
```

---

## 📱 Testar Frontend em Development

```bash
# Terminal 1: Backend
cd api
npm run dev

# Terminal 2: Frontend
cd restaurante  
npm run dev

# Abrir http://localhost:5173
```

### Verificações

- [ ] Navbar renderiza corretamente
- [ ] Menu carrega sem erro
- [ ] Clique em "Fazer Reserva" funciona
- [ ] Login redireciona corretamente
- [ ] Validação de forms mostra mensagens
- [ ] Erros mostram UI amigável (Error Boundary)
- [ ] Console sem warnings (strict mode)

---

## 🏗️ Testar Build

### Backend

```bash
cd api
npm run build      # Compila TypeScript
npm start         # Executa build

# Esperado: "Servidor rodando na porta 3001"
```

### Frontend

```bash
cd restaurante
npm run build     # Cria dist/

# Verificar tamanho
du -sh dist/

# Preview do build
npm run preview   # Serve em http://localhost:4173
```

---

## 🔄 Testar Docker

```bash
# Build da imagem
docker-compose build

# Verificar
docker images | grep restaurante

# Executar
docker-compose up

# Verificar logs
docker-compose logs -f mysql

# Parar
docker-compose down

# Remover volumes (limpar dados)
docker-compose down -v
```

---

## 🧹 Cleanup & Reset

### Limpar dados de teste

```bash
# Drop database
mysql -u root -p -e "DROP DATABASE restaurante_angola_db;"

# Recreate
mysql -u root -p < api/database/schema.sql

# Ou via docker
docker-compose down -v
docker-compose up -d
```

### Limpar cache Node

```bash
cd api
rm -rf node_modules dist
npm install
npm run build

cd ../restaurante
rm -rf node_modules dist
npm install
npm run build
```

---

## 📋 Checklist Pré-Deploy

- [ ] TypeScript compila sem erros
- [ ] npm run lint passa
- [ ] npm run build funciona
- [ ] Docker-compose up funciona
- [ ] Validações Zod funcionam (curl tests)
- [ ] Rate limiting funciona
- [ ] CORS funciona
- [ ] JWT authentication funciona
- [ ] Error Boundary captura erros
- [ ] Logs aparecem em arquivo

---

## 🐛 Debugging

### Backend

```typescript
// Adicione LOG.debug no código
import Logger from '@utils/logger.util';
Logger.debug('Processando pedido', { orderId: '123' }, userId);

// Veja em logs/app.log ou console
```

### Frontend

```typescript
// USE React DevTools
// - Inspecione componentes
// - Veja estado e props
// - Profile performance

// Console.log estruturado
console.log('🔍 Debug:', { cart, total, user });
```

---

## 📧 Testing Email (Optional)

Se quiser testar envio de email:

```typescript
// Usar Mailtrap ou similar
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=seu-user
EMAIL_PASSWORD=seu-password
```

---

## 📊 Performance Testing

```bash
# Backend load test (precisas de Apache Bench)
ab -n 1000 -c 10 http://localhost:3001/api/menu/items

# Frontend bundle analysis
npm run build
npx vite-bundle-visualizer
```

---

## 🎯 Testes Esperados vs Reais

| Teste | Esperado | Status |
|-------|----------|--------|
| TypeScript | Sem erros | ✅ |
| Validação Zod | 400 com errors | ✅ |
| Rate Limiting | 429 após 5 attempts | ✅ |
| CORS | Headers permitidos | ✅ |
| Error Boundary | UI amigável | ✅ |
| Auth | JWT válido | ✅ |
| Docker | MySQL rodando | ✅ |

---

**Última atualização**: 20 de fevereiro de 2026
**Status**: Todos os testes passando ✅
