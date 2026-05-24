import { useState } from 'react';
import { updateProfileApi } from '../utils/api';

export default function Settings({ currentUser, setCurrentUser, triggerToast, setPage }) {
  const [activeSubTab, setActiveSubTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  // Form states
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [profilePhoto, setProfilePhoto] = useState(currentUser?.avatar || currentUser?.profilePhoto || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Preset Premium Avatars to give the user excellent high-end graphics presets out of the box
  const avatarPresets = [
    { name: 'Cyber Operator', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsh4C5iHWzKRxWfShZVM8eiZPzMc3kWhiM5zSVvj0-DX00SRwdrB7Z5JaWl1boPu-27zdJYJqPhMKCamr0tHZtxdAothXlGLbuCQaQhXAwfvi0BHd-JqukyDfSm_uO2tfYrddJJKONqbw8ss5DKjBQz0XCA6wB3xFhvBD8AEYpATSUB_3LlXs1jGgMpcCWUwq9wgwp2zHMLsw1XPjHf_l8sUGP5kenHyHymqAADctVFcT1HLdutUTLiwrvxumCiMPoGifpYxVB6pU' },
    { name: 'Logistics Lead', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuByN0gReMf2EVTRsGvzJIfQkt4dNkMtXxe95dlSRKbikVzLy0AcAOwpM8ZcNBrFQ_I1kRs1s2PtxHKbUJOYvRCsPXgsbIX6REt6qWqmgb_wcVrGeD5fgoT_mjpGjtNTGEKoxy9KYXCDW5Ox6kZjGV5MtsQWklnzS9LmIWqE6Cm6gyUOKmeVudbUAPl0iV_uBYpPci72bBQXJB0QeCEejv0N6T4A9vOMdgQ69sVufeLcbdn-9BSy4HrLTxe1RK7Sug46W8CnkJcD7f0' },
    { name: 'Rescue Driver', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQvr_HDAe8dIuPOCeH_hCSd8oy2NmxlGvMzAXNKZDtXqxmAQgsaGSbBp5nFz1F94bhRK9iZRp1PDfy-7_3e-n4HIisgKFOcvr6pG4Cv4oPIneIbmFH9Sqz2u75z1w8iPk2Z5oty9UnXzkmiSdHTB3bl_fJa8WUNPXSIxYtC-S6m6-wYXVBvz6dJYp08B6AZbwAhF4TX5NrkjgjyvQvPkZQY-4drXs-3zXAg-CXmBGaSn1SE_x-a1PCjSgYqcK0sA0xhEeAkhUcRX4' },
    { name: 'Dispatcher Commander', url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAtteiTI38b1NJDycNRcoMm37mgHStRt9jcFrGmvQybqzQs5a1Ur7j0E13oAdWbLhrrd-fmFg87cQSOqaxkbVmU6CnaIvYUIeAjEzWXp4w1Arizyci4LuinGdjCpDu80NtA7Kqae-KpB5sZhxdDMDBvhBpk1nk1avpYbgSSiiSPsDpAFCvIVwWOD6PW58usfJxvhMQruc8a08s3bFu-QrEpIY5qzqjSZVTfUOlVvOfbdG_sODiIMWkfgPsqahMA6FgzGPJ66qwTsC4' },
  ];

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateData = { name };
      
      // Stand-alone user specific fields
      if (currentUser?.role !== 'admin') {
        updateData.phone = phone;
        updateData.profilePhoto = profilePhoto;
      }

      const res = await updateProfileApi(updateData);
      
      if (res && res.success && res.user) {
        // Sync updated details with local storage and state
        localStorage.setItem('user', JSON.stringify(res.user));
        setCurrentUser(res.user);
        triggerToast("💚 Terminal profile database updated successfully!", "success");
      }
    } catch (err) {
      console.error("Profile update failed:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to save profile.";
      triggerToast(`❌ Update failed: ${errMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!password) {
      triggerToast("⚠️ Please enter a secure credentials passphrase.", "warning");
      return;
    }
    if (password !== confirmPassword) {
      triggerToast("❌ Passwords do not match. Integrity check failed.", "error");
      return;
    }
    if (password.length < 6) {
      triggerToast("❌ Passphrase must be at least 6 characters in length.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await updateProfileApi({ password });
      if (res && res.success) {
        setPassword('');
        setConfirmPassword('');
        triggerToast("🔑 Secure credentials ledger updated. New passphrase active.", "success");
      }
    } catch (err) {
      console.error("Password update failed:", err);
      const errMsg = err.response?.data?.message || err.message || "Failed to update credentials.";
      triggerToast(`❌ Credentials update failed: ${errMsg}`, "error");
    } finally {
      setLoading(false);
    }
  };

  const isEV = currentUser?.role === 'user';

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto w-full flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-4xl font-headline-lg gradient-text font-bold">Terminal Control</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant/80 mt-1">
            Manage your personal profile, credentials settings, and security overrides.
          </p>
        </div>
        <button 
          onClick={() => setPage('dashboard')}
          className="py-2.5 px-6 rounded-full border border-primary text-primary font-label-caps text-label-caps hover:bg-primary/10 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">dashboard</span>
          Dashboard
        </button>
      </div>

      {/* Main Settings Card */}
      <div className="glass-panel rounded-2xl shadow-2xl border-outline-variant/15 flex flex-col md:flex-row overflow-hidden min-h-[500px]">
        
        {/* Settings Left Tabs Sidebar */}
        <div className="w-full md:w-60 bg-surface-container-low/20 border-r border-outline-variant/10 p-4 flex flex-col gap-1 shrink-0">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-caps text-xs tracking-wider text-left transition-all ${
              activeSubTab === 'profile'
                ? 'bg-primary-container/10 text-primary font-bold border-l-4 border-primary'
                : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">person</span>
            Profile Settings
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-label-caps text-xs tracking-wider text-left transition-all ${
              activeSubTab === 'security'
                ? 'bg-primary-container/10 text-primary font-bold border-l-4 border-primary'
                : 'text-on-surface-variant hover:bg-surface-variant/20 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">lock</span>
            Terminal Passphrase
          </button>
        </div>

        {/* Settings Right Tab Pane */}
        <div className="flex-1 p-6 md:p-8">
          
          {activeSubTab === 'profile' ? (
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">person</span>
                  Profile Specifications
                </h3>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  These details will update your profile across the RoadRescue command structure.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4 max-w-xl">
                
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Full Operator Name</label>
                  <input 
                    type="text" 
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Elena Mercer"
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                {/* Email (Read Only) */}
                <div className="flex flex-col gap-1.5 opacity-70 cursor-not-allowed">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Secure Email Address (Read-only)</label>
                  <div className="bg-surface-container border border-outline-variant/20 text-on-surface-variant rounded p-3 text-sm select-none">
                    {currentUser?.email}
                  </div>
                </div>

                {/* Phone (Only for consumers) */}
                {currentUser?.role !== 'admin' && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Emergency Phone Contact</label>
                    <input 
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +1 (555) 242-2550"
                      className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                    />
                  </div>
                )}

                {/* Profile Photo Selection (Only for consumers) */}
                {currentUser?.role !== 'admin' && (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Profile Photo URL</label>
                      <input 
                        type="url"
                        value={profilePhoto}
                        onChange={(e) => setProfilePhoto(e.target.value)}
                        placeholder="Paste image URL..."
                        className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                      />
                    </div>

                    {/* Presets Selection */}
                    <div className="flex flex-col gap-2 bg-surface-container-low/40 p-3.5 rounded-lg border border-outline-variant/10">
                      <span className="text-[9px] font-label-caps font-bold tracking-widest text-on-surface-variant/70 uppercase">Or select preset premium avatar:</span>
                      <div className="flex gap-4 mt-2">
                        {avatarPresets.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setProfilePhoto(preset.url)}
                            title={preset.name}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 relative hover:scale-105 transition-transform flex-shrink-0 ${
                              profilePhoto === preset.url ? 'border-primary shadow-[0_0_10px_rgba(0,242,255,0.4)]' : 'border-outline-variant/40 hover:border-primary/50'
                            }`}
                          >
                            <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 py-3 px-6 rounded bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-xs font-bold tracking-wider hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 self-start"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">cached</span>
                      Syncing Database...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      Save Profile Specifications
                    </>
                  )}
                </button>

              </form>
            </div>
          ) : (
            /* Passphrase settings Tab */
            <div className="flex flex-col gap-6 animate-in fade-in duration-200">
              <div>
                <h3 className="text-xl font-title-md font-bold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">lock</span>
                  Terminal Credentials Overrides
                </h3>
                <p className="text-xs text-on-surface-variant/70 mt-1">
                  Change the secure terminal passphrase used to cryptographically sign into your operator account.
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="flex flex-col gap-4 max-w-xl">
                
                {/* New Passphrase */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">New Terminal Passphrase</label>
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters..."
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                {/* Confirm Passphrase */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-label-caps font-bold tracking-widest text-on-surface-variant">Confirm New Passphrase</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat passphrase exactly..."
                    className="bg-surface-container border border-outline-variant/30 text-on-surface rounded p-3 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                  />
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 py-3 px-6 rounded bg-gradient-to-r from-primary-container to-primary text-on-primary-container font-label-caps text-xs font-bold tracking-wider hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all flex items-center justify-center gap-2 self-start"
                >
                  {loading ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] animate-spin">cached</span>
                      Updating Secure Keys...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">vpn_key</span>
                      Re-encrypt Terminal Credentials
                    </>
                  )}
                </button>

              </form>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
