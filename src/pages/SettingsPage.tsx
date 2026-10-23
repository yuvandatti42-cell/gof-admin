import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import {
  Store,
  Palette,
  Bell,
  User,
  Sliders,
  RotateCcw,
  Save,
  Info,
} from 'lucide-react';


export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetToDemoData } = useAdmin();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'store' | 'appearance' | 'notifications' | 'admin' | 'preferences'>('store');
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Local draft state
  const [storeName, setStoreName] = useState(settings.storeProfile.storeName);
  const [supportEmail, setSupportEmail] = useState(settings.storeProfile.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.storeProfile.supportPhone);
  const [address, setAddress] = useState(settings.storeProfile.address);
  const [city, setCity] = useState(settings.storeProfile.city);
  const [state, setState] = useState(settings.storeProfile.state);
  const [pincode, setPincode] = useState(settings.storeProfile.pincode);
  const [gstNumber, setGstNumber] = useState(settings.storeProfile.gstNumber);
  const [fssaiLicense, setFssaiLicense] = useState(settings.storeProfile.fssaiLicense);

  const [primaryAccent, setPrimaryAccent] = useState(settings.appearance.primaryAccent);
  const [tagline, setTagline] = useState(settings.appearance.tagline);

  const [orderAlerts, setOrderAlerts] = useState(settings.notifications.orderAlerts);
  const [lowStockAlerts, setLowStockAlerts] = useState(settings.notifications.lowStockAlerts);
  const [customerInquiries, setCustomerInquiries] = useState(settings.notifications.customerInquiries);
  const [dailyDigest, setDailyDigest] = useState(settings.notifications.dailyDigest);
  const [lowStockThreshold, setLowStockThreshold] = useState(settings.notifications.lowStockThreshold.toString());

  const [adminName, setAdminName] = useState(settings.adminProfile.name);
  const [adminEmail, setAdminEmail] = useState(settings.adminProfile.email);
  const [adminPhone, setAdminPhone] = useState(settings.adminProfile.phone);
  const [adminRole, setAdminRole] = useState(settings.adminProfile.role);

  const [dateFormat, setDateFormat] = useState(settings.preferences.dateFormat);
  const [tableDensity, setTableDensity] = useState(settings.preferences.tableDensity);

  // Save changes
  const handleSaveSettings = () => {
    updateSettings({
      storeProfile: {
        storeName,
        supportEmail,
        supportPhone,
        address,
        city,
        state,
        pincode,
        gstNumber,
        fssaiLicense,
      },
      appearance: {
        ...settings.appearance,
        primaryAccent,
        tagline,
      },
      notifications: {
        orderAlerts,
        lowStockAlerts,
        customerInquiries,
        dailyDigest,
        lowStockThreshold: Number(lowStockThreshold) || 15,
      },
      adminProfile: {
        name: adminName,
        email: adminEmail,
        phone: adminPhone,
        role: adminRole,
      },
      preferences: {
        currency: 'INR',
        dateFormat,
        tableDensity,
      },
    });

    showToast('Settings saved to local prototype storage.', 'success', 'Settings Saved');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#173D2A] font-heading">
            Store Settings & Configuration
          </h2>
          <p className="text-xs sm:text-sm text-[#737B72] mt-0.5">
            Configure store business details, tax/FSSAI compliance, alerts, and admin preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setIsResetConfirmOpen(true)}
            icon={<RotateCcw className="w-4 h-4 text-[#B7791F]" />}
          >
            Reset Demo Data
          </Button>

          <Button
            variant="primary"
            onClick={handleSaveSettings}
            icon={<Save className="w-4 h-4" />}
          >
            Save Settings
          </Button>
        </div>
      </div>

      {/* Persistent Note Banner (Required by DESIGN.MD) */}
      <div className="p-4 rounded-2xl bg-[#E8F0EB]/60 border border-[#C0D6C8] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#245C3A] shrink-0 mt-0.5" />
        <div className="text-xs text-[#202820]">
          <span className="font-semibold text-[#173D2A] block mb-0.5">
            Frontend Preview Configuration
          </span>
          All preferences, business profile data, and appearance variables are saved in your browser's local state. No real backend servers or API secrets are connected in this phase.
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-[#E5E8DF] gap-2 pb-px text-xs font-semibold">
        {[
          { key: 'store', label: 'Store Profile & Legal', icon: Store },
          { key: 'appearance', label: 'Appearance & Brand', icon: Palette },
          { key: 'notifications', label: 'Alerts & Notifications', icon: Bell },
          { key: 'admin', label: 'Admin Account', icon: User },
          { key: 'preferences', label: 'UI Preferences', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                isActive
                  ? 'border-[#245C3A] text-[#245C3A] bg-white rounded-t-xl font-bold'
                  : 'border-transparent text-[#737B72] hover:text-[#173D2A] hover:bg-white/40'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Store Profile & Legal */}
      {activeTab === 'store' && (
        <Card className="space-y-5">
          <div className="border-b border-[#E5E8DF] pb-3">
            <h3 className="text-base font-semibold text-[#173D2A]">
              Store Profile & Compliance
            </h3>
            <p className="text-xs text-[#737B72]">
              Fictional organic business registry in Andhra Pradesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Customer Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Helpline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#173D2A] mb-1">FSSAI Organic Food License</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#173D2A] mb-1">Central Warehouse & Mill Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#173D2A] mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Appearance & Brand */}
      {activeTab === 'appearance' && (
        <Card className="space-y-5">
          <div className="border-b border-[#E5E8DF] pb-3">
            <h3 className="text-base font-semibold text-[#173D2A]">
              Store Appearance & Brand Identity
            </h3>
            <p className="text-xs text-[#737B72]">
              Color accents strictly curated to preserve the organic forest aesthetic.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-2">
                Brand Primary Accent (Restricted Palette)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { name: 'Forest Green (Primary)', hex: '#245C3A' },
                  { name: 'Deep Organic Green', hex: '#173D2A' },
                  { name: 'Leaf Accent Green', hex: '#6F9F62' },
                ].map((color) => (
                  <button
                    key={color.hex}
                    type="button"
                    onClick={() => setPrimaryAccent(color.hex)}
                    className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${
                      primaryAccent === color.hex
                        ? 'border-[#245C3A] ring-2 ring-[#245C3A]/20 bg-white shadow-2xs'
                        : 'border-[#E5E8DF] bg-[#FAF9F4] hover:bg-white'
                    }`}
                  >
                    <span
                      className="w-5 h-5 rounded-lg shrink-0 border border-black/10"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-semibold text-[#173D2A]">{color.name}</span>
                    <span className="font-mono text-[#737B72]">{color.hex}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white sm:max-w-md"
              />
            </div>

            {/* Logo Preview */}
            <div className="pt-3 border-t border-[#E5E8DF]">
              <span className="block font-semibold text-[#173D2A] mb-2">Store Brandmark Preview</span>
              <div className="p-4 rounded-xl border border-[#E5E8DF] bg-[#FAF9F4] inline-flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-white border border-[#DDD6C5] shadow-xs flex items-center justify-center p-0.5 shrink-0">
                  <img
                    src="/logo.png"
                    alt="Godavari Organics Logo"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#173D2A]">Godavari Organic Foods</h4>
                  <p className="text-[11px] text-[#737B72]">{tagline}</p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 3: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="space-y-5">
          <div className="border-b border-[#E5E8DF] pb-3">
            <h3 className="text-base font-semibold text-[#173D2A]">
              Operational Alert Preferences
            </h3>
            <p className="text-xs text-[#737B72]">
              Configure internal simulated dashboard notifications and triggers.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8DF] bg-white">
              <div>
                <span className="font-semibold text-[#173D2A] block">New Order Notifications</span>
                <span className="text-[#737B72]">Display toast and bell alert when simulated purchases arrive.</span>
              </div>
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="rounded border-[#E5E8DF] text-[#245C3A] focus:ring-[#245C3A] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8DF] bg-white">
              <div>
                <span className="font-semibold text-[#173D2A] block">Low Stock Alert Notifications</span>
                <span className="text-[#737B72]">Send automated warnings when inventory reaches low threshold.</span>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="rounded border-[#E5E8DF] text-[#245C3A] focus:ring-[#245C3A] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8DF] bg-white">
              <div>
                <span className="font-semibold text-[#173D2A] block">Low Stock Alert Threshold</span>
                <span className="text-[#737B72]">Trigger warnings when product inventory dips below this count.</span>
              </div>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-20 px-2.5 py-1 text-center font-bold rounded-lg border border-[#E5E8DF] bg-white"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8DF] bg-white">
              <div>
                <span className="font-semibold text-[#173D2A] block">VIP Customer Activity</span>
                <span className="text-[#737B72]">Flag orders from high-spend returning natural pantry patrons.</span>
              </div>
              <input
                type="checkbox"
                checked={customerInquiries}
                onChange={(e) => setCustomerInquiries(e.target.checked)}
                className="rounded border-[#E5E8DF] text-[#245C3A] focus:ring-[#245C3A] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#E5E8DF] bg-white">
              <div>
                <span className="font-semibold text-[#173D2A] block">Daily Morning Digest</span>
                <span className="text-[#737B72]">Prepare day summary of revenue and pending deliveries.</span>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="rounded border-[#E5E8DF] text-[#245C3A] focus:ring-[#245C3A] w-4 h-4"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Admin Profile */}
      {activeTab === 'admin' && (
        <Card className="space-y-5">
          <div className="border-b border-[#E5E8DF] pb-3">
            <h3 className="text-base font-semibold text-[#173D2A]">
              Store Administrator Profile
            </h3>
            <p className="text-xs text-[#737B72]">
              Identity of the active store operations supervisor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Full Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Phone Number</label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Role / Designation</label>
              <input
                type="text"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: UI Preferences */}
      {activeTab === 'preferences' && (
        <Card className="space-y-5">
          <div className="border-b border-[#E5E8DF] pb-3">
            <h3 className="text-base font-semibold text-[#173D2A]">
              UI & Formatting Preferences
            </h3>
            <p className="text-xs text-[#737B72]">
              Regional formatting and table rendering density.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Store Currency</label>
              <input
                type="text"
                value="Indian Rupee (₹ INR) — Locked by Brief"
                disabled
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-[#FAF9F4] text-[#737B72] font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Date Display Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 22/10/2026)</option>
                <option value="D MMM YYYY">D MMM YYYY (e.g. 22 Oct 2026)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#173D2A] mb-1">Table Row Density</label>
              <select
                value={tableDensity}
                onChange={(e) => setTableDensity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#E5E8DF] bg-white"
              >
                <option value="comfortable">Comfortable (Roomy whitespace)</option>
                <option value="compact">Compact (High data density)</option>
              </select>
            </div>
          </div>
        </Card>
      )}

      {/* Demo Data Reset Confirmation */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={() => {
          resetToDemoData();
          showToast('All demo records reset to pristine initial state.', 'info', 'Data Reset');
        }}
        title="Reset Entire Mock Dataset?"
        message="This will reset all modified products, categories, orders, customers, and settings back to their original mock state and wipe local changes."
        confirmText="Reset to Initial Data"
        variant="warning"
      />
    </div>
  );
};
