import { useEffect, type ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, subtitle, onClose, children, footer }: ModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className={`modal-bg${open ? ' on' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="mhead">
          <div>
            <div className="mtitle">{title}</div>
            {subtitle && <div className="msub">{subtitle}</div>}
          </div>
          <button className="mclose" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
        {footer && (
          <>
            <hr className="mdivider" />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>{footer}</div>
          </>
        )}
      </div>
    </div>
  );
}
