import { useState, useRef, useEffect } from 'react';

export default function Navbar({ currentPage, setPage, currentUser, switchAccount, handleLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const links = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'emergency', label: 'Emergency' },
    { id: 'tracking', label: 'Tracking' },
    { id: 'dashboard', label: 'Dashboard' },
    ...(currentUser && currentUser.role === 'admin' ? [{ id: 'admin', label: 'Admin' }] : [])
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
          
          {/* User Profile Avatar and Dropdown Selector */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 hover:border-primary/50 transition-all flex items-center justify-center bg-surface-container shadow-md focus:outline-none"
            >
              {currentUser?.avatar || currentUser?.profilePhoto ? (
                <img 
                  alt="User Avatar" 
                  className="w-full h-full object-cover animate-in fade-in duration-200" 
                  src={currentUser.avatar || currentUser.profilePhoto}
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
              )}
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-12 mt-2 w-72 glass-panel-active rounded-xl p-4 shadow-2xl border border-outline-variant/30 z-50 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                {/* User Info Header */}
                <div className="flex items-center gap-3 pb-3 border-b border-outline-variant/20">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-outline-variant/40 flex items-center justify-center bg-surface-container">
                    {currentUser?.avatar || currentUser?.profilePhoto ? (
                      <img 
                        alt="Avatar Zoomed" 
                        className="w-full h-full object-cover" 
                        src={currentUser.avatar || currentUser.profilePhoto}
                      />
                    ) : (
                      <span className="material-symbols-outlined text-2xl text-on-surface-variant">person</span>
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-body-sm text-body-sm text-on-surface font-bold leading-none mb-1 block">
                      {currentUser?.name || 'Guest User'}
                    </span>
                    <span className="text-[10px] text-on-surface-variant/80 font-medium truncate max-w-[170px] leading-tight block">
                      {currentUser?.email || 'guest@roadrescue.com'}
                    </span>
                  </div>
                </div>

                {/* Clearance Status Indicator */}
                <div className="flex flex-col gap-1 bg-surface-container-low/40 border border-outline-variant/10 rounded-lg p-3 text-left">
                  <span className="font-label-caps text-[9px] text-on-surface-variant/60 tracking-wider font-bold">Clearance Level</span>
                  <div className="flex items-center gap-2 mt-1">
                    {currentUser?.role === 'admin' ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="font-label-caps text-[10px] font-bold text-primary tracking-widest">🔑 ADMIN LOGISTICS</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
                        <span className="font-label-caps text-[10px] font-bold text-secondary tracking-widest">👤 CONSUMER WEB</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Switch Clearance Action Buttons */}
                <div className="flex flex-col gap-2 pt-1 text-left">
                  <span className="font-label-caps text-[9px] text-on-surface-variant/50 tracking-wider font-bold px-1">Switch Persona</span>
                  
                  {currentUser?.role === 'admin' ? (
                    <button
                      onClick={() => {
                        switchAccount('user');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-3 rounded bg-surface-container-high/40 hover:bg-surface-variant/40 border border-outline-variant/20 hover:border-secondary/30 text-on-surface font-label-caps text-[10px] tracking-wider text-left transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-secondary group-hover:animate-bounce">person</span>
                        Consumer Profile (Alex)
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-60 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        switchAccount('admin');
                        setIsDropdownOpen(false);
                      }}
                      className="w-full py-2.5 px-3 rounded bg-surface-container-high/40 hover:bg-surface-variant/40 border border-outline-variant/20 hover:border-primary/30 text-on-surface font-label-caps text-[10px] tracking-wider text-left transition-all flex items-center justify-between group"
                    >
                      <span className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary group-hover:animate-pulse">explore</span>
                        Admin Command (Elena)
                      </span>
                      <span className="material-symbols-outlined text-[14px] text-on-surface-variant opacity-60 group-hover:translate-x-1 transition-transform">arrow_forward</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setPage('dashboard');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded bg-primary/10 hover:bg-primary-container/20 text-primary font-label-caps text-[10px] tracking-widest font-bold text-center transition-colors"
                  >
                    GO TO PORTAL COCKPIT
                  </button>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full mt-2 py-2 px-3 rounded bg-error/10 hover:bg-error/20 border border-error/20 text-error font-label-caps text-[10px] tracking-widest font-bold text-center transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">logout</span>
                    LOGOUT TERMINAL
                  </button>
                </div>
              </div>
            )}
          </div>

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
