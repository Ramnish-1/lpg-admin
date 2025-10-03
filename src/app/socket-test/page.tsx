'use client';

import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SocketTestPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 19)]);
  };

  const testConnection = () => {
    addLog('🔄 Attempting to connect to socket server...');
    setConnectionError(null);

    try {
      const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
      addLog(`📡 Connecting to: ${socketUrl}`);

      const newSocket = io(socketUrl, {
        transports: ['websocket', 'polling'],
        timeout: 10000,
        forceNew: true,
        autoConnect: true
      });

      newSocket.on('connect', () => {
        addLog('✅ Socket connected successfully!');
        addLog(`🆔 Socket ID: ${newSocket.id}`);
        setIsConnected(true);
        setConnectionError(null);
      });

      newSocket.on('disconnect', (reason) => {
        addLog(`❌ Socket disconnected: ${reason}`);
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        addLog(`🚨 Connection error: ${error.message}`);
        setConnectionError(error.message);
        setIsConnected(false);
      });

      newSocket.on('error', (error) => {
        addLog(`❌ Socket error: ${error}`);
      });

      setSocket(newSocket);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`💥 Failed to create socket: ${errorMessage}`);
      setConnectionError(errorMessage);
    }
  };

  const disconnect = () => {
    if (socket) {
      addLog('🔌 Disconnecting socket...');
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  };

  const testEmit = () => {
    if (socket && isConnected) {
      addLog('📤 Sending test message...');
      socket.emit('test-message', { message: 'Hello from client!' });
    } else {
      addLog('⚠️ Socket not connected, cannot send message');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Socket Connection Test</h1>
        <Badge variant={isConnected ? 'default' : 'destructive'}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Connection Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Connection Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p><strong>Socket URL:</strong> {process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'}</p>
              <p><strong>Status:</strong> {isConnected ? '✅ Connected' : '❌ Disconnected'}</p>
              {socket && <p><strong>Socket ID:</strong> {socket.id || 'N/A'}</p>}
              {connectionError && (
                <p className="text-red-500"><strong>Error:</strong> {connectionError}</p>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={testConnection} disabled={isConnected}>
                Connect
              </Button>
              <Button onClick={disconnect} disabled={!isConnected} variant="outline">
                Disconnect
              </Button>
              <Button onClick={testEmit} disabled={!isConnected} variant="secondary">
                Test Emit
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connection Info */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p><strong>Environment:</strong> {process.env.NODE_ENV || 'development'}</p>
            <p><strong>Browser:</strong> {typeof window !== 'undefined' ? navigator.userAgent.split(' ').pop() : 'N/A'}</p>
            <p><strong>Protocol:</strong> {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}</p>
            <p><strong>Host:</strong> {typeof window !== 'undefined' ? window.location.host : 'N/A'}</p>
            <p><strong>Socket.IO Client:</strong> Available</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Connection Logs
            <Button onClick={clearLogs} variant="outline" size="sm">
              Clear Logs
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-black text-green-400 p-4 rounded-lg font-mono text-sm max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Click "Connect" to start testing.</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


