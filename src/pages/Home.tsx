import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Smartphone, ArrowRight, Clock, Sparkles, MousePointerClick, ShoppingBag, Palette } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const Home: React.FC = () => {
  const [selectedType, setSelectedType] = useState<'site' | 'landingPage' | 'ecommerce' | 'branding' | 'app' | ''>('');
  const navigate = useNavigate();

  const handleStart = () => {
    if (selectedType === 'site') navigate('/site');
    if (selectedType === 'landingPage') navigate('/landing-page');
    if (selectedType === 'ecommerce') navigate('/e-commerce');
    if (selectedType === 'branding') navigate('/branding');
    if (selectedType === 'app') navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />

      <main className="flex-1 flex flex-col justify-center">
        {/* Hero Section */}
        <div className="relative py-16 sm:py-24 overflow-hidden hero-dark text-white text-center px-4 sm:px-6">
          <div className="absolute inset-0 hero-glow pointer-events-none" />

          <div className="relative max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-accent-200 text-xs font-semibold backdrop-blur-md border border-white/15">
              <Sparkles className="w-3.5 h-3.5 text-accent-300" />
              Briefing de Projeto Personalizado
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Vamos começar o seu <span className="text-accent-300">projeto</span>
            </h1>

            <p className="text-base sm:text-lg text-accent-200/90 max-w-2xl mx-auto font-normal leading-relaxed">
              Selecione abaixo o tipo de projeto que você deseja construir. Em seguida, você responderá a um briefing específico para mapearmos objetivos, requisitos e prazos.
            </p>
          </div>
        </div>

        {/* Seleção de Tipo de Projeto */}
        <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 sm:mt-12 pb-16 w-full">
          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-surface-200/80">
            <h2 className="text-lg font-bold text-navy-900 mb-6 text-center">
              Que tipo de projeto você quer criar?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* Card Site */}
              <button
                type="button"
                onClick={() => setSelectedType('site')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'site'
                    ? 'border-accent-600 bg-accent-50/60 shadow-md ring-2 ring-accent-600/20'
                    : 'border-surface-200 hover:border-accent-300 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selectedType === 'site' ? 'bg-accent-600 text-white' : 'bg-surface-100 text-accent-600'
                  }`}>
                    <Globe className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-1">Site</h3>
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                    Sites institucionais, portfólios, catálogos e blogs/conteúdo.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-200/60 flex items-center text-xs font-semibold text-accent-700">
                  <span>6 etapas rápidas</span>
                </div>
              </button>

              {/* Card Landing Page */}
              <button
                type="button"
                onClick={() => setSelectedType('landingPage')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'landingPage'
                    ? 'border-accent-600 bg-accent-50/60 shadow-md ring-2 ring-accent-600/20'
                    : 'border-surface-200 hover:border-accent-300 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selectedType === 'landingPage' ? 'bg-accent-600 text-white' : 'bg-surface-100 text-accent-600'
                  }`}>
                    <MousePointerClick className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-1">Landing Page</h3>
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                    Página focada em conversão, campanhas, lançamentos e geração de contatos.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-200/60 flex items-center text-xs font-semibold text-accent-700">
                  <span>6 etapas rápidas</span>
                </div>
              </button>

              {/* Card E-Commerce */}
              <button
                type="button"
                onClick={() => setSelectedType('ecommerce')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'ecommerce'
                    ? 'border-accent-600 bg-accent-50/60 shadow-md ring-2 ring-accent-600/20'
                    : 'border-surface-200 hover:border-accent-300 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selectedType === 'ecommerce' ? 'bg-accent-600 text-white' : 'bg-surface-100 text-accent-600'
                  }`}>
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-1">E-Commerce</h3>
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                    Loja virtual ou catálogo de produtos para apresentar e vender seu portfólio.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-200/60 flex items-center text-xs font-semibold text-accent-700">
                  <span>6 etapas detalhadas</span>
                </div>
              </button>

              {/* Card App */}
              <button
                type="button"
                onClick={() => setSelectedType('app')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'app'
                    ? 'border-accent-600 bg-accent-50/60 shadow-md ring-2 ring-accent-600/20'
                    : 'border-surface-200 hover:border-accent-300 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selectedType === 'app' ? 'bg-accent-600 text-white' : 'bg-surface-100 text-accent-600'
                  }`}>
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-1">Aplicativo Web (App)</h3>
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                    Plataformas SaaS, portais com login/área restrita, painéis administrativos, marketplaces e automações.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-200/60 flex items-center text-xs font-semibold text-accent-700">
                  <span>6 etapas detalhadas</span>
                </div>
              </button>

              {/* Card Branding */}
              <button
                type="button"
                onClick={() => setSelectedType('branding')}
                className={`p-6 rounded-2xl border-2 text-left transition-all relative flex flex-col justify-between ${
                  selectedType === 'branding'
                    ? 'border-accent-600 bg-accent-50/60 shadow-md ring-2 ring-accent-600/20'
                    : 'border-surface-200 hover:border-accent-300 hover:bg-surface-50'
                }`}
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                    selectedType === 'branding' ? 'bg-accent-600 text-white' : 'bg-surface-100 text-accent-600'
                  }`}>
                    <Palette className="w-6 h-6" />
                  </div>
                  <h3 className="font-bold text-navy-900 text-lg mb-1">Branding</h3>
                  <p className="text-xs sm:text-sm text-ink-500 leading-relaxed">
                    Identidade visual, criação ou redesenho de marca e manual gráfico.
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-surface-200/60 flex items-center text-xs font-semibold text-accent-700">
                  <span>6 etapas detalhadas</span>
                </div>
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-surface-200">
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Clock className="w-4 h-4 text-accent-600" />
                <span>Leva cerca de 10 minutos e você pode salvar rascunho.</span>
              </div>

              <button
                type="button"
                disabled={!selectedType}
                onClick={handleStart}
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl font-semibold text-white bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-accent-600/20 transition-all text-sm gap-2"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
