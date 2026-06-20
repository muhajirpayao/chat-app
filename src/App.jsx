import React, { useState, useEffect, useRef, useCallback } from 'react'

// ─── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  light: {
    bg: '#F0FAFA', surface: '#FFFFFF', accent: '#0BBFBF', accentDeep: '#089898',
    accentSoft: '#E0F7F7', accentGlow: '0 4px 20px rgba(11,191,191,0.35)',
    text: '#0A2E2E', textMuted: '#4A8080', textLight: '#8ABABA', border: '#C8EEEE',
    bubbleOut: '#0BBFBF', bubbleOutText: '#FFFFFF', bubbleIn: '#FFFFFF', bubbleInText: '#0A2E2E',
    inputBg: '#F0FAFA', shadow: '0 2px 12px rgba(11,191,191,0.12)',
    shadowHeavy: '0 8px 32px rgba(11,191,191,0.22)',
  },
  dark: {
    bg: '#061A1A', surface: '#0D2B2B', accent: '#0DDADA', accentDeep: '#0BBFBF',
    accentSoft: '#0D2B2B', accentGlow: '0 4px 20px rgba(13,218,218,0.3)',
    text: '#E0FAFA', textMuted: '#5AACAC', textLight: '#2A6060', border: '#0F3A3A',
    bubbleOut: '#0DDADA', bubbleOutText: '#061A1A', bubbleIn: '#0F3A3A', bubbleInText: '#E0FAFA',
    inputBg: '#0F3A3A', shadow: '0 2px 12px rgba(0,0,0,0.5)',
    shadowHeavy: '0 8px 32px rgba(0,0,0,0.6)',
  }
}

// ─── USERS (2 people only, no signup) ─────────────────────────────────────────
const ACCOUNTS = {
  'me':       { password: 'ocean123',   id: 'me',       name: 'You',      avatar: '🙂', color: '#089898' },
  'zharmina': { password: 'blossom123', id: 'zharmina', name: 'Zharmina', avatar: '🌸', color: '#0BBFBF' },
}
const ZHARMINA = ACCOUNTS['zharmina']

const INIT_MSGS = [
  { id: 'm1', from: 'zharmina', text: 'heyy are you there? 🌊', time: '10:20 AM', seen: true },
  { id: 'm2', from: 'me',       text: "yeah! what's up 😊",     time: '10:21 AM', seen: true },
  { id: 'm3', from: 'zharmina', text: 'nothing much just bored lol', time: '10:22 AM', seen: true },
  { id: 'm4', from: 'zharmina', text: 'wanna watch something later?', time: '10:22 AM', seen: true },
  { id: 'm5', from: 'me',       text: 'sure!! what are you thinking', time: '10:23 AM', seen: true },
  { id: 'm6', from: 'zharmina', text: 'idk you pick 😄', time: '10:25 AM', seen: false },
]

const AUTO_REPLIES = [
  'haha yes!!', 'omg same 😂', 'wait really??', "that's so cool!!", 'yesss 🌊',
  'i was just thinking that', 'okay okay okay', 'nooo way', '💙', 'hahaha',
  'tell me more', 'aww 🥺', 'lol okay', 'facts', '🌸🌸', 'brb 1 sec',
  'omg tell me everything', 'hehe 🌊', 'yasss', "i can't 😂"
]

const EMOJIS = ['😊','🥰','😂','🤩','💙','🌊','🌸','✨','🔥','💯','👏','🥺','😭','🤔','😅','❤️','💚','🫶','🎉','😎']

const genId = () => Math.random().toString(36).slice(2, 9)
const nowTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

// ─── PWA + NOTIFICATION HELPERS ───────────────────────────────────────────────
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  }
}

async function requestNotifPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function sendLocalNotif(title, body, icon = '🌸') {
  if (Notification.permission !== 'granted') return
  // Use service worker for background-capable notification
  if (navigator.serviceWorker?.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SHOW_NOTIFICATION', title, body, icon
    })
  } else {
    new Notification(title, { body, icon: '/icon-192.png', badge: '/icon-192.png', vibrate: [200, 100, 200] })
  }
}

function playNotifSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.connect(g); g.connect(ctx.destination)
    o.frequency.setValueAtTime(880, ctx.currentTime)
    o.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.1)
    g.gain.setValueAtTime(0.3, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)
    o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.3)
  } catch (_) {}
}

