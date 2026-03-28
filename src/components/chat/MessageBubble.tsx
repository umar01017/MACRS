'use client';

import React from 'react';

export function MessageBubble({ role, content }: { role: 'user' | 'assistant', content: string }) {
  const isUser = role === 'user';
  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-4 shadow-sm text-sm md:text-base ${
        isUser 
          ? 'bg-blue-600 text-white rounded-br-sm' 
          : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700/50'
      }`}>
        <p className="whitespace-pre-wrap leading-relaxed space-y-4 font-normal tracking-wide">{content}</p>
      </div>
    </div>
  );
}
