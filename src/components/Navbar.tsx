import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, LogOut, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface NavbarProps {
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ showBack }) => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  return (
    <nav className="w-full border-b border-surface-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {showBack && (
            <Link
              to="/"
              className="inline-flex items-center text-sm font-medium text-ink-500 hover:text-accent-600 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Início
            </Link>
          )}
          <Link to="/" className="flex items-center space-x-2.5">
            <img
              src="/assets/logo_azul.svg"
              alt="Robson Svicero"
              className="h-8 sm:h-9 w-auto object-contain"
            />
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-50 text-accent-700 border border-accent-200">
              Briefings
            </span>
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          {user ? (
            <div className="flex items-center space-x-3">
              <Link
                to="/admin"
                className="text-sm font-medium text-ink-700 hover:text-navy-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-surface-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Painel Admin
              </Link>
              <button
                onClick={handleLogout}
                title="Sair da conta"
                className="p-1.5 text-ink-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/admin/login"
              className="text-xs font-medium text-ink-500 hover:text-navy-900 hover:underline px-2 py-1"
            >
              Acesso Admin
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};
