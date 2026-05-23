import { useState, useEffect } from 'react';
import { getClientStatsApi, addVehicleApi } from '../utils/api';

export default function Dashboard({ 
  setPage, 
  activeIncident, 
  completedIncidents,
  vehicles,
  fetchVehicles,
  notifications,
  fetchNotifications
}) {
  const [activeTab, setActiveTab] = useState('month');
  const [clientStats, setClientStats] = useState({
    activeUnitsCount: 3,
    usageAnalytics: [2, 4, 1, 3, 5]
  });
  
  // Register Vehicle Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    plateNumber: '',
    vehicleType: 'Sedan'
  });

  useEffect(() => {
    const fetchClientStats = async () => {
      try {
        const res = await getClientStatsApi();
        if (res && res.success && res.data) {
          setClientStats(res.data);
        }
      } catch (err) {
        console.error("Failed to load client stats:", err);
      }
    };
    fetchClientStats();
    fetchVehicles();
    fetchNotifications();
  }, [activeIncident]);

  const handleRegisterVehicle = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addVehicleApi(formData);
      if (res && res.success) {
        setIsModalOpen(false);
        setFormData({
          make: '',
          model: '',
          year: new Date().getFullYear(),
          color: '',
          plateNumber: '',
          vehicleType: 'Sedan'
        });
        await fetchVehicles();
      }
    } catch (err) {
      alert("Registration failed: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-headline-lg text-on-surface font-bold">Client Cockpit</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            System operational. {clientStats.activeUnitsCount || 3} active units in your rescue sector.
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
        
        {activeIncident ? (
          /* Active Service Widget (Spans 8 cols) - Dynamic State */
          <div className="glass-panel glass-panel-active rounded-xl p-6 lg:col-span-8 flex flex-col relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-surface-container-high">
              <div className={`h-full progress-bar-fill ${activeIncident.assigned ? 'w-2/3' : 'w-1/3 animate-pulse'}`}></div>
            </div>
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-2 h-2 rounded-full pulse-dot ${activeIncident.assigned ? 'bg-primary-container' : 'bg-secondary animate-pulse'}`}></div>
                  <span className={`font-label-caps text-label-caps text-glow text-[11px] ${activeIncident.assigned ? 'text-primary' : 'text-secondary'}`}>
                    {activeIncident.assigned ? 'EN ROUTE' : 'PENDING DISPATCH'}
                  </span>
                </div>
                <h3 className="text-xl font-title-md text-on-surface font-bold">
                  {activeIncident.assigned ? (activeIncident.vehicle || 'Emergency Unit') : 'Locating Dispatch Unit...'}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-2xl font-headline-lg text-on-surface font-bold">
                  {activeIncident.assigned ? activeIncident.eta : '--'} <span className="text-on-surface-variant font-body-sm text-sm">MIN</span>
                </div>
                <div className="font-label-caps text-label-caps text-on-surface-variant text-[10px]">ETA</div>
              </div>
            </div>

            <div className="flex-grow flex items-center justify-center relative min-h-[150px] mb-6 rounded-lg overflow-hidden border border-outline-variant/20 bg-surface-container">
              <img 
                alt="Live Micro Tracking Map" 
                className="absolute inset-0 w-full h-full object-cover opacity-40" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYcR7Ibvp2FJExXuMvebxJRr0lODvQDA0-m3Uvtrf6k-y-0BUQYZudI5lSvpyKXYcKv8VucWML0AhyN0LxnLF2BA940oc5afMnDI3FpWiFbIx-5P2L6HPwPcRdpC5j6SihehAR3n7Wn471gVCnfUsh8lkHYtopoSY_vT257UQMaCbwa_bxB9sgj2eT1dcYqBNJRUBwGXe1qnqvCBAO9N0B52YgPw411pGonwq33mJardpg5ohPHgeitG0BNruxZStQb8g_Ytrr_NE"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
              
              {activeIncident.assigned ? (
                <>
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
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[32px] text-secondary animate-bounce">satellite_alt</span>
                    <span className="font-label-caps text-label-caps text-secondary text-[10px] tracking-wider font-bold">TRANSMITTING GPS GRID...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center mt-auto pt-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center border border-outline-variant/30 overflow-hidden">
                  {activeIncident.assigned && activeIncident.driverAvatar ? (
                    <img 
                      alt="Driver Avatar" 
                      className="w-full h-full object-cover" 
                      src={activeIncident.driverAvatar}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  ) : (
                    <span className="material-symbols-outlined text-on-surface-variant">person</span>
                  )}
                </div>
                <div>
                  <div className="font-body-sm text-body-sm text-on-surface font-semibold">
                    {activeIncident.assigned ? `Driver: ${activeIncident.driverName}` : 'Assigning Specialist...'}
                  </div>
                  <div className="font-label-caps text-label-caps text-on-surface-variant flex items-center gap-1 text-[10px]">
                    <span className="material-symbols-outlined text-[12px] text-secondary">star</span> 
                    {activeIncident.assigned ? '4.9' : '--'}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setPage(activeIncident.assigned ? 'tracking' : 'emergency')}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-variant transition-colors border border-outline-variant/30 shadow-md"
              >
                <span className="material-symbols-outlined text-on-surface text-[18px]">
                  {activeIncident.assigned ? 'forum' : 'satellite_alt'}
                </span>
              </button>
            </div>
          </div>
        ) : (
          /* Active Service Widget (Spans 8 cols) - Safe/Idle State */
          <div className="glass-panel rounded-xl p-6 lg:col-span-8 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden min-h-[350px]">
            <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" style={{ backgroundImage: "conic-gradient(from 0deg at 50% 50%, transparent 0deg, rgba(0, 242, 255, 0.05) 60deg, transparent 60deg)", animation: "spin-kf 30s linear infinite" }}></div>
            
            <div className="relative z-10 flex flex-col items-center gap-4 max-w-md">
              <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-2 shadow-[0_0_15px_rgba(0,242,255,0.2)]">
                <span className="material-symbols-outlined text-[32px]">shield</span>
              </div>
              <h3 className="text-2xl font-title-md text-on-surface font-bold">All Vehicles Secure</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant/80 leading-relaxed">
                Your registered fleet is safe and operational. Active real-time satellite telemetry confirms zero mechanical anomalies or warning beacon indicators.
              </p>
              <button 
                onClick={() => setPage('emergency')}
                className="mt-2 py-3 px-8 rounded bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-label-caps uppercase font-bold tracking-wider hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">emergency</span>
                LAUNCH EMERGENCY SOS
              </button>
            </div>
          </div>
        )}

        {/* System Alerts Panel (Spans 4 cols) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-4 flex flex-col shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-title-md text-title-md text-on-surface font-bold">System Alerts</h3>
            <span className="material-symbols-outlined text-on-surface-variant/80">notifications</span>
          </div>
          <div className="flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {notifications && notifications.length > 0 ? (
              notifications.map((notif) => {
                const isSuccess = notif.type === 'success';
                const isWarning = notif.type === 'warning';
                const isError = notif.type === 'error';
                return (
                  <div key={notif._id} className="flex gap-3 items-start pb-4 bg-surface-container-low/30 p-3 rounded-lg border border-outline-variant/10 hover:border-outline-variant/35 transition-colors">
                    <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      isSuccess ? 'bg-primary' : 
                      isWarning ? 'bg-secondary' : 
                      isError ? 'bg-error' : 'bg-primary-container'
                    }`}></div>
                    <div className="flex-1">
                      <div className="font-body-sm text-body-sm text-on-surface font-semibold flex justify-between gap-2">
                        <span>{notif.title}</span>
                        <span className="text-[9px] font-label-caps text-on-surface-variant/40 font-medium">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="font-label-caps text-label-caps text-on-surface-variant/80 mt-1 text-[10px] leading-relaxed">
                        {notif.message}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-10 flex flex-col items-center justify-center text-center opacity-60 gap-2">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/60">notifications_off</span>
                <p className="font-body-sm text-body-sm">No new system alerts.</p>
              </div>
            )}
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
            
            {/* Dynamic Bars */}
            {(clientStats.usageAnalytics || []).map((count, idx) => {
              const maxUsage = Math.max(...(clientStats.usageAnalytics || []), 1);
              const heightPct = Math.max(10, Math.round((count / maxUsage) * 80));
              const isLatest = idx === 4;
              return (
                <div 
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className={`w-1/6 rounded-t relative z-10 transition-all duration-500 hover:bg-surface-bright cursor-pointer group ${
                    isLatest 
                      ? 'bg-gradient-to-t from-primary-container/20 to-primary-container shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:from-primary-container/30 hover:to-primary' 
                      : 'bg-surface-variant/60 hover:bg-surface-variant'
                  }`}
                >
                  <div className={`absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-[10px] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap font-label-caps ${
                    isLatest ? 'bg-primary-container text-on-primary font-bold shadow-md' : 'bg-surface-container text-glow'
                  }`}>
                    {count} {count === 1 ? 'Rescue' : 'Rescues'}
                  </div>
                </div>
              );
            })}
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
              onClick={() => setIsModalOpen(true)}
              className="text-primary hover:text-primary-container transition-colors font-label-caps text-label-caps flex items-center text-xs gap-1 font-bold"
            >
              <span className="material-symbols-outlined text-[16px]">add</span> REGISTER VEHICLE
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
            {vehicles && vehicles.length > 0 ? (
              vehicles.map((v) => {
                const isEV = v.vehicleType === 'EV' || v.make.toLowerCase().includes('tesla') || v.make.toLowerCase().includes('rivian');
                return (
                  <div key={v._id || v.plateNumber} className="bg-surface-container-low border border-outline-variant/20 rounded-lg p-4 hover:border-primary/50 transition-colors cursor-pointer group">
                    <div className="flex justify-between items-start mb-4">
                      <span className="material-symbols-outlined text-on-surface-variant group-hover:text-primary transition-colors text-2xl">
                        {isEV ? 'electric_car' : v.vehicleType === 'Truck' ? 'local_shipping' : 'directions_car'}
                      </span>
                      <div className={`w-2.5 h-2.5 rounded-full ${isEV ? 'bg-primary-container shadow-[0_0_8px_#00f2ff]' : 'bg-surface-variant'} ${isEV ? 'pulse-dot' : ''}`}></div>
                    </div>
                    <div className="font-body-sm text-body-sm text-on-surface font-semibold">{v.year} {v.make} {v.model}</div>
                    <div className="font-label-caps text-label-caps text-on-surface-variant/60 mt-1 text-[10px] font-medium">{v.plateNumber} • {v.color || 'Standard'}</div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 py-6 flex flex-col items-center justify-center text-center bg-surface-container-low/40 rounded-lg border border-outline-variant/20 p-4">
                <span className="material-symbols-outlined text-[28px] text-on-surface-variant/60 mb-1">directions_car</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant/80">No registered vehicles found.</p>
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="text-primary hover:text-primary-container font-label-caps text-[10px] font-bold mt-2 uppercase tracking-wider"
                >
                  Register First Vehicle &rarr;
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Booking History Table (Spans 12 cols) */}
        <div className="glass-panel rounded-xl p-6 lg:col-span-12 overflow-x-auto shadow-2xl">
          <h3 className="font-title-md text-title-md text-on-surface mb-6 font-bold">Recent Operations</h3>
          
          <table className="w-full text-left min-w-[600px]">
            <thead>
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
              {completedIncidents && completedIncidents.length > 0 ? (
                completedIncidents.map((incident, idx) => (
                  <tr 
                    key={incident.id} 
                    className={`${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''} hover:bg-surface-container-low/40 transition-colors`}
                  >
                    <td className="p-3 text-primary font-label-caps text-label-caps text-xs">{incident.id}</td>
                    <td className="p-3 text-on-surface">{incident.date}</td>
                    <td className="p-3 text-on-surface">{incident.service}</td>
                    <td className="p-3 text-on-surface-variant">{incident.vehicle}</td>
                    <td className="p-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-caps text-[9px] font-bold ${
                        incident.status === 'COMPLETED'
                          ? 'bg-primary/10 border border-primary/20 text-primary'
                          : 'bg-secondary/10 border border-secondary/20 text-secondary'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'COMPLETED' ? 'bg-primary animate-pulse' : 'bg-secondary'}`}></span>
                        {incident.status}
                      </span>
                    </td>
                    <td className="p-3 text-right text-on-surface font-label-caps text-label-caps text-xs font-semibold">{incident.cost}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-on-surface-variant/60 font-body-sm">
                    No recent operations recorded in secure dispatch ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
      
      {/* Register Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel border-t-2 border-primary w-full max-w-md p-6 rounded-xl shadow-2xl relative flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors flex items-center"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <div>
              <h3 className="text-xl font-title-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">directions_car</span>
                Register New Vehicle
              </h3>
              <p className="text-xs text-on-surface-variant/80 mt-1">Connect your vehicle telemetry with RoadRescue satellite systems.</p>
            </div>

            <form onSubmit={handleRegisterVehicle} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Make</label>
                  <input 
                    type="text" 
                    required
                    value={formData.make}
                    onChange={(e) => setFormData({...formData, make: e.target.value})}
                    placeholder="e.g. Tesla"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Model</label>
                  <input 
                    type="text" 
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    placeholder="e.g. Model Y"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Year</label>
                  <input 
                    type="number" 
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    placeholder="e.g. 2024"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Color</label>
                  <input 
                    type="text" 
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    placeholder="e.g. Obsidian Black"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Plate Number</label>
                  <input 
                    type="text" 
                    required
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({...formData, plateNumber: e.target.value})}
                    placeholder="e.g. EV-9942"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Vehicle Type</label>
                  <select 
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({...formData, vehicleType: e.target.value})}
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-2 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="SUV">SUV</option>
                    <option value="Truck">Truck</option>
                    <option value="EV">EV</option>
                    <option value="Motorcycle">Motorcycle</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-label-caps font-bold text-on-surface-variant hover:text-on-surface transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-xs font-bold rounded shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center"
                >
                  {loading ? 'Registering...' : 'Complete Registry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Spin custom keyframe for safe state loading background */}
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
