import React, { useState } from 'react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Store,
  Bell,
  User,
  Sliders,
  Save,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useAdmin();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'store' | 'notifications' | 'admin' | 'preferences'>('store');

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

    showToast('Settings saved successfully.', 'success', 'Settings Saved');
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#103b1d] font-heading">
            Store Settings & Configuration
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6e54] mt-0.5">
            Configure store business details, tax/FSSAI compliance, alerts, and admin preferences.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
        <Info className="w-5 h-5 text-[#18542a] shrink-0 mt-0.5" />
        <div className="text-xs text-[#103b1d]">
          <span className="font-semibold text-[#103b1d] block mb-0.5">
            Frontend Configuration
          </span>
          All preferences, business profile data, and settings are saved securely.
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-[#dfd5bf] gap-2 pb-px text-xs font-semibold">
        {[
          { key: 'store', label: 'Store Profile & Legal', icon: Store },
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
                  ? 'border-[#18542a] text-[#18542a] bg-white rounded-t-xl font-bold'
                  : 'border-transparent text-[#5a6e54] hover:text-[#103b1d] hover:bg-white/40'
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
          <div className="border-b border-[#dfd5bf] pb-3">
            <h3 className="text-base font-semibold text-[#103b1d]">
              Store Profile & Compliance
            </h3>
            <p className="text-xs text-[#5a6e54]">
              Fictional organic business registry in Andhra Pradesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Customer Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Helpline Phone</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">GSTIN Number</label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#103b1d] mb-1">FSSAI Organic Food License</label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#103b1d] mb-1">Central Warehouse & Mill Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#103b1d] mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#103b1d] mb-1">PIN Code</label>
                <input
                  type="text"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-mono"
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Tab 2: Notifications */}
      {activeTab === 'notifications' && (
        <Card className="space-y-5">
          <div className="border-b border-[#dfd5bf] pb-3">
            <h3 className="text-base font-semibold text-[#103b1d]">
              Operational Alert Preferences
            </h3>
            <p className="text-xs text-[#5a6e54]">
              Configure internal simulated dashboard notifications and triggers.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">New Order Notifications</span>
                <span className="text-[#5a6e54]">Display toast and bell alert when simulated purchases arrive.</span>
              </div>
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">Low Stock Alert Notifications</span>
                <span className="text-[#5a6e54]">Send automated warnings when inventory reaches low threshold.</span>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">Low Stock Alert Threshold</span>
                <span className="text-[#5a6e54]">Trigger warnings when product inventory dips below this count.</span>
              </div>
              <input
                type="number"
                min="1"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(e.target.value)}
                className="w-20 px-2.5 py-1 text-center font-bold rounded-lg border border-[#dfd5bf] bg-white"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">VIP Customer Activity</span>
                <span className="text-[#5a6e54]">Flag orders from high-spend returning natural pantry patrons.</span>
              </div>
              <input
                type="checkbox"
                checked={customerInquiries}
                onChange={(e) => setCustomerInquiries(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">Daily Morning Digest</span>
                <span className="text-[#5a6e54]">Prepare day summary of revenue and pending deliveries.</span>
              </div>
              <input
                type="checkbox"
                checked={dailyDigest}
                onChange={(e) => setDailyDigest(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 4: Admin Profile */}
      {activeTab === 'admin' && (
        <Card className="space-y-5">
          <div className="border-b border-[#dfd5bf] pb-3">
            <h3 className="text-base font-semibold text-[#103b1d]">
              Store Administrator Profile
            </h3>
            <p className="text-xs text-[#5a6e54]">
              Identity of the active store operations supervisor.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Full Name</label>
              <input
                type="text"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Email Address</label>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Phone Number</label>
              <input
                type="text"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Role / Designation</label>
              <input
                type="text"
                value={adminRole}
                onChange={(e) => setAdminRole(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab 5: UI Preferences */}
      {activeTab === 'preferences' && (
        <Card className="space-y-5">
          <div className="border-b border-[#dfd5bf] pb-3">
            <h3 className="text-base font-semibold text-[#103b1d]">
              UI & Formatting Preferences
            </h3>
            <p className="text-xs text-[#5a6e54]">
              Regional formatting and table rendering density.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Store Currency</label>
              <input
                type="text"
                value="Indian Rupee (₹ INR) — Locked by Brief"
                disabled
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-[#faf5ea] text-[#5a6e54] font-semibold cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Date Display Format</label>
              <select
                value={dateFormat}
                onChange={(e) => setDateFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 22/10/2026)</option>
                <option value="D MMM YYYY">D MMM YYYY (e.g. 22 Oct 2026)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">Table Row Density</label>
              <select
                value={tableDensity}
                onChange={(e) => setTableDensity(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              >
                <option value="comfortable">Comfortable (Roomy whitespace)</option>
                <option value="compact">Compact (High data density)</option>
              </select>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
