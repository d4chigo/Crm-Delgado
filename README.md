# CRM Inmobiliario Delgado – Documentación para Tesis

## 1. Resumen Ejecutivo

El CRM Inmobiliario Delgado es una solución integral para la gestión de leads, contactos, clientes, proyectos inmobiliarios, oportunidades de venta, cotizaciones y productividad del equipo comercial. La plataforma contempla un frontend moderno en Next.js, un backend seguro en Node.js/Express con TypeScript, y una base de datos MySQL administrada mediante Prisma ORM. Incorpora integraciones clave: autenticación JWT, consulta de DNI (RENIEC) vía API externa, Google Calendar (OAuth2) para sincronización de eventos, asistente inteligente (IA) y canal de voz en tiempo real vía WebSocket.

Objetivos centrales:
- Estandarizar y agilizar el ciclo comercial inmobiliario (captura, calificación, seguimiento, cierre).
- Centralizar información de clientes y oportunidades, con trazabilidad y métricas.
- Integrar herramientas de productividad (calendario, voz, asistente) para mejorar conversión y eficiencia.
- Proveer una arquitectura escalable, segura y mantenible para el crecimiento del negocio.

---

## 2. Alcance y Metas del Proyecto

- Gestión de Contactos/Leads/Clientes con pipeline y priorización.
- Administración de Proyectos inmobiliarios y asociación con clientes.
- Oportunidades y etapas (pipeline) hasta cierre (ganado/perdido).
- Cotizaciones inmobiliarias con varios tipos de cuota y cálculos financieros.
- Integración con Google Calendar para autenticación y sincronización de eventos.
- Búsqueda de datos por DNI (RENIEC) para autocompletar registros.
- Panel de métricas (analytics) para seguimiento gerencial.
- Autenticación y autorización por roles.
- Módulo de asistente con IA y canal de voz en tiempo real.

---

## 3. Arquitectura del Sistema

- Frontend: Next.js 15 con TypeScript, App Router, shadcn/ui, diseño responsivo.
- Backend: Node.js + Express (TypeScript), arquitectura por capas (routes, controllers, services, middlewares, validators, utils).
- Base de datos: MySQL gestionada con Prisma ORM (migraciones versionadas y seed).
- Comunicación:
  - HTTP/REST para API.
  - WebSocket para canal de voz en tiempo real (`/api/voice`).
- Infraestructura y DevOps:
  - Docker Compose para entornos de desarrollo y producción.
  - Nginx como reverse proxy en producción.

Estructuras relevantes:
- Cliente: `client/` (páginas en `app/`, componentes en `components/`, lógica en `features/`, servicios API en `services/`).
- Servidor: `server/` (rutas en `src/routes`, controladores en `src/controllers`, servicios en `src/services`, validadores en `src/validators`, Prisma en `prisma/`).

---

## 4. Módulos y Funcionalidades

- Autenticación (JWT)
  - Registro, login, perfil.
  - Tokens con expiración (24h configurable).
  - Roles: ADMIN, SUPERVISOR, AGENTE, ASISTENTE.

- Contactos, Leads y Clientes
  - CRUD completo de contactos.
  - Conversión a lead y a cliente; asociación lead-cliente.
  - Atributos: prioridad, estado de lead, fuente, intereses, notas, presupuesto, probabilidad, localización, etiquetas.
  - Estadísticas de contactos y listado de recientes.

- Etiquetas
  - Gestión de etiquetas y asignación a contactos y proyectos.

- Proyectos inmobiliarios
  - CRUD de proyectos, asignación de etiquetas y asociación con clientes.
  - Estados: DISPONIBLE, RESERVADO, VENDIDO, CONSTRUCCION, FINALIZADO.

- Oportunidades
  - Seguimiento por etapas del pipeline: LEAD, CONTACTO, VISITA, NEGOCIACION, CIERRE, GANADO, PERDIDO.
  - Valor, probabilidad, próxima acción, notas, última actividad.

- Cotizaciones
  - Generación y gestión de cotizaciones con cálculos: cuota mensual estimada, interés, total a pagar.
  - Tipos de cuota: FIJA, FLEXIBLE, FLEXIBLE_ESPECIAL (postergables, dobles, cambio de fecha, monto manual).
  - Estados: BORRADOR, ENVIADA, ACEPTADA, RECHAZADA, VENCIDA.

- Integración DNI (RENIEC)
  - Consulta por número de DNI vía API externa (requiere token `.env`).

