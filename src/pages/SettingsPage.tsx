import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
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
  Package,
  ExternalLink,
  Key,
  RefreshCw,
  AlertCircle,
  MapPin,
  ShieldCheck,
  Mail,
  Send,
  Eye,
  EyeOff,
} from 'lucide-react';
import { testShiprocketConnection } from '../services/shiprocketService';

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
  const [shiprocketEnabled, setShiprocketEnabled] = useState(settings.shiprocket?.enabled ?? true);
  const [shiprocketEmail, setShiprocketEmail] = useState(settings.shiprocket?.email || 'api@armafarms.com');
  const [shiprocketPassword, setShiprocketPassword] = useState(settings.shiprocket?.password || '7FyvlanWBRvoQRGltSU3@9yk$NSPSj28');
  const [shiprocketPickupLocation, setShiprocketPickupLocation] = useState(settings.shiprocket?.pickupLocation || 'Primary');
  const [isTestingShiprocket, setIsTestingShiprocket] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; locations?: string[] } | null>(null);
  const [isShiprocketSaved, setIsShiprocketSaved] = useState(false);

  const handleTestShiprocket = async () => {
    if (!shiprocketEmail || !shiprocketPassword) {
      showToast('Please enter both Shiprocket API user email and password first.', 'error', 'Missing Credentials');
      return;
    }
    setIsTestingShiprocket(true);
    setTestResult(null);
    try {
      const res = await testShiprocketConnection({
        email: shiprocketEmail.trim(),
        password: shiprocketPassword.trim(),
        pickupLocation: shiprocketPickupLocation.trim(),
      });
      const locationNames = (res.pickupLocations || []).map((l) => l.pickup_location || l.city || 'Primary');
      setTestResult({
        success: true,
        message: `Connected successfully to ${res.companyName}! Found ${locationNames.length} registered pickup address${locationNames.length === 1 ? '' : 'es'}.`,
        locations: locationNames,
      });
      showToast('Shiprocket API credentials verified successfully!', 'success', 'Connection Verified');
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Authentication failed. Please verify your API User Email and Password in Shiprocket.',
      });
      showToast(err.message || 'Shiprocket authentication failed', 'error', 'Connection Error');
    } finally {
      setIsTestingShiprocket(false);
    }
  };

  const handleSaveShiprocket = () => {
    updateSettings({
      shiprocket: {
        enabled: shiprocketEnabled,
        email: shiprocketEmail.trim(),
        password: shiprocketPassword.trim(),
        pickupLocation: shiprocketPickupLocation.trim() || 'Primary',
      },
      emailConfig: {
        enabled: emailConfigEnabled,
        gmailUser: gmailUser.trim(),
        gmailAppPassword: gmailAppPassword.trim(),
      },
    });
    setIsShiprocketSaved(true);
    showToast('Shiprocket credentials saved and active for order fulfillment!', 'success', 'Shiprocket Saved');
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

  // Local draft state - Automated Order Email (Gmail SMTP)
  const [emailConfigEnabled, setEmailConfigEnabled] = useState(settings.emailConfig?.enabled ?? true);
  const [gmailUser, setGmailUser] = useState(settings.emailConfig?.gmailUser || 'godhavariorganicfoods@gmail.com');
  const [gmailAppPassword, setGmailAppPassword] = useState(settings.emailConfig?.gmailAppPassword || '');
  const [testEmailRecipient, setTestEmailRecipient] = useState(settings.emailConfig?.gmailUser || 'godhavariorganicfoods@gmail.com');
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showAppPassword, setShowAppPassword] = useState(false);
  const [isEmailSaved, setIsEmailSaved] = useState(false);

  useEffect(() => {
    if (settings.emailConfig) {
      if (settings.emailConfig.enabled !== undefined) setEmailConfigEnabled(settings.emailConfig.enabled);
      if (settings.emailConfig.gmailUser) {
        setGmailUser(settings.emailConfig.gmailUser);
        setTestEmailRecipient(settings.emailConfig.gmailUser);
      }
      if (settings.emailConfig.gmailAppPassword) setGmailAppPassword(settings.emailConfig.gmailAppPassword);
    }
  }, [settings.emailConfig]);

  const handleTestEmail = async () => {
    if (!gmailAppPassword.trim()) {
      showToast('Please enter your 16-character Google App Password first.', 'error', 'Missing App Password');
      return;
    }
    setIsTestingEmail(true);
    setEmailTestResult(null);
    try {
      const res = await fetch('https://www.armafarms.com/api/send-order-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          test: true,
          recipient: testEmailRecipient.trim() || gmailUser.trim(),
          gmailUser: gmailUser.trim(),
          gmailAppPassword: gmailAppPassword.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEmailTestResult({
          success: true,
          message: `Test email sent successfully to ${testEmailRecipient.trim() || gmailUser}! Check your inbox.`,
        });
        showToast('Test email sent! Connection is active & verified.', 'success', 'Email Verified');
      } else {
        setEmailTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with Gmail SMTP. Check your 16-character App Password.',
        });
        showToast(data.error || 'Authentication failed', 'error', 'Email Test Failed');
      }
    } catch (err: any) {
      setEmailTestResult({
        success: false,
        message: err.message || 'Network error reaching email service.',
      });
      showToast(err.message || 'Connection failed', 'error', 'Email Service Error');
    } finally {
      setIsTestingEmail(false);
    }
  };

  const handleSaveEmailOnly = () => {
    updateSettings({
      emailConfig: {
        enabled: emailConfigEnabled,
        gmailUser: gmailUser.trim(),
        gmailAppPassword: gmailAppPassword.trim(),
      },
    });
    setIsEmailSaved(true);
    showToast('Gmail SMTP credentials saved! Order confirmation emails are active.', 'success', 'Email Settings Saved');
    setTimeout(() => setIsEmailSaved(false), 4000);
  };

  const { adminProfile: authAdminProfile, resetPassword } = useAuth();

  // Local draft state - Admin Profile
  const [adminName, setAdminName] = useState(
    settings.adminProfile?.name || authAdminProfile?.name || 'Yuvan Datti'
  );
  const [adminEmail, setAdminEmail] = useState(
    settings.adminProfile?.email || authAdminProfile?.email || 'admin@armafarms.com'
  );
  const [adminPhone, setAdminPhone] = useState(
    settings.adminProfile?.phone || authAdminProfile?.phone || '+91 90100 88063'
  );
  const [adminRole, setAdminRole] = useState(
    settings.adminProfile?.role || authAdminProfile?.role || 'Store Administrator'
  );
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);

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
      shiprocket: {
        enabled: shiprocketEnabled,
        email: shiprocketEmail.trim(),
        password: shiprocketPassword.trim(),
        pickupLocation: shiprocketPickupLocation.trim() || 'Primary',
      },
      emailConfig: {
        enabled: emailConfigEnabled,
        gmailUser: gmailUser.trim(),
        gmailAppPassword: gmailAppPassword.trim(),
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

          {/* Shiprocket Automated Logistics Card */}
          <Card className="space-y-5">
            <div className="border-b border-[#dfd5bf] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-[#103b1d] flex items-center gap-2">
                  <Package className="w-5 h-5 text-[#18542a]" />
                  Shiprocket Logistics & Automated Fulfillment
                </h3>
                <p className="text-xs text-[#5a6e54] mt-0.5">
                  Link your Shiprocket seller account to dispatch customer orders, assign courier partners (Delhivery, Blue Dart, DTDC), generate AWB tracking numbers, and print packing slips in 1-click.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-semibold text-[#103b1d]">
                  {shiprocketEnabled ? 'Fulfillment Active' : 'Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => setShiprocketEnabled(!shiprocketEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                    shiprocketEnabled ? 'bg-[#18542a]' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      shiprocketEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Step-by-Step Guide Accordion / Box */}
            <div className="bg-[#FAF5EA] p-4 rounded-xl border border-[#dfd5bf] text-xs space-y-2 text-[#344835]">
              <div className="flex items-center gap-2 font-bold text-[#103b1d]">
                <Info className="w-4 h-4 text-[#18542a] shrink-0" />
                <span>How to link your Shiprocket account:</span>
              </div>
              <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[11.5px] leading-relaxed text-[#4a5f45]">
                <li>
                  Open your <strong>Shiprocket Dashboard</strong> (<a href="https://app.shiprocket.in" target="_blank" rel="noopener noreferrer" className="text-[#18542a] underline font-bold inline-flex items-center gap-0.5">app.shiprocket.in <ExternalLink className="w-3 h-3" /></a>).
                </li>
                <li>
                  In the left sidebar, click <strong>Settings</strong> (the 🛠️ tool/wrench icon) &rarr; under <strong>Integrations</strong>, click <strong>API</strong>.
                </li>
                <li>
                  Click <strong>&ldquo;Add New User&rdquo;</strong> (or Create an API User). Enter an email & set a password, then click Save.
                </li>
                <li>
                  Copy that <strong>API User Email</strong> & <strong>Password</strong> and paste them into the fields below.
                </li>
                <li>
                  Verify your <strong>Pickup Address</strong> in Shiprocket (Settings &rarr; Pickup Addresses). Its nickname is usually <code>Primary</code>.
                </li>
              </ol>
            </div>

            {/* Credentials Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#103b1d] mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#18542a]" />
                  Shiprocket API User Email
                </label>
                <input
                  type="email"
                  value={shiprocketEmail}
                  onChange={(e) => {
                    setShiprocketEmail(e.target.value);
                    setIsShiprocketSaved(false);
                  }}
                  placeholder="e.g. api@godavariorganic.in or your shiprocket email"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#dfd5bf] bg-white text-xs font-mono text-[#103b1d] focus:outline-none focus:ring-2 focus:ring-[#18542a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#103b1d] mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#18542a]" />
                  Shiprocket API User Password
                </label>
                <input
                  type="password"
                  value={shiprocketPassword}
                  onChange={(e) => {
                    setShiprocketPassword(e.target.value);
                    setIsShiprocketSaved(false);
                  }}
                  placeholder="Enter API User password"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#dfd5bf] bg-white text-xs font-mono text-[#103b1d] focus:outline-none focus:ring-2 focus:ring-[#18542a]"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#103b1d] mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#18542a]" />
                  Pickup Location Nickname
                </label>
                <input
                  type="text"
                  value={shiprocketPickupLocation}
                  onChange={(e) => {
                    setShiprocketPickupLocation(e.target.value);
                    setIsShiprocketSaved(false);
                  }}
                  placeholder="e.g. Primary, Warehouse, Farm"
                  className="w-full px-3 py-2.5 rounded-xl border border-[#dfd5bf] bg-white text-xs font-medium text-[#103b1d] focus:outline-none focus:ring-2 focus:ring-[#18542a]"
                />
                <p className="text-[10.5px] text-[#5a6e54] mt-1">
                  Must match the Pickup Location nickname configured in Shiprocket. Default is &quot;Primary&quot;.
                </p>
              </div>

              <div className="flex flex-col justify-end">
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestShiprocket}
                    disabled={isTestingShiprocket}
                    icon={<RefreshCw className={`w-3.5 h-3.5 ${isTestingShiprocket ? 'animate-spin' : ''}`} />}
                    className="py-2.5 px-4 text-xs font-bold cursor-pointer"
                  >
                    {isTestingShiprocket ? 'Testing...' : 'Test Connection'}
                  </Button>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveShiprocket}
                    icon={<Save className="w-3.5 h-3.5" />}
                    className="py-2.5 px-4 text-xs font-bold cursor-pointer"
                  >
                    Save Shiprocket Settings
                  </Button>
                </div>
              </div>
            </div>

            {/* Test Result Message */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  testResult.success
                    ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-semibold">{testResult.message}</p>
                  {testResult.locations && testResult.locations.length > 0 && (
                    <p className="text-[11px] text-emerald-700">
                      Available Pickup Locations on your account: <strong>{testResult.locations.join(', ')}</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {isShiprocketSaved && (
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Shiprocket settings saved and ready for live order fulfillment!
              </div>
            )}
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
        <div className="space-y-6">
          {/* Card: Customer Order Confirmation Emails (Gmail SMTP) */}
          <Card className="space-y-5 border-2 border-[#18542a]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dfd5bf] pb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-xl bg-[#18542a]/10 text-[#18542a] shrink-0 mt-0.5">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-[#103b1d]">
                      Automated Customer Order Emails (Gmail SMTP)
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        emailConfigEnabled && gmailAppPassword
                          ? 'bg-[#E8F0EB] text-[#18542a] border border-[#C0D6C8]'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {emailConfigEnabled && gmailAppPassword ? 'Active & Live' : 'Setup Required'}
                    </span>
                  </div>
                  <p className="text-xs text-[#5a6e54] mt-0.5">
                    Send instant branded order invoices and live package tracking links directly to customers upon checkout via your Gmail account.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <span className="text-xs font-semibold text-[#103b1d]">
                  {emailConfigEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <input
                  type="checkbox"
                  checked={emailConfigEnabled}
                  onChange={(e) => setEmailConfigEnabled(e.target.checked)}
                  className="rounded border-[#dfd5bf] text-[#18542a] focus:ring-[#18542a] w-5 h-5 cursor-pointer"
                />
              </div>
            </div>

            {/* Email Credentials Form */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#103b1d] mb-1">
                    Store Sender Gmail Address
                  </label>
                  <input
                    type="email"
                    value={gmailUser}
                    onChange={(e) => setGmailUser(e.target.value)}
                    placeholder="godhavariorganicfoods@gmail.com"
                    className="w-full px-3 py-2 rounded-xl border border-[#dfd5bf] bg-white font-medium"
                  />
                  <p className="text-[11px] text-[#5a6e54] mt-1">
                    This email appears as the official sender and reply-to address.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-[#103b1d] mb-1">
                    16-Character Google App Password
                  </label>
                  <div className="relative">
                    <input
                      type={showAppPassword ? 'text' : 'password'}
                      value={gmailAppPassword}
                      onChange={(e) => setGmailAppPassword(e.target.value)}
                      placeholder="abcd efgh ijkl mnop"
                      className="w-full px-3 py-2 pr-10 rounded-xl border border-[#dfd5bf] bg-white font-mono text-sm tracking-wide"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAppPassword(!showAppPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAppPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-[#5a6e54] mt-1">
                    Generated from your Google Account security settings (spaces are stripped automatically).
                  </p>
                </div>
              </div>

              {/* 3 Step Instruction Guide */}
              <div className="p-3.5 rounded-xl bg-[#FAF5EA] border border-[#dfd5bf] space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#18542a] text-xs">
                  <Key className="w-4 h-4" />
                  <span>How to generate your 16-Character Google App Password (Takes 60 seconds):</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-[11.5px] text-[#1d271c] leading-relaxed pl-1">
                  <li>
                    Ensure <strong>2-Step Verification</strong> is ON on your Google Account (
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#18542a] underline font-semibold inline-flex items-center gap-0.5"
                    >
                      Google Security <ExternalLink className="w-3 h-3 inline" />
                    </a>
                    ).
                  </li>
                  <li>
                    Open{' '}
                    <a
                      href="https://myaccount.google.com/apppasswords"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#18542a] underline font-bold inline-flex items-center gap-0.5"
                    >
                      myaccount.google.com/apppasswords <ExternalLink className="w-3 h-3 inline" />
                    </a>
                    .
                  </li>
                  <li>
                    Type <strong>Godavari Store</strong> under App name, click <strong>Create</strong>, then copy the 16-letter code and paste it above.
                  </li>
                </ol>
              </div>

              {/* Test Connection Banner */}
              {emailTestResult && (
                <div
                  className={`p-3 rounded-xl border flex items-start gap-2.5 text-xs ${
                    emailTestResult.success
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'bg-red-50 border-red-300 text-red-900'
                  }`}
                >
                  {emailTestResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-semibold block">
                      {emailTestResult.success ? 'Verification Succeeded' : 'Verification Notice'}
                    </span>
                    <span>{emailTestResult.message}</span>
                  </div>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-[#dfd5bf]">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={testEmailRecipient}
                    onChange={(e) => setTestEmailRecipient(e.target.value)}
                    placeholder="Recipient email for test"
                    className="w-56 px-3 py-1.5 rounded-xl border border-[#dfd5bf] bg-white text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleTestEmail}
                    disabled={isTestingEmail}
                    icon={isTestingEmail ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  >
                    {isTestingEmail ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSaveEmailOnly}
                  icon={<Save className="w-3.5 h-3.5" />}
                >
                  {isEmailSaved ? 'Saved to Live Store!' : 'Save Email Settings'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Card: Inventory & Order Notification Rules */}
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
        </div>
      )}

      {/* Tab: Admin Profile & Security */}
      {activeTab === 'admin' && (
        <div className="space-y-6">
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
                <label className="block font-semibold text-[#103b1d] mb-1">Email Address (Login ID)</label>
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

          <Card className="space-y-4">
            <div className="border-b border-[#dfd5bf] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-semibold text-[#103b1d] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#18542a]" />
                  Admin Security & Credentials
                </h3>
                <p className="text-xs text-[#5a6e54] mt-0.5">
                  Managed via Google Cloud Identity Toolkit & Firebase Auth with zero public credentials.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#e8f0eb] text-[#18542a] border border-[#c0d6c8] flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Active Protection
              </span>
            </div>

            <div className="p-4 bg-[#faf5ea] border border-[#dfd5bf] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-[#103b1d]">Reset Admin Password</p>
                <p className="text-xs text-[#5a6e54] mt-0.5">
                  Send a secure password reset link to <span className="font-mono font-semibold text-[#18542a]">{adminEmail}</span>.
                </p>
              </div>
              <button
                type="button"
                disabled={isSendingResetEmail}
                onClick={async () => {
                  setIsSendingResetEmail(true);
                  try {
                    const res = await resetPassword(adminEmail);
                    if (res.success) {
                      showToast(res.message || 'Password reset link sent to your email.', 'success', 'Email Sent');
                    } else {
                      showToast(res.error || 'Failed to send reset email.', 'error');
                    }
                  } catch (err: any) {
                    showToast(err.message || 'Failed to send reset link.', 'error');
                  } finally {
                    setIsSendingResetEmail(false);
                  }
                }}
                className="px-4 py-2 rounded-xl bg-[#18542a] hover:bg-[#103b1d] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60"
              >
                {isSendingResetEmail ? 'Sending Link...' : 'Send Password Reset Email'}
              </button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
