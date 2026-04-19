# 🍽️ Restaurante GHU - Sistema de Autenticação

## 📋 Visão Geral

Sistema completo de autenticação com suporte a múltiplos roles (perfis de usuário) para um restaurante angolano.

## 👥 Roles Disponíveis

| Role | Descrição | Página | Credenciais de Teste |
|------|-----------|--------|---------------------|
| **Administrador** | Controle total do sistema | `/admin` | admin@restauranteghu.ao / 123456 |
| **Gerente** | Gestão de equipe e relatórios | `/gerente` | gerente@restauranteghu.ao / 123456 |
| **Garçom** | Atendimento e mesas | `/garcom` | garcom@restauranteghu.ao / 123456 |
| **Cozinha** | Preparo de pedidos | `/cozinha` | cozinha@restauranteghu.ao / 123456 |
| **Entregador** | Entregas delivery | `/entregador` | entregador@restauranteghu.ao / 123456 |
| **Cliente** | Área do cliente | `/cliente` | cliente2@restauranteghu.ao / 123456 |

## 🚀 Configuração

### 1. Backend (API)

```bash
cd api
npm install
cp .env.example .env
# Edite api/.env com suas configurações
npm run dev
```

### 2. Banco de Dados

Execute o dump SQL fornecido (`database/schema.sql`) e depois o script de seed:

```sql
-- Execute primeiro o schema.sql
-- Depois execute o seed_test_users.sql
```

### 3. Frontend

```bash
cd restaurante
npm install
npm run dev
```

## 🔐 Como Testar a Autenticação

### Login com Email
- Acesse: `http://localhost:5173/auth`
- Use qualquer combinação email/senha da tabela acima

### Login com Telefone
- Também é possível fazer login usando apenas o telefone
- Exemplo: `933333333` / `123456` (Garçom)

## 📁 Estrutura do Projeto

```
api/
├── src/
│   ├── controllers/auth.controller.ts  # Lógica de autenticação
│   ├── routes/auth.routes.ts          # Rotas de auth
│   ├── schemas/validation.schemas.ts  # Validação de dados
│   └── types/index.ts                 # Tipos TypeScript
└── database/
    ├── schema.sql                     # Estrutura do banco
    └── seed_test_users.sql           # Dados de teste

restaurante/
├── src/
│   ├── contexts/AuthContext.tsx      # Contexto de autenticação
│   ├── components/auth/AuthForm.tsx  # Formulário de login/registro
│   ├── pages/                        # Páginas por role
│   │   ├── Admin.tsx
│   │   ├── Gerente.tsx
│   │   ├── Garcom.tsx
│   │   ├── Cozinha.tsx
│   │   ├── Entregador.tsx
│   │   └── Cliente.tsx
│   └── services/api.ts               # Cliente da API
```

## 🔧 Funcionalidades Implementadas

### ✅ Autenticação
- Login com email OU telefone + senha
- Registro de novos usuários
- JWT tokens com expiração
- Proteção de rotas por role
- Logout automático em token expirado

### ✅ Roles e Permissões
- 6 roles diferentes (admin, gerente, garçom, cozinha, entregador, cliente)
- Redirecionamento automático baseado no role
- Páginas específicas para cada role

### ✅ Validação
- Schemas Zod para validação de entrada
- Senhas com mínimo 6 caracteres
- Emails válidos quando fornecidos
- Telefones com mínimo 7 dígitos

### ✅ Segurança
- Senhas hasheadas com bcrypt
- Tokens JWT seguros
- Middleware de autenticação
- Rate limiting configurável

## 🧪 Testando

### 1. Iniciar Serviços
```bash
# Terminal 1 - Backend
cd api && npm run dev

# Terminal 2 - Frontend
cd restaurante && npm run dev

# Terminal 3 - Banco (se usando Docker)
docker-compose up -d
```

### 2. Testar Login
1. Acesse `http://localhost:5173/auth`
2. Teste cada role com as credenciais acima
3. Verifique se é redirecionado para a página correta

### 3. Testar Registro
1. Na aba "Registrar" do formulário
2. Crie uma nova conta
3. Faça login com email/telefone + senha

## 📊 Dados de Teste Inseridos

O script `seed_test_users.sql` insere:
- ✅ 6 usuários (um por role)
- ✅ 5 mesas de exemplo
- ✅ 4 categorias de cardápio
- ✅ 4 itens de cardápio

## 🔍 Troubleshooting

### Erro: "Módulo não encontrado"
```bash
# Limpar cache do TypeScript/Vite
cd restaurante
rm -rf node_modules/.vite
npm run dev
```

### Erro: "Conexão com banco falhou"
- Verifique se o MySQL está rodando
- Confirme as credenciais no `.env`
- Execute o schema.sql primeiro

### Erro: "Token expirado"
- Faça logout e login novamente
- Tokens expiram em 7 dias por padrão

## 📝 Notas Técnicas

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + TypeScript
- **Banco**: MySQL 8.0
- **Autenticação**: JWT + bcrypt
- **Validação**: Zod schemas
- **UI**: Shadcn/ui + Tailwind CSS

---

**🎉 Sistema pronto para uso!** Teste todas as funcionalidades e personalize conforme necessário.