- Google Calendar
  - OAuth2: flujo de autorización, callback, estado de autenticación, logout.
  - Listado y sincronización de eventos con Google Calendar.

- Analytics
  - Métricas de tablero: KPIs y estadísticas para toma de decisiones.

- Asistente e IA
  - Endpoint para consultas al asistente.
  - Servicio de IA disponible en servidor (`@google/genai`).

- Voz en tiempo real
  - Servidor WebSocket en `/api/voice` y controlador dedicado para sesiones de voz.

---

## 5. Modelo de Datos (Prisma)

Archivo: `server/prisma/schema.prisma`

Entidades principales:
- `Usuario`: id, nombre, email, password, rol, avatar, teléfono, activo, timestamps. Relaciones con contactos, proyectos y oportunidades.
- `Contacto`: datos personales y comerciales, tipo (CONTACTO, LEAD, CLIENTE), estado de lead, prioridad, probabilidad, etiquetas, proyectos, oportunidades, cotizaciones. Índices por usuario, tipo, correo, estadoLead, prioridad.
- `Etiqueta`: taxonomía aplicable a contactos y proyectos.
- `ContactoEtiqueta`: relación M:N contacto-etiqueta.
- `LeadCliente`: relación M:N entre un lead y un cliente.
- `OportunidadCliente`: oportunidad asociada a cliente y usuario, con etapa de pipeline y métricas de valor/probabilidad.
- `Proyecto`: portafolio de proyectos inmobiliarios con estado y relaciones.
- `ProyectoEtiqueta`: relación M:N proyecto-etiqueta.
- `ProyectoCliente`: relación M:N proyecto-cliente con notas.
- `Cotizacion`: metadatos, cálculos financieros y estado, asociada a un contacto.

Enums destacados: `Rol`, `Sexo`, `TipoContacto`, `EstadoLead`, `Prioridad`, `EstadoProyecto`, `EtapaPipeline`, `TipoCuota`, `EstadoCotizacion`.

---

## 6. API – Endpoints Principales

Base URL por defecto: `http://localhost:5000/api`

- Salud del sistema
  - `GET /health`

- Autenticación (`/auth`)
  - `POST /registro`
  - `POST /login`
  - `GET /perfil` (requiere JWT)

- Contactos (`/contactos`, requiere JWT)
  - `GET /` (filtros)
  - `GET /estadisticas`
  - `GET /recientes`
  - `GET /:id`
  - `POST /` (crear)
  - `POST /importar/google`
  - `PUT /:id` (actualizar)
  - `DELETE /:id` (eliminar)
  - `POST /:id/convertir-lead`
  - `POST /convertir-leads/masivo`
  - `POST /:id/convertir-cliente`
  - `POST /:id/clientes` (asociar)
  - `GET /:id/clientes`
  - `PUT /:id/clientes/:clienteId`
  - `DELETE /:id/clientes/:clienteId`

- Oportunidades (`/oportunidades`, requiere JWT)
  - `GET /estadisticas`
  - `GET /cliente/:clienteId`
  - `GET /`
  - `GET /:id`
  - `POST /`
  - `PUT /:id`
  - `PATCH /:id/etapa`
  - `DELETE /:id`

- Proyectos (`/proyectos`, requiere JWT)
  - `GET /cliente/:clienteId`
  - `GET /`
  - `GET /:id`
  - `POST /`
  - `PUT /:id`
  - `DELETE /:id`
  - `PUT /:id/etiquetas`
  - `POST /:id/clientes`
  - `PUT /:id/clientes/:clienteId`
  - `DELETE /:id/clientes/:clienteId`

- Cotizaciones (`/cotizaciones`, requiere JWT)
  - `POST /`
  - `GET /`
  - `GET /:id`
  - `GET /contacto/:contactoId`
  - `PUT /:id`
  - `PATCH /:id/estado`
  - `DELETE /:id`

- DNI (`/dni`)
  - `GET /test` (pública de diagnóstico)
  - `GET /:numero` (requiere JWT) – consulta RENIEC vía API externa

- Google Calendar (`/calendar`)
  - `GET /auth-url`
  - `GET /callback`
  - `POST /events`
  - `POST /auth-status`
  - `POST /logout`
  - `POST /sync`

- Analytics (`/analytics`)
  - `GET /metrics`
  - `GET /estadisticas`

- Assistant (`/assistant`)
  - `POST /ask`

- Voz WebSocket
  - `ws://localhost:5000/api/voice`

Más detalle en `server/README.md`.

---

