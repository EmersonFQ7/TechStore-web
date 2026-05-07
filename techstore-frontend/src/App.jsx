import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute   from './components/auth/ProtectedRoute';
import Layout           from './components/layout/Layout';

// Auth pages
import LoginPage    from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import MfaPage      from './pages/auth/MfaPage';

// App pages
import DashboardPage from './pages/dashboard/DashboardPage';
import ProductsPage  from './pages/products/ProductsPage';
import UsersPage     from './pages/users/UsersPage';
import RolesPage     from './pages/roles/RolesPage';
import NotFoundPage  from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/mfa"      element={<MfaPage />} />

          {/* Protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/products"  element={<ProductsPage />} />

              {/* Solo ADMIN */}
              <Route element={<ProtectedRoute roles={['ADMIN']} />}>
                <Route path="/users" element={<UsersPage />} />
                <Route path="/roles" element={<RolesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Redirecciones */}
          <Route path="/"   element={<Navigate to="/dashboard" replace />} />
          <Route path="*"   element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}