# API REST - Restaurante GHU (Grande Hotel do Uíge)

API REST completa para sistema de gestão de restaurante, desenvolvida em Node.js com TypeScript, Express e MySQL.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **TypeScript** - Superset JavaScript com tipagem
- **Express** - Framework web
- **MySQL2** - Driver MySQL
- **JWT** - Autenticação via tokens
- **Bcrypt** - Hash de senhas
- **Zod** - Validação de dados
- **CORS** - Configuração de origens
- **Helmet** - Segurança HTTP
- **Morgan** - Logger de requisições

## 📋 Pré-requisitos

- Node.js 18+ instalado
- MySQL 8.0+ instalado e rodando
- Git (opcional)

## ⚙️ Instalação

1. **Clone ou navegue até a pasta da API:**
   ```bash
   cd api
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=restaurante_angola_db
   
   JWT_SECRET=sua_chave_secreta_super_segura
   PORT=3001
   ```

4. **Configure o banco de dados:**
   
   Execute o script SQL para criar o banco e as tabelas:
   ```bash
   mysql -u root -p < database/schema.sql
   ```
   
   Ou execute manualmente no MySQL Workbench/phpMyAdmin o arquivo `database/schema.sql`

## 🏃 Executando a API

### Modo Desenvolvimento
```bash
npm run dev
```

### Modo Produção
```bash
npm run build
npm start
```

A API estará rodando em: `http://localhost:3001`

## 📚 Endpoints da API

### Autenticação `/api/auth`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/register` | Registrar novo usuário | Não |
| POST | `/login` | Login | Não |
| GET | `/profile` | Obter perfil | Sim |
| PUT | `/profile` | Atualizar perfil | Sim |
| PUT | `/change-password` | Alterar senha | Sim |

### Menu `/api/menu`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/categories` | Listar categorias | Não |
| GET | `/items` | Listar itens do cardápio | Não |
| GET | `/items/:id` | Obter item específico | Não |
| POST | `/items` | Criar item (Admin) | Sim (Admin) |
| PUT | `/items/:id` | Atualizar item (Admin) | Sim (Admin) |
| DELETE | `/items/:id` | Deletar item (Admin) | Sim (Admin) |
| PATCH | `/items/:id/status` | Alterar status (Admin) | Sim (Admin) |

### Pedidos `/api/orders`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/` | Criar pedido | Sim |
| GET | `/my-orders` | Meus pedidos | Sim |
| GET | `/:id` | Detalhes do pedido | Sim |
| PATCH | `/:id/cancel` | Cancelar pedido | Sim |
| GET | `/admin/all` | Todos os pedidos (Admin) | Sim (Admin) |
| PATCH | `/:id/status` | Atualizar status (Admin) | Sim (Admin) |

### Reservas `/api/reservations`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| POST | `/` | Criar reserva | Sim |
| GET | `/my-reservations` | Minhas reservas | Sim |
| DELETE | `/:id` | Cancelar reserva | Sim |
| GET | `/admin/all` | Todas as reservas (Admin) | Sim (Admin) |
| PATCH | `/:id/confirm` | Confirmar reserva (Admin) | Sim (Admin) |
| PATCH | `/:id/check-in` | Check-in (Admin) | Sim (Admin) |
| PATCH | `/:id/check-out` | Check-out (Admin) | Sim (Admin) |

### Mesas `/api/tables`

| Método | Endpoint | Descrição | Autenticação |
|--------|----------|-----------|--------------|
| GET | `/` | Listar mesas | Não |
| GET | `/status` | Status das mesas | Não |
| POST | `/` | Criar mesa (Admin) | Sim (Admin) |
| PUT | `/:id` | Atualizar mesa (Admin) | Sim (Admin) |
| PATCH | `/:id/toggle` | Ativar/Desativar (Admin) | Sim (Admin) |
| DELETE | `/:id` | Deletar mesa (Admin) | Sim (Admin) |

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação.

### Como usar:

1. **Login/Registro:** Faça login ou registre-se para obter um token
2. **Autorização:** Inclua o token no header de todas as requisições protegidas:
   ```
   Authorization: Bearer SEU_TOKEN_AQUI
   ```

### Exemplo de Requisição:

```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 👥 Roles de Usuários

- **cliente** - Cliente padrão
- **administrador** - Acesso total
- **gerente** - Gerenciamento operacional
- **garcom** - Atendimento
- **cozinha** - Preparação de pedidos
- **entregador** - Entregas

## 💰 Moeda e Localizações

A API está adaptada para Angola:

- **Moeda:** Kwanzas Angolanos (Kz)
- **Províncias:** Todas as 18 províncias de Angola
- **Métodos de Pagamento:** Dinheiro, Multicaixa, Multicaixa Express, Transferência Bancária, Unitel Money, Atlântico Money
- **Timezone:** WAT (West Africa Time, UTC+1)

## 📦 Estrutura do Projeto

```
api/
├── src/
│   ├── config/         # Configurações (DB, CORS)
│   ├── controllers/    # Controladores (lógica de negócio)
│   ├── middleware/     # Middlewares (auth, error, logger)
│   ├── routes/         # Rotas da API
│   ├── types/          # Tipos TypeScript
│   ├── utils/          # Utilitários (JWT, password)
│   ├── app.ts          # Configuração do Express
│   └── server.ts       # Entry point
├── database/
│   └── schema.sql      # Schema do banco de dados
├── .env.example        # Exemplo de variáveis de ambiente
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testando a API

### Health Check
```bash
curl http://localhost:3001/health
```

### Registrar usuário
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nome_completo": "João Silva",
    "telefone": "+244 923 456 789",
    "email": "joao@email.com",
    "senha": "Senha123"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "joao@email.com",
    "senha": "Senha123"
  }'
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Inicia em modo desenvolvimento com hot-reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Inicia em modo produção
- `npm run lint` - Verifica código com ESLint
- `npm run format` - Formata código com Prettier

## ⚠️ Considerações de Segurança

1. **Troque o JWT_SECRET** em produção por uma chave forte e única
2. **Use HTTPS** em produção
3. **Configure CORS** adequadamente para seu domínio
4. **Não commite** o arquivo `.env` no Git
5. **Valide** sempre os inputs do usuário
6. **Use rate limiting** em produção para prevenir abuso

## 📄 Licença

MIT

## 👨‍💻 Autor

Desenvolvido para Restaurante GHU