// ─── AVATAR ────────────────────────────────────────────────────────────────────
function Avatar({ user, size = 40, showStatus = false }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: `linear-gradient(135deg, ${user.color}33, ${user.color}11)`,
        border: `2px solid ${user.color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size * 0.44, userSelect: 'none',
      }}>{user.avatar}</div>
      {showStatus && (
        <div style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.27, height: size * 0.27, borderRadius: '50%',
          background: '#22C97A', border: '2.5px solid white',
        }} />
      )}
    </div>
  )
}

// ─── EMOJI PICKER ──────────────────────────────────────────────────────────────
function EmojiPicker({ onSelect, t, onClose }) {
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
      <div style={{
        position: 'absolute', bottom: '110%', left: 0,
        background: t.surface, border: `1px solid ${t.border}`,
        borderRadius: 18, padding: '12px 14px',
        boxShadow: t.shadowHeavy,
        display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6,
        zIndex: 300, width: 222,
      }}>
        {EMOJIS.map(e => (
          <button key={e} onClick={() => onSelect(e)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: 24, padding: '4px', borderRadius: 8, lineHeight: 1,
          }}>{e}</button>
        ))}
      </div>
    </>
  )
}

// ─── LOGIN SCREEN ──────────────────────────────────────────────────────────────
function LoginScreen({ onLogin, t, darkMode, setDarkMode }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')
  const [showPass, setShowPass] = useState(false)

  const submit = () => {
    const acct = ACCOUNTS[username.toLowerCase().trim()]
    if (!acct) { setErr('Username not found'); return }
    if (acct.password !== password) { setErr('Wrong password'); return }
    setErr('')
    onLogin(acct)
  }

  return (
    <div style={{
      minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: t.bg, padding: '24px 20px',
      fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      <button onClick={() => setDarkMode(v => !v)} style={{
        position: 'absolute', top: 20, right: 20,
        background: t.accentSoft, border: `1px solid ${t.border}`,
        borderRadius: 12, padding: '8px 12px', cursor: 'pointer', fontSize: 18,
      }}>{darkMode ? '☀️' : '🌙'}</button>

      <div style={{ width: '100%', maxWidth: 340 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 28,
            background: `linear-gradient(135deg, ${t.accent}, #06D6D6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 38, margin: '0 auto 16px', boxShadow: t.accentGlow,
          }}>🌊</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: t.text, letterSpacing: -1 }}>
            just us 🌸
          </h1>
          <p style={{ margin: '6px 0 0', color: t.textMuted, fontSize: 14 }}>
            private chat · you & zharmina only
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: t.surface, borderRadius: 24, padding: '28px 24px',
          boxShadow: t.shadowHeavy, border: `1px solid ${t.border}`,
        }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Username
            </label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="me  or  zharmina"
              autoCapitalize="none"
              style={inp(t)}
            />
          </div>
          <div style={{ marginBottom: 6, position: 'relative' }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: t.textMuted, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Password
            </label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
              placeholder="••••••••"
              type={showPass ? 'text' : 'password'}
              style={{ ...inp(t), paddingRight: 44 }}
            />
            <button onClick={() => setShowPass(v => !v)} style={{
              position: 'absolute', right: 12, bottom: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 16, color: t.textMuted,
            }}>{showPass ? '🙈' : '👁️'}</button>
          </div>

          {err && (
            <div style={{
              background: '#FF475715', border: '1px solid #FF4757',
              borderRadius: 10, padding: '8px 12px', marginBottom: 14,
              fontSize: 13, color: '#FF4757',
            }}>⚠️ {err}</div>
          )}

          <button onClick={submit} style={{
            width: '100%', padding: '15px 0', marginTop: 8,
            background: `linear-gradient(135deg, ${t.accent}, #06D6D6)`,
            color: darkMode ? '#061A1A' : '#fff',
            border: 'none', borderRadius: 14,
            fontSize: 16, fontWeight: 700, cursor: 'pointer',
            boxShadow: t.accentGlow, letterSpacing: -0.3,
            fontFamily: 'inherit',
          }}>
            Sign in →
          </button>

          {/* Hint */}
          <div style={{
            marginTop: 16, padding: '10px 12px',
            background: t.accentSoft, borderRadius: 12,
            fontSize: 12, color: t.textMuted, lineHeight: 1.6,
          }}>
            💡 <strong style={{ color: t.accent }}>Hint:</strong><br />
            Username: <code style={{ color: t.accent }}>me</code> or <code style={{ color: t.accent }}>zharmina</code><br />
            (ask each other for the password 🤫)
          </div>
        </div>
      </div>
    </div>
  )
}

