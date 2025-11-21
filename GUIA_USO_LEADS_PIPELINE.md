# 📱 GUÍA DE USO: FLUJO LEADS → OPORTUNIDADES

## Para el Usuario Final

---

## 1️⃣ CREAR UN LEAD

### Opción A: Desde Contactos
```
Dashboard → Contactos → Nuevo Contacto
├─ Nombre: Juan García
├─ Correo: juan@example.com
├─ Teléfono: +51 999 123 456
├─ Tipo: LEAD ⭐ (IMPORTANTE)
└─ Guardar

✅ Lead creado y guardado en sistema
   Estado: NUEVO (no contactado aún)
```

### Opción B: Desde Formulario Web
```
Publicó: http://localhost:8081 → Formulario de contacto
Cliente llena datos
↓
Se crea Lead automáticamente
↓
Se le asigna al equipo
```

---

## 2️⃣ ALERTA AUTOMÁTICA (después de 24 horas)

```
Sistema automáticamente busca leads sin contactar hace 24+ horas
↓
Crea ALERTA en el Dashboard
```

### Ver la Alerta
```
Dashboard → Widget "Alertas de Leads"
├─ Muestra: Total, Pendientes, Urgentes
├─ Color rojo si es urgente (< 6 horas)
└─ Click: Ver detalles en /dashboard/alertas
```

**Ejemplo:**
```
┌─────────────────────┐
│ ⏰ Alertas de Leads │
├─────────────────────┤
│ Pendientes: 3       │
│ Urgentes: 1 🚨      │
└─────────────────────┘
```

---

## 3️⃣ CONTACTAR AL LEAD

### Paso 1: Hacer el Contacto
```
Llama por teléfono → Establece primera comunicación
O
Envía email → Responde consulta
O
Cualquier otro contacto
```

### Paso 2: Registrar en el Sistema

**Opción A: Completar Alerta (Recomendado)**
```
Dashboard → Alertas de Leads → Alerta del lead
├─ Ver información del lead (nombre, teléfono, email)
├─ Botón: "Marcar como Contactado"
├─ Campo: Notas (opcional)
│  Ejemplo: "Llamada exitosa, muy interesado en proyecto A"
└─ Guardar

✅ AUTOMÁTICAMENTE:
   1. Lead pasa a estado CONTACTADO
   2. Se crea OPORTUNIDAD en etapa CONTACTO
   3. Aparece en Pipeline de Ventas
   4. Alerta se marca como completada
```

**Opción B: Manual desde Contactos**
```
Dashboard → Contactos → Buscar Lead
├─ Click en el lead
├─ Editar → Estado del Lead
├─ Cambiar a: CONTACTADO
└─ Guardar

Luego:
Pipeline → Crear Oportunidad manualmente
├─ Título: Oportunidad - Juan García
├─ Valor estimado: S/ 50,000
├─ Probabilidad: 25%
└─ Guardar
```

---

## 4️⃣ SEGUIMIENTO EN EL PIPELINE

### Ver el Deal en Pipeline
```
Dashboard → Pipeline de Ventas
└─ Columna: CONTACTO
   └─ Tarjeta del lead (ahora es oportunidad)
      ├─ Cliente: Juan García
      ├─ Proyecto: Proyecto A
      ├─ Valor: S/ 50,000
      ├─ Probabilidad: 25%
      └─ Última actividad: [fecha de hoy]
```

### Mover en Pipeline (A Medida que Avanza)

**Después de Visita:**
```
Click en tarjeta → Editar Oportunidad
├─ Cambiar Etapa a: VISITA
├─ Actualizar Notas: "Visitó propiedad, muy satisfecho"
└─ Guardar

✅ AUTOMÁTICAMENTE:
   Lead.estado se actualiza a: CONTACTADO (sigue igual)
   (Sincronización automática)
```

**En Negociación:**
```
Cambiar Etapa a: NEGOCIACIÓN
├─ Actualizar Probabilidad: 50%
├─ Próxima Acción: "Enviar documentos"
└─ Guardar
```

