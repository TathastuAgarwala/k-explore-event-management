import { useEffect, useRef, useState } from 'react';
import './HeroBackground.css';

export default function HeroBackground({ heroRef }) {
  const rootRef = useRef(null);
  const blobsLayerRef = useRef(null);
  const ringsLayerRef = useRef(null);
  const ghostLayerRef = useRef(null);
  const spotlightRef = useRef(null);

  const [isPaused, setIsPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, []);

  useEffect(() => {
    const heroEl = heroRef?.current || rootRef.current?.parentElement;
    if (!heroEl) return;

    let isVisible = true;
    let isDocHidden = document.hidden;
    let rafId = null;

    // Mouse coordinates for spotlight lerp
    let mouseTargetX = -9999;
    let mouseTargetY = -9999;
    let mouseCurrentX = -9999;
    let mouseCurrentY = -9999;
    let hasMouse = false;

    // Scroll parallax targets
    let targetScrollY = window.scrollY || 0;
    let currentScrollY = targetScrollY;

    const isFinePointer = window.matchMedia('(pointer: fine)').matches;

    // 1. Intersection Observer to pause animations when hero is offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        updatePauseState();
      },
      { threshold: 0.05 }
    );
    observer.observe(heroEl);

    // 2. Document visibility handler
    const onVisibilityChange = () => {
      isDocHidden = document.hidden;
      updatePauseState();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    function updatePauseState() {
      const shouldPause = !isVisible || isDocHidden;
      setIsPaused(shouldPause);
    }

    // 3. Passive scroll listener for parallax
    const onScroll = () => {
      targetScrollY = window.scrollY || 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // 4. Mouse movement for spotlight
    const onPointerMove = (e) => {
      if (!isFinePointer) return;
      const rect = heroEl.getBoundingClientRect();
      if (
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom
      ) {
        mouseTargetX = e.clientX - rect.left;
        mouseTargetY = e.clientY - rect.top;
        if (!hasMouse) {
          mouseCurrentX = mouseTargetX;
          mouseCurrentY = mouseTargetY;
          hasMouse = true;
          if (spotlightRef.current) {
            spotlightRef.current.style.opacity = '1';
          }
        }
      } else if (hasMouse) {
        hasMouse = false;
        if (spotlightRef.current) {
          spotlightRef.current.style.opacity = '0';
        }
      }
    };

    const onPointerLeave = () => {
      hasMouse = false;
      if (spotlightRef.current) {
        spotlightRef.current.style.opacity = '0';
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    heroEl.addEventListener('pointerleave', onPointerLeave, { passive: true });

    // 5. Single shared requestAnimationFrame for spotlight & scroll parallax
    const tick = () => {
      if (isVisible && !isDocHidden && !reducedMotion) {
        // Eased scroll parallax
        currentScrollY += (targetScrollY - currentScrollY) * 0.15;

        if (blobsLayerRef.current) {
          blobsLayerRef.current.style.transform = `translate3d(0, ${currentScrollY * 0.2}px, 0)`;
        }
        if (ringsLayerRef.current) {
          ringsLayerRef.current.style.transform = `translate3d(0, ${currentScrollY * 0.1}px, 0)`;
        }
        if (ghostLayerRef.current) {
          ghostLayerRef.current.style.transform = `translate3d(0, ${currentScrollY * 0.3}px, 0)`;
        }

        // Eased cursor spotlight (fine pointer only)
        if (isFinePointer && hasMouse && spotlightRef.current) {
          mouseCurrentX += (mouseTargetX - mouseCurrentX) * 0.12;
          mouseCurrentY += (mouseTargetY - mouseCurrentY) * 0.12;
          spotlightRef.current.style.transform = `translate3d(${mouseCurrentX - 210}px, ${mouseCurrentY - 210}px, 0)`;
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointerMove);
      heroEl.removeEventListener('pointerleave', onPointerLeave);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [heroRef, reducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`hero-bg ${isPaused ? 'is-paused' : ''} ${reducedMotion ? 'is-reduced-motion' : ''}`}
      aria-hidden="true"
    >
      {/* Layer 1: Gradient Blobs */}
      <div ref={blobsLayerRef} className="hero-bg-layer hero-bg-blobs">
        <div className="hero-blob hero-blob-lime" />
        <div className="hero-blob hero-blob-indigo" />
        <div className="hero-blob hero-blob-coral" />
      </div>

      {/* Layer 2: Pulse Rings (centered on globe area) */}
      <div ref={ringsLayerRef} className="hero-bg-layer hero-bg-rings">
        <div className="hero-ring hero-ring-1" />
        <div className="hero-ring hero-ring-2" />
        <div className="hero-ring hero-ring-3" />
        <div className="hero-ring hero-ring-4" />
      </div>

      {/* Layer 3: Dot Grid */}
      <div className="hero-bg-layer hero-bg-grid" />

      {/* Layer 4: Ghost Text */}
      <div ref={ghostLayerRef} className="hero-bg-layer hero-bg-ghost">
        <div className="ghost-text-track">
          <span className="ghost-text-content">TONIGHT — THIS WEEKEND — LIVE — NEAR YOU — </span>
          <span className="ghost-text-content">TONIGHT — THIS WEEKEND — LIVE — NEAR YOU — </span>
        </div>
      </div>

      {/* Layer 5: Grain */}
      <div className="hero-bg-layer hero-bg-grain" />

      {/* Layer 6: Cursor Spotlight */}
      <div ref={spotlightRef} className="hero-bg-spotlight" />
    </div>
  );
}

