import { useState } from 'react';

export default function History({ completedIncidents, setPage }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Filter logs based on search query and status filter
  const filteredIncidents = (completedIncidents || []).filter((item) => {
    const matchesSearch = 
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.vehicle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'ALL' || 
      item.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-4xl font-headline-lg gradient-text font-bold">Secure Incident Ledger</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            Browse and audit all cryptographically archived operations and billing receipts.
          </p>
        </div>
        <button 
          onClick={() => setPage('dashboard')}
          className="py-2.5 px-6 rounded-full border border-primary text-primary font-label-caps text-label-caps hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard Panel
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 flex flex-col md:flex-row justify-between gap-4 shadow-xl border-outline-variant/15 bg-surface-container-low/20">
        {/* Search Input */}
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60">search</span>
          <input 
            type="text" 
            placeholder="Search by operation ID, vehicle, or service..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-surface-container/50 border border-outline-variant/30 rounded-full py-2.5 pl-10 pr-4 text-on-surface font-body-sm focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all text-sm"
          />
        </div>

        {/* Status Filter tabs */}
        <div className="flex gap-2 bg-surface-container-high/40 p-1 rounded-full border border-outline-variant/15 self-start md:self-center">
          {['ALL', 'COMPLETED', 'CANCELLED'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-1.5 rounded-full font-label-caps text-[10px] font-bold tracking-wider transition-all uppercase ${
                statusFilter === status 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'text-on-surface-variant hover:text-primary hover:bg-surface-variant/10'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Logs Table */}
      <div className="glass-panel rounded-xl p-6 shadow-2xl border-outline-variant/10 overflow-x-auto">
        <table className="w-full text-left min-w-[750px]">
          <thead>
            <tr className="text-on-surface-variant/60 font-label-caps text-label-caps text-[11px] bg-surface-container-low/50 rounded-lg">
              <th className="p-4 font-semibold rounded-l-lg">Operation ID</th>
              <th className="p-4 font-semibold">Date Logged</th>
              <th className="p-4 font-semibold">Service Rendered</th>
              <th className="p-4 font-semibold">Vehicle Rescued</th>
              <th className="p-4 font-semibold">Operational Status</th>
              <th className="p-4 font-semibold text-right rounded-r-lg">Billing Cost</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-body-sm">
            {filteredIncidents.length > 0 ? (
              filteredIncidents.map((incident, idx) => (
                <tr 
                  key={incident.id} 
                  className={`${idx % 2 === 1 ? 'bg-surface-container-low/20' : ''} border-b border-outline-variant/5 hover:bg-surface-container-low/40 transition-colors`}
                >
                  <td className="p-4 text-primary font-label-caps text-label-caps text-xs font-semibold">{incident.id}</td>
                  <td className="p-4 text-on-surface">{incident.date}</td>
                  <td className="p-4 text-on-surface font-medium">{incident.service}</td>
                  <td className="p-4 text-on-surface-variant">{incident.vehicle}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-label-caps text-[9px] font-bold ${
                      incident.status === 'COMPLETED'
                        ? 'bg-primary/10 border border-primary/20 text-primary shadow-[0_0_10px_rgba(0,242,255,0.05)]'
                        : 'bg-secondary/10 border border-secondary/20 text-secondary'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${incident.status === 'COMPLETED' ? 'bg-primary animate-pulse' : 'bg-secondary'}`}></span>
                      {incident.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-on-surface font-label-caps text-label-caps text-xs font-bold">{incident.cost}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-12 text-center text-on-surface-variant/60 font-body-sm flex-col gap-3">
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <span className="material-symbols-outlined text-[48px] text-on-surface-variant/40">receipt_long</span>
                    <p className="font-semibold text-sm">No operation logs match your search filters.</p>
                    <p className="text-xs text-on-surface-variant/50">Clear filters or try searching for another term.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
    </div>
  );
}
