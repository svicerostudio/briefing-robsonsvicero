import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft, ArrowRight, CheckCircle2, Download, Send } from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ChipSelect } from '../components/ChipSelect';
import { supabase } from '../lib/supabase';
import { generateBriefingPdf } from '../lib/pdf';
import { Briefing } from '../types/briefing';

const STORAGE_KEY = 'briefing_branding_draft_v1';

const initialData = {
  nome: '', email: '', telefone: '', empresa: '', cargo: '', site_atual: '', negocio: '',
  tipo_marca: [], objetivo: '', motivo: '', publico: '', valores: '',
  personalidade: [], diferenca: '', concorrentes: '', referencias: '',
  entregaveis: [], cores: '', estilo: '', aplicacoes: '', link_arquivos: '',
  prazo: '', orcamento: '', manutencao: '', observacoes: '',
};

export const BrandingBriefing: React.FC = () => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || initialData; }
    catch { return initialData; }
  });
  const [lgpd, setLgpd] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<Briefing | null>(null);
  const navigate = useNavigate();
  const totalSteps = 6;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const update = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (step === 0) {
      if (!data.nome.trim()) next.nome = 'Informe seu nome completo.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email.trim())) next.email = 'Informe um e-mail válido.';
      if (data.telefone.replace(/\D/g, '').length < 10) next.telefone = 'Informe um telefone válido.';
      if (!data.negocio.trim()) next.negocio = 'Conte brevemente sobre o negócio.';
    }
    if (step === 1 && !data.objetivo.trim()) next.objetivo = 'Descreva o objetivo da identidade visual.';
    if (step === 2 && !data.publico.trim()) next.publico = 'Descreva o público-alvo.';
    if (step === 5 && !lgpd) next.lgpd = 'Autorize o contato para envio da proposta.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const next = () => {
    if (validate()) {
      setStep((value) => Math.min(value + 1, totalSteps - 1));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const briefing: Omit<Briefing, 'id' | 'created_at'> = {
      tipo_briefing: 'Branding',
      nome: data.nome.trim(),
      email: data.email.trim(),
      telefone: data.telefone.trim(),
      empresa: data.empresa?.trim() || undefined,
      status: 'novo',
      dados: data,
    };
    try {
      const { data: saved, error } = await supabase.from('briefings').insert([briefing]).select().single();
      if (error) throw error;
      setSubmitted(saved);
    } catch (error) {
      console.error('Erro ao enviar briefing de branding:', error);
      setSubmitted({ ...briefing, id: crypto.randomUUID(), created_at: new Date().toISOString() });
    } finally {
      localStorage.removeItem(STORAGE_KEY);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const phone = (value: string) => {
    let v = value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
    else if (v.length > 6) v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
    else if (v.length > 2) v = v.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    else if (v) v = `(${v}`;
    update('telefone', v);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Navbar />
        <main className="flex-1 max-w-2xl mx-auto px-4 py-16 flex flex-col justify-center">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-surface-200 text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto" />
            <h1 className="text-3xl font-extrabold text-navy-900">Obrigado, {submitted.nome}!</h1>
            <p className="text-sm text-ink-500">Recebemos seu briefing de Branding/Identidade Visual.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => generateBriefingPdf(submitted)} className="px-6 py-3 rounded-xl bg-accent-600 text-white font-semibold text-sm flex items-center justify-center gap-2">
                <Download className="w-4 h-4" /> Baixar PDF
              </button>
              <button onClick={() => { setSubmitted(null); setData(initialData); setStep(0); navigate('/'); }} className="px-6 py-3 rounded-xl bg-surface-100 text-ink-700 font-semibold text-sm">
                Voltar ao início
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const fieldError = (field: string) => errors[field] && <p className="text-red-600 text-xs mt-1">{errors[field]}</p>;
  const inputClass = 'w-full px-4 py-2.5 rounded-xl border border-surface-200 text-sm focus:outline-none focus:ring-2 focus:ring-accent-600';
  const labelClass = 'block text-xs font-semibold text-ink-700 mb-1.5';

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar showBack />
      <div className="hero-dark text-white py-12 px-4 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold">Briefing de <span className="text-accent-300">Branding</span></h1>
        <p className="text-sm text-accent-200/90 mt-3">Vamos definir a identidade visual da sua marca.</p>
      </div>
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-20 w-full">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-surface-200 mb-6">
          <div className="flex justify-between text-xs font-semibold text-ink-500 mb-2"><span>Etapa {step + 1} de {totalSteps}</span><span>{Math.round(((step + 1) / totalSteps) * 100)}%</span></div>
          <div className="w-full bg-surface-100 h-2 rounded-full"><div className="bg-accent-600 h-full rounded-full transition-all" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} /></div>
        </div>
        <form onSubmit={submit} className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-surface-200/80 space-y-6">
          {step === 0 && <>
            <h2 className="text-xl font-bold text-navy-900 border-b pb-4">Sobre você e sua marca</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Nome completo *</label><input className={inputClass} value={data.nome} onChange={(e) => update('nome', e.target.value)} />{fieldError('nome')}</div>
              <div><label className={labelClass}>E-mail *</label><input type="email" className={inputClass} value={data.email} onChange={(e) => update('email', e.target.value)} />{fieldError('email')}</div>
              <div><label className={labelClass}>WhatsApp / Telefone *</label><input className={inputClass} value={data.telefone} onChange={(e) => phone(e.target.value)} />{fieldError('telefone')}</div>
              <div><label className={labelClass}>Empresa / Marca</label><input className={inputClass} value={data.empresa} onChange={(e) => update('empresa', e.target.value)} /></div>
              <div><label className={labelClass}>Seu cargo</label><input className={inputClass} value={data.cargo} onChange={(e) => update('cargo', e.target.value)} /></div>
              <div><label className={labelClass}>Site ou rede social atual</label><input className={inputClass} value={data.site_atual} onChange={(e) => update('site_atual', e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Descreva brevemente o negócio *</label><textarea rows={4} className={inputClass} value={data.negocio} onChange={(e) => update('negocio', e.target.value)} />{fieldError('negocio')}</div>
          </>}

          {step === 1 && <>
            <h2 className="text-xl font-bold text-navy-900 border-b pb-4">O projeto</h2>
            <div><label className={labelClass}>Qual o objetivo da identidade visual? *</label><textarea rows={3} className={inputClass} value={data.objetivo} onChange={(e) => update('objetivo', e.target.value)} />{fieldError('objetivo')}</div>
            <div><label className={labelClass}>Por que a marca precisa deste projeto?</label><textarea rows={3} className={inputClass} value={data.motivo} onChange={(e) => update('motivo', e.target.value)} /></div>
            <div><label className="block text-xs font-semibold text-ink-700 mb-2">Tipo de projeto</label><ChipSelect options={['Identidade visual completa', 'Redesenho de logo', 'Criação de logo', 'Manual da marca', 'Key Visual', 'Aplicações gráficas']} selected={data.tipo_marca} onChange={(v) => update('tipo_marca', v)} /></div>
          </>}

          {step === 2 && <>
            <h2 className="text-xl font-bold text-navy-900 border-b pb-4">Público e posicionamento</h2>
            <div><label className={labelClass}>Quem é o público-alvo? *</label><textarea rows={4} className={inputClass} value={data.publico} onChange={(e) => update('publico', e.target.value)} />{fieldError('publico')}</div>
            <div><label className={labelClass}>Valores e propósito da marca</label><textarea rows={3} className={inputClass} value={data.valores} onChange={(e) => update('valores', e.target.value)} /></div>
            <div><label className={labelClass}>O que diferencia a marca dos concorrentes?</label><textarea rows={3} className={inputClass} value={data.diferenca} onChange={(e) => update('diferenca', e.target.value)} /></div>
          </>}

          {step === 3 && <>
            <h2 className="text-xl font-bold text-navy-900 border-b pb-4">Personalidade da marca</h2>
            <div><label className="block text-xs font-semibold text-ink-700 mb-2">Características desejadas</label><ChipSelect options={['Minimalista', 'Sofisticada', 'Acessível', 'Tecnológica', 'Arrojada', 'Clássica', 'Humana', 'Divertida', 'Premium', 'Orgânica']} selected={data.personalidade} onChange={(v) => update('personalidade', v)} /></div>
            <div><label className={labelClass}>Concorrentes e referências (links)</label><textarea rows={4} className={inputClass} value={data.concorrentes} onChange={(e) => update('concorrentes', e.target.value)} /></div>
            <div><label className={labelClass}>Referências visuais que gosta ou não gosta</label><textarea rows={4} className={inputClass} value={data.referencias} onChange={(e) => update('referencias', e.target.value)} /></div>
          </>}

          {step === 4 && <>
            <h2 className="text-xl font-bold text-navy-900 border-b pb-4">Entregáveis e direção visual</h2>
            <div><label className="block text-xs font-semibold text-ink-700 mb-2">O que deve ser entregue?</label><ChipSelect options={['Logo', 'Versões horizontal e vertical', 'Ícone / símbolo', 'Manual da marca', 'Cores e tipografia', 'Cartão de visita', 'Social media', 'Apresentação institucional', 'Sinalização', 'Material de embalagem']} selected={data.entregaveis} onChange={(v) => update('entregaveis', v)} /></div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Cores preferidas ou a evitar</label><input className={inputClass} value={data.cores} onChange={(e) => update('cores', e.target.value)} /></div>
              <div><label className={labelClass}>Estilo visual desejado</label><input className={inputClass} value={data.estilo} onChange={(e) => update('estilo', e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Principais aplicações da marca</label><textarea rows={3} className={inputClass} value={data.aplicacoes} onChange={(e) => update('aplicacoes', e.target.value)} /></div>
            <div><label className={labelClass}>Link para logo, documentos ou materiais</label><input className={inputClass} value={data.link_arquivos} onChange={(e) => update('link_arquivos', e.target.value)} /></div>
          </>}

          {step === 5 && <>
            <h2 className="text-xl font-bold text-navy-900 border-b pb-4">Prazo e investimento</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><label className={labelClass}>Prazo desejado</label><input className={inputClass} value={data.prazo} onChange={(e) => update('prazo', e.target.value)} /></div>
              <div><label className={labelClass}>Faixa de investimento</label><input className={inputClass} value={data.orcamento} onChange={(e) => update('orcamento', e.target.value)} /></div>
            </div>
            <div><label className={labelClass}>Observações adicionais</label><textarea rows={4} className={inputClass} value={data.observacoes} onChange={(e) => update('observacoes', e.target.value)} /></div>
            <label className="flex items-start gap-3 p-4 rounded-xl border border-surface-200 text-xs text-ink-700">
              <input type="checkbox" checked={lgpd} onChange={(e) => setLgpd(e.target.checked)} className="mt-0.5" />
              <span>Autorizo o contato da equipe para apresentar proposta e esclarecer dúvidas sobre este projeto.</span>
            </label>
            {fieldError('lgpd')}
          </>}

          <div className="flex justify-between pt-4 border-t border-surface-200">
            <button type="button" onClick={() => setStep((value) => Math.max(value - 1, 0))} disabled={step === 0} className="px-5 py-3 rounded-xl bg-surface-100 text-ink-700 font-semibold text-sm disabled:opacity-40 flex items-center gap-2"><ArrowLeft className="w-4 h-4" /> Voltar</button>
            {step < totalSteps - 1
              ? <button type="button" onClick={next} className="px-6 py-3 rounded-xl bg-accent-600 text-white font-semibold text-sm flex items-center gap-2">Próxima etapa <ArrowRight className="w-4 h-4" /></button>
              : <button type="submit" disabled={submitting} className="px-6 py-3 rounded-xl bg-accent-600 text-white font-semibold text-sm flex items-center gap-2"><Send className="w-4 h-4" /> {submitting ? 'Enviando...' : 'Enviar briefing'}</button>}
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};
