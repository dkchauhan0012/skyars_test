import React, { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { NAV_ITEMS, SITE_META, type SectionId } from '../../content/site';
import { EASE_OUT_QUART } from '../../motion/variants';
import { Button } from './Button';

export const Header: React.FC = () => {
  const prefersReducedMotion = useReducedMotion();
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);

  // Sync active navigation link with scroll position via IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const sectionElements = NAV_ITEMS.map((item) =>
      document.getElementById(item.id)
    ).filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible.length > 0) {
          setActiveSection(visible[0].target.id as SectionId);
        }
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: [0.1, 0.35],
      }
    );

    for (const el of sectionElements) {
      observer.observe(el);
    }

    return () => observer.disconnect();
  }, []);

  // Close mobile menu on Escape and restore focus to the toggle button
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setMobileMenuOpen(false);
        toggleButtonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const handleMobileNavClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-[var(--color-border)] bg-[var(--color-bg)]/95">
        <div className="site-container flex h-[4.5rem] items-center justify-between gap-6">
          <a
            href="#"
            className="inline-flex items-center py-1 text-[var(--color-text)] no-underline shrink-0"
            aria-label={`${SITE_META.brandName} home`}
          >
            <img
              src="/assets/aistudio/logo_c23009d2.png"
              alt={SITE_META.brandName}
              width={148}
              height={83}
              className="h-9 sm:h-10 w-auto object-contain select-none -ml-1"
            />
          </a>

          {/* Desktop Navigation with Motion Flightline Directional Cut Indicator */}
          <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? 'true' : undefined}
                  className={`relative py-2 text-sm font-medium transition-colors duration-150 ${
                    isActive
                      ? 'text-[var(--color-text)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <motion.span
                      layoutId={prefersReducedMotion ? undefined : 'header-active-slash'}
                      transition={{ duration: 0.24, ease: EASE_OUT_QUART }}
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[var(--color-accent)] [clip-path:polygon(0_0,100%_0,calc(100%-4px)_100%,0_100%)]"
                    />
                  )}
                </a>
              );
            })}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Button href="#contact" variant="primary">
              Start a project
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            ref={toggleButtonRef}
            type="button"
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="inline-flex md:hidden items-center justify-center rounded-[2px] border border-[var(--color-border)] bg-[var(--color-field)] p-2.5 text-[var(--color-text)] hover:border-[var(--color-accent-hover)] transition-colors duration-150"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence initial={false}>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              ref={mobileMenuRef}
              initial={prefersReducedMotion ? false : { opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: EASE_OUT_QUART }}
              className="md:hidden max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-[var(--color-border)] bg-[var(--color-field)]"
            >
              <nav
                aria-label="Mobile navigation"
                className="site-container flex flex-col py-5 gap-1.5"
              >
                {NAV_ITEMS.map((item) => {
                  const isActive = activeSection === item.id;
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      onClick={handleMobileNavClick}
                      aria-current={isActive ? 'true' : undefined}
                      className={`flex items-center justify-between px-3 py-2.5 text-base font-medium transition-colors duration-150 ${
                        isActive
                          ? 'text-[var(--color-text)] border-l-2 border-[var(--color-accent)] bg-[var(--color-surface)] pl-3.5'
                          : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowUpRight className="h-4 w-4 text-[var(--color-accent-hover)]" aria-hidden="true" />
                    </a>
                  );
                })}

                <div className="pt-4 mt-2 border-t border-[var(--color-border)]">
                  <Button
                    href="#contact"
                    variant="primary"
                    className="w-full"
                    onClick={handleMobileNavClick}
                  >
                    Start a project
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
