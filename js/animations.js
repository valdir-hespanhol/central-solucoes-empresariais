/**
 * CENTRAL SOLUÇÕES EMPRESARIAIS - GSAP & PARALLAX ENGINE
 * Efeitos visuais premium: timeline de entrada, parallax em múltiplos planos,
 * revelação com ScrollTrigger, tilt 3D suave, botões magnéticos e microinterações.
 */

(function () {
  'use strict';

  // Verifica disponibilidade do GSAP
  if (typeof window.gsap === 'undefined') {
    console.warn('[Central Animations] GSAP não carregado. Efeitos avançados desativados com segurança.');
    return;
  }

  const gsap = window.gsap;
  const ScrollTrigger = window.ScrollTrigger;

  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Respeita acessibilidade de movimento reduzido
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    console.info('[Central Animations] Modo de movimento reduzido ativo pelo sistema do usuário.');
    return;
  }

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992;

  /* ==========================================================================
     1. TIMELINE DE ENTRADA HERO
     ========================================================================== */
  function initHeroAnimations() {
    const heroSection = document.querySelector('.hero-section');
    if (!heroSection) return;

    const heroBadge = heroSection.querySelector('.hero-badge');
    const heroTitle = heroSection.querySelector('.hero-title');
    const heroDesc = heroSection.querySelector('.hero-description');
    const heroCtas = heroSection.querySelectorAll('.hero-cta-group .btn');
    const heroGlow = heroSection.querySelector('.hero-glow');

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    if (heroBadge) {
      tl.from(heroBadge, {
        opacity: 0,
        y: -18,
        scale: 0.94,
        duration: 0.75,
        delay: 0.15
      });
    }

    if (heroTitle) {
      tl.from(heroTitle, {
        opacity: 0,
        y: 28,
        duration: 0.85
      }, '-=0.45');
    }

    if (heroDesc) {
      tl.from(heroDesc, {
        opacity: 0,
        y: 22,
        duration: 0.8
      }, '-=0.55');
    }

    if (heroCtas && heroCtas.length) {
      tl.from(heroCtas, {
        opacity: 0,
        y: 18,
        stagger: 0.12,
        duration: 0.7
      }, '-=0.5');
    }

    // Brilho pulsante contínuo no fundo da Hero
    if (heroGlow) {
      gsap.to(heroGlow, {
        scale: 1.14,
        opacity: 0.85,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });

      // Parallax com movimento do mouse (desktop)
      if (!isTouchDevice) {
        heroSection.addEventListener('mousemove', (e) => {
          const rect = heroSection.getBoundingClientRect();
          const relX = (e.clientX - rect.left) / rect.width - 0.5;
          const relY = (e.clientY - rect.top) / rect.height - 0.5;

          gsap.to(heroGlow, {
            x: relX * 70,
            y: relY * 70,
            duration: 1.4,
            ease: 'power2.out'
          });
        });

        heroSection.addEventListener('mouseleave', () => {
          gsap.to(heroGlow, {
            x: 0,
            y: 0,
            duration: 1.2,
            ease: 'power2.out'
          });
        });
      }
    }
  }

  /* ==========================================================================
     2. PARALLAX MULTIPLANO COM SCROLLTRIGGER
     ========================================================================== */
  function initParallax() {
    if (!ScrollTrigger) return;

    // A. Parallax de saída da Hero
    const heroSection = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    if (heroSection && heroContent) {
      gsap.to(heroContent, {
        y: 55,
        opacity: 0.75,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    }

    // B. Parallax na dobra "Quem Somos" (Imagem do CEO e Badge)
    const aboutWrapper = document.querySelector('.about-image-wrapper');
    if (aboutWrapper) {
      const aboutFrame = aboutWrapper.querySelector('.about-image-frame');
      const aboutDecor = aboutWrapper.querySelector('.about-image-decor');
      const aboutBadge = aboutWrapper.querySelector('.about-badge-floating');

      if (aboutDecor) {
        gsap.to(aboutDecor, {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: aboutWrapper,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      if (aboutFrame) {
        gsap.to(aboutFrame, {
          yPercent: 6,
          ease: 'none',
          scrollTrigger: {
            trigger: aboutWrapper,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1
          }
        });
      }

      if (aboutBadge) {
        gsap.to(aboutBadge, {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: aboutWrapper,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });

        // Flutuação orgânica contínua
        gsap.to(aboutBadge, {
          y: '+=7',
          duration: 3.2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
    }

    // C. Parallax na dobra "BPO Financeiro" (Dashboard e Badges flutuantes)
    const bpoFrame = document.querySelector('.bpo-image-frame');
    if (bpoFrame) {
      const bpoImg = bpoFrame.querySelector('img');
      const badgeTop = bpoFrame.querySelector('.badge-top');
      const badgeBottom = bpoFrame.querySelector('.badge-bottom');

      if (bpoImg) {
        gsap.to(bpoImg, {
          yPercent: 8,
          ease: 'none',
          scrollTrigger: {
            trigger: bpoFrame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.2
          }
        });
      }

      if (badgeTop) {
        gsap.to(badgeTop, {
          yPercent: -20,
          ease: 'none',
          scrollTrigger: {
            trigger: bpoFrame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });

        // Flutuação sutil
        gsap.to(badgeTop, {
          y: '-=6',
          rotation: -0.8,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      if (badgeBottom) {
        gsap.to(badgeBottom, {
          yPercent: 18,
          ease: 'none',
          scrollTrigger: {
            trigger: bpoFrame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4
          }
        });

        // Flutuação sutil descompassada
        gsap.to(badgeBottom, {
          y: '+=6',
          rotation: 0.8,
          duration: 4.0,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 0.4
        });
      }
    }
  }

  /* ==========================================================================
     3. REVELAÇÕES REFINADAS COM SCROLLTRIGGER (STAGGER SUAVE)
     ========================================================================== */
  function initScrollTriggers() {
    if (!ScrollTrigger) return;

    // A. Cabeçalhos de seção (Badge + Título + Subtítulo)
    const sectionHeaders = document.querySelectorAll('.section-header-center, .section-header');
    sectionHeaders.forEach(header => {
      const badge = header.querySelector('.section-badge');
      const title = header.querySelector('.section-title');
      const subtitle = header.querySelector('.section-subtitle');

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: header,
          start: 'top 88%',
          toggleActions: 'play none none none'
        },
        defaults: { ease: 'power3.out' }
      });

      if (badge) {
        tl.from(badge, { opacity: 0, y: 15, scale: 0.92, duration: 0.6 });
      }
      if (title) {
        tl.from(title, { opacity: 0, y: 26, duration: 0.75 }, '-=0.4');
      }
      if (subtitle) {
        tl.from(subtitle, { opacity: 0, y: 20, duration: 0.7 }, '-=0.5');
      }
    });

    // B. Grids com efeito Stagger elegante
    const gridConfigs = [
      { selector: '.quick-help-grid', items: '.quick-card', y: 35, stagger: 0.1 },
      { selector: '.diff-grid', items: '.diff-card', y: 40, stagger: 0.12 },
      { selector: '.solutions-grid', items: '.solution-card', y: 40, stagger: 0.09 },
      { selector: '.specialties-grid', items: '.specialty-card', y: 40, stagger: 0.14 },
      { selector: '.bpo-features-list', items: '.bpo-feature-item', y: 24, stagger: 0.08 },
      { selector: '.useful-links-grid', items: '.useful-link-card', y: 30, stagger: 0.07 }
    ];

    gridConfigs.forEach(conf => {
      const container = document.querySelector(conf.selector);
      if (!container) return;

      const items = container.querySelectorAll(conf.items);
      if (!items || !items.length) return;

      gsap.from(items, {
        scrollTrigger: {
          trigger: container,
          start: 'top 86%',
          toggleActions: 'play none none none'
        },
        opacity: 0,
        y: conf.y,
        duration: 0.8,
        stagger: conf.stagger,
        ease: 'power3.out',
        clearProps: 'transform,opacity'
      });
    });

    // C. Itens de estatística em "Quem Somos"
    const statsContainer = document.querySelector('.about-stats');
    if (statsContainer) {
      const statItems = statsContainer.querySelectorAll('.stat-item');
      if (statItems.length) {
        gsap.from(statItems, {
          scrollTrigger: {
            trigger: statsContainer,
            start: 'top 88%',
            toggleActions: 'play none none none'
          },
          opacity: 0,
          y: 28,
          duration: 0.75,
          stagger: 0.12,
          ease: 'power3.out',
          clearProps: 'transform,opacity'
        });
      }
    }
  }

  /* ==========================================================================
     4. TILT 3D SUAVE & REFLEXO INTERATIVO (DESKTOP)
     ========================================================================== */
  function initCardTilt() {
    if (isTouchDevice) return;

    const cards = document.querySelectorAll(
      '.quick-card, .diff-card, .solution-card, .specialty-card, .testimonial-card'
    );

    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const xNorm = (x / rect.width) - 0.5;
        const yNorm = (y / rect.height) - 0.5;

        // Limita a rotação máxima a 4 graus para efeito sutil e elegante
        const rotY = xNorm * 7;
        const rotX = -yNorm * 7;

        gsap.to(card, {
          rotateY: rotY,
          rotateX: rotX,
          transformPerspective: 1100,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });

        // Atualiza variáveis do brilho radial
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });

      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          rotateY: 0,
          rotateX: 0,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });
  }

  /* ==========================================================================
     5. BOTÕES MAGNÉTICOS REFINADOS (MICROINTERAÇÃO PREMIUM)
     ========================================================================== */
  function initMagneticButtons() {
    if (isTouchDevice) return;

    const magneticElements = document.querySelectorAll(
      '.hero-cta-group .btn-primary, .whatsapp-float, .carousel-nav-btn'
    );

    magneticElements.forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Atração suave de até 7px
        gsap.to(btn, {
          x: x * 0.22,
          y: y * 0.22,
          duration: 0.3,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      btn.addEventListener('mouseleave', () => {
        gsap.to(btn, {
          x: 0,
          y: 0,
          duration: 0.7,
          ease: 'elastic.out(1.1, 0.4)',
          overwrite: 'auto'
        });
      });
    });
  }

  /* ==========================================================================
     6. AMBIENTE E MICROINTERAÇÕES CONTÍNUAS
     ========================================================================== */
  function initAmbientElements() {
    // Balão flutuante do WhatsApp: pulso de atenção sutil
    const bubble = document.getElementById('whatsappPromptBubble');
    if (bubble) {
      gsap.to(bubble, {
        y: '-=4',
        duration: 2.6,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }

    // Botão flutuante WhatsApp: respiração suave
    const waFloat = document.querySelector('.whatsapp-float');
    if (waFloat) {
      gsap.to(waFloat, {
        boxShadow: '0 8px 32px rgba(37, 211, 102, 0.48)',
        duration: 1.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  /* ==========================================================================
     INICIALIZAÇÃO APÓS CARREGAMENTO DO DOM
     ========================================================================== */
  function start() {
    initHeroAnimations();
    initParallax();
    initScrollTriggers();
    initCardTilt();
    initMagneticButtons();
    initAmbientElements();

    // Atualiza ScrollTrigger após carregamento de todas as imagens
    window.addEventListener('load', () => {
      if (ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

})();
