import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';

export interface SocketUser {
  usuarioId: string;
  nombre: string;
  email: string;
}

// Almacenar usuarios conectados
const usuariosConectados = new Map<string, SocketUser>();

export function configurarSocket(httpServer: HTTPServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  // Middleware de autenticación
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Token no proporcionado'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
      socket.data.usuarioId = decoded.usuarioId;
      socket.data.nombre = decoded.nombre;
      socket.data.email = decoded.email;
      next();
    } catch (error) {
      next(new Error('Token inválido'));
    }
  });

  // Eventos de conexión
  io.on('connection', (socket: Socket) => {
    const usuarioId = socket.data.usuarioId;
    const nombre = socket.data.nombre;

    console.log(`[Socket.IO] Usuario conectado: ${nombre} (${usuarioId})`);

    // Guardar usuario conectado
    usuariosConectados.set(usuarioId, {
      usuarioId,
      nombre,
      email: socket.data.email,
    });

    // Unir al usuario a su propia sala
    socket.join(`usuario:${usuarioId}`);

    // Emitir evento de usuario conectado
    io.emit('usuario:conectado', {
      usuarioId,
      nombre,
      usuariosConectados: Array.from(usuariosConectados.values()),
    });

    // Evento: Desconexión
    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Usuario desconectado: ${nombre} (${usuarioId})`);
      usuariosConectados.delete(usuarioId);

      io.emit('usuario:desconectado', {
        usuarioId,
        usuariosConectados: Array.from(usuariosConectados.values()),
      });
    });

    // Evento: Error
    socket.on('error', (error) => {
      console.error(`[Socket.IO] Error del usuario ${usuarioId}:`, error);
    });
  });

  return io;
}

/**
 * Emitir notificación a un usuario específico
 */
export function emitirNotificacion(
  io: SocketIOServer,
  usuarioId: string,
  notificacion: any
) {
  io.to(`usuario:${usuarioId}`).emit('notificacion:nueva', notificacion);
}

/**
 * Emitir notificación a múltiples usuarios
 */
export function emitirNotificacionMultiple(
  io: SocketIOServer,
  usuarioIds: string[],
  notificacion: any
) {
  usuarioIds.forEach((usuarioId) => {
    emitirNotificacion(io, usuarioId, notificacion);
  });
}

/**
 * Emitir evento a todos los usuarios
 */
export function emitirATodos(io: SocketIOServer, evento: string, datos: any) {
  io.emit(evento, datos);
}

/**
 * Obtener usuarios conectados
 */
export function obtenerUsuariosConectados(): SocketUser[] {
  return Array.from(usuariosConectados.values());
}

/**
 * Verificar si un usuario está conectado
 */
export function usuarioEstaConectado(usuarioId: string): boolean {
  return usuariosConectados.has(usuarioId);
}
