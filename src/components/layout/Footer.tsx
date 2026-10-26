import * as React from 'react';
import { Link } from 'react-router';
import { Moon, RotateCcw, ShieldCheck, Sun } from 'lucide-react';
import { OrbaiSanctumEmblem } from '@/src/features/intro/components/OrbaiSanctumEmblem';

export interface FooterProps {
  onReplayIntro: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Footer({
  onReplayIntro,
  isDarkMode,
  onToggleDarkMode,
}: FooterProps): React.JSX.Element {
  return (
    <footer className="border-t border-border-hairline bg-subtle/65 text-fg-secondary">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-12">
          {/* Column 1: Brand Identity & Operational Transparency */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <OrbaiSanctumEmblem size="md" className="text-brand-primary" />
              <span className="font-display text-2xl font-semibold text-fg-primary">
                NovaCraft Orbai
              </span>
            </div>
            <p className="text-sm leading-relaxed text-fg-secondary max-w-sm">
              A private multi-specialty medical sanctuary engineered around calm architectural
              spaces, unhurried specialist consultations, and transparent Indian Rupee (₹)
              consultation pricing.
            </p>
            <div className="pt-1 text-xs text-fg-muted space-y-1 font-mono">
              <p>Outpatient Hours: Mon–Sat · 08:00 AM – 08:00 PM IST</p>
              <p>Timezone Standard: Asia/Kolkata (UTC+05:30)</p>
              <p>Emergency Triage: Dial 108 / 112 for critical emergencies</p>
            </div>
          </div>

          {/* Column 2: Medical Specialties */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-sans text-xs font-semibold tracking-wider uppercase text-fg-primary">
              Medical Specialties
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/specialties/general-medicine" className="hover:text-fg-primary transition-colors">
                  General &amp; Internal Medicine
                </Link>
              </li>
              <li>
                <Link to="/specialties/cardiology" className="hover:text-fg-primary transition-colors">
                  Preventive Cardiology
                </Link>
              </li>
              <li>
                <Link to="/specialties/orthopedics" className="hover:text-fg-primary transition-colors">
                  Orthopedics &amp; Spine Care
                </Link>
              </li>
              <li>
                <Link to="/specialties/pediatrics" className="hover:text-fg-primary transition-colors">
                  Pediatrics &amp; Adolescent Care
                </Link>
              </li>
              <li>
                <Link to="/specialties/neurology" className="hover:text-fg-primary transition-colors">
                  Clinical Neurology
                </Link>
              </li>
              <li>
                <Link to="/specialties/dermatology" className="hover:text-fg-primary transition-colors">
                  Dermatology &amp; Dermoscopy
                </Link>
              </li>
              <li>
                <Link to="/specialties/gynecology" className="hover:text-fg-primary transition-colors">
                  Women&apos;s Healthcare &amp; Gynecology
                </Link>
              </li>
              <li>
                <Link to="/specialties" className="font-medium text-brand-primary hover:underline">
                  View All 11 Departments →
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Patient Resources & Navigation */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="font-sans text-xs font-semibold tracking-wider uppercase text-fg-primary">
              Patient Resources
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/book" className="hover:text-fg-primary transition-colors">
                  Book an Appointment (7-Step Wizard)
                </Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-fg-primary transition-colors">
                  Specialist Doctor Directory
                </Link>
              </li>
              <li>
                <Link to="/portal" className="hover:text-fg-primary transition-colors">
                  Patient Portal (Manage / Reschedule)
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-fg-primary transition-colors">
                  FAQ &amp; INR Consultation Fee Schedule
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-fg-primary transition-colors">
                  About the Flagship Sanctuary
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-fg-primary transition-colors">
                  Contact &amp; Campus Directions
                </Link>
              </li>
              <li>
                <Link to="/admin" className="inline-flex items-center gap-1.5 font-mono text-xs text-brand-primary hover:underline">
                  <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Staff Admin Dashboard (/admin)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Governance, Policies & Experience Controls */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="font-sans text-xs font-semibold tracking-wider uppercase text-fg-primary">
              Governance &amp; Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/privacy-policy" className="hover:text-fg-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms-of-service" className="hover:text-fg-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/cancellation-refund-policy" className="hover:text-fg-primary transition-colors">
                  Cancellation &amp; Refund Policy
                </Link>
              </li>
            </ul>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={onReplayIntro}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-strong bg-elevated px-3 py-2 text-xs font-medium text-fg-primary transition-colors hover:border-brand-primary"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Replay Opening Intro</span>
              </button>

              <button
                type="button"
                onClick={onToggleDarkMode}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-hairline bg-elevated px-3 py-2 text-xs font-medium text-fg-secondary transition-colors hover:text-fg-primary"
              >
                {isDarkMode ? (
                  <>
                    <Sun className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Light Ivory Theme</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Night Ward Theme</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Legal & Sample Data Disclosure Bar */}
        <div className="mt-12 border-t border-border-hairline pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-fg-muted">
          <p>
            © {new Date().getFullYear()} NovaCraft Orbai Medical Sanctuary. All rights reserved.
          </p>
          <p className="max-w-xl sm:text-right">
            Clinical Transparency Notice: Doctor profiles and ₹ consultation fees displayed in this
            environment are clearly labeled prototype records configurable via the Staff Admin
            Dashboard.
          </p>
        </div>
      </div>
    </footer>
  );
}
