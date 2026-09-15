import { ImageResponse } from 'next/og';
import { SITE } from '@/lib/data/site';

export const runtime = 'edge';
export const alt = SITE.name + ' — luxury beauty destination in Accra';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/** Share card, generated at the edge so it always matches the live brand. */
export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#0B0A09',
          backgroundImage:
            'radial-gradient(60% 60% at 22% 22%, rgba(217,188,140,0.28) 0%, transparent 62%), radial-gradient(55% 55% at 80% 78%, rgba(192,138,126,0.24) 0%, transparent 66%)',
          color: '#F4EFE7',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 22,
            letterSpacing: 14,
            textTransform: 'uppercase',
            color: '#D9BC8C',
            marginBottom: 34,
          }}
        >
          Hebron · Accra
        </div>

        <div style={{ display: 'flex', fontSize: 104, letterSpacing: -2, lineHeight: 1 }}>
          Marilux Beauty Bar
        </div>

        <div
          style={{
            display: 'flex',
            width: 320,
            height: 1,
            backgroundColor: 'rgba(217,188,140,0.5)',
            margin: '44px 0',
          }}
        />

        <div
          style={{
            display: 'flex',
            fontSize: 30,
            color: 'rgba(244,239,231,0.6)',
            letterSpacing: 1,
          }}
        >
          Beauty held to a higher standard
        </div>
      </div>
    ),
    size,
  );
}
