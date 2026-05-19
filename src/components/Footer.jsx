import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest full-width border-t border-outline-variant/30 mt-auto py-8">
      <div className="flex flex-col md:flex-row justify-between items-center px-6 md:px-10 max-w-7xl mx-auto gap-6 md:gap-0">
        <div className="font-title-md text-title-md text-primary-container font-bold">
          RoadRescue
        </div>
        <div className="font-body-sm text-body-sm text-on-surface-variant/60 text-center md:text-left">
          © 2026 RoadRescue. Engineering High-Stakes Reliability.
        </div>
        <ul className="flex flex-wrap justify-center gap-6">
          <li>
            <a 
              className="font-label-caps text-label-caps text-on-surface-variant/60 hover:text-primary transition-colors text-[11px]" 
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Privacy Policy
            </a>
          </li>
          <li>
            <a 
              className="font-label-caps text-label-caps text-on-surface-variant/60 hover:text-primary transition-colors text-[11px]" 
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Service Terms
            </a>
          </li>
          <li>
            <a 
              className="font-label-caps text-label-caps text-on-surface-variant/60 hover:text-primary transition-colors text-[11px]" 
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Carrier Network
            </a>
          </li>
          <li>
            <a 
              className="font-label-caps text-label-caps text-on-surface-variant/60 hover:text-primary transition-colors text-[11px]" 
              href="#"
              onClick={(e) => e.preventDefault()}
            >
              Support
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
