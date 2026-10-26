/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';
import { Footer } from '@/src/components/layout/Footer';
import { TopNavbar } from '@/src/components/layout/TopNavbar';
import { CenterOpeningIntro } from '@/src/features/intro/components/CenterOpeningIntro';
import { AboutPage } from '@/src/routes/AboutPage';
import { AdminDashboardPage } from '@/src/routes/AdminDashboardPage';
import { BookingConfirmationPage } from '@/src/routes/BookingConfirmationPage';
import { BookingWizardPage } from '@/src/routes/BookingWizardPage';
import { ContactPage } from '@/src/routes/ContactPage';
import { DoctorProfilePage } from '@/src/routes/DoctorProfilePage';
import { DoctorsDirectoryPage } from '@/src/routes/DoctorsDirectoryPage';
import { FaqPage } from '@/src/routes/FaqPage';
import { HomePage } from '@/src/routes/HomePage';
import { PatientPortalPage } from '@/src/routes/PatientPortalPage';
import {
  CancellationPolicyPage,
  NotFoundPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
} from '@/src/routes/PolicyPages';
import { SpecialtiesPage } from '@/src/routes/SpecialtiesPage';
import { SpecialtyDetailPage } from '@/src/routes/SpecialtyDetailPage';

const SECTION_LABELS: Record<string, string> = {
  about: 'About Us',
  doctors: 'Our Doctors',
  specialties: 'Specialties',
  portal: 'Patient Portal',
  contact: 'Contact',
  book: 'Book Appointment',
  booking: 'Booking Confirmation',
  faq: 'FAQ & Tariffs',
  admin: 'Admin Dashboard',
  'privacy-policy': 'Privacy Policy',
  'terms-of-service': 'Terms of Service',
  'cancellation-refund-policy': 'Cancellation & Refund Policy',
};

function RootSanctuaryShell(): React.JSX.Element {
  const location = useLocation();
  const navigate = useNavigate();
  const [replayCounter, setReplayCounter] = React.useState<number>(0);
  const [isDarkMode, setIsDarkMode] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem('nco_theme_mode') === 'dark';
    } catch {
      return false;
    }
  });

  React.useEffect(() => {
    const rootEl = document.documentElement;
    if (isDarkMode) {
      rootEl.classList.add('dark');
    } else {
      rootEl.classList.remove('dark');
    }
    try {
      window.localStorage.setItem('nco_theme_mode', isDarkMode ? 'dark' : 'light');
    } catch {
      // Ignore storage errors
    }
  }, [isDarkMode]);

  const isHomePage = location.pathname === '/';
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const primarySectionKey = pathSegments[0] ?? '';
  const primarySectionTitle =
    SECTION_LABELS[primarySectionKey] ??
    primarySectionKey.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const handleBackNavigation = () => {
    if (typeof window !== 'undefined' && window.history.length > 2) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-fg-primary transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-fg-on-brand"
      >
        Skip to main content
      </a>

      {/* Signature Two-Panel Center-Opening Intro Overlay */}
      <CenterOpeningIntro
        brandName="NovaCraft Orbai"
        headline="Your Health. Our Priority."
        subheadline="Exceptional care, designed around you."
        forceReplayCounter={replayCounter}
      />

      {/* Strict 3-Zone Top Bar Navigation */}
      <TopNavbar />

      {/* Universal Section Back Bar — Displayed on Every Non-Home Section (/about, /doctors, /specialties, /portal, /contact, /book, etc.) */}
      {!isHomePage && (
        <div className="border-b border-border-hairline/70 bg-white/45 dark:bg-[#0B221E]/55 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-8 lg:px-12">
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleBackNavigation}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border-strong/70 bg-white/80 dark:bg-white/10 px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-fg-primary shadow-2xs transition-all hover:bg-brand-primary hover:text-white hover:border-brand-primary cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                <span>Back</span>
              </button>

              <Link
                to="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-xs sm:text-sm font-medium text-fg-secondary transition-colors hover:bg-subtle hover:text-fg-primary"
              >
                <Home className="h-3.5 w-3.5 text-brand-primary" aria-hidden="true" />
                <span>Back to Home</span>
              </Link>
            </div>

            <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-2 text-xs font-mono text-fg-muted">
              <Link to="/" className="hover:text-brand-primary transition-colors">
                Home
              </Link>
              <span aria-hidden="true">/</span>
              <span className="font-semibold text-fg-primary">{primarySectionTitle}</span>
            </nav>
          </div>
        </div>
      )}

      {/* Pre-Rendered Underlying Route Content */}
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      {/* Architectural Footer */}
      <Footer
        onReplayIntro={() => setReplayCounter((c) => c + 1)}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode((d) => !d)}
      />

      <ScrollRestoration />
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootSanctuaryShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'doctors', element: <DoctorsDirectoryPage /> },
      { path: 'doctors/:doctorSlug', element: <DoctorProfilePage /> },
      { path: 'specialties', element: <SpecialtiesPage /> },
      { path: 'specialties/:specialtySlug', element: <SpecialtyDetailPage /> },
      { path: 'book', element: <BookingWizardPage /> },
      { path: 'booking/confirmation/:referenceId', element: <BookingConfirmationPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'portal', element: <PatientPortalPage /> },
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'privacy-policy', element: <PrivacyPolicyPage /> },
      { path: 'terms-of-service', element: <TermsOfServicePage /> },
      { path: 'cancellation-refund-policy', element: <CancellationPolicyPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);

export default function App(): React.JSX.Element {
  return <RouterProvider router={router} />;
}
