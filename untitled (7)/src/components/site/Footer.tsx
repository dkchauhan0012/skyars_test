import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { NAV_ITEMS, SITE_META } from '../../content/site';
import { FlightlineMark } from '../brand/FlightlineMark';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-[var(--color-border)] bg-[var(--color-bg)] pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden">
      {/* Subtle static cropped Flightline signature mark in the bottom-right footer margin */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-6 bottom-10 hidden lg:block w-64 opacity-[0.16]"
      >
        <FlightlineMark variant="counterweight" />
      </div>

      <div className="site-container relative z-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-8 pb-14 border-b border-[var(--color-divider)]">
          <div className="md:col-span-6 space-y-4">
            <a
              href="#"
              aria-label={`${SITE_META.brandName} home`}
              className="inline-block"
            >
              <img
                src="/assets/aistudio/logo_c23009d2.png"
                alt={SITE_META.brandName}
                width={168}
                height={95}
                className="h-11 w-auto object-contain select-none -ml-1.5"
              />
            </a>
            <p className="text-sm text-[var(--color-muted)] max-w-md leading-relaxed">
              {SITE_META.tagline}. Custom web and mobile software, connected IoT hardware systems,
              and practical workflow automation built from {SITE_META.location}.
            </p>
            <div className="pt-1">
              <a
                href="#contact"
                className="inline-flex items-center gap-1.5 font-display text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-accent-hover)] hover:text-[var(--color-text)] transition-colors duration-150"
              >
                <span>Start a project conversation</span>
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">
              Navigation
            </h2>
            <ul className="space-y-2.5 text-sm">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors duration-150"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h2 className="font-display text-xs font-semibold uppercase tracking-[0.08em] text-[var(--color-text)]">
              Direct Contact
            </h2>
            <ul className="space-y-2.5 text-sm text-[var(--color-muted)]">
              <li>
                <a
                  href={`mailto:${SITE_META.email}`}
                  className="text-[var(--color-text)] underline decoration-[var(--color-accent)] underline-offset-4 hover:text-[var(--color-accent-hover)] transition-colors duration-150"
                >
                  {SITE_META.email}
                </a>
              </li>
              <li>{SITE_META.location}</li>
              <li>
                <a
                  href="https://skyars.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--color-text)] transition-colors duration-150"
                >
                  skyars.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--color-muted)]">
          <p>
            &copy; {currentYear} {SITE_META.brandName}. All rights reserved.
          </p>
          <div className="inline-flex items-center gap-2.5">
            <FlightlineMark variant="slash" className="h-3 w-5 text-[var(--color-accent)]" />
            <span className="font-display tracking-wide text-[var(--color-text)]/85">
              {SITE_META.tagline}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
