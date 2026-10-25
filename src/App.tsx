import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider } from './context/AdminContext';
import { ToastProvider } from './context/ToastContext';
import { AdminShell } from './components/layout/AdminShell';

// Pages
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { OrdersPage } from './pages/OrdersPage';
import { CustomersPage } from './pages/CustomersPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { StoreContentPage } from './pages/StoreContentPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <ToastProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminShell />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/customers" element={<CustomersPage />} />
              <Route path="/promotions" element={<PromotionsPage />} />
              <Route path="/store-content" element={<StoreContentPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </ToastProvider>
  );
}

export default App;
