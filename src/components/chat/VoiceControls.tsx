'use client';
import React, { useState, useEffect } from 'react';

export function VoiceControls({ onInput }: { onInput: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        onInput(text);
        setIsRecording(false);
      };
      rec.onerror = () => setIsRecording(false);
      rec.onend = () => setIsRecording(false);
      setRecognition(rec);
    }
  }, [onInput]);

  const toggleRecording = () => {
    if (isRecording) {
      recognition?.stop();
      setIsRecording(false);
    } else {
      recognition?.start();
      setIsRecording(true);
    }
  };

  if (!recognition) return null;

  return (
    <button 
      type="button"
      onClick={toggleRecording}
      className={`p-2 rounded-lg transition-colors ${
        isRecording ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'text-gray-400 hover:text-white hover:bg-gray-800'
      }`}
      title={isRecording ? "Stop Recording" : "Start Voice Input"}
    >
      {isRecording ? (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 md:w-6 md:h-6 animate-pulse">
          <path fillRule="evenodd" d="M12 2.25A6.75 6.75 0 0 0 5.25 9v1.5a6.75 6.75 0 0 0 13.5 0V9A6.75 6.75 0 0 0 12 2.25ZM9.75 9a2.25 2.25 0 0 1 4.5 0v1.5a2.25 2.25 0 0 1-4.5 0V9Z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
        </svg>
      )}
    </button>
  );
}

export const speakResponse = (text: string) => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  }
};
