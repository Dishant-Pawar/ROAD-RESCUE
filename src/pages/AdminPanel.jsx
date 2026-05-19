import React, { useState } from 'react';

export default function AdminPanel({ setPage }) {
  const [activeTickets, setActiveTickets] = useState([
    { id: 101, type: 'Engine Failure', time: '2m ago', loc: 'I-95 Northbound, Mile 42', req: 'Heavy Tow', assigned: false },
    { id: 102, type: 'Flat Tire', time: '12m ago', loc: 'Downtown, 4th & Main', req: 'Unit-Delta', assigned: true, eta: '5m' },
    { id: 103, type: 'Lockout', time: '15m ago', loc: 'Westside Mall Parking', req: 'Standard', assigned: false }
  ]);

  const handleAssignTicket = (id) => {
    setActiveTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.id === id) {
          alert(`🚒 Incident #${id} successfully assigned to nearest active carrier drone. Dispatch ledger synchronized.`);
          return { ...ticket, assigned: true, req: 'Unit-Alpha (ETA 3m)' };
        }
        return ticket;
      })
    );
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-4xl font-headline-lg gradient-text font-bold">Logistics Command</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            System status: <span className="text-primary-container font-semibold">Nominal</span> • Active Units: 42
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => alert('Exporting command logs to encrypted PDF format...')}
            className="glass-panel px-4 py-2.5 rounded flex items-center gap-2 hover:bg-surface-variant transition-colors border border-outline-variant/30 text-on-surface font-label-caps text-label-caps text-xs"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick Stats Row (Spans 12 cols, grid of 4) */}
        <div className="col-span-1 lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Stat Card 1 */}
          <div className="glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-primary-container/10 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-caps text-label-caps text-on-surface-variant/70 text-[11px] tracking-widest">ACTIVE RESCUES</span>
              <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded">emergency</span>
            </div>
            <div className="relative z-10 flex items-end gap-3">
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">18</span>
              <span className="font-body-sm text-body-sm text-primary mb-2 flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 12%
              </span>
            </div>
          </div>

          {/* Stat Card 2 */}
          <div className="glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary-container/5 rounded-full blur-2xl -mr-10 -mt-10 group-hover:bg-secondary-container/10 transition-all"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="font-label-caps text-label-caps text-on-surface-variant/70 text-[11px] tracking-widest">CRITICAL ALERTS</span>
              <span className="material-symbols-outlined text-secondary bg-secondary-container/10 p-2 rounded">warning</span>
            </div>
            <div className="relative z-10 flex items-end gap-3">
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">3</span>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 rounded-full bg-secondary pulse-dot-emergency"></div>
                <span className="font-body-sm text-body-sm text-secondary font-semibold">ACTION REQ.</span>
              </div>
            </div>
          </div>

          {/* Stat Card 3 */}
          <div className="glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant/70 text-[11px] tracking-widest">AVG RESPONSE</span>
              <span className="material-symbols-outlined text-outline p-2 rounded">timer</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">
                14<span className="text-lg font-title-md text-on-surface-variant ml-1">min</span>
              </span>
              <span className="font-body-sm text-body-sm text-primary mb-2 flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_downward</span> 2m
              </span>
            </div>
          </div>

          {/* Stat Card 4 */}
          <div className="glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant/70 text-[11px] tracking-widest">AVAILABLE FLEET</span>
              <span className="material-symbols-outlined text-outline p-2 rounded">local_shipping</span>
            </div>
            <div className="flex items-end gap-3">
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">24</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant/60 mb-2">/ 42 units</span>
            </div>
          </div>
        </div>

        {/* Fleet Map (Spans 8 cols) */}
        <div className="lg:col-span-8 glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl overflow-hidden flex flex-col h-[500px] shadow-2xl">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
            <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-primary text-[20px]">explore</span>
              Tactical Fleet Map
            </h3>
            <div className="flex gap-2">
              <button 
                onClick={() => alert("Filters: Showing Heavy flatbeds and L3 mobile charging grids.")}
                className="p-1.5 rounded bg-surface-variant text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
              </button>
            </div>
          </div>
          
          <div className="flex-1 relative w-full h-full bg-surface-container-lowest">
            {/* Map Image */}
            <img 
              alt="Metropolitan Tactical Radar Map" 
              className="w-full h-full object-cover opacity-50 mix-blend-luminosity brightness-50" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCONQtevrHijxHUD0MGtLkVURRb7LpFgcUmAbYD5iPl6RH3g13HI1CsoLU7msfevpUAxZb8NOugO9d_qUsJUBhDiFuUVk2iXJTn_Bwlrn78ksZNuN4b6S3bA4Y1I4F-tZdKpk6kWcAf2FREaOlL_R3YbvKRXIkRG5ZDFYHg1QMQBpVI0uzW35xC2H7wsKpr1g9gF3CnukZCJATxniaZrIeuKKAtoSdS9Ytq87HiOoi2Su1Hs-1h8HIWoB57Zo5Ab7sDQuBUDcMqMmg"
            />
            
            {/* Map Overlays / Pointers */}
            <div className="absolute inset-0 p-8 pointer-events-none">
              {/* Unit 1 */}
              <div className="absolute top-1/4 left-1/3 flex flex-col items-center pointer-events-auto cursor-pointer group">
                <div className="bg-primary-container/20 border border-primary-container/40 text-primary-container px-2 py-0.5 rounded text-[9px] font-label-caps backdrop-blur-md mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Unit-Alpha</div>
                <div className="w-4 h-4 rounded-full bg-primary-container pulse-dot shadow-[0_0_10px_rgba(0,242,255,0.8)] border-2 border-surface"></div>
              </div>
              
              {/* Unit 2 (Emergency) */}
              <div className="absolute top-1/2 left-2/3 flex flex-col items-center pointer-events-auto cursor-pointer group">
                <div className="bg-secondary-container/20 border border-secondary-container/40 text-secondary px-2 py-0.5 rounded text-[9px] font-label-caps backdrop-blur-md mb-1 opacity-0 group-hover:opacity-100 transition-opacity">Incident #402</div>
                <div className="w-4 h-4 rounded-full bg-secondary pulse-dot-emergency shadow-[0_0_15px_rgba(255,138,0,0.8)] border-2 border-surface"></div>
              </div>
              
              {/* Unit 3 */}
              <div className="absolute bottom-1/3 left-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group">
                <div className="w-3.5 h-3.5 rounded-full bg-outline border-2 border-surface shadow-md"></div>
              </div>
            </div>
            
            {/* Radar Sweep Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-20" style={{ background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 242, 255, 0.1) 60deg, transparent 60deg)', animation: 'spin-kf 10s linear infinite' }}></div>
          </div>
        </div>

        {/* Active Requests Sidebar (Spans 4 cols) */}
        <div className="lg:col-span-4 glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl flex flex-col h-[500px] shadow-2xl">
          <div className="p-4 border-b border-outline-variant/20 flex justify-between items-center bg-surface-container-low/50">
            <h3 className="font-title-md text-title-md text-on-surface flex items-center gap-2 font-bold">
              <span className="material-symbols-outlined text-outline text-[20px]">list_alt</span>
              Active Tickets
            </h3>
            <span className="bg-surface-variant text-on-surface px-2.5 py-0.5 rounded font-label-caps text-label-caps text-[10px]">
              {activeTickets.filter((t) => !t.assigned).length} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {activeTickets.map((ticket) => {
              if (ticket.assigned) {
                return (
                  <div key={ticket.id} className="glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-lg p-3 flex flex-col gap-2 hover:bg-surface-variant/20 transition-colors">
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-label-caps text-primary flex items-center gap-1 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        {ticket.type}
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant/60 text-[10px]">{ticket.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface font-semibold">{ticket.loc}</p>
                    <div className="flex justify-between items-center mt-1">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex-shrink-0">
                          <img 
                            alt="Mechanic small headshot" 
                            className="w-full h-full object-cover" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQvr_HDAe8dIuPOCeH_hCSd8oy2NmxlGvMzAXNKZDtXqxmAQgsaGSbBp5nFz1F94bhRK9iZRp1PDfy-7_3e-n4HIisgKFOcvr6pG4Cv4oPIneIbmFH9Sqz2u75z1w8iPk2Z5oty9UnXzkmiSdHTB3bl_fJa8WUNPXSIxYtC-S6m6-wYXVBvz6dJYp08B6AZbwAhF4TX5NrkjgjyvQvPkZQY-4drXs-3zXAg-CXmBGaSn1SE_x-a1PCjSgYqcK0sA0xhEeAkhUcRX4"
                          />
                        </div>
                        <span className="font-body-sm text-body-sm text-on-surface-variant/80 text-[11px] font-medium">{ticket.req}</span>
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <div key={ticket.id} className="glass-panel-active bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-lg p-3 flex flex-col gap-2 hover:bg-surface-variant/20 transition-colors">
                  <div className="flex justify-between items-center">
                    <span className="font-label-caps text-label-caps text-secondary flex items-center gap-1 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      {ticket.type}
                    </span>
                    <span className="font-label-caps text-label-caps text-on-surface-variant/60 text-[10px]">{ticket.time}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold">{ticket.loc}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-body-sm text-body-sm text-on-surface-variant/60 text-[11px]">Req: {ticket.req}</span>
                    <button 
                      onClick={() => handleAssignTicket(ticket.id)}
                      className="bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded font-label-caps text-[9px] hover:bg-secondary hover:text-on-secondary transition-all font-bold"
                    >
                      Assign
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue Trend (Spans 6 cols) */}
        <div className="lg:col-span-6 glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 flex flex-col min-h-[300px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">Revenue Trend</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/60">Last 7 Days</p>
            </div>
            <span className="text-2xl font-display-lg text-primary-container font-bold">$24.5k</span>
          </div>

          <div className="flex-grow relative w-full flex items-end justify-between pt-10 pb-4">
            {/* Chart Background Grid */}
            <div className="absolute inset-0 border-b border-l border-outline-variant/20 flex flex-col justify-between pointer-events-none pb-4">
              <div className="w-full border-t border-outline-variant/10 h-0"></div>
              <div className="w-full border-t border-outline-variant/10 h-0"></div>
              <div className="w-full border-t border-outline-variant/10 h-0"></div>
            </div>
            {/* Bars/Area (Simplified CSS visualization) */}
            <div className="w-[10%] h-[40%] bg-primary-container/20 rounded-t border-t-2 border-primary-container relative group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1.5 rounded border border-outline-variant text-[9px] font-label-caps opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold">$3.1k</div>
            </div>
            <div className="w-[10%] h-[55%] bg-primary-container/20 rounded-t border-t-2 border-primary-container relative group cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1.5 rounded border border-outline-variant text-[9px] font-label-caps opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold">$4.2k</div>
            </div>
            <div className="w-[10%] h-[35%] bg-primary-container/20 rounded-t border-t-2 border-primary-container relative group cursor-pointer"></div>
            <div className="w-[10%] h-[70%] bg-primary-container/20 rounded-t border-t-2 border-primary-container relative group cursor-pointer"></div>
            <div className="w-[10%] h-[60%] bg-primary-container/20 rounded-t border-t-2 border-primary-container relative group cursor-pointer"></div>
            <div className="w-[10%] h-[85%] bg-primary-container/40 rounded-t border-t-2 border-primary relative group shadow-[0_0_15px_rgba(0,242,255,0.2)] cursor-pointer">
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1.5 rounded border border-primary text-[9px] font-label-caps opacity-100 transition-opacity z-10 text-primary font-bold">$6.8k</div>
            </div>
            <div className="w-[10%] h-[45%] bg-primary-container/20 rounded-t border-t-2 border-primary-container relative group cursor-pointer"></div>
          </div>
          
          <div className="flex justify-between text-[10px] font-label-caps text-on-surface-variant/60 px-2 font-semibold mt-2">
            <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
          </div>
        </div>

        {/* Heatmap Incident Severity (Spans 6 cols) */}
        <div className="lg:col-span-6 glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 flex flex-col min-h-[300px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">Incident Heatmap</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/60">Incident density by zone</p>
            </div>
            <button 
              className="text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => alert("Re-allocating fleet reserves to peak demand sectors...")}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 justify-center">
            {/* Zone Rows */}
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">North Sector</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container/50 to-primary-container w-[75%] rounded-full shadow-[0_0_10px_rgba(0,242,255,0.3)]"></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-on-surface font-bold text-xs">75%</span>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">Downtown</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-secondary/50 to-secondary w-[90%] rounded-full shadow-[0_0_10px_rgba(255,138,0,0.3)]"></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-secondary font-bold text-xs">90%</span>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">East Side</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container/30 to-primary-container/60 w-[40%] rounded-full"></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-on-surface font-bold text-xs">40%</span>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">West Hills</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-container/20 to-primary-container/40 w-[25%] rounded-full"></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-on-surface font-bold text-xs">25%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Spin custom keyframe */}
      <style>{`
        @keyframes spin-kf {
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>

    </div>
  );
}
