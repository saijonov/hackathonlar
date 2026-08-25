import { ImageResponse } from 'next/og';
import { OG, OG_CONTENT_TYPE, OG_SIZE, loadOgFonts } from '@/lib/og';

export const alt = 'hackathonlar.uz — Oʻzbekiston hakatonlari reytingi';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** The site-wide default OG card, generated from the wordmark. */
export default async function OpengraphImage() {
  const fonts = await loadOgFonts();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: OG.paper,
          padding: 72,
          fontFamily: 'Unbounded',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 12,
              background: OG.accent,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="#fff">
              <path d="M12 2.6l2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.03l-5.66 2.98 1.08-6.3L2.85 9.25l6.32-.92z" />
            </svg>
          </div>
          <div style={{ display: 'flex', fontSize: 40, fontWeight: 900, letterSpacing: -1.6 }}>
            <span style={{ color: OG.accent }}>hackathonlar.uz</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div
            style={{
              fontSize: 76,
              fontWeight: 900,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: OG.ink,
              maxWidth: 900,
              display: 'flex',
            }}
          >
            Oʻzbekiston hakatonlari haqida haqiqiy fikrlar
          </div>
          <div style={{ marginTop: 24, fontSize: 30, color: OG.ink3, display: 'flex' }}>
            Tashkiliy jihat · Muloqot · Baholash · Sovrinlar · Sharoit
          </div>
        </div>

        <div style={{ display: 'flex', height: 10, background: OG.accent, borderRadius: 4 }} />
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}
