(() => {
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];

  // Loader: fast editorial intro instead of a generic spinner.
  const loader = $('#loader');
  const percent = $('#loaderPercent');
  let n = 0;
  const loaderTimer = setInterval(() => {
    n += Math.floor(Math.random() * 12) + 7;
    if (n >= 100) { n = 100; clearInterval(loaderTimer); }
    if (percent) percent.textContent = `${n}%`;
  }, 110);
  window.addEventListener('load', () => setTimeout(() => loader?.classList.add('done'), 900));

  // Header + scroll progress.
  const header = $('#siteHeader');
  const progress = $('.scroll-progress span');
  const onScroll = () => {
    header?.classList.toggle('scrolled', window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = `${max ? (window.scrollY / max) * 100 : 0}%`;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile menu.
  const toggle = $('.menu-toggle');
  const mobile = $('#mobileMenu');
  const closeMenu = () => {
    toggle?.classList.remove('open'); mobile?.classList.remove('open');
    document.body.classList.remove('menu-open'); toggle?.setAttribute('aria-expanded', 'false');
  };
  toggle?.addEventListener('click', () => {
    const open = !mobile.classList.contains('open');
    toggle.classList.toggle('open', open); mobile.classList.toggle('open', open);
    document.body.classList.toggle('menu-open', open); toggle.setAttribute('aria-expanded', String(open));
  });
  $$('.mobile-menu a').forEach(a => a.addEventListener('click', closeMenu));

  // Reveal on scroll.
  const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); }
  }), { threshold: .12, rootMargin: '0px 0px -45px' });
  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Smooth anchor navigation, including the buttons that should never be dead ends.
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    const target = id && document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    closeMenu();
  }));

  // Active nav section.
  const navLinks = $$('.desktop-nav a');
  const sections = ['experience','work','opensource','skills','credentials','resume','contact'].map(id => document.getElementById(id)).filter(Boolean);
  const navObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
  }), { rootMargin: '-35% 0px -55% 0px' });
  sections.forEach(s => navObserver.observe(s));

  // Editorial custom cursor + magnetic links.
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  window.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    if (dot) { dot.style.left = `${mx}px`; dot.style.top = `${my}px`; }
  }, { passive: true });
  const cursorLoop = () => {
    rx += (mx-rx)*.12; ry += (my-ry)*.12;
    if (ring) { ring.style.left = `${rx}px`; ring.style.top = `${ry}px`; }
    if (label) { label.style.left = `${rx}px`; label.style.top = `${ry}px`; }
    requestAnimationFrame(cursorLoop);
  };
  cursorLoop();

  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX-r.left-r.width/2)*.14;
      const y = (e.clientY-r.top-r.height/2)*.14;
      el.style.transform = `translate(${x}px,${y}px)`;
    });
    el.addEventListener('mouseleave', () => el.style.transform = 'translate(0,0)');
  });

  // Cards react to the pointer position — inspired by interactive studio portfolios.
  $$('.interactive-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX-r.left)/r.width)*100;
      const y = ((e.clientY-r.top)/r.height)*100;
      card.style.setProperty('--mx', `${x}%`); card.style.setProperty('--my', `${y}%`);
      if (ring) ring.classList.add('hover');
      if (label) label.textContent = card.dataset.cursor || 'VIEW';
    });
    card.addEventListener('mouseenter', () => { if (ring) ring.classList.add('hover'); });
    card.addEventListener('mouseleave', () => { if (ring) ring.classList.remove('hover'); });
  });

  // Hero image depth.
  const frame = $('.visual-frame');
  window.addEventListener('mousemove', e => {
    if (!frame || innerWidth < 900) return;
    const x = (e.clientX / innerWidth - .5) * 4;
    const y = (e.clientY / innerHeight - .5) * 4;
    frame.style.transform = `perspective(1100px) rotateY(${x}deg) rotateX(${-y}deg)`;
  }, { passive: true });
  frame?.addEventListener('mouseleave', () => frame.style.transform = 'perspective(1100px) rotateY(0deg) rotateX(0deg)');

  // Certificate preview modal.
  const modal = $('#certificateModal');
  const modalImg = $('#certificateModalImage');
  const openCertificate = (path) => {
    if (!modal || !modalImg) return;
    modalImg.src = path;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('menu-open');
  };
  const closeCertificate = () => {
    modal?.classList.remove('open'); modal?.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('menu-open');
  };
  $$('.certificate-trigger').forEach(el => {
    el.addEventListener('click', () => openCertificate(el.dataset.cert));
    el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCertificate(el.dataset.cert); } });
  });
  $$('.certificate-button').forEach(btn => btn.addEventListener('click', e => { e.stopPropagation(); openCertificate(btn.dataset.cert); }));
  $$('[data-close-modal]').forEach(el => el.addEventListener('click', closeCertificate));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCertificate(); });

  // Point the Open/Download buttons at a Blob URL built from the embedded
  // PDF data (resume-data.js), so they work purely from within the page
  // itself — even if the assets/ folder isn't present alongside index.html.
  if (typeof RESUME_PDF_BASE64 !== 'undefined' && RESUME_PDF_BASE64) {
    try {
      const binary = atob(RESUME_PDF_BASE64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const blobUrl = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }));

      const openBtn = $('#resumeOpenBtn');
      const downloadBtn = $('#resumeDownloadBtn');
      if (openBtn) openBtn.href = blobUrl;
      if (downloadBtn) downloadBtn.href = blobUrl;
    } catch (error) {
      console.warn('Resume buttons: falling back to assets/ path.', error);
    }
  }

  // Clean, browser-chrome-free resume viewer using PDF.js.
  const resumeViewer = $('#resumeViewer');
  if (resumeViewer) {
    const pdfPath = resumeViewer.dataset.pdf;
    const pdfjsUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs';
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs';

    const showResumeError = () => {
      resumeViewer.innerHTML = `<div class="resume-error">Resume preview could not be rendered here.<br><a href="${pdfPath}" target="_blank" rel="noopener noreferrer">Open the PDF directly ↗</a></div>`;
    };

    const renderResume = async () => {
      try {
        const pdfjsLib = await import(pdfjsUrl);
        pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

        // Load from the embedded base64 copy (resume-data.js) instead of
        // fetching the PDF file. Fetch/XHR of local files is blocked by
        // browsers under the file:// protocol, so this is what lets the
        // full resume render inline with zero server required.
        let loadingTask;
        if (typeof RESUME_PDF_BASE64 !== 'undefined' && RESUME_PDF_BASE64) {
          const binary = atob(RESUME_PDF_BASE64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          loadingTask = pdfjsLib.getDocument(pdfPath);
        }

        const pdf = await loadingTask.promise;
        resumeViewer.innerHTML = '';

        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const baseViewport = page.getViewport({ scale: 1 });
          const targetWidth = Math.min(resumeViewer.clientWidth, 860);
          const scale = targetWidth / baseViewport.width;
          const viewport = page.getViewport({ scale });
          const dpr = Math.min(window.devicePixelRatio || 1, 2);

          const pageWrap = document.createElement('div');
          pageWrap.className = 'resume-page-wrap';
          pageWrap.style.width = `${viewport.width}px`;
          pageWrap.style.height = `${viewport.height}px`;

          const canvas = document.createElement('canvas');
          canvas.className = 'resume-page';
          canvas.width = Math.floor(viewport.width * dpr);
          canvas.height = Math.floor(viewport.height * dpr);
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;
          pageWrap.appendChild(canvas);
          resumeViewer.appendChild(pageWrap);

          const context = canvas.getContext('2d', { alpha: false });
          await page.render({
            canvasContext: context,
            viewport,
            transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
          }).promise;

          // Overlay real, clickable links (GitHub, Demo, portfolio, email, etc.)
          // exactly where they sit in the PDF, using each link annotation's
          // rect converted into on-screen viewport coordinates.
          const annotations = await page.getAnnotations();
          const links = annotations.filter(a => a.subtype === 'Link' && (a.url || a.unsafeUrl));
          if (links.length) {
            const linkLayer = document.createElement('div');
            linkLayer.className = 'resume-link-layer';
            links.forEach(annotation => {
              const url = annotation.url || annotation.unsafeUrl;
              const [rx1, ry1, rx2, ry2] = viewport.convertToViewportRectangle(annotation.rect);
              const left = Math.min(rx1, rx2);
              const top = Math.min(ry1, ry2);
              const width = Math.abs(rx2 - rx1);
              const height = Math.abs(ry2 - ry1);

              const a = document.createElement('a');
              a.href = url;
              a.target = '_blank';
              a.rel = 'noopener noreferrer';
              a.title = url;
              a.style.left = `${left}px`;
              a.style.top = `${top}px`;
              a.style.width = `${width}px`;
              a.style.height = `${height}px`;
              linkLayer.appendChild(a);
            });
            pageWrap.appendChild(linkLayer);
          }
        }
      } catch (error) {
        console.warn('Resume viewer:', error);
        showResumeError();
      }
    };

    renderResume();
  }

})();