const inp = (t) => ({
  width: '100%', padding: '13px 14px',
  background: t.inputBg, border: `1.5px solid ${t.border}`,
  borderRadius: 12, fontSize: 15, color: t.text,
  outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit',
})

// ─── FLOATING CHAT HEAD ────────────────────────────────────────────────────────
function FloatingHead({ unread, onOpen, t }) {
  const [pos, setPos] = useState({ x: window.innerWidth - 74, y: window.innerHeight - 180 })
  const [pulse, setPulse] = useState(false)
  const dragging = useRef(false)
  const moved = useRef(false)
  const startRef = useRef(null)

  useEffect(() => {
    if (unread > 0) {
      setPulse(true)
      const id = setTimeout(() => setPulse(false), 700)
      return () => clearTimeout(id)
    }
  }, [unread])

  const onPointerDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true; moved.current = false
    startRef.current = { px: e.clientX - pos.x, py: e.clientY - pos.y }
  }
  const onPointerMove = (e) => {
    if (!dragging.current) return
    moved.current = true
    setPos({
      x: Math.max(4, Math.min(window.innerWidth - 68, e.clientX - startRef.current.px)),
      y: Math.max(4, Math.min(window.innerHeight - 68, e.clientY - startRef.current.py)),
    })
  }
  const onPointerUp = () => {
    if (dragging.current && !moved.current) onOpen()
    dragging.current = false
  }

  return (
    <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: 64, height: 64, borderRadius: '50%',
        cursor: 'grab', zIndex: 9999, userSelect: 'none', touchAction: 'none',
        transform: pulse ? 'scale(1.18)' : 'scale(1)',
        transition: 'transform 0.18s cubic-bezier(.34,1.56,.64,1)',
        boxShadow: unread > 0
          ? `0 0 0 3px ${t.accent}, 0 0 0 6px ${t.accent}33, ${t.accentGlow}`
          : t.shadowHeavy,
      }}>
      <div style={{
        width: 64, height: 64, borderRadius: '50%',
        background: `linear-gradient(135deg, ${t.accent}, #06D6D6)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30,
      }}>🌸</div>
      {unread > 0 && (
        <div style={{
          position: 'absolute', top: -2, right: -2,
          background: '#FF4757', color: '#fff', borderRadius: '50%',
          minWidth: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 800, border: '2.5px solid white',
          padding: '0 5px', boxSizing: 'border-box',
          animation: 'pop 0.35s cubic-bezier(.34,1.56,.64,1)',
        }}>{unread}</div>
      )}
    </div>
  )
}

// ─── MINI CHAT BUBBLE ──────────────────────────────────────────────────────────
function MiniChat({ messages, onSend, onClose, onExpand, t, darkMode }) {
  const [msg, setMsg] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [pos, setPos] = useState({
    x: Math.max(8, window.innerWidth - 330),
    y: Math.max(8, window.innerHeight - 430),
  })
  const msgEndRef = useRef(null)
  const dragging = useRef(false)
  const moved = useRef(false)
  const startRef = useRef(null)

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = () => {
    if (!msg.trim()) return
    onSend(msg); setMsg(''); setShowEmoji(false)
  }

  const onPointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('input')) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragging.current = true; moved.current = false
    startRef.current = { px: e.clientX - pos.x, py: e.clientY - pos.y }
  }
  const onPointerMove = (e) => {
    if (!dragging.current) return
    moved.current = true
    setPos({
      x: Math.max(4, Math.min(window.innerWidth - 318, e.clientX - startRef.current.px)),
      y: Math.max(4, Math.min(window.innerHeight - 430, e.clientY - startRef.current.py)),
    })
  }
  const onPointerUp = () => { dragging.current = false }

  return (
    <div onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      style={{
        position: 'fixed', left: pos.x, top: pos.y,
        width: 318, height: 420,
        background: t.surface, borderRadius: 24,
        boxShadow: t.shadowHeavy, border: `1.5px solid ${t.accent}55`,
        display: 'flex', flexDirection: 'column',
        zIndex: 9998, userSelect: 'none', touchAction: 'none',
        fontFamily: "'Inter', -apple-system, sans-serif", overflow: 'hidden',
        animation: 'slideUp 0.25s cubic-bezier(.34,1.56,.64,1)',
      }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px',
        background: `linear-gradient(135deg, ${t.accent}22, ${t.accentSoft})`,
        borderBottom: `1px solid ${t.border}`, cursor: 'grab', flexShrink: 0,
      }}>
        <Avatar user={ZHARMINA} size={36} showStatus />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: t.text }}>Zharmina 🌸</div>
          <div style={{ fontSize: 11, color: '#22C97A' }}>● Active now</div>
        </div>
        <button onClick={onExpand} title="Open full chat" style={miniBtn(t)}>⛶</button>
        <button onClick={onClose} title="Close" style={miniBtn(t)}>✕</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '10px 12px',
        display: 'flex', flexDirection: 'column', gap: 5,
      }}>
        {messages.slice(-8).map(m => {
          const isMe = m.from === 'me'
          return (
            <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: 200, padding: '8px 12px',
                background: isMe ? t.bubbleOut : t.bubbleIn,
                color: isMe ? t.bubbleOutText : t.bubbleInText,
                borderRadius: isMe ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                fontSize: 13.5, lineHeight: 1.45,
                border: isMe ? 'none' : `1px solid ${t.border}`,
                boxShadow: isMe ? t.accentGlow : 'none',
              }}>{m.text}</div>
            </div>
          )
        })}
        <div ref={msgEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '8px 10px', borderTop: `1px solid ${t.border}`,
        display: 'flex', gap: 6, alignItems: 'center',
        position: 'relative', flexShrink: 0,
      }}>
        {showEmoji && <EmojiPicker t={t} onSelect={e => { setMsg(m => m + e); setShowEmoji(false) }} onClose={() => setShowEmoji(false)} />}
        <button onClick={() => setShowEmoji(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 22, padding: 2, lineHeight: 1 }}>😊</button>
        <input
          value={msg} onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Message..."
          style={{
            flex: 1, padding: '9px 12px', borderRadius: 20,
            background: t.inputBg, border: `1px solid ${t.border}`,
            fontSize: 14, color: t.text, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button onClick={send} style={{
          width: 36, height: 36, borderRadius: '50%',
          background: msg.trim() ? `linear-gradient(135deg, ${t.accent}, #06D6D6)` : t.border,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 16, color: darkMode ? '#061A1A' : '#fff', flexShrink: 0,
          boxShadow: msg.trim() ? t.accentGlow : 'none', transition: 'all 0.15s',
        }}>➤</button>
      </div>
    </div>
  )
}