**En Cierre:**
```
Cambiar Etapa a: CIERRE
├─ Actualizar Probabilidad: 75%
├─ Próxima Acción: "Esperar firma de contrato"
└─ Guardar
```

**GANADO:**
```
Cambiar Etapa a: GANADO
├─ Probabilidad: 100%
├─ Notas: "Cliente firmó contrato"
└─ Guardar

✅ AUTOMÁTICAMENTE:
   Lead.estado → CONVERTIDO ✅
   Lead.fechaConversion → [fecha de hoy]
   
   El lead ahora es un CLIENTE de éxito
```

---

## 5️⃣ PERDER UN LEAD

```
Si en cualquier momento el cliente no está interesado:

Pipeline → Cambiar Etapa a: PERDIDO
├─ Probabilidad: 0%
├─ Notas: "No tiene presupuesto" / "Se fue a competencia"
└─ Guardar

✅ AUTOMÁTICAMENTE:
   Lead.estado → DESCALIFICADO ❌
   
   Se descarta del pipeline pero queda registrado en histórico
```

---

## 📊 VER ESTADÍSTICAS DE CONVERSIÓN

```
Dashboard → Widget "Conversión de Leads"
└─ Muestra:
   ├─ Tasa de Conversión: 60% (leads convertidos a oportunidades)
   ├─ Leads Totales: 50
   ├─ Convertidos: 30
   ├─ Sin Convertir: 20
   ├─ Ganados: 8
   └─ Valor Total Ganado: S/ 150,000
```

**¿Qué significan?**
- **60%**: De 50 leads, 30 fueron convertidos a oportunidades
- **20 sin convertir**: Leads que aún no han sido contactados
- **8 ganados**: Deals que fueron cerrados exitosamente
- **S/ 150,000**: Ingresos generados desde leads

---

## 🎯 FLUJO COMPLETO (EJEMPLO REAL)

### Día 1: Lead Entra al Sistema
```
Cliente: Juan García
Fuente: Formulario web
Estado: NUEVO
Fecha: 2024-01-20
```

### Día 2: Email de seguimiento
```
Envié email al cliente
Registrado en notas
```

### Día 3: Sin respuesta
```
Alerta automática en dashboard
"1 día sin respuesta"
```

### Día 4: Contacto Establecido ☎️
```
Cliente responde al email
Coordinamos visita
Status: Cambiar a CONTACTADO
Crear Oportunidad: S/ 50,000 | 25% probable
```

### Día 10: Primera Visita ✓
```
Cliente visita propiedad
Muy interesado
Etapa: CONTACTO → VISITA
Probabilidad: 25% → 50%
```

### Día 15: Envío de Propuesta
```
Enviamos documentos y propuesta
Etapa: VISITA → NEGOCIACIÓN
Probabilidad: 50% → 75%
Próxima Acción: "Esperar feedback"
```

### Día 20: Acuerdo Alcanzado
```
Cliente acepta términos
Etapa: NEGOCIACIÓN → CIERRE
Notas: "Listo para firmar"
```

### Día 25: CERRADO ✅
```
Contrato firmado
Etapa: CIERRE → GANADO
Lead ahora es CLIENTE
Ingresos: S/ 50,000 registrados
```

---

## 🔍 ENCUENTRA LEADS SIN CONVERTIR

```
Dashboard → Widget "Conversión de Leads"
├─ Si muestra "20 sin convertir"
└─ Click: Ver detalles

O

Dashboard → Contactos
├─ Filtro: Tipo = LEAD
├─ Filtro: Estado = NUEVO
└─ Estos son los leads que necesitan acción
```

---

## ⚠️ CASOS ESPECIALES

### ¿Qué pasa si no contacto a un lead?

```
Sistema monitorea automáticamente:
├─ 24h sin contactar → Alerta NUEVA
├─ 48h sin contactar → Alerta REPETIDA
└─ +72h sin contactar → Alerta URGENTE (rojo)

Aparece en el Widget de alertas
→ Prioridad máxima
```

### ¿Puedo crear una Oportunidad sin Lead?

