import React, { useState } from 'react';

export default function Dashboard({ setPage }) {
  const [activeTab, setActiveTab] = useState('month');

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-headline-lg text-on-surface font-bold">Client Cockpit</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            System operational. 3 active units in your rescue sector.
          </p>
        </div>
        <button 
          onClick={() => setPage('emergency')}
          className="py-2.5 px-6 rounded-full border border-primary text-primary font-label-caps text-label-caps hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">emergency</span>
          SOS Protocol
        </button>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-min">
        
        {/* Active Service Widget (Spans 8 cols) */}
        <div className="glass-panel glass-panel-active rounded-xl p-6 lg:col-span-8 flex flex-col relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
            <div className="h-full progress-bar-fill w-2/3"></div>
          </div>
          
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-primary-container pulse-dot"></div>
                <span className="font-label-caps text-label-caps text-primary text-glow text-[11px]">EN ROUTE</span>
              </div>
              <h3 className="text-xl font-title-md text-on-surface font-bold">Tow Unit #442</h3>
            </div>
            <div className="text-right">
              <div className="text-2xl font-headline-lg text-on-surface font-bold">
                12 <span className="text-on-surface-variant font-body-sm text-sm">MIN</span>
              </div>
              <div className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">ETA</div>
            </div>
          </div>

          <div className="flex-grow flex items-center justify-center relative min-h-[150px] mb-6 rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container">
            <img 
              alt="Live Micro Tracking Map" 
              className="absolute inset-0 w-full h-full object-cover opacity-40" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYcR7Ibvp2FJExXuMvebxJRr0lODvQDA0-m3Uvtrf6k-y-0BUQYZudI5lSvpyKXYcKv8VucWML0AhyN0LxnLF2BA940oc5afMnDI3FpWiFbIx-5P2L6HPwPcRdpC5j6SihehAR3n7Wn471gVCnfUsh8lkHYtopoSY_vT257UQMaCbwa_bxB9sgj2eT1dcYqBNJRUBwGXe1qnqvCBAO9N0B52YgPw411pGonwq33mJardpg5ohPHgeitG0BNruxZStQb8g_Ytrr_NE"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-secondary rounded-full shadow-[0_0_15px_#ff8a00]"></div>
            <div className="absolute top-1/2 right-1/4 w-4 h-4 bg-primary-container rounded-full pulse-dot">
              <div className="absolute -inset-1 bg-primary-container/20 rounded-full animate-ping"></div>
            </div>
            
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              <path d="M 180 75 Q 300 45 420 75" fill="none" stroke="url(#blue-grad)" strokeDasharray="4 4" strokeWidth="2"></path>
              <defs>
                <linearGradient id="blue-grad" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#ff8a00"></stop>
                  <stop offset="100%" stopColor="#00f2ff"></stop>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div className="flex justify-between items-center mt-auto pt-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-on-surface-variant">person</span>
              </div>
              <div>
                <div className="font-body-sm text-body-sm text-on-surface font-semibold">Driver: Marcus T.</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-1 text-[10px]">
                  <span className="material-symbols-outlined text-[12px] text-secondary">star</span> 4.9
                </div>
              </div>
            </div>
            <button 
              onClick={() => setPage('tracking')}
              className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors border border-outline-variant/30 shadow-md"
            >
              <span className="material-symbols-outlined text-on-surface text-[18px]">call</span>
            </button>
          </div>
        </div>

        {/* System Alerts Panel (Spans 4 cols) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-4 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-title-md text-on-surface font-bold">System Alerts</h3>
            <span className="material-symbols-outlined text-on-surface-variant/80">notifications</span>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {/* Relying strictly on negative spacing and tonal depth shifts */}
            <div className="flex gap-3 items-start pb-4 bg-surface-container-low/30 p-3 rounded-lg">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-secondary shrink-0"></div>
              <div>
                <div className="font-body-sm text-body-sm text-on-surface font-semibold">Weather Advisory</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant/80 mt-1 text-[10px] leading-relaxed">
                  Heavy rain expected in Sector 4. Response times may vary.
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-start pb-4 bg-surface-container-low/30 p-3 rounded-lg">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-primary-container shrink-0"></div>
              <div>
                <div className="font-body-sm text-body-sm text-on-surface font-semibold">Payment Processed</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant/80 mt-1 text-[10px] leading-relaxed">
                  Invoice #8829 cleared successfully.
                </div>
              </div>
            </div>
            <div className="flex gap-3 items-start bg-surface-container-low/30 p-3 rounded-lg">
              <div className="mt-1 w-2.5 h-2.5 rounded-full bg-surface-variant shrink-0"></div>
              <div>
                <div className="font-body-sm text-body-sm text-on-surface-variant font-semibold">Scheduled Maintenance</div>
                <div className="font-label-caps text-label-caps text-on-surface-variant/50 mt-1 text-[10px] leading-relaxed">
                  Vehicle 'Alpha' due for diagnostic update next week.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics Chart Widget (Spans 6 cols) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-6 min-h-[300px] flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-title-md text-on-surface font-bold">Usage Analytics</h3>
            <select 
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value)}
              className="bg-surface-container border-outline-variant/30 text-on-surface-variant font-label-caps text-label-caps rounded focus:ring-primary focus:border-primary text-xs py-1 px-3"
            >
              <option value="month">This Month</option>
              <option value="last">Last Month</option>
            </select>
          </div>
          
          <div className="flex-grow flex items-end justify-between gap-4 pt-4 relative">
            {/* Horizontal grid lines */}
            <div className="absolute inset-x-0 bottom-0 top-4 flex flex-col justify-between z-0 pointer-events-none">
              <div className="border-b border-outline-variant/10 w-full h-0"></div>
              <div className="border-b border-outline-variant/10 w-full h-0"></div>
              <div className="border-b border-outline-variant/10 w-full h-0"></div>
              <div className="border-b border-outline-variant/10 w-full h-0"></div>
            </div>
            
            {/* Bars */}
            <div className="w-1/6 bg-surface-variant/60 rounded-t h-[30%] relative z-10 hover:bg-surface-bright transition-all group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-label-caps text-glow">
                4 Rescues
              </div>
            </div>
            <div className="w-1/6 bg-surface-variant/60 rounded-t h-[50%] relative z-10 hover:bg-surface-bright transition-all group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-label-caps text-glow">
                8 Rescues
              </div>
            </div>
            <div className="w-1/6 bg-gradient-to-t from-primary-container/20 to-primary-container rounded-t h-[80%] relative z-10 shadow-[0_0_15px_rgba(0,242,255,0.2)] group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-primary-container text-on-primary px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-bold font-label-caps shadow-md">
                12 Rescues
              </div>
            </div>
            <div className="w-1/6 bg-surface-variant/60 rounded-t h-[40%] relative z-10 hover:bg-surface-bright transition-all group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-label-caps text-glow">
                6 Rescues
              </div>
            </div>
            <div className="w-1/6 bg-surface-variant/60 rounded-t h-[60%] relative z-10 hover:bg-surface-bright transition-all group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface-container px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-label-caps text-glow">
                9 Rescues
              </div>
            </div>
          </div>
          
          <div className="flex justify-between mt-3 font-label-caps text-[10px] text-on-surface-variant/60 uppercase font-semibold">
            <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span>
          </div>
        </div>

        {/* Saved Vehicles / Registered Fleet (Spans 6 cols) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-6 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-title-md text-on-surface font-bold">Registered Fleet</h3>
            <button 
              onClick={() => alert("Redirecting to comprehensive fleet registry...")}
              className="text-primary hover:text-primary-container transition-colors font-label-caps text-label-caps flex items-center text-xs"
            >
              View All <span className="material-symbols-outlined text-[16px] ml-1">chevron_right</span>
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-2xl">directions_car</span>
                <div className="w-2.5 h-2.5 rounded-full bg-primary-container shadow-[0_0_8px_#00f2ff] pulse-dot"></div>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface font-semibold">Tesla Model S</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant/60 mt-1 text-[10px] font-medium">EV-4492 • Active</div>
            </div>
            <div className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex justify-between items-start mb-4">
                <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-2xl">local_shipping</span>
                <div className="w-2.5 h-2.5 rounded-full bg-surface-variant"></div>
              </div>
              <div className="font-body-sm text-body-sm text-on-surface font-semibold">Ford Transit</div>
              <div className="font-label-caps text-label-caps text-on-surface-variant/60 mt-1 text-[10px] font-medium">TR-1102 • Parked</div>
            </div>
          </div>
        </div>

        {/* Booking History Table (Spans 12 cols) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-12 overflow-x-auto shadow-2xl">
          <h3 className="font-title-md text-title-md text-on-surface mb-6 font-bold">Recent Operations</h3>
          
          <table className="w-full text-left min-w-[600px]">
            <thead>
              {/* Relying strictly on negative spacing and tonal depth shifts */}
              <tr className="text-on-surface-variant/60 font-label-caps text-label-caps text-[11px] bg-surface-container-low/50 rounded-lg">
                <th className="p-3 font-semibold rounded-l-lg">ID</th>
                <th className="p-3 font-semibold">Date</th>
                <th className="p-3 font-semibold">Service</th>
                <th className="p-3 font-semibold">Vehicle</th>
                <th className="p-3 font-semibold">Status</th>
                <th className="p-3 font-semibold text-right rounded-r-lg">Cost</th>
              </tr>
            </thead>
            <tbody className="font-body-sm text-body-sm">
              <tr className="hover:bg-surface-container-low/40 transition-colors">
                <td className="p-3 text-primary font-label-caps text-label-caps text-xs">#RR-092</td>
                <td className="p-3 text-on-surface">Oct 24, 2026</td>
                <td className="p-3 text-on-surface">Flatbed Tow</td>
                <td className="p-3 text-on-surface-variant">Tesla Model S</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-caps text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    COMPLETED
                  </span>
                </td>
                <td className="p-3 text-right text-on-surface font-label-caps text-label-caps text-xs font-semibold">$145.00</td>
              </tr>
              <tr className="bg-surface-container-low/20 hover:bg-surface-container-low/40 transition-colors">
                <td className="p-3 text-primary font-label-caps text-label-caps text-xs">#RR-091</td>
                <td className="p-3 text-on-surface">Oct 12, 2026</td>
                <td className="p-3 text-on-surface">Jump Start</td>
                <td className="p-3 text-on-surface-variant">Ford Transit</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary font-label-caps text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    COMPLETED
                  </span>
                </td>
                <td className="p-3 text-right text-on-surface font-label-caps text-label-caps text-xs font-semibold">$75.00</td>
              </tr>
              <tr className="hover:bg-surface-container-low/40 transition-colors">
                <td className="p-3 text-primary font-label-caps text-label-caps text-xs">#RR-090</td>
                <td className="p-3 text-on-surface">Sep 05, 2026</td>
                <td className="p-3 text-on-surface">Winch Out</td>
                <td className="p-3 text-on-surface-variant">Jeep Wrangler</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary-container/10 border border-secondary-container/20 text-secondary font-label-caps text-[9px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    CANCELLED
                  </span>
                </td>
                <td className="p-3 text-right text-on-surface font-label-caps text-label-caps text-xs font-semibold">$0.00</td>
              </tr>
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
