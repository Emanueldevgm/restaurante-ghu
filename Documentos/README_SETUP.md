# 🍽️ Restaurante GHU - Sistema de Gestão Completo

Sistema web completo para gestão de restaurante, incluindo menu, pedidos, reservas e admin dashboard.

## 📋 Pré-requisitos

- **Node.js** v18+ ou **Bun** v1.0+
- **MySQL** v8.0+ ou **Docker** para containerização
- **Git**

## 🚀 Quick Start com Docker

A forma mais fácil de começar é usando Docker Compose:

```bash
# Na raiz do projeto
docker-compose up -d

# Isso iniciará:
# - MySQL em localhost:3306
# - PHPMyAdmin em http://localhost:8081
```

## 💻 Setup Manual do Projeto

### 1. Backend (API)

```bash
cd api

# Instalar dependências
npm install
# ou com Bun
bun install

# Criar arquivo .env (copiar .env.example)
cp .env.example .env

# Editar .env com suas configurações
nano .env

# Executar migrations de banco
npm run db:init

# Iniciar em desenvolvimento
npm run dev

# Compilar para produção
npm run build

# Iniciar produção
npm start
```

### 2. Frontend (React)

```bash
cd restaurante

# Instalar dependências
npm install
# ou com Bun
bun install

# Criar arquivo .env (copiar .env.example)
cp .env.example .env

# Editar .env com API_URL correto
nano .env

# Iniciar em desenvolvimento
npm run dev

# Compilar para produção
npm run build
```

## 📚 Estrutura do Projeto

```
restaurante/
├── api/                      # Backend Express + TypeScript
│   ├── src/
│   │   ├── config/          # Configurações (DB, CORS, ENV)
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Middlewares customizados
│   │   ├── routes/          # Definição de rotas
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilitários (JWT,Password, etc)
│   │   ├── schemas/         # Schemas de validação Zod
│   │   └── app.ts           # Configuração do Express
│   └── database/            # Schema SQL
│
├── restaurante/             # Frontend React + Vite
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── pages/           # Páginas/Rotas
│   │   ├── contexts/        # React Contexts
│   │   ├── hooks/           # Custom Hooks
│   │   ├── services/        # API calls
│   │   ├── schemas/         # Validação Zod frontend
│   │   └── types/           # Tipos TypeScript
│   └── public/              # Assets estáticos
│
└── docker-compose.yml       # Configuração Docker
```

## 🔐 Variáveis de Ambiente

### Backend (.env)

```env
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=restaurante_angola_db

# JWT
JWT_SECRET=sua_chave_super_secreta_aqui (min 32 chars)
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Restaurante GHU
```

## 📦 Scripts Disponíveis

### Backend

```bash
npm run dev              # Desenvolvimento com watch
npm run build            # Compilar TypeScript
npm start               # Produção
npm run lint            # ESLint
npm run format          # Prettier
npm run test            # Testes (Jest)
npm run db:init         # Inicializar banco de dados
```

### Frontend

```bash
npm run dev             # Desenvolvimento com HMR
npm run build           # Build otimizado
npm run preview         # Preview do build
npm run lint            # ESLint
npm run test            # Vitest
npm run test:watch      # Vitest watch mode
```

## 🗄️ Banco de Dados

### Schema

O schema MySQL está em `api/database/schema.sql` com as seguintes tabelas:

- **usuarios** - Usuários do sistema (clientes, admin, etc)
- **categorias** - Categorias do menu
- **itens_cardapio** - Itens do menu
- **pedidos** - Pedidos realizados
- **itens_pedido** - Items de cada pedido
- **reservas** - Reservas de mesas
- **mesas** - Mesas do restaurante
- **enderecos_clientes** - Endereços para delivery
- **zonas_entrega** - Zonas de entrega

### Inicializar Banco

```bash
# Com Docker (automático)
docker-compose up -d

# Manual com MySQL
mysql -u root -p < api/database/schema.sql
```

## 🔍 API Endpoints

### Auth
```
POST   /api/auth/register        - Registrar novo usuário
POST   /api/auth/login          - Login
GET    /api/auth/profile        - Obter perfil (autenticado)
PUT    /api/auth/profile        - Atualizar perfil (autenticado)
PUT    /api/auth/change-password - Mudar senha (autenticado)
```

### Menu
```
GET    /api/menu/categories     - Listar categorias
GET    /api/menu/items          - Listar items
GET    /api/menu/items/:id      - Obter item
POST   /api/menu/items          - Criar item (admin)
PUT    /api/menu/items/:id      - Atualizar item (admin)
DELETE /api/menu/items/:id      - Deletar item (admin)
```

### Pedidos
```
GET    /api/orders              - Listar pedidos (autenticado)
POST   /api/orders              - Criar pedido
GET    /api/orders/:id          - Obter detalhes do pedido
PUT    /api/orders/:id/status   - Atualizar status (admin)
```

### Reservas
```
GET    /api/reservations        - Listar reservas (autenticado)
POST   /api/reservations        - Criar reserva
GET    /api/reservations/:id    - Obter reserva
PATCH  /api/reservations/:id    - Cancelar reserva
```

### Mesas
```
GET    /api/tables              - Listar mesas
GET    /api/tables/status       - Status das mesas
POST   /api/tables              - Criar mesa (admin)
```

## 🔒 Segurança

O projeto inclui várias camadas de segurança:

- ✅ **Helmet.js** - Headers de segurança HTTP
- ✅ **CORS** - Controle de origem de requisições
- ✅ **Rate Limiting** - Limite de requisições por IP
- ✅ **JWT** - Autenticação com tokens
- ✅ **Bcrypt** - Hash de senhas
- ✅ **Zod** - Validação de entrada
- ✅ **SQL Injection Prevention** - Prepared statements

## 🧪 Testando a API

### Com Postman/Insomnia

A API está documentada com endpoints em `/api/health` para verificar status.

### Com cURL

```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "telefone": "123456789",
    "senha": "sua_senha"
  }'

# Listar menu
curl http://localhost:3001/api/menu/items
```

## 📱 Deployment

### Vercel (Frontend)

```bash
# No repositório GitHub
# Conectar no Vercel
# Variáveis: VITE_API_BASE_URL=seu-backend.com/api
```

### Heroku/Railway (Backend)

```bash
# Variáveis obrigatórias
DB_HOST=seu-banco.com
DB_USER=usuario
DB_PASSWORD=senha
JWT_SECRET=sua-chave-super-secreta-com-32-chars-ou-mais
```

## 🐛 Troubleshooting

### "Cannot connect to MySQL"
- Verifique se MySQL está rodando
- Confira credenciais em `.env`
- Com Docker: `docker-compose logs mysql`

### "Port already in use"
- Backend: Mude `PORT` em `.env`
- Frontend: Mude porta no `vite.config.ts`

### "CORS error"
- Atualize `CORS_ORIGIN` em `.env` backend
- Verifique se URL frontend está incluída

### "JWT_SECRET validation failed"
- JWT_SECRET deve ter mínimo 32 caracteres
- Evite usar default value em produção

## 📝 Licença

MIT

## 👥 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação
2. Consulte os logs (`logs/app.log`)
3. Abra uma issue no repositório

---

**Desenvolvido com ❤️ para o Restaurante GHU - Angola**
