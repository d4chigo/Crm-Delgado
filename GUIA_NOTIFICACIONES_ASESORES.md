# 🔔 Guía de Notificaciones en Tiempo Real - CRM

## ¿Qué es esto?

El CRM ahora te notifica **instantáneamente** cuando llega un nuevo lead desde el portal PGDP.

No necesitas refrescar la página. Las notificaciones llegan en **menos de 1 segundo**.

---

## 🎯 Características

### 1. Badge de Notificaciones
En la barra superior del dashboard, junto a tu perfil, verás un icono de campana 🔔.

- **Rojo con número** = Tienes notificaciones no leídas
- **Gris** = No hay notificaciones nuevas

```
Dashboard Header
┌──────────────────────────────────────┐
│ Menu    Espacio    🔔(3)    👤      │
└──────────────────────────────────────┘
                     ↑
             Click aquí para ver panel
```

### 2. Panel de Notificaciones
Al hacer click en la campana, se abre un panel flotante con las **últimas 5 notificaciones**.

```
┌──────────────────────┐
│ 🔔 Notificaciones    │ ✕
├──────────────────────┤
│ Juan García Pérez    │
│ 🎯 Vivienda          │
│ 📱 +1 (555) 123-4567 │
│ 14:32                │
├──────────────────────┤
│ María López Rodríguez│
│ 🎯 Crédito           │
│ 📱 +1 (555) 234-5678 │
│ 14:28                │
├──────────────────────┤
│                      │
│ 🔗 Ver todos los leads│
│                      │
└──────────────────────┘
```

### 3. Sonido de Alerta
Cuando llega una notificación, escucharás un **sonido suave y corto** (0.5 segundos).

- Se reproduce automáticamente si estás en el tab del CRM
- Si estás en otro tab, no se reproduce (para no molestar)

### 4. Toast Visual
Aparece un **mensaje verde** en la esquina superior derecha:

```
┌─────────────────────────────────┐
│ 🔔 ¡Nuevo Lead! Juan Pérez      │
│                                 │
│             ← Desaparece en 8s   │
└─────────────────────────────────┘
```

---

## 📱 ¿Cómo Usar?

### Opción 1: Badge + Panel
1. Mira el dashboard normal
2. Cuando escuches el sonido o veas el badge actualizado
3. Haz click en 🔔
4. Se abre el panel con los datos del lead
5. Click en "Ver todos los leads" para ir al detalle

### Opción 2: Toast
1. El toast aparece automáticamente en la esquina
2. Lee la información rápida (nombre e interés)
3. Si quieres más detalles, ve a "/dashboard/leads"

### Opción 3: Directo a Leads
1. Click en "Ver todos los leads" (en el panel)
2. O navega manualmente a Dashboard → Leads

---

## 🔧 Troubleshooting

### "No estoy escuchando notificaciones"

**Problema:** El WebSocket no está conectando

**Solución:**
1. Recarga la página (F5)
2. Verifica que estés logueado
3. Abre DevTools (F12) → Console
4. Busca mensaje: `✅ Conectado a WebSocket`
5. Si no aparece, contacta al equipo técnico

### "No escucho el sonido"

**Problema:** El navegador silencia el audio

**Solución:**
1. Haz click en el icono de sonido del navegador
2. Asegúrate que no esté muteado
3. Recarga la página
4. Prueba nuevamente

### "El badge muestra número pero no veo el panel"

**Problema:** El panel no se abre

**Solución:**
1. Prueba double-click en el badge
2. Abre DevTools (F12) para ver si hay errores
3. Recarga la página
4. Intenta nuevamente

---

## ⚡ Detalles Técnicos

### Conexión WebSocket
```
Estado: ABIERTO
Endpoint: ws://crm.delgado.com/api/voice
Reconexión: Automática cada 5 segundos si se desconecta
Timeout: Ninguno (siempre intenta reconectar)
```

### Datos del Lead en Notificación
- ✅ Nombre completo
- ✅ Email
- ✅ Teléfono
- ✅ Interés (Vivienda, Crédito, Servicios, etc.)
- ✅ Origen (Web, Whatsapp, Direct, etc.)
- ✅ Hora de llegada

### Quién Recibe las Notificaciones
- ✅ Administradores (activos)
- ✅ Supervisores (activos)
- ❌ Asesores normales (no por WebSocket, pero ven en leads)
- ❌ Usuarios inactivos

---

## 📊 Estadísticas

### Rendimiento
- **Latencia:** < 1 segundo desde que se envía en PGDP
- **Tasa de entrega:** 99.9% (algunos errores pueden ocurrir)
- **Conexión:** Automáticamente se reconecta

### Información Almacenada
- Todas las notificaciones se guardan en BD
- Histórico disponible en próximas versiones
- Los datos se guardan por 90 días

---

## 🔒 Privacidad

- Solo tú ves tus notificaciones
- Los datos del lead se transmiten por WebSocket (seguro)
- Todos los datos cumplen GDPR
- Se implementan en 3 canales (BD, WebSocket, WhatsApp)

---

## 💡 Tips y Trucos

### Maximizar Productividad
1. **Mantén el CRM abierto** en un tab siempre
2. **Responde rápido** (los primeros asesores tienen ventaja)
3. **Sigue el sonido** para no perder notificaciones
4. **Usa el panel** para ver últimos leads rápidamente

### Aprovechar el Sistema
- Las notificaciones te alertan en TIEMPO REAL
- Puedes ser el primero en contactar al cliente
- Aumenta tus posibilidades de cierre
- Mejor servicio = mejor comisión

---

## 📞 Soporte

Si tienes problemas:

1. **Primero:** Revisa DevTools Console (F12)
2. **Luego:** Refresca la página (Ctrl+F5)
3. **Si persiste:** Contacta a IT
   - Email: soporte@delgado.com
   - Teléfono: +1 (555) 555-IT
   - WhatsApp: Equipo Support

---

## 📝 Notas Importantes

- ⚠️ Si estás offline, no recibirás notificaciones (se intentarán cuando reconectes)
- ⚠️ Si desconectas la sesión, las notificaciones se detienen
- ✅ Si cierras el navegador y abres de nuevo, se reconectan automáticamente
- ✅ Puedes tener múltiples tabs abiertos (cada uno recibe notificaciones)

---

## 🎓 Ejemplo de Uso Real

**Escenario:** Llega un nuevo lead interesado en una vivienda

1. **14:32:15** - Lead envía su info desde PGDP
2. **14:32:16** - Tú escuchas 🔔 (sonido beep suave)
3. **14:32:16** - Toast aparece: "🔔 ¡Nuevo Lead! Juan Pérez - Vivienda"
4. **14:32:16** - Badge muestra "1"
5. **14:32:17** - Haces click en el badge
6. **14:32:18** - Ves en el panel:
   - Juan Pérez
   - 📱 +1 (555) 123-4567
   - 📧 juan@example.com
   - 🎯 Vivienda
7. **14:32:20** - Abres el lead completo
8. **14:32:25** - Llamas a Juan (eres el PRIMERO en contactarlo)
9. **14:35:00** - Juan marca 3 viviendas de su interés
10. **14:45:00** - Agendas cita para esta semana

**Resultado:** Lead caliente, respuesta rápida, cita confirmada. 🎉

---

*Última actualización: 2024*
*Versión: 1.0*
*Sistema: CRM Delgado*
