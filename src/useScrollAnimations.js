import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, Flip);

// Global shared Lenis instance
let globalLenis = null;

export function getLenis() {
  return globalLenis;
}

/**
 * Trigger a branded lime panel page wipe transition (400ms in, 400ms out).
 */
export function triggerPageTransition(onMidpoint) {
  const curtain = document.querySelector('.page-transition-curtain');
  if (!curtain) {
    onMidpoint?.();
    return;
  }

  const tl = gsap.timeline();
  tl.set(curtain, { transformOrigin: 'bottom center', scaleY: 0 })
    .to(curtain, {
      scaleY: 1,
      duration: 0.4,
      ease: 'power3.inOut',
      onComplete: () => {
        onMidpoint?.();
        if (globalLenis) globalLenis.scrollTo(0, { immediate: true });
        else window.scrollTo(0, 0);
      },
    })
    .set(curtain, { transformOrigin: 'top center' })
    .to(curtain, {
      scaleY: 0,
      duration: 0.4,
      ease: 'power3.inOut',
    });
}

/**
 * Main scroll animation hook and runtime engine.
 */
export function useScrollAnimations({
  activeCategory,
  onStepChange,
  isModalOpen,
}) {
  const scopeRef = useRef(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 900;

    // 1. Initialize Lenis Smooth Scrolling (if not reduced motion)
    if (!isReducedMotion && !globalLenis) {
      globalLenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.9,
      });

      globalLenis.on('scroll', ScrollTrigger.update);

      const tickerRaf = (time) => {
        globalLenis?.raf(time * 1000);
      };
      gsap.ticker.add(tickerRaf);
      gsap.ticker.lagSmoothing(0);
    }

    // Refresh ScrollTrigger once fonts and images load
    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
    const handleLoad = () => ScrollTrigger.refresh();
    window.addEventListener('load', handleLoad);

    // 2. Scoped GSAP Context
    const ctx = gsap.context(() => {
      // ------------------------------------------------------------------------
      // A. Global Top Scroll Progress Bar
      // ------------------------------------------------------------------------
      const progressBar = document.querySelector('.scroll-progress-bar');
      if (progressBar) {
        gsap.to(progressBar, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: document.documentElement,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.2,
          },
        });
      }

      // ------------------------------------------------------------------------
      // B. Sticky Header (Direction detection, blur, & active link indicator)
      // ------------------------------------------------------------------------
      const header = document.querySelector('.site-header');
      if (header) {
        ScrollTrigger.create({
          start: 'top -40',
          end: 'max',
          onUpdate: (self) => {
            const scrollY = self.scroll();
            if (scrollY > 40) {
              header.classList.add('is-scrolled');
            } else {
              header.classList.remove('is-scrolled');
            }

            // Hide on scroll down past 120px, reveal on scroll up
            if (self.direction === 1 && scrollY > 120) {
              header.classList.add('is-hidden');
            } else if (self.direction === -1) {
              header.classList.remove('is-hidden');
            }
          },
        });
      }

      // ------------------------------------------------------------------------
      // C. Section Index Tracking (Right Edge)
      // ------------------------------------------------------------------------
      const sections = [
        { id: 'discover', index: 0 },
        { id: 'about', index: 1 },
        { id: 'community', index: 2 },
        { id: 'newsletter', index: 3 },
      ];

      sections.forEach(({ id, index }) => {
        const el = document.getElementById(id);
        const dotItem = document.querySelector(`.section-index-item[data-target="${id}"]`);
        if (el && dotItem) {
          ScrollTrigger.create({
            trigger: el,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => {
              document.querySelectorAll('.section-index-item').forEach((d) => d.classList.remove('is-active'));
              dotItem.classList.add('is-active');
            },
            onEnterBack: () => {
              document.querySelectorAll('.section-index-item').forEach((d) => d.classList.remove('is-active'));
              dotItem.classList.add('is-active');
            },
          });
        }
      });

      // ------------------------------------------------------------------------
      // D. Custom Cursor (Fine Pointer Only)
      // ------------------------------------------------------------------------
      const cursor = document.querySelector('.custom-cursor');
      if (cursor && !isReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.18, ease: 'power3' });
        const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.18, ease: 'power3' });

        const handlePointerMove = (e) => {
          cursor.classList.add('is-active');
          cursorX(e.clientX);
          cursorY(e.clientY);
        };

        const handlePointerLeave = () => {
          cursor.classList.remove('is-active');
        };

        window.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('mouseleave', handlePointerLeave);

        // Hover over event cards: show "VIEW"
        const cardElements = document.querySelectorAll('.event-card');
        cardElements.forEach((card) => {
          card.addEventListener('pointerenter', () => {
            cursor.classList.add('is-view');
            cursor.textContent = 'VIEW';
          });
          card.addEventListener('pointerleave', () => {
            cursor.classList.remove('is-view');
            cursor.textContent = '';
          });
        });

        // Hover over carousel: show "DRAG"
        const carousel = document.querySelector('.community-carousel-container');
        if (carousel) {
          carousel.addEventListener('pointerenter', () => {
            cursor.classList.add('is-drag');
            cursor.textContent = 'DRAG';
          });
          carousel.addEventListener('pointerleave', () => {
            cursor.classList.remove('is-drag');
            cursor.textContent = '';
          });
        }
      }

      // ------------------------------------------------------------------------
      // E. Magnetic CTAs (8-10px pull toward cursor)
      // ------------------------------------------------------------------------
      if (!isReducedMotion && window.matchMedia('(pointer: fine)').matches) {
        const magneticBtns = document.querySelectorAll('.magnetic-btn, .button-primary, .button-dark');
        magneticBtns.forEach((btn) => {
          const moveMagnet = (e) => {
            const rect = btn.getBoundingClientRect();
            const relX = e.clientX - (rect.left + rect.width / 2);
            const relY = e.clientY - (rect.top + rect.height / 2);
            gsap.to(btn, {
              x: relX * 0.22,
              y: relY * 0.22,
              duration: 0.25,
              ease: 'power2.out',
            });
          };

          const resetMagnet = () => {
            gsap.to(btn, {
              x: 0,
              y: 0,
              duration: 0.45,
              ease: 'elastic.out(1, 0.4)',
            });
          };

          btn.addEventListener('mousemove', moveMagnet);
          btn.addEventListener('mouseleave', resetMagnet);
        });
      }

      // ------------------------------------------------------------------------
      // F. Hero Choreography (Strict Rule: EventGlobe.jsx is NOT touched!)
      // ------------------------------------------------------------------------
      if (!isReducedMotion) {
        // 1. On Load Entrance
        const heroTl = gsap.timeline({ delay: 0.1 });

        heroTl
          .fromTo(
            '.hero-headline-inner',
            { yPercent: 115 },
            { yPercent: 0, duration: 0.85, ease: 'power3.out', stagger: 0.09 }
          )
          .fromTo(
            '.word-energy-highlight',
            { clipPath: 'inset(0 100% 0 0)' },
            { clipPath: 'inset(0 0 0 0)', duration: 0.55, ease: 'power2.out' },
            '-=0.45'
          )
          .fromTo(
            ['.hero-intro', '.hero-actions', '.hero-search', '.hero-chips', '.hero-proof'],
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.65, ease: 'power2.out', stagger: 0.08 },
            '-=0.35'
          );

        // 2. Parallax On Scroll
        const heroSection = document.querySelector('.hero');
        if (heroSection) {
          gsap.to('.hero-headline-line-1', {
            yPercent: -45,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom 40%',
              scrub: 0.5,
            },
          });

          gsap.to('.hero-headline-line-2', {
            yPercent: -22,
            opacity: 0,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom 40%',
              scrub: 0.5,
            },
          });

          // Blobs drift at 0.2x speed
          gsap.to('.hero-background-drift', {
            yPercent: 20,
            ease: 'none',
            scrollTrigger: {
              trigger: heroSection,
              start: 'top top',
              end: 'bottom top',
              scrub: 0.6,
            },
          });
        }
      }

      // ------------------------------------------------------------------------
      // G. Marquee Strip (Velocity Boost & Reverse on Scroll Up)
      // ------------------------------------------------------------------------
      const tickerTrack = document.querySelector('.ticker-track');
      if (tickerTrack && !isReducedMotion) {
        let currentPos = 0;
        let baseSpeed = 1.2;
        let direction = -1;
        let velocityMultiplier = 1;

        ScrollTrigger.create({
          onUpdate: (self) => {
            const v = Math.abs(self.getVelocity());
            velocityMultiplier = 1 + Math.min(v / 300, 3.5);
            // Reverse direction when scrolling up
            direction = self.direction === 1 ? -1 : 1;
          },
        });

        let isHovered = false;
        const tickerContainer = document.querySelector('.ticker');
        tickerContainer?.addEventListener('pointerenter', () => { isHovered = true; });
        tickerContainer?.addEventListener('pointerleave', () => { isHovered = false; });

        gsap.ticker.add(() => {
          if (isHovered) return;
          velocityMultiplier += (1 - velocityMultiplier) * 0.08;
          currentPos += baseSpeed * direction * velocityMultiplier;

          // Wrap seamlessly around -50%
          const copyWidth = tickerTrack.firstElementChild?.offsetWidth || 4000;
          if (currentPos < -copyWidth) currentPos += copyWidth;
          if (currentPos > 0) currentPos -= copyWidth;

          gsap.set(tickerTrack, { x: currentPos });
        });
      }

      // ------------------------------------------------------------------------
      // H. Discover Section (Word-by-word headline reveal & column-staggered cards)
      // ------------------------------------------------------------------------
      if (!isReducedMotion) {
        // Headline word-by-word reveal (plays once)
        gsap.fromTo(
          '.discover-title-word',
          { opacity: 0, y: 28 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: '#discover',
              start: 'top 80%',
              once: true,
            },
          }
        );

        // Column-staggered cards entrance
        gsap.fromTo(
          '.event-card',
          { opacity: 0, y: 55 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            stagger: 0.09,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: '.events-grid',
              start: 'top 85%',
              once: true,
            },
          }
        );

        // Parallax drift on EventCover shapes (+/- 12px)
        gsap.utils.toArray('.poster-shape').forEach((shape, i) => {
          const dir = i % 2 === 0 ? 12 : -12;
          gsap.to(shape, {
            y: dir,
            ease: 'none',
            scrollTrigger: {
              trigger: shape.closest('.event-card'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: 0.8,
            },
          });
        });
      }

      // ------------------------------------------------------------------------
      // I. How It Works (Pinned 300vh Scroll-Scrub on Desktop)
      // ------------------------------------------------------------------------
      const howSection = document.querySelector('.how-it-works');
      if (howSection && !isMobile && !isReducedMotion) {
        // Pin for 300vh
        const howTimeline = gsap.timeline({
          scrollTrigger: {
            trigger: howSection,
            start: 'top top',
            end: '+=2400',
            pin: true,
            scrub: 0.7,
            anticipatePin: 1,
            onUpdate: (self) => {
              const p = self.progress;
              // Map progress to 3 steps
              let step = 0;
              if (p > 0.66) step = 2;
              else if (p > 0.33) step = 1;
              onStepChange?.(step);

              // Update vertical progress line
              const vFill = document.querySelector('.how-steps-vertical-fill');
              if (vFill) gsap.set(vFill, { scaleY: p });
            },
          },
        });

        // Shape morph cross-transitions
        howTimeline
          .to('.how-step-card-0', { opacity: 1, scale: 1.02, duration: 0.5 })
          .to('.how-step-card-0', { opacity: 0.45, scale: 1, duration: 0.5 }, '+=0.4')
          .to('.how-step-card-1', { opacity: 1, scale: 1.02, duration: 0.5 }, '<')
          .to('.how-step-card-1', { opacity: 0.45, scale: 1, duration: 0.5 }, '+=0.4')
          .to('.how-step-card-2', { opacity: 1, scale: 1.02, duration: 0.5 }, '<');
      }

      // ------------------------------------------------------------------------
      // J. Community Section (Side entrances with rotation & line-by-line quote)
      // ------------------------------------------------------------------------
      const communitySection = document.querySelector('.community');
      if (communitySection && !isReducedMotion) {
        gsap.fromTo(
          '.quote-main',
          { x: -90, rotation: -6, opacity: 0 },
          {
            x: 0,
            rotation: -2,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: communitySection,
              start: 'top 75%',
              once: true,
            },
          }
        );

        gsap.fromTo(
          '.quote-side',
          { x: 90, rotation: 5, opacity: 0 },
          {
            x: 0,
            rotation: 2,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: communitySection,
              start: 'top 75%',
              once: true,
            },
          }
        );
      }

      // ------------------------------------------------------------------------
      // K. Newsletter Band (Scrubbed Circle Clip-Path Expansion)
      // ------------------------------------------------------------------------
      const newsletterSection = document.querySelector('.newsletter');
      if (newsletterSection && !isReducedMotion) {
        gsap.fromTo(
          newsletterSection,
          { clipPath: 'circle(18% at 85% 50%)' },
          {
            clipPath: 'circle(145% at 85% 50%)',
            ease: 'none',
            scrollTrigger: {
              trigger: newsletterSection,
              start: 'top 90%',
              end: 'center 45%',
              scrub: 0.6,
            },
          }
        );
      }

      // ------------------------------------------------------------------------
      // L. Footer Giant Wordmark & Back-to-Top Circular Progress Ring
      // ------------------------------------------------------------------------
      const footer = document.querySelector('.site-footer');
      if (footer && !isReducedMotion) {
        gsap.fromTo(
          '.footer-giant-wordmark',
          { y: 70, opacity: 0 },
          {
            y: 0,
            opacity: 0.12,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: footer,
              start: 'top 90%',
              once: true,
            },
          }
        );

        // Circular progress ring around Back to top button
        const circleProgress = document.querySelector('.back-to-top-circle-progress');
        if (circleProgress) {
          ScrollTrigger.create({
            start: 'top top',
            end: 'bottom bottom',
            onUpdate: (self) => {
              const dashoffset = 88 - self.progress * 88;
              gsap.set(circleProgress, { strokeDashoffset: dashoffset });
            },
          });
        }
      }
    }, scopeRef);

    return () => {
      ctx.revert();
      window.removeEventListener('load', handleLoad);
    };
  }, [activeCategory, isModalOpen]);

  return { scopeRef };
}

