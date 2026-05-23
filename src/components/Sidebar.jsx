

export default function Sidebar({ currentPage, setPage, currentUser, switchAccount, handleLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', fill: true },
    ...(currentUser && currentUser.role === 'admin' ? [{ id: 'admin', label: 'Admin Command', icon: 'explore', fill: false }] : []),
    { id: 'home', label: 'Consumer Web', icon: 'home', fill: false },
    { id: 'services', label: 'All Services', icon: 'build', fill: false },
  ];

  return (
    <nav className="hidden md:flex flex-col h-screen w-72 left-0 top-0 fixed bg-surface-container-low/40 backdrop-blur-3xl border-r border-outline-variant/10 shadow-2xl py-8 z-40">
      {/* Brand Header */}
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container">
          {currentUser?.avatar || currentUser?.profilePhoto ? (
            <img 
              alt="Logistics Commander Avatar" 
              className="w-full h-full object-cover" 
              src={currentUser.avatar || currentUser.profilePhoto}
            />
          ) : (
            <span className="material-symbols-outlined text-on-surface-variant">person</span>
          )}
        </div>
        <div className="text-left">
          <h2 className="font-title-md text-title-md text-on-surface font-bold leading-tight">Command Center</h2>
          <p className="font-label-caps text-label-caps text-on-surface-variant text-[10px] uppercase tracking-wider font-semibold">Precision Logistics</p>
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
        
        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-variant flex items-center justify-center overflow-hidden border border-outline-variant">
              {currentUser?.avatar || currentUser?.profilePhoto ? (
                <img 
                  alt="Dispatcher Headshot" 
                  className="w-full h-full object-cover animate-in fade-in duration-200" 
                  src={currentUser.avatar || currentUser.profilePhoto}
                />
              ) : (
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              )}
            </div>
            <div className="flex flex-col text-left">
              <span className="font-body-sm text-body-sm text-on-surface font-semibold truncate max-w-[110px] block leading-none mb-1">
                {currentUser?.name || 'Guest User'}
              </span>
              <span className="font-label-caps text-on-surface-variant text-[9px] uppercase tracking-wider font-bold block leading-none">
                {currentUser?.role === 'admin' ? 'Chief Operator' : 'Client Profile'}
              </span>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0">
            {/* Quick Account Switcher inside Sidebar */}
            <button
              onClick={() => switchAccount(currentUser?.role === 'admin' ? 'user' : 'admin')}
              title={`Switch to ${currentUser?.role === 'admin' ? 'Consumer' : 'Admin'} clearance`}
              className="w-8 h-8 rounded-lg bg-surface-container hover:bg-surface-variant flex items-center justify-center border border-outline-variant/30 hover:border-primary/50 text-on-surface-variant hover:text-primary transition-all duration-300 shadow-md group focus:outline-none"
            >
              <span className="material-symbols-outlined text-[16px] group-hover:rotate-180 transition-transform duration-500">
                cached
              </span>
            </button>

            {/* Logout button inside Sidebar */}
            <button
              onClick={handleLogout}
              title="Logout secure terminal"
              className="w-8 h-8 rounded-lg bg-error/10 hover:bg-error/20 border border-error/20 text-error flex items-center justify-center transition-all duration-300 shadow-md focus:outline-none"
            >
              <span className="material-symbols-outlined text-[16px]">
                logout
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
