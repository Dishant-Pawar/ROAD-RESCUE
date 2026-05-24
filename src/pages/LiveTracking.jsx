import React, { useState, useEffect } from 'react';
import L from 'leaflet';

export default function LiveTracking({ setPage, activeIncident, addChatMessage, switchAccount }) {
  const [inputValue, setInputValue] = useState('');
  const [etaSeconds, setEtaSeconds] = useState(720); // 12 minutes default

  const mapContainerRef = React.useRef(null);
  const mapRef = React.useRef(null);
  const driverMarkerRef = React.useRef(null);

  const incidentLat = activeIncident?.location?.lat || 28.6304;
  const incidentLng = activeIncident?.location?.lng || 77.2177;

  // Load physical driver starting coordinates from DB, fallback to central dispatch node if not set
  const startLat = activeIncident?.driverLocation?.lat || 28.6304;
  const startLng = activeIncident?.driverLocation?.lng || 77.2177;

  // Initialize interactive Leaflet Map
  React.useEffect(() => {
    if (!mapContainerRef.current || !activeIncident) return;
    
    // Cleanup existing map if any
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [(incidentLat + startLat) / 2, (incidentLng + startLng) / 2],
      zoom: 13,
      zoomControl: true,
      attributionControl: false
    });

    // Premium CartoDB Dark Matter tile layer (completely free, zero-key open source dark mode map)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 20,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }).addTo(map);

    mapRef.current = map;

    // Glowing orange/red pulsing breakdown beacon icon
    const breakdownIcon = L.divIcon({
      className: 'custom-leaflet-icon',
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 rounded-full bg-secondary/35 border border-secondary/50 animate-ping"></div>
          <div class="w-4 h-4 rounded-full bg-secondary border-2 border-white shadow-[0_0_15px_rgba(255,138,0,0.9)]"></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });

    // Glowing cyan utility tow truck icon
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
      iconAnchor: [16, 16]
    });

    // Breakdown marker
    L.marker([incidentLat, incidentLng], { icon: breakdownIcon })
      .bindPopup(`<div class="text-white font-semibold text-xs py-1">Your breakdown location beacon is broadcasting.</div>`)
      .addTo(map);

    // Glowing cyan dashed en-route polyline path
    L.polyline([[startLat, startLng], [incidentLat, incidentLng]], {
      color: '#00f2ff',
      weight: 4,
      opacity: 0.7,
      dashArray: '10, 10',
      lineCap: 'round'
    }).addTo(map);

    // Driver Marker
    const driverMarker = L.marker([startLat, startLng], { icon: vehicleIcon })
      .bindPopup(`<div class="text-white font-semibold text-xs py-1">Unit #402 (${activeIncident.driverName || 'David R.'}) is en route.</div>`)
      .addTo(map);

    driverMarkerRef.current = driverMarker;

    map.fitBounds([[startLat, startLng], [incidentLat, incidentLng]], { padding: [80, 80] });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [activeIncident?.id]);

  // Interpolate and smoothly move the Driver Tow Truck Marker on countdown ticks
  React.useEffect(() => {
    if (!driverMarkerRef.current || !activeIncident) return;
    
    const totalDuration = (activeIncident.eta || 12) * 60;
    const ratio = Math.max(0, Math.min(1, 1 - (etaSeconds / totalDuration)));
    
    const currentLat = startLat + (incidentLat - startLat) * ratio;
    const currentLng = startLng + (incidentLng - startLng) * ratio;
    
    driverMarkerRef.current.setLatLng([currentLat, currentLng]);
  }, [etaSeconds, activeIncident]);

  // Sync and countdown ETA
  useEffect(() => {
    if (activeIncident && activeIncident.eta) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEtaSeconds(activeIncident.eta * 60);
    }
  }, [activeIncident]);

  useEffect(() => {
    const timer = setInterval(() => {
      setEtaSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatEta = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    addChatMessage('user', inputValue.trim());
    setInputValue('');
  };

  // State 1: No Active Request
  if (!activeIncident) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center bg-[#131313] p-6 text-center">
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 242, 255, 0.1) 60deg, transparent 60deg)", animation: "spin-kf 20s linear infinite" }}></div>
        
        <div className="glass-panel max-w-lg w-full p-8 rounded-2xl flex flex-col gap-6 shadow-2xl relative overflow-hidden border-outline-variant/20">
          <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mx-auto text-on-surface-variant">
            <span className="material-symbols-outlined text-[36px]">map</span>
          </div>
          <div>
            <h2 className="text-2xl font-headline-lg font-bold text-on-surface">No Active Dispatch Beacons</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-sm mx-auto">
              Your vehicles are currently safe and secure. If you are experiencing a roadside breakdown or accident, trigger our high-stakes SOS protocol.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center">
            <button 
              onClick={() => setPage('emergency')}
              className="bg-gradient-to-r from-secondary-container to-secondary text-on-secondary-container font-label-caps px-6 py-3 rounded font-bold hover:shadow-[0_0_15px_rgba(255,138,0,0.4)] transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">warning</span>
              LAUNCH SOS BEACON
            </button>
            <button 
              onClick={() => setPage('dashboard')}
              className="glass-panel hover:bg-surface-variant text-on-surface font-label-caps px-6 py-3 rounded font-bold transition-all"
            >
              FLEET COCKPIT
            </button>
          </div>
        </div>
      </div>
    );
  }

  // State 2: Request Pending Awaiting Dispatcher Assignment
  if (activeIncident.status === 'Pending') {
    return (
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-center items-center bg-[#131313] p-6 text-center">
        <div className="absolute inset-0 z-0 opacity-15 pointer-events-none" style={{ backgroundImage: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 242, 255, 0.1) 60deg, transparent 60deg)", animation: "spin-kf 15s linear infinite" }}></div>
        
        <div className="glass-panel max-w-xl w-full p-8 rounded-2xl flex flex-col gap-6 shadow-2xl relative overflow-hidden border-secondary/20">
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 border-2 border-dashed border-secondary rounded-full animate-spin"></div>
            <span className="material-symbols-outlined text-[36px] text-secondary animate-pulse">satellite_alt</span>
          </div>
          <div>
            <h2 className="text-2xl font-headline-lg font-bold text-on-surface">Connecting to Command Beacon...</h2>
            <p className="font-label-caps text-[10px] text-secondary tracking-widest uppercase font-bold mt-1">Ticket {activeIncident.id} • Awaiting Dispatcher</p>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-2 max-w-md mx-auto">
              Your location beacon is transmitting. To speed up simulation, switch to the logistics portal to assign driver David R. to your ticket.
            </p>
          </div>

          <div 
            onClick={async () => {
              if (switchAccount) {
                await switchAccount('admin');
              } else {
                setPage('admin');
              }
            }}
            className="bg-secondary/5 hover:bg-secondary/10 border border-secondary/20 rounded-xl p-4 cursor-pointer text-left transition-all group max-w-md mx-auto w-full"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary group-hover:scale-110 transition-transform">explore</span>
              <div>
                <h4 className="font-title-md text-sm text-secondary font-bold">Simulator: Assign Ticket Now</h4>
                <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                  Open Logistics Command and click "Assign" to dispatch heavy towing Unit #402.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setPage('emergency')}
            className="text-on-surface-variant/60 hover:text-error transition-colors font-label-caps text-label-caps text-xs py-1 mt-2"
          >
            View Active Beacon Controls
          </button>
        </div>
      </div>
    );
  }

  // State 3: Assigned and En Route
  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      
      {/* Map Area */}
      {/* Real Interactive Leaflet Dark Map */}
      <div className="absolute inset-0 z-0 bg-[#121212] overflow-hidden w-full h-full" ref={mapContainerRef} style={{ outline: 'none' }}>
        {/* Overlay to darken map slightly for premium contrast */}
        <div className="absolute inset-0 bg-background/30 pointer-events-none z-20"></div>
      </div>

      {/* Main Grid Wrapper */}
      <main className="relative z-10 flex-grow w-full max-w-7xl mx-auto px-6 md:px-10 py-6 flex flex-col md:flex-row justify-between items-stretch gap-6 pointer-events-none">
        
        {/* Left Module: Tracking Info (Enable pointer events) */}
        <div className="w-full md:w-96 flex flex-col gap-6 mt-auto md:mt-0 justify-end md:justify-start pointer-events-auto">
          {/* ETA Card */}
          <div className="glass-overlay rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-title-md text-title-md text-on-surface font-bold">Arriving in</h2>
                <div className="text-4xl md:text-5xl font-headline-lg text-primary-container font-bold tracking-tight mt-1">
                  {formatEta(etaSeconds)}
                </div>
              </div>
              <div className="bg-primary-container/10 px-3 py-1 rounded-full border border-primary-container/30 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary pulse-animation"></span>
                <span className="font-label-caps text-label-caps text-primary text-[10px]">EN ROUTE</span>
              </div>
            </div>
            <div className="w-full bg-surface-variant h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-primary-container h-full shadow-[0_0_10px_rgba(0,242,251,0.8)] transition-all duration-1000"
                style={{ width: `${Math.min((etaSeconds / 720) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          {/* Mechanic Profile Card */}
          <div className="glass-panel rounded-xl p-6 flex items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-outline-variant relative flex-shrink-0 bg-surface-container">
              <img 
                alt="Mechanic Portrait" 
                className="w-full h-full object-cover" 
                src={activeIncident.driverAvatar}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">{activeIncident.driverName}</h3>
              <div className="flex items-center gap-1 text-secondary-container mt-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant/80">4.9 (120+ rescues)</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant/60 mt-1 truncate">{activeIncident.vehicle}</p>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="glass-panel rounded-xl p-6 flex flex-col gap-4 shadow-2xl">
            <h4 className="font-label-caps text-label-caps text-outline text-[11px] tracking-widest">RESCUE TIMELINE</h4>
            <div className="flex flex-col gap-4 relative">
              {/* Vertical Line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-[2px] bg-surface-variant z-0"></div>
              {/* Step 1 */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center mt-1">
                  <span className="material-symbols-outlined text-[10px] text-on-primary font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold">Incident Dispatched</p>
                  <p className="font-label-caps text-[10px] text-on-surface-variant/80 mt-1">{activeIncident.time}</p>
                </div>
              </div>
              {/* Step 2 (Active) */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-primary-container bg-surface flex items-center justify-center mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container pulse-animation"></div>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">{activeIncident.driverName} En Route</p>
                  <p className="font-label-caps text-[10px] text-primary-container mt-1">Est. {activeIncident.eta} Mins</p>
                </div>
              </div>
              {/* Step 3 */}
              <div className="flex items-start gap-4 relative z-10 opacity-50">
                <div className="w-4 h-4 rounded-full border-2 border-outline-variant bg-surface mt-1"></div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold">Rescue Complete</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Chat (Desktop - Enable pointer events) */}
        <div className="hidden lg:flex flex-col w-80 glass-panel rounded-xl shadow-2xl z-20 pointer-events-auto h-[480px]">
          {/* Chat Header */}
          <div className="p-4 border-b border-outline-variant/30 flex justify-between items-center bg-surface-container-low/50 rounded-t-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary-container pulse-animation"></span>
              <span className="font-label-caps text-label-caps text-on-surface font-semibold tracking-wider text-[11px] uppercase">{activeIncident.driverName}</span>
            </div>
            <button 
              className="text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => alert("Secure dispatch channel encrypted on custom carrier frequency.")}
            >
              <span className="material-symbols-outlined text-sm">more_horiz</span>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-grow p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
            {activeIncident.chatHistory.map((msg) => {
              const isUser = msg.sender === 'user';
              const isSystem = msg.sender === 'system';
              
              if (isSystem) {
                return (
                  <div key={msg.id} className="text-center my-1 bg-surface-variant/30 py-2 px-3 border border-outline-variant/10 rounded-lg">
                    <p className="font-body-sm text-[10px] text-on-surface-variant leading-relaxed">{msg.text}</p>
                  </div>
                );
              }

              return (
                <div key={msg.id} className={`flex flex-col gap-1 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div 
                    className={`px-3 py-2 rounded-lg font-body-sm text-body-sm max-w-[85%] ${
                      isUser 
                        ? 'bg-primary-container/20 border border-primary-container/30 text-primary rounded-tr-none' 
                        : 'bg-surface-variant text-on-surface rounded-tl-none border border-outline-variant/30'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="font-label-caps text-[9px] text-on-surface-variant/60">{msg.time}</span>
                </div>
              );
            })}
          </div>
          
          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-outline-variant/30 bg-surface/50 rounded-b-xl">
            <div className="relative">
              <input 
                className="w-full bg-background border border-outline-variant rounded-full py-2 pl-4 pr-10 text-on-surface font-body-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all" 
                placeholder={`Message ${activeIncident.driverName}...`}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary-container transition-colors p-1">
                <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </form>
        </div>

        {/* Floating FAB Call Button (Desktop - Enable pointer events) */}
        <button 
          onClick={() => alert(`Dialing ${activeIncident.driverName} at ${activeIncident.driverPhone}...`)}
          className="hidden lg:flex absolute bottom-8 right-96 bg-surface-container-high border border-primary/20 text-primary w-14 h-14 rounded-full items-center justify-center shadow-lg hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] hover:text-primary-container transition-all z-20 group pointer-events-auto"
        >
          <span className="material-symbols-outlined group-hover:scale-110 transition-transform">call</span>
        </button>

      </main>

      {/* Style block for dash animations */}
      <style>{`
        @keyframes dash-kf {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>

    </div>
  );
}

