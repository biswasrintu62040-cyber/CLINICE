import * as React from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Calendar, Menu, X } from 'lucide-react';
import { Button } from '@/src/components/ui/button';

const PRIMARY_NAV_LINKS = [
  { label: 'About Us', to: '/about' },
  { label: 'Our Doctors', to: '/doctors' },
  { label: 'Specialties', to: '/specialties' },
  { label: 'Patient Portal', to: '/portal' },
  { label: 'Contact', to: '/contact' },
] as const;

export function TopNavbar(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState<boolean>(false);

  React.useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/30 dark:border-white/10 bg-white/18 dark:bg-[#071714]/35 backdrop-blur-md backdrop-saturate-150 shadow-[0_4px_24px_-8px_rgba(13,74,62,0.07)]">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 sm:gap-8 px-4 sm:px-8 lg:px-12 bg-transparent">
        {/* Zone 1: Single-Line Brand Wordmark (Strict Top Bar Contract) */}
        <Link
          to="/"
          className="font-display text-xl sm:text-2xl font-semibold tracking-tight text-fg-primary whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus rounded-sm"
        >
          NovaCraft Orbai
        </Link>

        {/* Zone 2: Concise Single-Line Navigation Links (including Home when on inner sections) */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-fg-primary/90"
        >
          {location.pathname !== '/' && (
            <Link
              to="/"
              className="whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 border-transparent text-brand-primary font-semibold hover:text-fg-primary hover:border-brand-primary"
            >
              ← Home
            </Link>
          )}
          {PRIMARY_NAV_LINKS.map((item) => {
            const isActive = location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  isActive
                    ? 'border-brand-primary text-fg-primary font-semibold'
                    : 'border-transparent hover:text-fg-primary hover:border-border-strong'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Trigger */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Button
            intent="primary"
            size="sm"
            onClick={() => navigate('/book')}
            className="min-h-10 px-3 sm:px-4 text-xs"
          >
            <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
            <span>Book Appointment</span>
          </Button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            className="inline-flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-white/45 dark:border-white/15 bg-white/25 dark:bg-white/10 backdrop-blur-md text-fg-primary md:hidden hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring-focus"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Accessible Mobile Navigation Drawer */}
      {mobileMenuOpen ? (
        <div className="border-t border-white/35 dark:border-white/10 bg-white/75 dark:bg-[#0B221E]/85 backdrop-blur-xl px-4 py-5 md:hidden shadow-xl">
          <nav aria-label="Mobile Navigation" className="flex flex-col space-y-1">
            <Link
              to="/"
              className={`flex min-h-11 items-center rounded-lg px-3.5 text-base font-medium transition-colors ${
                location.pathname === '/'
                  ? 'bg-brand-soft text-brand-primary font-semibold'
                  : 'text-brand-primary font-semibold hover:bg-subtle'
              }`}
            >
              ← Back to Home
            </Link>
            {PRIMARY_NAV_LINKS.map((item) => {
              const isActive = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex min-h-11 items-center rounded-lg px-3.5 text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-brand-soft text-brand-primary font-semibold'
                      : 'text-fg-primary hover:bg-subtle'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            <Link
              to="/faq"
              className="flex min-h-11 items-center rounded-lg px-3.5 text-base font-medium text-fg-secondary hover:bg-subtle"
            >
              FAQ &amp; Consultation Fees (₹)
            </Link>
            <Link
              to="/admin"
              className="flex min-h-11 items-center rounded-lg px-3.5 text-sm font-mono text-fg-muted hover:bg-subtle"
            >
              Staff Admin Dashboard
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
