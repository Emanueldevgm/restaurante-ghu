#!/bin/bash

# 🚀 SETUP RÁPIDO - Sistema de Autenticação Restaurante GHU
# Execute este script para configurar tudo automaticamente

echo "🍽️  Restaurante GHU - Setup de Autenticação"
echo "==========================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -d "api" ] || [ ! -d "restaurante" ]; then
    echo "❌ Execute este script do diretório raiz do projeto"
    exit 1
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "📥 Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Setup Backend
echo ""
echo "📦 Configurando Backend..."
cd api

if [ ! -f ".env" ]; then
    echo "   → Criando .env..."
    cp .env.example .env
    echo "   ⚠️  IMPORTANTE: Edite api/.env com suas credenciais do banco!"
fi

echo "   → Instalando dependências..."
npm install --silent

echo "✅ Backend configurado!"

# Setup Frontend
echo ""
echo "📦 Configurando Frontend..."
cd ../restaurante

if [ ! -f ".env" ]; then
    echo "   → Criando .env..."
    cp .env.example .env 2>/dev/null || echo "   ℹ️  .env.example não encontrado (opcional)"
fi

echo "   → Instalando dependências..."
npm install --silent

echo "✅ Frontend configurado!"

# Instruções finais
echo ""
echo "🎉 Setup concluído!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1. 🗄️  CONFIGURAR BANCO DE DADOS:"
echo "   - Execute o dump SQL: database/schema.sql"
echo "   - Execute o seed: database/seed_test_users.sql"
echo ""
echo "2. 🚀 INICIAR SERVIÇOS:"
echo "   Terminal 1 - Backend:  cd api && npm run dev"
echo "   Terminal 2 - Frontend: cd restaurante && npm run dev"
echo ""
echo "3. 🧪 TESTAR AUTENTICAÇÃO:"
echo "   - Acesse: http://localhost:5173/auth"
echo "   - Use as credenciais do README_AUTH.md"
echo ""
echo "📖 Leia o README_AUTH.md para mais detalhes!"
echo ""
echo "✨ Sistema pronto para desenvolvimento!"