import { useEffect, useRef, useState } from 'react';
import { Avatar } from './primitives';
import MessageBubble from './MessageBubble';

function TypingDots() {
  return (
    <div className="flex w-fit items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </div>
  );
}

export default function ConversationThread({
  conversation,
  currentUser,
  isTyping = false,
  onSend,
  onPopOut,
  compact = false,
}) {
  const [draft, setDraft] = useState('');
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [conversation.messages.length, isTyping]);

  function handleSend() {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft('');
  }

  const lastOwnMessage = [...conversation.messages].reverse().find((m) => m.senderId === currentUser.id);

  return (
    <section className="flex h-full flex-1 flex-col bg-white dark:bg-slate-950">
      {!compact && (
        <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
          <Avatar user={conversation.participant} className="h-10 w-10" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-slate-900 dark:text-slate-100">
              {conversation.participant.name}
            </p>
            <p className="text-xs capitalize text-slate-400">{conversation.participant.status}</p>
          </div>
          {onPopOut && (
            <button
              onClick={onPopOut}
              title="Pop out into a chat head"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ⧉
            </button>
          )}
        </header>
      )}

      <div
        ref={scrollRef}
        className={`flex-1 space-y-3 overflow-y-auto scrollbar-none ${compact ? 'px-3 py-3' : 'px-5 py-4'}`}
      >
        {conversation.messages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            isOwn={m.senderId === currentUser.id}
            isLastOwnSeen={m.id === lastOwnMessage?.id && m.seen}
          />
        ))}
        {isTyping && <TypingDots />}
      </div>

      <div className={`border-t border-slate-200 dark:border-slate-800 ${compact ? 'px-2 py-2' : 'px-4 py-3'}`}>
        <div className="flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1.5 dark:bg-slate-800">
          <button
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-base text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700"
            aria-label="Add emoji"
          >
            🙂
          </button>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={`Message ${conversation.participant.name}`}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim()}
            aria-label="Send message"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full  from-violet-600 to-fuchsia-500 text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SendIcon />
          </button>
        </div>
      </div>
    </section>
  );
}

function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 2 11 13" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2 15 22l-4-9-9-4 20-7Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}