const miniBtn = (t) => ({
  background: 'none', border: 'none', cursor: 'pointer',
  color: t.textMuted, fontSize: 15, padding: '4px 7px', borderRadius: 8,
})

// ─── FULL CHAT ─────────────────────────────────────────────────────────────────
function FullChat({ messages, onSend, onBack, t, darkMode, typing, setDarkMode, currentUser, notifGranted, onRequestNotif, onLogout }) {
  const [msg, setMsg] = useState('')
  const [showEmoji, setShowEmoji] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const msgEndRef = useRef(null)

  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, typing])

  const send = () => {
    if (!msg.trim()) return
    onSend(msg); setMsg(''); setShowEmoji(false)
  }

  return (
    <div style={{
      height: '100dvh', display: 'flex', flexDirection: 'column',
      background: t.bg, fontFamily: "'Inter', -apple-system, sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px', background: t.surface,
        borderBottom: `1px solid ${t.border}`,
        display: 'flex', alignItems: 'center', gap: 12,
        boxShadow: t.shadow, flexShrink: 0,
        paddingTop: 'max(10px, calc(10px + env(safe-area-inset-top)))',
      }}>
        <button onClick={onBack} style={{
          background: t.accentSoft, border: 'none', borderRadius: 12,
          cursor: 'pointer', padding: '8px 11px', fontSize: 18, color: t.accent,
        }}>←</button>
        <Avatar user={ZHARMINA} size={44} showStatus />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: 17, color: t.text }}>Zharmina 🌸</div>
          <div style={{ fontSize: 12, color: typing ? t.accent : '#22C97A', transition: 'color 0.2s' }}>
            {typing ? '✍️ typing...' : '● Active now'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {!notifGranted && (
            <button onClick={onRequestNotif} title="Enable notifications" style={{
              background: '#FF475722', border: '1px solid #FF4757',
              borderRadius: 10, cursor: 'pointer', padding: '7px 9px', fontSize: 15,
            }}>🔔</button>
          )}
          <button onClick={() => setDarkMode(v => !v)} style={{
            background: t.accentSoft, border: 'none', borderRadius: 10,
            cursor: 'pointer', padding: '7px 9px', fontSize: 15,
          }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={() => setShowInfo(v => !v)} style={{
            background: t.accentSoft, border: 'none', borderRadius: 10,
            cursor: 'pointer', padding: '7px 9px', fontSize: 15,
          }}>⋯</button>
        </div>
      </div>

      {/* Info dropdown */}
      {showInfo && (
        <div style={{
          position: 'absolute', top: 'calc(70px + env(safe-area-inset-top))', right: 14,
          background: t.surface, border: `1px solid ${t.border}`, borderRadius: 16,
          boxShadow: t.shadowHeavy, zIndex: 200, overflow: 'hidden', minWidth: 180,
        }}>
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.border}` }}>
            <div style={{ fontSize: 13, color: t.textMuted }}>Signed in as</div>
            <div style={{ fontWeight: 700, color: t.text, marginTop: 2 }}>{currentUser.name} {currentUser.avatar}</div>
          </div>
          <button onClick={() => { setShowInfo(false); onLogout() }} style={{
            width: '100%', padding: '12px 16px', background: 'none', border: 'none',
            cursor: 'pointer', color: '#FF4757', fontSize: 14, fontWeight: 600,
            textAlign: 'left', fontFamily: 'inherit',
          }}>🚪 Sign out</button>
        </div>
      )}
      {showInfo && <div onClick={() => setShowInfo(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}

      {/* Date label */}
      <div style={{ textAlign: 'center', padding: '14px 0 6px' }}>
        <span style={{
          fontSize: 11, color: t.textMuted, background: t.surface,
          borderRadius: 99, padding: '4px 14px', border: `1px solid ${t.border}`,
        }}>Today</span>
      </div>

      {/* Notification banner */}
      {!notifGranted && (
        <div onClick={onRequestNotif} style={{
          margin: '0 14px 8px', padding: '10px 14px',
          background: `linear-gradient(135deg, ${t.accent}18, ${t.accentSoft})`,
          border: `1px solid ${t.accent}44`, borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
        }}>
          <span style={{ fontSize: 20 }}>🔔</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: t.text }}>Enable notifications</div>
            <div style={{ fontSize: 11, color: t.textMuted }}>Get notified even when the app is in background</div>
          </div>
          <span style={{ marginLeft: 'auto', color: t.accent, fontSize: 13, fontWeight: 600 }}>Allow →</span>
        </div>
      )}

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '4px 14px 12px',
        display: 'flex', flexDirection: 'column', gap: 2,
      }}>
        {messages.map((m, i) => {
          const isMe = m.from === 'me'
          const prev = messages[i - 1]
          const next = messages[i + 1]
          const showAv = !isMe && (!prev || prev.from !== m.from)
          const sameNext = next?.from === m.from
          return (
            <div key={m.id} style={{
              display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row',
              alignItems: 'flex-end', gap: 8, marginTop: showAv ? 12 : sameNext ? 1 : 2,
            }}>
              {!isMe && <div style={{ width: 32 }}>{showAv ? <Avatar user={ZHARMINA} size={32} /> : null}</div>}
              <div style={{ maxWidth: '76%' }}>
                <div style={{
                  padding: '10px 14px',
                  background: isMe ? t.bubbleOut : t.bubbleIn,
                  color: isMe ? t.bubbleOutText : t.bubbleInText,
                  borderRadius: isMe
                    ? `18px 18px ${sameNext ? '6px' : '4px'} 18px`
                    : `18px 18px 18px ${sameNext ? '6px' : '4px'}`,
                  fontSize: 15, lineHeight: 1.5,
                  border: isMe ? 'none' : `1px solid ${t.border}`,
                  boxShadow: isMe ? t.accentGlow : t.shadow,
                }}>{m.text}</div>
                {!sameNext && (
                  <div style={{
                    fontSize: 10.5, color: t.textLight, marginTop: 3,
                    textAlign: isMe ? 'right' : 'left', paddingInline: 4,
                  }}>
                    {m.time}
                    {isMe && <span style={{ marginLeft: 4, color: m.seen ? t.accent : t.textLight }}>
                      {m.seen ? '✓✓' : '✓'}
                    </span>}
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {typing && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginTop: 8 }}>
            <Avatar user={ZHARMINA} size={32} />
            <div style={{
              padding: '11px 15px', background: t.bubbleIn,
              border: `1px solid ${t.border}`, borderRadius: '18px 18px 18px 4px',
              display: 'flex', gap: 5, alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: 8, height: 8, borderRadius: '50%', background: t.accent,
                  animation: `bounce 1.1s ${i * 0.18}s infinite ease-in-out`,
                }} />
              ))}
            </div>
          </div>
        )}
        <div ref={msgEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px', background: t.surface,
        borderTop: `1px solid ${t.border}`,
        display: 'flex', gap: 8, alignItems: 'center',
        position: 'relative', flexShrink: 0,
        paddingBottom: 'max(10px, calc(10px + env(safe-area-inset-bottom)))',
      }}>
        {showEmoji && <EmojiPicker t={t} onSelect={e => { setMsg(m => m + e); setShowEmoji(false) }} onClose={() => setShowEmoji(false)} />}
        <button onClick={() => setShowEmoji(v => !v)} style={{
          background: t.accentSoft, border: 'none', borderRadius: 12,
          cursor: 'pointer', padding: '9px 10px', fontSize: 22, lineHeight: 1,
        }}>😊</button>
        <input
          value={msg} onChange={e => setMsg(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Message Zharmina..."
          style={{
            flex: 1, padding: '13px 16px', borderRadius: 26,
            background: t.inputBg, border: `1.5px solid ${t.border}`,
            fontSize: 15, color: t.text, outline: 'none', fontFamily: 'inherit',
          }}
        />
        <button onClick={send} style={{
          width: 48, height: 48, borderRadius: '50%',
          background: msg.trim() ? `linear-gradient(135deg, ${t.accent}, #06D6D6)` : t.border,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color: darkMode ? '#061A1A' : '#fff', flexShrink: 0,
          boxShadow: msg.trim() ? t.accentGlow : 'none', transition: 'all 0.2s',
        }}>➤</button>
      </div>
    </div>
  )
}

