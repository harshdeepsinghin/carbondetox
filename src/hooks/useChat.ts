'use client';

import { useRef, useCallback } from 'react';
import { useUserStore } from '@/stores/userStore';
import { saveChatMessage } from '@/lib/firebase/firestore';
import type { ChatMessage } from '@/types';

interface UseChatReturn {
  chatHistory: ChatMessage[];
  sendMessage: (content: string) => Promise<string | null>;
  clearHistory: () => void;
}

/** Milliseconds to debounce Firestore persist calls */
const PERSIST_DEBOUNCE_MS = 1500;

/**
 * Hook for managing the AI coach chat.
 * Sends messages to the /api/coach route and persists to Firestore (debounced).
 */
export function useChat(): UseChatReturn {
  const { chatHistory, addChatMessage, clearChatHistory, userData } = useUserStore();
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Debounced Firestore persist — only writes after user stops chatting briefly */
  const debouncedPersist = useCallback(
    (message: ChatMessage) => {
      if (!userData?.uid || userData.isAnonymous) return;

      if (persistTimer.current) clearTimeout(persistTimer.current);
      persistTimer.current = setTimeout(() => {
        saveChatMessage(userData.uid, message).catch(() => {
          // Non-fatal — chat still works without persistence
        });
      }, PERSIST_DEBOUNCE_MS);
    },
    [userData],
  );

  const sendMessage = useCallback(
    async (content: string): Promise<string | null> => {
      if (!userData) return null;

      const userMessage: ChatMessage = {
        id: `msg-${Date.now()}-user`,
        role: 'user',
        content: content.trim(),
        timestamp: new Date().toISOString(),
      };

      addChatMessage(userMessage);
      debouncedPersist(userMessage);

      try {
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content.trim(),
            history: chatHistory.slice(-10).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            uid: userData.uid,
          }),
        });

        if (res.status === 429) {
          return 'Daily limit reached. Come back tomorrow! 🌿';
        }

        if (!res.ok) {
          let errMsg = `HTTP ${res.status}`;
          try {
            const errData = (await res.json()) as { error?: string };
            if (errData?.error) {
              errMsg = errData.error;
            }
          } catch {}
          throw new Error(errMsg);
        }

        const data = (await res.json()) as { reply: string };
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now()}-assistant`,
          role: 'assistant',
          content: data.reply,
          timestamp: new Date().toISOString(),
        };

        addChatMessage(assistantMessage);
        debouncedPersist(assistantMessage);

        return data.reply;
      } catch (error: unknown) {
        const errorText =
          error instanceof Error
            ? error.message
            : "I'm having trouble connecting right now. Please try again in a moment. 🌿";
        const errorMessage: ChatMessage = {
          id: `msg-${Date.now()}-error`,
          role: 'assistant',
          content: errorText,
          timestamp: new Date().toISOString(),
        };
        addChatMessage(errorMessage);
        return null;
      }
    },
    [userData, chatHistory, addChatMessage, debouncedPersist],
  );

  return {
    chatHistory,
    sendMessage,
    clearHistory: clearChatHistory,
  };
}
