import { useEffect, useRef } from 'react';

export default function LogPanel({ logs }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div style={{
      background: 'var(--bg-secondary)',
      border: '1px solid var(--border)',
      borderRadius: 6,
      height: 160,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{
        padding: '6px 10px',
        borderBottom: '1px solid var(--border)',
        fontSize: 10,
        fontFamily: 'Syne, sans-serif',
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        flexShrink: 0,
      }}>
        Operation Log
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {logs.length === 0 ? (
          <div style={{ padding: '8px 10px', color: 'var(--text-muted)', fontSize: 11, fontFamily: 'Space Mono, monospace' }}>
            No operations yet...
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className={`log-entry ${log.logType || 'info'}`}>
              <span style={{ color: 'var(--text-muted)', marginRight: 8 }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {log.message}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
