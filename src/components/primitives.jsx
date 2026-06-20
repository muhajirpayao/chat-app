export function PresenceDot({ status = 'offline', className = 'absolute bottom-0 right-0' }) {
  const color =
    status === 'online' ? 'bg-emerald-500' : status === 'away' ? 'bg-amber-400' : 'bg-slate-400';
  return (
    <span
      className={`block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${color} ${className}`}
    />
  );
}

export function Avatar({ user, className = 'h-10 w-10', showStatus = true }) {
  return (
    <span className={`relative inline-block shrink-0 ${className}`}>
      <img src={user.avatarUrl} alt={user.name} className="h-full w-full rounded-full object-cover" />
      {showStatus && user.status && <PresenceDot status={user.status} />}
    </span>
  );
}

export function UnreadBadge({ count }) {
  if (!count) return null;
  return (
    <span className="inline-flex h-5  items-center justify-center rounded-full from-violet-600 to-fuchsia-500 px-1.5 text-[11px] font-semibold text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}