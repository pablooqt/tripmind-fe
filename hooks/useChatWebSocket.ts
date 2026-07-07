import { useState, useEffect, useRef, useCallback } from 'react';
import { BASE_URL } from '@/services/api';

export interface ChatMessage {
  id: string;
  room_id: string;
  sender_id: string;
  sender_role: 'traveler' | 'guide' | 'system';
  message_type: 'text' | 'action_card' | 'payment_success_card';
  content: {
    text?: string;
    [key: string]: any;
  };
  is_read: boolean;
  created_at: string;
}

export function useChatWebSocket(roomId: string | null, token: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Fungsi mengirim pesan
  const sendMessage = useCallback((text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const payload = {
        content: {
          text: text,
        },
      };
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn('[useChatWebSocket] Gagal mengirim pesan: Socket tidak terbuka.');
    }
  }, []);

  useEffect(() => {
    if (!roomId || !token) {
      setMessages([]);
      setConnected(false);
      return;
    }

    // Ubah protokol http/https menjadi ws/wss
    const wsBaseUrl = BASE_URL.replace(/^http/, 'ws');
    const wsUrl = `${wsBaseUrl}/api/v1/chat/ws/${roomId}?token=${token}`;

    console.log('[useChatWebSocket] Menghubungkan ke WebSocket:', wsUrl);
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('[useChatWebSocket] Terhubung.');
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message: ChatMessage = JSON.parse(event.data);
        console.log('[useChatWebSocket] Pesan diterima:', message);
        setMessages((prev) => {
          // Cegah duplikasi pesan (jika pesan dengan ID sama sudah ada di state)
          if (prev.some((m) => m.id === message.id)) {
            return prev;
          }
          return [...prev, message];
        });
      } catch (err) {
        console.warn('[useChatWebSocket] Gagal mengurai pesan masuk:', err);
      }
    };

    ws.onerror = (e) => {
      console.warn('[useChatWebSocket] Socket error:', e);
    };

    ws.onclose = (e) => {
      console.log('[useChatWebSocket] Koneksi ditutup:', e.code, e.reason);
      setConnected(false);
    };

    return () => {
      console.log('[useChatWebSocket] Membersihkan koneksi...');
      ws.close();
      wsRef.current = null;
    };
  }, [roomId, token]);

  return {
    messages,
    setMessages,
    connected,
    sendMessage,
  };
}
