import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifStore } from '@/store/notificationStore';
import type { Notification } from '@/store/notificationStore';

const TYPE_ICON: Record<string, string> = {
  success: '✅', warning: '⚠️', info: 'ℹ️', error: '❌',
};

function timeAgo(iso: string): string {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60)    return 'just now';
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { notifications, markRead, markAllRead, unreadCount } = useNotifStore();
  const count = unreadCount();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.link) navigate(n.link);
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        className="notif-bell"
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
      >
        🔔
        {count > 0 && <span className="notif-badge">{count}</span>}
      </button>

      {open && (
        <div className="notif-drop">
          <div className="notif-drop-head">
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 13, color: 'var(--text)' }}>
              Notifications
            </span>
            {count > 0 && (
              <button
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent)' }}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {notifications.length === 0 ? (
              <div style={{ padding: '24px 16px', textAlign: 'center', fontSize: 12, color: 'var(--muted)' }}>
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`notif-item${n.read ? '' : ' unread'}`}
                  onClick={() => handleClick(n)}
                >
                  <span className="notif-icon">{TYPE_ICON[n.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: n.read ? 400 : 600, color: 'var(--text)', marginBottom: 2 }}>
                      {n.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{n.body}</div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 4 }}>{timeAgo(n.time)}</div>
                  </div>
                  {!n.read && <span className="notif-dot" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
