export default function MessageBubble({ message, isOwn, isLastOwnSeen }) {
  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className={`group flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
          isOwn
            ? 'rounded-br-md  from-violet-600 to-fuchsia-500 text-white'
            : 'rounded-bl-md bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
      </div>
      <span className="mt-1 px-1 text-[11px] text-slate-400 opacity-0 transition-opacity group-hover:opacity-100">
        {time}
        {isLastOwnSeen ? ' · Seen' : ''}
      </span>
    </div>
  );
}