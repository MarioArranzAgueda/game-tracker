'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'Descubre' },
  { href: '/catalog', label: 'Catálogo' },
  { href: '/library', label: 'Mi Lista' },
  { href: '/favorites', label: 'Favoritos' },
  { href: '/dashboard', label: 'Dashboard' },
];

export default function NavBar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="border-b border-slate-800 p-4 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
      <div className="container mx-auto flex justify-between items-center px-4">
        <Link href="/" className="text-xl font-bold tracking-tight" onClick={() => setOpen(false)}>
          <h1 className="text-xl font-bold tracking-tight">GAME<span className="text-blue-500">TRACKER</span></h1>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex space-x-6 text-sm font-medium">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-blue-400 transition-colors pointer p-2">
              {link.label}
            </a>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-slate-400 hover:text-white transition-transform duration-300">
          <div className={`transition-transform duration-300 ${open ? 'rotate-90 scale-110' : 'rotate-0'}`}>
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="border-t border-slate-800 mt-2 pt-2 pb-1 px-4">
          {NAV_LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="block py-3 text-sm font-medium text-slate-300 hover:text-blue-400 hover:translate-x-2 transition-all duration-200 border-b border-slate-800/50 last:border-0"
              style={{ transitionDelay: open ? `${i * 50}ms` : '0ms' }}
            >
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
