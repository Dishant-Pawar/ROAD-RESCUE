import React from 'react';
import L from 'leaflet';
import { getAdminStatsApi, getMechanicsApi } from '../utils/api';

export default function AdminPanel({ 
  adminIncidents, 
  assignIncident, 
  completeIncident, 
  cancelIncident 
}) {

  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const markersRef = React.useRef([]);

  const [mechanics, setMechanics] = React.useState([]);
  const [selectedTicketId, setSelectedTicketId] = React.useState(null);
  const [isDispatcherOpen, setIsDispatcherOpen] = React.useState(false);

  const [stats, setStats] = React.useState({
    activeRescues: 0,
    criticalAlerts: 0,
    avgResponse: 12,
    availableFleet: 24,
    totalFleet: 42,
    revenueDays: [120, 240, 180, 310, 220, 480, 350],
    zones: {
      'North Sector': 0,
      'Downtown': 0,
      'East Side': 0,
      'West Hills': 0
    }
  });

  React.useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getAdminStatsApi();
        if (res && res.success && res.data) {
          setStats(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch admin stats:", err);
      }
    };
    fetchStats();
  }, [adminIncidents]);

  React.useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const res = await getMechanicsApi();
        if (res && res.success && res.data) {
          setMechanics(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch active mechanics:", err);
      }
    };
    
    if (isDispatcherOpen) {
      fetchMechanics();
    }
  }, [isDispatcherOpen]);

  // Bind React's assignIncident callback to window for Leaflet raw HTML popup callbacks
  React.useEffect(() => {
    window.assignIncident = (id) => {
      setSelectedTicketId(id);
      setIsDispatcherOpen(true);
    };
    return () => {
      delete window.assignIncident;
    };
  }, []);

  React.useEffect(() => {
    if (!mapContainerRef.current) return;
    
    // Initialize map if not already initialized
    if (!mapRef.current) {
      const initialMap = L.map(mapContainerRef.current, {
        center: [28.6304, 77.2177],
        zoom: 12,
        zoomControl: true,
        attributionControl: false
      });
      
      // Premium CartoDB Dark Matter tile layer (completely free, zero-key open source dark mode map)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      }).addTo(initialMap);
      
      mapRef.current = initialMap;
    }
    
    const map = mapRef.current;
    
    // Clear old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
    
    // Custom icon for pending / active incidents (glowing orange ping)
    const incidentIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-secondary/35 border border-secondary/50 animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-secondary border-2 border-white shadow-[0_0_15px_rgba(255,138,0,0.9)]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    // Custom icon for assigned mechanics/vehicles (glowing cyan tow truck)
    const vehicleIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-primary/35 border border-primary/50 animate-ping"></div>
          <div class="w-5 h-5 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(0,242,255,0.9)]">
            <span class="material-symbols-outlined text-[12px] text-white font-bold" style="font-size: 11px;">local_shipping</span>
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const bounds = [];
    
    adminIncidents.forEach((ticket) => {
      const lat = ticket.location?.lat || 28.6304;
      const lng = ticket.location?.lng || 77.2177;
      bounds.push([lat, lng]);
      
      // Determine which icon to use
      const isAssigned = ticket.status === 'Assigned';
      
      // Setup detailed popup text with premium styled cards
      const statusLabel = isAssigned 
        ? `<span class="bg-primary/20 text-primary border border-primary/30 px-2 py-0.5 rounded text-[10px] font-bold">DISPATCHED</span>`
        : `<span class="bg-secondary/20 text-secondary border border-secondary/30 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">PENDING</span>`;
        
      const popupHtml = `
        <div class="flex flex-col gap-2 min-w-[200px] text-white">
          <div class="flex justify-between items-center border-b border-white/10 pb-1.5">
            <span class="font-bold text-sm text-white">${ticket.ticketId || ticket.id}</span>
            ${statusLabel}
          </div>
          <div class="text-[11px] text-white/70">
            <p class="font-bold text-white/95 text-xs mt-0.5">${ticket.type}</p>
            <p class="mt-1 flex items-center gap-1"><span class="material-symbols-outlined text-[12px]" style="font-size:12px;">location_on</span> ${ticket.loc}</p>
            ${isAssigned ? `
              <div class="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-2">
                <img src="${ticket.driverAvatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQvr_HDAe8dIuPOCeH_hCSd8oy2NmxlGvMzAXNKZDtXqxmAQgsaGSbBp5nFz1F94bhRK9iZRp1PDfy-7_3e-n4HIisgKFOcvr6pG4Cv4oPIneIbmFH9Sqz2u75z1w8iPk2Z5oty9UnXzkmiSdHTB3bl_fJa8WUNPXSIxYtC-S6m6-wYXVBvz6dJYp08B6AZbwAhF4TX5NrkjgjyvQvPkZQY-4drXs-3zXAg-CXmBGaSn1SE_x-a1PCjSgYqcK0sA0xhEeAkhUcRX4'}" class="w-6 h-6 rounded-full object-cover border border-white/10" />
                <div>
                  <p class="font-bold text-white/95">${ticket.driverName}</p>
                  <p class="text-[10px] text-white/50">${ticket.vehicle} (ETA ${ticket.eta}m)</p>
                </div>
              </div>
            ` : `
              <div class="mt-2">
                <button 
                  onclick="window.assignIncident('${ticket.ticketId || ticket.id}')"
                  class="w-full bg-secondary hover:bg-secondary-container text-white py-1 rounded text-center font-bold text-[10px] transition-all cursor-pointer border border-secondary-container/20"
                >
                  ASSIGN DRIVER
                </button>
              </div>
            `}
          </div>
        </div>
      `;
      
      if (isAssigned) {
        // Render BOTH the breakdown location ( pulsing orange ) and the utility vehicle ( glowing cyan )
        const driverLat = ticket.driverLocation?.lat || 28.6304;
        const driverLng = ticket.driverLocation?.lng || 77.2177;
        
        bounds.push([driverLat, driverLng]);
        
        const breakdownMarker = L.marker([lat, lng], { icon: incidentIcon })
          .bindPopup(popupHtml)
          .addTo(map);
        markersRef.current.push(breakdownMarker);
        
        const towTruckMarker = L.marker([driverLat, driverLng], { icon: vehicleIcon })
          .bindPopup(`
            <div class="flex flex-col gap-1 text-white font-sans py-1 min-w-[160px]">
              <div class="flex items-center gap-1.5 border-b border-white/10 pb-1.5 mb-1.5">
                <span class="material-symbols-outlined text-primary text-[16px]" style="font-size: 15px;">local_shipping</span>
                <span class="font-bold text-xs text-white">${ticket.vehicle || 'Heavy Tow • Unit #402'}</span>
              </div>
              <div class="text-[11px] text-white/80 space-y-1">
                <p class="font-bold text-white/95 text-xs flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]" style="font-size: 13px;">person</span>
                  ${ticket.driverName || 'David R.'}
                </p>
                <p class="flex items-center gap-1.5 text-primary-container font-semibold">
                  <span class="material-symbols-outlined text-[14px]" style="font-size: 13px;">call</span>
                  ${ticket.driverPhone || '+1 (555) 019-2834'}
                </p>
                <p class="text-[9px] text-white/40 mt-1 uppercase font-medium">Assigned: Ticket #${ticket.ticketId || ticket.id}</p>
              </div>
            </div>
          `)
          .addTo(map);
        markersRef.current.push(towTruckMarker);
        
        const routeLine = L.polyline([[driverLat, driverLng], [lat, lng]], {
          color: '#00f2ff',
          weight: 3,
          opacity: 0.6,
          dashArray: '8, 8',
          lineCap: 'round'
        }).addTo(map);
        markersRef.current.push(routeLine);
      } else {
        // Only render the breakdown incident icon
        const breakdownMarker = L.marker([lat, lng], { icon: incidentIcon })
          .bindPopup(popupHtml)
          .addTo(map);
        markersRef.current.push(breakdownMarker);
      }
    });
    
    // Fit map to markers bounds if there are any
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [adminIncidents]);

  const activeRescues = stats.activeRescues;
  const criticalAlerts = stats.criticalAlerts;

  const totalZoneRequests = Object.values(stats.zones || {}).reduce((a, b) => a + b, 0) || 1;
  const getZonePct = (zoneName, defaultVal) => {
    const val = stats.zones?.[zoneName];
    if (val === undefined || Object.values(stats.zones || {}).reduce((a, b) => a + b, 0) === 0) {
      return defaultVal;
    }
    return Math.round((val / totalZoneRequests) * 100);
  };

  const maxRevenue = Math.max(...(stats.revenueDays || []), 1);
  const totalRevenueSum = (stats.revenueDays || []).reduce((a, b) => a + b, 0);
  const totalRevenueFormatted = totalRevenueSum >= 1000 
    ? `${(totalRevenueSum / 1000).toFixed(1)}k` 
    : `${totalRevenueSum}`;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
        <div>
          <h1 className="text-4xl font-headline-lg gradient-text font-bold">Logistics Command</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            System status: <span className="text-primary-container font-semibold">Nominal</span> • Active Fleet: {stats.totalFleet || 42}
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
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">{activeRescues}</span>
              <span className="font-body-sm text-body-sm text-primary mb-2 flex items-center">
                <span className="material-symbols-outlined text-[14px]">arrow_upward</span> 100%
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
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">{criticalAlerts}</span>
              {criticalAlerts > 0 ? (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-secondary pulse-dot-emergency"></div>
                  <span className="font-body-sm text-body-sm text-secondary font-semibold">ACTION REQ.</span>
                </div>
              ) : (
                <span className="font-body-sm text-body-sm text-on-surface-variant/60 mb-2">STANDBY</span>
              )}
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
                {stats.avgResponse}<span className="text-lg font-title-md text-on-surface-variant ml-1">min</span>
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
              <span className="text-4xl md:text-5xl font-display-lg text-on-surface font-bold">{stats.availableFleet}</span>
              <span className="font-body-sm text-body-sm text-on-surface-variant/60 mb-2">/ {stats.totalFleet} units</span>
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
          
          <div className="flex-1 relative w-full h-full bg-[#121212] overflow-hidden min-h-[400px]">
            {/* Real Interactive Leaflet Dark Map */}
            <div className="w-full h-full absolute inset-0 z-10" ref={mapContainerRef} style={{ outline: 'none' }}></div>
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
              {criticalAlerts} Pending
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {adminIncidents.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="material-symbols-outlined text-on-surface-variant/40 text-[36px] mb-2">check_circle</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant/80">Queue empty. All incidents cleared.</p>
              </div>
            ) : (
              adminIncidents.map((ticket) => {
                if (ticket.assigned) {
                  return (
                    <div key={ticket.id} className="glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-lg p-3 flex flex-col gap-2 hover:bg-surface-variant/20 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className="font-label-caps text-label-caps text-primary flex items-center gap-1 text-[10px] font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                          {ticket.type}
                        </span>
                        <span className="font-label-caps text-label-caps text-on-surface-variant/60 text-[10px]">{ticket.time}</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface font-semibold">{ticket.loc}</p>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-surface-variant overflow-hidden border border-outline-variant flex-shrink-0">
                            <img 
                              alt="Mechanic headshot" 
                              className="w-full h-full object-cover" 
                              src={ticket.driverAvatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDQvr_HDAe8dIuPOCeH_hCSd8oy2NmxlGvMzAXNKZDtXqxmAQgsaGSbBp5nFz1F94bhRK9iZRp1PDfy-7_3e-n4HIisgKFOcvr6pG4Cv4oPIneIbmFH9Sqz2u75z1w8iPk2Z5oty9UnXzkmiSdHTB3bl_fJa8WUNPXSIxYtC-S6m6-wYXVBvz6dJYp08B6AZbwAhF4TX5NrkjgjyvQvPkZQY-4drXs-3zXAg-CXmBGaSn1SE_x-a1PCjSgYqcK0sA0xhEeAkhUcRX4"}
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </div>
                          <span className="font-body-sm text-body-sm text-on-surface-variant/80 text-[11px] font-medium truncate max-w-[120px]">
                            {ticket.driverName} (ETA {ticket.eta}m)
                          </span>
                        </div>
                        
                        <div className="flex gap-1.5">
                          <button 
                            onClick={() => cancelIncident(ticket.id)}
                            className="bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded font-label-caps text-[9px] hover:bg-error hover:text-on-error transition-all font-bold"
                          >
                            Abort
                          </button>
                          <button 
                            onClick={() => completeIncident(ticket.id)}
                            className="bg-primary/20 text-primary border border-primary/30 px-2.5 py-1 rounded font-label-caps text-[9px] hover:bg-primary hover:text-on-primary transition-all font-bold"
                          >
                            Resolve
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={ticket.id} className="glass-panel-active bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-lg p-3 flex flex-col gap-2 hover:bg-surface-variant/20 transition-colors animate-pulse">
                    <div className="flex justify-between items-center">
                      <span className="font-label-caps text-label-caps text-secondary flex items-center gap-1 text-[10px] font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
                        {ticket.type}
                      </span>
                      <span className="font-label-caps text-label-caps text-on-surface-variant/60 text-[10px]">{ticket.time}</span>
                    </div>
                    <p className="font-body-sm text-body-sm text-on-surface font-semibold">{ticket.loc}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-body-sm text-body-sm text-on-surface-variant/60 text-[11px] truncate max-w-[120px]">Req: {ticket.req}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => cancelIncident(ticket.id)}
                          className="bg-error/10 text-error border border-error/20 px-2 py-0.5 rounded font-label-caps text-[9px] hover:bg-error hover:text-on-error transition-all font-bold"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => {
                            setSelectedTicketId(ticket.id);
                            setIsDispatcherOpen(true);
                          }}
                          className="bg-secondary/20 text-secondary border border-secondary/30 px-3 py-1 rounded font-label-caps text-[9px] hover:bg-secondary hover:text-on-secondary transition-all font-bold animate-bounce"
                        >
                          Assign
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Revenue Trend (Spans 6 cols) */}
        <div className="lg:col-span-6 glass-panel bg-surface-container-low/40 backdrop-blur-3xl border-outline-variant/10 rounded-xl p-6 flex flex-col min-h-[300px] shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-title-md text-title-md text-on-surface font-bold">Revenue Trend</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/60">Last 7 Days</p>
            </div>
            <span className="text-2xl font-display-lg text-primary-container font-bold">${totalRevenueFormatted}</span>
          </div>

          <div className="flex-grow relative w-full flex items-end justify-between pt-10 pb-4">
            {/* Chart Background Grid */}
            <div className="absolute inset-0 border-b border-l border-outline-variant/20 flex flex-col justify-between pointer-events-none pb-4">
              <div className="w-full border-t border-outline-variant/10 h-0"></div>
              <div className="w-full border-t border-outline-variant/10 h-0"></div>
              <div className="w-full border-t border-outline-variant/10 h-0"></div>
            </div>
            {/* Dynamic Bars */}
            {(stats.revenueDays || []).map((amount, idx) => {
              const heightPct = Math.max(10, Math.round((amount / maxRevenue) * 85));
              const isToday = idx === 6;
              return (
                <div 
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className={`w-[10%] rounded-t border-t-2 relative group cursor-pointer transition-all duration-500 ${
                    isToday 
                      ? 'bg-primary-container/40 border-primary shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:bg-primary-container/50' 
                      : 'bg-primary-container/20 border-primary-container hover:bg-primary-container/30'
                  }`}
                >
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 bg-surface p-1.5 rounded border text-[9px] font-label-caps opacity-0 group-hover:opacity-100 transition-opacity z-10 font-bold ${
                    isToday ? 'border-primary text-primary' : 'border-outline-variant text-on-surface'
                  }`}>
                    ${amount.toFixed(0)}
                  </div>
                </div>
              );
            })}
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
          
          <div className="flex-grow flex flex-col gap-4 justify-center">
            {/* Zone Rows */}
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">North Sector</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div 
                  style={{ width: `${getZonePct('North Sector', 75)}%` }} 
                  className="h-full bg-gradient-to-r from-primary-container/50 to-primary-container rounded-full shadow-[0_0_10px_rgba(0,242,255,0.3)] transition-all duration-500"
                ></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-on-surface font-bold text-xs">{getZonePct('North Sector', 75)}%</span>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">Downtown</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div 
                  style={{ width: `${getZonePct('Downtown', 90)}%` }} 
                  className="h-full bg-gradient-to-r from-secondary/50 to-secondary rounded-full shadow-[0_0_10px_rgba(255,138,0,0.3)] transition-all duration-500"
                ></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-secondary font-bold text-xs">{getZonePct('Downtown', 90)}%</span>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">East Side</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div 
                  style={{ width: `${getZonePct('East Side', 40)}%` }} 
                  className="h-full bg-gradient-to-r from-primary-container/30 to-primary-container/60 rounded-full transition-all duration-500"
                ></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-on-surface font-bold text-xs">{getZonePct('East Side', 40)}%</span>
            </div>
            
            <div className="flex items-center gap-4 bg-surface-container-low/30 p-2.5 rounded-lg">
              <span className="w-20 font-label-caps text-[10px] text-on-surface-variant/80 text-right uppercase font-semibold">West Hills</span>
              <div className="flex-1 h-3 bg-surface-container rounded-full overflow-hidden">
                <div 
                  style={{ width: `${getZonePct('West Hills', 25)}%` }} 
                  className="h-full bg-gradient-to-r from-primary-container/20 to-primary-container/40 rounded-full transition-all duration-500"
                ></div>
              </div>
              <span className="w-8 font-label-caps text-label-caps text-on-surface font-bold text-xs">{getZonePct('West Hills', 25)}%</span>
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

      {/* Tactical Dispatcher Modal */}
      {isDispatcherOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <div className="glass-panel max-w-lg w-full rounded-2xl p-6 relative overflow-hidden border-primary/20 shadow-2xl flex flex-col gap-5 bg-[#161616]">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary via-primary to-secondary"></div>
            
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-headline-lg gradient-text font-bold tracking-wide flex items-center gap-2 text-white">
                  <span className="material-symbols-outlined text-secondary animate-pulse">radar</span>
                  Tactical Dispatch Center
                </h2>
                <p className="font-body-sm text-[11px] text-on-surface-variant/80 uppercase tracking-wider mt-0.5">
                  Select available roadside unit for Ticket #{selectedTicketId}
                </p>
              </div>
              <button 
                onClick={() => setIsDispatcherOpen(false)}
                className="text-on-surface-variant/60 hover:text-on-surface transition-colors p-1"
              >
                <span className="material-symbols-outlined text-white">close</span>
              </button>
            </div>

            {/* Mechanics List */}
            <div className="flex flex-col gap-3 max-h-[350px] overflow-y-auto pr-1">
              {mechanics.length === 0 ? (
                <div className="py-8 text-center text-on-surface-variant/60 font-body-sm">
                  Scanning local tracking frequencies... No active fleet units found.
                </div>
              ) : (
                mechanics.map((mech) => {
                  const isDavid = mech.name.includes('David');
                  const etaText = isDavid ? '12 mins' : '5 mins';
                  const isBusy = mech.isBusy;
                  return (
                    <div 
                      key={mech._id} 
                      className={`glass-panel bg-surface-container-low/20 hover:bg-surface-variant/20 p-4 rounded-xl border border-outline-variant/15 flex items-center justify-between gap-4 transition-all duration-300 group ${isBusy ? 'opacity-80' : ''}`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="relative">
                          <img 
                            src={mech.avatar || "https://lh3.googleusercontent.com/aida-public/AB6AXuDQvr_HDAe8dIuPOCeH_hCSd8oy2NmxlGvMzAXNKZDtXqxmAQgsaGSbBp5nFz1F94bhRK9iZRp1PDfy-7_3e-n4HIisgKFOcvr6pG4Cv4oPIneIbmFH9Sqz2u75z1w8iPk2Z5oty9UnXzkmiSdHTB3bl_fJa8WUNPXSIxYtC-S6m6-wYXVBvz6dJYp08B6AZbwAhF4TX5NrkjgjyvQvPkZQY-4drXs-3zXAg-CXmBGaSn1SE_x-a1PCjSgYqcK0sA0xhEeAkhUcRX4"} 
                            alt={mech.name}
                            className="w-12 h-12 rounded-full object-cover border border-primary/20 group-hover:border-primary/50 transition-colors"
                          />
                          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#131313] ${isBusy ? 'bg-red-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`}></span>
                        </div>
                        <div>
                          <h4 className="font-bold text-on-surface text-sm flex items-center gap-1.5 text-white">
                            {mech.name}
                            <span className="text-[9px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                              ★ {mech.rating || '5.0'}
                            </span>
                            {isBusy ? (
                              <span className="text-[8px] bg-red-500/10 border border-red-500/30 text-red-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider animate-pulse">
                                ON DUTY
                              </span>
                            ) : (
                              <span className="text-[8px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">
                                AVAILABLE
                              </span>
                            )}
                          </h4>
                          <p className="font-body-sm text-[10px] text-on-surface-variant/80 font-medium">{mech.specialty}</p>
                          <p className="font-body-sm text-[10px] text-on-surface-variant/50 mt-0.5">
                            {mech.vehicle?.name || 'Heavy Tow • Unit #402'} • {mech.vehicle?.plate || 'RD-RESC-9'}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className="text-[10px] font-label-caps text-secondary font-bold tracking-wide">
                          ETA {etaText}
                        </span>
                        <button
                          disabled={isBusy}
                          onClick={() => {
                            assignIncident(selectedTicketId, mech._id);
                            setIsDispatcherOpen(false);
                          }}
                          className={`px-3.5 py-1.5 rounded-lg font-label-caps text-[10px] font-bold transition-all ${
                            isBusy
                              ? 'bg-neutral-800 text-neutral-500 border border-neutral-700 cursor-not-allowed opacity-50'
                              : 'bg-secondary/20 text-secondary hover:bg-secondary border border-secondary/30 hover:text-white hover:shadow-[0_0_15px_rgba(255,138,0,0.4)] cursor-pointer'
                          }`}
                        >
                          {isBusy ? 'ON DUTY' : 'DISPATCH UNIT'}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            
            {/* Footer */}
            <div className="border-t border-outline-variant/15 pt-3.5 flex justify-end">
              <button 
                onClick={() => setIsDispatcherOpen(false)}
                className="glass-panel text-on-surface hover:bg-surface-variant px-4 py-2 rounded-lg font-label-caps text-[10px] font-bold transition-all text-xs text-white border border-outline-variant/30 cursor-pointer"
              >
                Close Console
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
