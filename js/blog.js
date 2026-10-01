// Controlador do Blog Público (blog.html)
document.addEventListener('DOMContentLoaded', () => {
  let allPosts = [];
  let allCategories = [];
  let currentCategory = 'all';
  let searchTerm = '';

  const postsContainer = document.getElementById('blogPostsGrid');
  const featuredContainer = document.getElementById('blogFeaturedWrap');
  const searchInput = document.getElementById('blogSearchInput');
  const categoriesContainer = document.querySelector('.blog-categories-pills');

  // Verifica se há categoria passada na URL (ex: blog.html?categoria=Saude)
  const urlParams = new URLSearchParams(window.location.search);
  const catFromUrl = urlParams.get('categoria') || urlParams.get('cat');

  // Carrega posts e categorias do localStorage ou de data/
  async function loadData() {
    // 1. Carrega categorias
    try {
      const localCats = localStorage.getItem('central_blog_categories');
      if (localCats) {
        allCategories = JSON.parse(localCats);
      } else {
        const catRes = await fetch('data/categories.json');
        if (catRes.ok) {
          allCategories = await catRes.json();
          localStorage.setItem('central_blog_categories', JSON.stringify(allCategories));
        }
      }
    } catch (e) {
      console.warn('Fallback para categorias padrão:', e);
    }

    if (!allCategories || allCategories.length === 0) {
      allCategories = [
        { name: 'BPO Financeiro' },
        { name: 'Saúde' },
        { name: 'Construção Civil' },
        { name: 'Tributário' },
        { name: 'Trabalhista' },
        { name: 'Gestão' }
      ];
    }

    // 2. Carrega posts
    try {
      const localData = localStorage.getItem('central_blog_posts');
      if (localData) {
        allPosts = JSON.parse(localData);
      } else {
        const response = await fetch('data/posts.json');
        if (response.ok) {
          allPosts = await response.json();
          localStorage.setItem('central_blog_posts', JSON.stringify(allPosts));
        }
      }
    } catch (e) {
      console.warn('Erro ao carregar posts.json:', e);
      const localData = localStorage.getItem('central_blog_posts');
      if (localData) allPosts = JSON.parse(localData);
    }

    // Se tiver categoria na URL, ativa ela
    if (catFromUrl) {
      const matched = allCategories.find(c => c.name.toLowerCase() === catFromUrl.toLowerCase() || (c.slug && c.slug === catFromUrl.toLowerCase()));
      if (matched) {
        currentCategory = matched.name;
      }
    }

    renderCategoriesPills();
    renderBlog();
  }

  function renderCategoriesPills() {
    if (!categoriesContainer) return;

    categoriesContainer.innerHTML = `
      <button class="category-pill ${currentCategory === 'all' ? 'active' : ''}" data-category="all">Todos</button>
      ${allCategories.map(cat => `
        <button class="category-pill ${currentCategory === cat.name ? 'active' : ''}" data-category="${cat.name}">${cat.name}</button>
      `).join('')}
    `;

    // Reanexa eventos aos pills
    const pills = categoriesContainer.querySelectorAll('.category-pill');
    pills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-category');
        renderBlog();
      });
    });
  }

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    return dateStr;
  }

  function filterPosts() {
    return allPosts.filter(post => {
      if (post.status && post.status !== 'published') return false;

      const matchesCat = currentCategory === 'all' || post.category === currentCategory;
      const term = searchTerm.toLowerCase();
      const matchesSearch = !term || 
        post.title.toLowerCase().includes(term) || 
        post.excerpt.toLowerCase().includes(term) ||
        (post.category && post.category.toLowerCase().includes(term));

      return matchesCat && matchesSearch;
    });
  }

  function renderBlog() {
    const filtered = filterPosts();

    // Destaque (primeiro post quando categoria = 'all' e sem busca)
    if (featuredContainer) {
      if (currentCategory === 'all' && !searchTerm && filtered.length > 0) {
        const featured = filtered[0];
        featuredContainer.innerHTML = `
          <div class="blog-featured-card" data-reveal="fade-up">
            <div class="blog-featured-img-wrap">
              <img src="${featured.image || 'Hero 01.jpg'}" alt="${featured.title}">
              <span class="blog-featured-badge">Destaque</span>
            </div>
            <div class="blog-featured-content">
              <div class="blog-meta-row">
                <span class="blog-meta-category">${featured.category}</span>
                <span>•</span>
                <span>${formatDate(featured.date)}</span>
                <span>•</span>
                <span>${featured.readTime || '5 min'}</span>
              </div>
              <h2 class="blog-featured-title">
                <a href="artigo.html?slug=${featured.slug || featured.id}">${featured.title}</a>
              </h2>
              <p class="blog-featured-excerpt">${featured.excerpt}</p>
              <div>
                <a href="artigo.html?slug=${featured.slug || featured.id}" class="btn btn-primary btn-sm">
                  <span>Ler Artigo Completo</span>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>
          </div>
        `;
        featuredContainer.style.display = 'block';
      } else {
        featuredContainer.innerHTML = '';
        featuredContainer.style.display = 'none';
      }
    }

    // Grid de Artigos
    if (postsContainer) {
      const gridPosts = (currentCategory === 'all' && !searchTerm && filtered.length > 0) 
        ? filtered.slice(1) 
        : filtered;

      if (gridPosts.length === 0) {
        postsContainer.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 16px; border: 1px dashed var(--color-border-light);">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#DAB78D" stroke-width="1.5" style="margin-bottom: 16px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <h3 style="font-family: var(--font-heading); color: var(--color-noir-900); margin-bottom: 8px;">Nenhum artigo encontrado</h3>
            <p style="color: var(--color-text-muted); font-size: 0.95rem;">Tente buscar por outro termo ou escolha outra categoria acima.</p>
          </div>
        `;
        return;
      }

      postsContainer.innerHTML = gridPosts.map(post => `
        <article class="blog-card" data-reveal="fade-up">
          <div class="blog-card-img-wrap">
            <img src="${post.image || 'Hero 01.jpg'}" alt="${post.title}" loading="lazy">
            <span class="blog-card-badge">${post.category}</span>
          </div>
          <div class="blog-card-body">
            <div class="blog-card-meta">
              <span>${formatDate(post.date)}</span>
              <span>${post.readTime || '4 min'}</span>
            </div>
            <h3 class="blog-card-title">
              <a href="artigo.html?slug=${post.slug || post.id}">${post.title}</a>
            </h3>
            <p class="blog-card-excerpt">${post.excerpt}</p>
            <div class="blog-card-footer">
              <span style="color: var(--color-text-muted); font-size: 0.8rem;">${post.author || 'Escritório Central'}</span>
              <a href="artigo.html?slug=${post.slug || post.id}" class="blog-read-more">
                <span>Ler Artigo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
        </article>
      `).join('');
    }
  }

  // Event Listener para a Busca
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchTerm = e.target.value.trim();
      renderBlog();
    });
  }

  loadData();
});
