# CRM Delgado - Sistema de Gestión de Relaciones

Sistema CRM empresarial con gestión de leads, oportunidades, cotizaciones y reportes avanzados.

## 🚀 Inicio Rápido

### Desarrollo
```bash
git clone <repo-url>
cd Crm-Delgado
cp .env.example .env
docker-compose -f docker-compose.dev.yml up -d
```

### Producción
```bash
docker-compose up -d
```

Ver [PRODUCCION.md](./PRODUCCION.md) para detalles completos.

## 🎯 Características

- ✅ Gestión de Leads y Clientes
- ✅ Pipeline de Ventas
- ✅ Cotizaciones y Proyectos
- ✅ Reportes Avanzados
- ✅ Notificaciones en Tiempo Real
- ✅ Asistente IA (Gemini)
- ✅ Autenticación JWT

## 🛠️ Stack

| Componente | Tecnología |
|-----------|-----------|
| Frontend | Next.js 14 + React 18 |
| Backend | Node.js + Express + Prisma |
| Base de Datos | MySQL 8.0 |
| Asistente | Gemini API |
| Infraestructura | Docker + Docker Compose |

## 📊 Reportes

1. **Previsión Financiera** - Ingresos esperados (30/60/90 días)
2. **Cuello de Botella** - Identificación de etapas lentas
3. **Conversión por Origen** - Análisis de fuentes
4. **Desempeño del Asesor** - Métricas de vendedores

## 🌐 URLs

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:5000 |
| Adminer | http://localhost:8080 |

## 📁 Estructura

```
├── server/          # Backend API
├── client/          # Frontend Next.js
├── botcrm/          # Asistente IA
└── database/        # Scripts SQL
```

## 🔐 Seguridad

- JWT para autenticación
- Contraseñas hasheadas
- CORS configurado
- Variables de entorno protegidas

## 📞 Soporte

Para soporte técnico, contactar al equipo de desarrollo.
