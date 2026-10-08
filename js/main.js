/**
 * CENTRAL SOLUÇÕES EMPRESARIAIS - JAVASCRIPT
 * Interatividades: Menu responsivo, animações, contadores, scroll reveal,
 * efeito spotlight, FAQ interativo, máscara de telefone e WhatsApp prompt
 */

const initCentralApp = () => {
  // 1. Scrollspy Navigation
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');
  const sections = document.querySelectorAll('section[id], .quick-help-section[id]');

  function updateScrollspy() {
    const hasLocalAnchors = Array.from(navLinks).some(link => link.getAttribute('href')?.startsWith('#'));
    if (!hasLocalAnchors) return;

    let currentId = '';
    const scrollPos = window.scrollY + 140;

    sections.forEach(section => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === `#${currentId}`) {
          link.classList.add('active');
        } else if (href?.startsWith('#')) {
          link.classList.remove('active');
        }
      });
    }
  }

  // 2. Header scroll effect & Scroll Progress Bar
  const header = document.querySelector('.main-header');
  const progressBar = document.querySelector('.scroll-progress-bar');
  
  const handleScroll = () => {
    const scrollY = window.scrollY;
    
    // Header shadow & background
    if (scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }

    // Progress Bar width
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    }

    // Scrollspy navigation active state
    updateScrollspy();
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Initial run

  // 3. Mobile Navigation Toggle
  const mobileToggle = document.getElementById('mobileToggle');
  const navMenu = document.getElementById('navMenu');

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('active');
      mobileToggle.setAttribute('aria-expanded', isOpen);
      
      const icon = mobileToggle.querySelector('svg');
      if (isOpen) {
        icon.innerHTML = `<path d="M18 6 6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
      } else {
        icon.innerHTML = `<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
      }
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileToggle.setAttribute('aria-expanded', false);
        const icon = mobileToggle.querySelector('svg');
        if (icon) {
          icon.innerHTML = `<path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`;
        }
      });
    });
  }

  // 4. Scroll Reveal Animations with IntersectionObserver
  const revealElements = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = el.getAttribute('data-reveal-delay') || 0;
          setTimeout(() => {
            el.classList.add('revealed');
          }, delay);
          observer.unobserve(el);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -30px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  // 5. Smooth Counter Animation for Stats
  const animateCounter = (counter) => {
    if (counter.dataset.animated === 'true') return;
    counter.dataset.animated = 'true';

    const rawTarget = counter.getAttribute('data-target') || counter.textContent || '0';
    const target = parseInt(String(rawTarget).replace(/\D/g, ''), 10) || 0;
    const duration = 1200;
    const startTime = performance.now();

    const formatNumber = (num) => {
      return num >= 1000 ? num.toLocaleString('pt-BR') : num.toString();
    };

    counter.textContent = '0';

    const updateCount = (currentTime) => {
      const elapsed = (currentTime || performance.now()) - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic for crisp, organic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(easeOut * target);

      if (progress < 1 && elapsed < duration) {
        counter.textContent = formatNumber(current);
        requestAnimationFrame(updateCount);
      } else {
        counter.textContent = formatNumber(target);
      }
    };

    requestAnimationFrame(updateCount);
  };

  const initCounters = () => {
    const counters = document.querySelectorAll('.stat-counter');
    if (!counters.length) return;

    const isInViewport = (el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top < (window.innerHeight || document.documentElement.clientHeight) + 60 &&
        rect.bottom > -60
      );
    };

    const triggerVisibleCounters = () => {
      counters.forEach(counter => {
        if (counter.dataset.animated !== 'true' && isInViewport(counter)) {
          animateCounter(counter);
        }
      });
    };

    if ('IntersectionObserver' in window) {
      const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const counter = entry.target;
            animateCounter(counter);
            observer.unobserve(counter);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px 80px 0px'
      });

      counters.forEach(counter => {
        counterObserver.observe(counter);
      });
    }

    // Immediate viewport check & scroll/resize fallback
    triggerVisibleCounters();
    window.addEventListener('scroll', triggerVisibleCounters, { passive: true });
    window.addEventListener('resize', triggerVisibleCounters, { passive: true });

    // Safety timeout: ensure counters are never stuck at 0 if user jumps to section or on slow render
    setTimeout(() => {
      counters.forEach(counter => {
        if (counter.dataset.animated !== 'true') {
          animateCounter(counter);
        }
      });
    }, 3500);
  };

  // Initialize counters when DOM is ready
  initCounters();

  // 6. Interactive Spotlight Glow Effect on Cards
  const spotlightCards = document.querySelectorAll('.spotlight-card, .diff-card, .contact-form-card');
  spotlightCards.forEach(card => {
    card.classList.add('spotlight-card');
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 7. FAQ Accordion Interaction
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (question && answer) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close other items
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherAnswer = otherItem.querySelector('.faq-answer');
            if (otherAnswer) otherAnswer.style.maxHeight = null;
          }
        });

        // Toggle current item
        if (isActive) {
          item.classList.remove('active');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('active');
          answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
        }
      });
    }
  });

  // 8. Auto Phone Mask for (19) 99999-9999
  const phoneInput = document.getElementById('formTelefone');
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length > 11) value = value.slice(0, 11);

      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3');
      } else if (value.length > 6) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, '($1) $2-$3');
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})$/, '($1) $2');
      } else if (value.length > 0) {
        value = value.replace(/^(\d{0,2})$/, '($1');
      }
      e.target.value = value;
    });
  }

  // 9. Floating WhatsApp Prompt Bubble
  const whatsappBubble = document.getElementById('whatsappPromptBubble');
  const whatsappClose = document.getElementById('whatsappPromptClose');
  const whatsappFloat = document.querySelector('.whatsapp-float');

  if (whatsappBubble) {
    // Show after 3.8 seconds
    const timer = setTimeout(() => {
      whatsappBubble.classList.add('show');
    }, 3800);

    if (whatsappClose) {
      whatsappClose.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        whatsappBubble.classList.remove('show');
        clearTimeout(timer);
      });
    }

    if (whatsappFloat) {
      whatsappFloat.addEventListener('click', () => {
        whatsappBubble.classList.remove('show');
      });
    }
  }

  // 10. Contact / Proposal Form to WhatsApp Integration
  const proposalForm = document.getElementById('proposalForm');
  if (proposalForm) {
    proposalForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const nome = document.getElementById('formNome')?.value.trim() || '';
      const empresa = document.getElementById('formEmpresa')?.value.trim() || '';
      const email = document.getElementById('formEmail')?.value.trim() || '';
      const telefone = document.getElementById('formTelefone')?.value.trim() || '';
      const servico = document.getElementById('formServico')?.value || '';
      const mensagem = document.getElementById('formMensagem')?.value.trim() || '';

      const texto = `*Solicitação de Proposta - Site Central*%0A%0A` +
                    `*Nome:* ${encodeURIComponent(nome)}%0A` +
                    `*Empresa:* ${encodeURIComponent(empresa || 'Não informado')}%0A` +
                    `*E-mail:* ${encodeURIComponent(email)}%0A` +
                    `*Telefone/WhatsApp:* ${encodeURIComponent(telefone)}%0A` +
                    `*Interesse Principal:* ${encodeURIComponent(servico)}%0A` +
                    (mensagem ? `*Mensagem:* ${encodeURIComponent(mensagem)}` : '');

      // Redireciona para o WhatsApp comercial da Central: (19) 3894-4657
      const whatsappUrl = `https://api.whatsapp.com/send?phone=551938944657&text=${texto}`;
      
      const submitBtn = proposalForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = `<span>Enviando...</span>`;
      submitBtn.disabled = true;

      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
        submitBtn.innerHTML = `<span>Mensagem Enviada com Sucesso!</span>`;
        proposalForm.reset();
        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.disabled = false;
        }, 3000);
      }, 600);
    });
  }

  // 11. Hero Background Switcher Option
  const heroSection = document.querySelector('.hero-section');
  const heroImageToggler = document.getElementById('heroBgToggle');
  if (heroSection && heroImageToggler) {
    let activeHero = 1;
    heroImageToggler.addEventListener('click', () => {
      activeHero = activeHero === 1 ? 2 : 1;
      const imgPath = activeHero === 1 ? 'Hero 01.jpg' : 'Hero 02.jpg';
      heroSection.style.backgroundImage = `var(--grad-hero-overlay), url('${imgPath}')`;
    });
  }

  // =========================================================================
  // 12. SISTEMA DE CONSENTIMENTO DE COOKIES (LGPD COMPLIANT)
  // =========================================================================
  const COOKIE_STORAGE_KEY = 'central_cookie_consent_v1';

  function createCookieElements() {
    if (document.getElementById('cookieBanner')) return;

    // 1. Banner Flutuante
    const banner = document.createElement('div');
    banner.id = 'cookieBanner';
    banner.className = 'cookie-consent-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-modal', 'false');
    banner.setAttribute('aria-label', 'Aviso de Privacidade e Cookies');
    banner.innerHTML = `
      <div class="cookie-header">
        <div class="cookie-title-wrap">
          <svg class="cookie-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"/>
            <path d="M8.5 8.5v.01"/><path d="M16 15.5v.01"/><path d="M12 12v.01"/><path d="M11 17v.01"/><path d="M7 13v.01"/>
          </svg>
          <h3 class="cookie-title">Privacidade & Cookies</h3>
        </div>
        <button class="cookie-close-btn" id="cookieCloseBtn" aria-label="Fechar aviso de cookies">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <p class="cookie-text">
        Utilizamos cookies e tecnologias essenciais para garantir o correto funcionamento do site, aprimorar a sua experiência e oferecer conteúdos estratégicos, em conformidade com a <strong>LGPD</strong>.
      </p>
      <div class="cookie-actions">
        <button class="cookie-btn-primary" id="cookieAcceptAll">Aceitar Todos</button>
        <button class="cookie-btn-secondary" id="cookieAcceptNecessary">Apenas Necessários</button>
        <button class="cookie-btn-settings" id="cookieOpenSettings">Personalizar Preferências</button>
      </div>
    `;
    document.body.appendChild(banner);

    // 2. Modal de Preferências
    const modal = document.createElement('div');
    modal.id = 'cookieModalOverlay';
    modal.className = 'cookie-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'cookieModalTitle');
    modal.innerHTML = `
      <div class="cookie-modal">
        <div class="cookie-modal-header">
          <h3 id="cookieModalTitle">
            <svg class="cookie-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            </svg>
            Preferências de Privacidade & Cookies
          </h3>
          <button class="cookie-close-btn" id="cookieModalCloseBtn" aria-label="Fechar modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="cookie-modal-body">
          <p class="cookie-modal-intro">
            Você pode personalizar suas preferências de cookies a qualquer momento. Os cookies necessários são imprescindíveis para o funcionamento seguro da plataforma.
          </p>

          <div class="cookie-category-item">
            <div class="cookie-category-top">
              <h4 class="cookie-category-title">Necessários & Segurança</h4>
              <span class="cookie-status-badge">Sempre Ativos</span>
            </div>
            <p class="cookie-category-desc">
              Garantem funcionalidades vitais como navegação protegida, envio de formulários e integridade do sistema.
            </p>
          </div>

          <div class="cookie-category-item">
            <div class="cookie-category-top">
              <h4 class="cookie-category-title">Estatísticas & Desempenho</h4>
              <label class="cookie-switch" aria-label="Permitir cookies estatísticos">
                <input type="checkbox" id="cookieOptAnalytics" checked>
                <span class="cookie-slider"></span>
              </label>
            </div>
            <p class="cookie-category-desc">
              Permitem analisar anonimamente o volume e comportamento de navegação para aprimorarmos continuamente nossa plataforma.
            </p>
          </div>

          <div class="cookie-category-item">
            <div class="cookie-category-top">
              <h4 class="cookie-category-title">Comunicação & Personalização</h4>
              <label class="cookie-switch" aria-label="Permitir cookies de marketing e comunicação">
                <input type="checkbox" id="cookieOptMarketing">
                <span class="cookie-slider"></span>
              </label>
            </div>
            <p class="cookie-category-desc">
              Facilitam a conexão imediata com nossos canais de consultoria (como WhatsApp) e conteúdos adaptados às necessidades da sua empresa.
            </p>
          </div>
        </div>
        <div class="cookie-modal-footer">
          <button class="cookie-btn-secondary" id="cookieSavePreferences">Salvar Escolhas</button>
          <button class="cookie-btn-primary" id="cookieModalAcceptAll">Aceitar Todos</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    // Bind events
    setupCookieEvents(banner, modal);
  }

  function setupCookieEvents(banner, modal) {
    const btnAcceptAll = document.getElementById('cookieAcceptAll');
    const btnAcceptNec = document.getElementById('cookieAcceptNecessary');
    const btnSettings = document.getElementById('cookieOpenSettings');
    const btnClose = document.getElementById('cookieCloseBtn');
    const btnModalClose = document.getElementById('cookieModalCloseBtn');
    const btnSavePref = document.getElementById('cookieSavePreferences');
    const btnModalAcceptAll = document.getElementById('cookieModalAcceptAll');
    const chkAnalytics = document.getElementById('cookieOptAnalytics');
    const chkMarketing = document.getElementById('cookieOptMarketing');

    function saveConsent(data) {
      const consentPayload = {
        necessary: true,
        analytics: Boolean(data.analytics),
        marketing: Boolean(data.marketing),
        timestamp: new Date().toISOString()
      };
      try {
        localStorage.setItem(COOKIE_STORAGE_KEY, JSON.stringify(consentPayload));
      } catch (e) {
        console.warn('LocalStorage inacessível para cookies', e);
      }
      banner.classList.remove('show');
      modal.classList.remove('open');
      window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consentPayload }));
    }

    btnAcceptAll?.addEventListener('click', () => {
      saveConsent({ analytics: true, marketing: true });
    });

    btnAcceptNec?.addEventListener('click', () => {
      saveConsent({ analytics: false, marketing: false });
    });

    btnSettings?.addEventListener('click', () => {
      const stored = getSavedConsent();
      if (stored) {
        if (chkAnalytics) chkAnalytics.checked = stored.analytics;
        if (chkMarketing) chkMarketing.checked = stored.marketing;
      }
      modal.classList.add('open');
    });

    btnClose?.addEventListener('click', () => {
      banner.classList.remove('show');
    });

    btnModalClose?.addEventListener('click', () => {
      modal.classList.remove('open');
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
      }
    });

    btnSavePref?.addEventListener('click', () => {
      saveConsent({
        analytics: chkAnalytics ? chkAnalytics.checked : false,
        marketing: chkMarketing ? chkMarketing.checked : false
      });
    });

    btnModalAcceptAll?.addEventListener('click', () => {
      if (chkAnalytics) chkAnalytics.checked = true;
      if (chkMarketing) chkMarketing.checked = true;
      saveConsent({ analytics: true, marketing: true });
    });
  }

  function getSavedConsent() {
    try {
      const item = localStorage.getItem(COOKIE_STORAGE_KEY);
      return item ? JSON.parse(item) : null;
    } catch (e) {
      return null;
    }
  }

  function initCookieConsent() {
    createCookieElements();
    const consent = getSavedConsent();
    const banner = document.getElementById('cookieBanner');

    // Se ainda não houver consentimento registrado, exibe o banner com transição suave
    if (!consent && banner) {
      setTimeout(() => {
        banner.classList.add('show');
      }, 700);
    }

    // Gatilhos adicionais: qualquer link ou botão com a classe .open-cookie-settings ou atributo [data-cookie-trigger]
    document.querySelectorAll('.open-cookie-settings, [data-cookie-trigger]').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('cookieModalOverlay');
        const stored = getSavedConsent();
        const chkAnalytics = document.getElementById('cookieOptAnalytics');
        const chkMarketing = document.getElementById('cookieOptMarketing');

        if (stored) {
          if (chkAnalytics) chkAnalytics.checked = stored.analytics;
          if (chkMarketing) chkMarketing.checked = stored.marketing;
        }
        if (modal) modal.classList.add('open');
      });
    });

    // Expor API global
    window.CentralCookies = {
      openSettings: () => {
        const modal = document.getElementById('cookieModalOverlay');
        if (modal) modal.classList.add('open');
      },
      getConsent: getSavedConsent
    };
  }

  // Inicializa o sistema de cookies
  initCookieConsent();

  // =========================================================================
  // 17. MODAIS INTERATIVOS DE PASSO A PASSO (TROCAR CONTADOR & ABRIR EMPRESA)
  // =========================================================================
  function initProcessModals() {
    const overlays = document.querySelectorAll('.process-modal-overlay');

    function openModal(id) {
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('open');
      const anyOpen = document.querySelector('.process-modal-overlay.open');
      if (!anyOpen) {
        document.body.style.overflow = '';
      }
    }

    function closeAllModals() {
      overlays.forEach(m => closeModal(m));
    }

    // Gatilhos de abertura com atributo data-process-trigger
    document.querySelectorAll('[data-process-trigger]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const triggerType = btn.getAttribute('data-process-trigger');
        if (triggerType === 'trocar-contador') {
          openModal('modal-trocar-contador');
        } else if (triggerType === 'abrir-empresa') {
          openModal('modal-abrir-empresa');
        }
      });
    });

    // Ação ao clicar em botões que fecham o modal ou selecionam serviço direto
    function handleServiceSelection(targetService) {
      if (!targetService) return;
      const formSelect = document.getElementById('formServico');
      if (formSelect) {
        for (let i = 0; i < formSelect.options.length; i++) {
          if (formSelect.options[i].value === targetService) {
            formSelect.selectedIndex = i;
            break;
          }
        }
      }
      const contatoSection = document.getElementById('contato');
      if (contatoSection) {
        contatoSection.scrollIntoView({ behavior: 'smooth' });
        // Focar com suavidade no formulário após a rolagem
        setTimeout(() => {
          const nomeInput = document.getElementById('formNome');
          if (nomeInput) nomeInput.focus();
        }, 600);
      }
    }

    // Fechar ao clicar no botão de fechar ou no overlay transparente
    overlays.forEach(modal => {
      modal.querySelectorAll('[data-close-process]').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
          const targetService = closeBtn.getAttribute('data-target-service');
          closeModal(modal);

          if (targetService) {
            e.preventDefault();
            handleServiceSelection(targetService);
          }
        });
      });

      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    });

    // Botões nas seções que selecionam o serviço e rolam para o formulário
    document.querySelectorAll('[data-select-service]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const service = btn.getAttribute('data-select-service');
        if (service) {
          e.preventDefault();
          handleServiceSelection(service);
        }
      });
    });

    // Fechar com a tecla ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeAllModals();
      }
    });

    // Abrir automaticamente caso a URL já traga a hash (#modal-trocar-contador ou #modal-abrir-empresa)
    if (window.location.hash === '#modal-trocar-contador') {
      openModal('modal-trocar-contador');
    } else if (window.location.hash === '#modal-abrir-empresa') {
      openModal('modal-abrir-empresa');
    }

    // Expor na janela global
    window.CentralProcessModal = {
      open: openModal,
      close: closeModal,
      closeAll: closeAllModals,
      selectServiceAndScroll: handleServiceSelection
    };
  }

  // 17. Carrossel de Depoimentos
  function initTestimonialCarousel() {
    const track = document.getElementById('testimonialsTrack');
    const prevBtn = document.getElementById('testimonialsPrev');
    const nextBtn = document.getElementById('testimonialsNext');
    const dotsContainer = document.getElementById('testimonialsDots');
    const wrapper = document.querySelector('.testimonials-carousel-wrapper');

    if (!track) return;

    const slides = track.querySelectorAll('.testimonial-slide');
    const totalSlides = slides.length;
    if (totalSlides === 0) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let isTouchActive = false;
    let startX = 0;
    let diffX = 0;

    function getSlidesPerView() {
      return window.innerWidth <= 900 ? 1 : 2;
    }

    function getMaxIndex() {
      const perView = getSlidesPerView();
      return Math.max(0, totalSlides - perView);
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      const maxIndex = getMaxIndex();
      
      for (let i = 0; i <= maxIndex; i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = `carousel-dot ${i === currentIndex ? 'active' : ''}`;
        dot.setAttribute('aria-label', `Ir para depoimento ${i + 1}`);
        dot.addEventListener('click', () => {
          goToSlide(i);
          resetAutoPlay();
        });
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      const dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });
    }

    function updateSlidePosition() {
      const perView = getSlidesPerView();
      const slideWidthPercent = 100 / perView;
      track.style.transform = `translateX(-${currentIndex * slideWidthPercent}%)`;
      updateDots();
    }

    function goToSlide(index) {
      const maxIndex = getMaxIndex();
      if (index < 0) {
        currentIndex = maxIndex;
      } else if (index > maxIndex) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }
      updateSlidePosition();
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        resetAutoPlay();
      });
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        resetAutoPlay();
      });
    }

    // Touch / Swipe
    track.addEventListener('touchstart', (e) => {
      isTouchActive = true;
      startX = e.touches[0].clientX;
      diffX = 0;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', (e) => {
      if (!isTouchActive) return;
      diffX = e.touches[0].clientX - startX;
    }, { passive: true });

    track.addEventListener('touchend', () => {
      if (!isTouchActive) return;
      isTouchActive = false;
      const threshold = 50;
      if (diffX < -threshold) {
        nextSlide();
      } else if (diffX > threshold) {
        prevSlide();
      }
      resetAutoPlay();
    });

    // Auto-play (5.5s)
    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(() => {
        nextSlide();
      }, 5500);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAutoPlay);
      wrapper.addEventListener('mouseleave', startAutoPlay);
    }

    // Resize handling
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const maxIndex = getMaxIndex();
        if (currentIndex > maxIndex) {
          currentIndex = maxIndex;
        }
        createDots();
        updateSlidePosition();
      }, 150);
    });

    // Initialize
    createDots();
    updateSlidePosition();
    startAutoPlay();
  }

  // Carrossel de Especialistas Ágyle BPO (Dionísio & Murillo)
  function initBpoSpecialistsCarousel() {
    const track = document.getElementById('bpoSpecialistsTrack');
    const prevBtn = document.getElementById('bpoCarouselPrev');
    const nextBtn = document.getElementById('bpoCarouselNext');
    const dots = document.querySelectorAll('#bpoCarouselDots .bpo-carousel-dot');
    const counterCurrent = document.getElementById('bpoCarouselCurrent');
    const container = document.getElementById('bpoSpecialistsCarousel');

    if (!track) return;

    const slides = track.querySelectorAll('.bpo-carousel-slide');
    const totalSlides = slides.length;
    if (totalSlides <= 1) return;

    let currentIndex = 0;
    let autoPlayTimer = null;
    let touchStartX = 0;
    let touchEndX = 0;

    function goToSlide(index) {
      if (index < 0) {
        currentIndex = totalSlides - 1;
      } else if (index >= totalSlides) {
        currentIndex = 0;
      } else {
        currentIndex = index;
      }

      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      // Atualiza dots interativos
      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === currentIndex);
      });

      // Atualiza contador de slides
      if (counterCurrent) {
        counterCurrent.textContent = String(currentIndex + 1).padStart(2, '0');
      }
    }

    function nextSlide() {
      goToSlide(currentIndex + 1);
    }

    function prevSlide() {
      goToSlide(currentIndex - 1);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayTimer = setInterval(nextSlide, 5000);
    }

    function stopAutoPlay() {
      if (autoPlayTimer) {
        clearInterval(autoPlayTimer);
        autoPlayTimer = null;
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        prevSlide();
        startAutoPlay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        nextSlide();
        startAutoPlay();
      });
    }

    dots.forEach((dot, idx) => {
      dot.addEventListener('click', () => {
        goToSlide(idx);
        startAutoPlay();
      });
    });

    // Touch Swipe em Mobile
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
      }
      startAutoPlay();
    }, { passive: true });

    // Pausar auto-play no hover do usuário
    if (container) {
      container.addEventListener('mouseenter', stopAutoPlay);
      container.addEventListener('mouseleave', startAutoPlay);
    }

    // Inicialização
    goToSlide(0);
    startAutoPlay();
  }

  initProcessModals();
  initTestimonialCarousel();
  initBpoSpecialistsCarousel();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCentralApp);
} else {
  initCentralApp();
}

