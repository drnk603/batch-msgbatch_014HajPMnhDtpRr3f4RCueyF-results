(function () {
  'use strict';

  const appState = {
    menuOpen: false,
    scrollPosition: 0,
    formSubmitting: false
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const throttle = (func, limit) => {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  };

  const initBurgerMenu = () => {
    const toggle = document.querySelector('.navbar-toggler');
    const collapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.nav-link');

    if (!toggle || !collapse) return;

    const openMenu = () => {
      collapse.classList.add('show');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      appState.menuOpen = true;
    };

    const closeMenu = () => {
      collapse.classList.remove('show');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      appState.menuOpen = false;
    };

    const toggleMenu = () => {
      appState.menuOpen ? closeMenu() : openMenu();
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      toggleMenu();
    });

    navLinks.forEach((link) => {
      link.addEventListener('click', () => {
        if (appState.menuOpen) closeMenu();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && appState.menuOpen) closeMenu();
    });

    document.addEventListener('click', (e) => {
      if (
        appState.menuOpen &&
        !collapse.contains(e.target) &&
        !toggle.contains(e.target)
      ) {
        closeMenu();
      }
    });

    window.addEventListener(
      'resize',
      debounce(() => {
        if (window.innerWidth >= 1024 && appState.menuOpen) closeMenu();
      }, 150)
    );
  };

  const initSmoothScroll = () => {
    const isHomePage =
      window.location.pathname === '/' ||
      window.location.pathname === '/index.html' ||
      window.location.pathname.endsWith('/');

    document.addEventListener('click', (e) => {
      let target = e.target.closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      if (href.startsWith('#')) {
        e.preventDefault();
        const targetEl = document.getElementById(href.substring(1));
        if (targetEl) scrollToElement(targetEl);
      } else if (href.startsWith('/#') && isHomePage) {
        e.preventDefault();
        const targetEl = document.getElementById(href.substring(2));
        if (targetEl) scrollToElement(targetEl);
      }
    });
  };

  const scrollToElement = (element) => {
    const header = document.querySelector('.l-header');
    const headerHeight = header ? header.offsetHeight : 80;
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerHeight;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  };

  const initScrollSpy = () => {
    const sections = document.querySelectorAll('[id]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#"], .nav-link[href^="/#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    const observerCallback = throttle(() => {
      let currentSection = '';
      const scrollPos = window.pageYOffset + 100;

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
          currentSection = section.getAttribute('id');
        }
      });

      navLinks.forEach((link) => {
        link.classList.remove('active');
        link.removeAttribute('aria-current');
        const href = link.getAttribute('href');
        const id = href.startsWith('/#') ? href.substring(2) : href.substring(1);
        if (id === currentSection) {
          link.classList.add('active');
          link.setAttribute('aria-current', 'page');
        }
      });
    }, 100);

    window.addEventListener('scroll', observerCallback);
    observerCallback();
  };

  const initScrollToTop = () => {
    const scrollTopBtn = document.querySelector('[data-scroll-top]');
    if (!scrollTopBtn) return;

    const toggleVisibility = throttle(() => {
      if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('visible');
      } else {
        scrollTopBtn.classList.remove('visible');
      }
    }, 100);

    window.addEventListener('scroll', toggleVisibility);

    scrollTopBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  const initFormValidation = () => {
    const forms = document.querySelectorAll('form[id]');
    if (forms.length === 0) return;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-ZÀ-ÿ\s\-']{2,50}$/;
    const phoneRegex = /^[\d\s\+\-\(\)]{7,20}$/;
    const messageMinLength = 10;

    const showError = (input, message) => {
      const errorEl = input.nextElementSibling;
      if (errorEl && errorEl.classList.contains('invalid-feedback')) {
        errorEl.textContent = message;
      } else {
        const newError = document.createElement('div');
        newError.className = 'invalid-feedback';
        newError.textContent = message;
        input.parentNode.insertBefore(newError, input.nextSibling);
      }
      input.classList.add('is-invalid');
    };

    const clearError = (input) => {
      input.classList.remove('is-invalid');
      const errorEl = input.nextElementSibling;
      if (errorEl && errorEl.classList.contains('invalid-feedback')) {
        errorEl.textContent = '';
      }
    };

    const validateField = (input) => {
      clearError(input);
      const value = input.value.trim();
      const type = input.type;
      const id = input.id;
      const name = input.name;

      if (input.hasAttribute('required') && !value) {
        showError(input, 'Toto pole je povinné');
        return false;
      }

      if (type === 'email' || id === 'email' || name === 'email') {
        if (value && !emailRegex.test(value)) {
          showError(input, 'Neplatný formát e-mailu');
          return false;
        }
      }

      if (id === 'name' || name === 'name') {
        if (value && !nameRegex.test(value)) {
          showError(input, 'Meno musí obsahovať 2-50 znakov (len písmená, medzery, pomlčky)');
          return false;
        }
      }

      if (type === 'tel' || id === 'phone' || name === 'phone') {
        if (value && !phoneRegex.test(value)) {
          showError(input, 'Neplatný formát telefónneho čísla');
          return false;
        }
      }

      if (input.tagName === 'TEXTAREA' && (id === 'message' || name === 'message')) {
        if (value && value.length < messageMinLength) {
          showError(input, `Správa musí mať aspoň ${messageMinLength} znakov`);
          return false;
        }
      }

      if (type === 'checkbox' && input.hasAttribute('required')) {
        if (!input.checked) {
          showError(input, 'Toto pole je povinné');
          return false;
        }
      }

      if (type === 'radio' && input.hasAttribute('required')) {
        const radioGroup = document.querySelectorAll(`input[name="${name}"]`);
        const isChecked = Array.from(radioGroup).some((radio) => radio.checked);
        if (!isChecked) {
          showError(input, 'Vyberte jednu možnosť');
          return false;
        }
      }

      return true;
    };

    const validateForm = (form) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      let isValid = true;

      inputs.forEach((input) => {
        if (!validateField(input)) {
          isValid = false;
        }
      });

      return isValid;
    };

    const showNotification = (message, type = 'success') => {
      let container = document.getElementById('notification-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
      }

      const alert = document.createElement('div');
      alert.className = `alert alert-${type} alert-dismissible fade show`;
      alert.setAttribute('role', 'alert');
      alert.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;

      container.appendChild(alert);

      setTimeout(() => {
        alert.classList.remove('show');
        setTimeout(() => alert.remove(), 150);
      }, 5000);

      const closeBtn = alert.querySelector('.btn-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          alert.classList.remove('show');
          setTimeout(() => alert.remove(), 150);
        });
      }
    };

    forms.forEach((form) => {
      const inputs = form.querySelectorAll('input, textarea, select');
      inputs.forEach((input) => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
          if (input.classList.contains('is-invalid')) {
            validateField(input);
          }
        });
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (appState.formSubmitting) return;

        if (!validateForm(form)) {
          showNotification('Opravte chyby vo formulári', 'danger');
          return;
        }

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Odosielanie...';
        }

        appState.formSubmitting = true;

        const formData = new FormData(form);
        const jsonData = {};
        formData.forEach((value, key) => {
          jsonData[key] = value;
        });

        setTimeout(() => {
          fetch('process.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jsonData)
          })
            .then((response) => {
              if (!response.ok) throw new Error('Network response was not ok');
              return response.json();
            })
            .then((data) => {
              if (data.success) {
                showNotification('Ďakujeme! Vaša správa bola úspešne odoslaná.', 'success');
                setTimeout(() => {
                  window.location.href = 'thank_you.html';
                }, 1500);
              } else {
                showNotification('Nastala chyba pri odosielaní. Skúste to prosím znova.', 'danger');
              }
            })
            .catch(() => {
              showNotification('Ошибка соединения, попробуйте позже', 'danger');
            })
            .finally(() => {
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
              }
              appState.formSubmitting = false;
            });
        }, 500);
      });
    });
  };

  const initFAQSearch = () => {
    const searchInput = document.getElementById('faq-search-input');
    if (!searchInput) return;

    const accordionItems = document.querySelectorAll('.accordion-item');

    searchInput.addEventListener(
      'input',
      debounce((e) => {
        const query = e.target.value.toLowerCase().trim();

        accordionItems.forEach((item) => {
          const text = item.textContent.toLowerCase();
          if (!query || text.includes(query)) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
      }, 300)
    );
  };

  const initCountUp = () => {
    const counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    const animateCount = (element) => {
      const target = parseInt(element.getAttribute('data-count'), 10);
      const duration = 2000;
      const increment = target / (duration / 16);
      let current = 0;

      const updateCount = () => {
        current += increment;
        if (current < target) {
          element.textContent = Math.floor(current);
          requestAnimationFrame(updateCount);
        } else {
          element.textContent = target;
        }
      };

      updateCount();
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCount(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  };

  const initLazyLoading = () => {
    const images = document.querySelectorAll('img:not([loading])');
    images.forEach((img) => {
      if (!img.hasAttribute('data-critical')) {
        img.setAttribute('loading', 'lazy');
      }
    });

    const videos = document.querySelectorAll('video:not([loading])');
    videos.forEach((video) => {
      video.setAttribute('loading', 'lazy');
    });
  };

  const initModals = () => {
    const modalTriggers = document.querySelectorAll('[data-modal]');
    if (modalTriggers.length === 0) return;

    const createOverlay = () => {
      const overlay = document.createElement('div');
      overlay.className = 'modal-overlay';
      overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        z-index: 1000;
        display: none;
      `;
      document.body.appendChild(overlay);
      return overlay;
    };

    let overlay = document.querySelector('.modal-overlay') || createOverlay();

    modalTriggers.forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        const modalId = trigger.getAttribute('data-modal');
        const modal = document.getElementById(modalId);

        if (modal) {
          overlay.style.display = 'block';
          modal.classList.add('open');
          document.body.style.overflow = 'hidden';

          const closeModal = () => {
            overlay.style.display = 'none';
            modal.classList.remove('open');
            document.body.style.overflow = '';
          };

          overlay.addEventListener('click', closeModal);
          const closeBtn = modal.querySelector('[data-close]');
          if (closeBtn) {
            closeBtn.addEventListener('click', closeModal);
          }

          document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
              closeModal();
              document.removeEventListener('keydown', escHandler);
            }
          });
        }
      });
    });
  };

  const initRippleEffect = () => {
    const buttons = document.querySelectorAll('.btn');

    buttons.forEach((button) => {
      button.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.cssText = `
          position: absolute;
          left: ${x}px;
          top: ${y}px;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.5);
          transform: translate(-50%, -50%);
          pointer-events: none;
        `;

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
      });
    });
  };

  const init = () => {
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initScrollToTop();
    initFormValidation();
    initFAQSearch();
    initCountUp();
    initLazyLoading();
    initModals();
    initRippleEffect();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();