import React, { useState } from 'react';

export default function EmergencySOS({ setPage, activeIncident, triggerSOS, cancelIncident }) {
  const [selectedIssue, setSelectedIssue] = useState('battery');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [uploadedPhoto, setUploadedPhoto] = useState(null);

  const handleSosTrigger = () => {
    triggerSOS(selectedIssue);
  };

  const handlePhotoUpload = () => {
    setUploadedPhoto('vehicle_breakdown_damaged.jpg');
    alert('📸 Breakdown image successfully uploaded to dispatcher queue for quick inspection.');
  };

  // If there is an active incident, render the high-fidelity active beacon HUD
  if (activeIncident) {
    const isPending = activeIncident.status === 'Pending';
    return (
      <div className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden bg-[#131313]">
        {/* Background Map Element with Fallback */}
        <div 
          className="absolute inset-0 z-0 opacity-25 mix-blend-screen bg-gradient-to-br from-[#1a1a1a] to-[#252525]"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXT03GSL9A3GJqxnhwUNoH0xxiB1lwXzIitQT96kN76DUMpoZHNLvwFvfUg50Z9iHdbjHt1HUOJ3zVIDs09HnXST2wzZnP8RWRopQZMEdACwkW3jRjwJ94uDAvTQstXb3oRccIgzyzW5wVVdyjdKzhMjSTqkR3Yl4MQqipISVPl1onB1K25_VNZsFYI-hYexvpCgQoFYs4yXLU3oyLC67Y3GCRltZRCX_4SBFQA4yVShQhN3FphmLP-fOEEAqqNnfNM9kszeUpR6c')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-background/60"></div>
        </div>

        <div className="map-pulse z-10"></div>

        <main className="relative z-20 flex-grow container mx-auto px-6 md:px-10 py-10 flex flex-col items-center justify-center max-w-4xl">
          
          <div className="w-full glass-panel rounded-2xl p-8 flex flex-col gap-6 text-center shadow-2xl relative overflow-hidden border-primary/20">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse"></div>
            
            {/* Beacon Status Badge */}
            <div className="mx-auto inline-flex items-center gap-2 bg-primary/10 border border-primary/30 px-5 py-2 rounded-full w-fit">
              <span className="w-2.5 h-2.5 rounded-full bg-primary pulse-animation shadow-[0_0_10px_#00f2ff]"></span>
              <span className="font-label-caps text-label-caps text-primary text-xs tracking-widest font-bold">
                BEACON ACTIVE • TICKET {activeIncident.id}
              </span>
            </div>

            {isPending ? (
              <div className="flex flex-col gap-6 my-6 items-center">
                <div className="relative w-28 h-28 flex items-center justify-center">
                  <div className="absolute inset-0 border-4 border-dashed border-primary rounded-full animate-spin duration-1000 opacity-60"></div>
                  <span className="material-symbols-outlined text-[48px] text-primary animate-pulse">satellite_alt</span>
                </div>
                <div>
                  <h1 className="text-3xl font-headline-lg text-on-surface font-bold">Transmitting SOS Coordinates</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto mt-2">
                    Locked on Sector 4 downtown frequency. Waiting for a command dispatcher to assign your roadside technician.
                  </p>
                </div>

                {/* Tester helper card */}
                <div 
                  onClick={() => setPage('admin')}
                  className="bg-primary/5 hover:bg-primary/10 border border-primary/20 rounded-xl p-4 cursor-pointer max-w-md w-full transition-all group mt-2"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">explore</span>
                    <div>
                      <h4 className="font-title-md text-sm text-primary font-bold">Simulator Command Center</h4>
                      <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                        Open Admin Logistics Panel to immediately assign driver David R. to this ticket.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6 my-6 items-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border border-primary animate-bounce shadow-[0_0_20px_rgba(0,242,255,0.4)]">
                  <span className="material-symbols-outlined text-[42px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                </div>
                <div>
                  <h1 className="text-3xl font-headline-lg text-primary font-bold">Dispatch Confirmed!</h1>
                  <p className="font-body-lg text-body-lg text-on-surface-variant max-w-lg mx-auto mt-2">
                    Technician <strong>{activeIncident.driverName}</strong> is en route in <strong>{activeIncident.vehicle}</strong>.
                  </p>
                  <div className="flex justify-center items-center gap-2 mt-4 text-secondary">
                    <span className="material-symbols-outlined text-sm">timer</span>
                    <span className="font-label-caps text-label-caps font-bold">Estimated Arrival: {activeIncident.eta} mins</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-2">
                  <button 
                    onClick={() => setPage('tracking')}
                    className="bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps px-8 py-4 rounded font-bold hover:shadow-[0_0_25px_rgba(0,242,255,0.6)] transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">map</span>
                    OPEN LIVE TRACKING
                  </button>
                  <button 
                    onClick={() => setPage('dashboard')}
                    className="glass-panel text-on-surface hover:bg-surface-variant px-8 py-4 rounded font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[18px]">dashboard</span>
                    GO TO DASHBOARD
                  </button>
                </div>
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={() => cancelIncident(activeIncident.id)}
              className="text-on-surface-variant/60 hover:text-error transition-colors font-label-caps text-label-caps text-xs py-2 w-fit mx-auto mt-4"
            >
              Cancel Emergency Request
            </button>

          </div>

        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden bg-[#131313]">
      {/* Background Map Element (Simulated) */}
      <div 
        className="absolute inset-0 z-0 opacity-25 mix-blend-screen bg-gradient-to-br from-[#1a1a1a] to-[#252525]"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAXT03GSL9A3GJqxnhwUNoH0xxiB1lwXzIitQT96kN76DUMpoZHNLvwFvfUg50Z9iHdbjHt1HUOJ3zVIDs09HnXST2wzZnP8RWRopQZMEdACwkW3jRjwJ94uDAvTQstXb3oRccIgzyzW5wVVdyjdKzhMjSTqkR3Yl4MQqipISVPl1onB1K25_VNZsFYI-hYexvpCgQoFYs4yXLU3oyLC67Y3GCRltZRCX_4SBFQA4yVShQhN3FphmLP-fOEEAqqNnfNM9kszeUpR6c')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-background/60"></div>
      </div>

      {/* map pulse point in middle */}
      <div className="map-pulse z-10"></div>

      {/* Main Content Grid */}
      <main className="relative z-20 flex-grow container mx-auto px-6 md:px-10 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Column: Primary Emergency Controls */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Urgent Action Banner */}
          <div className="glass-overlay rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-title-md text-title-md text-primary-container flex items-center gap-2 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-error animate-pulse"></span>
                Emergency Request Active
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80 mt-1">Locating precise GPS coordinates...</p>
            </div>
            
            <button 
              onClick={() => setIsVoiceActive(!isVoiceActive)}
              className={`flex items-center gap-2 border px-4 py-2 rounded-full font-label-caps text-label-caps transition-all ${
                isVoiceActive 
                  ? 'bg-primary-container/20 text-primary border-primary-container shadow-[0_0_15px_rgba(0,242,255,0.2)]'
                  : 'border-outline-variant/50 bg-surface-container/50 text-on-surface-variant hover:bg-surface-variant/50'
              }`}
            >
              <span className={`material-symbols-outlined text-[18px] ${isVoiceActive ? 'animate-bounce' : ''}`} style={isVoiceActive ? { fontVariationSettings: "'FILL' 1" } : {}}>mic</span>
              <span>{isVoiceActive ? 'Voice Active' : 'Voice Assist'}</span>
            </button>
          </div>

          {/* Main SOS Button Area */}
          <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center glass-panel rounded-xl p-8 relative overflow-hidden">
            {/* Radial gradient background behind button */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,138,0,0.05)_0%,transparent_60%)] pointer-events-none"></div>
            
            <button 
              onClick={handleSosTrigger}
              className="sos-pulse relative w-48 h-48 md:w-52 md:h-52 rounded-full bg-gradient-to-br from-[#ff512f] to-[#dd2476] shadow-[0_0_50px_rgba(255,138,0,0.4)] hover:shadow-[0_0_80px_rgba(255,138,0,0.6)] transition-shadow duration-300 flex flex-col items-center justify-center group z-10"
            >
              <span className="material-symbols-outlined text-[64px] text-white mb-2 group-hover:scale-110 transition-transform duration-300" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              <span className="font-display-lg text-display-lg text-white font-bold tracking-wider">SOS</span>
            </button>
            
            <p className="mt-8 font-body-sm text-body-sm text-on-surface-variant/80 text-center max-w-sm">
              Press to immediately dispatch the nearest available rescue unit to your location.
            </p>
          </div>

          {/* Bottom Row: Vehicle Issue & Upload */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Issue Selector */}
            <div className="glass-panel rounded-xl p-5 flex flex-col justify-between">
              <h3 className="font-label-caps text-label-caps text-on-surface-variant/80 mb-3 text-[11px] tracking-widest">
                SELECT PRIMARY ISSUE
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button 
                  onClick={() => setSelectedIssue('accident')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors group ${
                    selectedIssue === 'accident'
                      ? 'glass-panel-active border-error/50 bg-error/5'
                      : 'border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[28px] ${selectedIssue === 'accident' ? 'text-error animate-pulse' : 'text-on-surface-variant/80'}`}>minor_crash</span>
                  <span className="font-label-caps text-[9px] mt-2 text-on-surface-variant uppercase font-medium">Accident</span>
                </button>
                <button 
                  onClick={() => setSelectedIssue('battery')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors group ${
                    selectedIssue === 'battery'
                      ? 'glass-panel-active border-primary/50 bg-primary/5'
                      : 'border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[28px] ${selectedIssue === 'battery' ? 'text-primary' : 'text-on-surface-variant/80'}`} style={{ fontVariationSettings: "'FILL' 1" }}>ev_station</span>
                  <span className="font-label-caps text-[9px] mt-2 text-on-surface-variant uppercase font-medium">Battery</span>
                </button>
                <button 
                  onClick={() => setSelectedIssue('tire')}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-colors group ${
                    selectedIssue === 'tire'
                      ? 'glass-panel-active border-primary/50 bg-primary/5'
                      : 'border-outline-variant/30 hover:border-primary/50 hover:bg-primary/5'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[28px] ${selectedIssue === 'tire' ? 'text-primary' : 'text-on-surface-variant/80'}`}>tire_repair</span>
                  <span className="font-label-caps text-[9px] mt-2 text-on-surface-variant uppercase font-medium">Flat Tire</span>
                </button>
              </div>
            </div>

            {/* Image Upload */}
            <div 
              onClick={handlePhotoUpload}
              className="glass-panel rounded-xl p-5 flex flex-col justify-center items-center border-dashed border-2 border-outline-variant/40 hover:border-primary/50 transition-colors cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/80 group-hover:text-primary transition-colors mb-2">add_a_photo</span>
              <span className="font-label-caps text-label-caps text-[11px] text-on-surface-variant group-hover:text-primary transition-colors">
                {uploadedPhoto ? '✓ Image Attached' : 'Upload Image'}
              </span>
              <span className="font-body-sm text-[10px] text-on-surface-variant/60 mt-1">Faster assessment</span>
            </div>
          </div>
        </div>

        {/* Right Column: Info & Status Panel */}
        <div className="lg:col-span-4 glass-panel rounded-xl p-6 flex flex-col gap-6">
          
          {/* ETA Status Card */}
          <div className="bg-surface-container-high/50 rounded-lg p-5 border border-outline-variant/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-surface-variant"></div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-label-caps text-label-caps text-on-surface-variant/70 block mb-1 text-[10px]">
                  ESTIMATED ARRIVAL
                </span>
                <span className="text-3xl font-headline-lg text-on-surface-variant/40 font-bold">-- <span className="text-lg">mins</span></span>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant/40 bg-surface-variant/10 p-2 rounded-full">timer</span>
            </div>

            {/* Progress Stepper */}
            <div className="mt-4">
              <div className="flex justify-between items-center relative">
                <div className="absolute left-0 top-1/2 w-full h-[2px] bg-surface-variant -z-10 -translate-y-1/2"></div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-surface-variant border-2 border-outline-variant/50"></div>
                  <span className="font-label-caps text-[9px] text-on-surface-variant/60 uppercase font-medium">Request</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-surface-variant border-2 border-outline-variant/50"></div>
                  <span className="font-label-caps text-[9px] text-on-surface-variant/60 uppercase font-medium">Dispatch</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-surface-variant border-2 border-outline-variant/50"></div>
                  <span className="font-label-caps text-[9px] text-on-surface-variant/60 uppercase font-medium">Arrival</span>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div>
            <h3 className="font-label-caps text-label-caps text-on-surface-variant/80 mb-3 flex items-center gap-2 text-[11px] tracking-widest">
              <span className="material-symbols-outlined text-[16px]">contact_phone</span> EMERGENCY CONTACTS
            </h3>
            <div className="flex flex-col gap-2">
              <div 
                onClick={() => alert('Dialing Emergency Services...')}
                className="flex justify-between items-center p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-variant/40 transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-error/20 flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface">Emergency Services</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">call</span>
              </div>
              <div 
                onClick={() => alert('Dialing RoadRescue Fleet Control...')}
                className="flex justify-between items-center p-3 rounded-lg bg-surface-container-low/50 hover:bg-surface-variant/40 transition-colors cursor-pointer border border-transparent hover:border-outline-variant/30"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">engineering</span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface">Roadside Assistance</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">call</span>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="mt-auto">
            <h3 className="font-label-caps text-label-caps text-on-surface-variant/80 mb-3 flex items-center gap-2 text-[11px] tracking-widest">
              <span className="material-symbols-outlined text-[16px]">health_and_safety</span> SAFETY PROTOCOL
            </h3>
            <ul className="font-body-sm text-body-sm text-on-surface-variant/80 space-y-3">
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                <span>Stay inside your vehicle if you are on a busy highway.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                <span>Turn on your hazard lights to increase visibility.</span>
              </li>
              <li className="flex gap-2 items-start">
                <span className="material-symbols-outlined text-primary text-[16px] mt-0.5">check_circle</span>
                <span>Keep your seatbelt fastened until help arrives.</span>
              </li>
            </ul>
          </div>

        </div>

      </main>
    </div>
  );
}
