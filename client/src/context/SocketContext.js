import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL } from '../utils/config';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { token } = useAuth();
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setConnected(false);
      }
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinEventRoom = (eventId) => {
    socketRef.current?.emit('join_event', eventId);
  };

  const joinChatRoom = ({ eventId, chatType, committeeId }) => {
    socketRef.current?.emit('join_chat_room', { eventId, chatType, committeeId });
  };

  const sendMessage = ({ eventId, chatType, committeeId, message }) => {
    socketRef.current?.emit('send_message', { eventId, chatType, committeeId, message });
  };

  const emitTyping = ({ eventId, chatType, committeeId, isTyping }) => {
    socketRef.current?.emit('typing', { eventId, chatType, committeeId, isTyping });
  };

  const broadcastAnnouncement = (announcement) => {
    socketRef.current?.emit('broadcast_announcement', announcement);
  };

  const onEvent = (eventName, callback) => {
    socketRef.current?.on(eventName, callback);
    return () => socketRef.current?.off(eventName, callback);
  };

  return (
    <SocketContext.Provider
      value={{ socket: socketRef.current, connected, joinEventRoom, joinChatRoom, sendMessage, emitTyping, broadcastAnnouncement, onEvent }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};
