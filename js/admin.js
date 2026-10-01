// Controlador do Painel Administrativo (admin.html)
let posts = [];
let categories = [];
let quillEditor = null;
let currentEditingId = null;

// Senha padrão de acesso e token de segurança da API
const ADMIN_PASS = 'central2026';
const ADMIN_API_TOKEN = 'c38944657_central_sec_token_2026';
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME_MS = 15 * 60 * 1000; // 15 minutos

// Categorias padrão
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'BPO Financeiro', slug: 'bpo-financeiro' },
  { id: '2', name: 'Saúde', slug: 'saude' },
  { id: '3', name: 'Construção Civil', slug: 'construcao-civil' },
  { id: '4', name: 'Tributário', slug: 'tributario' },
  { id: '5', name: 'Trabalhista', slug: 'trabalhista' },
  { id: '6', name: 'Gestão', slug: 'gestao' }
];

document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initQuill();
  loadData();
  setupEventListeners();
});

// Autenticação com proteção contra bots e força bruta
function initAuth() {
  const loginOverlay = document.getElementById('adminLoginWrap');
  const dashboardWrap = document.getElementById('adminDashboardWrap');
  const loginForm = document.getElementById('adminLoginForm');
  const logoutBtn = document.getElementById('adminLogoutBtn');
  const alertBox = document.getElementById('adminLoginAlert');
  const submitBtn = document.getElementById('adminLoginBtn');

  function checkLockout() {
    const lockUntil = parseInt(localStorage.getItem('central_admin_lockuntil') || '0', 10);
    const now = Date.now();
    if (lockUntil > now) {
      const remainingMinutes = Math.ceil((lockUntil - now) / 60000);
      if (alertBox) {
        alertBox.textContent = `Acesso temporariamente bloqueado por excesso de tentativas. Tente novamente em ${remainingMinutes} minuto(s).`;
        alertBox.style.display = 'block';
      }
      if (submitBtn) submitBtn.disabled = true;
      return true;
    } else {
      if (alertBox && alertBox.textContent.includes('bloqueado')) {
        alertBox.style.display = 'none';
      }
      if (submitBtn) submitBtn.disabled = false;
      return false;
    }
  }

  const isAuth = sessionStorage.getItem('central_admin_auth') === 'true';

  if (isAuth) {
    loginOverlay.style.display = 'none';
    dashboardWrap.style.display = 'flex';
  } else {
    loginOverlay.style.display = 'flex';
    dashboardWrap.style.display = 'none';
    checkLockout();
  }

  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (checkLockout()) return;

      // Proteção Honeypot: Se o campo invisível foi preenchido por um bot
      const honeyTrap = document.getElementById('adminTrap')?.value.trim();
      if (honeyTrap) {
        if (alertBox) {
          alertBox.textContent = 'Erro ao processar solicitação.';
          alertBox.style.display = 'block';
        }
        return;
      }

      const passInput = document.getElementById('adminPassword').value;
      if (passInput === ADMIN_PASS) {
        // Sucesso: reseta tentativas e bloqueios
        localStorage.removeItem('central_admin_attempts');
        localStorage.removeItem('central_admin_lockuntil');
        sessionStorage.setItem('central_admin_auth', 'true');
        loginOverlay.style.display = 'none';
        dashboardWrap.style.display = 'flex';
        renderAdminDashboard();
      } else {
        let attempts = parseInt(localStorage.getItem('central_admin_attempts') || '0', 10) + 1;
        localStorage.setItem('central_admin_attempts', attempts.toString());

        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          const lockTime = Date.now() + LOCKOUT_TIME_MS;
          localStorage.setItem('central_admin_lockuntil', lockTime.toString());
          checkLockout();
        } else {
          const remaining = MAX_LOGIN_ATTEMPTS - attempts;
          if (alertBox) {
            alertBox.textContent = `Senha incorreta! Você tem mais ${remaining} tentativa(s) antes do bloqueio temporário.`;
            alertBox.style.display = 'block';
          } else {
            alert(`Senha incorreta! ${remaining} tentativa(s) restantes.`);
          }
        }
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('central_admin_auth');
      window.location.reload();
    });
  }
}

