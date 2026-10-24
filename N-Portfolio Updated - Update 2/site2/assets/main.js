(function(){
  const root = document.documentElement;

  // ---- Theme ----
  const themeBtns = [document.getElementById('themeToggle'), document.getElementById('themeToggleMobile')];
  const profileImage = document.querySelector('.portrait-frame img');
  const themeToast = document.createElement('div');
  themeToast.className = 'theme-toast';
  themeToast.setAttribute('role', 'status');
  themeToast.setAttribute('aria-live', 'polite');
  document.body.appendChild(themeToast);
  let themeToastTimer;
  function setTheme(mode){
    if(mode === 'dark'){ root.classList.add('dark'); } else { root.classList.remove('dark'); }
    if(profileImage){
      const portraitSrc = profileImage.getAttribute('data-' + mode + '-src');
      if(portraitSrc && profileImage.getAttribute('src') !== portraitSrc){
        profileImage.setAttribute('src', portraitSrc);
      }
    }
    localStorage.setItem('naushad-theme-v2', mode);
    themeBtns.forEach(btn => {
      if(btn) btn.setAttribute('aria-label', mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function showThemeToast(mode){
    themeToast.textContent = mode === 'dark' ? 'Dark mode on' : 'Light mode on';
    themeToast.classList.add('visible');
    window.clearTimeout(themeToastTimer);
    themeToastTimer = window.setTimeout(() => themeToast.classList.remove('visible'), 1800);
  }
  const savedTheme = localStorage.getItem('naushad-theme-v2');
  setTheme(savedTheme || 'dark');
  themeBtns.forEach(btn => {
    if(!btn) return;
    btn.addEventListener('click', () => {
      const mode = root.classList.contains('dark') ? 'light' : 'dark';
      setTheme(mode);
      showThemeToast(mode);
    });
  });

  // ---- Sticky nav on scroll ----
  const nav = document.getElementById('siteNav');
  function onScroll(){
    if(!nav) return;
    if(window.scrollY > 12){ nav.classList.add('scrolled'); } else { nav.classList.remove('scrolled'); }
  }
  document.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  // ---- Active nav link follows the section in view ----
  const sectionIds = ['home','currently','work','experience','education','achievements','skills','about','engineering-focus','proof','contact'];
  const sections = sectionIds.map(id => document.getElementById(id)).filter(Boolean);
  const navLinkEls = Array.from(document.querySelectorAll('.nav-links a[href^="#"], .mobile-menu a[href^="#"]'));
  function onActiveScroll(){
    let current = sections[0] ? sections[0].id : null;
    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if(rect.top <= 140){ current = sec.id; }
    });
    navLinkEls.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === '#' + current);
    });
  }
  document.addEventListener('scroll', onActiveScroll, { passive:true });
  onActiveScroll();

  // ---- Mobile menu ----
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  const themeToggleMobile = document.getElementById('themeToggleMobile');
  const navLinksWrap = document.getElementById('navLinks');
  function setMobileMenuOpen(open){
    if(!mobileMenu) return;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.inert = !open;
    mobileMenu.setAttribute('aria-hidden', open ? 'false' : 'true');
    if(hamburger){
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      hamburger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
  }
  function syncMobileControls(){
    const mobile = window.innerWidth <= 1100;
    if(hamburger) hamburger.style.display = mobile ? 'flex' : 'none';
    if(themeToggleMobile) themeToggleMobile.style.display = mobile ? 'flex' : 'none';
    if(navLinksWrap) navLinksWrap.style.display = mobile ? 'none' : 'flex';
    if(!mobile) setMobileMenuOpen(false);
  }
  window.addEventListener('resize', syncMobileControls);
  syncMobileControls();
  if(hamburger && mobileMenu){
    hamburger.addEventListener('click', () => {
      setMobileMenuOpen(!mobileMenu.classList.contains('open'));
    });
  }
  if(mobileMenu){
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMobileMenuOpen(false)));
    document.addEventListener('keydown', (event) => {
      if(event.key === 'Escape' && mobileMenu.classList.contains('open')){
        setMobileMenuOpen(false);
        hamburger && hamburger.focus();
      }
    });
  }

  // ---- Scroll reveal ----
  const reveals = document.querySelectorAll('.reveal');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(prefersReducedMotion){
    reveals.forEach(el => el.classList.add('in'));
  } else if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if(entry.isIntersecting){ entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold:0.12 });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in'));
  }

  // ---- Page fade-in ----
  window.addEventListener('DOMContentLoaded', () => document.body.classList.add('ready'));

  // ---- Custom cursor (desktop only) ----
  const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if(hasFinePointer && !prefersReducedMotion){
    const cursorDot = document.createElement('div'); cursorDot.className = 'cursor-dot';
    const cursorRing = document.createElement('div'); cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorDot); document.body.appendChild(cursorRing);
    let mx=-100, my=-100, rx=-100, ry=-100;
    document.addEventListener('mousemove', (e) => {
      mx=e.clientX; my=e.clientY;
      cursorDot.style.left = mx+'px'; cursorDot.style.top = my+'px';
    });
    (function animateRing(){
      rx += (mx-rx)*0.18; ry += (my-ry)*0.18;
      cursorRing.style.left = rx+'px'; cursorRing.style.top = ry+'px';
      requestAnimationFrame(animateRing);
    })();
    document.querySelectorAll('a, button, .project-card').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  }

  // ---- 3D tilt on project cards ----
  if(hasFinePointer && !prefersReducedMotion){
    document.querySelectorAll('.tilt-card .project-card').forEach(card => {
      const strength = 7;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `rotateX(${(-py*strength).toFixed(2)}deg) rotateY(${(px*strength).toFixed(2)}deg)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = 'rotateX(0deg) rotateY(0deg)'; });
    });
  }
})();
