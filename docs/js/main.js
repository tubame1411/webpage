/**
 * CW Log for Portable Operation - Official Web Manual JavaScript
 * Handles theming, search, table of contents tracking, lightbox, copy-to-clipboard, and accordion.
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTableOfContents();
  initSearch();
  initClipboard();
  initLightbox();
  initAccordion();
  initMobileMenu();
  initBreakdownInteractions();
  initScreenModeToggle();
});

/* ==========================================================================
   1. Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-icon');
  
  // Check stored theme or system preference
  const savedTheme = localStorage.getItem('cwlog_theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');

  applyTheme(initialTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      localStorage.setItem('cwlog_theme', newTheme);
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (!themeIcon) return;
    if (theme === 'dark') {
      // Moon / Sun SVG switch
      themeIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="5"></circle>
          <line x1="12" y1="1" x2="12" y2="3"></line>
          <line x1="12" y1="21" x2="12" y2="23"></line>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
          <line x1="1" y1="12" x2="3" y2="12"></line>
          <line x1="21" y1="12" x2="23" y2="12"></line>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
        </svg>`;
    } else {
      themeIcon.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
        </svg>`;
    }
  }
}

/* ==========================================================================
   2. Table of Contents & ScrollSpy
   ========================================================================== */
function initTableOfContents() {
  const sections = document.querySelectorAll('.manual-section, .subsection');
  const tocItems = document.querySelectorAll('.toc-item');
  const sidebar = document.getElementById('sidebar');

  if (!sections.length || !tocItems.length) return;

  const observerOptions = {
    root: null,
    rootMargin: '-80px 0px -70% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        if (!id) return;

        tocItems.forEach((item) => {
          const link = item.querySelector('a');
          if (link && link.getAttribute('href') === `#${id}`) {
            tocItems.forEach((i) => i.classList.remove('active'));
            item.classList.add('active');
            
            // Keep active item in visible scroll area of sidebar
            if (sidebar) {
              const itemTop = item.offsetTop;
              const sidebarScroll = sidebar.scrollTop;
              const sidebarHeight = sidebar.clientHeight;
              if (itemTop < sidebarScroll || itemTop > sidebarScroll + sidebarHeight - 40) {
                sidebar.scrollTo({ top: itemTop - 60, behavior: 'smooth' });
              }
            }
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => observer.observe(section));

  // Close sidebar on item click for mobile devices
  tocItems.forEach((item) => {
    const link = item.querySelector('a');
    if (link) {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 960 && sidebar) {
          sidebar.classList.remove('open');
        }
      });
    }
  });
}

/* ==========================================================================
   3. Mobile Menu Toggle
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('menu-toggle-btn');
  const sidebar = document.getElementById('sidebar');

  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('open');
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && e.target !== menuBtn) {
        sidebar.classList.remove('open');
      }
    });
  }
}

/* ==========================================================================
   4. Search Functionality
   ========================================================================== */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  const searchableElements = document.querySelectorAll('.feature-card, .breakdown-card, .step-item, .tip-card, .faq-item, .data-table tr');

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim().toLowerCase();

    if (!query) {
      searchableElements.forEach((el) => {
        el.style.display = '';
        el.style.opacity = '1';
      });
      return;
    }

    searchableElements.forEach((el) => {
      const text = el.textContent.toLowerCase();
      if (text.includes(query)) {
        el.style.display = '';
        el.style.opacity = '1';
      } else {
        el.style.opacity = '0.2';
      }
    });
  });
}

/* ==========================================================================
   5. Clipboard Copy with Toast
   ========================================================================== */
function initClipboard() {
  const copyTags = document.querySelectorAll('.copy-tag');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');

  copyTags.forEach((tag) => {
    tag.addEventListener('click', async () => {
      const textToCopy = tag.getAttribute('data-copy') || tag.innerText.trim();
      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`「${textToCopy}」をコピーしました`);
      } catch (err) {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast(`「${textToCopy}」をコピーしました`);
      }
    });
  });

  let toastTimeout;
  function showToast(message) {
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

/* ==========================================================================
   6. Image Lightbox Modal
   ========================================================================== */
function initLightbox() {
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const zoomableImages = document.querySelectorAll('.zoomable-img');

  if (!lightboxModal || !lightboxImg) return;

  zoomableImages.forEach((img) => {
    img.addEventListener('click', () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || 'Zoomed screen preview';
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  const closeModal = () => {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeModal);
  }

  lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
      closeModal();
    }
  });
}

/* ==========================================================================
   7. Accordion (FAQ & Sections)
   ========================================================================== */
function initAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach((item) => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // Close others for clean look
        faqItems.forEach((i) => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });
}

/* ==========================================================================
   8. Main Screen Interactive Breakdown Links
   ========================================================================== */
function initBreakdownInteractions() {
  const breakdownCards = document.querySelectorAll('.breakdown-card');

  breakdownCards.forEach((card) => {
    card.addEventListener('mouseenter', () => {
      breakdownCards.forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
    });
  });
}

/* ==========================================================================
   9. Screen Mode Toggle (Macro Show / Hide)
   ========================================================================== */
function initScreenModeToggle() {
  const btnNormal = document.getElementById('btn-mode-normal');
  const btnAll = document.getElementById('btn-mode-all');
  const previewImg = document.getElementById('main-screen-preview');

  if (!btnNormal || !btnAll || !previewImg) return;

  btnNormal.addEventListener('click', () => {
    btnNormal.classList.add('active');
    btnAll.classList.remove('active');
    previewImg.src = 'images/main_screen.png';
    previewImg.alt = 'CW Log メイン画面 (通常・マクロ表示)';
  });

  btnAll.addEventListener('click', () => {
    btnAll.classList.add('active');
    btnNormal.classList.remove('active');
    previewImg.src = 'images/main_screen_all.png';
    previewImg.alt = 'CW Log メイン画面 (マクロ非表示・全体ログ表示)';
  });
}
