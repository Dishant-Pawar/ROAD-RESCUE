import React from 'react';

export default function Sidebar({ currentPage, setPage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', fill: true },
    { id: 'admin', label: 'Admin Command', icon: 'explore', fill: false },
    { id: 'home', label: 'Consumer Web', icon: 'home', fill: false },
    { id: 'services', label: 'All Services', icon: 'build', fill: false },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-72 left-0 top-0 fixed bg-surface-container-low/40 backdrop-blur-3xl border-r border-outline-variant/10 shadow-2xl py-stack-lg z-40">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container">
          <img 
            alt="Logistics Commander Avatar" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsh4C5iHWzKRxWfShZVM8eiZPzMc3kWhiM5zSVvj0-DX00SRwdrB7Z5JaWl1boPu-27zdJYJqPhMKCamr0tHZtxdAothXlGLbuCQaQhXAwfvi0BHd-JqukyDfSm_uO2tfYrddJJKONqbw8ss5DKjBQz0XCA6wB3xFhvBD8AEYpATSUB_3LlXs1jGgMpcCWUwq9wgwp2zHMLsw1XPjHf_l8sUGP5kenHyHymqAADctVFcT1HLdutUTLiwrvxumCiMPoGifpYxVB6pU"
          />
        </div>
        <div>
          <h2 className="font-title-md text-title-md text-on-surface">Command Center</h2>
          <p className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">Precision Logistics</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex flex-col gap-2 flex-grow">
        {menuItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`flex items-center gap-4 px-6 py-4 font-label-caps text-label-caps transition-all text-left w-full ${
                isActive 
                  ? 'bg-primary-container/10 text-primary border-r-4 border-primary-container translate-x-1 font-bold'
                  : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary'
              }`}
            >
              <span 
                className="material-symbols-outlined" 
                style={item.fill ? { fontVariationSettings: "'FILL' 1" } : {}}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}
        
        {/* Mock/Disabled Links */}
        <button
          onClick={() => alert("RoadRescue History logs are encrypted on the ledger.")}
          className="text-on-surface-variant flex items-center gap-4 px-6 py-4 font-label-caps text-label-caps hover:bg-surface-variant/20 hover:text-primary transition-all text-left w-full"
        >
          <span className="material-symbols-outlined">history</span>
          <span>History</span>
        </button>
        <button
          onClick={() => alert("Settings locked. Contact Chief Dispatcher Mercer.")}
          className="text-on-surface-variant flex items-center gap-4 px-6 py-4 font-label-caps text-label-caps hover:bg-surface-variant/20 hover:text-primary transition-all text-left w-full"
        >
          <span className="material-symbols-outlined">settings</span>
          <span>Settings</span>
        </button>
      </div>

      {/* Bottom Dispatch Trigger & Avatar Card */}
      <div className="px-6 mt-auto flex flex-col gap-4">
        <button 
          onClick={() => setPage('emergency')}
          className="w-full py-3 px-4 rounded bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-label-caps flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,242,255,0.4)] transition-all duration-300"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          New Dispatch
        </button>
        <div className="flex items-center gap-3 pt-4 border-t border-outline-variant/20">
          <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant">
            <img 
              alt="Dispatcher Headshot" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCez33bgHUSrQl6WdI1kMQK3oPr-AObkdpUW4MCgBGyA-JECs3hVzrHU87CsbLgLbN2yIuNgAfAAuEKd2yXuzF-l-LgGHgzSHeFB6HddygQXgt2-u3fOFSYkva4SQvagEwhHXF-tJAPMJ2N24gwsEjhmzNH_xcHxt0YQf6IL9vR5Rw-CUHFxqm9jO3f4qcxAkwKSRVn2FpZe2wnO8IP_8COP4vvvH8TvSwlVrMMe84vhG0S3swJnY-0LuvZnu-poiwvTYuSd-YF7nE"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-body-sm text-body-sm text-on-surface">Alex Mercer</span>
            <span className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">Chief Dispatcher</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
