import React, { useState, useEffect } from 'react';
import './CookieConsent.css';

const COOKIE_NAME = 'pulse_cookie_consent';

function getStoredConsent() {
  // Check document.cookie first
  const match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
  if (match) {
    try {
      return JSON.parse(decodeURIComponent(match[2]));
    } catch {
      return null;
    }
  }

  // Fallback to localStorage
  try {
    const raw = localStorage.getItem(COOKIE_NAME);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore storage errors
  }

  return null;
}

function saveConsent(data) {
  const payload = {
    ...data,
    timestamp: new Date().toISOString(),
  };

  const str = encodeURIComponent(JSON.stringify(payload));
  // 1 year validity, SameSite=Lax, path=/
  document.cookie = `${COOKIE_NAME}=${str}; max-age=31536000; path=/; SameSite=Lax`;

  try {
    localStorage.setItem(COOKIE_NAME, JSON.stringify(payload));
  } catch {
    // Ignore storage errors
  }
}

export default function CookieConsent({ onOpenPreferences, externalOpen, onCloseExternal }) {
  const [consent, setConsent] = useState(() => getStoredConsent());
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // If no consent has been registered, show the banner after a brief organic delay
    if (!consent) {
      const timer = setTimeout(() => setShowBanner(true), 800);
      return () => clearTimeout(timer);
    }
  }, [consent]);

  useEffect(() => {
    if (externalOpen) {
      setShowModal(true);
    }
  }, [externalOpen]);

  const handleAcceptAll = () => {
    const val = { essential: true, analytics: true, marketing: true };
    saveConsent(val);
    setConsent(val);
    setShowBanner(false);
    setShowModal(false);
    onCloseExternal?.();
  };

  const handleEssentialOnly = () => {
    const val = { essential: true, analytics: false, marketing: false };
    saveConsent(val);
    setConsent(val);
    setShowBanner(false);
    setShowModal(false);
    onCloseExternal?.();
  };

  const handleSaveCustom = () => {
    const val = { essential: true, analytics, marketing };
    saveConsent(val);
    setConsent(val);
    setShowBanner(false);
    setShowModal(false);
    onCloseExternal?.();
  };

  return (
    <>
      {/* Floating Bottom Cookie Banner */}
      {showBanner && !showModal && (
        <aside className="cookie-banner-dock" role="dialog" aria-label="Cookie consent">
          <div className="cookie-header">
            <span className="cookie-eyebrow">
              <span aria-hidden="true">🍪</span> Cookie Preferences
            </span>
            <button
              className="cookie-close-btn"
              type="button"
              onClick={handleEssentialOnly}
              aria-label="Dismiss cookie notice with essential cookies only"
            >
              ✕
            </button>
          </div>

          <div className="cookie-body">
            Pulse uses cookies to preserve your saved events, streamline ticket registration,
            and understand platform performance. We never sell personal data.
          </div>

          <div className="cookie-actions">
            <button
              className="cookie-btn-primary"
              type="button"
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
            <button
              className="cookie-btn-secondary"
              type="button"
              onClick={handleEssentialOnly}
            >
              Essential Only
            </button>
            <button
              className="cookie-btn-link"
              type="button"
              onClick={() => setShowModal(true)}
            >
              Customize
            </button>
          </div>
        </aside>
      )}

      {/* Preferences Customization Modal */}
      {showModal && (
        <div
          className="cookie-modal-backdrop"
          onClick={() => {
            setShowModal(false);
            onCloseExternal?.();
          }}
          role="presentation"
        >
          <div
            className="cookie-modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cookie-modal-title"
          >
            <div className="cookie-header">
              <span className="cookie-eyebrow">
                <span aria-hidden="true">⚙</span> Cookie Settings
              </span>
              <button
                className="cookie-close-btn"
                type="button"
                onClick={() => {
                  setShowModal(false);
                  onCloseExternal?.();
                }}
                aria-label="Close preferences"
              >
                ✕
              </button>
            </div>

            <h3 id="cookie-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
              How Pulse Uses Cookies
            </h3>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <h4>Essential System Cookies</h4>
                <p>Required for basic security, ticket pass management, and saved events.</p>
              </div>
              <span className="cookie-switch">
                <input type="checkbox" checked disabled aria-label="Essential cookies always required" />
                Required
              </span>
            </div>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <h4>Experience & Analytics</h4>
                <p>Helps us measure discoverability, globe rendering speed, and ticket interest.</p>
              </div>
              <label className="cookie-switch">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                {analytics ? 'Active' : 'Off'}
              </label>
            </div>

            <div className="cookie-pref-item">
              <div className="cookie-pref-info">
                <h4>Personalized Signals</h4>
                <p>Curates recommendations based on cities and creative topics you browse.</p>
              </div>
              <label className="cookie-switch">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                {marketing ? 'Active' : 'Off'}
              </label>
            </div>

            <div className="cookie-actions" style={{ marginTop: '8px' }}>
              <button
                className="cookie-btn-primary"
                type="button"
                onClick={handleSaveCustom}
              >
                Save Preferences
              </button>
              <button
                className="cookie-btn-secondary"
                type="button"
                onClick={handleAcceptAll}
              >
                Accept All
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

