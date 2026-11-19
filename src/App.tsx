import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { SiteBriefing } from './pages/SiteBriefing';
import { AppBriefing } from './pages/AppBriefing';
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { BriefingDetail } from './pages/BriefingDetail';
import { BrandingBriefing } from './pages/BrandingBriefing';
import { supabase } from './lib/supabase';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica sessão do Supabase ou flag de demo
    const isDemo = sessionStorage.getItem('demo_admin_auth') === 'true';
    if (isDemo) {
      setSession({ user: { email: 'admin@robsonsvicero.com.br' } });
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-50 text-xs font-semibold text-ink-500">
        Verificando permissões...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/site" element={<SiteBriefing />} />
        <Route path="/landing-page" element={<SiteBriefing briefingKind="LandingPage" />} />
        <Route path="/e-commerce" element={<SiteBriefing briefingKind="Ecommerce" />} />
        <Route path="/branding" element={<BrandingBriefing />} />
        <Route path="/app" element={<AppBriefing />} />
        <Route path="/admin/login" element={<Login />} />

        {/* Rotas Administrativas Protegidas */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/briefing/:id"
          element={
            <ProtectedRoute>
              <BriefingDetail />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
