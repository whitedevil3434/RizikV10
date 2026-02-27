import type { Metadata } from 'next';
import { Inter, Hind_Siliguri } from 'next/font/google';
import './globals.css';

// Primary English Font
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

// Secondary Bengali Font (Rizik Standard)
const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
});

export const metadata: Metadata = {
  title: 'Rizik Global | Engineering the Future of Eco-Tech & Food Safety',
  description: 'The Holding Company for Rizik Eco-Mats, Bio-Shield Active Packaging, and the Rizik Super-App ecosystem.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${hindSiliguri.variable} font-sans antialiased bg-[var(--color-brand-background)] text-[var(--color-brand-primary)]`}>
        {/* Navigation Bar - Corporate Level */}
        <nav className="fixed w-full z-50 border-b border-[#031E49]/10 bg-[#F5F2EB]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              {/* Brand Logo */}
              <div className="flex-shrink-0 flex items-center gap-3">
                <img src="/rizik-logo.svg" alt="Rizik Logo" className="h-10 w-auto" />
              </div>

              {/* Desktop Nav */}
              <div className="hidden md:block">
                <div className="ml-10 flex items-center space-x-6">
                  <a href="/store" className="text-[#031E49]/80 hover:text-[#031E49] px-3 py-2 rounded-md text-sm font-semibold transition-colors">E-Commerce</a>
                  <a href="/bio-shield" className="text-[#031E49]/80 hover:text-[#031E49] px-3 py-2 rounded-md text-sm font-semibold transition-colors">Bio-Shield R&D</a>
                  <a href="/cart" className="text-[#031E49]/80 hover:text-[#031E49] px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                    <svg className="w-5 h-5 inline-block mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
                    Cart
                  </a>
                  <a href="/login" className="text-[#031E49]/80 hover:text-[#031E49] px-3 py-2 rounded-md text-sm font-semibold transition-colors">Login</a>
                  <a href="/portal" className="bg-[#031E49] hover:bg-[#0A2D6C] text-[#F5F2EB] px-5 py-2.5 rounded-full text-sm font-bold shadow-md transition-all">Employee Portal</a>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="pt-20 min-h-screen">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[#031E49]/10 bg-[#031E49] py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-[#F5F2EB]/50 text-sm">© 2026 Rizik Global. Protocol 100 Initiated. MD: Nusrat. Architect: Sabbir.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
