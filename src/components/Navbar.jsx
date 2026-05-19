import React from 'react';

export default function Navbar({ currentPage, setPage }) {
  const links = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'admin', label: 'Admin' }
  ];

  return (
    <nav className="docked full-width top-0 sticky z-50 border-b border-outline-variant/20 shadow-[0_8px_32px_0_rgba(0,219,231,0.1)] bg-surface/60 backdrop-blur-2xl">
      <div className="flex justify-between items-center w-full px-gutter py-4 max-w-7xl mx-auto">
        <div 
          className="font-headline-lg-mobile md:font-headline-lg text-primary tracking-tight font-bold dark:text-primary-fixed cursor-pointer"
          onClick={() => setPage('home')}
        >
          RoadRescue
        </div>
        <ul className="hidden lg:flex gap-8">
          {links.map((link) => (
            <li key={link.id}>
              <button
                onClick={() => setPage(link.id)}
                className={`font-label-caps text-label-caps transition-all duration-300 pb-1 ${
                  currentPage === link.id
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'text-on-surface-variant font-medium hover:text-primary'
                }`}
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-4">
          <button className="text-on-surface hover:text-primary transition-colors duration-300 flex items-center">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button 
            className="text-on-surface hover:text-primary transition-colors duration-300 flex items-center"
            onClick={() => setPage('dashboard')}
          >
            <span className="material-symbols-outlined">account_circle</span>
          </button>
          <button 
            onClick={() => setPage('emergency')}
            className="px-4 py-2 bg-gradient-to-r from-secondary-container to-secondary-fixed text-on-secondary-container font-label-caps text-label-caps rounded font-bold hover:shadow-[0_0_15px_rgba(255,138,0,0.5)] transition-all pulse-animation"
          >
            SOS
          </button>
        </div>
      </div>
    </nav>
  );
}
