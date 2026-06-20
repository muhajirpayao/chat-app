import { useRef } from 'react';
import { Avatar } from './primitives';
import ConversationThread from './ConversationThread';

export default function ChatHeadLayer({
  heads,
  conversations,
  currentUser,
  onExpand,
  onMinimize,
  onClose,
  onMove,
  onBringToFront,
  onSend,
}) {
  // Heads only store a conversationId — we resolve the live conversation here so
  // a message sent from the main panel and a message sent from a floating window
  // always agree on the same data.
  const resolved = heads
    .map((h) => ({ ...h, conversation: conversations.find((c) => c.id === h.conversationId) }))
    .filter((h) => h.conversation);

  return (
    <>
      {resolved
        .filter((h) => h.state === 'minimized')
        .map((h) => (
          <ChatHeadBubble
            key={h.id}
            head={h}
            onExpand={onExpand}
            onClose={onClose}
            onMove={onMove}
            bringToFront={onBringToFront}
          />
        ))}
      {resolved
        .filter((h) => h.state === 'expanded')
        .map((h) => (
          <ChatHeadWindow
            key={h.id}
            head={h}
            currentUser={currentUser}
            onMinimize={onMinimize}
            onClose={onClose}
            onMove={onMove}
            bringToFront={onBringToFront}
            onSend={onSend}
          />
        ))}
    </>
  );
}

function ChatHeadBubble({ head, onExpand, onClose, onMove, bringToFront }) {
  const dragRef = useRef(null);
  const draggedRef = useRef(false);

  function onPointerDown(e) {
    bringToFront(head.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: head.position };
    draggedRef.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) draggedRef.current = true;
    onMove(head.id, { x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy });
  }
  function onPointerUp() {
    dragRef.current = null;
  }
  function handleClick() {
    // Only expand if this was a tap, not the end of a drag
    if (!draggedRef.current) onExpand(head.id);
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onClick={handleClick}
      style={{ left: head.position.x, top: head.position.y, zIndex: head.z }}
      className="group fixed h-14 w-14 touch-none select-none rounded-full"
    >
      {head.unread > 0 && (
        <span
          className="absolute animate-pulse rounded-full  from-violet-500 to-fuchsia-500 opacity-70"
          style={{ inset: -4 }}
        />
      )}
      <Avatar
        user={head.conversation.participant}
        className="relative h-14 w-14 ring-2 ring-white dark:ring-slate-900"
      />
      {head.unread > 0 && (
        <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full from-violet-600 to-fuchsia-500 text-[11px] font-semibold text-white ring-2 ring-white dark:ring-slate-900">
          {head.unread > 9 ? '9+' : head.unread}
        </span>
      )}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose(head.id);
        }}
        aria-label="Close chat head"
        className="absolute -left-1 -top-1 hidden h-5 w-5 place-items-center rounded-full bg-slate-700 text-[10px] text-white group-hover:grid"
      >
        ✕
      </button>
    </div>
  );
}

function ChatHeadWindow({ head, currentUser, onMinimize, onClose, onMove, bringToFront, onSend }) {
  const dragRef = useRef(null);

  function onPointerDown(e) {
    bringToFront(head.id);
    dragRef.current = { startX: e.clientX, startY: e.clientY, origin: head.position };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    onMove(head.id, { x: dragRef.current.origin.x + dx, y: dragRef.current.origin.y + dy });
  }
  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <div
      style={{ left: head.position.x, top: head.position.y, zIndex: head.z }}
      className="fixed flex w-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
    >
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="flex cursor-grab items-center gap-2 border-b border-slate-200 px-3 py-2 active:cursor-grabbing dark:border-slate-800"
      >
        <Avatar user={head.conversation.participant} className="h-7 w-7" showStatus={false} />
        <span className="flex-1 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
          {head.conversation.participant.name}
        </span>
        <button
          onClick={() => onMinimize(head.id)}
          aria-label="Minimize chat"
          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          –
        </button>
        <button
          onClick={() => onClose(head.id)}
          aria-label="Close chat"
          className="grid h-6 w-6 place-items-center rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        <ConversationThread
          conversation={head.conversation}
          currentUser={currentUser}
          isTyping={false}
          onSend={(text) => onSend(head.id, text)}
          compact
        />
      </div>
    </div>
  );
}