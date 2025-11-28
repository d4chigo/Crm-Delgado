# Checklist Rápido de Diagnóstico

Por favor, responde estas preguntas:

## 1. ¿Qué ves en la consola del navegador (F12)?

Copia y pega los logs que ves después de hacer login. Busca:
- `🔌 Intentando conectar a WebSocket`
- `✅ Conectado a WebSocket`
- `⚠️ Error en WebSocket`
- `❌ WebSocket desconectado`

**Logs:**
```
[Pega aquí los logs]
```

## 2. ¿Qué ves en la terminal del servidor?

Cuando creas un lead desde PGDP, ¿qué logs aparecen en la terminal donde corre `pnpm dev` en `/server`?

Busca:
- `[Lead] Iniciando creación de lead`
- `✅ Lead creado exitosamente`
- `🔔 Notificando nuevo lead`
- `📊 Conexiones WebSocket activas`
- `📢 Encontrados X admins/supervisores`

**Logs:**
```
[Pega aquí los logs del servidor]
```

## 3. ¿El lead se crea en la BD?

¿Puedes ver el lead en el CRM después de enviarlo desde PGDP?
- [ ] Sí, aparece en la lista de leads
- [ ] No, no aparece

## 4. ¿Qué error específico ves?

¿Ves alguno de estos errores?
- [ ] "WebSocket desconectado"
- [ ] "Conexiones WebSocket activas: 0"
- [ ] "Encontrados 0 admins/supervisores"
- [ ] Otro: _______________

## 5. Verificación Rápida

Abre la consola del navegador y ejecuta esto:

```javascript
// Ver si hay token
console.log('Token:', localStorage.getItem('crm_token') ? 'SÍ' : 'NO');

// Ver usuario
console.log('Usuario:', localStorage.getItem('crm_user'));
```

**Resultado:**
```
[Pega aquí el resultado]
```

## 6. ¿El usuario es ADMIN?

En la BD, ejecuta:
```sql
SELECT id, nombre, rol, activo FROM usuario WHERE id = '[TU_ID]';
```

**Resultado:**
```
[Pega aquí el resultado]
```

---

**Una vez que respondas esto, podré identificar exactamente dónde está el problema.**
