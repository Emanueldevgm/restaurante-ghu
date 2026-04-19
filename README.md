# Restaurante GHU

Sistema de gestão para restaurante com backend REST em Node.js/TypeScript e frontend em React + Vite.

## Visão geral

Este projeto contém duas aplicações principais:

- `api/` - backend Express com TypeScript, autenticação JWT, MySQL e rotas para menu, pedidos, reservas, entregas, avaliações e administração.
- `restaurante/` - frontend React + Vite, com interface para clientes, garçom, cozinha, entregador e administração.

Também há um arquivo `docker-compose.yml` para rodar o banco de dados MySQL e o PHPMyAdmin como ambiente de desenvolvimento.

## Tecnologias

- Backend: Node.js, Express, TypeScript, MySQL, JWT, Zod
- Frontend: React, Vite, TypeScript, Tailwind CSS, Radix UI, React Router
- Ferramentas: Docker Compose, ESLint, Prettier, Vitest

## Pré-requisitos

- Node.js 18+ ou Bun
- npm ou Bun
- Docker e Docker Compose (opcional, mas recomendado para fácil configuração do banco)
- MySQL 8.0+ (se não usar Docker)

## Instruções rápidas

### 1. Iniciar com Docker

Na raiz do projeto:

```bash
docker-compose up -d
```

Isso irá iniciar:

- MySQL na porta `3306`
- PHPMyAdmin na porta `8081`

### 2. Backend

```bash
cd api
npm install
cp .env.example .env
```

Edite `.env` para ajustar as variáveis de ambiente, especialmente a conexão com o MySQL.

Para rodar em desenvolvimento:

```bash
npm run dev
```

Para compilar e iniciar em produção:

```bash
npm run build
npm start
```

### 3. Frontend

```bash
cd restaurante
npm install
cp .env.example .env
```

Edite `.env` para ajustar a URL do backend, geralmente:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

Para rodar em desenvolvimento:

```bash
npm run dev
```

Para compilar para produção:

```bash
npm run build
```

## Variáveis de ambiente importantes

### Backend (`api/.env.example`)

- `NODE_ENV` - ambiente (`development` / `production`)
- `PORT` - porta da API (ex.: `3001`)
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `JWT_SECRET` - segredo para geração de tokens
- `CORS_ORIGIN` - origens permitidas para requisições
- `UPLOAD_PATH` - pasta de uploads

### Frontend (`restaurante/.env.example`)

- `VITE_API_BASE_URL` - URL base da API
- `VITE_APP_NAME` - nome do app
- `VITE_APP_VERSION` - versão do app

## Estrutura do projeto

```text
.
├── api/                  # Backend Express + TypeScript
│   ├── src/
│   ├── database/
│   └── package.json
├── restaurante/          # Frontend React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
├── docker-compose.yml    # MySQL + PHPMyAdmin
└── Documentos/           # Documentação do projeto
```

## Comandos úteis

### Backend

- `npm run dev` - iniciar backend em modo desenvolvimento
- `npm run build` - compilar TypeScript
- `npm start` - iniciar backend compilado
- `npm run lint` - verificar lint
- `npm run format` - formatar código

### Frontend

- `npm run dev` - iniciar frontend em modo desenvolvimento
- `npm run build` - gerar build de produção
- `npm run preview` - pré-visualizar build
- `npm run lint` - verificar lint
- `npm test` - rodar testes

## Observações

- Se usar Docker, os dados do MySQL são preservados no volume `mysql_data`.
- O backend já contém seed e schema em `api/database/schema.sql`.
- Consulte `Documentos/` para guias adicionais, como setup, autenticação e troubleshooting.

## Licença

Projeto MIT.
