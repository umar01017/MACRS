'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MessageBubble } from './MessageBubble';
import { FileUpload } from './FileUpload';
import { VoiceControls } from './VoiceControls';
import { useAuth } from '@/context/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWindow({ sessionId, onSessionCreated }: { sessionId: string | null, onSessionCreated: (id: string) => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I am MACRS, your Multi-Agent Cognitive Reasoning System. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    let activeSocket: WebSocket | null = null;
    let isActive = true;

    const establishConnection = async () => {
      let activeSessionId = sessionId;
      
      if (!activeSessionId) {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
        try {
          const res = await fetch(`${apiUrl}/chat/sessions?user_id=${user.id}`, { method: 'POST' });
          const data = await res.json();
          if (!isActive) return;
          activeSessionId = data.session_id;
          onSessionCreated(activeSessionId as string);
        } catch (e) {
          console.error("Failed to create session", e);
          return;
        }
      }
      
      if (!isActive || !activeSessionId) return;

      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws/chat';
      const socket = new WebSocket(`${wsUrl}/${activeSessionId}`);
      activeSocket = socket;
      
      socket.onopen = () => setIsConnected(true);
      socket.onclose = () => setIsConnected(false);
      
      socket.onmessage = (event) => {
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            const updated = [...prev];
            updated[updated.length - 1] = { ...lastMsg, content: lastMsg.content + event.data };
            return updated;
          } else {
            return [...prev, { role: 'assistant', content: event.data }];
          }
        });
      };
      setWs(socket);
    };

    setIsConnected(false);
    setMessages([{ role: 'assistant', content: 'Hello! I am MACRS, your Multi-Agent Cognitive Reasoning System. How can I help you today?' }]);
    establishConnection();

    return () => {
      isActive = false;
      if (activeSocket) activeSocket.close();
    };
  }, [sessionId, user, onSessionCreated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !ws || !isConnected) return;
    
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    ws.send(input);
    setInput('');
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-950 text-gray-100 font-sans">
      <header className="h-16 border-b border-gray-800 flex items-center px-6 bg-gray-900/80 backdrop-blur-md shadow-sm z-10 sticky top-0">
        <h1 className="text-xl font-semibold tracking-wide flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-xs font-bold">M</span>
          </div>
          MACRS
        </h1>
      </header>
      
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth w-full">
        <div className="max-w-4xl mx-auto w-full">
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="p-4 md:p-6 bg-gray-900/80 backdrop-blur-md border-t border-gray-800">
        <form onSubmit={handleSend} className="max-w-4xl mx-auto relative group flex items-center gap-2 bg-gray-800 border-2 border-gray-700/50 rounded-2xl px-2 py-2 focus-within:border-blue-500 transition-all shadow-inner">
          <FileUpload onUpload={(file) => console.log(file.name)} />
          <VoiceControls onInput={(txt: string) => setInput(prev => prev + " " + txt)} />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Send a message to MACRS..." : "Connecting to MACRS..."}
            disabled={!isConnected}
            className="flex-1 bg-transparent border-none py-3 px-2 focus:outline-none focus:ring-0 text-gray-100 placeholder-gray-500 text-sm md:text-base disabled:opacity-50"
          />
          <button 
            type="submit" 
            className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-md
                       disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
            disabled={!input.trim() || !isConnected}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
        <div className="text-center mt-4 text-xs text-gray-500 tracking-wide font-medium">
          MACRS can make mistakes. Consider verifying important information.
        </div>
      </footer>
    </div>
  );
}
