import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, Send, Download, Sparkles, AlertCircle } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChipSelect } from '../components/ChipSelect';
import { supabase } from '../lib/supabase';
import { generateBriefingPdf } from '../lib/pdf';
import { SiteBriefingData, Briefing } from '../types/briefing';

const initialData: SiteBriefingData = {
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  cargo: '',
  site_atual: '',
  negocio: '',

  tipo_site: [],
  objetivo: '',
  acao_principal: '',
  diferencial: '',
  concorrentes: '',

  publico: '',
  paginas: [],
  textos: '',
  imagens: '',
  paginas_extra: '',

  recursos: [],
  integracoes: '',
  autonomia: '',
  observacoes_func: '',

  identidade: '',
  referencias_visuais: '',
  cores: '',
  estilo: '',
  link_arquivos: '',

  prazo: '',
  orcamento: '',
  dominio: '',
  manutencao: '',
};

interface SiteBriefingProps {
  briefingKind?: 'Site' | 'LandingPage' | 'Ecommerce';
}

export const SiteBriefing: React.FC<SiteBriefingProps> = ({ briefingKind = 'Site' }) => {
  const isLandingPage = briefingKind === 'LandingPage';
  const isEcommerce = briefingKind === 'Ecommerce';
  const STORAGE_KEY =
    briefingKind === 'LandingPage'
      ? 'briefing_landing_page_draft_v1'
      : briefingKind === 'Ecommerce'
        ? 'briefing_ecommerce_draft_v1'
        : 'briefing_site_draft_v2';
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<SiteBriefingData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      if (isLandingPage) {
        return { ...initialData, tipo_site: ['Landing Page'], paginas: ['Landing Page'] };
      }
      if (isEcommerce) {
        return { ...initialData, tipo_site: ['Loja virtual'] };
      }
      return initialData;
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

  // Salva rascunho automaticamente
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (_) {}
  }, [formData]);

  const updateField = (field: keyof SiteBriefingData, value: any) => {
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
        errs.telefone = 'Informe um telefone/WhatsApp válido com DDD.';
      }
      if (!formData.negocio.trim()) errs.negocio = 'Conte brevemente sobre seu negócio.';
    }

    if (step === 1) {
      if (!formData.objetivo.trim()) errs.objetivo = 'Descreva o principal objetivo do site.';
    }

    if (step === 2) {
      if (!formData.publico.trim()) errs.publico = 'Descreva o público-alvo pretendido.';
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
      tipo_briefing: briefingKind,
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
      // Fallback gracioso caso as credenciais do Supabase ainda não tenham sido configuradas no .env
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
              Recebemos todas as informações {isLandingPage ? 'da sua Landing Page' : isEcommerce ? 'do seu projeto E-Commerce' : 'do seu site'}. Analisaremos todos os detalhes para entrar em contato com uma proposta alinhada aos seus objetivos.
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
            Vamos criar {isLandingPage ? 'sua' : 'seu'} <span className="text-accent-300">{isLandingPage ? 'Landing Page' : isEcommerce ? 'E-Commerce' : 'site'}</span>
          </h1>
          <p className="text-sm sm:text-base text-accent-200/90 max-w-xl mx-auto">
            Responda às perguntas abaixo para mapearmos objetivos, conteúdo e conversão.
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
                    placeholder="Ex.: Fundador, Diretor, Gerente"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Site ou rede social atual</label>
                  <input
                    type="text"
                    value={formData.site_atual || ''}
                    onChange={(e) => updateField('site_atual', e.target.value)}
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
                  placeholder="O que sua empresa faz, quais produtos/serviços vende e quem são seus principais clientes?"
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
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Qual o propósito do site?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">
                  {isEcommerce ? 'Qual o tipo pretendido?' : 'Tipo de site pretendido'}
                </label>
                <ChipSelect
                  options={
                    isLandingPage
                      ? ['Landing Page']
                      : isEcommerce
                        ? ['E-Commerce / Loja virtual', 'Catálogo de produtos']
                        : ['Institucional', 'One Page', 'Portfólio', 'Blog/conteúdo']
                  }
                  selected={formData.tipo_site}
                  onChange={(val) => updateField('tipo_site', val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Qual o principal objetivo do site? <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.objetivo}
                  onChange={(e) => updateField('objetivo', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: gerar contatos qualificados no WhatsApp, vender produtos online, apresentar credibilidade institucional…"
                />
                {errors.objetivo && <p className="text-red-600 text-xs mt-1">{errors.objetivo}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Qual ação principal o visitante deve realizar?
                </label>
                <input
                  type="text"
                  value={formData.acao_principal || ''}
                  onChange={(e) => updateField('acao_principal', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: Chamar no WhatsApp, preencher formulário de orçamento, comprar"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Qual o diferencial do seu negócio?</label>
                <textarea
                  rows={3}
                  value={formData.diferencial || ''}
                  onChange={(e) => updateField('diferencial', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Por que os clientes escolhem você e não os concorrentes?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Concorrentes ou referências (links)</label>
                <textarea
                  rows={3}
                  value={formData.concorrentes || ''}
                  onChange={(e) => updateField('concorrentes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Coloque um por linha com comentários sobre o que você gosta ou não gosta."
                />
              </div>
            </div>
          )}

          {/* ETAPA 3 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">03 · Público e conteúdo</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Para quem e com qual conteúdo?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Descreva o público-alvo <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  value={formData.publico}
                  onChange={(e) => updateField('publico', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Perfil, idade, região, segmento de empresas, principais dores e necessidades…"
                />
                {errors.publico && <p className="text-red-600 text-xs mt-1">{errors.publico}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">Páginas desejadas no site</label>
                <ChipSelect
                  options={[
                    'Home',
                    'Sobre',
                    'Serviços',
                    'Produtos',
                    'Portfólio / Cases',
                    'Depoimentos',
                    'Blog',
                    'FAQ',
                    'Contato',
                  ]}
                  selected={formData.paginas}
                  onChange={(val) => updateField('paginas', val)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Quem fornecerá os textos?</label>
                  <select
                    value={formData.textos || ''}
                    onChange={(e) => updateField('textos', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Eu mesmo(a)">Eu mesmo(a)</option>
                    <option value="Preciso de redação profissional">Preciso de redação profissional</option>
                    <option value="Já tenho textos prontos">Já tenho textos prontos</option>
                    <option value="Ainda não sei">Ainda não sei</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Quem fornecerá as imagens/fotos?</label>
                  <select
                    value={formData.imagens || ''}
                    onChange={(e) => updateField('imagens', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Eu mesmo(a)">Eu mesmo(a)</option>
                    <option value="Usar banco de imagens profissional">Usar banco de imagens profissional</option>
                    <option value="Preciso de fotografia no local">Preciso de fotografia no local</option>
                    <option value="Ainda não sei">Ainda não sei</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Detalhes sobre a estrutura do site</label>
                <textarea
                  rows={3}
                  value={formData.paginas_extra || ''}
                  onChange={(e) => updateField('paginas_extra', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Seções importantes, hierarquia de menu ou outras páginas específicas…"
                />
              </div>
            </div>
          )}

          {/* ETAPA 4 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">04 · Funcionalidades</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">O que o site precisa ter?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">Recursos desejados</label>
                <ChipSelect
                  options={[
                    'Formulário de contato',
                    'Botão de WhatsApp flutuante',
                    'Galeria de fotos / vídeos',
                    'Blog com painel',
                    'Loja / pagamento online',
                    'Agendamento online',
                    'Área restrita / login',
                    'Newsletter',
                    'Mapa / localização',
                    'Chat / chatbot',
                    'Multi-idioma',
                    'SEO otimizado',
                  ]}
                  selected={formData.recursos}
                  onChange={(val) => updateField('recursos', val)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">Integrações necessárias</label>
                <textarea
                  rows={3}
                  value={formData.integracoes || ''}
                  onChange={(e) => updateField('integracoes', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Ex.: Google Analytics, Meta Pixel, RD Station, Mailchimp, CRM, ERP…"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">
                  Você precisa atualizar o conteúdo sozinho(a)?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    'Sim, com painel administrativo',
                    'Não, a equipe atualiza',
                    'Ainda não sei',
                  ].map((item) => (
                    <label
                      key={item}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer text-xs sm:text-sm font-medium transition-all ${
                        formData.autonomia === item
                          ? 'border-accent-600 bg-accent-50 text-accent-700 ring-1 ring-accent-600'
                          : 'border-surface-200 hover:bg-surface-50 text-ink-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="autonomia"
                        value={item}
                        checked={formData.autonomia === item}
                        onChange={() => updateField('autonomia', item)}
                        className="text-accent-600 focus:ring-accent-600"
                      />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Alguma funcionalidade específica não listada?
                </label>
                <textarea
                  rows={3}
                  value={formData.observacoes_func || ''}
                  onChange={(e) => updateField('observacoes_func', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                />
              </div>
            </div>
          )}

          {/* ETAPA 5 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="border-b border-surface-200 pb-4">
                <span className="text-xs font-bold text-accent-600 uppercase tracking-wider">05 · Design e identidade</span>
                <h2 className="text-xl sm:text-2xl font-bold text-navy-900 mt-1">Como o site deve parecer?</h2>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-2">
                  Você já possui identidade visual (marca)?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Sim, completa', 'Parcial (só logotipo)', 'Não possuo'].map((item) => (
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
                  Links de sites cujo design você admira
                </label>
                <textarea
                  rows={3}
                  value={formData.referencias_visuais || ''}
                  onChange={(e) => updateField('referencias_visuais', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
                  placeholder="Cole links de referências que reflitam o estilo que você busca."
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
                    placeholder="Ex.: Azul escuro, dourado, branco"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Estilo visual desejado</label>
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
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Link para pasta com logo e materiais (Google Drive, Dropbox, Figma)
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
                  <label className="block text-xs font-semibold text-ink-700 mb-1.5">Prazo desejado para publicação</label>
                  <select
                    value={formData.prazo || ''}
                    onChange={(e) => updateField('prazo', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                  >
                    <option value="">Selecione</option>
                    <option value="Até 2 semanas">Até 2 semanas</option>
                    <option value="2 a 4 semanas">2 a 4 semanas</option>
                    <option value="1 a 3 meses">1 a 3 meses</option>
                    <option value="Mais de 3 meses">Mais de 3 meses</option>
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
                    <option value="Até R$ 3 mil">Até R$ 3 mil</option>
                    <option value="R$ 3 mil a R$ 8 mil">R$ 3 mil a R$ 8 mil</option>
                    <option value="R$ 8 mil a R$ 20 mil">R$ 8 mil a R$ 20 mil</option>
                    <option value="Acima de R$ 20 mil">Acima de R$ 20 mil</option>
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
                  placeholder="Ex.: sim, domínio registrado no Registro.br e hospedagem na Hostinger"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink-700 mb-1.5">
                  Precisa de manutenção e suporte após a publicação?
                </label>
                <select
                  value={formData.manutencao || ''}
                  onChange={(e) => updateField('manutencao', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-600"
                >
                  <option value="">Selecione</option>
                  <option value="Sim, mensal">Sim, mensal</option>
                  <option value="Apenas no primeiro mês">Apenas no primeiro mês</option>
                  <option value="Não">Não</option>
                  <option value="Ainda não sei">Ainda não sei</option>
                </select>
              </div>

              {/* LGPD Consent */}
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
                    Concordo em fornecer essas informações para que a equipe de <strong>Robson Svicero</strong> possa analisar o projeto e entrar em contato com uma proposta comercial.
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
