import { useState, useEffect } from 'react';
import { getClientStatsApi } from '../utils/api';

export default function Home({ setPage, triggerSOS, currentUser }) {
  const [stats, setStats] = useState({
    activeUnitsCount: 142, // beautiful default fallback
    avgResponse: 13
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await getClientStatsApi();
        if (res && res.success && res.data) {
          setStats({
            activeUnitsCount: res.data.activeUnitsCount || 142,
            avgResponse: res.data.avgResponse || 13
          });
        }
      } catch (err) {
        console.warn("Failed to load live client stats on homepage:", err);
      }
    };
    fetchStats();
  }, [currentUser]);

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col bg-hero-pattern">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0 bg-gradient-to-tr from-[#131313] via-[#1a1a1a] to-[#222]">
        <img 
          alt="Hero Background" 
          className="w-full h-full object-cover opacity-25 mix-blend-luminosity" 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJtX6N5jghzk5ixQOLzi20Hw-tHDYBdDUQN25WdnUn4GrbIZIIbJkpYNnGacAygarrFuts2FvgAky0DE_7qNPvbJhboQSV606vbr-Ts0_EdH1O8IpP1KU2h5LzcHnlWGyI2IJGIlQVUfjc33bEnDyHVgw5_z8P9HHxzqrzTZEROrQ5AR1rpX-iqmUJdApkCo_Bah0rPHBlfPkVi1Q39cDDkMLOeKJYuTPAp1fnlWvdLKoT4QdQwBjvw64pQ-cFTlvhjFD8vX58Xnk"
          onError={(e) => { e.target.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background"></div>
      </div>

      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-10 py-16 md:py-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center flex-grow">
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 glass-panel px-4 py-2 rounded-full w-fit border-outline-variant/30">
            <span className="w-2 h-2 rounded-full bg-primary-container pulse-animation shadow-[0_0_8px_#00f2ff]"></span>
            <span className="font-label-caps text-label-caps text-primary-container text-[11px] tracking-widest">
              SYSTEMS ONLINE • READY TO DEPLOY
            </span>
          </div>
          <h1 className="font-display-lg text-4xl md:text-5xl lg:text-6xl text-on-surface font-bold leading-tight">
            Precision Recovery.<br />
            <span className="text-gradient-primary">Zero Downtime.</span>
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
            Next-generation roadside assistance engineered for high-stakes reliability. Real-time tracking, immediate dispatch, and expert technicians for your luxury vehicle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              onClick={() => triggerSOS('battery')}
              className="bg-gradient-to-r from-secondary-container to-secondary text-on-secondary-container font-label-caps text-label-caps px-8 py-4 rounded font-bold hover:shadow-[0_0_25px_rgba(255,138,0,0.6)] transition-all flex items-center justify-center gap-2 pulse-animation"
            >
              <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
              GET EMERGENCY HELP
            </button>
            <button 
              onClick={() => setPage('services')}
              className="glass-panel border-primary-fixed-dim/30 text-primary font-label-caps text-label-caps px-8 py-4 rounded font-bold hover:bg-primary-fixed-dim/10 transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">build</span>
              VIEW SERVICES
            </button>
          </div>
        </div>

        {/* Floating Stats Card */}
        <div className="lg:col-span-4 w-full">
          <div className="glass-panel-active rounded-xl p-6 flex flex-col gap-6 glow-shadow-primary transform lg:translate-y-8">
            <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
              <span className="font-label-caps text-label-caps text-on-surface-variant/80">CURRENT STATUS</span>
              <div className="flex items-center gap-2 text-primary-fixed-dim">
                <span className="material-symbols-outlined text-sm">satellite_alt</span>
                <span className="font-label-caps text-label-caps text-[11px]">LIVE</span>
              </div>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-headline-lg text-primary-container font-bold">{stats.avgResponse}m</div>
              <div className="font-title-md text-title-md text-on-surface mt-1">Avg Response Time</div>
              <p className="font-body-sm text-body-sm text-on-surface-variant/70 mt-2">in your current sector</p>
            </div>
            <div className="w-full bg-surface-container-high h-1 rounded-full overflow-hidden">
              <div className="bg-primary-container h-full w-3/4 shadow-[0_0_10px_#00f2ff]"></div>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant">
              <span className="font-label-caps text-label-caps text-[11px]">DISPATCH UNITS ACTIVE</span>
              <span className="font-title-md text-title-md text-primary-container font-bold">{stats.activeUnitsCount}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Services Bento Grid */}
      <section className="py-24 px-6 md:px-10 w-full max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-2 mb-12">
          <h2 className="text-3xl font-headline-lg text-on-surface font-bold">Mission Critical Services</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
            Rapid deployment for any scenario. Track your rescue vehicle in real-time on our tactical map.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min">
          {/* Service Card 1: Large Map Feature */}
          <div 
            onClick={() => setPage('services')}
            className="md:col-span-8 glass-panel rounded-xl p-6 group hover:border-primary/50 transition-colors relative overflow-hidden h-80 flex flex-col justify-end cursor-pointer"
          >
            <div className="absolute inset-0 bg-surface-container-high/20 opacity-50 z-0">
              <img 
                alt="Tactical Map Interface" 
                className="w-full h-full object-cover mix-blend-screen opacity-40 group-hover:scale-105 transition-transform duration-700" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPvLNxX6uZagaiZpJi9O8oPlsBVZykZ-vaiV1fzqWwSrkSAG3CsF2f2gDH4VAEgG1fB9W9c8z7FYDecTP60DULFhjYuYuvJTsYgxmYo6SlOAsMfTXx6V7cuFRnCATxk8IPcZXq7pbiZzZNg-DGNF08MSsiSkWKSsnb71URD8aNGMbmyPeh4YhleD59aOrX7awunmvS8IU_UfZ7KJRoVr-wEM29XgXVodLqE3RVdS1bglNJrtj9EUd360RytFwkS9FT2XdA_BFeS1M"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#131313] via-background/40 to-transparent"></div>
            </div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded bg-surface/80 border border-outline-variant/30 flex items-center justify-center text-primary-container mb-4 backdrop-blur-md">
                <span className="material-symbols-outlined">rv_hookup</span>
              </div>
              <h3 className="font-title-md text-title-md text-on-surface mb-2 font-semibold">Flatbed Towing</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md">
                Zero-angle loading systems designed specifically for low-clearance luxury and electric vehicles.
              </p>
            </div>
          </div>

          {/* Service Card 2 */}
          <div 
            onClick={() => triggerSOS('fuel')}
            className="md:col-span-4 glass-panel rounded-xl p-6 group hover:border-primary/50 transition-colors flex flex-col h-80 cursor-pointer"
          >
            <div className="w-12 h-12 rounded bg-surface/50 border border-outline-variant/30 flex items-center justify-center text-primary-container mb-auto">
              <span className="material-symbols-outlined">ev_station</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface mb-2 font-semibold">Mobile EV Charging</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                L3 DC Fast Charging units deployed directly to your location. Get enough range to reach the next hub in minutes.
              </p>
            </div>
          </div>

          {/* Service Card 3 */}
          <div 
            onClick={() => triggerSOS('tire')}
            className="md:col-span-4 glass-panel rounded-xl p-6 group hover:border-primary/50 transition-colors flex flex-col h-80 cursor-pointer"
          >
            <div className="w-12 h-12 rounded bg-surface/50 border border-outline-variant/30 flex items-center justify-center text-primary-container mb-auto">
              <span className="material-symbols-outlined">tire_repair</span>
            </div>
            <div>
              <h3 className="font-title-md text-title-md text-on-surface mb-2 font-semibold">Tire Replacement</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                OEM-spec tires delivered and mounted on-site. We carry high-performance run-flats for immediate deployment.
              </p>
            </div>
          </div>

          {/* Stats Card */}
          <div className="md:col-span-8 glass-panel rounded-xl p-6 flex items-center justify-between h-80 bg-gradient-to-br from-surface to-surface-container-high border-t border-l border-primary-container/20">
            <div className="flex flex-col gap-4 w-full justify-center">
              <span className="font-label-caps text-label-caps text-on-surface-variant/80 tracking-widest text-[11px]">
                NETWORK RELIABILITY
              </span>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-4xl md:text-5xl font-headline-lg text-primary-container font-bold">99.9%</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Uptime SLA</div>
                </div>
                <div>
                  <div className="text-4xl md:text-5xl font-headline-lg text-primary-container font-bold">500k+</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">Secured Recoveries</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
