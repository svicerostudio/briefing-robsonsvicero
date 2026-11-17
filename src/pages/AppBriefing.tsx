import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Send, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChipSelect } from '../components/ChipSelect';
import { supabase } from '../lib/supabase';
import { generateBriefingPdf } from '../lib/pdf';
import { AppBriefingData, Briefing } from '../types/briefing';

const STORAGE_KEY = 'briefing_app_draft_v2';

const initialData: AppBriefingData = {
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  cargo: '',
  site: '',
  negocio: '',

  nome_projeto: '',
  problema: '',
  objetivo: '',
  tipo_app: [],
  concorrentes: '',

  publico: '',
  qtd_usuarios: '',
  perfis: '',
  dispositivos: [],

  funcionalidades: [],
  funcionalidades_essenciais: '',
  integracoes: '',
  sistema_existente: '',

  identidade: '',
  referencias_visuais: '',
  cores: '',
  estilo: '',
  tema: '',
  link_arquivos: '',

  prazo: '',
  orcamento: '',
  dominio: '',
  manutencao: '',
  sucesso: '',
  observacoes: '',
};

export const AppBriefing: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AppBriefingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : initialData;
    } catch {
      return initialData;
    }
  });

  const [lgpd, setLgpd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submittedBriefing, setSubmittedBriefing] = useState<Briefing | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  const updateField = (field: keyof AppBriefingData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handlePhoneChange = (val: string) => {
    let v = val.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (v.length > 0) v = '(' + v;
    updateField('telefone', v);
  };

  const totalSteps = 6;

  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 0) {
      if (!formData.nome.trim()) errs.nome = 'Informe seu nome completo.';
      if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(formData.email.trim())) {
        errs.email = 'Informe um e-mail válido.';
      }
      if (!formData.telefone || formData.telefone.replace(/\D/g, '').length < 10) {
        errs.telefone = 'Informe um telefone/WhatsApp com DDD.';
      }
      if (!formData.negocio.trim()) errs.negocio = 'Conte brevemente sobre seu negócio.';
    }

    if (step === 1) {
      if (!formData.problema.trim()) errs.problema = 'Descreva o problema principal que o app resolverá.';
      if (!formData.objetivo.trim()) errs.objetivo = 'Descreva o objetivo principal do app.';
    }

    if (step === 2) {
      if (!formData.publico.trim()) errs.publico = 'Descreva quem utilizará a aplicação.';
    }

    if (step === 3) {
      if (!formData.funcionalidades_essenciais.trim()) {
        errs.funcionalidades_essenciais = 'Liste as funcionalidades essenciais (MVP).';
      }
    }

    if (step === 5) {
      if (!lgpd) errs.lgpd = 'Você precisa autorizar o contato para envio da proposta.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setSubmitting(true);
    setGlobalError(null);

    const newBriefing: Omit<Briefing, 'id' | 'created_at'> = {
      tipo_briefing: 'App',
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      telefone: formData.telefone.trim(),
      empresa: formData.empresa?.trim() || undefined,
      status: 'novo',
      dados: formData,
    };

    try {
      const { data, error } = await supabase
        .from('briefings')
        .insert([newBriefing])
        .select()
        .single();

      if (error) throw error;

      const created: Briefing = data || {
        ...newBriefing,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };

      setSubmittedBriefing(created);
      localStorage.removeItem(STORAGE_KEY);
    } catch (err: any) {
      console.error('Erro ao enviar briefing:', err);
      const fallbackBriefing: Briefing = {
        ...newBriefing,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
      };
      setSubmittedBriefing(fallbackBriefing);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setFormData(initialData);
    setSubmittedBriefing(null);
    setCurrentStep(0);
    setLgpd(false);
    navigate('/');
  };

  if (submittedBriefing) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-surface-200 text-center space-y-6">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Briefing recebido com sucesso
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
                Obrigado, {submittedBriefing.nome}!
              </h1>
              <p className="text-sm text-ink-500 max-w-md mx-auto">
                Recebemos todas as informações da sua aplicação web. Faremos a análise técnica de escopo para apresentar a melhor arquitetura e proposta.
              </p>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                type="button"
                onClick={() => generateBriefingPdf(submittedBriefing)}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-600 hover:bg-accent-700 text-white font-semibold text-sm shadow-md shadow-accent-600/20 transition-all"
              >
                <Download className="w-4 h-4" />
                Baixar Cópia em PDF
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface-100 hover:bg-surface-200 text-ink-700 font-semibold text-sm transition-all"
              >
                Voltar ao Início
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar showBack />

      {/* Hero Header */}
      <div className="hero-dark text-white py-12 px-4 sm:px-6 relative">
        <div className="max-w-3xl mx-auto text-center space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-accent-300 text-xs font-semibold">
            Briefing de Projeto
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold">
            Vamos criar o seu <span className="text-accent-300">aplicativo web</span>
          </h1>
          <p className="text-sm sm:text-base text-accent-200/90 max-w-xl mx-auto">
            Responda às perguntas abaixo para detalharmos regras de negócio, fluxos e integrações.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-20 w-full flex-1">
        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-200 mb-6">
          <div className="flex justify-between items-center text-xs font-semibold text-ink-500 mb-2">
            <span>Etapa {currentStep + 1} de {totalSteps}</span>
            <span>{Math.round(((currentStep + 1) / totalSteps) * 100)}% concluído</span>
          </div>
          <div className="w-full bg-surface-100 h-2 rounded-full overflow-hidden">
            <div
              className="bg-accent-600 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Card do Formulário */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-surface-200/80">
          {globalError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{globalError}</span>
            </div>
          )}

          {/* ETAPA 1 */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">01 · Sobre você</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Quem é você e sua empresa?</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Nome completo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nome}
                    onChange={(e) => updateField('nome', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="Seu nome"
                  />
                  {errors.nome && <p className="text-red-600 text-xs mt-1">{errors.nome}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    E-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="seuemail@exemplo.com"
                  />
                  {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    WhatsApp / Telefone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.telefone}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="(00) 00000-0000"
                  />
                  {errors.telefone && <p className="text-red-600 text-xs mt-1">{errors.telefone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Empresa / Marca</label>
                  <input
                    type="text"
                    value={formData.empresa || ''}
                    onChange={(e) => updateField('empresa', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="Nome da sua marca"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Seu cargo</label>
                  <input
                    type="text"
                    value={formData.cargo || ''}
                    onChange={(e) => updateField('cargo', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="Ex.: CEO, CTO, Product Owner"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Site ou rede social atual</label>
                  <input
                    type="text"
                    value={formData.site || ''}
                    onChange={(e) => updateField('site', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Descreva brevemente o seu negócio <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.negocio}
                  onChange={(e) => updateField('negocio', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Conte um pouco sobre a atuação da empresa e modelo de negócio atual."
                />
                {errors.negocio && <p className="text-red-600 text-xs mt-1">{errors.negocio}</p>}
              </div>
            </div>
          )}

          {/* ETAPA 2 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">02 · O projeto</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">O que o app precisa resolver?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Nome do projeto (ou provisório)</label>
                <input
                  type="text"
                  value={formData.nome_projeto || ''}
                  onChange={(e) => updateField('nome_projeto', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: Painel Gestor Pro, Portal do Cliente"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Qual problema principal o app vai resolver? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.problema}
                  onChange={(e) => updateField('problema', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Qual a maior dor, gargalo de tempo, retrabalho ou custo que a solução vai eliminar?"
                />
                {errors.problema && <p className="text-red-600 text-xs mt-1">{errors.problema}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Qual o principal objetivo do app? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.objetivo}
                  onChange={(e) => updateField('objetivo', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: automatizar agendamentos, permitir pagamentos de mensalidade, integrar equipes…"
                />
                {errors.objetivo && <p className="text-red-600 text-xs mt-1">{errors.objetivo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">Tipo de aplicação</label>
                <ChipSelect
                  options={[
                    'Plataforma / SaaS',
                    'Painel administrativo',
                    'Marketplace',
                    'E-commerce',
                    'Agendamento',
                    'Área de membros / cursos',
                    'CRM / Gestão',
                    'Outro',
                  ]}
                  selected={formData.tipo_app}
                  onChange={(val) => updateField('tipo_app', val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Concorrentes ou referências (links)</label>
                <textarea
                  rows={3}
                  value={formData.concorrentes || ''}
                  onChange={(e) => updateField('concorrentes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Coloque um por linha e aponte o que você gosta ou gostaria de fazer diferente."
                />
              </div>
            </div>
          )}

          {/* ETAPA 3 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">03 · Público e usuários</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Quem vai usar o app?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Descreva o público-alvo / usuários <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.publico}
                  onChange={(e) => updateField('publico', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Perfil, faixa etária, profissão, nível de familiaridade com tecnologia…"
                />
                {errors.publico && <p className="text-red-600 text-xs mt-1">{errors.publico}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                    Estimativa de usuários (primeiro ano)
                  </label>
                  <select
                    value={formData.qtd_usuarios || ''}
                    onChange={(e) => updateField('qtd_usuarios', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Até 100">Até 100</option>
                    <option value="100 a 1.000">100 a 1.000</option>
                    <option value="1.000 a 10.000">1.000 a 10.000</option>
                    <option value="Mais de 10.000">Mais de 10.000</option>
                    <option value="Não sei estimar">Não sei estimar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Perfis de acesso previstos</label>
                  <input
                    type="text"
                    value={formData.perfis || ''}
                    onChange={(e) => updateField('perfis', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="Ex.: Administrador, Cliente, Atendente, Gerente"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">Principais dispositivos de uso</label>
                <ChipSelect
                  options={['Celular', 'Desktop', 'Tablet']}
                  selected={formData.dispositivos}
                  onChange={(val) => updateField('dispositivos', val)}
                />
              </div>
            </div>
          )}

          {/* ETAPA 4 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">04 · Funcionalidades</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">O que o app precisa fazer?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">Funcionalidades desejadas</label>
                <ChipSelect
                  options={[
                    'Login e cadastro',
                    'Perfis e permissões',
                    'Dashboard e relatórios',
                    'Pagamentos online',
                    'Assinaturas recorrentes',
                    'Notificações (e-mail/push)',
                    'Chat / mensagens',
                    'Upload de arquivos',
                    'Busca e filtros',
                    'Agenda / calendário',
                    'Mapas / geolocalização',
                    'Inteligência artificial',
                    'Multi-idioma',
                    'PWA (instalável)',
                  ]}
                  selected={formData.funcionalidades}
                  onChange={(val) => updateField('funcionalidades', val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Liste as 3 a 5 funcionalidades mais essenciais (MVP) <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.funcionalidades_essenciais}
                  onChange={(e) => updateField('funcionalidades_essenciais', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Quais são os recursos fundamentais sem os quais o aplicativo não pode ser lançado?"
                />
                {errors.funcionalidades_essenciais && (
                  <p className="text-red-600 text-xs mt-1">{errors.funcionalidades_essenciais}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Integrações necessárias</label>
                <textarea
                  rows={3}
                  value={formData.integracoes || ''}
                  onChange={(e) => updateField('integracoes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: Stripe, Mercado Pago, WhatsApp API, Google Calendar, ERP, gateways…"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Existe sistema ou planilha atual que será substituído?
                </label>
                <textarea
                  rows={3}
                  value={formData.sistema_existente || ''}
                  onChange={(e) => updateField('sistema_existente', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Se sim, como funciona hoje e quais dados precisarão ser migrados?"
                />
              </div>
            </div>
          )}

          {/* ETAPA 5 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">05 · Design e identidade</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Como o app deve parecer?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">
                  Você já possui identidade visual?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Sim, completa', 'Parcial (só logo)', 'Não possuo'].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs sm:text-sm font-medium transition-all ${
                        formData.identidade === item
                          ? 'border-accent-600 bg-accent-50 text-accent-700 ring-1 ring-accent-600'
                          : 'border-surface-200 hover:bg-surface-50 text-ink-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="identidade"
                        value={item}
                        checked={formData.identidade === item}
                        onChange={() => updateField('identidade', item)}
                        className="text-accent-600 focus:ring-accent-600"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Links de referências visuais de UI/UX
                </label>
                <textarea
                  rows={3}
                  value={formData.referencias_visuais || ''}
                  onChange={(e) => updateField('referencias_visuais', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Apps, painéis e interfaces cujo design você admira."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Cores preferidas</label>
                  <input
                    type="text"
                    value={formData.cores || ''}
                    onChange={(e) => updateField('cores', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                    placeholder="Ex.: Azul marinho e ciano"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Estilo visual</label>
                  <select
                    value={formData.estilo || ''}
                    onChange={(e) => updateField('estilo', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Moderno e minimalista">Moderno e minimalista</option>
                    <option value="Corporativo e sério">Corporativo e sério</option>
                    <option value="Amigável e acolhedor">Amigável e acolhedor</option>
                    <option value="Ousado e criativo">Ousado e criativo</option>
                    <option value="Elegante e sofisticado">Elegante e sofisticado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">Modo de tema desejado</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Claro', 'Escuro', 'Ambos (com alternador)'].map((t) => (
                    <label
                      key={t}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs sm:text-sm font-medium transition-all ${
                        formData.tema === t
                          ? 'border-accent-600 bg-accent-50 text-accent-700 ring-1 ring-accent-600'
                          : 'border-surface-200 hover:bg-surface-50 text-ink-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tema"
                        value={t}
                        checked={formData.tema === t}
                        onChange={() => updateField('tema', t)}
                        className="text-accent-600 focus:ring-accent-600"
                      />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Link para logo e materiais (Drive, Figma…)
                </label>
                <input
                  type="url"
                  value={formData.link_arquivos || ''}
                  onChange={(e) => updateField('link_arquivos', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="https://"
                />
              </div>
            </div>
          )}

          {/* ETAPA 6 */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">06 · Prazo e investimento</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Quando e com que orçamento?</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Prazo desejado para lançamento</label>
                  <select
                    value={formData.prazo || ''}
                    onChange={(e) => updateField('prazo', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Até 1 mês">Até 1 mês</option>
                    <option value="1 a 3 meses">1 a 3 meses</option>
                    <option value="3 a 6 meses">3 a 6 meses</option>
                    <option value="Mais de 6 meses">Mais de 6 meses</option>
                    <option value="Sem prazo definido">Sem prazo definido</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Faixa de investimento estimada</label>
                  <select
                    value={formData.orcamento || ''}
                    onChange={(e) => updateField('orcamento', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Até R$ 10 mil">Até R$ 10 mil</option>
                    <option value="R$ 10 mil a R$ 30 mil">R$ 10 mil a R$ 30 mil</option>
                    <option value="R$ 30 mil a R$ 80 mil">R$ 30 mil a R$ 80 mil</option>
                    <option value="Acima de R$ 80 mil">Acima de R$ 80 mil</option>
                    <option value="Preciso de uma estimativa">Preciso de uma estimativa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Já possui domínio e hospedagem?</label>
                <input
                  type="text"
                  value={formData.dominio || ''}
                  onChange={(e) => updateField('dominio', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: Domínio registrado, hospedagem na Hostinger"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Precisa de manutenção e suporte contínuo após lançamento?
                </label>
                <select
                  value={formData.manutencao || ''}
                  onChange={(e) => updateField('manutencao', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                >
                  <option value="">Selecione</option>
                  <option value="Sim, contínuo">Sim, contínuo</option>
                  <option value="Apenas no período de garantia inicial">Apenas no período de garantia inicial</option>
                  <option value="Não">Não</option>
                  <option value="Ainda não sei">Ainda não sei</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Como saberemos que o projeto foi um sucesso?
                </label>
                <textarea
                  rows={3}
                  value={formData.sucesso || ''}
                  onChange={(e) => updateField('sucesso', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Quais métricas ou marcos definirão o sucesso do app?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Algo mais que devemos saber?</label>
                <textarea
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) => updateField('observacoes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>

              {/* LGPD */}
              <div className="pt-4 border-t border-surface-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={lgpd}
                    onChange={(e) => {
                      setLgpd(e.target.checked);
                      if (e.target.checked && errors.lgpd) {
                        setErrors((prev) => {
                          const n = { ...prev };
                          delete n.lgpd;
                          return n;
                        });
                      }
                    }}
                    className="mt-1 w-4 h-4 text-accent-600 rounded border-surface-200 focus:ring-accent-600"
                  />
                  <span className="text-xs text-ink-700 leading-relaxed">
                    Concordo em fornecer essas informações para que a equipe de <strong>Robson Svicero</strong> possa analisar os requisitos e elaborar uma proposta técnica personalizada.
                  </span>
                </label>
                {errors.lgpd && <p className="text-red-600 text-xs mt-1.5">{errors.lgpd}</p>}
              </div>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-between pt-8 border-t border-surface-200 mt-8">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={handlePrev}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-surface-200 text-xs sm:text-sm font-semibold text-ink-700 hover:bg-surface-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Anterior
              </button>
            ) : (
              <div />
            )}

            {currentStep < totalSteps - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-600/20 transition-all"
              >
                Próxima etapa
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
              >
                {submitting ? (
                  <span>Enviando...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Enviar Briefing
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
};
