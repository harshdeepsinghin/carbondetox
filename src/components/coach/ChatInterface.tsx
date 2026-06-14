'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { Send, Leaf } from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { useChat } from '@/hooks/useChat';
import { useUserStore } from '@/stores/userStore';

interface ChatInterfaceProps {
  scoreContext?: number;
}

/**
 * Full-height chat interface for the AI coach.
 * Features: message list, typing indicator, textarea input, keyboard shortcuts.
 * Accessibility: aria-live on message list, aria-busy on sending state.
 */
export function ChatInterface({ scoreContext }: ChatInterfaceProps) {
  const { chatHistory, sendMessage } = useChat();
  const { userData } = useUserStore();
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, sending]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setInput('');
    setSending(true);
    await sendMessage(trimmed);
    setSending(false);
    textareaRef.current?.focus();
  }, [input, sending, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const userInitial = userData?.name?.charAt(0) ?? 'U';
  const isAnonymous = userData?.isAnonymous ?? false;
  const guestMessageCount = isAnonymous
    ? chatHistory.filter((m) => m.role === 'user').length
    : 0;
  const guestLimitReached = isAnonymous && guestMessageCount >= 5;

  return (
    <div className="flex flex-col h-full">
      {/* Context banner */}
      {scoreContext !== undefined && (
        <div
          className="px-4 py-2 text-xs flex items-center gap-2 border-b"
          style={{
            background: 'rgba(22,163,74,0.08)',
            borderColor: 'rgba(22,163,74,0.2)',
            color: 'var(--color-text-muted)',
          }}
        >
          <Leaf
            className="w-3.5 h-3.5 shrink-0"
            style={{ color: 'var(--color-forest-light)' }}
            aria-hidden="true"
          />
          Coaching based on your Carbon Score:{' '}
          <span className="font-bold" style={{ color: 'var(--color-forest-light)' }}>
            {scoreContext}/100
          </span>
        </div>
      )}

      {/* Guest limit banner */}
      {isAnonymous && (
        <div
          className="px-4 py-2 text-xs text-center border-b"
          style={{
            background: 'rgba(245,158,11,0.08)',
            borderColor: 'rgba(245,158,11,0.2)',
            color: 'var(--color-amber)',
          }}
        >
          {guestLimitReached
            ? '🔒 Sign in to continue chatting — limit reached'
            : `${guestMessageCount}/5 free messages used — sign in for unlimited coaching`}
        </div>
      )}

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-4"
        aria-live="polite"
        aria-atomic="false"
        aria-label="Chat messages"
        aria-busy={sending}
      >
        {chatHistory.length === 0 && !sending && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 py-16">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(22,163,74,0.12)' }}
              aria-hidden="true"
            >
              <Leaf className="w-8 h-8" style={{ color: 'var(--color-forest-light)' }} />
            </div>
            <h3 className="font-semibold text-lg">Your AI Sustainability Coach</h3>
            <p className="text-sm max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
              Ask me anything about reducing your carbon footprint, sustainable swaps, or
              your daily habits.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                'How can I reduce my transport emissions?',
                'Suggest a sustainable lunch',
                'What is my biggest carbon category?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-xs px-3 py-1.5 rounded-full border transition-colors"
                  style={{
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {chatHistory.map((msg) => (
          <ChatMessage key={msg.id} message={msg} userInitial={userInitial} />
        ))}

        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
        <div
          className="flex gap-2 items-end rounded-xl border p-2 transition-all"
          style={{
            background: 'var(--color-card)',
            borderColor: 'var(--color-border)',
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Message your sustainability coach
          </label>
          <textarea
            id="chat-input"
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              guestLimitReached
                ? 'Sign in to continue...'
                : 'Ask your coach... (Enter to send, Shift+Enter for newline)'
            }
            disabled={sending || guestLimitReached}
            rows={1}
            maxLength={500}
            className="flex-1 resize-none bg-transparent text-sm outline-none py-1.5 px-2"
            style={{
              color: 'var(--color-text-primary)',
              maxHeight: '8rem',
              overflowY: 'auto',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending || guestLimitReached}
            aria-label="Send message"
            className="p-2 rounded-lg transition-all shrink-0"
            style={{
              background:
                input.trim() && !sending && !guestLimitReached
                  ? 'var(--color-forest)'
                  : 'rgba(255,255,255,0.05)',
              color: input.trim() && !sending ? 'white' : 'var(--color-text-muted)',
              cursor:
                input.trim() && !sending && !guestLimitReached
                  ? 'pointer'
                  : 'not-allowed',
            }}
          >
            <Send className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        <p
          className="text-xs mt-1.5 text-right"
          style={{ color: 'var(--color-text-muted)' }}
        >
          {input.length}/500
        </p>
      </div>
    </div>
  );
}
