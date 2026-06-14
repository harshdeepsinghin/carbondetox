'use client';

import { Leaf } from 'lucide-react';
import type { ChatMessage as ChatMessageType } from '@/types';

interface ChatMessageProps {
  message: ChatMessageType;
  userName?: string;
  userInitial?: string;
}

/**
 * Render a single chat bubble.
 * Assistant: green-tinted, left-aligned with leaf icon.
 * User: blue-tinted, right-aligned with initial avatar.
 * Supports **bold** markdown rendering.
 */
export function ChatMessage({ message, userInitial = 'U' }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';

  /** Render **text** as <strong> */
  function renderContent(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
  }

  const time = new Date(message.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <div className={`flex gap-2.5 ${isAssistant ? '' : 'flex-row-reverse'} items-end`}>
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
        style={{
          background: isAssistant ? 'var(--color-forest)' : 'rgba(59,130,246,0.8)',
          color: 'white',
        }}
        aria-hidden="true"
      >
        {isAssistant ? <Leaf className="w-4 h-4" /> : userInitial.toUpperCase()}
      </div>

      {/* Bubble */}
      <div className="max-w-[78%] space-y-1">
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isAssistant ? 'rgba(22,163,74,0.12)' : 'rgba(59,130,246,0.12)',
            border: `1px solid ${isAssistant ? 'rgba(22,163,74,0.2)' : 'rgba(59,130,246,0.2)'}`,
            borderBottomLeftRadius: isAssistant ? 4 : undefined,
            borderBottomRightRadius: isAssistant ? undefined : 4,
            color: 'var(--color-text-primary)',
          }}
        >
          {renderContent(message.content)}
        </div>
        <p
          className={`text-xs ${isAssistant ? 'text-left pl-1' : 'text-right pr-1'}`}
          style={{ color: 'var(--color-text-muted)' }}
          aria-label={`Sent at ${time}`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