// Inicialização do Quill.js WYSIWYG
function initQuill() {
  const editorElem = document.getElementById('quillEditor');
  if (!editorElem) return;

  quillEditor = new Quill('#quillEditor', {
    theme: 'snow',
    placeholder: 'Escreva o conteúdo completo do artigo aqui...',
    modules: {
      toolbar: [
        [{ 'header': [2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],
        ['clean']
      ]
    }
  });
}

// Carregar posts e categorias
async function loadData() {
  // Carrega categorias
  const localCats = localStorage.getItem('central_blog_categories');
  if (localCats) {
    categories = JSON.parse(localCats);
  } else {
    try {
      const res = await fetch('data/categories.json');
      if (res.ok) {
        categories = await res.json();
      } else {
        categories = DEFAULT_CATEGORIES;
      }
    } catch (e) {
      categories = DEFAULT_CATEGORIES;
    }
    localStorage.setItem('central_blog_categories', JSON.stringify(categories));
  }

  // Carrega posts
  const localData = localStorage.getItem('central_blog_posts');
  if (localData) {
    posts = JSON.parse(localData);
  } else {
    try {
      const res = await fetch('data/posts.json');
      if (res.ok) {
        posts = await res.json();
        localStorage.setItem('central_blog_posts', JSON.stringify(posts));
      }
    } catch (e) {
      console.warn('Erro ao carregar data/posts.json:', e);
    }
  }

  populateCategoryDropdowns();
  renderAdminDashboard();
}

// Preenche os selects de categoria
function populateCategoryDropdowns() {
  const postCatSelect = document.getElementById('postCategorySelect');
  const filterCatSelect = document.getElementById('adminFilterCategory');

  if (postCatSelect) {
    const currentVal = postCatSelect.value;
    postCatSelect.innerHTML = categories.map(c => `
      <option value="${c.name}">${c.name}</option>
    `).join('');
    if (currentVal && categories.some(c => c.name === currentVal)) {
      postCatSelect.value = currentVal;
    }
  }

  if (filterCatSelect) {
    const currentVal = filterCatSelect.value;
    filterCatSelect.innerHTML = `
      <option value="all">Todas Categorias</option>
      ${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join('')}
    `;
    if (currentVal) filterCatSelect.value = currentVal;
  }
}

// Renderizar Dashboard
function renderAdminDashboard() {
  const total = posts.length;
  const published = posts.filter(p => !p.status || p.status === 'published').length;
  const drafts = total - published;

  document.getElementById('statTotalPosts').textContent = total;
  document.getElementById('statPublishedPosts').textContent = published;
  document.getElementById('statDraftPosts').textContent = drafts;

  renderPostsTable();
}

// Renderizar Tabela
function renderPostsTable() {
  const tbody = document.getElementById('adminPostsTbody');
  if (!tbody) return;

  const searchVal = (document.getElementById('adminSearchInput')?.value || '').toLowerCase();
  const filterCat = document.getElementById('adminFilterCategory')?.value || 'all';

  const filtered = posts.filter(p => {
    const matchCat = filterCat === 'all' || p.category === filterCat;
    const matchSearch = !searchVal || p.title.toLowerCase().includes(searchVal) || (p.author && p.author.toLowerCase().includes(searchVal));
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 40px; color: #888;">
          Nenhum artigo encontrado. Clique em "+ Novo Artigo" para começar.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(p => {
    const isPub = !p.status || p.status === 'published';
    const statusClass = isPub ? 'published' : 'draft';
    const statusText = isPub ? 'Publicado' : 'Rascunho';

    return `
      <tr>
        <td>
          <img src="${p.image || 'Hero 01.jpg'}" class="admin-post-thumb" alt="Capa">
        </td>
        <td>
          <strong style="color: #fff; display: block; margin-bottom: 4px;">${p.title}</strong>
          <span style="font-size: 0.8rem; color: #888;">/${p.slug || p.id}</span>
        </td>
        <td>
          <span style="color: var(--color-gold-400); font-weight: 600; font-size: 0.85rem;">${p.category}</span>
        </td>
        <td>${p.date || '-'}</td>
        <td>
          <span class="admin-status-pill ${statusClass}">${statusText}</span>
        </td>
        <td>
          <div class="admin-actions-btns">
            <a href="artigo.html?slug=${p.slug || p.id}" target="_blank" class="admin-btn-icon" title="Visualizar Artigo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </a>
            <button onclick="editPost('${p.id}')" class="admin-btn-icon" title="Editar Artigo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button onclick="deletePost('${p.id}')" class="admin-btn-icon delete" title="Excluir Artigo">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Configurar Eventos do Admin
function setupEventListeners() {
  const newPostBtn = document.getElementById('adminNewPostBtn');
  const modalCloseBtn = document.getElementById('adminModalClose');
  const postForm = document.getElementById('adminPostForm');
  const searchInput = document.getElementById('adminSearchInput');
  const filterCat = document.getElementById('adminFilterCategory');
  const titleInput = document.getElementById('postTitleInput');
  const slugInput = document.getElementById('postSlugInput');
  const imageUpload = document.getElementById('postImageUpload');
  const exportBtn = document.getElementById('adminExportBtn');

  // Gerenciamento de Categorias
  const manageCatsBtn = document.getElementById('adminManageCategoriesBtn');
  const catsModalClose = document.getElementById('adminCategoriesModalClose');
  const catsModalDone = document.getElementById('adminCategoriesModalDone');
  const addCategoryForm = document.getElementById('adminAddCategoryForm');

  if (manageCatsBtn) {
    manageCatsBtn.addEventListener('click', () => openCategoriesModal());
  }

  if (catsModalClose) {
    catsModalClose.addEventListener('click', () => closeCategoriesModal());
  }

  if (catsModalDone) {
    catsModalDone.addEventListener('click', () => closeCategoriesModal());
  }

  if (addCategoryForm) {
    addCategoryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = document.getElementById('newCategoryInput');
      const val = input.value.trim();
      if (val) {
        addCategory(val);
        input.value = '';
      }
    });
  }

  if (newPostBtn) {
    newPostBtn.addEventListener('click', () => openPostModal());
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => closePostModal());
  }

  if (searchInput) {
    searchInput.addEventListener('input', () => renderPostsTable());
  }

  if (filterCat) {
    filterCat.addEventListener('change', () => renderPostsTable());
  }

  if (titleInput && slugInput) {
    titleInput.addEventListener('input', () => {
      if (!currentEditingId) {
        slugInput.value = generateSlug(titleInput.value);
      }
    });
  }

  if (imageUpload) {
    imageUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          document.getElementById('postImagePreview').src = event.target.result;
          document.getElementById('postImageUrl').value = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (postForm) {
    postForm.addEventListener('submit', (e) => {
      e.preventDefault();
      savePost();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', (e) => {
      e.preventDefault();
      exportData();
    });
  }
}

// =========================================================================
// GERENCIAMENTO DE CATEGORIAS
// =========================================================================
function openCategoriesModal() {
  renderCategoriesList();
  document.getElementById('adminCategoriesModal').style.display = 'flex';
}

function closeCategoriesModal() {
  document.getElementById('adminCategoriesModal').style.display = 'none';
  populateCategoryDropdowns();
  renderAdminDashboard();
}

function renderCategoriesList() {
  const container = document.getElementById('adminCategoriesList');
  if (!container) return;

  if (categories.length === 0) {
    container.innerHTML = '<p style="color: #888; text-align: center; padding: 20px;">Nenhuma categoria cadastrada.</p>';
    return;
  }

  container.innerHTML = categories.map(cat => {
    const postCount = posts.filter(p => p.category === cat.name).length;
    return `
      <div class="admin-cat-item">
        <div class="admin-cat-info">
          <span class="admin-cat-name">${cat.name}</span>
          <span class="admin-cat-count">${postCount} ${postCount === 1 ? 'artigo' : 'artigos'}</span>
        </div>
        <div class="admin-cat-actions">
          <button type="button" onclick="editCategory('${cat.id}')" class="admin-btn-icon" title="Renomear Categoria">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button type="button" onclick="deleteCategory('${cat.id}')" class="admin-btn-icon delete" title="Excluir Categoria">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addCategory(name) {
  const exists = categories.some(c => c.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert('Esta categoria já existe!');
    return;
  }

  const newCat = {
    id: Date.now().toString(),
    name: name,
    slug: generateSlug(name)
  };

  categories.push(newCat);
  saveCategories();
  renderCategoriesList();
  populateCategoryDropdowns();
}

function editCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  const newName = prompt('Novo nome para a categoria:', cat.name);
  if (!newName || newName.trim() === '' || newName.trim() === cat.name) return;

  const oldName = cat.name;
  cat.name = newName.trim();
  cat.slug = generateSlug(newName.trim());

  // Atualiza também os posts vinculados à categoria antiga
  posts.forEach(p => {
    if (p.category === oldName) {
      p.category = cat.name;
    }
  });
  localStorage.setItem('central_blog_posts', JSON.stringify(posts));
  syncWithServer();

  saveCategories();
  renderCategoriesList();
  populateCategoryDropdowns();
}

function deleteCategory(id) {
  const cat = categories.find(c => c.id === id);
  if (!cat) return;

  const linkedPosts = posts.filter(p => p.category === cat.name).length;
  if (linkedPosts > 0) {
    if (!confirm(`Atenção: Existem ${linkedPosts} artigo(s) vinculados à categoria "${cat.name}". Se você excluí-la, eles ficarão como "Geral". Deseja continuar?`)) {
      return;
    }
    posts.forEach(p => {
      if (p.category === cat.name) {
        p.category = 'Geral';
      }
    });
    localStorage.setItem('central_blog_posts', JSON.stringify(posts));
    syncWithServer();
  } else {
    if (!confirm(`Deseja realmente excluir a categoria "${cat.name}"?`)) return;
  }

  categories = categories.filter(c => c.id !== id);
  saveCategories();
  renderCategoriesList();
  populateCategoryDropdowns();
}

function saveCategories() {
  localStorage.setItem('central_blog_categories', JSON.stringify(categories));
  // Sincroniza com api/categories.php de forma autenticada
  try {
    fetch('api/categories.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Auth': ADMIN_API_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(categories)
    });
  } catch (e) {}
}

function generateSlug(text) {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

function openPostModal(post = null) {
  const modal = document.getElementById('adminPostModal');
  const modalTitle = document.getElementById('adminModalTitle');
  modal.style.display = 'flex';

  populateCategoryDropdowns();

  if (post) {
    currentEditingId = post.id;
    modalTitle.textContent = 'Editar Artigo';
    document.getElementById('postTitleInput').value = post.title;
    document.getElementById('postSlugInput').value = post.slug || generateSlug(post.title);
    document.getElementById('postCategorySelect').value = post.category || (categories[0]?.name || 'Geral');
    document.getElementById('postAuthorInput').value = post.author || 'Escritório Central';
    document.getElementById('postAuthorRoleInput').value = post.authorRole || 'Consultoria Empresarial';
    document.getElementById('postReadTimeInput').value = post.readTime || '5 min de leitura';
    document.getElementById('postImageUrl').value = post.image || 'Hero 01.jpg';
    document.getElementById('postImagePreview').src = post.image || 'Hero 01.jpg';
    document.getElementById('postExcerptInput').value = post.excerpt || '';
    document.getElementById('postStatusSelect').value = post.status || 'published';

    if (quillEditor) {
      quillEditor.root.innerHTML = post.content || '';
    }
  } else {
    currentEditingId = null;
    modalTitle.textContent = 'Criar Novo Artigo';
    document.getElementById('adminPostForm').reset();
    document.getElementById('postImagePreview').src = 'Hero 01.jpg';
    document.getElementById('postImageUrl').value = 'Hero 01.jpg';
    document.getElementById('postAuthorInput').value = 'Escritório Central';
    document.getElementById('postAuthorRoleInput').value = 'Consultoria Empresarial';
    document.getElementById('postReadTimeInput').value = '5 min de leitura';

    if (categories.length > 0) {
      document.getElementById('postCategorySelect').value = categories[0].name;
    }

    if (quillEditor) {
      quillEditor.root.innerHTML = '';
    }
  }
}

function closePostModal() {
  document.getElementById('adminPostModal').style.display = 'none';
}

function savePost() {
  const title = document.getElementById('postTitleInput').value.trim();
  const slug = document.getElementById('postSlugInput').value.trim() || generateSlug(title);
  const category = document.getElementById('postCategorySelect').value;
  const author = document.getElementById('postAuthorInput').value.trim();
  const authorRole = document.getElementById('postAuthorRoleInput').value.trim();
  const readTime = document.getElementById('postReadTimeInput').value.trim();
  const image = document.getElementById('postImageUrl').value.trim() || 'Hero 01.jpg';
  const excerpt = document.getElementById('postExcerptInput').value.trim();
  const status = document.getElementById('postStatusSelect').value;
  const content = quillEditor ? quillEditor.root.innerHTML : '';

  if (!title) {
    alert('Por favor, informe o título do artigo.');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  if (currentEditingId) {
    const index = posts.findIndex(p => p.id === currentEditingId);
    if (index !== -1) {
      posts[index] = {
        ...posts[index],
        title,
        slug,
        category,
        author,
        authorRole,
        readTime,
        image,
        excerpt,
        status,
        content
      };
    }
  } else {
    const newId = Date.now().toString();
    const newPost = {
      id: newId,
      slug,
      title,
      category,
      date: today,
      author,
      authorRole,
      readTime,
      image,
      excerpt,
      status,
      content
    };
    posts.unshift(newPost);
  }

  localStorage.setItem('central_blog_posts', JSON.stringify(posts));
  syncWithServer();

  alert('Artigo salvo com sucesso!');
  closePostModal();
  renderAdminDashboard();
}

function editPost(id) {
  const post = posts.find(p => p.id === id);
  if (post) {
    openPostModal(post);
  }
}

function deletePost(id) {
  if (confirm('Tem certeza de que deseja excluir este artigo? Esta ação não pode ser desfeita.')) {
    posts = posts.filter(p => p.id !== id);
    localStorage.setItem('central_blog_posts', JSON.stringify(posts));
    syncWithServer();
    renderAdminDashboard();
  }
}

function exportData() {
  const dataToExport = {
    categories: categories,
    posts: posts
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'blog_central_backup_' + new Date().toISOString().split('T')[0] + '.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

async function syncWithServer() {
  try {
    await fetch('api/posts.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Admin-Auth': ADMIN_API_TOKEN,
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(posts)
    });
  } catch (e) {}
}
