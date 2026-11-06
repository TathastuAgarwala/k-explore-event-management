import { Fragment, lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import HeroBackground from './HeroBackground';
import EventCover, { DuotoneFilterDef, getAutoEventPhoto } from './EventCover';
import CookieConsent from './CookieConsent';

const LazyEventGlobe = lazy(() => import('./EventGlobe'));

const EVENTS = [
  {
    id: 'sound-sessions',
    category: 'music',
    categoryLabel: 'Music',
    featured: true,
    title: 'Sound Sessions',
    date: 'NOV 14',
    fullDate: 'Saturday, November 14, 2026',
    time: '7:00 PM — 10:30 PM',
    startsAt: '2026-11-14T19:00:00+05:30',
    location: 'The Courtyard, Bandra',
    city: 'Mumbai',
    price: '₹899',
    spots: 18,
    lat: 19.07,
    lon: 72.87,
    wave: 0,
    description: 'An intimate evening of analogue sound, local selectors, and the kind of conversations that only happen after dark.',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=85',
    alt: 'Live atmospheric music session with warm stage lights and crowd',
    focalPoint: '50% 40%',
    host: {
      name: 'Kunal Sen',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'future-ordinary',
    category: 'ideas',
    categoryLabel: 'Ideas',
    featured: false,
    title: 'The Future of Ordinary',
    date: 'NOV 21',
    fullDate: 'Saturday, November 21, 2026',
    time: '6:30 PM — 8:30 PM',
    startsAt: '2026-11-21T18:30:00+05:30',
    location: 'The Design Museum, Worli',
    city: 'Mumbai',
    price: 'Free',
    spots: 42,
    lat: 28.61,
    lon: 77.20,
    wave: 1.3,
    description: 'Three designers on making the everyday more thoughtful, more beautiful, and a little less expected.',
    image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=85',
    alt: 'Designers in discussion surrounded by architectural prototypes',
    focalPoint: '50% 45%',
    host: {
      name: 'Mira Nair',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'slow-sunday',
    category: 'wellness',
    categoryLabel: 'Wellness',
    featured: false,
    title: 'Slow Sunday Club',
    date: 'NOV 29',
    fullDate: 'Sunday, November 29, 2026',
    time: '8:00 AM — 11:00 AM',
    startsAt: '2026-11-29T08:00:00+05:30',
    location: 'Maya’s Garden, Juhu',
    city: 'Mumbai',
    price: '₹499',
    spots: 12,
    lat: 13.08,
    lon: 80.27,
    wave: 2.1,
    description: 'A soft morning of movement, seasonal food, and putting your phone somewhere you cannot see it.',
    image: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1200&q=85',
    alt: 'Morning mindful yoga and breathwork in a sunlit garden',
    focalPoint: '50% 45%',
    host: {
      name: 'Maya Rao',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'open-table',
    category: 'social',
    categoryLabel: 'Social',
    featured: false,
    title: 'Open Table',
    date: 'DEC 05',
    fullDate: 'Saturday, December 5, 2026',
    time: '7:30 PM — 10:00 PM',
    startsAt: '2026-12-05T19:30:00+05:30',
    location: 'Nani’s Kitchen, Fort',
    city: 'Mumbai',
    price: '₹1,200',
    spots: 7,
    lat: 22.57,
    lon: 88.36,
    wave: 2.8,
    description: 'Twelve strangers. One long table. A menu built around the things we all have in common.',
    image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=85',
    alt: 'Friends enjoying meal and drinks together at long dinner table',
    focalPoint: '50% 50%',
    host: {
      name: 'Devika & Kabir',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'off-record',
    category: 'ideas',
    categoryLabel: 'Ideas',
    featured: false,
    title: 'Off the Record',
    date: 'DEC 12',
    fullDate: 'Saturday, December 12, 2026',
    time: '7:00 PM — 9:00 PM',
    startsAt: '2026-12-12T19:00:00+05:30',
    location: 'The Listening Room, Khar',
    city: 'Mumbai',
    price: 'Free',
    spots: 31,
    lat: 12.97,
    lon: 77.59,
    wave: 3.2,
    description: 'A no-slides conversation with people building the next version of culture from the ground up.',
    image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=85',
    alt: 'Fireside cultural panel in a cozy modern auditorium',
    focalPoint: '50% 40%',
    host: {
      name: 'Zoya Akhtar',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'night-swim',
    category: 'music',
    categoryLabel: 'Music',
    featured: false,
    title: 'Night Swim',
    date: 'DEC 19',
    fullDate: 'Saturday, December 19, 2026',
    time: '8:00 PM — 11:30 PM',
    startsAt: '2026-12-19T20:00:00+05:30',
    location: 'The Blue Yard, Lower Parel',
    city: 'Mumbai',
    price: '₹799',
    spots: 24,
    lat: 17.38,
    lon: 78.49,
    wave: 4.2,
    description: 'A late-night swim through electronic sound, moving image, and the city after everyone else has gone home.',
    image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=85',
    alt: 'Late-night electronic club night with immersive lighting',
    focalPoint: '50% 50%',
    host: {
      name: 'Rohit Verma',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-tech-forum',
    category: 'ideas',
    categoryLabel: 'Ideas',
    featured: true,
    title: 'KIIT Future Tech Forum',
    date: 'NOV 18',
    fullDate: 'Wednesday, November 18, 2026',
    time: '10:00 AM — 4:00 PM',
    startsAt: '2026-11-18T10:00:00+05:30',
    location: 'Campus 6 Auditorium, KIIT',
    city: 'Bhubaneswar',
    price: 'Free',
    spots: 80,
    lat: 20.35,
    lon: 85.82,
    wave: 4.7,
    description: 'Students, researchers, and builders explore responsible AI, robotics, climate tech, and the ideas shaping tomorrow.',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=85',
    alt: 'Technology symposium keynote with enthusiastic student audience',
    focalPoint: '50% 40%',
    host: {
      name: 'Dr. S. Mohanty',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-cultural-fest',
    category: 'music',
    categoryLabel: 'Music',
    featured: false,
    title: 'KIIT Cultural Fest',
    date: 'NOV 22',
    fullDate: 'Sunday, November 22, 2026',
    time: '5:00 PM — 10:00 PM',
    startsAt: '2026-11-22T17:00:00+05:30',
    location: 'KIIT Open Air Theatre',
    city: 'Bhubaneswar',
    price: '₹299',
    spots: 250,
    lat: 20.35,
    lon: 85.82,
    wave: 5.1,
    description: 'A high-energy campus evening of live bands, dance crews, theatre, and performances from across the KIIT community.',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85',
    alt: 'Campus amphitheater alive with colorful stage performance',
    focalPoint: '50% 45%',
    host: {
      name: 'KIIT Student Council',
      avatar: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-wellness-walk',
    category: 'wellness',
    categoryLabel: 'Wellness',
    featured: false,
    title: 'Sunrise Wellness Walk',
    date: 'NOV 28',
    fullDate: 'Saturday, November 28, 2026',
    time: '6:30 AM — 8:30 AM',
    startsAt: '2026-11-28T06:30:00+05:30',
    location: 'Central Park, KIIT Campus',
    city: 'Bhubaneswar',
    price: 'Free',
    spots: 45,
    lat: 20.35,
    lon: 85.82,
    wave: 5.5,
    description: 'Start slow with a guided campus walk, breathwork, and a community breakfast under the morning sky.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=85',
    alt: 'Early morning walkers gathering in a green campus park',
    focalPoint: '50% 50%',
    host: {
      name: 'Ananya Pattnaik',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-startup-night',
    category: 'social',
    categoryLabel: 'Social',
    featured: false,
    title: 'KIIT Startup Demo Night',
    date: 'DEC 03',
    fullDate: 'Thursday, December 3, 2026',
    time: '6:00 PM — 9:00 PM',
    startsAt: '2026-12-03T18:00:00+05:30',
    location: 'Incubation Centre, KIIT',
    city: 'Bhubaneswar',
    price: 'Free',
    spots: 60,
    lat: 20.35,
    lon: 85.82,
    wave: 5.9,
    description: 'Meet student founders, see fresh prototypes, and find collaborators for the next big campus venture.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Inventors presenting ideas at an open startup pitch circle',
    focalPoint: '50% 50%',
    host: {
      name: 'KIIT-TBI Incubator',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-green-lab',
    category: 'ideas',
    categoryLabel: 'Ideas',
    featured: false,
    title: 'Green Campus Lab',
    date: 'DEC 10',
    fullDate: 'Thursday, December 10, 2026',
    time: '2:00 PM — 5:00 PM',
    startsAt: '2026-12-10T14:00:00+05:30',
    location: 'KIIT School of Biotechnology',
    city: 'Bhubaneswar',
    price: '₹149',
    spots: 15,
    lat: 20.35,
    lon: 85.82,
    wave: 6.3,
    description: 'A hands-on afternoon turning campus sustainability challenges into practical student-led experiments.',
    image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=85',
    alt: 'Students conducting environmental research in a sunlit lab',
    focalPoint: '50% 45%',
    host: {
      name: 'EcoClub Bhubaneswar',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-open-mic',
    category: 'social',
    categoryLabel: 'Social',
    featured: false,
    title: 'The KIIT Open Mic',
    date: 'DEC 17',
    fullDate: 'Thursday, December 17, 2026',
    time: '7:00 PM — 9:30 PM',
    startsAt: '2026-12-17T19:00:00+05:30',
    location: 'Student Activity Centre, KIIT',
    city: 'Bhubaneswar',
    price: 'Free',
    spots: 35,
    lat: 20.35,
    lon: 85.82,
    wave: 6.7,
    description: 'Poetry, comedy, music, and unfinished ideas from the people making campus culture their own.',
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=85',
    alt: 'Acoustic mic set with friendly listeners in intimate club seating',
    focalPoint: '50% 50%',
    host: {
      name: 'Tanya & Rishi',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-mun',
    category: 'ideas',
    categoryLabel: 'Ideas',
    featured: false,
    title: 'KIIT Model United Nations',
    date: 'DEC 20',
    fullDate: 'Sunday, December 20, 2026',
    time: '9:00 AM — 6:00 PM',
    startsAt: '2026-12-20T09:00:00+05:30',
    location: 'Campus 7 Convention Hall, KIIT',
    city: 'Bhubaneswar',
    price: '₹499',
    spots: 120,
    lat: 20.35,
    lon: 85.82,
    wave: 7.1,
    description: 'A day of diplomacy, debate, and global problem-solving for students who want to change the conversation.',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=85',
    alt: 'Diplomatic delegates assembled for global assembly debates',
    focalPoint: '50% 45%',
    host: {
      name: 'KIIT MUN Secretariat',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-literary-circle',
    category: 'art',
    categoryLabel: 'Art',
    featured: false,
    title: 'Kalinga Literary Circle',
    date: 'DEC 27',
    fullDate: 'Sunday, December 27, 2026',
    time: '4:00 PM — 7:00 PM',
    startsAt: '2026-12-27T16:00:00+05:30',
    location: 'Central Library Lawn, KIIT',
    city: 'Bhubaneswar',
    price: 'Free',
    spots: 0,
    lat: 20.35,
    lon: 85.82,
    wave: 7.5,
    description: 'Authors, student writers, and readers gather for open readings, zines, and stories from Odisha and beyond.',
    image: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&w=1200&q=85',
    alt: 'Literary readers browsing handmade zines and poetry books',
    focalPoint: '50% 45%',
    host: {
      name: 'Prof. J. Das',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'bhubaneswar-food-trail',
    category: 'food',
    categoryLabel: 'Food',
    featured: false,
    title: 'Bhubaneswar Food Trail',
    date: 'JAN 09',
    fullDate: 'Saturday, January 9, 2027',
    time: '5:30 PM — 9:00 PM',
    startsAt: '2027-01-09T17:30:00+05:30',
    location: 'Old Town, Bhubaneswar',
    city: 'Bhubaneswar',
    price: '₹699',
    spots: 14,
    lat: 20.25,
    lon: 85.83,
    wave: 7.9,
    description: 'Walk through the old city with local food lovers, tasting temple-town classics and new Bhubaneswar favourites.',
    image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=85',
    alt: 'Traditional and modern regional food dishes served warmly',
    focalPoint: '50% 50%',
    host: {
      name: 'Chef Pradeep Samal',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    },
  },
  {
    id: 'kiit-sports-carnival',
    category: 'wellness',
    categoryLabel: 'Wellness',
    featured: false,
    title: 'KIIT Sports Carnival',
    date: 'JAN 16',
    fullDate: 'Saturday, January 16, 2027',
    time: '7:00 AM — 5:00 PM',
    startsAt: '2027-01-16T07:00:00+05:30',
    location: 'KIIT Stadium, Bhubaneswar',
    city: 'Bhubaneswar',
    price: '₹199',
    spots: 300,
    lat: 20.35,
    lon: 85.82,
    wave: 8.3,
    description: 'A full-campus day of five-a-side football, athletics, fitness challenges, and cheering from the stands.',
    image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=85',
    alt: 'High-energy outdoor athletic sprint on stadium turf',
    focalPoint: '50% 40%',
    host: {
      name: 'KIIT Sports Bureau',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=120&q=80',
    },
  },
];

const CATEGORIES = ['all', 'music', 'tech', 'food', 'art', 'free', 'weekend'];
const CATEGORY_LABELS = { all: 'All events', music: 'Music', tech: 'Tech', food: 'Food', art: 'Art', free: 'Free', weekend: 'Weekend' };

const readStorage = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};

const parseCountdown = (startsAt, now = Date.now()) => {
  const target = new Date(startsAt).getTime();
  const diff = target - now;
  if (Number.isNaN(diff)) {
    return { status: 'tbc', days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Date TBC', label: 'TBC' };
  }
  if (diff < -1000 * 60 * 60 * 6) {
    return { status: 'concluded', days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Ended', label: 'ENDED' };
  }
  if (diff <= 0) {
    return { status: 'live', days: 0, hours: 0, minutes: 0, seconds: 0, formatted: 'Live now', label: 'LIVE NOW' };
  }
  const totalSecs = Math.floor(diff / 1000);
  const days = Math.floor(totalSecs / 86400);
  const hours = Math.floor((totalSecs % 86400) / 3600);
  const minutes = Math.floor((totalSecs % 3600) / 60);
  const seconds = totalSecs % 60;
  const isUrgent = days === 0;

  const formatted = days > 0
    ? `${days}d ${hours}h`
    : `${hours}h ${minutes}m`;

  return {
    status: isUrgent ? 'urgent' : 'upcoming',
    days,
    hours,
    minutes,
    seconds,
    formatted,
    label: 'STARTS IN',
  };
};

const getCountdown = (startsAt, now = Date.now()) => {
  return parseCountdown(startsAt, now).formatted;
};

const matchesCategory = (event, category) => {
  if (category === 'all') return true;
  if (category === 'free') return event.price === 'Free';
  if (category === 'tech') return event.category === 'ideas';
  if (category === 'art') return event.category === 'ideas' || event.category === 'music' || event.category === 'art';
  if (category === 'food') return event.category === 'social' || event.category === 'food';
  if (category === 'weekend') return ['Saturday', 'Sunday'].some((day) => event.fullDate.startsWith(day));
  return event.category === category;
};

function usePointerTilt(intensity = 8) {
  const ref = useRef(null);
  const onPointerMove = (event) => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    element.style.setProperty('--tilt-x', `${(y * intensity * -1).toFixed(2)}deg`);
    element.style.setProperty('--tilt-y', `${(x * intensity).toFixed(2)}deg`);
  };
  const onPointerLeave = () => {
    ref.current?.style.setProperty('--tilt-x', '0deg');
    ref.current?.style.setProperty('--tilt-y', '0deg');
  };
  return { ref, onPointerMove, onPointerLeave };
}

function useReveal() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element?.classList.add('is-visible');
      return undefined;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        element.classList.add('is-visible');
        observer.disconnect();
      }
    }, { threshold: 0.12 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function useCounter(target) {
  const ref = useRef(null);
  const [value, setValue] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      if (reduced) setValue(target);
      else {
        const started = performance.now();
        const tick = (time) => {
          const progress = Math.min((time - started) / 900, 1);
          setValue(Math.floor(target * (1 - (1 - progress) ** 3)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
      observer.disconnect();
    }, { threshold: 0.45 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [target]);
  return [ref, value];
}

function Brand({ onNavigate }) {
  return (
    <a
      className="brand"
      href="/"
      aria-label="Pulse home"
      onClick={(e) => {
        e.preventDefault();
        if (onNavigate) {
          onNavigate('/', 'top');
        } else {
          window.history.pushState(null, '', '/');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }}
    >
      <span className="brand-mark"><i /><i /><i /></span>
      <span>pulse<span className="brand-dot">.</span></span>
    </a>
  );
}

function Eyebrow({ children, dot = false }) {
  return <p className="eyebrow">{dot && <span className="eyebrow-dot" />}{children}</p>;
}

function DigitCountdown({ value }) {
  return (
    <span className="digit-countdown" aria-label={value}>
      {value.split('').map((character, index) => (
        <span className={/\d/.test(character) ? 'countdown-digit' : 'countdown-separator'} key={`${value}-${index}`}>
          {character}
        </span>
      ))}
    </span>
  );
}

function CountdownTimerGrid({ startsAt, now }) {
  const countdown = parseCountdown(startsAt, now);
  if (countdown.status === 'live') {
    return (
      <div className="countdown-live-banner">
        <span className="live-pulse-dot" />
        <strong>HAPPENING RIGHT NOW</strong>
        <span>Live event in progress · Entry with pass</span>
      </div>
    );
  }
  if (countdown.status === 'concluded') {
    return (
      <div className="countdown-concluded-banner">
        <span>Event concluded</span>
      </div>
    );
  }
  return (
    <div className="countdown-timer-grid" aria-label="Event countdown">
      <div className="countdown-unit">
        <span className="countdown-val">{String(countdown.days).padStart(2, '0')}</span>
        <span className="countdown-lbl">Days</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit">
        <span className="countdown-val">{String(countdown.hours).padStart(2, '0')}</span>
        <span className="countdown-lbl">Hours</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit">
        <span className="countdown-val">{String(countdown.minutes).padStart(2, '0')}</span>
        <span className="countdown-lbl">Mins</span>
      </div>
      <span className="countdown-colon">:</span>
      <div className="countdown-unit">
        <span className="countdown-val countdown-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
        <span className="countdown-lbl">Secs</span>
      </div>
    </div>
  );
}

function ConfettiCelebration() {
  const particles = useMemo(() => Array.from({ length: 22 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 92 + 4}%`,
    delay: `${(Math.random() * 0.35).toFixed(2)}s`,
    color: ['#d8f357', '#4756ed', '#ff795c', '#00e5ff', '#ffb300', '#a855f7'][i % 6],
    size: `${Math.floor(Math.random() * 8 + 6)}px`,
    rotate: `${Math.floor(Math.random() * 360)}deg`
  })), []);

  return (
    <div className="confetti-container" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="confetti-particle"
          style={{
            left: p.left,
            animationDelay: p.delay,
            backgroundColor: p.color,
            width: p.size,
            height: p.size,
            transform: `rotate(${p.rotate})`
          }}
        />
      ))}
    </div>
  );
}

function Hero({ events, onExplore, onHost, onHostEvent, onSelect, onSearch, hoveredId, activeCategory, onCategoryChange, onSave, now }) {
  const revealRef = useReveal();
  const tilt = usePointerTilt(7);
  const [city, setCity] = useState('Mumbai');
  const [date, setDate] = useState('This week');
  const [category, setCategory] = useState('All categories');
  const submitSearch = (event) => {
    event.preventDefault();
    onSearch({ city, date, category });
    onExplore();
  };

  return (
    <section ref={revealRef} className="hero section-pad reveal" aria-labelledby="hero-title">
      <HeroBackground heroRef={revealRef} />
      <div className="hero-copy">
        <Eyebrow dot>The signal for what’s next</Eyebrow>
        <h1 id="hero-title">
          <span className="headline-line">Go where</span><br />
          <span className="headline-line"><span className="word-energy">energy</span> gathers.</span>
        </h1>
        <p className="hero-intro">
          A living calendar of curious people, bold ideas, and the moments that make a city feel alive.
        </p>
        <div className="hero-actions">
          <button className="button button-primary" onClick={onExplore}>Explore events <span>↓</span></button>
          <button className="button button-ghost" onClick={onHost}>How Pulse works <span>↗</span></button>
        </div>
        <form className="hero-search" onSubmit={submitSearch} aria-label="Find events">
          <label><span>City</span>
            <select value={city} onChange={(e) => setCity(e.target.value)}>
              <option>Mumbai</option>
              <option>Bhubaneswar</option>
              <option>Delhi</option>
              <option>Bengaluru</option>
              <option>Chennai</option>
            </select>
          </label>
          <label><span>Date</span>
            <select value={date} onChange={(e) => setDate(e.target.value)}>
              <option>This week</option>
              <option>This weekend</option>
              <option>Next month</option>
            </select>
          </label>
          <label><span>Category</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              <option>All categories</option>
              <option>Music</option>
              <option>Ideas</option>
              <option>Wellness</option>
              <option>Social</option>
            </select>
          </label>
          <button className="button button-dark magnetic-btn" type="submit">Search <span>⌕</span></button>
        </form>
        <div className="hero-chips" aria-label="Popular filters">
          {['Music', 'Tech', 'Food', 'Art', 'Free', 'This weekend'].map((chip) => (
            <button key={chip} type="button" onClick={() => { onSearch({ city: 'Mumbai', date: chip === 'This weekend' ? chip : 'This week', category: chip }); onExplore(); }}>
              {chip}
            </button>
          ))}
        </div>
        <div className="hero-proof">
          <div className="avatar-stack" aria-hidden="true">
            <span className="avatar avatar-one">A</span>
            <span className="avatar avatar-two">J</span>
            <span className="avatar avatar-three">M</span>
            <span className="avatar avatar-four">+</span>
          </div>
          <p><strong>12,840</strong> curious humans<br /><span>finding their people every month</span></p>
        </div>
      </div>

      <div ref={tilt.ref} onPointerMove={tilt.onPointerMove} onPointerLeave={tilt.onPointerLeave} className="hero-art" aria-label="Interactive Pulse event globe">
        <Suspense fallback={<GlobeSkeleton />}>
          <LazyEventGlobe events={events} onSelect={onSelect} hoveredId={hoveredId} activeCategory={activeCategory} onCategoryChange={onCategoryChange} onHost={onHostEvent} onSave={onSave} />
        </Suspense>
      </div>

      <div className="hero-upcoming" aria-label="Upcoming events">
        <div className="hero-upcoming-head">
          <span>UP NEXT IN PULSE</span>
          <button type="button" onClick={onExplore}>See all ↗</button>
        </div>
        <div className="hero-upcoming-grid">
          {events.slice(0, 3).map((event) => {
            const countdown = parseCountdown(event.startsAt, now);
            return (
              <button className="peek-card" type="button" key={event.id} onClick={() => onSelect(event)}>
                <div className="peek-top-meta">
                  <span className="peek-date">{event.date}</span>
                  <span className={`peek-timer ${countdown.status === 'live' ? 'is-live' : ''}`}>
                    {countdown.status === 'live' ? '● LIVE' : `⏳ ${countdown.formatted}`}
                  </span>
                </div>
                <strong>{event.title}</strong>
                <small>{event.location}</small>
                <em>{event.price} · {event.spots} spots left</em>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GlobeSkeleton() {
  return (
    <div className="globe-skeleton" aria-label="Loading event globe">
      <span /><span /><span /><i /><i /><i />
    </div>
  );
}

const TICKER_PHRASES = [
  'LIVE EXPERIENCES',
  'FRESH PERSPECTIVES',
  'GOOD PEOPLE',
  'GLOBAL SIGNALS',
  'CURATED GATHERINGS',
  'RADICAL IDEAS',
  'NIGHTLIFE & SOUND',
  'CREATIVE MOMENTUM',
];

function Ticker() {
  const repeatedItems = useMemo(() => Array(8).fill(TICKER_PHRASES).flat(), []);

  return (
    <section className="ticker" aria-label="Event categories">
      <div className="ticker-track">
        {[1, 2].map((copy) => (
          <div
            className="ticker-copy"
            key={copy}
            aria-hidden={copy === 2 ? 'true' : undefined}
          >
            {repeatedItems.map((phrase, idx) => (
              <Fragment key={`${copy}-${idx}`}>
                <span>{phrase}</span>
                <b aria-hidden="true">◆</b>
              </Fragment>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function EventCard({ event, favorite, onFavorite, onOpen, onShare, onHover, now, index }) {
  const tilt = usePointerTilt(5);
  const countdown = parseCountdown(event.startsAt, now);

  const isSoldOut = event.spots <= 0;
  const isLowSpots = event.spots > 0 && event.spots <= 15;

  return (
    <article
      ref={tilt.ref}
      onPointerMove={tilt.onPointerMove}
      onPointerEnter={() => onHover?.(event.id)}
      onPointerLeave={() => { tilt.onPointerLeave(); onHover?.(null); }}
      className="event-card tilt-surface reveal-item"
      style={{ '--stagger': `${Math.min(index, 5) * 70}ms` }}
      data-featured={event.featured}
      tabIndex="0"
      role="button"
      aria-label={`View details for ${event.title}`}
      onClick={() => onOpen(event)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(event); } }}
    >
      <div className="event-image">
        <EventCover event={event} />
        <span className="event-date">{event.date}</span>
        <span className="event-category">{event.categoryLabel}</span>
        <div className="card-actions">
          <button
            className={`favorite-button ${favorite ? 'is-favorite' : ''}`}
            type="button"
            aria-label={favorite ? 'Remove from saved events' : 'Save event'}
            onClick={(e) => { e.stopPropagation(); onFavorite(event.id); }}
          >
            {favorite ? '♥' : '♡'}
          </button>
          <button
            className="share-button"
            type="button"
            aria-label={`Share ${event.title}`}
            onClick={(e) => { e.stopPropagation(); onShare(event); }}
          >
            ↗
          </button>
        </div>
      </div>

      <div className="event-body">
        <div className="event-title-row">
          <h3>{event.title}</h3>
          <strong className="event-price">{event.price}</strong>
        </div>

        {event.host?.name && (
          <div className="event-host-line">
            {event.host.avatar && (
              <img
                src={event.host.avatar}
                alt=""
                className="event-host-avatar"
                loading="lazy"
                width="22"
                height="22"
              />
            )}
            <span>Hosted by {event.host.name}</span>
          </div>
        )}

        <p>{event.description}</p>

        {/* Spots badge: coral when <= 15, sold out disabled when <= 0 */}
        {isSoldOut ? (
          <span className="spots-chip is-sold-out">Sold out</span>
        ) : isLowSpots ? (
          <span className="spots-chip is-low">{event.spots} spots left</span>
        ) : null}

        {/* Countdown strip with WCAG AA contrast (white label, lime digits) */}
        <div className={`event-countdown ${countdown.status === 'live' ? 'is-live' : ''}`}>
          <div className="countdown-badge-inner" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span className="countdown-label">
              {countdown.status === 'live' && <span className="live-pulse-dot" />}
              {countdown.status === 'live' ? 'LIVE NOW' : countdown.status === 'concluded' ? 'ENDED' : 'STARTS IN'}
            </span>
            <strong>
              {countdown.status === 'live' ? 'NOW' : countdown.status === 'concluded' ? 'ENDED' : <DigitCountdown value={countdown.formatted} />}
            </strong>
          </div>
        </div>

        <div className="event-details">
          <span>{event.location}</span>
          <button
            type="button"
            className="quick-view-btn"
            onClick={(e) => {
              e.stopPropagation();
              onOpen(event);
            }}
          >
            <span>Quick view</span>
            <span className="card-arrow-btn" aria-hidden="true">↗</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function Discover({ events, favorites, onFavorite, onOpen, onShare, onToast, onHover, now, category, query, onCategoryChange, onQueryChange }) {
  const revealRef = useReveal();
  const [dateRange, setDateRange] = useState('all');
  const [sortBy, setSortBy] = useState('soonest');
  const [nearMe, setNearMe] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const counts = useMemo(() => Object.fromEntries(
    CATEGORIES.map((item) => [item, events.filter((event) => matchesCategory(event, item)).length])
  ), [events]);

  const filtered = useMemo(() => events.filter((event) => {
    const matchesText = `${event.title} ${event.description} ${event.location} ${event.categoryLabel}`.toLowerCase().includes(query.toLowerCase());
    const daysAway = (new Date(event.startsAt).getTime() - now) / 86400000;
    const matchesDate = dateRange === 'all' || (dateRange === 'week' ? daysAway <= 7 : daysAway <= 31);
    return matchesCategory(event, category) && matchesText && matchesDate && (!nearMe || event.city === 'Mumbai') && (!showSaved || favorites.includes(event.id));
  }).sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'price') {
      const pA = a.price === 'Free' ? 0 : Number(a.price.replace(/\D/g, ''));
      const pB = b.price === 'Free' ? 0 : Number(b.price.replace(/\D/g, ''));
      return pA - pB;
    }
    return new Date(a.startsAt) - new Date(b.startsAt);
  }), [category, dateRange, events, favorites, nearMe, now, query, showSaved, sortBy]);

  const handleCategoryClick = (item) => {
    setShowSaved(false);
    onCategoryChange(item);
  };

  return (
    <section ref={revealRef} className="discover section-pad reveal" id="discover" aria-labelledby="discover-title">
      <div className="section-heading">
        <div>
          <Eyebrow>01 / discover</Eyebrow>
          <h2 id="discover-title">
            <span className="headline-line">Your next</span><br />
            <span className="headline-line"><em>good idea.</em></span>
          </h2>
        </div>
        <p className="section-note">No endless scrolling. Just the events worth leaving the house for.</p>
      </div>

      <div className="event-toolbar">
        <div className="category-tabs" role="tablist" aria-label="Filter events by category">
          {CATEGORIES.map((item) => (
            <button
              className={`category-tab ${category === item ? 'active' : ''}`}
              key={item}
              role="tab"
              aria-selected={category === item}
              onClick={() => handleCategoryClick(item)}
            >
              {CATEGORY_LABELS[item]} <span>{counts[item]}</span>
            </button>
          ))}
        </div>
        <label className="search-box">
          <span>⌕</span>
          <input
            type="search"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder="Search events"
            aria-label="Search events"
          />
        </label>
      </div>

      <div className="filter-row">
        <button className={`filter-toggle ${nearMe ? 'active' : ''}`} type="button" onClick={() => setNearMe((current) => !current)}>
          ⌖ Near me
        </button>
        <button className={`filter-toggle ${showSaved ? 'active' : ''}`} type="button" onClick={() => setShowSaved((current) => !current)}>
          ♥ Saved <span>{favorites.length}</span>
        </button>
        <label>
          Date
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">Any date</option>
            <option value="week">Next 7 days</option>
            <option value="month">Next 30 days</option>
          </select>
        </label>
        <label>
          Sort
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="soonest">Soonest</option>
            <option value="title">A–Z</option>
            <option value="price">Price</option>
          </select>
        </label>
      </div>

      {filtered.length ? (
        <div className="events-grid">
          {filtered.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              favorite={favorites.includes(event.id)}
              onFavorite={onFavorite}
              onOpen={onOpen}
              onShare={onShare}
              onHover={onHover}
              now={now}
            />
          ))}
        </div>
      ) : (
        <div className="empty-state" role="status">
          <span>◌</span>
          <h3>{showSaved ? 'Your saved list is empty.' : 'Nothing on this frequency.'}</h3>
          <p>Try another search, date, or category.</p>
          <button
            className="button button-dark"
            type="button"
            onClick={() => { onQueryChange(''); onCategoryChange('all'); setDateRange('all'); setNearMe(false); setShowSaved(false); }}
          >
            Reset filters
          </button>
        </div>
      )}

      <div className="events-footer">
        <span>{String(filtered.length).padStart(2, '0')} events found</span>
        <button className="button button-dark" type="button" onClick={() => onToast('You’re looking at the full Pulse calendar.')}>
          View all events <span>↗</span>
        </button>
      </div>
    </section>
  );
}

function Stat({ target, suffix, label }) {
  const [ref, value] = useCounter(target);
  return (
    <div className="stat-item" ref={ref}>
      <strong>{value.toLocaleString()}{suffix}</strong>
      <span>{label}</span>
    </div>
  );
}

const HOW_IT_WORKS = {
  guests: [
    { number: '01', title: 'Discover', description: 'Browse small, well-hosted events by city, date and vibe. Every listing is hand-checked, so what you see is worth showing up for.', chips: ['Smart filters', 'Curated picks', 'Near me'] },
    { number: '02', title: 'Reserve', description: 'RSVP in one tap. Free or paid, your ticket lands in your wallet instantly, with a reminder the day before.', chips: ['One-tap RSVP', 'Local Storage passes', 'Instant ticket'] },
    { number: '03', title: 'Show up', description: 'Scan your QR at the door, meet the people going, and leave with a reason to come back.', chips: ['QR check-in', 'Attendee circles', 'Post-event notes'] },
  ],
  hosts: [
    { number: '01', title: 'Create', description: 'Set up your event in under five minutes: title, place, price and capacity.', chips: ['Quick builder', 'Ticket tiers', 'Draft & preview'] },
    { number: '02', title: 'Share', description: 'Get a beautiful event page and a share link. Watch RSVPs come in live.', chips: ['Event page', 'Share link', 'Live RSVP count'] },
    { number: '03', title: 'Welcome', description: 'Check guests in with QR, manage the waitlist and send a thank-you with one tap.', chips: ['QR check-in', 'Waitlist', 'Thank-you message'] },
  ],
};

const FAQS = [
  ['Is Pulse free to use?', 'Browsing and RSVPing to free events is always free. Paid events show the full price upfront, no hidden fees.'],
  ['How are events chosen?', 'Our team reviews every listing for a real host, a real place and a clear plan.'],
  ["What if I can't make it?", 'Cancel directly from the My Passes manager. Your registration is removed from Local Storage instantly.'],
];

function HowItWorks() {
  const revealRef = useReveal();
  const [mode, setMode] = useState('guests');
  const [activeStep, setActiveStep] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const steps = HOW_IT_WORKS[mode];
  const stepRefs = useRef([]);

  useEffect(() => {
    setActiveStep(0);
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const stepIndex = Number(entry.target.dataset.step);
            if (!isNaN(stepIndex)) {
              setActiveStep(stepIndex);
            }
          }
        });
      },
      { rootMargin: '-20% 0px -35% 0px', threshold: [0.15, 0.4] }
    );
    stepRefs.current.filter(Boolean).forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [mode]);

  // Scroll listener to guarantee 01 -> 02 -> 03 moves smoothly as user scrolls between Discover and Reserve
  useEffect(() => {
    const handleScroll = () => {
      const viewportCenter = window.innerHeight * 0.45;
      let closestIndex = 0;
      let minDistance = Infinity;

      stepRefs.current.forEach((el, index) => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const distance = Math.abs(rect.top - viewportCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setActiveStep(closestIndex);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [mode]);

  const changeMode = (nextMode) => {
    setMode(nextMode);
    setActiveStep(0);
  };

  return (
    <section ref={revealRef} className="how-it-works section-pad reveal" id="about" aria-labelledby="feature-title">
      <div className="how-visual">
        <div className="how-grid" aria-hidden="true" />
        <div className={`how-shape shape-${activeStep + 1}`} aria-hidden="true" />
        <div className="how-step-number" aria-live="polite">
          <span key={`${mode}-${activeStep}`}>{steps[activeStep]?.number || '01'}</span>
        </div>
        <span className="visual-note note-a">FIELD<br />NOTE 04</span>
        <span className="visual-note note-b">PEOPLE<br />POWERED</span>
      </div>

      <div className="how-copy">
        <Eyebrow>02 / HOW IT WORKS</Eyebrow>
        <h2 id="feature-title">
          <span className="headline-line">Find it. Book it.</span><br />
          <span className="headline-line"><em>Feel it.</em></span>
        </h2>
        <p className="how-subheading">
          Pulse turns a scroll into a seat in the room. No endless tabs, no group-chat chaos, just the next good thing, one tap away.
        </p>

        <div className="audience-toggle" role="tablist" aria-label="Choose your Pulse journey">
          <button data-audience="guests" type="button" role="tab" aria-selected={mode === 'guests'} className={mode === 'guests' ? 'active' : ''} onClick={() => changeMode('guests')}>
            For guests
          </button>
          <button data-audience="hosts" type="button" role="tab" aria-selected={mode === 'hosts'} className={mode === 'hosts' ? 'active' : ''} onClick={() => changeMode('hosts')}>
            For hosts
          </button>
        </div>

        <div className="how-steps" role="list" style={{ '--progress': (activeStep + 1) / 3 }}>
          {steps.map((item, index) => (
            <article
              key={`${mode}-${item.number}`}
              data-step={index}
              ref={(element) => { stepRefs.current[index] = element; }}
              className={`how-step-card ${activeStep === index ? 'is-active' : ''}`}
              role="listitem"
              aria-current={activeStep === index ? 'step' : undefined}
              tabIndex="0"
              onClick={() => setActiveStep(index)}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setActiveStep(index); } }}
            >
              <div className="step-card-heading">
                <span>{item.number}</span>
                <h3>{item.title}</h3>
              </div>
              <p>{item.description}</p>
              <div className="step-chips">
                {item.chips.map((chip) => <span key={chip}>{chip}</span>)}
              </div>
            </article>
          ))}
        </div>

        <div className="how-stats stats-row">
          <Stat target={12840} suffix="+" label="curious humans" />
          <Stat target={84} suffix="%" label="find their people" />
          <Stat target={6} suffix="" label="cities live" />
        </div>

        <div className="values-strip">
          <p><strong>Human first:</strong> Real connection over reach.</p>
          <p><strong>Curious always:</strong> Follow the interesting thread.</p>
          <p><strong>Leave lighter:</strong> Every event should give more.</p>
        </div>

        <div className="how-actions">
          <a
            className="button button-primary"
            href="/discover"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState(null, '', '/discover');
              document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Explore events <span>↗</span>
          </a>
          <button className="text-link" type="button" onClick={() => changeMode('hosts')}>Host an event <span>→</span></button>
        </div>

        <div className="how-faq" aria-label="Frequently asked questions">
          {FAQS.map(([question, answer], index) => (
            <div className="faq-item" key={question}>
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                <span>{question}</span>
                <b>{openFaq === index ? '−' : '+'}</b>
              </button>
              {openFaq === index && <p>{answer}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { quote: 'Pulse makes a big city feel like a small, brilliant neighbourhood.', person: 'Leila M.', detail: 'Product designer · Mumbai' },
  { quote: 'The best nights start with a room full of strangers and one good question.', person: 'Arjun K.', detail: 'Founder · Bandra' },
  { quote: 'I came for the talk. I stayed for the people I now call friends.', person: 'Mira S.', detail: 'Writer · Juhu' },
];

function Community() {
  const revealRef = useReveal();
  const [active, setActive] = useState(0);
  const testimonial = TESTIMONIALS[active];

  return (
    <section ref={revealRef} className="community section-pad reveal" id="community" aria-labelledby="community-title">
      <div className="community-heading">
        <Eyebrow>03 / from the community</Eyebrow>
        <h2 id="community-title">
          <span className="headline-line">What’s</span><br />
          <span className="headline-line"><em>in the air.</em></span>
        </h2>
        <a
          className="text-link"
          href="/discover"
          onClick={(e) => {
            e.preventDefault();
            window.history.pushState(null, '', '/discover');
            document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          See all stories <span>↗</span>
        </a>
      </div>

      <article className="quote-card quote-main">
        <span className="quote-mark">“</span>
        <blockquote>{testimonial.quote}</blockquote>
        <div className="quote-person">
          <span className="mini-avatar avatar-five">{testimonial.person[0]}</span>
          <p><strong>{testimonial.person}</strong><br />{testimonial.detail}</p>
        </div>
        <div className="testimonial-controls">
          <button type="button" aria-label="Previous testimonial" onClick={() => setActive((active - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}>←</button>
          <span>{String(active + 1).padStart(2, '0')} / 0{TESTIMONIALS.length}</span>
          <button type="button" aria-label="Next testimonial" onClick={() => setActive((active + 1) % TESTIMONIALS.length)}>→</button>
        </div>
      </article>

      <div className="quote-card quote-side">
        <span className="quote-tag">PULSE NOTE #38</span>
        <p>There’s a different kind of confidence that arrives when you realise you’re not the only one thinking it.</p>
        <div className="quote-line" />
        <strong>— From our Sunday circle</strong>
      </div>
    </section>
  );
}

function Newsletter() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const submit = (e) => {
    e.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setMessage('That email needs another look.');
      return;
    }
    setMessage('You’re on the list — see you in your inbox.');
    setEmail('');
  };
  const revealRef = useReveal();

  return (
    <section ref={revealRef} className="newsletter section-pad reveal" aria-labelledby="newsletter-title">
      <div>
        <Eyebrow>Stay in the loop</Eyebrow>
        <h2 id="newsletter-title">
          <span className="headline-line">Good things,</span><br />
          <span className="headline-line"><em>once a week.</em></span>
        </h2>
      </div>
      <form className="newsletter-form" onSubmit={submit}>
        <label htmlFor="newsletter-email">The best of Pulse, in your inbox.</label>
        <div>
          <input
            id="newsletter-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            aria-describedby="newsletter-message"
          />
          <button className="button button-primary" type="submit">Sign me up <span>↗</span></button>
        </div>
        <small id="newsletter-message" role="status">{message}</small>
      </form>
    </section>
  );
}

function OwnerEventModal({ onClose, onCreate }) {
  const [form, setForm] = useState({
    title: '',
    category: 'music',
    date: '',
    time: '19:00',
    venue: '',
    city: 'Mumbai',
    price: 'Free',
    spots: '20',
    description: '',
    image: '',
    alt: '',
    focalPoint: '50% 50%',
  });
  const [error, setError] = useState('');
  const [imageError, setImageError] = useState('');
  const [usePoster, setUsePoster] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError('');

    // Accept JPG, PNG, WebP only
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError('Please upload a JPG, PNG, or WebP photo.');
      return;
    }

    // Max 5MB
    if (file.size > 5 * 1024 * 1024) {
      setImageError('Photo exceeds 5MB limit. Please upload a smaller file or use automatic photo.');
      return;
    }

    // Min 1200x800 dimensions check
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 1200 || img.height < 800) {
          setImageError(`Photo is ${img.width}x${img.height}px. Must be at least 1200x800px for brand clarity.`);
        } else {
          update('image', event.target.result);
          setUsePoster(false);
          if (!form.alt) {
            update('alt', `${form.title || 'Event'} gathering photo`);
          }
        }
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleUsePoster = () => {
    setUsePoster(true);
    setImageError('');
    update('image', '');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.venue || !form.description) {
      setError('Add a title, date, venue, and short description.');
      return;
    }

    if (form.image && !form.alt.trim()) {
      setError('Please provide an image description (alt text) for accessibility.');
      return;
    }

    const startsAt = `${form.date}T${form.time}:00+05:30`;
    const dateLabel = new Date(`${form.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short', day: '2-digit' }).toUpperCase();

    // Auto picture insertion: if host has not uploaded photo, automatically insert curated picture
    let finalImage = form.image;
    let finalAlt = form.alt;
    let finalFocal = form.focalPoint;

    if (!finalImage && !usePoster) {
      const autoPhoto = getAutoEventPhoto(form.category, form.title);
      finalImage = autoPhoto.url;
      finalAlt = autoPhoto.alt;
      finalFocal = autoPhoto.focal;
    }

    onCreate({
      id: `owner-${Date.now()}`,
      title: form.title,
      category: form.category,
      categoryLabel: form.category[0].toUpperCase() + form.category.slice(1),
      featured: false,
      date: dateLabel,
      fullDate: new Date(`${form.date}T12:00:00`).toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      time: form.time,
      startsAt,
      location: `${form.venue}, ${form.city}`,
      city: form.city,
      price: form.price,
      spots: Number(form.spots) || 20,
      lat: 19.07,
      lon: 72.87,
      wave: 1.8,
      description: form.description,
      image: finalImage,
      alt: finalAlt || `${form.title} event gathering`,
      focalPoint: finalFocal || '50% 50%',
      host: {
        name: 'You (Organizer)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      },
    });
  };

  const fields = [
    ['title', 'Event name', 'What are you calling it?'],
    ['venue', 'Venue', 'Where is it happening?'],
    ['description', 'Short description', 'What should people know?'],
  ];

  const FOCAL_POINTS = [
    { label: 'Top Left', value: '20% 20%' },
    { label: 'Top Center', value: '50% 20%' },
    { label: 'Top Right', value: '80% 20%' },
    { label: 'Center Left', value: '20% 50%' },
    { label: 'Center', value: '50% 50%' },
    { label: 'Center Right', value: '80% 50%' },
    { label: 'Bottom Left', value: '20% 80%' },
    { label: 'Bottom Center', value: '50% 80%' },
    { label: 'Bottom Right', value: '80% 80%' },
  ];

  return (
    <div className="modal-backdrop is-open" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="owner-modal" role="dialog" aria-modal="true" aria-labelledby="owner-title">
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close owner event form">×</button>
        <div className="owner-head">
          <Eyebrow>Owner studio / new listing</Eyebrow>
          <h2 id="owner-title">Put it<br /><em>on Pulse.</em></h2>
          <p>Publish a new event to the community calendar.</p>
        </div>
        <form className="owner-form" onSubmit={submit}>
          {fields.map(([field, label, placeholder]) => (
            <label key={field}>
              {label}
              {field === 'description' ? (
                <textarea value={form[field]} placeholder={placeholder} onChange={(e) => update(field, e.target.value)} rows="3" />
              ) : (
                <input value={form[field]} placeholder={placeholder} onChange={(e) => update(field, e.target.value)} />
              )}
            </label>
          ))}
          <div className="owner-form-grid">
            <label>Category
              <select value={form.category} onChange={(e) => update('category', e.target.value)}>
                <option value="music">Music</option>
                <option value="ideas">Ideas</option>
                <option value="wellness">Wellness</option>
                <option value="social">Social</option>
              </select>
            </label>
            <label>City<input value={form.city} onChange={(e) => update('city', e.target.value)} /></label>
            <label>Date<input type="date" value={form.date} onChange={(e) => update('date', e.target.value)} /></label>
            <label>Start time<input type="time" value={form.time} onChange={(e) => update('time', e.target.value)} /></label>
            <label>Price<input value={form.price} onChange={(e) => update('price', e.target.value)} /></label>
            <label>Spots<input type="number" min="1" value={form.spots} onChange={(e) => update('spots', e.target.value)} /></label>
          </div>

          {/* Photo Quality & Upload Section */}
          <div className="owner-photo-section" style={{ border: '1px solid var(--line)', padding: '16px', marginTop: '14px', borderRadius: '4px' }}>
            <span style={{ display: 'block', fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--blue)', marginBottom: '4px' }}>
              Event Cover Photo
            </span>
            <p style={{ fontSize: '12px', color: 'var(--muted)', margin: '0 0 12px 0' }}>
              Show your real room, real people. Photos of your actual event work best. (Min 1200x800, JPG/PNG/WebP, max 5MB)
            </p>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                style={{ fontSize: '12px' }}
              />
              <button
                type="button"
                className="button-ghost"
                onClick={handleUsePoster}
                style={{ fontSize: '11px', padding: '6px 12px' }}
              >
                Use a poster cover instead
              </button>
            </div>

            {imageError && (
              <div style={{ marginTop: '10px', color: 'var(--coral)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠ {imageError}</span>
                <button
                  type="button"
                  onClick={handleUsePoster}
                  style={{ textDecoration: 'underline', background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '12px' }}
                >
                  Use a poster cover instead
                </button>
              </div>
            )}

            {form.image && (
              <div style={{ marginTop: '14px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700 }}>
                  Alt text (required for accessibility)
                  <input
                    value={form.alt}
                    placeholder="Describe what is visible in the photo..."
                    onChange={(e) => update('alt', e.target.value)}
                    required
                  />
                </label>

                <div style={{ marginTop: '10px' }}>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', color: 'var(--muted)' }}>
                    Crop Focal Point:
                  </span>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px', maxWidth: '280px', marginTop: '6px' }}>
                    {FOCAL_POINTS.map((fp) => (
                      <button
                        key={fp.value}
                        type="button"
                        onClick={() => update('focalPoint', fp.value)}
                        style={{
                          fontSize: '10px',
                          padding: '4px 6px',
                          background: form.focalPoint === fp.value ? 'var(--acid)' : 'transparent',
                          color: form.focalPoint === fp.value ? 'var(--ink)' : 'inherit',
                          border: '1px solid var(--line)',
                          borderRadius: '2px',
                          cursor: 'pointer',
                        }}
                      >
                        {fp.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && <small className="field-error owner-error">{error}</small>}
          <button className="button button-dark full-width" type="submit" style={{ marginTop: '16px' }}>Publish event <span>↗</span></button>
        </form>
      </article>
    </div>
  );
}

function EventModal({ event, favorite, onClose, onRegister, onFavorite, onShare, now }) {
  if (!event) return null;
  const countdown = parseCountdown(event.startsAt, now);
  const photo = event.image ? event.image : getAutoEventPhoto(event.category, event.id).url;

  return (
    <div
      className="modal-backdrop is-open drawer-backdrop"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <article className="event-modal event-drawer" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button
          className="modal-close"
          type="button"
          aria-label="Close event details"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          ×
        </button>
        <div className="modal-image">
          <img
            className="modal-photo"
            src={photo}
            alt={event.alt || `${event.title} event photo`}
            style={{ objectPosition: event.focalPoint || '50% 50%' }}
          />
          <span className="modal-date">{event.fullDate}</span>
        </div>
        <div className="modal-content">
          <div className="modal-topline">
            <Eyebrow dot>Pulse / {event.categoryLabel}</Eyebrow>
            <button className={`modal-save ${favorite ? 'is-favorite' : ''}`} type="button" onClick={() => onFavorite(event.id)}>
              {favorite ? '♥ Saved' : '♡ Save'}
            </button>
          </div>
          <h2 id="modal-title">{event.title}</h2>
          <p>{event.description}</p>
          <div className="modal-meta">
            <span>◷ {event.time}</span>
            <span>⌖ {event.location}</span>
            <span>◉ {event.price}</span>
          </div>
          {event.spots <= 12 && (
            <p className="modal-spots">Only {event.spots} spots left — this one is moving fast.</p>
          )}

          <div className="modal-countdown-block">
            <div className="countdown-header-row">
              <span className="countdown-eyebrow">⏳ LIVE EVENT COUNTDOWN</span>
              {countdown.status === 'live' && <span className="live-indicator-pill">● LIVE NOW</span>}
              {countdown.status === 'urgent' && <span className="urgent-indicator-pill">TODAY</span>}
            </div>
            <CountdownTimerGrid startsAt={event.startsAt} now={now} />
          </div>

          <div className="modal-actions">
            <button className="button button-primary full-width" type="button" onClick={() => onRegister(event.id)}>
              Register for this event <span>↗</span>
            </button>
            <button className="button button-ghost full-width" type="button" onClick={() => onShare(event)}>
              Share event <span>↗</span>
            </button>
            <button
              className="button button-ghost full-width modal-cancel-button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              Cancel <span>×</span>
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}

function DigitalPassModal({ pass, onClose }) {
  if (!pass) return null;
  return (
    <div className="modal-backdrop is-open" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="digital-pass-card" role="dialog" aria-modal="true" aria-labelledby="pass-title">
        <button className="modal-close" type="button" aria-label="Close ticket pass" onClick={onClose}>×</button>
        <div className="pass-top">
          <div className="pass-badge">OFFICIAL ADMISSION PASS</div>
          <span className="pass-ref">#{pass.id}</span>
        </div>
        <div className="pass-hero">
          <Eyebrow dot>PULSE LIVE PASS</Eyebrow>
          <h2 id="pass-title">{pass.eventTitle}</h2>
          <p className="pass-date">📅 {pass.eventDate}</p>
          <p className="pass-venue">📍 {pass.eventLocation}</p>
        </div>
        <div className="pass-divider">
          <span className="notch notch-left" />
          <div className="dash-line" />
          <span className="notch notch-right" />
        </div>
        <div className="pass-details">
          <div className="pass-col">
            <span className="pass-label">ATTENDEE</span>
            <strong>{pass.name}</strong>
          </div>
          <div className="pass-col">
            <span className="pass-label">TIER</span>
            <strong className="tier-tag">{pass.ticketType || 'General Admission'}</strong>
          </div>
          <div className="pass-col">
            <span className="pass-label">SPOTS</span>
            <strong>{pass.ticketsCount || 1} {pass.ticketsCount > 1 ? 'People' : 'Person'}</strong>
          </div>
          <div className="pass-col">
            <span className="pass-label">STATUS</span>
            <span className="pass-status-badge">● {pass.status || 'Confirmed'}</span>
          </div>
        </div>
        <div className="pass-code-zone">
          <div className="mock-qr" aria-label="QR Code check-in pass">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <rect x="0" y="0" width="100" height="100" fill="white" />
              <rect x="10" y="10" width="25" height="25" fill="#101110" />
              <rect x="15" y="15" width="15" height="15" fill="white" />
              <rect x="18" y="18" width="9" height="9" fill="#101110" />
              <rect x="65" y="10" width="25" height="25" fill="#101110" />
              <rect x="70" y="15" width="15" height="15" fill="white" />
              <rect x="73" y="18" width="9" height="9" fill="#101110" />
              <rect x="10" y="65" width="25" height="25" fill="#101110" />
              <rect x="15" y="70" width="15" height="15" fill="white" />
              <rect x="18" y="73" width="9" height="9" fill="#101110" />
              <rect x="42" y="12" width="16" height="6" fill="#101110" />
              <rect x="42" y="24" width="16" height="8" fill="#101110" />
              <rect x="42" y="38" width="20" height="20" fill="#101110" />
              <rect x="68" y="44" width="22" height="10" fill="#101110" />
              <rect x="12" y="42" width="22" height="14" fill="#101110" />
              <rect x="40" y="66" width="18" height="24" fill="#101110" />
              <rect x="66" y="66" width="24" height="24" fill="#101110" />
            </svg>
            <div className="mock-barcode" aria-hidden="true">
              <span /><span /><span /><span /><span /><span /><span /><span /><span /><span />
            </div>
          </div>
          <p className="qr-hint">Scan at door · Valid with photo or student ID</p>
        </div>
        <div className="pass-actions">
          <button className="button button-primary full-width" type="button" onClick={() => window.print()}>
            Print / Save Pass <span>🖨</span>
          </button>
          <button className="button button-ghost full-width" type="button" onClick={onClose}>
            Back to Passes
          </button>
        </div>
      </article>
    </div>
  );
}

function RegistrationsManagerModal({ registrations, onClose, onCancel, onUpdate, onLoadDemo, onClearAll, onShowToast, onOpenPass }) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', phone: '', notes: '' });

  const startEdit = (reg) => {
    setEditingId(reg.id);
    setEditForm({ name: reg.name, email: reg.email, phone: reg.phone, notes: reg.notes || '' });
  };

  const saveEdit = (id) => {
    if (!editForm.name.trim() || !editForm.email.trim()) {
      onShowToast('Name and email are required.');
      return;
    }
    onUpdate(id, editForm);
    setEditingId(null);
  };

  const filtered = useMemo(() => {
    return registrations.filter((r) => {
      const matchesSearch = `${r.eventTitle || ''} ${r.name || ''} ${r.id || ''} ${r.email || ''}`.toLowerCase().includes(search.toLowerCase());
      if (!matchesSearch) return false;
      if (filter === 'all') return true;
      if (filter === 'confirmed') return r.status === 'Confirmed';
      return true;
    });
  }, [registrations, search, filter]);

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pulse-registrations-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    onShowToast('Exported registrations to JSON file.');
  };

  return (
    <div className="modal-backdrop is-open" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="registrations-manager-modal" role="dialog" aria-modal="true" aria-labelledby="reg-hub-title">
        <button className="modal-close" type="button" aria-label="Close registrations hub" onClick={onClose}>×</button>
        <div className="manager-header">
          <div className="manager-title-group">
            <Eyebrow dot>Local Storage Hub · pulse-registrations</Eyebrow>
            <h2 id="reg-hub-title">My Passes &amp; Registrations</h2>
            <p>View, modify, cancel, and manage tickets stored locally in your browser.</p>
          </div>
          <div className="manager-storage-badge">
            <span>💾 LocalStorage</span>
            <strong>{registrations.length} {registrations.length === 1 ? 'Pass' : 'Passes'}</strong>
          </div>
        </div>

        <div className="manager-controls">
          <div className="manager-tabs">
            <button className={`tab-pill ${filter === 'all' ? 'active' : ''}`} type="button" onClick={() => setFilter('all')}>
              All Passes <span>{registrations.length}</span>
            </button>
            <button className={`tab-pill ${filter === 'confirmed' ? 'active' : ''}`} type="button" onClick={() => setFilter('confirmed')}>
              Active <span>{registrations.filter(r => r.status === 'Confirmed').length}</span>
            </button>
          </div>
          <div className="manager-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search by name, event, or ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search registrations"
            />
          </div>
        </div>

        <div className="manager-action-row">
          <button className="mini-btn" type="button" onClick={exportJSON}>
            <span>📥 Export JSON</span>
          </button>
          {registrations.length === 0 && (
            <button className="mini-btn mini-btn-accent" type="button" onClick={onLoadDemo}>
              <span>✨ Load Demo Passes</span>
            </button>
          )}
          {registrations.length > 0 && (
            <button className="mini-btn mini-btn-danger" type="button" onClick={onClearAll}>
              <span>🗑 Clear All Local Data</span>
            </button>
          )}
        </div>

        <div className="registrations-scroll">
          {filtered.length === 0 ? (
            <div className="empty-registrations-state">
              <span className="empty-icon">🎟</span>
              <h3>No Registrations Found</h3>
              <p>You haven’t registered for any events yet, or no matches found.</p>
              <button className="button button-primary" type="button" onClick={onLoadDemo}>
                Load Sample Registrations <span>↗</span>
              </button>
            </div>
          ) : (
            <div className="registrations-card-list">
              {filtered.map((reg) => (
                <div key={reg.id} className="registration-item-card">
                  <div className="reg-item-top">
                    <div className="reg-ref-badge">REF: {reg.id}</div>
                    <span className="reg-status-pill">● {reg.status || 'Confirmed'}</span>
                  </div>
                  <div className="reg-item-body">
                    <div className="reg-event-info">
                      <h4>{reg.eventTitle}</h4>
                      <p className="reg-event-meta">📅 {reg.eventDate} · 📍 {reg.eventLocation}</p>
                      <span className="reg-ticket-badge">
                        🎟 {reg.ticketType || 'General Admission'} · {reg.ticketsCount || 1} {reg.ticketsCount > 1 ? 'tickets' : 'ticket'}
                      </span>
                    </div>

                    {editingId === reg.id ? (
                      <div className="reg-edit-form">
                        <label>Attendee Name<input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></label>
                        <label>Email Address<input type="email" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} /></label>
                        <label>Phone Number<input type="tel" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} /></label>
                        <label>Special Requests<input value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></label>
                        <div className="reg-edit-buttons">
                          <button className="button button-primary" type="button" onClick={() => saveEdit(reg.id)}>Save Changes</button>
                          <button className="button button-ghost" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="reg-attendee-info">
                        <div className="reg-info-cell"><small>Attendee</small><strong>{reg.name}</strong></div>
                        <div className="reg-info-cell"><small>Email</small><strong>{reg.email}</strong></div>
                        <div className="reg-info-cell"><small>Phone</small><strong>{reg.phone}</strong></div>
                        {reg.notes && <div className="reg-info-cell reg-notes-cell"><small>Notes</small><em>{reg.notes}</em></div>}
                      </div>
                    )}
                  </div>

                  <div className="reg-item-actions">
                    <button className="button button-dark" type="button" onClick={() => onOpenPass(reg)}>
                      View Digital Pass <span>↗</span>
                    </button>
                    {editingId !== reg.id && (
                      <button className="button button-ghost" type="button" onClick={() => startEdit(reg)}>
                        Edit Info <span>✎</span>
                      </button>
                    )}
                    <button className="button button-danger" type="button" onClick={() => onCancel(reg.id)}>
                      Cancel RSVP <span>×</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

function RegistrationModal({ eventId, events, onClose, onRegisterSuccess, onViewPasses }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    ticketType: 'General Admission',
    ticketsCount: 1,
    notes: '',
    event: eventId || (events[0] ? events[0].id : '')
  });
  const [errors, setErrors] = useState({});
  const [createdPass, setCreatedPass] = useState(null);

  useEffect(() => {
    if (eventId) {
      setForm((current) => ({ ...current, event: eventId }));
    }
  }, [eventId]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please enter your full name.';
    if (!/^\S+@\S+\.\S+$/.test(form.email)) nextErrors.email = 'Please enter a valid email.';
    if (!/^[+\d][\d\s()-]{7,}$/.test(form.phone)) nextErrors.phone = 'Please enter a valid phone number.';
    if (!form.event) nextErrors.event = 'Choose an event to continue.';
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    const matched = events.find((ev) => ev.id === form.event) || {};
    const newBooking = {
      id: `PLS-${Math.floor(100000 + Math.random() * 900000)}`,
      eventId: form.event,
      eventTitle: matched.title || 'Pulse Experience',
      eventDate: matched.fullDate || matched.date || 'Upcoming',
      eventTime: matched.time || 'TBC',
      eventLocation: matched.location || 'Bandra, Mumbai',
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      ticketType: form.ticketType,
      ticketsCount: Number(form.ticketsCount) || 1,
      notes: form.notes.trim(),
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    };

    onRegisterSuccess(newBooking);
    setCreatedPass(newBooking);
  };

  return (
    <div className="modal-backdrop is-open" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <article className="registration-modal" role="dialog" aria-modal="true" aria-labelledby="registration-title">
        <button className="modal-close" type="button" aria-label="Close registration" onClick={onClose}>×</button>
        <div className="registration-copy">
          <Eyebrow dot>Official RSVP &amp; Ticketing</Eyebrow>
          <h2 id="registration-title">Save your<br /><em>spot.</em></h2>
          <p>Instant pass generation with Local Storage persistence. No account needed.</p>
          <div className="form-orbit" />
        </div>

        {createdPass ? (
          <div className="registration-success-pane">
            <ConfettiCelebration />
            <div className="success-icon-badge">✓</div>
            <h3>Registration Confirmed!</h3>
            <p className="success-ref">Booking Reference: <strong>#{createdPass.id}</strong></p>
            <div className="success-ticket-preview">
              <span className="stp-event">{createdPass.eventTitle}</span>
              <span className="stp-date">📅 {createdPass.eventDate}</span>
              <span className="stp-attendee">👤 {createdPass.name} ({createdPass.ticketsCount} {createdPass.ticketsCount > 1 ? 'passes' : 'pass'})</span>
              <span className="stp-badge">Saved in Local Storage</span>
            </div>
            <div className="success-actions">
              <button className="button button-primary full-width" type="button" onClick={() => { onClose(); onViewPasses(createdPass); }}>
                Open Digital Pass <span>🎟</span>
              </button>
              <button className="button button-ghost full-width" type="button" onClick={onClose}>
                Done &amp; Return to Events
              </button>
            </div>
          </div>
        ) : (
          <form className="registration-form" onSubmit={submit} noValidate>
            <label>
              Choose an event
              <select value={form.event} onChange={(e) => update('event', e.target.value)}>
                <option value="">Select one</option>
                {events.map((event) => (
                  <option value={event.id} key={event.id}>
                    {event.title} — {event.date} ({event.price})
                  </option>
                ))}
              </select>
              <small className="field-error">{errors.event || ''}</small>
            </label>

            <label>
              Full name
              <input
                type="text"
                value={form.name}
                placeholder="e.g. Aarav Sharma"
                onChange={(e) => update('name', e.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              <small className="field-error">{errors.name || ''}</small>
            </label>

            <div className="form-grid-2">
              <label>
                Email address
                <input
                  type="email"
                  value={form.email}
                  placeholder="you@example.com"
                  onChange={(e) => update('email', e.target.value)}
                  aria-invalid={Boolean(errors.email)}
                />
                <small className="field-error">{errors.email || ''}</small>
              </label>

              <label>
                Phone number
                <input
                  type="tel"
                  value={form.phone}
                  placeholder="+91 98765 43210"
                  onChange={(e) => update('phone', e.target.value)}
                  aria-invalid={Boolean(errors.phone)}
                />
                <small className="field-error">{errors.phone || ''}</small>
              </label>
            </div>

            <div className="form-grid-2">
              <label>
                Pass tier
                <select value={form.ticketType} onChange={(e) => update('ticketType', e.target.value)}>
                  <option value="General Admission">General Admission</option>
                  <option value="VIP Access">VIP Access</option>
                  <option value="Student Pass">Student Pass</option>
                </select>
              </label>

              <label>
                Tickets
                <select value={form.ticketsCount} onChange={(e) => update('ticketsCount', e.target.value)}>
                  <option value="1">1 Person</option>
                  <option value="2">2 People</option>
                  <option value="3">3 People</option>
                  <option value="4">4 People</option>
                  <option value="5">5 People</option>
                </select>
              </label>
            </div>

            <label>
              Special requests or notes <span className="optional">optional</span>
              <input
                value={form.notes}
                placeholder="Dietary requests, accessibility, student ID, etc."
                onChange={(e) => update('notes', e.target.value)}
              />
            </label>

            <button className="button button-dark full-width" type="submit">
              Complete registration <span>↗</span>
            </button>
            <button
              className="button button-ghost full-width modal-cancel-button"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              style={{ marginTop: '10px' }}
            >
              Cancel <span>×</span>
            </button>
            <p className="form-note">Data saved locally in browser. No third-party trackers.</p>
          </form>
        )}
      </article>
    </div>
  );
}

function App() {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('pulse-theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [favorites, setFavorites] = useState(() => readStorage('pulse-favorites', []));
  const [events, setEvents] = useState(() => [...EVENTS, ...readStorage('pulse-owner-events', [])]);
  const [registrations, setRegistrations] = useState(() => readStorage('pulse-registrations', []));

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrationEvent, setRegistrationEvent] = useState(null);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [passesOpen, setPassesOpen] = useState(false);
  const [activePass, setActivePass] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState('');
  const [cookieModalOpen, setCookieModalOpen] = useState(false);

  const navigateTo = (path, targetId) => {
    const cleanPath = (path || '/').replace(/#.*/, '');
    if (cleanPath && window.location.pathname !== cleanPath) {
      window.history.pushState(null, '', cleanPath);
    }
    if (targetId === 'top' || !targetId) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Clean URLs: ensure no `#` symbol appears in any endpoint
  useEffect(() => {
    const handleUrlClean = () => {
      if (window.location.hash) {
        const hashSection = window.location.hash.replace('#', '');
        const cleanPath = !hashSection || hashSection === 'top' ? '/' : `/${hashSection}`;
        window.history.replaceState(null, '', cleanPath);
        setTimeout(() => {
          if (hashSection === 'top' || !hashSection) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            document.getElementById(hashSection)?.scrollIntoView({ behavior: 'smooth' });
          }
        }, 80);
      }
    };

    handleUrlClean();
    window.addEventListener('hashchange', handleUrlClean);
    return () => window.removeEventListener('hashchange', handleUrlClean);
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/about') {
      setTimeout(() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' }), 120);
    } else if (path === '/discover') {
      setTimeout(() => document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' }), 120);
    } else if (path === '/community') {
      setTimeout(() => document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' }), 120);
    }
  }, []);

  // Sync browser back/forward history buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/about') {
        document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
      } else if (path === '/discover') {
        document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' });
      } else if (path === '/community') {
        document.getElementById('community')?.scrollIntoView({ behavior: 'smooth' });
      } else if (path === '/' || path === '') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Dark/Light mode theme sync
  useEffect(() => {
    document.body.classList.toggle('dark-mode', theme === 'dark');
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pulse-theme', theme);
  }, [theme]);

  // Live ticking countdown timer
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Keyboard shortcut to close modals
  useEffect(() => {
    const close = (e) => {
      if (e.key === 'Escape') {
        setSelectedEvent(null);
        setRegistrationEvent(null);
        setOwnerOpen(false);
        setPassesOpen(false);
        setActivePass(null);
      }
    };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  // Toast notification timer
  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  // Modal open backdrop lock
  useEffect(() => {
    const hasModal = Boolean(selectedEvent || registrationEvent !== null || ownerOpen || passesOpen || activePass);
    document.body.classList.toggle('modal-open', hasModal);
    return () => document.body.classList.remove('modal-open');
  }, [ownerOpen, registrationEvent, selectedEvent, passesOpen, activePass]);

  const showToast = (message) => setToast(message);

  const toggleFavorite = (id) => setFavorites((current) => {
    const saved = current.includes(id);
    const next = saved ? current.filter((item) => item !== id) : [...current, id];
    localStorage.setItem('pulse-favorites', JSON.stringify(next));
    showToast(saved ? 'Removed from your saved list.' : 'Saved to your list.');
    return next;
  });

  const shareEvent = async (event) => {
    const shareData = { title: `${event.title} · Pulse`, text: event.description, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        showToast('Event link copied to your clipboard.');
      }
    } catch {
      showToast('Share cancelled.');
    }
  };

  const openRegistration = (id = '') => {
    setSelectedEvent(null);
    setRegistrationEvent(id);
  };

  const handleRegisterSuccess = (newBooking) => {
    const updated = [newBooking, ...registrations.filter((r) => r.id !== newBooking.id)];
    setRegistrations(updated);
    localStorage.setItem('pulse-registrations', JSON.stringify(updated));
    showToast(`Pass #${newBooking.id} saved to Local Storage!`);
  };

  const handleUpdateRegistration = (id, fields) => {
    const updated = registrations.map((r) => (r.id === id ? { ...r, ...fields } : r));
    setRegistrations(updated);
    localStorage.setItem('pulse-registrations', JSON.stringify(updated));
    showToast('Registration details updated in Local Storage.');
  };

  const handleCancelRegistration = (id) => {
    const updated = registrations.filter((r) => r.id !== id);
    setRegistrations(updated);
    localStorage.setItem('pulse-registrations', JSON.stringify(updated));
    showToast('Registration cancelled and removed from Local Storage.');
  };

  const handleLoadDemoPasses = () => {
    const demoPasses = [
      {
        id: 'PLS-948201',
        eventId: 'sound-sessions',
        eventTitle: 'Sound Sessions',
        eventDate: 'Saturday, November 14, 2026',
        eventTime: '7:00 PM — 10:30 PM',
        eventLocation: 'The Courtyard, Bandra',
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        phone: '+91 98765 43210',
        ticketType: 'VIP Access',
        ticketsCount: 2,
        notes: 'Front row seats requested',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      },
      {
        id: 'PLS-632194',
        eventId: 'kiit-tech-forum',
        eventTitle: 'KIIT Future Tech Forum',
        eventDate: 'Wednesday, November 18, 2026',
        eventTime: '10:00 AM — 4:00 PM',
        eventLocation: 'Campus 6 Auditorium, KIIT',
        name: 'Priya Patnaik',
        email: 'priya.patnaik@kiit.ac.in',
        phone: '+91 91234 56789',
        ticketType: 'Student Pass',
        ticketsCount: 1,
        notes: 'KIIT CSE 3rd Year',
        status: 'Confirmed',
        createdAt: new Date().toISOString()
      }
    ];
    setRegistrations(demoPasses);
    localStorage.setItem('pulse-registrations', JSON.stringify(demoPasses));
    showToast('Loaded 2 sample tickets into Local Storage!');
  };

  const handleClearAllRegistrations = () => {
    if (window.confirm('Are you sure you want to delete all saved event registrations from Local Storage?')) {
      setRegistrations([]);
      localStorage.removeItem('pulse-registrations');
      showToast('All registration data cleared from Local Storage.');
    }
  };

  const handleHeroSearch = ({ city, category: heroCategory, date }) => {
    if (date === 'This weekend') {
      setCategory('weekend');
      setQuery('');
      return;
    }
    const normalized = heroCategory.toLowerCase();
    const validCategory = CATEGORIES.includes(normalized) ? normalized : 'all';
    setCategory(validCategory);
    setQuery(validCategory === 'all' ? city : '');
  };

  const createEvent = (event) => {
    setEvents((current) => {
      const next = [...current, event];
      localStorage.setItem('pulse-owner-events', JSON.stringify(next.filter((item) => item.id.startsWith('owner-'))));
      return next;
    });
    setOwnerOpen(false);
    setSelectedEvent(event);
  };

  return (
    <div className="site-shell" id="top">
      <DuotoneFilterDef />
      <header className="site-header">
        <Brand onNavigate={navigateTo} />
        <nav className={`main-nav ${mobileMenu ? 'is-open' : ''}`} aria-label="Primary navigation">
          <a
            href="/discover"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/discover', 'discover');
              setMobileMenu(false);
            }}
          >
            Discover
          </a>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/about', 'about');
              setMobileMenu(false);
            }}
          >
            How it works
          </a>
          <a
            href="/community"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/community', 'community');
              setMobileMenu(false);
            }}
          >
            Community
          </a>
          <button className="nav-host" type="button" onClick={() => { setOwnerOpen(true); setMobileMenu(false); }}>
            Host an event <span>↗</span>
          </button>
          <button className="nav-passes-mobile" type="button" onClick={() => { setPassesOpen(true); setMobileMenu(false); }}>
            🎟 My Passes ({registrations.length})
          </button>
        </nav>

        <div className="header-actions">
          <button
            className="passes-button"
            type="button"
            aria-label="View my registered events"
            onClick={() => setPassesOpen(true)}
          >
            <span className="passes-icon">🎟</span>
            <span className="passes-text">My Passes</span>
            <span className="passes-count">{registrations.length}</span>
          </button>

          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={() => setTheme((current) => current === 'dark' ? 'light' : 'dark')}
          >
            <span className="theme-toggle-track">
              <span className="theme-toggle-thumb">
                {theme === 'dark' ? '☾' : '☼'}
              </span>
            </span>
            <span className="theme-toggle-text">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>

          <button className="sign-in" type="button" onClick={() => showToast('Guest session active · Passes sync with Local Storage')}>
            Guest
          </button>

          <button
            className="mobile-menu icon-button"
            type="button"
            aria-label="Open navigation"
            aria-expanded={mobileMenu}
            onClick={() => setMobileMenu((current) => !current)}
          >
            <span /><span />
          </button>
        </div>
      </header>

      <main>
        <Hero
          events={events}
          hoveredId={hoveredId}
          activeCategory={category}
          onCategoryChange={setCategory}
          onExplore={() => navigateTo('/discover', 'discover')}
          onHost={() => navigateTo('/about', 'about')}
          onHostEvent={() => setOwnerOpen(true)}
          onSelect={setSelectedEvent}
          onSearch={handleHeroSearch}
          onSave={(event) => toggleFavorite(event.id)}
          now={now}
        />
        <Ticker />
        <Discover
          events={events}
          favorites={favorites}
          onFavorite={toggleFavorite}
          onOpen={setSelectedEvent}
          onShare={shareEvent}
          onToast={showToast}
          onHover={setHoveredId}
          now={now}
          category={category}
          query={query}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
        />
        <HowItWorks />
        <Community />
        <Newsletter />
      </main>

      <footer className="site-footer section-pad">
        <Brand onNavigate={navigateTo} />
        <p>Made for the beautifully curious.</p>
        <div>
          <a
            href="/discover"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/discover', 'discover');
            }}
          >
            Events
          </a>
          <a
            href="/about"
            onClick={(e) => {
              e.preventDefault();
              navigateTo('/about', 'about');
            }}
          >
            About Pulse
          </a>
          <a href="https://www.instagram.com" target="_blank" rel="noreferrer">Instagram ↗</a>
          <a href="mailto:hello@pulse.events">Contact</a>
          <button
            type="button"
            className="footer-cookie-btn"
            onClick={() => setCookieModalOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--muted)',
              fontFamily: 'var(--mono)',
              fontSize: '10px',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            Cookie settings
          </button>
        </div>
        <a
          className="back-to-top"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigateTo('/', 'top');
          }}
        >
          Back to top ↑
        </a>
        <span className="footer-year">© 2026 Pulse</span>
      </footer>

      <button
        className="mobile-sticky-cta"
        type="button"
        onClick={() => navigateTo('/discover', 'discover')}
      >
        Find your next event <span>↓</span>
      </button>

      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          favorite={favorites.includes(selectedEvent.id)}
          onClose={() => setSelectedEvent(null)}
          onRegister={openRegistration}
          onFavorite={toggleFavorite}
          onShare={shareEvent}
          now={now}
        />
      )}

      {registrationEvent !== null && (
        <RegistrationModal
          eventId={registrationEvent}
          events={events}
          onClose={() => setRegistrationEvent(null)}
          onRegisterSuccess={handleRegisterSuccess}
          onViewPasses={(pass) => {
            setActivePass(pass);
          }}
        />
      )}

      {ownerOpen && (
        <OwnerEventModal
          onClose={() => setOwnerOpen(false)}
          onCreate={createEvent}
        />
      )}

      {passesOpen && (
        <RegistrationsManagerModal
          registrations={registrations}
          onClose={() => setPassesOpen(false)}
          onCancel={handleCancelRegistration}
          onUpdate={handleUpdateRegistration}
          onLoadDemo={handleLoadDemoPasses}
          onClearAll={handleClearAllRegistrations}
          onShowToast={showToast}
          onOpenPass={(pass) => {
            setActivePass(pass);
          }}
        />
      )}

      {activePass && (
        <DigitalPassModal
          pass={activePass}
          onClose={() => setActivePass(null)}
        />
      )}

      <CookieConsent
        externalOpen={cookieModalOpen}
        onCloseExternal={() => setCookieModalOpen(false)}
      />

      <div className={`toast ${toast ? 'show' : ''}`} role="status">{toast}</div>
    </div>
  );
}

export default App;