// ─── HOME / BACKGROUND VIEW ────────────────────────────────────────────────────
function HomeView({ t, darkMode, setDarkMode, openChat, currentUser, onLogout }) {
  return (
    <div style={{
      height: '100dvh', background: t.bg, position: 'relative', overflow: 'hidden',
      fontFamily: "'Inter', -apple-system, sans-serif",
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 24, padding: 24,
    }}>
      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: 'max(16px, calc(14px + env(safe-area-inset-top))) 16px 14px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: t.surface, borderBottom: `1px solid ${t.border}`,
        boxShadow: t.shadow,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 22 }}>🌊</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 15, color: t.text }}>just us</div>
            <div style={{ fontSize: 11, color: '#22C97A' }}>● {currentUser.name} · online</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setDarkMode(v => !v)} style={{
            background: t.accentSoft, border: 'none', borderRadius: 10,
            cursor: 'pointer', padding: '7px 9px', fontSize: 16,
          }}>{darkMode ? '☀️' : '🌙'}</button>
          <button onClick={onLogout} style={{
            background: '#FF475715', border: '1px solid #FF475744', borderRadius: 10,
            cursor: 'pointer', padding: '7px 9px', fontSize: 16,
          }}>🚪</button>
        </div>
      </div>

      {/* Center content */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>🌸</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: t.text }}>Zharmina is here</div>
        <div style={{ color: t.textMuted, fontSize: 14, marginTop: 6 }}>
          Tap her bubble to chat · or open full chat below
        </div>
      </div>

      <button onClick={openChat} style={{
        padding: '14px 32px',
        background: `linear-gradient(135deg, ${t.accent}, #06D6D6)`,
        color: darkMode ? '#061A1A' : '#fff',
        border: 'none', borderRadius: 16,
        fontSize: 16, fontWeight: 700, cursor: 'pointer',
        boxShadow: t.accentGlow, fontFamily: 'inherit',
      }}>
        💬 Open chat
      </button>

      <div style={{ color: t.textLight, fontSize: 12, textAlign: 'center' }}>
        🫧 The 🌸 bubble floats over everything<br />
        Drag it anywhere · tap to quick-chat
      </div>
    </div>
  )
}

