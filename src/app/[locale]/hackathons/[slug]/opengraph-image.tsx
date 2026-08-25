import { ImageResponse } from 'next/og';
import { getHackathonBySlug } from '@/lib/queries/hackathons';
import { formatDecimal } from '@/lib/format';
import { truncate } from '@/lib/generated-cover';
import { generateCover } from '@/lib/generated-cover';
import { OG, OG_CONTENT_TYPE, OG_SIZE, bandColors, loadOgFonts } from '@/lib/og';
import { type AppLocale } from '@/i18n/routing';

export const alt = 'hackathonlar.uz';
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

type Props = { params: { locale: string; slug: string } };

/**
 * Per-hackathon OG card (PRD 7.3: "generate a dynamic OG image with name +
 * score"). The score is the hero, coloured by the same band scale used
 * everywhere on the site, so a shared link already carries the verdict.
 */
export default async function HackathonOgImage({ params }: Props) {
  const { locale, slug } = params;
  const [hackathon, fonts] = await Promise.all([getHackathonBySlug(slug), loadOgFonts()]);

  const appLocale = (['uz', 'ru', 'en'] as const).includes(locale as AppLocale)
    ? (locale as AppLocale)
    : 'uz';

  const name = hackathon?.name ?? 'hackathonlar.uz';
  const score = hackathon?.score.overall ?? null;
  const reviewCount = hackathon?.score.reviewCount ?? 0;
  const band = bandColors(score);
  const cover = generateCover(slug);

  const label =
    appLocale === 'ru' ? 'отзывов' : appLocale === 'en' ? 'reviews' : 'sharh';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG.paper,
          fontFamily: 'Unbounded',
        }}
      >
        {/* A slim band of the hackathon's own generated-cover palette, so the
            card is visually unique per event even without an upload. */}
        <div style={{ display: 'flex', height: 14, background: cover.palette.foreground }} />

        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: 64,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: OG.accent,
                fontWeight: 900,
              }}
            >
              {hackathon?.organizer?.name
                ? truncate(hackathon.organizer.name, 52)
                : 'hackathonlar.uz'}
            </div>
            <div
              style={{
                display: 'flex',
                marginTop: 18,
                fontSize: name.length > 44 ? 60 : 74,
                fontWeight: 900,
                lineHeight: 1.02,
                letterSpacing: -2.5,
                color: OG.ink,
                maxWidth: 1000,
              }}
            >
              {truncate(name, 90)}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', width: 12, background: band.text, borderRadius: '6px 0 0 6px' }} />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  background: band.tint,
                  padding: '18px 34px',
                  borderRadius: '0 6px 6px 0',
                }}
              >
                <div style={{ display: 'flex', fontSize: 92, fontWeight: 900, color: band.text, lineHeight: 1 }}>
                  {score === null ? '—' : formatDecimal(score, appLocale)}
                </div>
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  marginLeft: 24,
                  paddingBottom: 10,
                }}
              >
                <div style={{ display: 'flex', fontSize: 30, color: OG.ink3 }}>
                  {reviewCount} {label}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: OG.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff">
                  <path d="M12 2.6l2.83 5.73 6.32.92-4.57 4.46 1.08 6.3L12 17.03l-5.66 2.98 1.08-6.3L2.85 9.25l6.32-.92z" />
                </svg>
              </div>
              <div style={{ display: 'flex', fontSize: 28, fontWeight: 900, letterSpacing: -1 }}>
                <span style={{ color: OG.accent }}>hackathonlar.uz</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  );
}
