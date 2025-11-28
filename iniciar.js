#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const accion = process.argv[2] || 'dev';
const dirRaiz = __dirname;

// Crear .env si no existe y cargar variables
function crearEnvSiNoExiste() {
  const rutaEnv = path.join(dirRaiz, '.env');
  if (!fs.existsSync(rutaEnv)) {
    const contenidoEnv = `NODE_ENV=development
DATABASE_URL=file:./dev.db
PORT=5000
CORS_ORIGIN=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:5000/api
CLIENT_URL=http://localhost:3000
JWT_SECRET=tu_jwt_secret_super_seguro_cambiar_en_produccion_123456
JWT_EXPIRES_IN=24h
BCRYPT_ROUNDS=10
DNI_API_TOKEN=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:5000/api/calendar/callback
GMAIL_EMAIL=
GMAIL_APP_PASSWORD=
VITE_GOOGLE_API_KEY=
SERVER_GEMINI_API_KEY=
BACKEND_PORT=5000
FRONTEND_PORT=3000
ALLOW_DEV_SEED=true
`;
    fs.writeFileSync(rutaEnv, contenidoEnv);
    console.log('[+] Archivo .env creado automáticamente');
  }
  // Cargar variables de entorno
  dotenv.config({ path: rutaEnv });
}

function escribirEncabezado(mensaje) {
  console.log('\n========================================================');
  console.log(`  ${mensaje}`);
  console.log('========================================================\n');
}

function escribirPaso(mensaje) {
  console.log(`[*] ${mensaje}`);
}

function escribirError(mensaje) {
  console.log(`[!] ${mensaje}`);
}

function escribirExito(mensaje) {
  console.log(`[+] ${mensaje}`);
}

function ejecutarComando(comando, args, cwd) {
  return new Promise((resolver, rechazar) => {
    const proceso = spawn(comando, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    proceso.on('close', (codigo) => {
      if (codigo === 0) {
        resolver();
      } else {
        rechazar(new Error(`Comando falló con código ${codigo}`));
      }
    });

    proceso.on('error', (error) => {
      rechazar(error);
    });
  });
}

async function instalar() {
  crearEnvSiNoExiste();
  escribirEncabezado('Instalando Dependencias');

  try {
    escribirPaso('Instalando dependencias raíz...');
    await ejecutarComando('npm', ['install'], dirRaiz);
    escribirExito('Dependencias raíz instaladas');

    escribirPaso('Instalando dependencias del servidor...');
    await ejecutarComando('npm', ['install'], path.join(dirRaiz, 'server'));
    escribirExito('Dependencias del servidor instaladas');

    escribirPaso('Instalando dependencias del cliente...');
    await ejecutarComando('npm', ['install'], path.join(dirRaiz, 'client'));
    escribirExito('Dependencias del cliente instaladas');

    escribirPaso('Instalando dependencias de Electron...');
    await ejecutarComando('npm', ['install'], path.join(dirRaiz, 'app'));
    escribirExito('Dependencias de Electron instaladas');

    escribirPaso('Generando cliente de Prisma...');
    await ejecutarComando('npx', ['prisma', 'generate'], path.join(dirRaiz, 'server'));
    escribirExito('Cliente de Prisma generado');

    escribirEncabezado('Instalación Completada');
  } catch (error) {
    escribirError(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function dev() {
  crearEnvSiNoExiste();
  escribirEncabezado('Iniciando CRM Delgado en Desarrollo');

  try {
    // Verificar si las dependencias están instaladas
    if (!fs.existsSync(path.join(dirRaiz, 'node_modules'))) {
      escribirPaso('Instalando dependencias...');
      await instalar();
    }

    // Generar cliente de Prisma
    escribirPaso('Generando cliente de Prisma...');
    await ejecutarComando('npx', ['prisma', 'generate'], path.join(dirRaiz, 'server'));
    escribirExito('Cliente de Prisma generado');

    // Ejecutar migraciones
    escribirPaso('Ejecutando migraciones de Prisma...');
    await ejecutarComando('npx', ['prisma', 'migrate', 'deploy'], path.join(dirRaiz, 'server'));
    escribirExito('Migraciones completadas');

    // Ejecutar seed
    escribirPaso('Ejecutando seed de datos...');
    try {
      await ejecutarComando('npx', ['prisma', 'db', 'seed'], path.join(dirRaiz, 'server'));
      escribirExito('Seed ejecutado');
    } catch (error) {
      escribirPaso('Seed no disponible o ya ejecutado (esto es normal)');
    }

    escribirPaso('Iniciando servidor backend en puerto 5000...');
    spawn('npm', ['run', 'dev'], {
      cwd: path.join(dirRaiz, 'server'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise(r => setTimeout(r, 3000));

    escribirPaso('Iniciando cliente frontend en puerto 3000...');
    spawn('npm', ['run', 'dev'], {
      cwd: path.join(dirRaiz, 'client'),
      stdio: 'inherit',
      shell: true
    });

    await new Promise(r => setTimeout(r, 3000));

    escribirPaso('Iniciando Electron...');
    await ejecutarComando('npm', ['run', 'dev'], path.join(dirRaiz, 'app'));
  } catch (error) {
    escribirError(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function compilar() {
  escribirEncabezado('Compilando CRM Delgado');

  try {
    escribirPaso('Compilando cliente...');
    await ejecutarComando('npm', ['run', 'build'], path.join(dirRaiz, 'client'));
    escribirExito('Cliente compilado');

    escribirPaso('Compilando servidor...');
    await ejecutarComando('npm', ['run', 'build'], path.join(dirRaiz, 'server'));
    escribirExito('Servidor compilado');

    escribirPaso('Compilando Electron...');
    await ejecutarComando('npm', ['run', 'compilar'], path.join(dirRaiz, 'app'));
    escribirExito('Electron compilado');

    escribirEncabezado('Compilación Completada');
  } catch (error) {
    escribirError(`Error: ${error.message}`);
    process.exit(1);
  }
}

async function empaquetar() {
  escribirEncabezado('Empaquetando CRM Delgado');

  try {
    escribirPaso('Compilando aplicación...');
    await compilar();

    escribirPaso('Creando instalador...');
    await ejecutarComando('npm', ['run', 'empaquetar:windows'], path.join(dirRaiz, 'app'));
    escribirExito('Instalador creado en app/dist/');

    escribirEncabezado('Empaquetamiento Completado');
  } catch (error) {
    escribirError(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Ejecutar según la acción
switch (accion) {
  case 'setup':
    instalar();
    break;
  case 'dev':
    dev();
    break;
  case 'build':
    compilar();
    break;
  case 'package':
    empaquetar();
    break;
  default:
    escribirError(`Acción desconocida: ${accion}`);
    console.log('Acciones disponibles: setup, dev, build, package');
    process.exit(1);
}
