// Controlador do Artigo Individual (artigo.html)
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postSlugOrId = urlParams.get('slug') || urlParams.get('id');

  let allPosts = [];
  try {
    const localData = localStorage.getItem('central_blog_posts');
    if (localData) {
      allPosts = JSON.parse(localData);
    } else {
      const response = await fetch('data/posts.json');
      if (response.ok) {
        allPosts = await response.json();
      }
    }
  } catch (e) {
    console.error('Erro ao carregar dados do artigo:', e);
  }

  // Encontra o post pelo slug ou ID
  let currentPost = allPosts.find(p => p.slug === postSlugOrId || p.id === postSlugOrId);

  // Se não encontrar, pega o primeiro como fallback
  if (!currentPost && allPosts.length > 0) {
    currentPost = allPosts[0];
  }

  if (!currentPost) {
    document.getElementById('articleContainer').innerHTML = `
      <div class="container" style="padding: 180px 20px; text-align: center;">
        <h2>Artigo não encontrado</h2>
        <p>O conteúdo solicitado não está disponível ou foi removido.</p>
        <a href="blog.html" class="btn btn-primary" style="margin-top: 20px;">Voltar ao Blog</a>
      </div>
    `;
    return;
  }

  // Atualiza título da página e Meta Tags
  document.title = `${currentPost.title} | Central Soluções Empresariais`;

  // Atualiza Meta Tags Open Graph & Twitter dinamicamente
  const metaOgTitle = document.querySelector('meta[property="og:title"]');
  if (metaOgTitle) metaOgTitle.content = currentPost.title;

  const metaOgDesc = document.querySelector('meta[property="og:description"]');
  if (metaOgDesc) metaOgDesc.content = currentPost.excerpt || currentPost.title;

  const metaOgImage = document.querySelector('meta[property="og:image"]');
  if (metaOgImage && currentPost.image) {
    metaOgImage.content = currentPost.image.startsWith('http') ? currentPost.image : `${window.location.origin}/${currentPost.image}`;
  }

  const metaOgUrl = document.querySelector('meta[property="og:url"]');
  if (metaOgUrl) metaOgUrl.content = window.location.href;

  const metaTwTitle = document.querySelector('meta[name="twitter:title"]');
  if (metaTwTitle) metaTwTitle.content = currentPost.title;

  const metaTwDesc = document.querySelector('meta[name="twitter:description"]');
  if (metaTwDesc) metaTwDesc.content = currentPost.excerpt || currentPost.title;

  // Injeta Schema.org BlogPosting para SEO & IA
  const existingArticleSchema = document.getElementById('articleJsonLd');
  if (existingArticleSchema) existingArticleSchema.remove();

  const articleSchemaScript = document.createElement('script');
  articleSchemaScript.id = 'articleJsonLd';
  articleSchemaScript.type = 'application/ld+json';
  articleSchemaScript.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": currentPost.title,
    "description": currentPost.excerpt || currentPost.title,
    "image": currentPost.image ? (currentPost.image.startsWith('http') ? currentPost.image : `https://soucentral.com.br/${currentPost.image}`) : "https://soucentral.com.br/logo-dark-transparent.png",
    "datePublished": currentPost.date || "2026-09-22",
    "dateModified": currentPost.date || "2026-09-22",
    "author": {
      "@type": "Organization",
      "name": currentPost.author || "Central Soluções Empresariais",
      "url": "https://soucentral.com.br"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Central Soluções Empresariais",
      "logo": {
        "@type": "ImageObject",
        "url": "https://soucentral.com.br/logo-dark-transparent.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": window.location.href
    }
  });
  document.head.appendChild(articleSchemaScript);


  // Preenche dados do Cabeçalho do Artigo
  document.getElementById('articleCategoryBadge').textContent = currentPost.category || 'Geral';
  document.getElementById('articleMainTitle').textContent = currentPost.title;
  document.getElementById('articleBreadcrumbTitle').textContent = currentPost.title;
  document.getElementById('articleAuthorName').textContent = currentPost.author || 'Escritório Central';
  document.getElementById('articleAuthorRole').textContent = currentPost.authorRole || 'Consultoria Empresarial';

  // Formata data
  let formattedDate = currentPost.date;
  if (currentPost.date && currentPost.date.includes('-')) {
    const parts = currentPost.date.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      formattedDate = d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    }
  }
  document.getElementById('articleDate').textContent = formattedDate;
  document.getElementById('articleReadTime').textContent = currentPost.readTime || '5 min de leitura';

  // Imagem de Destaque
  const featuredImg = document.getElementById('articleFeaturedImg');
  if (featuredImg) {
    featuredImg.src = currentPost.image || 'Hero 01.jpg';
    featuredImg.alt = currentPost.title;
  }

  // Conteúdo Rico (HTML)
  const richContent = document.getElementById('articleRichContent');
  if (richContent) {
    richContent.innerHTML = currentPost.content || `<p>${currentPost.excerpt}</p>`;
  }

  // Links de Compartilhamento
  const currentUrl = encodeURIComponent(window.location.href);
  const postTitle = encodeURIComponent(currentPost.title);

  const shareWhats = document.getElementById('shareWhatsApp');
  if (shareWhats) {
    shareWhats.href = `https://api.whatsapp.com/send?text=${postTitle}%20${currentUrl}`;
  }

  const shareLinkedin = document.getElementById('shareLinkedIn');
  if (shareLinkedin) {
    shareLinkedin.href = `https://www.linkedin.com/sharing/share-offsite/?url=${currentUrl}`;
  }

  const shareCopy = document.getElementById('shareCopyLink');
  if (shareCopy) {
    shareCopy.addEventListener('click', (e) => {
      e.preventDefault();
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Link do artigo copiado para a área de transferência!');
      });
    });
  }

  // Posts Relacionados na Sidebar
  const relatedList = document.getElementById('sidebarRelatedPosts');
  if (relatedList) {
    const related = allPosts.filter(p => p.id !== currentPost.id).slice(0, 3);
    relatedList.innerHTML = related.map(p => `
      <div style="display: flex; gap: 14px; align-items: center; margin-bottom: 16px;">
        <img src="${p.image || 'Hero 01.jpg'}" alt="${p.title}" style="width: 70px; height: 55px; border-radius: 8px; object-fit: cover; flex-shrink: 0;">
        <div>
          <a href="artigo.html?slug=${p.slug || p.id}" style="color: var(--color-noir-900); font-size: 0.9rem; font-weight: 700; line-height: 1.35; text-decoration: none; display: block;">
            ${p.title}
          </a>
          <span style="font-size: 0.78rem; color: var(--color-gold-600); font-weight: 600;">${p.category}</span>
        </div>
      </div>
    `).join('');
  }
});
