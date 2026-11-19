export type BriefingType = 'Site' | 'App' | 'LandingPage' | 'Ecommerce' | 'Branding';

export type BriefingStatus = 'novo' | 'em_analise' | 'concluido' | 'arquivado';

export interface SiteBriefingData {
  // Etapa 1 - Sobre você
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cargo?: string;
  site_atual?: string;
  negocio: string;

  // Etapa 2 - O projeto
  tipo_site: string[];
  objetivo: string;
  acao_principal?: string;
  diferencial?: string;
  concorrentes?: string;

  // Etapa 3 - Público e conteúdo
  publico: string;
  paginas: string[];
  textos?: string;
  imagens?: string;
  paginas_extra?: string;

  // Etapa 4 - Funcionalidades
  recursos: string[];
  integracoes?: string;
  autonomia?: string;
  observacoes_func?: string;

  // Etapa 5 - Design e identidade
  identidade?: string;
  referencias_visuais?: string;
  cores?: string;
  estilo?: string;
  link_arquivos?: string;

  // Etapa 6 - Prazo e investimento
  prazo?: string;
  orcamento?: string;
  dominio?: string;
  manutencao?: string;
}

export interface AppBriefingData {
  // Etapa 1 - Sobre você
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  cargo?: string;
  site?: string;
  negocio: string;

  // Etapa 2 - O projeto
  nome_projeto?: string;
  problema: string;
  objetivo: string;
  tipo_app: string[];
  concorrentes?: string;

  // Etapa 3 - Público e usuários
  publico: string;
  qtd_usuarios?: string;
  perfis?: string;
  dispositivos: string[];

  // Etapa 4 - Funcionalidades
  funcionalidades: string[];
  funcionalidades_essenciais: string;
  integracoes?: string;
  sistema_existente?: string;

  // Etapa 5 - Design e identidade
  identidade?: string;
  referencias_visuais?: string;
  cores?: string;
  estilo?: string;
  tema?: string;
  link_arquivos?: string;

  // Etapa 6 - Prazo e investimento
  prazo?: string;
  orcamento?: string;
  dominio?: string;
  manutencao?: string;
  sucesso?: string;
  observacoes?: string;
}

export interface Briefing {
  id: string;
  created_at: string;
  tipo_briefing: BriefingType;
  nome: string;
  email: string;
  telefone: string;
  empresa?: string;
  status: BriefingStatus;
  dados: SiteBriefingData | AppBriefingData | Record<string, any>;
}
