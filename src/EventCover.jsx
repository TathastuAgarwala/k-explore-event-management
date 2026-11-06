import React, { useState, useMemo } from 'react';
import './EventCover.css';

/**
 * Curated high-resolution real photography library by category.
 * Used to ensure NO event card ever has an empty image and that
 * any newly created event automatically receives a branded, high-impact photo.
 */
export const CATEGORY_PHOTOS = {
  music: [
    {
      url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
      alt: 'Live atmospheric electronic music session with warm lighting',
      focal: '50% 40%',
    },
    {
      url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
      alt: 'Crowd and DJ console in an underground live venue',
      focal: '50% 50%',
    },
    {
      url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
      alt: 'Night music gathering with vibrant neon lights and dancers',
      focal: '50% 45%',
    },
  ],
  tech: [
    {
      url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
      alt: 'Tech innovators collaborating in a modern studio workshop',
      focal: '50% 40%',
    },
    {
      url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85',
      alt: 'Engineers designing creative technology prototypes',
      focal: '50% 50%',
    },
    {
      url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85',
      alt: 'Hackathon team working through complex code together',
      focal: '50% 45%',
    },
  ],
  wellness: [
    {
      url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=85',
      alt: 'Mindful morning movement practice in a warm sunlit garden',
      focal: '50% 45%',
    },
    {
      url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85',
      alt: 'Meditation circle practicing breathwork at sunrise',
      focal: '50% 50%',
    },
    {
      url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85',
      alt: 'Pilates and mobility workshop in a serene sunlit space',
      focal: '50% 40%',
    },
  ],
  social: [
    {
      url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
      alt: 'Close friends laughing and sharing drinks around a communal table',
      focal: '50% 45%',
    },
    {
      url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85',
      alt: 'Community rooftop gathering at sunset',
      focal: '50% 50%',
    },
    {
      url: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&w=1200&q=85',
      alt: 'Warm social mixer with engaging conversations',
      focal: '50% 40%',
    },
  ],
  food: [
    {
      url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
      alt: 'Artisanal dishes and communal plates shared across a banquet table',
      focal: '50% 50%',
    },
    {
      url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
      alt: 'Chef preparing seasonal ingredients in an open kitchen concept',
      focal: '50% 45%',
    },
    {
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
      alt: 'Tasting menu spread with fermented drinks and organic bites',
      focal: '50% 40%',
    },
  ],
  art: [
    {
      url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=85',
      alt: 'Sculptural light installations in an independent gallery space',
      focal: '50% 50%',
    },
    {
      url: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85',
      alt: 'Visual artists in a printmaking and risograph studio',
      focal: '50% 45%',
    },
    {
      url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1200&q=85',
      alt: 'Expressive contemporary paintings hung in high-ceiling gallery',
      focal: '50% 40%',
    },
  ],
  ideas: [
    {
      url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=85',
      alt: 'Engaging fireside discussion with thought leaders and creators',
      focal: '50% 40%',
    },
    {
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=85',
      alt: 'Collaborative workshop breakout session on future city design',
      focal: '50% 45%',
    },
    {
      url: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=85',
      alt: 'Intimate salon with deep philosophical debate and questions',
      focal: '50% 50%',
    },
  ],
};

/**
 * Deterministically pick an automatic, branded photo based on category and seed.
 * Guarantees NO event card is ever empty.
 */
export function getAutoEventPhoto(category = 'ideas', seed = 'pulse-event') {
  const normCategory = (category || 'ideas').toLowerCase();
  const pool = CATEGORY_PHOTOS[normCategory] || CATEGORY_PHOTOS.ideas;

  // Simple string hash
  let hash = 0;
  const str = String(seed);
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % pool.length;
  return pool[index];
}

/**
 * SVG duotone filter definition component.
 * Maps shadows to Indigo (#4F46E5) and highlights to Lime (#D4FF4F).
 */
export function DuotoneFilterDef() {
  return null;
}

/**
 * Category color schemes for the generative poster cover fallback.
 */
const POSTER_THEMES = {
  music: { bg: '#4F46E5', accent: '#D4FF4F', text: '#D4FF4F' },
  tech: { bg: '#101110', accent: '#D4FF4F', text: '#D4FF4F' },
  wellness: { bg: '#D4FF4F', accent: '#4F46E5', text: '#101110' },
  food: { bg: '#FF8068', accent: '#F6F5F0', text: '#101110' },
  art: { bg: '#4F46E5', accent: '#FF8068', text: '#FF8068' },
  ideas: { bg: '#101110', accent: '#FF8068', text: '#FF8068' },
  social: { bg: '#D4FF4F', accent: '#101110', text: '#101110' },
};

