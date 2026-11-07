import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
  Store,
  Bell,
  User,
  Truck,
  Save,
  Info,
  CheckCircle2,
  PackageCheck,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { testShiprocketConnection, SHIPROCKET_CONFIG } from '../services/shiprocketService';

interface SettingsPageProps {
  defaultTab?: 'store' | 'shipping' | 'notifications' | 'admin';
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ defaultTab }) => {
  const { settings, updateSettings } = useAdmin();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();

  const queryTab = searchParams.get('tab') as 'store' | 'shipping' | 'notifications' | 'admin' | null;
  const initialTab = (queryTab && ['store', 'shipping', 'notifications', 'admin'].includes(queryTab))
    ? queryTab
    : (defaultTab || 'shipping');

  const [activeTab, setActiveTab] = useState<'store' | 'shipping' | 'notifications' | 'admin'>(initialTab);

  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [defaultTab]);

  useEffect(() => {
    if (queryTab && ['store', 'shipping', 'notifications', 'admin'].includes(queryTab)) {
      setActiveTab(queryTab);
    }
  }, [queryTab]);

  // Local draft state - Store Profile
  const [storeName, setStoreName] = useState(settings.storeProfile?.storeName || 'Godavari Organic Foods');
  const [supportEmail, setSupportEmail] = useState(settings.storeProfile?.supportEmail || 'care@godavariorganic.in');
  const [supportPhone, setSupportPhone] = useState(settings.storeProfile?.supportPhone || '+91 883 249 9811');
  const [address, setAddress] = useState(settings.storeProfile?.address || 'Survey 142/A, Riverbank Road, Kateru Rural');
  const [city, setCity] = useState(settings.storeProfile?.city || 'Rajahmundry');
  const [state, setState] = useState(settings.storeProfile?.state || 'Andhra Pradesh');
  const [pincode, setPincode] = useState(settings.storeProfile?.pincode || '533105');
  const [gstNumber, setGstNumber] = useState(settings.storeProfile?.gstNumber || '37AAACG1984Q1Z7');
  const [fssaiLicense, setFssaiLicense] = useState(settings.storeProfile?.fssaiLicense || '10123028000419');

  // Local draft state - Shipping & Delivery (Customizable Free Shipping Threshold)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    (settings.shipping?.freeShippingThreshold ?? 1000).toString()
  );
  const [isShippingSaved, setIsShippingSaved] = useState(false);

  // Dedicated Save Shipping Threshold
  const handleSaveShippingOnly = () => {
    const thresholdNum = Number(freeShippingThreshold) > 0 ? Number(freeShippingThreshold) : 1000;
    updateSettings({
      shipping: {
        freeShippingThreshold: thresholdNum,
      },
    });
    setIsShippingSaved(true);
    showToast(
      `Free shipping order threshold set to ₹${thresholdNum.toLocaleString('en-IN')}. Connected to customer storefront in real time.`,
      'success',
      'Free Shipping Saved'
    );
    setTimeout(() => setIsShippingSaved(false), 4000);
  };

  // Local draft state - Shiprocket Logistics Integration
  const [shiprocketEmail, setShiprocketEmail] = useState(
    settings.shiprocket?.email || SHIPROCKET_CONFIG.DEFAULT_EMAIL
  );
  const [shiprocketPassword, setShiprocketPassword] = useState(
    settings.shiprocket?.password || SHIPROCKET_CONFIG.DEFAULT_PASSWORD
  );
  const [shiprocketPickup, setShiprocketPickup] = useState(
    settings.shiprocket?.pickupLocation || SHIPROCKET_CONFIG.DEFAULT_PICKUP_LOCATION
  );
  const [showShiprocketPassword, setShowShiprocketPassword] = useState(false);
  const [isTestingShiprocket, setIsTestingShiprocket] = useState(false);
  const [isShiprocketSaved, setIsShiprocketSaved] = useState(false);
  const [shiprocketTestResult, setShiprocketTestResult] = useState<{
    success: boolean;
    companyName?: string;
    pickupCount?: number;
    message?: string;
  } | null>(null);

  const handleTestShiprocket = async () => {
    setIsTestingShiprocket(true);
    setShiprocketTestResult(null);
    try {
      const res = await testShiprocketConnection({
        email: shiprocketEmail,
        password: shiprocketPassword,
        pickupLocation: shiprocketPickup,
      });
      setShiprocketTestResult({
        success: true,
        companyName: res.companyName,
        pickupCount: res.pickupLocations.length,
      });
      showToast(
        `Shiprocket API connected! Authenticated as ${res.companyName} (${res.pickupLocations.length} pickup warehouse active).`,
        'success',
        'Shiprocket Active'
      );
    } catch (err: any) {
      setShiprocketTestResult({
        success: false,
        message: err.message || 'Authentication failed',
      });
      showToast(
        err.message || 'Shiprocket test connection failed. Please verify credentials.',
        'error',
        'Shiprocket Connection Error'
      );
    } finally {
      setIsTestingShiprocket(false);
    }
  };

  const handleSaveShiprocket = () => {
    updateSettings({
      shiprocket: {
        enabled: true,
        email: shiprocketEmail,
        password: shiprocketPassword,
        pickupLocation: shiprocketPickup,
      },
    });
    setIsShiprocketSaved(true);
    showToast('Shiprocket credentials saved successfully.', 'success', 'Saved');
    setTimeout(() => setIsShiprocketSaved(false), 4000);
  };

  // Local draft state - Notifications
  const [orderAlerts, setOrderAlerts] = useState(settings.notifications?.orderAlerts ?? true);
  const [lowStockAlerts, setLowStockAlerts] = useState(settings.notifications?.lowStockAlerts ?? true);
  const [customerInquiries, setCustomerInquiries] = useState(settings.notifications?.customerInquiries ?? true);
  const [dailyDigest, setDailyDigest] = useState(settings.notifications?.dailyDigest ?? true);
  const [lowStockThreshold, setLowStockThreshold] = useState(
    (settings.notifications?.lowStockThreshold ?? 15).toString()
  );

  // Local draft state - Admin Profile
  const [adminName, setAdminName] = useState(settings.adminProfile?.name || 'Srinivas Rao Vaddi');
  const [adminEmail, setAdminEmail] = useState(settings.adminProfile?.email || 'srinivas.rao@godavariorganic.in');
  const [adminPhone, setAdminPhone] = useState(settings.adminProfile?.phone || '+91 94401 22849');
  const [adminRole, setAdminRole] = useState(settings.adminProfile?.role || 'Store Operations Director');

  // Save changes
  const handleSaveSettings = () => {
    const thresholdNum = Number(freeShippingThreshold) > 0 ? Number(freeShippingThreshold) : 1000;

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
      shipping: {
        freeShippingThreshold: thresholdNum,
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
    });

    showToast('Settings saved successfully! Storefront will update dynamically.', 'success', 'Settings Saved');
  };

  const parsedThreshold = Number(freeShippingThreshold) || 1000;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#103b1d] font-heading">
            Store Settings & Configuration
          </h2>
          <p className="text-xs sm:text-sm text-[#5a6e54] mt-0.5">
            Configure free shipping thresholds, store profile, legal compliance, and order alerts.
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

      {/* Persistent Note Banner */}
      <div className="p-4 rounded-2xl bg-[#E8F0EB]/60 border border-[#C0D6C8] flex items-start gap-3">
        <Info className="w-5 h-5 text-[#18542a] shrink-0 mt-0.5" />
        <div className="text-xs text-[#103b1d]">
          <span className="font-semibold text-[#103b1d] block mb-0.5">
            Real-Time Storefront Synchronization
          </span>
          All shipping thresholds, business details, and notifications are synchronized directly with Firebase Firestore in real time.
        </div>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-[#dfd5bf] gap-2 pb-px text-xs font-semibold">
        {[
          { key: 'shipping', label: 'Shipping & Free Delivery', icon: Truck },
          { key: 'store', label: 'Store Profile & Legal', icon: Store },
          { key: 'notifications', label: 'Alerts & Notifications', icon: Bell },
          { key: 'admin', label: 'Admin Account', icon: User },
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

      {/* Tab: Shipping & Free Delivery (Customizable Free Threshold Only) */}
      {activeTab === 'shipping' && (
        <div className="space-y-6">
          <Card className="space-y-5">
            <div className="border-b border-[#dfd5bf] pb-3 flex items-start justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#103b1d] flex items-center gap-2">
                  <Truck className="w-5 h-5 text-[#18542a]" />
                  Customizable Free Shipping Price
                </h3>
                <p className="text-xs text-[#5a6e54] mt-0.5">
                  Set the exact minimum order value required for free delivery. Once confirmed and saved, this price instantly updates on the customer storefront.
                </p>
              </div>
            </div>

            <div className="max-w-xl text-xs space-y-4">
              <div className="bg-[#FAF5EA] p-5 rounded-2xl border border-[#dfd5bf]/80 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[#103b1d] text-sm">
                    Free Shipping Minimum Order Value (₹)
                  </label>
                  <span className="text-[11px] font-semibold text-[#18542a] bg-[#e8f0eb] px-2.5 py-0.5 rounded-full border border-[#c0d6c8]">
                    Live Connected
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-base font-bold text-[#18542a]">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="50"
                    value={freeShippingThreshold}
                    onChange={(e) => {
                      setFreeShippingThreshold(e.target.value);
                      setIsShippingSaved(false);
                    }}
                    placeholder="e.g. 1000 or 1500"
                    className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-[#dfd5bf] bg-white text-base font-extrabold text-[#103b1d] focus:outline-none focus:ring-2 focus:ring-[#18542a]"
                  />
                </div>

                <p className="text-[11px] text-[#5a6e54] leading-relaxed">
                  Customer orders totaling <strong className="text-[#18542a]">₹{parsedThreshold.toLocaleString('en-IN')}</strong> or higher automatically qualify for <strong className="text-emerald-700 font-bold">100% Free Shipping</strong>. When the cart is below this amount, customers are notified how much more to add to unlock free delivery.
                </p>

                {/* Confirm & Save Button */}
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Button
                    variant="primary"
                    onClick={handleSaveShippingOnly}
                    icon={<Save className="w-4 h-4" />}
                    className="px-5 py-2.5 font-bold text-xs shadow-xs"
                  >
                    Confirm & Save Free Shipping Price (₹{parsedThreshold.toLocaleString('en-IN')})
                  </Button>

                  {isShippingSaved && (
                    <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Saved & connected to customer page!
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Shiprocket Logistics & Courier Integration Card */}
          <Card className="space-y-5">
            <div className="border-b border-[#dfd5bf] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[#103b1d] flex items-center gap-2">
                  <PackageCheck className="w-5 h-5 text-[#18542a]" />
                  Shiprocket Logistics & Automated Shipping
                </h3>
                <p className="text-xs text-[#5a6e54] mt-0.5">
                  Direct connection with Shiprocket API v2 for automated courier assignment (Delhivery, Blue Dart, DTDC), AWB tracking, and thermal shipping labels.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                  Live Connected
                </span>
              </div>
            </div>

            {/* Warehouse Information Strip */}
            <div className="bg-[#FAF5EA] p-4 rounded-xl border border-[#dfd5bf] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <p className="font-bold text-[#103b1d] flex items-center gap-1.5">
                  <span>Registered Pickup Warehouse:</span>
                  <span className="text-[#18542a] underline font-extrabold">{shiprocketPickup}</span>
                </p>
                <p className="text-[#5a6e54]">
                  Godavari Organic Foods, NR Peta, beside more super market, Eluru, Andhra Pradesh - 534007
                </p>
              </div>
              <a
                href="https://app.shiprocket.in"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#18542a] hover:underline whitespace-nowrap self-start sm:self-auto"
              >
                Open Shiprocket Dashboard
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Credentials Form */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#103b1d] mb-1">
                  Shiprocket API Email
                </label>
                <input
                  type="email"
                  value={shiprocketEmail}
                  onChange={(e) => {
                    setShiprocketEmail(e.target.value);
                    setIsShiprocketSaved(false);
                  }}
                  placeholder="api@armafarms.com"
                  className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-medium text-[#103b1d] focus:outline-none focus:ring-1 focus:ring-[#18542a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#103b1d] mb-1">
                  Shiprocket API Password
                </label>
                <div className="relative">
                  <input
                    type={showShiprocketPassword ? 'text' : 'password'}
                    value={shiprocketPassword}
                    onChange={(e) => {
                      setShiprocketPassword(e.target.value);
                      setIsShiprocketSaved(false);
                    }}
                    placeholder="••••••••••••••••"
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-[#dfd5bf] bg-white font-mono text-xs font-medium text-[#103b1d] focus:outline-none focus:ring-1 focus:ring-[#18542a]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowShiprocketPassword(!showShiprocketPassword)}
                    className="absolute right-2.5 top-2.5 text-[#5a6e54] hover:text-[#103b1d]"
                  >
                    {showShiprocketPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#103b1d] mb-1">
                  Pickup Location Nickname
                </label>
                <input
                  type="text"
                  value={shiprocketPickup}
                  onChange={(e) => {
                    setShiprocketPickup(e.target.value);
                    setIsShiprocketSaved(false);
                  }}
                  placeholder="Primary"
                  className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-medium text-[#103b1d] focus:outline-none focus:ring-1 focus:ring-[#18542a]"
                />
              </div>
            </div>

            {/* Test Connection Result Notice */}
            {shiprocketTestResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                  shiprocketTestResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    className={`w-4 h-4 ${
                      shiprocketTestResult.success ? 'text-emerald-600' : 'text-red-500'
                    }`}
                  />
                  <span>
                    {shiprocketTestResult.success
                      ? `API Handshake Successful: Verified with ${shiprocketTestResult.companyName} (${shiprocketTestResult.pickupCount} pickup warehouses active)`
                      : `Connection Test Failed: ${shiprocketTestResult.message}`}
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Button
                variant="secondary"
                onClick={handleTestShiprocket}
                disabled={isTestingShiprocket}
                icon={
                  <RefreshCw
                    className={`w-4 h-4 text-[#18542a] ${isTestingShiprocket ? 'animate-spin' : ''}`}
                  />
                }
                className="text-xs font-semibold px-4 py-2"
              >
                {isTestingShiprocket ? 'Testing API...' : 'Test Shiprocket Connection'}
              </Button>

              <Button
                variant="primary"
                onClick={handleSaveShiprocket}
                icon={<Save className="w-4 h-4" />}
                className="text-xs font-bold px-4 py-2"
              >
                Save Shiprocket Settings
              </Button>

              {isShiprocketSaved && (
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Credentials saved & synchronized!
                </span>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab: Store Profile & Legal */}
      {activeTab === 'store' && (
        <Card className="space-y-5">
          <div className="border-b border-[#dfd5bf] pb-3">
            <h3 className="text-base font-semibold text-[#103b1d]">
              Store Profile & Compliance
            </h3>
            <p className="text-xs text-[#5a6e54]">
              Official organic business registry in Andhra Pradesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">
                Legal Store Business Name
              </label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">
                FSSAI License Registration #
              </label>
              <input
                type="text"
                value={fssaiLicense}
                onChange={(e) => setFssaiLicense(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">
                GSTIN Identification Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">
                Support Phone Number
              </label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">
                Customer Support Email
              </label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">
                Registered Street Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-[#103b1d] mb-1">City / District</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
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

      {/* Tab: Alerts & Notifications */}
      {activeTab === 'notifications' && (
        <Card className="space-y-5">
          <div className="border-b border-[#dfd5bf] pb-3">
            <h3 className="text-base font-semibold text-[#103b1d]">
              Inventory & Order Notification Rules
            </h3>
            <p className="text-xs text-[#5a6e54]">
              Select which operational events trigger alerts in your notification center.
            </p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">New Customer Order Alerts</span>
                <span className="text-[#5a6e54]">Real-time bell notification for every incoming order.</span>
              </div>
              <input
                type="checkbox"
                checked={orderAlerts}
                onChange={(e) => setOrderAlerts(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">Low Stock Threshold Warnings</span>
                <span className="text-[#5a6e54]">Warn when any product inventory drops to critical level.</span>
              </div>
              <input
                type="checkbox"
                checked={lowStockAlerts}
                onChange={(e) => setLowStockAlerts(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4 cursor-pointer"
              />
            </div>

            {lowStockAlerts && (
              <div className="p-3 rounded-xl border border-[#dfd5bf] bg-[#FAF5EA] space-y-1">
                <label className="block font-semibold text-[#103b1d]">Low Stock Alert Threshold (Units)</label>
                <input
                  type="number"
                  value={lowStockThreshold}
                  onChange={(e) => setLowStockThreshold(e.target.value)}
                  className="w-32 px-3 py-1.5 rounded-xl border border-[#dfd5bf] bg-white font-medium"
                />
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-xl border border-[#dfd5bf] bg-white">
              <div>
                <span className="font-semibold text-[#103b1d] block">Customer Support Inquiries</span>
                <span className="text-[#5a6e54]">Alert for product queries and contact form entries.</span>
              </div>
              <input
                type="checkbox"
                checked={customerInquiries}
                onChange={(e) => setCustomerInquiries(e.target.checked)}
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4 cursor-pointer"
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
                className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-4 h-4 cursor-pointer"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Tab: Admin Profile */}
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
    </div>
  );
};
