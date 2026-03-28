'use client';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Session {
  session_id: string;
  title: string;
  created_at: string;
}

export default function ChatSidebar({ 
  currentSessionId, 
  onSelectSession,
  isOpen,
  onClose
}: { 
  currentSessionId?: string, 
  onSelectSession: (id: string | null) => void,
  isOpen: boolean,
  onClose: () => void
}) {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

  useEffect(() => {
    if (user?.id) {
      fetch(`${apiUrl}/chat/sessions/${user.id}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSessions(data.reverse());
        })
        .catch(err => console.error("Error fetching sessions:", err));
    }
  }, [user, apiUrl, currentSessionId]); // re-fetch when new session is made

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col p-4 border-r border-gray-800 transition-transform duration-300 ease-in-out
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      md:relative md:translate-x-0 md:flex
    `}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-blue-500">History</h2>
        <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <button 
        onClick={() => onSelectSession(null)}
        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg w-full flex items-center justify-center gap-2 transition-colors shadow-sm mb-6"
      >
        <span>+ New Chat</span>
      </button>
      
      <div className="flex-1 overflow-y-auto space-y-2">
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-3 px-2">Past Chats</p>
        {sessions.map(s => (
          <div 
            key={s.session_id} 
            onClick={() => onSelectSession(s.session_id)}
            className={`p-2 rounded-lg cursor-pointer text-sm truncate transition-colors ${currentSessionId === s.session_id ? 'bg-gray-800 text-white' : 'hover:bg-gray-800 text-gray-300'}`}
          >
            {s.title}
          </div>
        ))}
        {sessions.length === 0 && <div className="text-xs text-gray-500 px-2">No past searches</div>}
      </div>
      <div className="mt-auto border-t border-gray-800 pt-4 flex flex-col gap-2">
        <div className="px-2 text-xs text-gray-400 mb-2 truncate">
          Logged in as: <br/><span className="text-gray-200 font-semibold">{user?.email}</span>
        </div>
        <button 
          onClick={logout}
          className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg cursor-pointer text-sm transition-colors flex items-center justify-center w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