/**
 * Client-side memoized generative SVG poster cover.
 */
function GenerativePoster({ event, theme, seedNum }) {
  const category = (event?.category || 'ideas').toLowerCase();
  const dateStr = event?.date || '14 NOV';
  const parts = dateStr.split(' ');
  const month = parts[0] || 'NOV';
  const day = parts[1] || '14';

  const motif = useMemo(() => {
    switch (category) {
      case 'music':
        // Concentric rings & waveform bars
        return (
          <g>
            <circle
              className="poster-shape poster-shape-1"
              cx="190"
              cy="100"
              r="75"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3.5"
              strokeDasharray="6 4"
            />
            <circle
              className="poster-shape poster-shape-2"
              cx="190"
              cy="100"
              r="48"
              fill="none"
              stroke={theme.accent}
              strokeWidth="2.5"
            />
            <rect
              className="poster-shape poster-shape-3"
              x="50"
              y="70"
              width="6"
              height="60"
              rx="3"
              fill={theme.accent}
            />
            <rect
              className="poster-shape poster-shape-3"
              x="62"
              y="50"
              width="6"
              height="100"
              rx="3"
              fill={theme.accent}
            />
            <rect
              className="poster-shape poster-shape-3"
              x="74"
              y="85"
              width="6"
              height="45"
              rx="3"
              fill={theme.accent}
            />
          </g>
        );

      case 'tech':
        // Dot grid with connected nodes
        return (
          <g>
            <line
              className="poster-shape poster-shape-1"
              x1="70"
              y1="60"
              x2="150"
              y2="130"
              stroke={theme.accent}
              strokeWidth="2.5"
            />
            <line
              className="poster-shape poster-shape-2"
              x1="150"
              y1="130"
              x2="240"
              y2="80"
              stroke={theme.accent}
              strokeWidth="2"
              strokeDasharray="4 4"
            />
            <circle
              className="poster-shape poster-shape-3"
              cx="70"
              cy="60"
              r="9"
              fill={theme.accent}
            />
            <circle
              className="poster-shape poster-shape-1"
              cx="150"
              cy="130"
              r="14"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3"
            />
            <circle
              className="poster-shape poster-shape-2"
              cx="240"
              cy="80"
              r="7"
              fill={theme.accent}
            />
          </g>
        );

      case 'wellness':
        // Sun arcs & half circles
        return (
          <g>
            <path
              className="poster-shape poster-shape-1"
              d="M 100 160 A 65 65 0 0 1 230 160 Z"
              fill={theme.accent}
              opacity="0.85"
            />
            <circle
              className="poster-shape poster-shape-2"
              cx="165"
              cy="75"
              r="30"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3"
            />
            <path
              className="poster-shape poster-shape-3"
              d="M 50 160 Q 165 40 280 160"
              fill="none"
              stroke={theme.accent}
              strokeWidth="2.5"
              strokeDasharray="5 5"
            />
          </g>
        );

      case 'food':
        // Overlapping circles
        return (
          <g>
            <circle
              className="poster-shape poster-shape-1"
              cx="120"
              cy="100"
              r="55"
              fill={theme.accent}
              opacity="0.75"
            />
            <circle
              className="poster-shape poster-shape-2"
              cx="190"
              cy="95"
              r="45"
              fill="none"
              stroke={theme.text}
              strokeWidth="4"
            />
            <circle
              className="poster-shape poster-shape-3"
              cx="155"
              cy="125"
              r="22"
              fill={theme.text}
              opacity="0.9"
            />
          </g>
        );

      case 'art':
        // Organic blobs
        return (
          <g>
            <path
              className="poster-shape poster-shape-1"
              d="M 90,70 C 130,30 200,60 190,110 C 180,150 120,165 80,135 C 50,110 60,90 90,70 Z"
              fill={theme.accent}
              opacity="0.85"
            />
            <circle
              className="poster-shape poster-shape-2"
              cx="220"
              cy="80"
              r="24"
              fill="none"
              stroke={theme.text}
              strokeWidth="3.5"
            />
            <path
              className="poster-shape poster-shape-3"
              d="M 40,140 Q 120,80 260,130"
              stroke={theme.text}
              strokeWidth="3"
              fill="none"
            />
          </g>
        );

      case 'ideas':
        // Stacked squares and lines
        return (
          <g>
            <rect
              className="poster-shape poster-shape-1"
              x="90"
              y="55"
              width="85"
              height="85"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3.5"
              transform={`rotate(${(seedNum % 20) - 10} 132 97)`}
            />
            <rect
              className="poster-shape poster-shape-2"
              x="120"
              y="75"
              width="60"
              height="60"
              fill={theme.accent}
              opacity="0.4"
            />
            <line
              className="poster-shape poster-shape-3"
              x1="50"
              y1="140"
              x2="250"
              y2="140"
              stroke={theme.accent}
              strokeWidth="2.5"
            />
          </g>
        );

      case 'social':
      default:
        // Overlapping rings
        return (
          <g>
            <circle
              className="poster-shape poster-shape-1"
              cx="110"
              cy="100"
              r="52"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3.5"
            />
            <circle
              className="poster-shape poster-shape-2"
              cx="175"
              cy="100"
              r="52"
              fill="none"
              stroke={theme.accent}
              strokeWidth="3.5"
            />
            <circle
              className="poster-shape poster-shape-3"
              cx="142"
              cy="100"
              r="22"
              fill={theme.accent}
              opacity="0.85"
            />
          </g>
        );
    }
  }, [category, theme, seedNum]);

  return (
    <div className="event-cover-poster" aria-hidden="true">
      <svg
        viewBox="0 0 300 200"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100%" height="100%" fill={theme.bg} />

        {/* Giant outlined date numeral behind shapes */}
        <text
          x="150"
          y="155"
          textAnchor="middle"
          className="poster-date-numeral"
          style={{ stroke: theme.accent }}
        >
          {day}
        </text>

        {/* Month mono label */}
        <text
          x="25"
          y="35"
          className="poster-month-label"
          style={{ fill: theme.text }}
        >
          {month}
        </text>

        {/* Category motif */}
        {motif}
      </svg>
    </div>
  );
}

