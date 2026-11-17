# Briefing de Projeto — Robson Svicero

Projeto completo em **React + Vite + TypeScript + Tailwind CSS** integrado ao **Supabase**, com formulários dinâmicos de briefing (Site e Aplicativo Web), salvamento automático de rascunhos, painel administrativo protegido e geração de relatórios diagramados em **PDF**.

---

## 🚀 Como Configurar o Supabase

1. Crie um projeto gratuito em [supabase.com](https://supabase.com).
2. No menu lateral do Supabase, clique em **SQL Editor**.
3. Abra o arquivo `supabase_schema.sql` deste projeto, copie todo o conteúdo e cole no SQL Editor do Supabase. Em seguida, clique em **Run**.
   * Ele criará a tabela `briefings`, os índices de alta performance e as políticas de segurança (RLS).
4. No Supabase, vá em **Authentication > Users** e clique em **Add User > Create User**:
   * Informe seu e-mail e crie uma senha forte (esta será a sua credencial para acessar `/admin`).
5. No Supabase, vá em **Project Settings > API Keys** e copie:
   * **Project URL**
   * **Publishable key** (ou chave `anon / public` legada)
6. Edite o arquivo `.env` na raiz deste projeto com essas chaves:
   ```env
   VITE_SUPABASE_URL=https://seu-projeto.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sua-chave-publishable-aqui
   ```

---

## 💻 Desenvolvimento Local

Para rodar em sua máquina:
```bash
npm run dev
```
O Vite iniciará o servidor local em `http://localhost:5173`.

---

## 🌐 Publicação na Hostinger

1. Gere o pacote de produção:
   ```bash
   npm run build
   ```
2. O Vite gerará a pasta `dist/` pronta para deploy.
3. Acesse o **Gerenciador de Arquivos** da Hostinger (ou use FTP/FileZilla):
   * Entre na pasta do seu domínio (geralmente `public_html`).
   * Remova os arquivos antigos e faça o upload de **todo o conteúdo de dentro da pasta `dist/`** (incluindo o arquivo `.htaccess` e a pasta `assets`).
4. Pronto! O `.htaccess` já incluso cuidará de direcionar todas as rotas da SPA (`/site`, `/app`, `/admin`, `/admin/briefing/:id`) sem causar erro 404 ao atualizar a página.
