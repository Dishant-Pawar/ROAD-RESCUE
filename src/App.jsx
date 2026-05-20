import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import {
  loginUserApi,
  getActiveIncidentApi,
  createIncidentApi,
  getAllIncidentsApi,
  assignIncidentApi,
  completeIncidentApi,
  cancelIncidentApi,
  addChatMessageApi,
  getPaymentsApi
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

  // Synchronized System States
  const [activeIncident, setActiveIncident] = useState(null);
  const [adminIncidents, setAdminIncidents] = useState([]);
  const [completedIncidents, setCompletedIncidents] = useState([]);

  const [notification, setNotification] = useState(null);

  // Trigger floating alert toast
  const triggerToast = (message, type = 'info', actionLabel = null, onAction = null) => {
    setNotification({ message, type, actionLabel, onAction });
    setTimeout(() => {
      setNotification(null);
    }, 6000);
  };

  useEffect(() => {
    // 1. Authenticate as the default user or admin if not already logged in
    const initAuth = async () => {
      try {
        let token = localStorage.getItem('token');
        if (!token) {
          const loginData = await loginUserApi('user@roadrescue.com', 'roadrescue123');
          localStorage.setItem('token', loginData.token);
          localStorage.setItem('user', JSON.stringify(loginData.user));
          console.log("Logged in user:", loginData.user);
        }
      } catch (err) {
        console.error("Autologin user failed:", err);
      }
      
      // 2. Fetch active incident
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
      }

      // 3. Fetch completed payments/history
      try {
        const paymentsRes = await getPaymentsApi();
        if (paymentsRes && paymentsRes.success && paymentsRes.data) {
          const formatted = paymentsRes.data.map(p => ({
            id: p.transactionId,
            date: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
            service: p.serviceRequest ? p.serviceRequest.type : 'Road Rescue Assistance',
            vehicle: 'Tesla Model S',
            status: p.status === 'Completed' ? 'COMPLETED' : 'CANCELLED',
            cost: `$${p.amount.toFixed(2)}`
          }));
          setCompletedIncidents(formatted);
        }
      } catch (err) {
        console.error("Failed to load invoices:", err);
      }

      // 4. Fetch all incidents to prime Admin Panel
      try {
        const allRes = await getAllIncidentsApi();
        if (allRes && allRes.success && allRes.data) {
          setAdminIncidents(allRes.data);
        }
      } catch (err) {
        console.error("Failed to load admin incidents:", err);
      }
    };
    
    initAuth();

    const interval = setInterval(async () => {
      try {
        const activeRes = await getActiveIncidentApi();
        if (activeRes && activeRes.success) {
          setActiveIncident(activeRes.data || null);
        }
        
        const allRes = await getAllIncidentsApi();
        if (allRes && allRes.success && allRes.data) {
          setAdminIncidents(allRes.data);
        }
      } catch (err) {
        console.error("Polling sync error:", err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // SOS Trigger Callback (Consumer Beacon)
  const triggerSOS = async (issueCategory) => {
    if (activeIncident) {
      setCurrentPage('emergency');
      return;
    }

    const issueMapping = {
      accident: { type: 'Accident Support', req: 'Accident Response' },
      battery: { type: 'Battery Jumpstart', req: 'Mobile Battery Unit' },
      tire: { type: 'Flat Tire Repair', req: 'Tire Service' },
      tow: { type: 'Flatbed Towing', req: 'Flatbed Tow' },
      fuel: { type: 'Fuel Delivery', req: 'L3 Charger & Fuel' },
      flood: { type: 'Flood Rescue', req: 'Winch & Water Rig' },
      mud: { type: 'Mud Rescue', req: 'Winch Rig' },
      engine: { type: 'Engine Diagnostic', req: 'Diagnostics Unit' },
      lockout: { type: 'Lockout Support', req: 'Standard Lockout' }
    };

    const info = issueMapping[issueCategory] || { type: 'Emergency Rescue', req: 'Standard Rescue' };

    try {
      const res = await createIncidentApi(info.type, issueCategory, 'Sector 4 - Downtown Grid', info.req);
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
      triggerToast('❌ Failed to establish satellite link to backend database.', 'error');
    }
  };

  // Assign Ticket Callback (Admin Command)
  const assignIncident = async (id) => {
    try {
      const res = await assignIncidentApi(id);
      if (res && res.success) {
        setAdminIncidents(prev => prev.map(t => t.id === id ? res.data : t));
        if (activeIncident && activeIncident.id === id) {
          setActiveIncident(res.data);
          triggerToast(
            `🚒 Dispatch Assigned! Driver David R. is now en route to your sector.`,
            'success',
            'Track Rescue',
            () => setCurrentPage('tracking')
          );
        } else {
          triggerToast(`🚒 Command Confirmed: Incident #${id} successfully assigned to carrier drone unit.`, 'success');
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
        
        // Refresh payments/invoice lists
        const paymentsRes = await getPaymentsApi();
        if (paymentsRes && paymentsRes.success && paymentsRes.data) {
          const formatted = paymentsRes.data.map(p => ({
            id: p.transactionId,
            date: new Date(p.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' }),
            service: p.serviceRequest ? p.serviceRequest.type : 'Road Rescue Assistance',
            vehicle: 'Tesla Model S',
            status: p.status === 'Completed' ? 'COMPLETED' : 'CANCELLED',
            cost: `$${p.amount.toFixed(2)}`
          }));
          setCompletedIncidents(formatted);
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
        return <Home setPage={setCurrentPage} triggerSOS={triggerSOS} />;
      case 'services':
        return <Services setPage={setCurrentPage} triggerSOS={triggerSOS} />;
      case 'emergency':
        return (
          <EmergencySOS
            setPage={setCurrentPage}
            activeIncident={activeIncident}
            triggerSOS={triggerSOS}
            cancelIncident={cancelIncident}
          />
        );
      case 'tracking':
        return (
          <LiveTracking
            setPage={setCurrentPage}
            activeIncident={activeIncident}
            addChatMessage={addChatMessage}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            setPage={setCurrentPage}
            activeIncident={activeIncident}
            completedIncidents={completedIncidents}
          />
        );
      case 'admin':
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
        return <Home setPage={setCurrentPage} triggerSOS={triggerSOS} />;
    }
  };

  const showSidebar = currentPage === 'dashboard' || currentPage === 'admin';

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
          <Sidebar currentPage={currentPage} setPage={setCurrentPage} />
          
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
          <Navbar currentPage={currentPage} setPage={setCurrentPage} />
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
