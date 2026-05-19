import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

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

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home setPage={setCurrentPage} />;
      case 'services':
        return <Services setPage={setCurrentPage} />;
      case 'emergency':
        return <EmergencySOS setPage={setCurrentPage} />;
      case 'tracking':
        return <LiveTracking />;
      case 'dashboard':
        return <Dashboard setPage={setCurrentPage} />;
      case 'admin':
        return <AdminPanel setPage={setCurrentPage} />;
      default:
        return <Home setPage={setCurrentPage} />;
    }
  };

  const showSidebar = currentPage === 'dashboard' || currentPage === 'admin';

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-lg flex flex-col relative antialiased selection:bg-primary-container selection:text-on-primary-container">
      
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
