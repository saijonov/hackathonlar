'use client';

/**
 * Last-resort boundary: only runs when the root layout itself throws, so it has
 * to ship its own <html>/<body> and cannot rely on next-intl or the design
 * tokens being available.
 */
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="uz">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          background: '#F5F1E8',
          color: '#16130F',
          fontFamily: 'system-ui, sans-serif',
          textAlign: 'center',
          padding: '2rem',
        }}
      >
        <div>
          <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem' }}>Nimadir noto‘g‘ri ketdi</h1>
          <p style={{ margin: '0 0 1.5rem', color: '#4A443B' }}>
            Sahifani yuklab bo‘lmadi. Qayta urinib ko‘ring.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: '#046D82',
              color: '#fff',
              border: 0,
              borderRadius: 8,
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Qayta urinish
          </button>
        </div>
      </body>
    </html>
  );
}
