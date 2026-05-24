import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import {
  loginUserApi,
  loginAdminApi,
  getMeApi,
  getActiveIncidentApi,
  createIncidentApi,
  getAllIncidentsApi,
  assignIncidentApi,
  completeIncidentApi,
  cancelIncidentApi,
  addChatMessageApi,
  getPaymentsApi,
  getVehiclesApi,
  getNotificationsApi,
  googleLoginApi
} from './utils/api';

// Pages
import Home from './pages/Home';
import Services from './pages/Services';
import EmergencySOS from './pages/EmergencySOS';
import LiveTracking from './pages/LiveTracking';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isBypassMode, setIsBypassMode] = useState(false);
  const [bypassEmail, setBypassEmail] = useState('');
  const [loadingBypass, setLoadingBypass] = useState(false);

  // Synchronized System States
  const [activeIncident, setActiveIncident] = useState(null);
  const [adminIncidents, setAdminIncidents] = useState([]);
  const [completedIncidents, setCompletedIncidents] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [notification, setNotification] = useState(null);

  // Trigger floating alert toast
  const triggerToast = (message, type = 'info', actionLabel = null, onAction = null) => {
    setNotification({ message, type, actionLabel, onAction });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  const fetchVehicles = async () => {
    try {
      const res = await getVehiclesApi();
      if (res && res.success && res.data) {
        setVehicles(res.data);
      }
    } catch (err) {
      console.error("Failed to load vehicles:", err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await getNotificationsApi();
      if (res && res.success && res.data) {
        setNotifications(res.data);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const fetchHistory = async () => {
    try {
      const paymentsRes = await getPaymentsApi();
      if (paymentsRes && paymentsRes.success && paymentsRes.data) {
        const formatted = paymentsRes.data.map(p => ({
          id: p.transactionId,
          date: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
          service: p.serviceRequest ? p.serviceRequest.type : 'Road Rescue Assistance',
          vehicle: p.serviceRequest && p.serviceRequest.customerVehicle ? p.serviceRequest.customerVehicle : 'Tesla Model S Plaid',
          status: p.status === 'Completed' ? 'COMPLETED' : 'CANCELLED',
          cost: `$${p.amount.toFixed(2)}`
        }));
        setCompletedIncidents(formatted);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    }
  };

  const switchAccount = async (role) => {
    try {
      if (role === 'admin') {
        const loginData = await loginAdminApi('admin@roadrescue.com', 'roadrescue123');
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        setCurrentUser(loginData.user);
        triggerToast('🔑 Switch Confirmed: Command Operator clearance granted.', 'success');
        setCurrentPage('admin');
      } else {
        const loginData = await loginUserApi('user@roadrescue.com', 'roadrescue123');
        localStorage.setItem('token', loginData.token);
        localStorage.setItem('user', JSON.stringify(loginData.user));
        setCurrentUser(loginData.user);
        triggerToast('👤 Switch Confirmed: Standard Consumer clearance granted.', 'success');
        setCurrentPage('dashboard');
      }
      
      // Refresh active data
      try {
        const activeRes = await getActiveIncidentApi();
        if (activeRes && activeRes.success) {
          setActiveIncident(activeRes.data || null);
        } else {
          setActiveIncident(null);
        }
      } catch {
        setActiveIncident(null);
      }
      await fetchHistory();
      await fetchVehicles();
      await fetchNotifications();
      
      // Refresh admin list if role is admin
      if (role === 'admin') {
        try {
          const allRes = await getAllIncidentsApi();
          if (allRes && allRes.success && allRes.data) {
            const activeOnly = allRes.data.filter(t => t.status === 'Pending' || t.status === 'Assigned');
            setAdminIncidents(activeOnly);
          }
        } catch {
          setAdminIncidents([]);
        }
      } else {
        setAdminIncidents([]);
      }
    } catch (err) {
      console.error("Failed to switch account:", err);
      triggerToast('❌ Authorization handshake failed.', 'error');
    }
  };

  const handleGoogleLogin = async (response) => {
    try {
      const res = await googleLoginApi(response.credential);
      if (res && res.success && res.user && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        
        triggerToast(`👋 Authorized grid connection secured. Welcome, ${res.user.name}!`, 'success');
        
        if (res.user.role === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
        
        try {
          const activeRes = await getActiveIncidentApi();
          if (activeRes && activeRes.success) {
            setActiveIncident(activeRes.data || null);
          }
        } catch (err) {
          console.warn("Failed to load active incident on Google login:", err);
        }
        await fetchHistory();
        await fetchVehicles();
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Google Sign-In backend verification failed:", err);
      const serverMsg = err.response?.data?.message || err.message || "Network error: check if backend is online.";
      triggerToast(`❌ Google Verification failed: ${serverMsg}`, "error");
    }
  };

  const handleBypassLogin = async (e) => {
    e.preventDefault();
    if (!bypassEmail) return;
    setLoadingBypass(true);
    try {
      const res = await googleLoginApi(null, bypassEmail);
      if (res && res.success && res.user && res.token) {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        
        triggerToast(`👋 Authorized Sandbox secured. Welcome Operator, ${res.user.name}!`, 'success');
        
        if (res.user.role === 'admin') {
          setCurrentPage('admin');
        } else {
          setCurrentPage('dashboard');
        }
        
        try {
          const activeRes = await getActiveIncidentApi();
          if (activeRes && activeRes.success) {
            setActiveIncident(activeRes.data || null);
          }
        } catch (err) {
          console.warn("Failed to load active incident on Sandbox login:", err);
        }
        await fetchHistory();
        await fetchVehicles();
        await fetchNotifications();
      }
    } catch (err) {
      console.error("Sandbox authentication failed:", err);
      const serverMsg = err.response?.data?.message || err.message || "Network error: check if backend is online.";
      triggerToast(`❌ Sandbox Connection failed: ${serverMsg}`, "error");
    } finally {
      setLoadingBypass(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setActiveIncident(null);
    setCurrentPage('home');
    triggerToast('🚪 Logged out successfully. Terminal secure.', 'info');
  };

  useEffect(() => {
    let checkInterval;
    if (!currentUser) {
      const initButton = () => {
        if (typeof window.google !== 'undefined') {
          window.google.accounts.id.initialize({
            client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || '60313722264-j2a9b50nk9fv3qus8mosah0meqc1fm1v.apps.googleusercontent.com',
            callback: handleGoogleLogin
          });
          const btnElem = document.getElementById('google-signin-btn');
          if (btnElem) {
            window.google.accounts.id.renderButton(
              btnElem,
              { theme: 'filled_black', size: 'large', width: '320', shape: 'pill' }
            );
            clearInterval(checkInterval);
          }
        }
      };
      
      checkInterval = setInterval(initButton, 200);
      initButton();
    }
    return () => clearInterval(checkInterval);
  }, [currentUser, handleGoogleLogin]);

  useEffect(() => {
    const initAuth = async () => {
      try {
        let token = localStorage.getItem('token');
        let localUserStr = localStorage.getItem('user');
        if (token && localUserStr) {
          try {
            const meRes = await getMeApi();
            if (meRes && meRes.success && meRes.data) {
              setCurrentUser(meRes.data);
              console.log("Authenticated verified user:", meRes.data);
            } else {
              throw new Error("Invalid session data");
            }
          } catch (validateErr) {
            console.warn("Session validation failed. Stale token cleared:", validateErr);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            return;
          }
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
      
      // Fetch telemetry details if token exists
      if (localStorage.getItem('token')) {
        try {
          const activeRes = await getActiveIncidentApi();
          if (activeRes && activeRes.success && activeRes.data) {
            setActiveIncident(activeRes.data);
            if (activeRes.data.status === 'Assigned') {
              setCurrentPage('tracking');
            } else if (activeRes.data.status === 'Pending') {
              setCurrentPage('emergency');
            }
          }
        } catch (err) {
          console.error("Failed to load active incident:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            return;
          }
        }

        await fetchHistory();

        try {
          const allRes = await getAllIncidentsApi();
          if (allRes && allRes.success && allRes.data) {
            const activeOnly = allRes.data.filter(t => t.status === 'Pending' || t.status === 'Assigned');
            setAdminIncidents(activeOnly);
          }
        } catch (err) {
          console.error("Failed to load admin incidents:", err);
          if (err.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setCurrentUser(null);
            return;
          }
        }

        await fetchVehicles();
        await fetchNotifications();
      }
    };
    
    initAuth();

    // Setup Socket.io client connection for instantaneous updates
    const socketUrl = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? window.location.origin : 'http://127.0.0.1:5000');
    const socket = io(socketUrl);

    socket.on('connect', () => {
      console.log('🔌 Connected to RoadRescue real-time synchronization grid.');
    });

    socket.on('ticket_created', (ticket) => {
      const formatted = { ...ticket, id: ticket.ticketId };
      setAdminIncidents((prev) => {
        if (prev.some(t => t.id === formatted.id)) return prev;
        return [formatted, ...prev];
      });

      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && localUser.role === 'admin') {
        triggerToast(`🚨 New Rescue Beacon Activated: Ticket #${formatted.id}`, 'error');
      }
    });

    socket.on('ticket_assigned', (ticket) => {
      const formatted = { ...ticket, id: ticket.ticketId };
      setAdminIncidents((prev) => prev.map(t => t.id === formatted.id ? formatted : t));
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && ticket.user === localUser._id) {
        setActiveIncident(formatted);
        triggerToast(
          `🚒 Dispatch Assigned! Driver ${formatted.driverName} is now en route to your sector.`,
          'success',
          'Track Rescue',
          () => setCurrentPage('tracking')
        );
      }
      fetchNotifications();
    });

    socket.on('ticket_completed', (ticket) => {
      const formatted = { ...ticket, id: ticket.ticketId };
      setAdminIncidents((prev) => prev.filter(t => t.id !== formatted.id));
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && ticket.user === localUser._id) {
        setActiveIncident(null);
        triggerToast(`💚 Safe Harbor! Rescue #${formatted.id} successfully resolved. All systems green.`, 'success');
      }
      
      fetchHistory();
      fetchNotifications();
    });

    socket.on('ticket_cancelled', (ticket) => {
      const formatted = { ...ticket, id: ticket.ticketId };
      setAdminIncidents((prev) => prev.filter(t => t.id !== formatted.id));
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && ticket.user === localUser._id) {
        setActiveIncident(null);
        triggerToast(`⚠️ Emergency request cancelled. Beacon powered off.`, 'warning');
      }
    });

    socket.on('ticket_updated', (ticket) => {
      const formatted = { ...ticket, id: ticket.ticketId };
      setAdminIncidents((prev) => prev.map(t => t.id === formatted.id ? formatted : t));
      
      const localUser = JSON.parse(localStorage.getItem('user'));
      if (localUser && ticket.user === localUser._id) {
        setActiveIncident(formatted);
      }
    });

    // Background heartbeat sync check (runs at 20s interval as safeguard)
    const interval = setInterval(async () => {
      try {
        const activeRes = await getActiveIncidentApi();
        if (activeRes && activeRes.success) {
          setActiveIncident(activeRes.data || null);
        }
        
        const allRes = await getAllIncidentsApi();
        if (allRes && allRes.success && allRes.data) {
          const activeOnly = allRes.data.filter(t => t.status === 'Pending' || t.status === 'Assigned');
          setAdminIncidents(activeOnly);
        }
        
        await fetchNotifications();
      } catch (err) {
        console.log("Heartbeat sync check:", err.message);
      }
    }, 20000);

    return () => {
      socket.disconnect();
      clearInterval(interval);
    };
  }, []);

  // SOS Trigger Callback (Consumer Beacon)
  const triggerSOS = async (issueCategory) => {
    if (activeIncident) {
      setCurrentPage('emergency');
      return;
    }

    const issueMapping = {
      accident: { type: 'Accident Supportuld', req: 'Accident Response' },
      battery: { type: 'Battery Jumpstart', req: 'Mobile Battery Unit' },
      tire: { type: 'Flat Tire Repair', req: 'Tire Service' },
      tow: { type: 'Towing Service', req: 'Flatbed Tow' },
      fuel: { type: 'Fuel Delivery', req: 'L3 Charger & Fuel' },
      flood: { type: 'Flood Rescue', req: 'Winch & Water Rig' },
      mud: { type: 'Mud Rescue', req: 'Winch Rig' },
      engine: { type: 'Engine Diagnostic', req: 'Diagnostics Unit' },
      lockout: { type: 'Lockout Support', req: 'Standard Lockout' }
    };

    const info = issueMapping[issueCategory] || { type: 'Emergency Rescue', req: 'Standard Rescue' };

    const dispatchSos = async (lat, lng, addressString = 'Sector 4 - Downtown Grid') => {
      try {
        const res = await createIncidentApi(info.type, issueCategory, addressString, info.req, lat, lng);
        if (res && res.success) {
          setActiveIncident(res.data);
          setAdminIncidents(prev => [res.data, ...prev]);
          setCurrentPage('emergency');
          triggerToast(
            `🚨 Beacon Active: Registered Ticket #${res.data.id}. Awaiting Admin Command Assignment.`,
            'error',
            'Go to Command Center',
            () => setCurrentPage('admin')
          );
        }
      } catch (error) {
        console.error("SOS Trigger Error:", error);
        const errMsg = error.response?.data?.message || 'Failed to establish satellite link to backend database.';
        triggerToast(`❌ ${errMsg}`, 'error');
      }
    };

    const getRealAddressAndDispatch = async (lat, lng) => {
      let address = `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
          headers: {
            'Accept-Language': 'en'
          }
        });
        if (response.ok) {
          const addrData = await response.json();
          if (addrData && addrData.display_name) {
            address = addrData.display_name;
          }
        }
      } catch (err) {
        console.warn("⚠️ OpenStreetMap Nominatim geocoding lookup failed:", err);
      }
      dispatchSos(lat, lng, address);
    };

    const fetchIpLocationFallback = () => {
      console.log("ℹ️ Fetching real location fallback via IP Geolocation API...");
      fetch('https://ipapi.co/json/')
        .then(res => {
          if (!res.ok) throw new Error("IP Geolocation API network response failed");
          return res.json();
        })
        .then(data => {
          if (data && typeof data.latitude === 'number' && typeof data.longitude === 'number') {
            const label = data.city ? `${data.city}, ${data.region || data.country_name} (IP Location)` : 'Real IP-based Location';
            console.log(`📍 Acquired IP Geolocation: ${data.latitude}, ${data.longitude} (${label})`);
            dispatchSos(data.latitude, data.longitude, label);
          } else {
            throw new Error("Invalid IP Location data structure");
          }
        })
        .catch(ipErr => {
          console.error("❌ IP Geolocation API also failed:", ipErr);
          dispatchSos(null, null, 'Sector 4 - Downtown Grid');
        });
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          console.log(`📍 Acquired browser high-accuracy Geolocation: ${lat}, ${lng}`);
          getRealAddressAndDispatch(lat, lng);
        },
        (error) => {
          console.warn("⚠️ Browser Geolocation blocked or failed. Using IP location fallback:", error);
          fetchIpLocationFallback();
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      console.warn("⚠️ Browser does not support geolocation. Using IP location fallback.");
      fetchIpLocationFallback();
    }
  };

  // Assign Ticket Callback (Admin Command)
  const assignIncident = async (id, mechanicId) => {
    try {
      const res = await assignIncidentApi(id, mechanicId);
      if (res && res.success) {
        setAdminIncidents(prev => prev.map(t => t.id === id ? res.data : t));
        const assignedDriverName = res.data.driverName || 'David R.';
        if (activeIncident && activeIncident.id === id) {
          setActiveIncident(res.data);
          triggerToast(
            `🚒 Dispatch Assigned! Driver ${assignedDriverName} is now en route to your sector.`,
            'success',
            'Track Rescue',
            () => setCurrentPage('tracking')
          );
        } else {
          triggerToast(`🚒 Command Confirmed: Incident #${id} successfully assigned to ${assignedDriverName}.`, 'success');
        }
      }
    } catch (error) {
      console.error("Assign Incident Error:", error);
      triggerToast('❌ Failed to assign incident in backend.', 'error');
    }
  };

  // Complete Rescue Incident (Admin Command / resolved)
  const completeIncident = async (id) => {
    try {
      const res = await completeIncidentApi(id);
      if (res && res.success) {
        setAdminIncidents(prev => prev.filter(t => t.id !== id));
        if (activeIncident && activeIncident.id === id) {
          setActiveIncident(null);
          triggerToast(`💚 Safe Harbor! Rescue #${id} successfully resolved and archived. All systems green.`, 'success');
        } else {
          triggerToast(`💚 Command ledger: Incident #${id} archived as completed.`, 'success');
        }
        
        // Refresh payments/invoice lists (wrapped in a nested try-catch to prevent guest/token failures from breaking completion)
        try {
          const paymentsRes = await getPaymentsApi();
          if (paymentsRes && paymentsRes.success && paymentsRes.data) {
            const formatted = paymentsRes.data.map(p => ({
              id: p.transactionId,
              date: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
              service: p.serviceRequest ? p.serviceRequest.type : 'Road Rescue Assistance',
              vehicle: p.serviceRequest && p.serviceRequest.customerVehicle ? p.serviceRequest.customerVehicle : 'Tesla Model S Plaid',
              status: p.status === 'Completed' ? 'COMPLETED' : 'CANCELLED',
              cost: `$${p.amount.toFixed(2)}`
            }));
            setCompletedIncidents(formatted);
          }
        } catch (paymentErr) {
          console.warn("Failed to refresh payments history after resolution:", paymentErr);
        }
      }
    } catch (error) {
      console.error("Complete Incident Error:", error);
      triggerToast('❌ Failed to complete incident in backend.', 'error');
    }
  };

  // Cancel Incident (SOS Beacon off)
  const cancelIncident = async (id) => {
    try {
      const res = await cancelIncidentApi(id);
      if (res && res.success) {
        setAdminIncidents(prev => prev.filter(t => t.id !== id));
        if (activeIncident && activeIncident.id === id) {
          setActiveIncident(null);
          triggerToast(`⚠️ Emergency request cancelled. Beacon powered off.`, 'warning');
        }
      }
    } catch (error) {
      console.error("Cancel Incident Error:", error);
      triggerToast('❌ Failed to cancel incident in backend.', 'error');
    }
  };

  // Chat message submission
  const addChatMessage = async (sender, text) => {
    if (!activeIncident) return;
    try {
      const res = await addChatMessageApi(activeIncident.id, sender, text);
      if (res && res.success) {
        setActiveIncident(res.data);
        setAdminIncidents(prev => prev.map(t => t.id === activeIncident.id ? res.data : t));
      }
    } catch (error) {
      console.error("Chat Message Error:", error);
      triggerToast('❌ Message transmission failed.', 'error');
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setPage={setCurrentPage} triggerSOS={triggerSOS} currentUser={currentUser} />;
      case 'services':
        return <Services setPage={setCurrentPage} triggerSOS={triggerSOS} />;
      case 'emergency':
        return (
          <EmergencySOS
            setPage={setCurrentPage}
            activeIncident={activeIncident}
            triggerSOS={triggerSOS}
            cancelIncident={cancelIncident}
            switchAccount={switchAccount}
          />
        );
      case 'tracking':
        return (
          <LiveTracking
            setPage={setCurrentPage}
            activeIncident={activeIncident}
            addChatMessage={addChatMessage}
            switchAccount={switchAccount}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            setPage={setCurrentPage}
            activeIncident={activeIncident}
            completedIncidents={completedIncidents}
            vehicles={vehicles}
            fetchVehicles={fetchVehicles}
            notifications={notifications}
            fetchNotifications={fetchNotifications}
          />
        );
      case 'admin':
        if (!currentUser || currentUser.role !== 'admin') {
          setTimeout(() => {
            setCurrentPage('dashboard');
            triggerToast("❌ Access Denied: Authorized Clearance Level 'admin' required.", 'error');
          }, 0);
          return (
            <div className="min-h-screen bg-background flex items-center justify-center">
              <div className="text-center flex flex-col gap-2">
                <span className="material-symbols-outlined text-[48px] text-error animate-pulse">shield</span>
                <p className="font-title-md font-bold text-on-surface">Securing Command Interface...</p>
              </div>
            </div>
          );
        }
        return (
          <AdminPanel
            setPage={setCurrentPage}
            adminIncidents={adminIncidents}
            assignIncident={assignIncident}
            completeIncident={completeIncident}
            cancelIncident={cancelIncident}
          />
        );
      default:
        return <Home setPage={setCurrentPage} triggerSOS={triggerSOS} currentUser={currentUser} />;
    }
  };

  const showSidebar = currentPage === 'dashboard' || currentPage === 'admin';

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0e0e0e] text-on-surface flex items-center justify-center relative overflow-hidden font-body-lg antialiased">
        {/* Animated Background Grids */}
        <div className="absolute inset-0 bg-hero-pattern opacity-30 z-0"></div>
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none z-0" style={{
          background: "radial-gradient(circle at 50% 40%, rgba(0, 242, 255, 0.1) 0%, transparent 60%)"
        }}></div>

        {/* Floating tech nodes */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-primary/5 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 rounded-full bg-secondary/5 blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        {/* Lock Card Container */}
        <div className="relative z-10 w-full max-w-md p-8 glass-panel-active rounded-2xl border border-primary-container/20 shadow-2xl flex flex-col items-center gap-8 text-center mx-4 select-none">
          
          {/* Neon Logo & Icon */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-[0_0_20px_rgba(0,242,255,0.25)] relative sos-pulse animate-pulse">
              <span className="material-symbols-outlined text-[36px]">security</span>
            </div>
            <div>
              <h1 className="text-3xl font-headline-lg font-bold tracking-tight text-primary-container leading-none">RoadRescue</h1>
              <p className="font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant/80 mt-2 font-bold">Tactical Deployment Network</p>
            </div>
          </div>

          <div className="w-full h-px bg-outline-variant/20"></div>

          {/* Secure Message */}
          <div className="flex flex-col gap-2">
            <h2 className="font-title-md text-lg text-on-surface font-bold">Secure Verification Required</h2>
            <p className="font-body-sm text-sm text-on-surface-variant leading-relaxed">
              All rescue logistics, tactical map interfaces, and telemetry grids are cryptographically secured. Sign in with Google to authenticate your terminal.
            </p>
          </div>

          {/* Google Button / Bypass Wrapper */}
          <div className="flex flex-col gap-4 w-full relative z-20">
            {!isBypassMode ? (
              <div className="flex flex-col gap-4 w-full">
                <div id="google-signin-btn" className="shadow-[0_4px_20px_rgba(0,0,0,0.4)] rounded-full hover:scale-105 transition-transform duration-300 flex justify-center"></div>
                
                <div className="flex items-center my-1 text-on-surface-variant/20">
                  <div className="h-px bg-current flex-grow"></div>
                  <span className="px-3 font-label-caps text-[9px] uppercase tracking-widest text-on-surface-variant/40">OR</span>
                  <div className="h-px bg-current flex-grow"></div>
                </div>

                <button 
                  onClick={() => setIsBypassMode(true)}
                  className="py-2.5 px-4 rounded border border-outline-variant/30 hover:border-primary/50 bg-surface-container-high/40 hover:bg-surface-variant/40 text-primary font-label-caps text-[10px] tracking-widest font-bold uppercase transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">terminal</span>
                  Developer Sandbox Bypass
                </button>
              </div>
            ) : (
              <form onSubmit={handleBypassLogin} className="flex flex-col gap-4 w-full text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Developer Email</label>
                  <input 
                    type="email" 
                    required
                    value={bypassEmail}
                    onChange={(e) => setBypassEmail(e.target.value)}
                    placeholder="a90685766@gmail.com"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button 
                    type="button"
                    onClick={() => setBypassEmail('a90685766@gmail.com')}
                    className="flex-1 py-1 px-2 rounded bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary text-[9px] font-label-caps text-center transition-all"
                  >
                    Set Admin Email
                  </button>
                  <button 
                    type="button"
                    onClick={() => setBypassEmail('user@roadrescue.com')}
                    className="flex-1 py-1 px-2 rounded bg-secondary/10 hover:bg-secondary/20 border border-secondary/20 text-secondary text-[9px] font-label-caps text-center transition-all"
                  >
                    Set User Email
                  </button>
                </div>

                <div className="flex gap-3 mt-2">
                  <button 
                    type="button"
                    onClick={() => setIsBypassMode(false)}
                    className="flex-1 py-2 rounded border border-outline-variant/30 text-[10px] font-label-caps font-bold text-on-surface-variant hover:text-on-surface text-center transition-all"
                  >
                    Back
                  </button>
                  <button 
                    type="submit"
                    disabled={loadingBypass}
                    className="flex-1 py-2 bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-[10px] font-bold rounded shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center"
                  >
                    {loadingBypass ? 'Connecting...' : 'Bypass Auth'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="font-label-caps text-[9px] text-on-surface-variant/40 tracking-wider">
            SECURE HANDSHAKE NODE • CP-DELHI-402
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-lg flex flex-col relative antialiased selection:bg-primary-container selection:text-on-primary-container">
      
      {/* Global Real-Time Notification Toast Banner */}
      {notification && (
        <div className="fixed top-24 right-6 left-6 md:left-auto md:w-96 z-50 animate-bounce transition-all duration-300">
          <div className={`p-4 rounded-xl shadow-2xl glass-panel-active border-t-2 flex flex-col gap-2 ${
            notification.type === 'success' ? 'border-primary' : 
            notification.type === 'error' ? 'border-error' : 'border-secondary'
          }`}>
            <div className="flex justify-between items-start gap-4">
              <p className="font-body-sm text-body-sm text-on-surface font-semibold">{notification.message}</p>
              <button 
                onClick={() => setNotification(null)}
                className="text-on-surface-variant hover:text-primary transition-colors text-xs"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            {notification.actionLabel && (
              <button
                onClick={() => {
                  notification.onAction();
                  setNotification(null);
                }}
                className="text-left font-label-caps text-[10px] tracking-widest text-primary hover:text-primary-container uppercase font-bold mt-1"
              >
                {notification.actionLabel} &rarr;
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sidebar for Logistics Pages (Dashboard/Admin) */}
      {showSidebar && (
        <>
          <Sidebar 
            currentPage={currentPage} 
            setPage={setCurrentPage} 
            currentUser={currentUser}
            switchAccount={switchAccount}
            handleLogout={handleLogout}
          />
          
          {/* Mobile Dashboard/Admin Drawer Toggle Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-background/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Mobile Left Drawer */}
          <div 
            className={`fixed top-0 bottom-0 left-0 w-72 bg-surface-container-low/95 backdrop-blur-2xl border-r border-outline-variant/20 py-8 z-50 transition-transform duration-300 md:hidden flex flex-col ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="px-6 mb-8 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container">
                  <img 
                    alt="Logistics Avatar" 
                    className="w-full h-full object-cover" 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAsh4C5iHWzKRxWfShZVM8eiZPzMc3kWhiM5zSVvj0-DX00SRwdrB7Z5JaWl1boPu-27zdJYJqPhMKCamr0tHZtxdAothXlGLbuCQaQhXAwfvi0BHd-JqukyDfSm_uO2tfYrddJJKONqbw8ss5DKjBQz0XCA6wB3xFhvBD8AEYpATSUB_3LlXs1jGgMpcCWUwq9wgwp2zHMLsw1XPjHf_l8sUGP5kenHyHymqAADctVFcT1HLdutUTLiwrvxumCiMPoGifpYxVB6pU"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                </div>
                <div>
                  <h2 className="font-title-md text-on-surface text-sm font-semibold">Command Center</h2>
                  <p className="font-label-caps text-on-surface-variant text-[9px] uppercase tracking-wider">Logistics Portal</p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-on-surface-variant hover:text-primary transition-colors flex items-center"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex flex-col gap-1 flex-grow">
              <button
                onClick={() => { setCurrentPage('dashboard'); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-4 px-6 py-4 font-label-caps text-[11px] tracking-widest text-left w-full ${
                  currentPage === 'dashboard'
                    ? 'bg-primary-container/10 text-primary border-r-4 border-primary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>dashboard</span>
                <span>DASHBOARD</span>
              </button>
              {currentUser?.role === 'admin' && (
                <button
                  onClick={() => { setCurrentPage('admin'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-4 px-6 py-4 font-label-caps text-[11px] tracking-widest text-left w-full ${
                    currentPage === 'admin'
                      ? 'bg-primary-container/10 text-primary border-r-4 border-primary font-bold'
                      : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined">explore</span>
                  <span>ADMIN COMMAND</span>
                </button>
              )}
              <button
                onClick={() => { setCurrentPage('home'); setIsMobileMenuOpen(false); }}
                className="text-on-surface-variant flex items-center gap-4 px-6 py-4 font-label-caps text-[11px] tracking-widest hover:bg-surface-variant/20 hover:text-primary text-left w-full"
              >
                <span className="material-symbols-outlined">home</span>
                <span>CONSUMER WEB</span>
              </button>
              <button
                onClick={() => { setCurrentPage('services'); setIsMobileMenuOpen(false); }}
                className="text-on-surface-variant flex items-center gap-4 px-6 py-4 font-label-caps text-[11px] tracking-widest hover:bg-surface-variant/20 hover:text-primary text-left w-full"
              >
                <span className="material-symbols-outlined">build</span>
                <span>ALL SERVICES</span>
              </button>
            </div>
            
            <div className="px-6 mt-auto">
              <button 
                onClick={() => { setCurrentPage('emergency'); setIsMobileMenuOpen(false); }}
                className="w-full py-3 px-4 rounded bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-[11px] tracking-wider font-bold flex items-center justify-center gap-2 hover:shadow-[0_0_15px_rgba(0,242,255,0.4)]"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                NEW DISPATCH
              </button>
            </div>
          </div>
        </>
      )}

      {/* Main Container Layout */}
      <div className={`flex-1 flex flex-col w-full ${showSidebar ? 'md:pl-72' : ''}`}>
        
        {/* Mobile Header for Logistics (hidden when not logistics or on desktop) */}
        {showSidebar && (
          <header className="md:hidden flex justify-between items-center w-full px-6 py-4 sticky top-0 z-30 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/20 shadow-md">
            <div 
              className="font-headline-lg-mobile text-primary tracking-tight font-bold cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              RoadRescue
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => alert("No new notifications.")}
                className="text-primary hover:text-primary-container transition-colors flex items-center"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="text-primary hover:text-primary-container transition-colors flex items-center"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
            </div>
          </header>
        )}

        {/* Consumer top Navigation (hidden for Logistics) */}
        {!showSidebar && (
          <Navbar 
            currentPage={currentPage} 
            setPage={setCurrentPage} 
            currentUser={currentUser}
            switchAccount={switchAccount}
            handleLogout={handleLogout}
          />
        )}

        {/* Dynamic Page Rendering */}
        <main className="flex-grow flex flex-col w-full relative">
          {renderPage()}
        </main>

        {/* Consumer Footer (hidden for Logistics) */}
        {!showSidebar && <Footer />}
      </div>

    </div>
  );
}