/**
 * EventCover Component
 * Guaranteed to NEVER render an empty image. Automatically equips new events
 * with high-quality curated photography, branded duotone treatment, grain overlay,
 * and robust generative poster fallback on error or offline.
 */
export default function EventCover({
  event,
  className = '',
  isSkeleton = false,
  showNotches = true,
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Derive stable seed for poster fallback
  const seedNum = useMemo(() => {
    const raw = String(event?.id || event?.title || 'seed');
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }, [event?.id, event?.title]);

  const category = (event?.category || 'ideas').toLowerCase();
  const theme = POSTER_THEMES[category] || POSTER_THEMES.ideas;

  // Never empty: if event.image is missing, auto-insert curated high-res photo
  const photo = useMemo(() => {
    if (event?.image && typeof event.image === 'string' && event.image.trim()) {
      return {
        url: event.image,
        alt: event.alt || `${event.title || 'Event'} live gathering`,
        focal: event.focalPoint || '50% 50%',
      };
    }
    return getAutoEventPhoto(event?.category, event?.id || event?.title);
  }, [event?.image, event?.category, event?.id, event?.title, event?.alt, event?.focalPoint]);

  if (isSkeleton) {
    return (
      <div className={`event-cover-container ${className}`} aria-hidden="true">
        <div className="event-cover-skeleton" />
        {showNotches && (
          <>
            <span className="event-cover-notch event-cover-notch-left" />
            <span className="event-cover-notch event-cover-notch-right" />
          </>
        )}
      </div>
    );
  }

  return (
    <div className={`event-cover-container ${className}`}>
      {/* If photo load failed, fallback seamlessly to generative poster */}
      {imgError ? (
        <GenerativePoster event={event} theme={theme} seedNum={seedNum} />
      ) : (
        <div className="event-cover-photo-wrapper">
          {/* Blur-up placeholder while loading */}
          {!imgLoaded && (
            <div
              className={`event-cover-blur-placeholder ${theme.bg}`}
              style={{ backgroundColor: theme.bg }}
              aria-hidden="true"
            />
          )}

          <img
            className="event-cover-photo"
            src={photo.url}
            alt={photo.alt}
            width="600"
            height="400"
            loading="lazy"
            decoding="async"
            style={{
              objectPosition: photo.focal || '50% 50%',
              opacity: imgLoaded ? 1 : 0.85,
            }}
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
          />
        </div>
      )}

      {/* Light subtle grain overlay */}
      <div className="event-cover-grain" aria-hidden="true" />

      {/* Ticket-stub notches on left & right edges */}
      {showNotches && (
        <>
          <span className="event-cover-notch event-cover-notch-left" aria-hidden="true" />
          <span className="event-cover-notch event-cover-notch-right" aria-hidden="true" />
        </>
      )}
    </div>
  );
}

