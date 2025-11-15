/**
 * Servicio de Notificaciones para Electron
 * Maneja notificaciones del SO y sonidos
 */

import { ipcMain, Notification, BrowserWindow } from 'electron';
import path from 'path';
import { io, Socket } from 'socket.io-client';

export class NotificacionesService {
  private socket: Socket | null = null;
  private mainWindow: BrowserWindow | null = null;
  private token: string | null = null;

  constructor(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow;
    this.setupIPC();
  }

  /**
   * Configurar listeners de IPC
   */
  private setupIPC() {
    // Iniciar conexión Socket.IO
    ipcMain.on('notificaciones:conectar', (event, token: string) => {
      this.token = token;
      this.conectarSocket();
    });

    // Desconectar Socket.IO
    ipcMain.on('notificaciones:desconectar', () => {
      this.desconectarSocket();
    });

    // Mostrar notificación del SO
    ipcMain.on('notificaciones:mostrar', (event, datos: any) => {
      this.mostrarNotificacionSO(datos);
    });

    // Reproducir sonido
    ipcMain.on('notificaciones:sonido', () => {
      this.reproducirSonido();
    });
  }

  /**
   * Conectar a Socket.IO
   */
  private conectarSocket() {
    if (this.socket) return;

    try {
      const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000';

      this.socket = io(apiUrl, {
        auth: {
          token: this.token,
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.socket.on('connect', () => {
        console.log('✅ Electron conectado a notificaciones');
        this.mainWindow?.webContents.send('notificaciones:conectado', true);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Electron desconectado de notificaciones');
        this.mainWindow?.webContents.send('notificaciones:conectado', false);
      });

      this.socket.on('notificacion:nueva', (notificacion: any) => {
        console.log('📬 Nueva notificación en Electron:', notificacion);

        // Mostrar notificación del SO
        this.mostrarNotificacionSO(notificacion);

        // Reproducir sonido
        this.reproducirSonido();

        // Enviar al renderer
        this.mainWindow?.webContents.send('notificaciones:nueva', notificacion);
      });

      this.socket.on('error', (error: any) => {
        console.error('Error en Socket.IO (Electron):', error);
      });
    } catch (error) {
      console.error('Error al conectar Socket.IO en Electron:', error);
    }
  }

  /**
   * Desconectar Socket.IO
   */
  private desconectarSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Mostrar notificación del SO
   */
  private mostrarNotificacionSO(notificacion: any) {
    try {
      const titulo = notificacion.titulo || 'Nueva Notificación';
      const mensaje = notificacion.mensaje || '';
      const icono = path.join(__dirname, '../../assets/logo.png');

      const notif = new Notification({
        title: titulo,
        body: mensaje,
        icon: icono,
      });

      // Click en notificación
      notif.on('click', () => {
        if (this.mainWindow) {
          this.mainWindow.show();
          this.mainWindow.focus();
        }
      });

      notif.show();
    } catch (error) {
      console.error('Error al mostrar notificación del SO:', error);
    }
  }

  /**
   * Reproducir sonido de notificación
   */
  private reproducirSonido() {
    try {
      // Usar sonido del sistema
      const { Howl } = require('howler');
      const sonido = new Howl({
        src: [path.join(__dirname, '../../assets/notification.mp3')],
        volume: 0.5,
      });

      sonido.play();
    } catch (error) {
      console.warn('No se pudo reproducir sonido:', error);
      // Fallback: usar beep del sistema
      console.log('\x07'); // Bell character
    }
  }

  /**
   * Obtener estado de conexión
   */
  public estaConectado(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Destruir servicio
   */
  public destruir() {
    this.desconectarSocket();
  }
}
