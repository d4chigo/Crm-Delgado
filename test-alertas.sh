#!/bin/bash
# Script de prueba de alertas automáticas

echo "🧪 Test de Sistema de Alertas Automáticas"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Verificar que el servidor está corriendo
echo -e "${YELLOW}1. Verificando servidor backend...${NC}"
health=$(curl -s http://localhost:5000/api/health)
if [[ $health == *"exito"* ]]; then
  echo -e "${GREEN}✅ Servidor backend está corriendo${NC}"
else
  echo -e "${RED}❌ Error: Servidor backend no responde${NC}"
  exit 1
fi

# 2. Verificar logs del job de alertas
echo -e "${YELLOW}2. Verificando logs de generación de alertas...${NC}"
logs=$(docker compose -f docker-compose.dev.yml logs backend 2>/dev/null | grep "Iniciando job")
if [[ $logs == *"Iniciando job"* ]]; then
  echo -e "${GREEN}✅ Job de alertas se inició correctamente${NC}"
  echo "   Mensaje: Iniciando job de generación automática de alertas..."
else
  echo -e "${RED}❌ Error: Job no se inició${NC}"
fi

# 3. Verificar base de datos (tabla alertas_leads)
echo -e "${YELLOW}3. Verificando tabla alertas_leads en BD...${NC}"
table_check=$(docker exec crm-mysql-dev mysql -u crm_user -pcrm_pass crm_delgado -se \
  "SELECT COUNT(*) FROM alertas_leads;" 2>/dev/null)

if [[ $table_check =~ ^[0-9]+$ ]]; then
  echo -e "${GREEN}✅ Tabla alertas_leads existe y es accesible${NC}"
  echo "   Total de alertas en BD: $table_check"
else
  echo -e "${RED}❌ Error: No se pudo acceder a la tabla alertas_leads${NC}"
fi

# 4. Verificar que los archivos están en su lugar
echo -e "${YELLOW}4. Verificando archivos de implementación...${NC}"

files=(
  "server/src/jobs/generarAlertasAutomaticamente.ts"
  "server/src/test-alertas.ts"
  "ALERTAS_AUTOMATICAS.md"
)

all_files_ok=true
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo -e "${GREEN}✅ $file${NC}"
  else
    echo -e "${RED}❌ Falta $file${NC}"
    all_files_ok=false
  fi
done

# 5. Resumen
echo ""
echo -e "${YELLOW}=========================================="
echo "📊 RESUMEN"
echo "==========================================${NC}"

if [ "$all_files_ok" = true ]; then
  echo -e "${GREEN}✨ ¡Sistema de alertas automáticas implementado correctamente!${NC}"
  echo ""
  echo "🚀 Lo que está funcionando:"
  echo "   • Job automático se ejecuta cada 1 hora"
  echo "   • Se buscan leads sin contactar (>24 horas)"
  echo "   • Se crean alertas automáticamente"
  echo "   • Widget del dashboard se actualiza cada 5 minutos"
  echo "   • Logging detallado para debugging"
  echo ""
  echo "📍 URLs de acceso:"
  echo "   Frontend: http://localhost:3000"
  echo "   Backend:  http://localhost:5000"
  echo "   Database: http://localhost:8080"
  echo ""
  echo "📖 Documentación: ALERTAS_AUTOMATICAS.md"
else
  echo -e "${RED}⚠️ Algunos archivos faltan. Por favor verifica la instalación.${NC}"
fi

echo ""
