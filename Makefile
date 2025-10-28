.PHONY: help dev prod build start stop restart logs clean db-migrate db-seed db-backup

# Variables
COMPOSE_DEV = docker-compose -f docker-compose.dev.yml
COMPOSE_PROD = docker-compose

help: ## Mostrar ayuda
	@echo "CRM Inmobiliario - Comandos Docker"
	@echo ""
	@echo "Uso: make [comando]"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ===== DESARROLLO =====
dev: ## Iniciar entorno de desarrollo
	@echo "🚀 Iniciando entorno de desarrollo..."
	$(COMPOSE_DEV) up -d
	@echo "✅ Servicios iniciados!"
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:5000"

dev-build: ## Reconstruir e iniciar desarrollo
	@echo "🔨 Reconstruyendo servicios de desarrollo..."
	$(COMPOSE_DEV) up -d --build

dev-stop: ## Detener desarrollo
	$(COMPOSE_DEV) down

dev-logs: ## Ver logs de desarrollo
	$(COMPOSE_DEV) logs -f

# ===== PRODUCCIÓN =====
prod: ## Iniciar entorno de producción
	@echo "🚀 Iniciando entorno de producción..."
	$(COMPOSE_PROD) up -d
	@echo "✅ Servicios iniciados!"
	@echo "Aplicación: http://localhost"

prod-build: ## Build e iniciar producción
	@echo "🔨 Construyendo imágenes de producción..."
	$(COMPOSE_PROD) up -d --build

prod-stop: ## Detener producción
	$(COMPOSE_PROD) down

prod-logs: ## Ver logs de producción
	$(COMPOSE_PROD) logs -f

# ===== GESTIÓN GENERAL =====
stop: ## Detener todos los servicios
	@echo "🛑 Deteniendo servicios..."
	-$(COMPOSE_DEV) down
	-$(COMPOSE_PROD) down

restart: ## Reiniciar servicios
	@make stop
	@make dev

logs: ## Ver logs (desarrollo)
	$(COMPOSE_DEV) logs -f

ps: ## Ver estado de contenedores
	@echo "=== Desarrollo ==="
	$(COMPOSE_DEV) ps
	@echo ""
	@echo "=== Producción ==="
	$(COMPOSE_PROD) ps

# ===== BASE DE DATOS =====
db-migrate: ## Ejecutar migraciones de Prisma
	@echo "📊 Ejecutando migraciones..."
	$(COMPOSE_DEV) exec backend npx prisma migrate deploy

db-seed: ## Seed de datos iniciales
	@echo "🌱 Poblando base de datos..."
	$(COMPOSE_DEV) exec backend npx prisma db seed

db-studio: ## Abrir Prisma Studio
	@echo "🎨 Abriendo Prisma Studio..."
	$(COMPOSE_DEV) exec backend npx prisma studio

db-backup: ## Backup de base de datos
	@echo "💾 Creando backup..."
	$(COMPOSE_DEV) exec mysql mysqldump -u crm_user -pcrm_pass crm_delgado > backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "✅ Backup creado!"

db-shell: ## Conectar a MySQL shell
	$(COMPOSE_DEV) exec mysql mysql -u crm_user -pcrm_pass crm_delgado

# ===== LIMPIEZA =====
clean: ## Limpiar contenedores y volúmenes
	@echo "🧹 Limpiando..."
	-$(COMPOSE_DEV) down -v
	-$(COMPOSE_PROD) down -v
	@echo "✅ Limpieza completada!"

clean-all: ## Limpieza profunda (incluye imágenes)
	@echo "🧹 Limpieza profunda..."
	-$(COMPOSE_DEV) down -v --rmi all
	-$(COMPOSE_PROD) down -v --rmi all
	docker system prune -af
	@echo "✅ Limpieza profunda completada!"

# ===== UTILIDADES =====
setup: ## Configuración inicial
	@echo "⚙️  Configurando proyecto..."
	@if [ ! -f .env ]; then \
		cp .env.docker .env; \
		echo "✅ Archivo .env creado. Por favor editalo antes de continuar."; \
	else \
		echo "⚠️  .env ya existe"; \
	fi

shell-backend: ## Shell en contenedor backend
	$(COMPOSE_DEV) exec backend sh

shell-frontend: ## Shell en contenedor frontend
	$(COMPOSE_DEV) exec frontend sh

test: ## Ejecutar tests (cuando se implementen)
	@echo "🧪 Ejecutando tests..."
	$(COMPOSE_DEV) exec backend pnpm test
	$(COMPOSE_DEV) exec frontend pnpm test

# ===== DEPLOYMENT =====
deploy: ## Deploy a producción (build + start)
	@echo "🚀 Desplegando a producción..."
	@make prod-build
	@echo "✅ Deploy completado!"
	@echo "Recuerda configurar SSL para HTTPS"

ssl-setup: ## Ayuda para configurar SSL
	@echo "📜 Configuración de SSL:"
	@echo ""
	@echo "1. Obtener certificados con Certbot:"
	@echo "   certbot certonly --standalone -d tu-dominio.com"
	@echo ""
	@echo "2. Copiar certificados:"
	@echo "   mkdir -p nginx/ssl"
	@echo "   cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem nginx/ssl/cert.pem"
	@echo "   cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem nginx/ssl/key.pem"
	@echo ""
	@echo "3. Descomentar configuración HTTPS en nginx/nginx.conf"
	@echo ""
	@echo "4. Reiniciar Nginx:"
	@echo "   make prod-restart"
