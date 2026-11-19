import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Download,
  Building,
  Mail,
  Phone,
  Calendar,
  Globe,
  Smartphone,
  CheckCircle,
  ExternalLink,
  Layers,
  Palette,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateBriefingPdf } from '../lib/pdf';
import { Briefing, BriefingStatus } from '../types/briefing';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const BriefingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const [briefing, setBriefing] = useState<Briefing | null>(
    (location.state as any)?.briefing || null
  );
  const [loading, setLoading] = useState(!briefing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (briefing) return;

    async function loadBriefing() {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('briefings')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setBriefing(data);
      } catch (err: any) {
        setError('Não foi possível carregar o briefing ou ele não existe.');
      } finally {
        setLoading(false);
      }
    }

    loadBriefing();
  }, [id, briefing]);

  const handleStatusChange = async (newStatus: BriefingStatus) => {
    if (!briefing) return;
    setBriefing({ ...briefing, status: newStatus });
    try {
      await supabase.from('briefings').update({ status: newStatus }).eq('id', briefing.id);
    } catch (_) {}
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-ink-500 text-sm">Carregando briefing...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !briefing) {
    return (
      <div className="min-h-screen flex flex-col bg-surface-50">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h2 className="text-xl font-bold text-navy-900 mb-2">Briefing não encontrado</h2>
          <p className="text-sm text-ink-500 mb-4">{error || 'Verifique o link ou volte para a listagem.'}</p>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent-600 text-white font-semibold text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a Listagem
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const d = (briefing.dados as any) || {};

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Navigation & Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <Link
            to="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-navy-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar para a listagem
          </Link>

          <div className="flex items-center gap-3">
            <select
              value={briefing.status}
              onChange={(e) => handleStatusChange(e.target.value as BriefingStatus)}
              className="px-3.5 py-2 rounded-xl border border-surface-200 text-xs sm:text-sm font-semibold bg-white text-ink-700 shadow-sm"
            >
              <option value="novo">Status: Novo</option>
              <option value="em_analise">Status: Em análise</option>
              <option value="concluido">Status: Concluído</option>
              <option value="arquivado">Status: Arquivado</option>
            </select>

            <button
              type="button"
              onClick={() => generateBriefingPdf(briefing)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-accent-600 hover:bg-accent-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-accent-600/20 transition-all"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </button>
          </div>
        </div>

        {/* Card Principal de Identificação */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-surface-200 shadow-sm mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-200 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold ${
                    briefing.tipo_briefing === 'Site'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : briefing.tipo_briefing === 'LandingPage'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : briefing.tipo_briefing === 'Ecommerce'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : briefing.tipo_briefing === 'Branding'
                          ? 'bg-pink-50 text-pink-700 border border-pink-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                  }`}
                >
                  {briefing.tipo_briefing === 'Site' || briefing.tipo_briefing === 'LandingPage' || briefing.tipo_briefing === 'Ecommerce' || briefing.tipo_briefing === 'Branding' ? (
                    <Globe className="w-3.5 h-3.5 mr-1" />
                  ) : (
                    <Smartphone className="w-3.5 h-3.5 mr-1" />
                  )}
                  {briefing.tipo_briefing === 'Site'
                    ? 'Briefing de Site'
                    : briefing.tipo_briefing === 'LandingPage'
                      ? 'Briefing de Landing Page'
                      : briefing.tipo_briefing === 'Ecommerce'
                        ? 'Briefing de E-Commerce'
                        : briefing.tipo_briefing === 'Branding'
                          ? 'Briefing de Branding'
                          : 'Briefing de Aplicativo'}
                </span>
                <span className="text-xs text-ink-300">•</span>
                <span className="text-xs text-ink-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(briefing.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
                {briefing.nome}
              </h1>
              {briefing.empresa && (
                <p className="text-sm font-medium text-ink-500 mt-1 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-ink-300" />
                  {briefing.empresa} {d.cargo ? `(${d.cargo})` : ''}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 bg-surface-50 p-4 rounded-2xl border border-surface-200/80 text-xs text-ink-700">
              <span className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-accent-600" />
                <a href={`mailto:${briefing.email}`} className="hover:underline">
                  {briefing.email}
                </a>
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-600" />
                <a
                  href={`https://wa.me/55${briefing.telefone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline text-emerald-700 font-semibold"
                >
                  {briefing.telefone} (WhatsApp)
                </a>
              </span>
              {(d.site_atual || d.site) && (
                <span className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-accent-600" />
                  <a
                    href={d.site_atual || d.site}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline text-accent-700"
                  >
                    Ver site atual
                  </a>
                </span>
              )}
            </div>
          </div>

          {/* Respostas em Seções Estruturadas */}
          <div className="space-y-8">
            {/* Bloco 1: O Negócio */}
            <div>
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs border-b border-surface-100 pb-2 mb-3">
                01 · Sobre o Negócio
              </h2>
              <div className="bg-surface-50/60 p-4 rounded-2xl border border-surface-200/60 text-sm leading-relaxed text-ink-900 whitespace-pre-wrap">
                {d.negocio || 'Não informado'}
              </div>
            </div>

            {/* Bloco 2: O Projeto */}
            <div>
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs border-b border-surface-100 pb-2 mb-3">
                02 · O Projeto & Objetivos
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {briefing.tipo_briefing === 'App' && d.nome_projeto && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Nome do Projeto:</span>
                    <p className="text-sm font-bold text-navy-900">{d.nome_projeto}</p>
                  </div>
                )}

                {briefing.tipo_briefing === 'App' && d.problema && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Problema a Resolver:</span>
                    <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.problema}</p>
                  </div>
                )}

                <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                  <span className="text-xs font-semibold text-ink-500 block mb-1">Objetivo Principal:</span>
                  <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.objetivo || 'Não informado'}</p>
                </div>

                {(d.tipo_site || d.tipo_app) && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-2">Tipo de Aplicação / Site:</span>
                    <div className="flex flex-wrap gap-2">
                      {((d.tipo_site || d.tipo_app) as string[]).map((t: string) => (
                        <span key={t} className="px-3 py-1 bg-white border border-surface-200 text-xs font-semibold rounded-lg text-ink-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {d.acao_principal && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Ação Principal Esperada:</span>
                    <p className="text-sm text-ink-900">{d.acao_principal}</p>
                  </div>
                )}

                {d.diferencial && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Diferencial do Negócio:</span>
                    <p className="text-sm text-ink-900">{d.diferencial}</p>
                  </div>
                )}

                {d.concorrentes && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60 overflow-hidden">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Concorrentes / Referências:</span>
                    <div className="text-sm text-ink-900 space-y-1">
                      {d.concorrentes.split('\n').filter((l: string) => l.trim().length > 0).map((item: string, idx: number) => {
                        const trimmed = item.trim();
                        const isUrl = /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
                        const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

                        return isUrl ? (
                          <a
                            key={idx}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={trimmed}
                            className="block text-accent-600 hover:underline truncate sm:break-all font-medium"
                          >
                            {trimmed}
                          </a>
                        ) : (
                          <p key={idx} className="truncate sm:whitespace-pre-wrap sm:break-words" title={trimmed}>
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco 3: Público e Estrutura */}
            <div>
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs border-b border-surface-100 pb-2 mb-3">
                03 · Público & Estrutura
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                  <span className="text-xs font-semibold text-ink-500 block mb-1">Público-Alvo:</span>
                  <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.publico || 'Não informado'}</p>
                </div>

                {d.paginas && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-2">Páginas Desejadas:</span>
                    <div className="flex flex-wrap gap-2">
                      {(d.paginas as string[]).map((p: string) => (
                        <span key={p} className="px-2.5 py-1 bg-white border border-surface-200 text-xs font-medium rounded-lg text-ink-700">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {d.dispositivos && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Dispositivos Principais:</span>
                    <p className="text-sm font-semibold text-ink-900">{(d.dispositivos as string[]).join(', ')}</p>
                  </div>
                )}

                {d.qtd_usuarios && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Estimativa de Usuários:</span>
                    <p className="text-sm font-semibold text-ink-900">{d.qtd_usuarios}</p>
                  </div>
                )}

                {d.textos && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Fornecimento de Textos:</span>
                    <p className="text-sm text-ink-900">{d.textos}</p>
                  </div>
                )}

                {d.imagens && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Fornecimento de Imagens:</span>
                    <p className="text-sm text-ink-900">{d.imagens}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco 4: Funcionalidades */}
            <div>
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs border-b border-surface-100 pb-2 mb-3">
                04 · Funcionalidades & Integrações
              </h2>
              <div className="space-y-4">
                {(d.funcionalidades || d.recursos) && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-2">Recursos / Funcionalidades Marcadas:</span>
                    <div className="flex flex-wrap gap-2">
                      {((d.funcionalidades || d.recursos) as string[]).map((f: string) => (
                        <span key={f} className="px-2.5 py-1 bg-accent-50 text-accent-700 border border-accent-200 text-xs font-semibold rounded-lg">
                          ✓ {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {d.funcionalidades_essenciais && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-accent-700 block mb-1">MVP — Funcionalidades Mais Importantes:</span>
                    <p className="text-sm font-medium text-ink-900 whitespace-pre-wrap">{d.funcionalidades_essenciais}</p>
                  </div>
                )}

                {d.integracoes && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Integrações com Ferramentas Externas:</span>
                    <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.integracoes}</p>
                  </div>
                )}

                {d.sistema_existente && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Sistema / Planilha a Substituir:</span>
                    <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.sistema_existente}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco 5: Design e Identidade */}
            <div>
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs border-b border-surface-100 pb-2 mb-3">
                05 · Design & Identidade Visual
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                  <span className="text-xs font-semibold text-ink-500 block mb-1">Possui Identidade Visual?</span>
                  <p className="text-sm text-ink-900">{d.identidade || 'Não informado'}</p>
                </div>

                <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                  <span className="text-xs font-semibold text-ink-500 block mb-1">Estilo Visual:</span>
                  <p className="text-sm text-ink-900">{d.estilo || 'Não informado'}</p>
                </div>

                {d.cores && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Cores Preferidas:</span>
                    <p className="text-sm text-ink-900">{d.cores}</p>
                  </div>
                )}

                {d.tema && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Tema:</span>
                    <p className="text-sm text-ink-900">{d.tema}</p>
                  </div>
                )}

                {d.referencias_visuais && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60 overflow-hidden">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Referências Visuais:</span>
                    <div className="text-sm text-ink-900 space-y-1">
                      {d.referencias_visuais.split('\n').filter((l: string) => l.trim().length > 0).map((item: string, idx: number) => {
                        const trimmed = item.trim();
                        const isUrl = /^https?:\/\//i.test(trimmed) || /^www\./i.test(trimmed);
                        const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

                        return isUrl ? (
                          <a
                            key={idx}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={trimmed}
                            className="block text-accent-600 hover:underline truncate sm:break-all font-medium"
                          >
                            {trimmed}
                          </a>
                        ) : (
                          <p key={idx} className="truncate sm:whitespace-pre-wrap sm:break-words" title={trimmed}>
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                )}

                {d.link_arquivos && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60 overflow-hidden">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Link para Logo / Arquivos:</span>
                    <a
                      href={d.link_arquivos}
                      target="_blank"
                      rel="noreferrer"
                      title={d.link_arquivos}
                      className="text-sm text-accent-600 hover:underline font-semibold flex items-center gap-1.5 mt-1 max-w-full overflow-hidden"
                    >
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate sm:break-all">{d.link_arquivos}</span>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Bloco 6: Prazo e Investimento */}
            <div>
              <h2 className="text-base font-bold text-navy-900 uppercase tracking-wider text-xs border-b border-surface-100 pb-2 mb-3">
                06 · Prazo, Orçamento & Encerramento
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                  <span className="text-xs font-semibold text-ink-500 block mb-1">Prazo Desejado:</span>
                  <p className="text-sm font-bold text-navy-900">{d.prazo || 'Não informado'}</p>
                </div>

                <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                  <span className="text-xs font-semibold text-ink-500 block mb-1">Orçamento Previsto:</span>
                  <p className="text-sm font-bold text-emerald-700">{d.orcamento || 'Não informado'}</p>
                </div>

                {d.dominio && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Domínio e Hospedagem:</span>
                    <p className="text-sm text-ink-900">{d.dominio}</p>
                  </div>
                )}

                {d.manutencao && (
                  <div className="bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Manutenção e Suporte:</span>
                    <p className="text-sm text-ink-900">{d.manutencao}</p>
                  </div>
                )}

                {d.sucesso && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Critério de Sucesso do Projeto:</span>
                    <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.sucesso}</p>
                  </div>
                )}

                {d.observacoes && (
                  <div className="sm:col-span-2 bg-surface-50/60 p-4 rounded-xl border border-surface-200/60">
                    <span className="text-xs font-semibold text-ink-500 block mb-1">Observações Adicionais:</span>
                    <p className="text-sm text-ink-900 whitespace-pre-wrap">{d.observacoes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
