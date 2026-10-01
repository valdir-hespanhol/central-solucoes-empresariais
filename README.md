# Central Soluções Empresariais - Website Institucional & Blog CMS

Portal corporativo moderno, responsivo e de alta performance desenvolvido para a **Central Soluções Empresariais** (Escritório Central de Contabilidade, fundado em 1964 em Indaiatuba - SP).

---

## 🚀 Tecnologias Utilizadas

- **Frontend:** HTML5 Semântico, CSS3 Moderno (Design System Noir & Champanhe Gold, Flexbox, CSS Grid, Glassmorphism), JavaScript Vanilla (ES6+).
- **Editor Visual CMS:** Quill.js WYSIWYG para edição de artigos sem necessidade de código.
- **Backend / APIs:** PHP para sincronização de posts (`api/posts.php`) e categorias (`api/categories.php`) com persistência em JSON (`data/posts.json`, `data/categories.json`) e fallback automático em `localStorage`.
- **Servidor & Segurança:** Apache / LiteSpeed com WAF (.htaccess), Headers de Segurança HTTP e regras anti-scraping/bots.

---

## ✨ Principais Funcionalidades

1. **Identidade Visual Premium:**
   - Paleta corporativa refinada em tons Noir (`#120C0E`), Charcoal e Champanhe Dourado (`#DAB78D`).
   - Totalmente responsivo para smartphones, tablets e desktops.
   - Contraste WCAG AA verificado em todos os textos e botões.

2. **Páginas Institucionais & Catálogo:**
   - **Início (`index.html`):** Hero dinâmico, números de destaque, diferenciais estratégicos, catálogo de serviços, depoimentos e FAQ sanfona.
   - **Quem Somos (`quem-somos.html`):** Trajetória de mais de 60 anos, equipe e valores da empresa.
   - **BPO Financeiro (`bpo-financeiro.html`):** Apresentação do serviço Agyle BPO (contas a pagar, receber, conciliação e relatórios).
   - **Soluções (`solucoes.html`):** Catálogo dos 4 pilares contábeis e nichos de mercado (Saúde e Construção Civil).
   - **Contato (`contato.html`):** Mapa do Google integrado, formulário de contato e canais diretos.
   - **Página 404 (`404.html`):** Página personalizada com atalhos de navegação inteligentes.

3. **Sistema de Blog & Painel Administrativo CMS:**
   - **Blog Público (`blog.html` & `artigo.html`):** Filtros dinâmicos por categoria, busca em tempo real, cálculo de tempo de leitura e botões de compartilhamento direto para WhatsApp e LinkedIn.
   - **Painel Administrativo (`admin.html`):** Login seguro, dashboard com contadores, gerenciamento de categorias em tempo real, criação/edição com upload de imagem e geração de backup JSON em 1 clique.
   - *Senha padrão de acesso ao Admin:* `central2026`

4. **Conformidade LGPD & Privacidade:**
   - Banner flutuante de consentimento de cookies com design não intrusivo.
   - Modal com opções granulares por categoria (*Necessários*, *Estatísticas/Analíticos*, *Comunicação/Marketing*).
   - Botão de preferências integrado ao rodapé de todas as páginas.

5. **SEO & Otimização para Inteligência Artificial (GEO):**
   - Dados estruturados **Schema.org (JSON-LD)** completos em todas as páginas (`AccountingService`, `LocalBusiness`, `FAQPage`, `BreadcrumbList`, `BlogPosting`).
   - Metadados Open Graph e Twitter Cards dinâmicos.
   - Arquivos [`sitemap.xml`](sitemap.xml) e [`robots.txt`](robots.txt) com permissões para rastreadores oficiais e IA (`GPTBot`, `ClaudeBot`, `PerplexityBot`, `Google-Extended`).
   - Padrão internacional [`llms.txt`](llms.txt) e base exaustiva [`llms-full.txt`](llms-full.txt) para consumo de LLMs e buscadores generativos.

6. **Firewall & Proteção Anti-Bot:**
   - Regras no `.htaccess` bloqueando scanners de vulnerabilidade (`sqlmap`, `nikto`, `wpscan`), scrapers comerciais e bibliotecas de automação.
   - Bloqueio de injeções SQL, XSS, tentativas de subida de diretório e probes de CMS.
   - Proteção de força bruta no painel com campo honeypot e lockout automático de 15 minutos após 5 erros.

---

## 💻 Como Rodar Localmente

### Opção 1: Usando Python
```bash
python -m http.server 8080
```
Acesse [http://localhost:8080/](http://localhost:8080/) no seu navegador.

### Opção 2: Usando PHP (Habilita APIs locais)
```bash
php -S localhost:8080
```

---

## 📁 Estrutura de Diretórios

```
├── api/                   # Endpoints PHP para persistência de dados
│   ├── categories.php     # API de gestão de categorias
│   └── posts.php          # API de gestão de artigos
├── css/                   # Estilos
│   └── style.css          # Design System e folhas de estilo do portal
├── data/                  # Base de dados em JSON
│   ├── categories.json    # Categorias cadastradas
│   └── posts.json         # Artigos publicados e rascunhos
├── js/                    # Scripts interativos
│   ├── admin.js           # Lógica do painel CMS
│   ├── artigo.js          # Renderizador do artigo individual
│   ├── blog.js            # Lógica dos filtros e busca do blog
│   └── main.js            # Menu, animações, WhatsApp e cookies LGPD
├── .htaccess              # Firewall WAF e configurações Apache
├── .gitignore             # Arquivos ignorados pelo Git
├── 404.html               # Página de erro customizada
├── admin.html             # Painel administrativo CMS
├── artigo.html            # Leitor de artigo do blog
├── blog.html              # Listagem de artigos
├── bpo-financeiro.html    # Página de BPO Financeiro
├── contato.html           # Página de Contato e Localização
├── index.html             # Página inicial
├── llms.txt               # Sumário executivo para Inteligência Artificial
├── llms-full.txt          # Base de conhecimento completa para IA
├── quem-somos.html        # Página institucional
├── README.md              # Documentação do repositório
├── robots.txt             # Diretivas para buscadores e IA
├── sitemap.xml            # Mapa do site indexável
└── solucoes.html          # Catálogo de soluções contábeis
```

---

## 📄 Licença e Direitos

&copy; 2026 Central Soluções Empresariais. Todos os direitos reservados.
Desenvolvido com excelência técnica e foco em resultados.
