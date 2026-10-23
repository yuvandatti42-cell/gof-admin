import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';
import { AdminShell } from './components/layout/AdminShell';

// Pages
import { ProductsPage } from './pages/ProductsPage';
import { OrdersPage } from './pages/OrdersPage';
import { StoreContentPage } from './pages/StoreContentPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ToastProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminShell />}>
              <Route path="/" element={<Navigate to="/products" replace />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<Navigate to="/products" replace />} />
              <Route path="/dashboard" element={<Navigate to="/products" replace />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/store-content" element={<StoreContentPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/products" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </ToastProvider>
  );
}

export default App;
