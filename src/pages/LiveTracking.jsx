import React, { useState, useEffect } from 'react';

export default function LiveTracking() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'david', text: "I'm about 5 minutes out. Are you safe inside the vehicle?", time: '10:58 PM' },
    { id: 2, sender: 'user', text: "Yes, I'm pulled over on the right shoulder with hazards on.", time: '10:59 PM' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [etaSeconds, setEtaSeconds] = useState(262); // 4 minutes 22 seconds

  // Countdown timer for ETA
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

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: inputValue.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');

    // Trigger mechanic auto-reply after 1.5 seconds
    setTimeout(() => {
      const replies = [
        "Copy that. Keeping eyes on the tracking ledger.",
        "Got it, preparing the flatbed extraction harness now.",
        "Almost there, just passing the Downtown intersection grid.",
        "Understood. Sit tight, I will pull up in a minute!"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      const davidMsg = {
        id: Date.now() + 1,
        sender: 'david',
        text: randomReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, davidMsg]);
    }, 1500);
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col overflow-hidden">
      
      {/* Map Area */}
      <div 
        className="absolute inset-0 z-0 map-bg"
        style={{
          backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAtteiTI38b1NJDycNRcoMm37mgHStRt9jcFrGmvQybqzQs5a1Ur7j0E13oAdWbLhrrd-fmFg87cQSOqaxkbVmU6CnaIvYUIeAjEzWXp4w1Arizyci4LuinGdjCpDu80NtA7Kqae-KpB5sZhxdDMDBvhBpk1nk1avpYbgSSiiSPsDpAFCvIVwWOD6PW58usfJxvhMQruc8a08s3bFu-QrEpIY5qzqjSZVTfUOlVvOfbdG_sODiIMWkfgPsqahMA6FgzGPJ66qwTsC4')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay to darken map for UI contrast */}
        <div className="absolute inset-0 bg-background/60"></div>
        
        {/* Route Path (SVG Simulation with dash array animations) */}
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <path 
            d="M 200 400 Q 300 300 400 350 T 600 200" 
            fill="none" 
            stroke="#00dbe7" 
            strokeLinecap="round" 
            strokeWidth="4" 
            style={{
              filter: 'drop-shadow(0 0 8px rgba(0,219,231,0.8))',
              strokeDasharray: '10 10',
              animation: 'dash-kf 20s linear infinite'
            }}
          />
          {/* Origin Marker */}
          <circle cx="200" cy="400" fill="#ff8a00" r="8" className="pulse-animation"></circle>
          {/* Destination Marker */}
          <circle cx="600" cy="200" fill="#00f2ff" r="8"></circle>
        </svg>

        {/* Floating Mechanic Marker */}
        <div className="absolute top-[320px] left-[350px] transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
          <div className="bg-surface border border-primary-container p-2 rounded-full shadow-[0_0_15px_#00f2ff] animate-bounce">
            <span className="material-symbols-outlined text-primary-container text-lg">local_shipping</span>
          </div>
        </div>
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
                <span className="w-2 h-2 rounded-full bg-primary-container pulse-animation"></span>
                <span className="font-label-caps text-label-caps text-primary-container text-[10px]">EN ROUTE</span>
              </div>
            </div>
            <div className="w-full bg-surface-variant h-1 rounded-full mt-2 overflow-hidden">
              <div 
                className="bg-primary-container h-full shadow-[0_0_10px_rgba(0,219,231,0.8)] transition-all duration-1000"
                style={{ width: `${(etaSeconds / 262) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Mechanic Profile Card */}
          <div className="glass-panel rounded-xl p-6 flex items-center gap-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-outline-variant relative flex-shrink-0 bg-surface-container">
              <img 
                alt="David R. Mechanic Portrait" 
                className="w-full h-full object-cover" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuByN0gReMf2EVTRsGvzJIfQkt4dNkMtXxe95dlSRKbikVzLy0AcAOwpM8ZcNBrFQ_I1kRs1s2PtxHKbUJOYvRCsPXgsbIX6REt6qWqmgb_wcVrGeD5fgoT_mjpGjtNTGEKoxy9KYXCDW5Ox6kZjGV5MtsQWklnzS9LmIWqE6Cm6gyUOKmeVudbUAPl0iV_uBYpPci72bBQXJB0QeCEejv0N6T4A9vOMdgQ69sVufeLcbdn-9BSy4HrLTxe1RK7Sug46W8CnkJcD7f0"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-title-md text-title-md text-on-surface font-semibold">David R.</h3>
              <div className="flex items-center gap-1 text-secondary-container mt-1">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                <span className="font-body-sm text-body-sm text-on-surface-variant/80">4.9 (120+ rescues)</span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant/60 mt-1 truncate">Heavy Duty Tow • Unit #402</p>
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
                <div className="w-4 h-4 rounded-full bg-primary-container flex items-center justify-center mt-1">
                  <span className="material-symbols-outlined text-[10px] text-on-primary-container font-bold" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-on-surface font-semibold">Incident Dispatched</p>
                  <p className="font-label-caps text-[10px] text-on-surface-variant/80 mt-1">10:42 PM</p>
                </div>
              </div>
              {/* Step 2 (Active) */}
              <div className="flex items-start gap-4 relative z-10">
                <div className="w-4 h-4 rounded-full border-2 border-primary-container bg-surface flex items-center justify-center mt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-container pulse-animation"></div>
                </div>
                <div>
                  <p className="font-body-sm text-body-sm text-primary font-semibold">David En Route</p>
                  <p className="font-label-caps text-[10px] text-primary-container mt-1">Est. 11:05 PM</p>
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
              <span className="font-label-caps text-label-caps text-on-surface font-semibold tracking-wider text-[11px]">DAVID Mercer</span>
            </div>
            <button 
              className="text-on-surface-variant hover:text-primary transition-colors"
              onClick={() => alert("Live audio frequency locked on standard dispatch band.")}
            >
              <span className="material-symbols-outlined text-sm">more_horiz</span>
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
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
                placeholder="Message David..." 
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
          onClick={() => alert('Dialing David R. at Heavy Towing Unit #402...')}
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
