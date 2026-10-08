/**
 * CENTRAL SOLUÇÕES EMPRESARIAIS - ULTRA-PREMIUM GSAP, LENIS & PARALLAX ENGINE
 * Efeitos visuais de alto padrão:
 * - Rolagem suave inercial (Lenis) sincronizada com GSAP ScrollTrigger
 * - Canvas de partículas / poeira dourada flutuante (ambient golden dust)
 * - Aura luminosa interativa que segue o cursor nas seções escuras
 * - Parallax em múltiplos planos (decor, foto CEO, dashboard BPO, badges 3D)
 * - Tilt 3D com reflexo radial de lente (lens sheen) em cards
 * - Efeito magnético de alta precisão em botões de ação e WhatsApp
 * - Ticker com aceleração reativa à velocidade de scroll
 */

(function () {
  'use strict';

  // Verificação de segurança para GSAP
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
    console.info('[Central Animations] Modo de movimento reduzido ativo pelo sistema.');
    return;
  }

  const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 992;

  /* ==========================================================================
     1. LENIS SMOOTH SCROLL (ROLAGEM SUAVE INERCIAL CINEMATOGRÁFICA)
     ========================================================================== */
  let lenisInstance = null;

  function initLenisSmoothScroll() {
    if (typeof window.Lenis === 'undefined' || isTouchDevice) return;

    try {
      lenisInstance = new window.Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.5,
        infinite: false
      });

      // Sincroniza Lenis com o ScrollTrigger do GSAP
      lenisInstance.on('scroll', ScrollTrigger ? ScrollTrigger.update : () => {});

      gsap.ticker.add((time) => {
        lenisInstance.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);

      // Suporte para links internos (âncoras suaves)
      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        anchor.addEventListener('click', (e) => {
          const targetId = anchor.getAttribute('href');
          if (targetId && targetId !== '#' && targetId.length > 1) {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
              e.preventDefault();
              lenisInstance.scrollTo(targetEl, { offset: -90, duration: 1.2 });
            }
          }
        });
      });
    } catch (err) {
      console.warn('[Central Animations] Lenis init skipped:', err);
    }
  }

  /* ==========================================================================
     2. PARTICULAS DOURADAS FLUTUANTES (AMBIENT GOLDEN DUST)
     ========================================================================== */
  function initHeroParticles() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;

    let canvas = hero.querySelector('.hero-particles-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.className = 'hero-particles-canvas';
      hero.insertBefore(canvas, hero.firstChild);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let animationFrameId = null;
    let isVisible = true;
    let mouseX = 0;
    let mouseY = 0;

    const PARTICLE_COUNT = isTouchDevice ? 18 : 34;

    function resize() {
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.8,
        baseAlpha: Math.random() * 0.45 + 0.2,
        alpha: 0,
        speedY: -(Math.random() * 0.35 + 0.15),
        speedX: (Math.random() - 0.5) * 0.25,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: Math.random() * 0.02 + 0.008
      };
    }

    function initParticles() {
      resize();
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function updateAndDraw() {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      const targetX = mouseX * 0.2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.swing += p.swingSpeed;
        p.x += p.speedX + Math.sin(p.swing) * 0.3 + targetX * 0.05;
        p.y += p.speedY;

        // Efeito de fade nas bordas
        const edgeDistY = Math.min(p.y, height - p.y);
        const fadeY = Math.min(edgeDistY / 80, 1);
        p.alpha = p.baseAlpha * Math.max(0, fadeY);

        // Reposicionamento quando sair da tela
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        } else if (p.y > height + 10) {
          p.y = -10;
        }

        if (p.x < -10) p.x = width + 10;
        else if (p.x > width + 10) p.x = -10;

        // Desenha partícula com gradiente dourado suave
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(218, 183, 141, ${p.alpha})`;
        ctx.shadowColor = 'rgba(255, 225, 180, 0.45)';
        ctx.shadowBlur = p.radius * 2.5;
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    }

    window.addEventListener('resize', resize, { passive: true });

    if (!isTouchDevice) {
      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        mouseX = (e.clientX - rect.left) / width - 0.5;
        mouseY = (e.clientY - rect.top) / height - 0.5;
      }, { passive: true });
    }

    // Otimização: pausa renderização quando fora da viewport
    if (ScrollTrigger) {
      ScrollTrigger.create({
        trigger: hero,
        start: 'top bottom',
        end: 'bottom top',
        onEnter: () => {
          isVisible = true;
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(updateAndDraw);
        },
        onLeave: () => {
          isVisible = false;
          cancelAnimationFrame(animationFrameId);
        },
        onEnterBack: () => {
          isVisible = true;
          cancelAnimationFrame(animationFrameId);
          animationFrameId = requestAnimationFrame(updateAndDraw);
        },
        onLeaveBack: () => {
          isVisible = false;
          cancelAnimationFrame(animationFrameId);
        }
      });
    }

    initParticles();
    animationFrameId = requestAnimationFrame(updateAndDraw);
  }

  /* ==========================================================================
     3. AURA DOURADA NO CURSOR (DESKTOP)
     ========================================================================== */
  function initCursorAura() {
    if (isTouchDevice) return;

    const darkSections = document.querySelectorAll('.hero-section, .bpo-financeiro-banner');
    darkSections.forEach(section => {
      let aura = section.querySelector('.hero-cursor-aura');
      if (!aura) {
        aura = document.createElement('div');
        aura.className = 'hero-cursor-aura';
        section.appendChild(aura);
      }

      section.addEventListener('mousemove', (e) => {
        const rect = section.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        gsap.to(aura, {
          left: x,
          top: y,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });

      section.addEventListener('mouseleave', () => {
        gsap.to(aura, {
          opacity: 0,
          duration: 0.6,
          ease: 'power2.out'
        });
      });
    });
  }

  /* ==========================================================================
     4. TIMELINE DE ENTRADA HERO COM SHIMMER METÁLICO
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
        y: -20,
        scale: 0.92,
        duration: 0.8,
        delay: 0.1
      });
    }

    if (heroTitle) {
      tl.from(heroTitle, {
        opacity: 0,
        y: 32,
        duration: 0.9
      }, '-=0.5');
    }

    if (heroDesc) {
      tl.from(heroDesc, {
        opacity: 0,
        y: 24,
        duration: 0.85
      }, '-=0.6');
    }

    if (heroCtas && heroCtas.length) {
      tl.from(heroCtas, {
        opacity: 0,
        y: 20,
        stagger: 0.14,
        duration: 0.75
      }, '-=0.55');
    }

    // Brilho pulsante contínuo
    if (heroGlow) {
      gsap.to(heroGlow, {
        scale: 1.16,
        opacity: 0.88,
        duration: 4.8,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      });
    }
  }

  /* ==========================================================================
     5. PARALLAX MULTIPLANO COM SCROLLTRIGGER
     ========================================================================== */
  function initParallax() {
    if (!ScrollTrigger) return;

    // A. Parallax de saída da Hero
    const heroSection = document.querySelector('.hero-section');
    const heroContent = document.querySelector('.hero-content');
    if (heroSection && heroContent) {
      gsap.to(heroContent, {
        y: 65,
        opacity: 0.7,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2
        }
      });
    }

    // B. Parallax na dobra "Quem Somos" (Imagem CEO + Badges)
    const aboutWrapper = document.querySelector('.about-image-wrapper');
    if (aboutWrapper) {
      const aboutFrame = aboutWrapper.querySelector('.about-image-frame');
      const aboutDecor = aboutWrapper.querySelector('.about-image-decor');
      const aboutBadge = aboutWrapper.querySelector('.about-badge-floating');

      if (aboutDecor) {
        gsap.to(aboutDecor, {
          yPercent: -14,
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
          yPercent: 7,
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
          yPercent: -22,
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

    // C. Parallax na dobra "BPO Financeiro"
    const bpoFrame = document.querySelector('.bpo-image-frame');
    if (bpoFrame) {
      const bpoImg = bpoFrame.querySelector('img');
      const badgeTop = bpoFrame.querySelector('.badge-top');
      const badgeBottom = bpoFrame.querySelector('.badge-bottom');

      if (bpoImg) {
        gsap.to(bpoImg, {
          yPercent: 9,
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
          yPercent: -22,
          ease: 'none',
          scrollTrigger: {
            trigger: bpoFrame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.5
          }
        });

        gsap.to(badgeTop, {
          y: '-=6',
          rotation: -1,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }

      if (badgeBottom) {
        gsap.to(badgeBottom, {
          yPercent: 20,
          ease: 'none',
          scrollTrigger: {
            trigger: bpoFrame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.4
          }
        });

        gsap.to(badgeBottom, {
          y: '+=6',
          rotation: 1,
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
     6. REVELAÇÃO REFINADA COM SCROLLTRIGGER (STAGGER SUAVE)
     ========================================================================== */
  function initScrollTriggers() {
    if (!ScrollTrigger) return;

    // Cabeçalhos de seção (Badge + Título + Subtítulo)
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
        tl.from(badge, { opacity: 0, y: 16, scale: 0.92, duration: 0.6 });
      }
      if (title) {
        tl.from(title, { opacity: 0, y: 28, duration: 0.8 }, '-=0.4');
      }
      if (subtitle) {
        tl.from(subtitle, { opacity: 0, y: 20, duration: 0.75 }, '-=0.5');
      }
    });

    // Grids com efeito Stagger elegante
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

    // Itens de estatística em "Quem Somos"
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
     7. TILT 3D COM LENS SHEEN EM CARDS (DESKTOP)
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

        const rotY = xNorm * 7.5;
        const rotX = -yNorm * 7.5;

        gsap.to(card, {
          rotateY: rotY,
          rotateX: rotX,
          transformPerspective: 1100,
          duration: 0.35,
          ease: 'power2.out',
          overwrite: 'auto'
        });

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
     8. BOTÕES MAGNÉTICOS REFINADOS (MICROINTERAÇÃO)
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
     9. TICKER REATIVO À VELOCIDADE DE SCROLL
     ========================================================================== */
  function initVelocityMarquee() {
    if (!ScrollTrigger) return;

    const marqueeTrack = document.querySelector('.marquee-track');
    if (!marqueeTrack) return;

    let baseDuration = 40;

    ScrollTrigger.create({
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity());
        if (velocity > 400) {
          // Acelera sutilmente a faixa durante scrolls rápidos
          marqueeTrack.style.animationDuration = '18s';
        } else {
          marqueeTrack.style.animationDuration = `${baseDuration}s`;
        }
      }
    });
  }

  /* ==========================================================================
     INICIALIZAÇÃO APÓS CARREGAMENTO DO DOM
     ========================================================================== */
  function start() {
    initLenisSmoothScroll();
    initHeroParticles();
    initCursorAura();
    initHeroAnimations();
    initParallax();
    initScrollTriggers();
    initCardTilt();
    initMagneticButtons();
    initVelocityMarquee();

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
