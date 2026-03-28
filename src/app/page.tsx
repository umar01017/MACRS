'use client';
import { useState } from 'react';
import ChatSidebar from '@/components/chat/ChatSidebar';
import ChatWindow from '@/components/chat/ChatWindow';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const { isLoading, token } = useAuth();
  
  if (isLoading || !token) return <div className="flex h-screen items-center justify-center bg-gray-950 text-white">Loading MACRS...</div>;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-950 font-sans selection:bg-blue-500/30">
      <ChatSidebar 
        currentSessionId={currentSessionId || undefined} 
        onSelectSession={(id) => {
          setCurrentSessionId(id);
          setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col relative w-full h-full">
        {/* Mobile Header with Toggle */}
        <div className="md:hidden flex items-center p-4 bg-gray-900 border-b border-gray-800">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-gray-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <span className="ml-4 text-white font-semibold">MACRS</span>
        </div>
        
        <ChatWindow sessionId={currentSessionId} onSessionCreated={setCurrentSessionId} />
        
        {/* Overlay for mobile sidebar */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
