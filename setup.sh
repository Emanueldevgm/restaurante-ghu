#!/bin/bash

# 🚀 QUICK START - Restaurante GHU
# Execute este script pela primeira vez para setup rápido

echo "🍽️  Restaurante GHU - Setup Rápido"
echo "===================================="
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado!"
    echo "📥 Instale em: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node --version) detectado"

# Setup Backend
echo ""
echo "📦 Setup Backend..."
cd api

if [ ! -f ".env" ]; then
    echo "   → Criando .env..."
    cp .env.example .env
    echo "   ⚠️  Edite api/.env com suas configurações!"
fi

echo "   → Instalando dependências..."
npm install --silent

echo "✅ Backend pronto!"

# Setup Frontend
echo ""
echo "📦 Setup Frontend..."
cd ../restaurante

if [ ! -f ".env" ]; then
    echo "   → Criando .env..."
    cp .env.example .env
fi

echo "   → Instalando dependências..."
npm install --silent

echo "✅ Frontend pronto!"

# Resumo
echo ""
echo "===================================="
echo "✅ Setup concluído com sucesso!"
echo "===================================="
echo ""
echo "📚 Próximos passos:"
echo ""
echo "1. Configure as variáveis de ambiente:"
echo "   $ nano api/.env"
echo "   $ nano restaurante/.env"
echo ""
echo "2. Inicie o Backend:"
echo "   $ cd api && npm run dev"
echo ""
echo "3. Em outro terminal, inicie o Frontend:"
echo "   $ cd restaurante && npm run dev"
echo ""
echo "4. Abra http://localhost:5173"
echo ""
echo "💡 Dicas:"
echo "   - Leia README_SETUP.md para mais detalhes"
echo "   - Leia BEST_PRACTICES.md antes de programar"
echo "   - Use docker-compose up -d para MySQL"
echo ""
echo "🔗 Documentação: INDEX.md"
echo ""
