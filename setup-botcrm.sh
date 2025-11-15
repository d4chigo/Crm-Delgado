#!/bin/bash

# Script para compilar y preparar el botcrm
# Uso: bash setup-botcrm.sh

set -e

echo "🤖 Compilando BotCRM..."
echo ""

# Cambiar a directorio botcrm
cd botcrm

# Instalar dependencias si no existen
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependencias del botcrm..."
    npm install
fi

# Compilar botcrm
echo "🔨 Compilando botcrm..."
npm run build

# Copiar dist a client/public/botcrm
echo "📁 Copiando archivos compilados..."
mkdir -p ../client/public/botcrm
cp -r dist/* ../client/public/botcrm/

echo ""
echo "✅ BotCRM compilado y copiado exitosamente!"
echo ""
echo "📍 Archivos compilados en: client/public/botcrm/"
echo ""
echo "🚀 Ahora puedes ejecutar: make dev"
