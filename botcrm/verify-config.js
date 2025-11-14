#!/usr/bin/env node

/**
 * Script para verificar la configuración del Bot CRM
 * Ejecuta: node verify-config.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 Verificando configuración del Bot CRM...\n');

// 1. Verificar .env.local
console.log('1️⃣  Verificando .env.local...');
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    if (envContent.includes('VITE_GOOGLE_API_KEY')) {
        console.log('   ✅ .env.local existe y contiene VITE_GOOGLE_API_KEY');
        
        // Verificar que no esté vacío
        const match = envContent.match(/VITE_GOOGLE_API_KEY=(.+)/);
        if (match && match[1].trim()) {
            console.log('   ✅ API Key configurada (no vacía)');
        } else {
            console.log('   ❌ API Key está vacía. Agrega tu clave en .env.local');
        }
    } else {
        console.log('   ❌ .env.local no contiene VITE_GOOGLE_API_KEY');
    }
} else {
    console.log('   ⚠️  .env.local no existe. Crea uno con:');
    console.log('      VITE_GOOGLE_API_KEY=tu_clave_aqui');
}

// 2. Verificar config.ts
console.log('\n2️⃣  Verificando config.ts...');
const configPath = path.join(__dirname, 'config.ts');
if (fs.existsSync(configPath)) {
    const configContent = fs.readFileSync(configPath, 'utf-8');
    if (configContent.includes('gemini-2.0-flash')) {
        console.log('   ✅ Usando gemini-2.0-flash (modelo correcto)');
    } else if (configContent.includes('gemini-2.5-flash')) {
        console.log('   ❌ Aún usa gemini-2.5-flash (puede estar sobrecargado)');
        console.log('      Cambia a gemini-2.0-flash en config.ts');
    } else {
        console.log('   ⚠️  Modelo no identificado');
    }
} else {
    console.log('   ❌ config.ts no encontrado');
}

// 3. Verificar vite.config.ts
console.log('\n3️⃣  Verificando vite.config.ts...');
const viteConfigPath = path.join(__dirname, 'vite.config.ts');
if (fs.existsSync(viteConfigPath)) {
    const viteContent = fs.readFileSync(viteConfigPath, 'utf-8');
    if (viteContent.includes('VITE_GOOGLE_API_KEY')) {
        console.log('   ✅ vite.config.ts configurado correctamente');
    } else {
        console.log('   ❌ vite.config.ts no tiene VITE_GOOGLE_API_KEY');
    }
} else {
    console.log('   ❌ vite.config.ts no encontrado');
}

// 4. Verificar dependencias
console.log('\n4️⃣  Verificando dependencias...');
const packagePath = path.join(__dirname, 'package.json');
if (fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
    if (packageContent.dependencies['@google/genai']) {
        console.log('   ✅ @google/genai instalado');
    } else {
        console.log('   ❌ @google/genai no está en package.json');
        console.log('      Ejecuta: npm install');
    }
    
    if (packageContent.dependencies['react']) {
        console.log('   ✅ React instalado');
    } else {
        console.log('   ❌ React no está instalado');
    }
} else {
    console.log('   ❌ package.json no encontrado');
}

// 5. Verificar node_modules
console.log('\n5️⃣  Verificando node_modules...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
    console.log('   ✅ node_modules existe');
} else {
    console.log('   ❌ node_modules no existe');
    console.log('      Ejecuta: npm install');
}

console.log('\n✅ Verificación completada!\n');
console.log('📝 Próximos pasos:');
console.log('   1. Asegúrate de tener tu API Key en .env.local');
console.log('   2. Ejecuta: npm run dev');
console.log('   3. Abre http://localhost:3000/botcrm en tu navegador');
console.log('   4. Prueba escribiendo: "Dame un análisis de marketing"\n');
