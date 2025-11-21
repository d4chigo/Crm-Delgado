import fs from 'fs';
import path from 'path';
import { ContactoAdapter } from './contacto-adapter';
import { ContactoEtiquetaAdapter } from './contacto-etiqueta-adapter';

// Asegurar que si el .env está en la raíz, se cargue antes de inicializar prisma
const rootEnv = path.resolve(process.cwd(), '.env');
if (fs.existsSync(rootEnv) && !process.env.DATABASE_URL) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('dotenv').config({ path: rootEnv });
}

if (!process.env.DATABASE_URL) {
  console.warn('[Prisma] WARNING: DATABASE_URL no encontrada en las variables de entorno. Algunas operaciones pueden fallar.');
}

// Import PrismaClient dynamically to avoid TypeScript errors in editors when
// the Prisma Client has not been generated yet (i.e. `npx prisma generate`).
let PrismaClient: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  PrismaClient = require('@prisma/client').PrismaClient;
} catch (err) {
  console.warn('[Prisma] @prisma/client no está disponible. Ejecuta `npx prisma generate` para generar el cliente.');
  // Fallback minimal class so the app doesn't crash at import time.
  PrismaClient = class {
    constructor() {}
    // minimal stubs (if accidentally used before generation, will throw later)
    $connect() { return Promise.resolve(); }
    $disconnect() { return Promise.resolve(); }
  };
}

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

// Agregar adaptadores para compatibilidad backwards-compatible
// Proporciona acceso a leads y clientes como "contacto"
(prisma as any).contacto = {
  count: (options?: any) => ContactoAdapter.count(options),
  findMany: (options?: any) => ContactoAdapter.findMany(options),
  findFirst: (where?: any) => ContactoAdapter.findFirst(where),
  findUnique: (where?: any) => ContactoAdapter.findUnique(where),
  create: (data?: any) => ContactoAdapter.create(data),
  update: (options?: any) => ContactoAdapter.update(options),
  delete: (where?: any) => ContactoAdapter.delete(where),
  groupBy: (options?: any) => ContactoAdapter.groupBy(options),
};

(prisma as any).contactoEtiqueta = {
  create: (data?: any) => ContactoEtiquetaAdapter.create(data),
  findMany: (options?: any) => ContactoEtiquetaAdapter.findMany(options),
  findUnique: (options?: any) => ContactoEtiquetaAdapter.findUnique(options),
  createMany: (options?: any) => ContactoEtiquetaAdapter.createMany(options),
  deleteMany: (options?: any) => ContactoEtiquetaAdapter.deleteMany(options),
};

export default prisma;