## 7. Frontend – Estructura y UX

- Tecnologías: Next.js 15, TypeScript, shadcn/ui, Lucide icons, Vercel Analytics.
- App Router con secciones: `dashboard/`, `login/`, páginas y layouts reutilizables.
- Componentes modulares por feature (`components/features/*`) y UI base (`components/ui/*`).
- Hooks y servicios de API centralizados.
- Estilo visual: primario #FCBA00, secundario #303030; foco en legibilidad y acciones claras.

Referencia: `client/ESTRUCTURA.md`.

---

## 8. Seguridad y Cumplimiento

- HTTP headers endurecidos con Helmet.
- CORS con origen configurable por `.env`.
- Rate limit para mitigar abuso.
- Hash de contraseñas con bcrypt (rounds configurables).
- JWT con expiración configurable y verificación en middleware.
- Validación de entrada con Zod en endpoints críticos.
- Control de acceso por roles a nivel de servicios/controladores.

---

## 9. Integraciones Externas

- API DNI (RENIEC)
  - Requiere `DNI_API_TOKEN` en `.env`. Uso para autocompletado de datos de contactos.

- Google Calendar
  - OAuth2. Ver guías: `GOOGLE_OAUTH_SETUP.md` y `GOOGLE_CALENDAR_SETUP.md`.

- IA (Google GenAI)
  - Dependencia `@google/genai`; ver `src/config/genai.ts` y `assistant.controller.ts`.

- Voz
  - Ver `VOICE_SETUP.md` y `src/controllers/voice.controller.ts` para detalles del canal WebSocket.

---

## 10. Despliegue y Ejecución

Guía completa: `GUIA-EJECUCION.md` y `DOCKER.md`.

Inicio rápido (desarrollo con Docker):
```bash
# Copiar variables de entorno
Copy-Item .env.docker .env    # PowerShell (Windows)

# Levantar stack dev
docker-compose -f docker-compose.dev.yml up -d

# Migraciones
docker-compose -f docker-compose.dev.yml exec backend npx prisma migrate deploy

# Seed
docker-compose -f docker-compose.dev.yml exec backend npx prisma db seed
```

Accesos por defecto:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Adminer: http://localhost:8080

Producción:
- Usar `docker-compose up -d --build` con Nginx como reverse proxy.
- Configurar SSL/HTTPS y secretos robustos (ver `DOCKER.md`).

---

## 11. Variables de Entorno Clave

```env
# Servidor
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=tu_secret_unico_y_seguro
JWT_EXPIRES_IN=24h

# Base de datos
DATABASE_URL="mysql://crm_user:crm_pass@mysql:3306/crm_delgado"
SHADOW_DATABASE_URL="mysql://crm_user:crm_pass@mysql:3306/crm_delgado_shadow"

# Seguridad
BCRYPT_ROUNDS=10

# Integraciones
DNI_API_TOKEN=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_REDIRECT_URI=""
```

---

## 12. Flujo de Usuario (alto nivel)

1. Usuario se registra o inicia sesión y recibe JWT.
2. Accede al Dashboard y ve métricas y leads recientes.
3. Gestiona contactos/leads/clientes, asigna etiquetas y crea oportunidades.
4. Genera cotizaciones y las comparte con el cliente.
5. Agenda y sincroniza eventos con Google Calendar.
6. Usa el asistente/voz para soporte y productividad.
7. Revisa métricas y ajusta estrategias.

---

## 13. Métricas y Analítica

- KPIs de actividad comercial (vistas en `GET /analytics/metrics`).
- Estadísticas agregadas para contactos y oportunidades (`/contactos/estadisticas`, `/oportunidades/estadisticas`).

---

## 14. Calidad, Pruebas y Datos Iniciales

- Migraciones y seed con Prisma: creación de usuario ADMIN inicial y etiquetas base.
- Uso de `Prisma Studio` para ver datos (http://localhost:5555 en modo dev).
- Validación de entrada con Zod.

---

## 15. Roadmap (propuesto)

- Automatizaciones: recordatorios de seguimiento y tareas.
- Integración de correo y WhatsApp para comunicación omnicanal.
- Reportería avanzada y dashboards personalizados.
- i18n y accesibilidad.
- Pruebas unitarias e integración continua (CI).

---

## 16. Créditos y Licencia

- Autoría y mantenimiento: Equipo Delgado Propiedades.
- Este proyecto fue desarrollado en español para facilitar mantenimiento y adopción.
- Licencia: Definir según el contexto académico/organizacional.
