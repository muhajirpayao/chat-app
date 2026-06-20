import { useState } from 'react';
import { Avatar, UnreadBadge } from './primitives';

function timeAgo(date) {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.round(hrs / 24)}d`;
}

export default function Sidebar({ conversations, activeId, onSelect, currentUser, headerSlot }) {
  const [query, setQuery] = useState('');
  const filtered = conversations.filter((c) =>
    c.participant.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-2">
          <Avatar user={currentUser} className="h-9 w-9" showStatus={false} />
          <span className="font-semibold tracking-tight text-slate-900 dark:text-slate-100">Chats</span>
        </div>
        {headerSlot}
      </div>

      <div className="px-3 pb-3">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search people"
            className="w-full rounded-full bg-slate-100 py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 dark:bg-slate-800"
          />
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto scrollbar-none px-2 pb-3">
        {filtered.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const active = c.id === activeId;
          return (
            <button
              key={c.id}
              onClick={() => onSelect(c.id)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                active ? 'bg-violet-50 dark:bg-slate-800' : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
              }`}
            >
              <Avatar user={c.participant} className="h-12 w-12" />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span
                    className={`truncate font-medium ${
                      active ? 'text-violet-700 dark:text-violet-300' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {c.participant.name}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(last.createdAt)}</span>
                </span>
                <span className="mt-0.5 flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-slate-500 dark:text-slate-400">
                    {last.senderId === currentUser.id ? 'You: ' : ''}
                    {last.text}
                  </span>
                  <UnreadBadge count={c.unreadCount} />
                </span>
              </span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-slate-400">No one matches "{query}"</p>
        )}
      </nav>
    </aside>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" strokeLinecap="round" />
    </svg>
  );
}