// ─── APP ROOT ──────────────────────────────────────────────────────────────────
export default function App() {
  const [darkMode, setDarkMode]       = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [view, setView]               = useState('home')  // 'home' | 'chat'
  const [messages, setMessages]       = useState(INIT_MSGS)
  const [typing, setTyping]           = useState(false)
  const [unread, setUnread]           = useState(1)
  const [showHead, setShowHead]       = useState(false)
  const [showMini, setShowMini]       = useState(false)
  const [notifGranted, setNotifGranted] = useState(Notification?.permission === 'granted')

  const t = darkMode ? T.dark : T.light

  // Global styles + SW registration
  useEffect(() => {
    registerSW()
    const s = document.createElement('style')
    s.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html, body { height: 100%; overflow: hidden; }
      @keyframes bounce {
        0%,60%,100% { transform: translateY(0); opacity:.4; }
        30% { transform: translateY(-7px); opacity:1; }
      }
      @keyframes pop {
        0% { transform: scale(0); }
        70% { transform: scale(1.25); }
        100% { transform: scale(1); }
      }
      @keyframes slideUp {
        from { transform: translateY(30px) scale(0.95); opacity: 0; }
        to   { transform: translateY(0) scale(1); opacity: 1; }
      }
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-thumb { background: rgba(11,191,191,0.25); border-radius: 99px; }
      input::placeholder { opacity: 0.7; }
    `
    document.head.appendChild(s)
    return () => document.head.removeChild(s)
  }, [])

  const requestNotif = useCallback(async () => {
    const granted = await requestNotifPermission()
    setNotifGranted(granted)
    if (granted) {
      sendLocalNotif('Notifications enabled! 🌸', "You'll get notified even when the app is in background")
    }
  }, [])

  const sendMessage = useCallback((text) => {
    setMessages(prev => [...prev, { id: genId(), from: 'me', text, time: nowTime(), seen: false }])

    const delay = 900 + Math.random() * 1200
    setTimeout(() => setTyping(true), 600)
    setTimeout(() => {
      setTyping(false)
      const reply = {
        id: genId(), from: 'zharmina',
        text: AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)],
        time: nowTime(), seen: true,
      }
      setMessages(prev => [...prev, reply])
      playNotifSound()

      // Only count as unread + notify if not in full chat
      setView(currentView => {
        if (currentView !== 'chat') {
          setUnread(u => u + 1)
          sendLocalNotif('Zharmina 🌸', reply.text)
        }
        return currentView
      })
    }, delay + 1400)
  }, [])

  const openChat = () => {
    setView('chat'); setUnread(0); setShowMini(false)
    setShowHead(true) // keep head visible even in full chat? No — hide when full chat open
    setShowHead(false)
  }

  const goBack = () => {
    setView('home'); setShowHead(true); setShowMini(false)
  }

  const logout = () => {
    setCurrentUser(null); setView('home')
    setShowHead(false); setShowMini(false); setUnread(0)
  }

  // Login screen
  if (!currentUser) {
    return <LoginScreen onLogin={(user) => { setCurrentUser(user); setShowHead(true) }} t={t} darkMode={darkMode} setDarkMode={setDarkMode} />
  }

  // Full chat
  if (view === 'chat') {
    return (
      <FullChat
        messages={messages} onSend={sendMessage}
        onBack={goBack} t={t} darkMode={darkMode}
        typing={typing} setDarkMode={setDarkMode}
        currentUser={currentUser}
        notifGranted={notifGranted}
        onRequestNotif={requestNotif}
        onLogout={logout}
      />
    )
  }

  // Home view + overlays
  return (
    <div style={{ height: '100dvh', position: 'relative', overflow: 'hidden' }}>
      <HomeView
        t={t} darkMode={darkMode} setDarkMode={setDarkMode}
        openChat={openChat} currentUser={currentUser} onLogout={logout}
      />

      {showHead && !showMini && (
        <FloatingHead unread={unread} onOpen={() => { setShowMini(true); setUnread(0) }} t={t} />
      )}

      {showMini && (
        <MiniChat
          messages={messages} onSend={sendMessage}
          onClose={() => { setShowMini(false); setShowHead(true) }}
          onExpand={openChat}
          t={t} darkMode={darkMode}
        />
      )}
    </div>
  )
}