```
Sí, puedes:
├─ No necesita ser necesariamente un lead
├─ Pero si empieza como LEAD es más fácil el seguimiento
└─ Recomendado: Crear Lead primero, luego Oportunidad

Flujo recomendado:
LEAD (NUEVO) → ALERTA → CONTACTADO + OPORTUNIDAD
```

### ¿Qué pasa con un Lead que no se convierte?

```
Si no quiere continuar:
├─ Marcar como PERDIDO
├─ Estado Lead → DESCALIFICADO
├─ Queda en histórico para futuro seguimiento
└─ No aparece en estadísticas activas
```

---

## 💡 CONSEJOS PRÁCTICOS

### 1. Contactar rápidamente
```
Cuanto antes contactes un lead:
├─ Mayor probabilidad de conversión
├─ No esperar a que sea URGENTE
└─ Idealmente dentro de 24h
```

### 2. Mantener notas actualizadas
```
Cada vez que hables con el cliente:
├─ Actualiza la Oportunidad
├─ Escribe notas sobre la conversación
├─ Actualiza probabilidad según progreso
└─ Esto ayuda al seguimiento
```

### 3. Usar el Pipeline regularmente
```
Dedica 15 min diarios a:
├─ Revisar Alertas
├─ Revisar Oportunidades vencidas
├─ Mover oportunidades de etapa
└─ Actualizar probabilidades
```

### 4. Monitorear Estadísticas
```
Semanalmente:
├─ Revisa Tasa de Conversión
├─ Identifica leads rezagados
├─ Celebra leads convertidos
└─ Analiza qué funciona mejor
```

---

## 📱 EN TU MÓVIL (Si usas Mobile CRM)

```
App Móvil → Contactos → Lead
├─ Ver información rápida
├─ Registrar llamada/email
├─ Cambiar estado
└─ Sincroniza automáticamente
```

---

## ❓ PREGUNTAS FRECUENTES

### ¿Los leads se convierten automáticamente?
```
No, necesitas marcarlo como CONTACTADO
Una vez hecho, la Oportunidad se crea automáticamente
```

### ¿Qué pasa si pierdo una oportunidad?
```
Marca como PERDIDO en Pipeline
El lead se descalifica automáticamente
Puedes intentar reactivarlo después
```

### ¿Puedo mover un lead entre estados?
```
Sí, edita el Contacto y cambia Estado del Lead
Esto afectará a sus Oportunidades asociadas
```

### ¿Cuántas oportunidades puede tener un lead?
```
Una por vez (oportunidades activas)
Históricamente puede tener varias
Pero solo la más reciente está activa
```

### ¿Dónde veo el valor total ganado?
```
Dashboard → Widget "Conversión de Leads"
├─ Muestra: "Valor Ganado: S/ 150,000"
├─ O en Pipeline
└─ O en Reportes → Análisis
```

---

## 🎓 RESUMEN DEL FLUJO

```
┌─────────────────────────────────────────┐
│ 1. LEAD (NUEVO)                        │
│    ↓ [Espera 24h]                      │
│ 2. ALERTA en Dashboard                 │
│    ↓ [Contactas al cliente]            │
│ 3. CONTACTADO + OPORTUNIDAD (CONTACTO) │
│    ↓ [Mueves en pipeline]              │
│ 4. OPORTUNIDAD evoluciona              │
│    CONTACTO → VISITA → NEGOCIACIÓN     │
│    ↓                                   │
│ 5. CIERRE o GANADO/PERDIDO             │
│    ↓                                   │
│ 6. CLIENTE (si GANADO) o DESCALIFICADO │
└─────────────────────────────────────────┘
```

---

## 🚀 EMPEZAR AHORA

```
1. Ve a Dashboard
2. Busca el Widget "Alertas de Leads"
3. Si hay alertas pendientes, completa la más urgente
4. Automáticamente verás que:
   - Lead se marca CONTACTADO
   - Oportunidad se crea
   - Aparece en Pipeline
5. ¡A cerrar deals!
```

---

*Integración Leads ↔ Pipeline: Simplificando el seguimiento de clientes potenciales*
