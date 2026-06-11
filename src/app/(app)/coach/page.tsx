'use client';

import { ChatInterface } from '@/components/coach/ChatInterface';
import { useUserStore } from '@/stores/userStore';

export default function CoachPage() {
  const { carbonScore } = useUserStore();

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <header className="mb-4">
        <h1 className="text-2xl font-bold mb-1">AI Sustainability Coach</h1>
        <p style={{ color: 'var(--color-text-muted)' }} className="text-sm">
          Ask me anything about reducing your carbon footprint
        </p>
      </header>

      <div
        className="glass-card flex-1 flex flex-col overflow-hidden"
      >
        <ChatInterface scoreContext={carbonScore?.overall} />
      </div>
    </div>
  );
}
