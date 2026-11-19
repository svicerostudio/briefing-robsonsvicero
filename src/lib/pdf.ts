import jsPDF from 'jspdf';
import { Briefing } from '../types/briefing';

export function generateBriefingPdf(briefing: Briefing) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  function checkPageBreak(neededHeight: number) {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin + 10;
      drawPageHeader(true);
    }
  }

  function drawPageHeader(isSecondary = false) {
    // Linha superior decorativa
    doc.setFillColor(7, 26, 69); // Navy 900
    doc.rect(0, 0, pageWidth, isSecondary ? 4 : 8, 'F');
    doc.setFillColor(0, 82, 204); // Accent 600
    doc.rect(0, isSecondary ? 4 : 8, pageWidth, 2, 'F');
  }

  // Cabeçalho Principal
  drawPageHeader(false);
  y = 20;

  // Título e Subtítulo
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(7, 26, 69);
  doc.text('Relatório de Briefing', margin, y);

  y += 7;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(108, 115, 125);
  doc.text(
    `Tipo: ${
      briefing.tipo_briefing === 'Site'
        ? 'Criação de Website'
        : briefing.tipo_briefing === 'LandingPage'
          ? 'Landing Page'
          : briefing.tipo_briefing === 'Ecommerce'
            ? 'E-Commerce'
            : briefing.tipo_briefing === 'Branding'
              ? 'Branding / Identidade Visual'
              : 'Aplicativo Web (App)'
    } | Robson Svicero`,
    margin,
    y
  );

  // Badge de Status e Data na direita
  const dateStr = new Date(briefing.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.setFontSize(9);
  doc.text(`Enviado em: ${dateStr}`, pageWidth - margin, y - 7, { align: 'right' });
  doc.text(`Status: ${briefing.status.toUpperCase()}`, pageWidth - margin, y, { align: 'right' });

  // Linha separadora
  y += 6;
  doc.setDrawColor(226, 233, 242);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Box com Informações de Contato
  doc.setFillColor(247, 249, 252);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');
  doc.setDrawColor(226, 233, 242);
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'S');

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(7, 26, 69);
  doc.text(briefing.nome, margin + 5, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(59, 68, 79);
  const empresaTxt = briefing.empresa ? `Empresa: ${briefing.empresa}` : 'Pessoa Física / Não informado';
  doc.text(empresaTxt, margin + 5, y + 13);
  doc.text(`E-mail: ${briefing.email}`, margin + 5, y + 19);

  doc.text(`WhatsApp: ${briefing.telefone}`, margin + contentWidth / 2, y + 19);

  y += 32;

  // Função para desenhar seções
  function addSection(title: string) {
    checkPageBreak(16);
    doc.setFillColor(234, 241, 251);
    doc.roundedRect(margin, y, contentWidth, 8, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(0, 82, 204);
    doc.text(title.toUpperCase(), margin + 4, y + 5.5);
    y += 12;
  }

  // Função para desenhar pergunta e resposta
  function addField(label: string, value?: string | string[] | null) {
    if (!value || (Array.isArray(value) && value.length === 0)) return;

    let textValue = '';
    if (Array.isArray(value)) {
      textValue = value.join(', ');
    } else {
      textValue = String(value).trim();
    }

    if (!textValue) return;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(59, 68, 79);

    const labelLines = doc.splitTextToSize(label, contentWidth);
    checkPageBreak(labelLines.length * 4 + 10);

    doc.text(labelLines, margin, y);
    y += labelLines.length * 4 + 1;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(13, 21, 33);

    const valueLines = doc.splitTextToSize(textValue, contentWidth);
    checkPageBreak(valueLines.length * 4.5 + 4);
    doc.text(valueLines, margin, y);
    y += valueLines.length * 4.5 + 4;
  }

  const d = briefing.dados as any;

  // 1. Sobre Você & Negócio
  addSection('1. Sobre Você e Negócio');
  addField('Cargo', d.cargo);
  addField('Site ou Rede Social Atual', d.site_atual || d.site);
  addField('Descrição do Negócio', d.negocio);

  // 2. O Projeto
  addSection('2. O Projeto');
  if (briefing.tipo_briefing === 'App') {
    addField('Nome do Projeto (ou provisório)', d.nome_projeto);
    addField('Problema Principal que o App Resolve', d.problema);
    addField('Objetivo Principal do App', d.objetivo);
    addField('Tipo de Aplicação', d.tipo_app);
  } else {
    addField('Tipo de Site', d.tipo_site);
    addField('Objetivo Principal do Site', d.objetivo);
    addField('Ação Principal que o Visitante Deve Realizar', d.acao_principal);
    addField('Diferencial do Negócio', d.diferencial);
  }
  addField('Concorrentes e Referências', d.concorrentes);
  if (briefing.tipo_briefing === 'Branding') {
    addField('Tipo de Projeto de Marca', d.tipo_marca);
    addField('Motivo do Projeto', d.motivo);
  }

  // 3. Público e Estrutura
  addSection('3. Público e Estrutura');
  addField('Público-Alvo', d.publico);
  if (briefing.tipo_briefing === 'Branding') {
    addField('Valores e Propósito da Marca', d.valores);
    addField('Diferencial da Marca', d.diferenca);
  }
  if (briefing.tipo_briefing === 'App') {
    addField('Estimativa de Usuários (1º ano)', d.qtd_usuarios);
    addField('Perfis de Acesso', d.perfis);
    addField('Dispositivos Principais', d.dispositivos);
  } else {
    addField('Páginas Desejadas', d.paginas);
    addField('Quem fornecerá os textos?', d.textos);
    addField('Quem fornecerá as imagens?', d.imagens);
    addField('Detalhes sobre a estrutura', d.paginas_extra);
  }

  // 4. Funcionalidades
  addSection('4. Funcionalidades e Requisitos');
  if (briefing.tipo_briefing === 'App') {
    addField('Funcionalidades Desejadas', d.funcionalidades);
    addField('Funcionalidades Mais Importantes (MVP)', d.funcionalidades_essenciais);
    addField('Integrações Necessárias', d.integracoes);
    addField('Sistema ou Planilha Atual a Substituir', d.sistema_existente);
  } else {
    addField('Recursos Desejados', d.recursos);
    addField('Integrações Necessárias', d.integracoes);
    addField('Autonomia de Edição', d.autonomia);
    addField('Outras Funcionalidades Específicas', d.observacoes_func);
  }

  // 5. Design e Identidade
  addSection('5. Design e Identidade Visual');
  addField('Possui Identidade Visual?', d.identidade);
  addField('Referências Visuais (Links)', d.referencias_visuais);
  addField('Cores Preferidas', d.cores);
  addField('Estilo Desejado', d.estilo);
  if (d.tema) addField('Tema Preferido', d.tema);
  addField('Link para Logo e Materiais', d.link_arquivos);

  // 6. Prazo e Investimento
  addSection('6. Prazo, Orçamento e Observações');
  addField('Prazo Desejado', d.prazo);
  addField('Faixa de Investimento', d.orcamento);
  addField('Possui Domínio / Hospedagem?', d.dominio);
  addField('Necessidade de Manutenção', d.manutencao);
  if (d.sucesso) addField('Critério de Sucesso do Projeto', d.sucesso);
  if (d.observacoes) addField('Observações Adicionais', d.observacoes);

  // Rodapé em todas as páginas
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(138, 147, 160);
    doc.text(
      `Página ${i} de ${pageCount} — Briefing Confidencial • Robson Svicero`,
      pageWidth / 2,
      pageHeight - 6,
      { align: 'center' }
    );
  }

  const cleanName = briefing.nome.toLowerCase().replace(/[^a-z0-9]/g, '-');
  doc.save(`briefing-${briefing.tipo_briefing.toLowerCase()}-${cleanName}.pdf`);
}
