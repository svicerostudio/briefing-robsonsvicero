import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Trash2,
  ExternalLink,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Archive,
  RefreshCw,
  LogOut,
  Building,
  Mail,
  Phone,
  Layers,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateBriefingPdf } from '../lib/pdf';
import { Briefing, BriefingStatus, BriefingType } from '../types/briefing';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const AdminDashboard: React.FC = () => {
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const navigate = useNavigate();

  const fetchBriefings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('briefings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBriefings(data || []);
    } catch (err) {
      console.error('Erro ao buscar briefings no Supabase:', err);
      setBriefings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefings();
  }, []);

  const handleStatusChange = async (id: string, newStatus: BriefingStatus) => {
    setBriefings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: newStatus } : b))
    );

    try {
      await supabase
        .from('briefings')
        .update({ status: newStatus })
        .eq('id', id);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este briefing?')) return;

    setDeletingId(id);
    try {
      await supabase.from('briefings').delete().eq('id', id);
      setBriefings((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error('Erro ao deletar:', err);
      setBriefings((prev) => prev.filter((b) => b.id !== id));
    } finally {
      setDeletingId(null);
    }
  };

  // Filtragem dos dados
  const filteredBriefings = briefings.filter((b) => {
    const matchesSearch =
      b.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.empresa && b.empresa.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType =
      filterType === 'todos' || b.tipo_briefing.toLowerCase() === filterType.toLowerCase();

    const matchesStatus =
      filterStatus === 'todos' || b.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesType && matchesStatus;
  });

  const countTotal = briefings.length;
  const countNovos = briefings.filter((b) => b.status === 'novo').length;
  const countSites = briefings.filter((b) => b.tipo_briefing === 'Site').length;
  const countApps = briefings.filter((b) => b.tipo_briefing === 'App').length;

  return (
    <div className="min-h-screen flex flex-col bg-surface-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900">
              Painel de Briefings
            </h1>
            <p className="text-sm text-ink-500 mt-1">
              Visualize todas as respostas dos clientes e baixe os relatórios em PDF.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchBriefings}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-surface-200 text-xs sm:text-sm font-semibold text-ink-700 hover:bg-surface-50 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
          </div>
        </div>

        {/* Métricas / Cards rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-surface-200/80 shadow-sm">
            <span className="text-xs font-semibold text-ink-500">Total de Briefings</span>
            <p className="text-2xl font-bold text-navy-900 mt-1">{countTotal}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-surface-200/80 shadow-sm">
            <span className="text-xs font-semibold text-emerald-600">Novos (Aguardando)</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{countNovos}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-surface-200/80 shadow-sm">
            <span className="text-xs font-semibold text-accent-600">Briefings de Sites</span>
            <p className="text-2xl font-bold text-navy-900 mt-1">{countSites}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-surface-200/80 shadow-sm">
            <span className="text-xs font-semibold text-purple-600">Briefings de Apps</span>
            <p className="text-2xl font-bold text-navy-900 mt-1">{countApps}</p>
          </div>
        </div>

        {/* Barra de Filtros e Busca */}
        <div className="bg-white p-4 rounded-2xl border border-surface-200 shadow-sm mb-6 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-ink-300 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por cliente, empresa ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-accent-600"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-500 hidden sm:inline">Tipo:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 rounded-xl border border-surface-200 text-xs sm:text-sm bg-white font-medium text-ink-700"
              >
                <option value="todos">Todos os Tipos</option>
                <option value="site">Apenas Sites</option>
                <option value="app">Apenas Apps</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-ink-500 hidden sm:inline">Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 rounded-xl border border-surface-200 text-xs sm:text-sm bg-white font-medium text-ink-700"
              >
                <option value="todos">Todos os Status</option>
                <option value="novo">Novo</option>
                <option value="em_analise">Em análise</option>
                <option value="concluido">Concluído</option>
                <option value="arquivado">Arquivado</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela de Listagem */}
        <div className="bg-white rounded-3xl border border-surface-200/90 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-16 text-center text-ink-500 text-sm">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-accent-600" />
              Carregando briefings...
            </div>
          ) : filteredBriefings.length === 0 ? (
            <div className="py-16 text-center text-ink-500 text-sm">
              <FileText className="w-10 h-10 mx-auto mb-3 text-ink-300" />
              {briefings.length === 0
                ? 'Nenhum briefing cadastrado ainda.'
                : 'Nenhum briefing encontrado para estes filtros.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-surface-50/80 border-b border-surface-200 text-xs uppercase font-semibold text-ink-500">
                  <tr>
                    <th className="px-6 py-4">Cliente / Empresa</th>
                    <th className="px-6 py-4">Tipo</th>
                    <th className="px-6 py-4">Data</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-200">
                  {filteredBriefings.map((b) => (
                    <tr key={b.id} className="hover:bg-surface-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-navy-900">{b.nome}</div>
                        {b.empresa && (
                          <div className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                            <Building className="w-3 h-3 text-ink-300" />
                            {b.empresa}
                          </div>
                        )}
                        <div className="text-xs text-ink-500 flex items-center gap-3 mt-1">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-ink-300" />
                            {b.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-ink-300" />
                            {b.telefone}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            b.tipo_briefing === 'Site'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {b.tipo_briefing === 'Site' ? 'Website' : 'Aplicativo Web'}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-xs text-ink-500">
                        {new Date(b.created_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                        <div className="text-[11px] text-ink-300">
                          {new Date(b.created_at).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value as BriefingStatus)}
                          className={`text-xs font-semibold rounded-lg px-2.5 py-1 border transition-all ${
                            b.status === 'novo'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : b.status === 'em_analise'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : b.status === 'concluido'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-surface-100 text-ink-500 border-surface-200'
                          }`}
                        >
                          <option value="novo">Novo</option>
                          <option value="em_analise">Em análise</option>
                          <option value="concluido">Concluído</option>
                          <option value="arquivado">Arquivado</option>
                        </select>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => generateBriefingPdf(b)}
                            title="Baixar em PDF"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-50 text-accent-700 border border-accent-200 hover:bg-accent-100 text-xs font-semibold transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            PDF
                          </button>

                          <Link
                            to={`/admin/briefing/${b.id}`}
                            state={{ briefing: b }}
                            title="Ver Respostas Detalhadas"
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface-100 hover:bg-surface-200 text-ink-700 text-xs font-semibold transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Ver
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDelete(b.id)}
                            disabled={deletingId === b.id}
                            title="Excluir briefing"
                            className="p-1.5 text-ink-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
