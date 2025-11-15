/**
 * Tests para useNotificaciones hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { useNotificaciones } from '../useNotificaciones';
import * as socketIO from 'socket.io-client';

// Mock de socket.io-client
jest.mock('socket.io-client');

describe('useNotificaciones', () => {
  let mockSocket: any;

  beforeEach(() => {
    // Setup mock socket
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
    };

    (socketIO.io as jest.Mock).mockReturnValue(mockSocket);

    // Mock localStorage
    Storage.prototype.getItem = jest.fn((key) => {
      if (key === 'crm_token') return 'test-token';
      return null;
    });

    // Mock fetch
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe inicializar con valores por defecto', () => {
    const { result } = renderHook(() => useNotificaciones());

    expect(result.current.notificaciones).toEqual([]);
    expect(result.current.noLeidas).toBe(0);
    expect(result.current.conectado).toBe(false);
  });

  it('debe conectar a Socket.IO al montar', async () => {
    renderHook(() => useNotificaciones());

    await waitFor(() => {
      expect(socketIO.io).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          auth: { token: 'test-token' },
        })
      );
    });
  });

  it('debe manejar evento de conexión', async () => {
    const { result } = renderHook(() => useNotificaciones());

    // Simular evento de conexión
    act(() => {
      const connectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'connect'
      )?.[1];
      connectHandler?.();
    });

    await waitFor(() => {
      expect(result.current.conectado).toBe(true);
    });
  });

  it('debe manejar evento de desconexión', async () => {
    const { result } = renderHook(() => useNotificaciones());

    // Simular evento de desconexión
    act(() => {
      const disconnectHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'disconnect'
      )?.[1];
      disconnectHandler?.();
    });

    await waitFor(() => {
      expect(result.current.conectado).toBe(false);
    });
  });

  it('debe agregar notificación nueva', async () => {
    const { result } = renderHook(() => useNotificaciones());

    const notificacionNueva = {
      id: 'notif-1',
      usuarioId: 'user-1',
      titulo: 'Test',
      mensaje: 'Mensaje de prueba',
      tipo: 'NUEVO_LEAD',
      leida: false,
      creadoEn: new Date(),
    };

    act(() => {
      const notifHandler = mockSocket.on.mock.calls.find(
        (call: any[]) => call[0] === 'notificacion:nueva'
      )?.[1];
      notifHandler?.(notificacionNueva);
    });

    await waitFor(() => {
      expect(result.current.notificaciones).toContainEqual(notificacionNueva);
      expect(result.current.noLeidas).toBe(1);
    });
  });

  it('debe marcar notificación como leída', async () => {
    const { result } = renderHook(() => useNotificaciones());

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const notificacionId = 'notif-1';

    await act(async () => {
      await result.current.marcarComoLeida(notificacionId);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/notificaciones/${notificacionId}/leer`),
      expect.objectContaining({
        method: 'PATCH',
      })
    );
  });

  it('debe marcar todas como leídas', async () => {
    const { result } = renderHook(() => useNotificaciones());

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await act(async () => {
      await result.current.marcarTodasComoLeidas();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notificaciones/leer-todas'),
      expect.objectContaining({
        method: 'PATCH',
      })
    );
  });

  it('debe eliminar notificación', async () => {
    const { result } = renderHook(() => useNotificaciones());

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const notificacionId = 'notif-1';

    await act(async () => {
      await result.current.eliminarNotificacion(notificacionId);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining(`/api/notificaciones/${notificacionId}`),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('debe limpiar notificaciones leídas', async () => {
    const { result } = renderHook(() => useNotificaciones());

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    await act(async () => {
      await result.current.limpiarLeidas();
    });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/notificaciones/limpiar-leidas'),
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });

  it('debe desconectar al desmontar', () => {
    const { unmount } = renderHook(() => useNotificaciones());

    unmount();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
