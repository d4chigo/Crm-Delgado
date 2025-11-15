#!/usr/bin/env node
// Script para decodificar y diagnosticar JWT
const jwt = require('jsonwebtoken');

// Lee el token desde el argumento de línea de comandos
const token = process.argv[2];

if (!token) {
  console.log('\n🔍 DEBUG JWT TOKEN - CRM DELGADO\n');
  console.log('Uso: node debug-token.js <tu-token-jwt>');
  console.log('\n📋 INSTRUCCIONES:');
  console.log('1. Abre http://localhost:3000 en tu navegador');
  console.log('2. Presiona F12 (DevTools)');
  console.log('3. Ve a la pestaña Console');
  console.log('4. Ejecuta: localStorage.getItem("crm_token")');
  console.log('5. Copia el token completo (sin las comillas)');
  console.log('6. Ejecuta: node debug-token.js <token-copiado>\n');
  process.exit(1);
}

console.log('\n🔍 ANALIZANDO TOKEN JWT...\n');

try {
  // Decodificar sin verificar firma (solo para inspección)
  const decoded = jwt.decode(token, { complete: true });
  
  if (!decoded) {
    console.log('❌ ERROR: Token inválido o mal formado\n');
    process.exit(1);
  }

  console.log('='.repeat(60));
  console.log('📄 HEADER (Cabecera)');
  console.log('='.repeat(60));
  console.log(JSON.stringify(decoded.header, null, 2));
  
  console.log('\n' + '='.repeat(60));
  console.log('📦 PAYLOAD (Datos del Usuario)');
  console.log('='.repeat(60));
  console.log(JSON.stringify(decoded.payload, null, 2));
  
  const payload = decoded.payload;
  
  console.log('\n' + '='.repeat(60));
  console.log('🔑 DATOS CRÍTICOS');
  console.log('='.repeat(60));
  console.log('Usuario ID:  ', payload.usuarioId || '❌ NO ENCONTRADO');
  console.log('Email:       ', payload.email || '❌ NO ENCONTRADO');
  console.log('Rol:         ', payload.rol || '❌ NO ENCONTRADO');
  console.log('Emitido:     ', payload.iat ? new Date(payload.iat * 1000).toLocaleString() : 'N/A');
  console.log('Expira:      ', payload.exp ? new Date(payload.exp * 1000).toLocaleString() : 'N/A');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ VERIFICACIÓN CON BASE DE DATOS');
  console.log('='.repeat(60));
  const dbUserId = '231275c8-c9b1-48fa-a520-9060fac724ef';
  const jwtUserId = payload.usuarioId;
  
  console.log('ID en Base de Datos: ', dbUserId);
  console.log('ID en JWT Token:     ', jwtUserId);
  console.log('Tipo de ID en JWT:   ', typeof jwtUserId);
  console.log('Longitud del ID:     ', jwtUserId ? jwtUserId.length : 0);
  
  if (jwtUserId === dbUserId) {
    console.log('\n✅ MATCH EXITOSO - Los IDs coinciden');
    console.log('   El problema NO es el usuarioId del token');
  } else {
    console.log('\n❌ NO COINCIDEN - ESTE ES EL PROBLEMA');
    console.log('   El usuarioId del JWT no existe en la tabla usuarios');
    console.log('\n💡 SOLUCIÓN:');
    console.log('   1. Cierra sesión en http://localhost:3000');
    console.log('   2. Vuelve a hacer login con admin@crm-delgado.com');
    console.log('   3. Intenta la importación de nuevo');
  }
  
  // Verificar si el token está expirado
  if (payload.exp) {
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      console.log('\n⚠️  ADVERTENCIA: Token expirado hace', ((now - payload.exp) / 60).toFixed(0), 'minutos');
      console.log('   Debes hacer login nuevamente');
    } else {
      const minutosRestantes = ((payload.exp - now) / 60).toFixed(0);
      console.log('\n⏱️  Token válido por', minutosRestantes, 'minutos más');
    }
  }
  
  console.log('\n' + '='.repeat(60) + '\n');
  
} catch (error) {
  console.log('❌ ERROR al decodificar token:', error.message);
  console.log('\nEl token puede estar corrupto o mal copiado.');
  console.log('Asegúrate de copiar SOLO el valor del token (sin comillas).\n');
  process.exit(1);
}
