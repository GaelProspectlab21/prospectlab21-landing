/* ProspectLab21 — Landing JS (vanilla port of the design React prototype)
   No frameworks, no runtime transpilation. Same DOM the original CSS expects. */
(() => {
  'use strict';

  const CAL_URL = 'https://call.prospectlab21.com';
  const XRAY_URL = 'https://xray.prospectlab21.com';

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const el = (tag, attrs = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k === 'html') n.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else if (k === 'dataset') Object.assign(n.dataset, v);
      else if (k in n && typeof v !== 'string') n[k] = v;
      else n.setAttribute(k, v);
    }
    for (const k of kids) {
      if (k == null || k === false) continue;
      if (Array.isArray(k)) k.forEach(x => x != null && n.appendChild(x.nodeType ? x : document.createTextNode(String(x))));
      else if (k.nodeType) n.appendChild(k);
      else n.appendChild(document.createTextNode(String(k)));
    }
    return n;
  };
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = (tag, attrs = {}, ...kids) => {
    const n = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.setAttribute('class', v);
      else n.setAttribute(k, v);
    }
    for (const k of kids) if (k) n.appendChild(k);
    return n;
  };
  const prefersReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- ICONS ---------------- */
  function Icon(name, size = 18, stroke = 1.5) {
    const a = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': stroke, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const make = (...children) => svg('svg', a, ...children);
    switch (name) {
      case 'arrow-right': return make(svg('line', { x1: 5, y1: 12, x2: 19, y2: 12 }), svg('polyline', { points: '12 5 19 12 12 19' }));
      case 'arrow-ur':    return make(svg('line', { x1: 7, y1: 17, x2: 17, y2: 7 }), svg('polyline', { points: '7 7 17 7 17 17' }));
      case 'mail':        return make(svg('rect', { x: 2, y: 4, width: 20, height: 16, rx: 1 }), svg('polyline', { points: '2 6 12 13 22 6' }));
      case 'calendar':    return make(svg('rect', { x: 3, y: 4, width: 18, height: 18, rx: 1 }), svg('line', { x1: 16, y1: 2, x2: 16, y2: 6 }), svg('line', { x1: 8, y1: 2, x2: 8, y2: 6 }), svg('line', { x1: 3, y1: 10, x2: 21, y2: 10 }));
      case 'reply':       return make(svg('polyline', { points: '9 17 4 12 9 7' }), svg('path', { d: 'M20 18v-2a4 4 0 0 0-4-4H4' }));
      case 'archive':     return make(svg('polyline', { points: '21 8 21 21 3 21 3 8' }), svg('rect', { x: 1, y: 3, width: 22, height: 5 }), svg('line', { x1: 10, y1: 12, x2: 14, y2: 12 }));
      case 'chev-left':   return make(svg('polyline', { points: '15 18 9 12 15 6' }));
      case 'plus':        return make(svg('line', { x1: 12, y1: 5, x2: 12, y2: 19 }), svg('line', { x1: 5, y1: 12, x2: 19, y2: 12 }));
      case 'wifi':        return svg('svg', { ...a, viewBox: '0 0 16 16', width: 14, height: 14 }, svg('path', { d: 'M8 12.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 9.5a4 4 0 0 1 6 0M2.5 7a7.5 7.5 0 0 1 11 0' }));
      case 'battery':     return svg('svg', { fill: 'currentColor', width: 20, height: 10, viewBox: '0 0 25 12' }, svg('rect', { x: 0.5, y: 0.5, width: 22, height: 11, rx: 2.5, fill: 'none', stroke: 'currentColor' }), svg('rect', { x: 2, y: 2, width: 19, height: 8, rx: 1.2 }), svg('rect', { x: 23, y: 4, width: 1.5, height: 4, rx: 0.5 }));
      case 'signal':      return svg('svg', { fill: 'currentColor', width: 16, height: 10, viewBox: '0 0 16 10' }, svg('rect', { x: 0, y: 7, width: 2.5, height: 3, rx: 0.5 }), svg('rect', { x: 3.5, y: 5, width: 2.5, height: 5, rx: 0.5 }), svg('rect', { x: 7, y: 3, width: 2.5, height: 7, rx: 0.5 }), svg('rect', { x: 10.5, y: 0, width: 2.5, height: 10, rx: 0.5 }));
      default: return make();
    }
  }

  /* ---------------- NAV ---------------- */
  function Nav() {
    const header = el('header', { class: 'nav dark', id: 'site-nav' },
      el('a', { class: 'nav-brand', href: '#top', 'aria-label': 'ProspectLab21, inicio' },
        el('img', { src: 'assets/logo-mark.png', alt: '', 'aria-hidden': 'true', width: 26, height: 26, loading: 'eager', decoding: 'sync', fetchpriority: 'high' }),
        el('span', {}, 'PROSPECTLAB 21')
      ),
      el('nav', { class: 'nav-links', 'aria-label': 'Navegación principal' },
        el('a', { href: '#mails' }, 'El correo'),
        el('a', { href: '#proceso' }, 'Proceso'),
        el('a', { href: '#maquinaria' }, 'La maquinaria'),
        el('a', { href: '#precio' }, 'Precio'),
        el('a', { href: '#faq' }, 'Preguntas')
      ),
      el('a', { class: 'nav-cta', href: CAL_URL, target: '_blank', rel: 'noopener' }, 'Agenda 20 min', Icon('arrow-right', 14))
    );
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 32);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return header;
  }

  /* ---------------- HERO ---------------- */
  const ROTATOR_WORDS = ['agencias', 'consultoras', 'reclutadoras', 'constructoras', 'despachos', 'empresas'];

  function Rotator(onChange) {
    const measure = el('span', { class: 'rotator-measure', 'aria-hidden': 'true' });
    const track = el('span', { class: 'rotator-track' });
    const wrap = el('span', { class: 'rotator', 'aria-live': 'polite' }, measure, track);
    let i = 0;
    const render = () => {
      const word = ROTATOR_WORDS[i];
      // El medidor lleva la palabra en un atributo, no como texto: asi el H1 no
      // aparece con la palabra duplicada para buscadores y lectores de pantalla.
      measure.setAttribute('data-w', word);
      track.textContent = word;
      requestAnimationFrame(() => {
        wrap.style.width = measure.getBoundingClientRect().width + 'px';
      });
      onChange && onChange(word, i);
    };
    render();
    if (!prefersReduced) {
      setInterval(() => {
        // exit
        track.style.opacity = 0;
        track.style.transform = 'translateY(-14px) scale(0.985)';
        track.style.filter = 'blur(6px)';
        setTimeout(() => {
          i = (i + 1) % ROTATOR_WORDS.length;
          render();
          // enter
          track.style.opacity = 1;
          track.style.transform = 'translateY(0) scale(1)';
          track.style.filter = 'blur(0)';
        }, 380);
      }, 2200);
    }
    return wrap;
  }

  function IntroLine(text, base = 0, step = 80) {
    const words = text.split(' ');
    const frag = document.createDocumentFragment();
    words.forEach((w, idx) => {
      const wrap = el('span', { class: 'iw-wrap' });
      const inner = el('span', { class: 'iw', style: { transitionDelay: (base + idx * step) + 'ms' } }, w);
      wrap.appendChild(inner);
      frag.appendChild(wrap);
      if (idx < words.length - 1) frag.appendChild(el('span', { class: 'iw-space' }, ' '));
    });
    return frag;
  }

  function Spotlight() {
    return svg('svg', { class: 'spotlight', viewBox: '0 0 3787 2842', fill: 'none', preserveAspectRatio: 'none', 'aria-hidden': 'true' },
      svg('g', { filter: 'url(#spot-filter)' },
        svg('ellipse', { cx: 1924.71, cy: 273.501, rx: 1924.71, ry: 273.501, transform: 'matrix(-0.822377 -0.568943 -0.568943 0.822377 3631.88 2291.09)', fill: 'white', 'fill-opacity': 0.18 })
      ),
      svg('defs', {},
        svg('filter', { id: 'spot-filter', x: 0, y: 0, width: 3787, height: 2842, filterUnits: 'userSpaceOnUse', colorInterpolationFilters: 'sRGB' },
          svg('feFlood', { 'flood-opacity': 0, result: 'bg' }),
          svg('feBlend', { mode: 'normal', in: 'SourceGraphic', in2: 'bg', result: 'shape' }),
          svg('feGaussianBlur', { stdDeviation: 151 })
        )
      )
    );
  }

  function FallbackRobot() {
    const wrap = el('div', { class: 'hero-spline' });
    wrap.innerHTML = `
      <svg viewBox="0 0 400 600" style="width:100%;height:100%" aria-hidden="true">
        <defs>
          <radialGradient id="glow" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="rgba(92,133,255,0.35)"/>
            <stop offset="60%" stop-color="rgba(92,133,255,0.05)"/>
            <stop offset="100%" stop-color="rgba(0,0,0,0)"/>
          </radialGradient>
          <linearGradient id="figG" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fff" stop-opacity="0.9"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0.2"/>
          </linearGradient>
        </defs>
        <rect width="400" height="600" fill="url(#glow)"/>
        <circle cx="200" cy="170" r="58" fill="none" stroke="url(#figG)" stroke-width="1.2"/>
        <circle cx="200" cy="170" r="58" fill="rgba(255,255,255,0.04)"/>
        <ellipse cx="200" cy="170" rx="36" ry="14" fill="rgba(92,133,255,0.6)"/>
        <ellipse cx="190" cy="166" rx="6" ry="3" fill="#fff"/>
        <line x1="200" y1="228" x2="200" y2="252" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
        <path d="M150 260 L250 260 L260 360 L240 460 L160 460 L140 360 Z" fill="none" stroke="url(#figG)" stroke-width="1.2"/>
        <path d="M150 260 L250 260 L260 360 L240 460 L160 460 L140 360 Z" fill="rgba(255,255,255,0.03)"/>
        <circle cx="200" cy="340" r="14" fill="rgba(92,133,255,0.8)">
          <animate attributeName="r" values="12;16;12" dur="2.5s" repeatCount="indefinite"/>
        </circle>
        <path d="M150 270 Q110 320 120 400" fill="none" stroke="url(#figG)" stroke-width="1.2"/>
        <path d="M250 270 Q290 320 280 400" fill="none" stroke="url(#figG)" stroke-width="1.2"/>
        <line x1="180" y1="460" x2="170" y2="560" stroke="url(#figG)" stroke-width="1.4"/>
        <line x1="220" y1="460" x2="230" y2="560" stroke="url(#figG)" stroke-width="1.4"/>
        <ellipse cx="200" cy="568" rx="80" ry="6" fill="rgba(92,133,255,0.2)"/>
      </svg>`;
    return wrap;
  }

  function SplineRobot() {
    // Defer Spline. Only load if (1) hero in viewport, (2) connection isn't slow,
    // (3) user hasn't reduced motion. Otherwise show fallback.
    const conn = navigator.connection || {};
    const isSlow = conn.saveData || /(2g|slow-2g)/.test(conn.effectiveType || '');
    if (prefersReduced || isSlow) return FallbackRobot();

    const wrap = el('div', { class: 'hero-spline', style: { position: 'relative' } });
    const loader = el('div', { class: 'hero-spline-fallback', style: { position: 'absolute', inset: 0, pointerEvents: 'none' } },
      el('div', { class: 'hero-loader' })
    );
    wrap.appendChild(loader);

    const tryLoad = async () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.style.cssText = 'width:100%;height:100%;display:block;';
        wrap.appendChild(canvas);
        const mod = await import('https://esm.run/@splinetool/runtime@1.9.48');
        const app = new mod.Application(canvas);
        await app.load('https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode');
        loader.remove();
      } catch (e) {
        wrap.innerHTML = '';
        wrap.appendChild(FallbackRobot().firstChild);
      }
    };
    // Kick off on idle so it doesn't block FCP / TTI
    const start = () => { if (!wrap.dataset.tried) { wrap.dataset.tried = '1'; tryLoad(); } };
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1500 });
    else setTimeout(start, 400);
    return wrap;
  }

  function Hero() {
    const section = el('section', { class: 'hero', id: 'top' });
    section.appendChild(Spotlight());

    const eyebrow = el('div', { class: 'hero-eyebrow intro-fade', style: { transitionDelay: '60ms' } }, 'Agencia de cold email B2B · España y LATAM');
    const h1 = el('h1', { class: 'headline-intro' });
    h1.appendChild(IntroLine('Cuento todas las', 180, 80));
    h1.appendChild(el('br'));
    const rotatorWrap = el('span', { class: 'iw-wrap rotator-wrap', style: { transitionDelay: '520ms' } });
    rotatorWrap.appendChild(Rotator((word) => {
      if (word === 'empresas') {
        h1.classList.add('is-settling');
        setTimeout(() => h1.classList.remove('is-settling'), 900);
      }
    }));
    h1.appendChild(rotatorWrap);
    h1.appendChild(el('br'));
    h1.appendChild(IntroLine('de tu mercado', 700, 70));
    const dotWrap = el('span', { class: 'iw-wrap' });
    const dot = el('span', { class: 'iw', style: { transitionDelay: '1000ms' } }, '.');
    dotWrap.appendChild(dot);
    h1.appendChild(dotWrap);

    const sub = el('p', { class: 'hero-sub intro-fade', style: { transitionDelay: '1100ms' } },
      'Y después les escribo. Una por una, con un correo hecho a mano y un dato real de su negocio. Sin listas compradas, sin plantillas. Tú solo entras a las reuniones que se agenden.');
    const ctas = el('div', { class: 'hero-ctas intro-fade', style: { transitionDelay: '1280ms' } },
      el('a', { href: CAL_URL, target: '_blank', rel: 'noopener', class: 'btn btn-primary' }, 'Agenda 20 minutos', Icon('arrow-right', 16)),
      el('a', { href: XRAY_URL, target: '_blank', rel: 'noopener', class: 'btn btn-audit', title: 'Xray: informe de salud de tu prospección. Nota, problemas y plan a 90 días.' },
        el('span', { class: 'btn-audit-dot', 'aria-hidden': 'true' }),
        'Xray gratis de mi prospección',
        el('span', { class: 'btn-audit-free' }, 'gratis')
      )
    );

    const ctaNote = el('p', { class: 'hero-cta-note intro-fade', style: { transitionDelay: '1420ms' } },
      'En esa llamada te digo cuántas empresas hay de verdad en tu nicho, con nombres. Te lo llevas aunque no contrates.');

    const copy = el('div', { class: 'hero-copy' }, eyebrow, h1, sub, ctas, ctaNote);
    const grid = el('div', { class: 'hero-grid' }, copy, SplineRobot());
    section.appendChild(grid);

    section.appendChild(el('div', { class: 'hero-meta' },
      el('span', { class: 'live' }, 'EN OPERACIÓN · 2026'),
      el('span', {}, 'POR GAEL SOSA · FUNDADOR')
    ));
    // Minimalist scroll indicator: tiny mouse outline w/ dot
    section.appendChild(el('a', { class: 'hero-scroll', href: '#mails', 'aria-label': 'Desplazarse a la siguiente sección' },
      el('span', { class: 'hero-scroll-mouse', 'aria-hidden': 'true' },
        el('span', { class: 'hero-scroll-dot' })
      ),
      el('span', { class: 'hero-scroll-label' }, 'Scroll')
    ));

    // intro reveal: flip is-in after two RAFs so transitions fire
    requestAnimationFrame(() => requestAnimationFrame(() => {
      eyebrow.classList.add('is-in');
      sub.classList.add('is-in');
      ctas.classList.add('is-in');
      ctaNote.classList.add('is-in');
      rotatorWrap.classList.add('is-in');
      $$('.iw', h1).forEach(n => n.classList.add('is-in'));
    }));

    return section;
  }

  /* ---------------- MAILS SECTION ---------------- */
  const MAIL_STEPS = [
    { id: 'asunto',   num: '01 / ASUNTO',    title: 'Concreto y en minúsculas.',               body: 'Suena a mensaje interno, no a campaña. Es lo único que el decisor lee antes de decidir si te abre o te archiva.' },
    { id: 'apertura', num: '02 / APERTURA',  title: 'Sin "Hola". Solo el nombre.',             body: 'Casi todos los correos en frío arrancan igual, así que arrancar distinto ya te separa del montón antes de la primera coma.' },
    { id: 'gancho',   num: '03 / GANCHO',    title: 'Un dato suyo, no un halago.',             body: 'La ronda que cerraron y la ciudad que van a abrir. Ese dato no se puede pegar en otro correo, y esa es justo la señal que buscamos.' },
    { id: 'pain',     num: '04 / PAIN',      title: 'El momento humano.',                      body: 'Aquí el correo deja de sonar a empresa. Sonar a persona es lo que destaca entre los cincuenta mensajes corporativos del día.' },
    { id: 'cta',      num: '05 / CTA',       title: 'Dar antes de pedir.',                     body: 'No pide reunión. Ofrece algo que el decisor querría aunque nunca comprara. Cuesta mucho más decir que no a eso.' },
    { id: 'firma',    num: '06 / FIRMA',     title: 'Una sola palabra.',                       body: 'Solo el nombre. Es un mensaje entre dos personas, no entre dos empresas.' },
    { id: 'pd',       num: '07 / PD',        title: 'El cierre que casi nadie usa.',           body: 'Las dos vacantes de SDR que tienen abiertas cierran el círculo: gasto real hoy, ahorro real mañana. La posdata es la línea más leída del correo.' }
  ];
  const SPAM_INBOX = [
    { from: 'Newsletter Weekly',  subject: 'Edición #432: 17 cosas que…',           preview: 'Hola {first_name}, esta semana descubrirás…',           avatar: '#9aa3b2' },
    { from: 'OFERTAS HOY',        subject: '🔥 ÚLTIMAS HORAS — 70% DESCUENTO 🔥',  preview: 'No te pierdas esta oportunidad ÚNICA hola amig@…',     avatar: '#e26a4f' },
    { from: 'LinkedIn',           subject: 'Tienes 12 nuevas notificaciones',       preview: 'Carlos M. y 11 más vieron tu perfil esta semana',      avatar: '#0a66c2' },
    { from: 'sales@growthbros',   subject: 'Re: Re: Re: pricing??',                 preview: 'Solo quería hacer un follow-up del follow-up del…',     avatar: '#7a7a7a' },
    { from: 'AcmeCRM',            subject: 'Your weekly digest is here',            preview: 'Dear {first_name}, here are this week’s leads…',  avatar: '#5b8def' },
    { from: 'Ricardo (BoostCo)',  subject: 'Idea para escalar Trackr 🚀🚀🚀',       preview: 'Vi tu empresa y se me ocurrió que podríamos…',          avatar: '#b86adb' },
    { from: 'Notion',             subject: '5 plantillas que te van a ENCANTAR',    preview: 'Productividad max nivel — descarga gratis…',           avatar: '#000000' },
    { from: 'webinar@convert.io', subject: 'Última llamada: webinar mañana',        preview: 'Te apuntaste hace 6 meses y nunca viniste pero…',      avatar: '#ff6b6b' },
    { from: 'Stripe',             subject: 'Your invoice for May 2026',             preview: 'Thanks for your business. Amount due: €0.00',          avatar: '#635bff' },
    { from: 'Bro from Bali',      subject: 'quick question 👀',                     preview: 'Hey man, hope you’re crushing it! Quick favor…',   avatar: '#f4b942' }
  ];
  const OUR_MAIL = { from: 'Gael · ProspectLab21', subject: 'felicidades por la serie a', preview: 'Qué tal Marcos, vi que cerraron la Serie A y van a abrir CDMX este trimestre', avatar: '#0047FF' };
  const INBOX_ORDER = (() => {
    const list = SPAM_INBOX.map(r => ({ ...r, kind: 'spam' }));
    list.splice(2, 0, { ...OUR_MAIL, kind: 'ours' });
    return list;
  })();
  const TIMES = ['9:41','9:38','9:35','9:33','9:28','9:24','9:18','9:11','9:04','8:58','8:51'];

  function InboxRow(row, idx) {
    const node = el('div', { class: 'inbox-row', dataset: { kind: row.kind } },
      el('div', { class: 'ir-avatar', style: { background: row.avatar } }, row.from.charAt(0).toUpperCase()),
      el('div', { class: 'ir-body' },
        el('div', { class: 'ir-top' },
          el('span', { class: 'ir-from' }, row.from),
          el('span', { class: 'ir-time' }, TIMES[idx % TIMES.length])
        ),
        el('div', { class: 'ir-subject' }, row.subject),
        el('div', { class: 'ir-preview' }, row.preview)
      ),
      row.kind === 'ours' ? el('span', { class: 'ir-dot', 'aria-hidden': 'true' }) : null
    );
    return node;
  }

  function MailMockup() {
    const phone = el('div', { class: 'phone phase-idle' });
    const bezel = el('div', { class: 'phone-bezel-glow', 'aria-hidden': 'true' });
    const screen = el('div', { class: 'phone-screen' });

    const status = el('div', { class: 'phone-statusbar' },
      el('span', { class: 'sb-time' }, '9:41'),
      el('div', { class: 'sb-notch', 'aria-hidden': 'true' }),
      el('div', { class: 'icons' }, Icon('signal'), Icon('wifi'), Icon('battery'))
    );

    // Inbox layer
    const inboxLayer = el('div', { class: 'inbox-layer is-hidden' });
    inboxLayer.appendChild(el('div', { class: 'inbox-header' },
      el('div', { class: 'ih-row' },
        el('span', { class: 'ih-edit' }, 'Editar'),
        el('span', { class: 'ih-filter', 'aria-hidden': 'true' }, '⌄')
      ),
      el('h3', { class: 'ih-title' }, 'Bandeja'),
      el('div', { class: 'ih-search' },
        el('span', { class: 'ih-search-icon', 'aria-hidden': 'true' }, '⌕'),
        el('span', { class: 'ih-search-ph' }, 'Buscar')
      )
    ));
    const inboxList = el('div', { class: 'inbox-list' });
    INBOX_ORDER.forEach((r, i) => inboxList.appendChild(InboxRow(r, i)));
    inboxLayer.appendChild(inboxList);

    // Mail layer
    const mailLayer = el('div', { class: 'mail-layer is-hidden' });
    mailLayer.appendChild(el('div', { class: 'phone-mailheader' },
      el('span', { class: 'mh-back' }, Icon('chev-left', 16), ' Bandeja', el('span', { class: 'mh-badge' }, '12')),
      el('div', { class: 'mh-actions' }, Icon('archive'), Icon('reply'))
    ));
    const mailBody = el('div', { class: 'mail-body' });
    const mailInner = el('div', { class: 'mail-inner' });

    mailInner.appendChild(el('div', { class: 'mail-from' },
      el('div', { class: 'mail-avatar' }, 'G'),
      el('div', { class: 'mail-meta' },
        el('div', { class: 'mm-row' },
          el('span', { class: 'name' }, 'Gael Sosa'),
          el('span', { class: 'time' }, '9:38')
        ),
        el('div', { class: 'mm-row mm-row-sub' },
          el('span', { class: 'addr' }, 'Para: marcos@trackr.io ', el('span', { class: 'chev' }, '›')),
          el('span', { class: 'star', 'aria-hidden': 'true' }, '☆')
        )
      )
    ));

    const mkHL = (id, text) => el('span', { class: 'mail-hl', dataset: { hl: id } }, text);

    const subjectEl = el('div', { class: 'mail-subject', dataset: { anchor: 'asunto' } }, mkHL('asunto', 'felicidades por la serie a'));
    const txt = el('div', { class: 'mail-text' },
      el('p', { dataset: { anchor: 'apertura' } }, mkHL('apertura', 'Qué tal Marcos,')),
      el('p', { dataset: { anchor: 'gancho' } }, mkHL('gancho', 'Vi que cerraron la Serie A y van a abrir CDMX este trimestre'), ', se nota que en Trackr se tomaron en serio el siguiente capítulo.'),
      el('p', { dataset: { anchor: 'pain' } }, mkHL('pain', 'Justo después de una ronda, prospectar a mano se cae sola'), ', coordinar SDRs nuevos, vacantes abiertas y pipeline al mismo tiempo es demasiado.'),
      el('p', { dataset: { anchor: 'cta' } }, mkHL('cta', '¿Te aviento un video corto con cómo apoyamos a founders post-ronda a llenar su calendario con decisores reales?')),
      el('p', { dataset: { anchor: 'firma' } }, mkHL('firma', 'Un abrazo,')),
      el('p', { class: 'mail-pd', dataset: { anchor: 'pd' } }, mkHL('pd', 'PD: vi que andan buscando 2 SDRs en Monterrey. Justo el trabajo que les quitamos los primeros 90 días.'))
    );
    mailInner.appendChild(subjectEl);
    mailInner.appendChild(txt);

    mailBody.appendChild(mailInner);
    mailBody.appendChild(el('div', { class: 'mail-fade-top', 'aria-hidden': 'true' }));
    mailBody.appendChild(el('div', { class: 'mail-fade-bottom', 'aria-hidden': 'true' }));
    mailLayer.appendChild(mailBody);
    mailLayer.appendChild(el('div', { class: 'phone-mailtoolbar' }, Icon('archive', 18), Icon('reply', 18), el('span', { class: 'mt-reply' }, 'Responder')));

    screen.appendChild(status);
    screen.appendChild(inboxLayer);
    screen.appendChild(mailLayer);
    phone.appendChild(bezel);
    phone.appendChild(screen);

    // ===== API for parent =====
    const setActive = (id) => {
      $$('.mail-hl', mailInner).forEach(n => n.classList.toggle('active', n.dataset.hl === id));
      // scroll inner to anchor
      const target = mailInner.querySelector('[data-anchor="' + id + '"]');
      if (!target) return;
      const innerRect = mailInner.getBoundingClientRect();
      const tRect = target.getBoundingClientRect();
      const vpRect = mailBody.getBoundingClientRect();
      const targetTop = tRect.top - innerRect.top;
      const desired = vpRect.height * 0.36;
      let next = desired - targetTop;
      const maxScroll = mailInner.scrollHeight - vpRect.height + 24;
      if (next > 0) next = 0;
      if (next < -maxScroll) next = -maxScroll;
      mailInner.style.transform = 'translateY(' + next + 'px)';
    };

    const setPhase = (p) => {
      phone.className = 'phone phase-' + p;
      // arm rows on falling (fast stagger so the inbox-fill completes before highlight)
      if (p === 'falling') {
        const rows = $$('.inbox-row', inboxList);
        rows.forEach((r, i) => setTimeout(() => r.classList.add('is-armed'), i * 30));
      }
      // visibility
      const inboxVisible = p === 'falling' || p === 'highlight' || p === 'opening';
      const mailVisible  = p === 'opening' || p === 'open';
      inboxLayer.classList.toggle('is-hidden', !inboxVisible);
      mailLayer.classList.toggle('is-hidden', !mailVisible);
      inboxLayer.classList.toggle('is-zooming', p === 'opening' || p === 'open');
      mailLayer.classList.toggle('is-entering', p === 'opening' || p === 'open');
      // dim non-ours rows after falling
      $$('.inbox-row', inboxList).forEach(r => {
        const isOurs = r.dataset.kind === 'ours';
        r.classList.toggle('is-dim', p !== 'falling' && !isOurs && p !== 'idle');
        r.classList.toggle('is-hl', isOurs && (p === 'highlight' || p === 'opening'));
      });
    };

    return { node: phone, setActive, setPhase };
  }

  function MailsSection() {
    const mock = MailMockup();
    const stepsCol = el('div', { class: 'steps-list' });
    const stepEls = MAIL_STEPS.map((s) => {
      const node = el('article', { class: 'step', dataset: { stepid: s.id }, role: 'button', tabindex: 0 },
        el('div', { class: 'step-num' }, s.num),
        el('h4', {}, s.title),
        el('p', {}, s.body)
      );
      const activate = () => { mock.setActive(s.id); $$('.step', stepsCol).forEach(n => n.classList.toggle('active', n === node)); };
      node.addEventListener('click', activate);
      node.addEventListener('mouseenter', activate);
      node.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); } });
      stepsCol.appendChild(node);
      return node;
    });

    const section = el('section', { class: 'section mails-section', id: 'mails' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'Los mails'),
        el('h2', {}, 'Cada correo en frío es ', el('em', { style: { fontStyle: 'normal', color: 'var(--accent)' } }, 'una decisión'), ', no una plantilla.'),
        el('p', { class: 'lead' }, 'Un correo bueno y uno malo cuestan lo mismo mandarlos. La diferencia está en las siete decisiones que se toman antes de darle a enviar. Estas son, sobre un correo real.'),
        el('div', { class: 'mails-grid' },
          el('div', { class: 'phone-stage' }, mock.node),
          stepsCol
        )
      )
    );

    // Cinematic state — bullets only reveal AFTER mail opens.
    // While `lockActiveObs` is true, the active step is pinned to 'asunto'
    // so the user always sees bullet 01 first when the email opens,
    // regardless of where scroll position landed during the cinematic.
    let phase = 'idle';
    let lockActiveObs = false;
    const seen = new Set();
    const revealSeen = () => {
      stepEls.forEach(n => { if (seen.has(n.dataset.stepid)) n.classList.add('is-in'); });
    };
    const forceActive = (id) => {
      mock.setActive(id);
      stepEls.forEach(n => n.classList.toggle('active', n.dataset.stepid === id));
    };

    // Trigger cinematic the moment the section is even barely visible —
    // rootMargin -10% so it starts as section is just appearing.
    // Tuned phases so EACH stage is perceivable (esp. the highlight of our email):
    //   0-600ms       inbox falls into place
    //   600-1500ms    our email gets highlighted (900ms — long enough to be readable)
    //   1500-2100ms   zoom into the email
    //   2100ms+       email open, bullet 01 pinned for 800ms
    // Total ~2.9s — still scroll-friendly but the selection moment is actually visible.
    let started = false;
    const T_FALL = 600;
    const T_HL   = 1500;
    const T_OPEN = 2100;
    const T_LOCK = 800;
    const cinematicIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting || started) return;
        started = true;
        phase = 'falling';  mock.setPhase('falling');
        setTimeout(() => { phase = 'highlight'; mock.setPhase('highlight'); }, T_FALL);
        setTimeout(() => { phase = 'opening';   mock.setPhase('opening');   }, T_HL);
        setTimeout(() => {
          phase = 'open';
          mock.setPhase('open');
          lockActiveObs = true;
          forceActive('asunto');
          if (stepEls[0]) stepEls[0].classList.add('is-in');
          revealSeen();
          setTimeout(() => { lockActiveObs = false; }, T_LOCK);
        }, T_OPEN);
        cinematicIo.disconnect();
      });
    }, { threshold: 0, rootMargin: '0px 0px -10% 0px' });
    cinematicIo.observe(section);

    // Reveal observer — flips .is-in as soon as the bullet enters the viewport.
    // We deliberately do NOT wait for the cinematic to reach phase='open' because
    // that creates a dead-zone if the user scrolls fast during the 2.7s opening:
    // bullets fired their intersection event while phase was still 'falling/highlight/opening'
    // and never came back into view to fire again — leaving them stuck at opacity:0.
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.stepid;
        seen.add(id);
        e.target.classList.add('is-in');
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.1 });

    // Active observer — drives mail highlight from whatever step is in the band.
    // Locked during the first ~2.6s after open so 'asunto' stays pinned.
    const activeObs = new IntersectionObserver((entries) => {
      if (phase !== 'open' || lockActiveObs) return;
      const visible = entries.filter(e => e.isIntersecting);
      if (!visible.length) return;
      visible.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      const id = visible[0].target.dataset.stepid;
      if (id) forceActive(id);
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
    stepEls.forEach(n => { revealObs.observe(n); activeObs.observe(n); });

    return section;
  }

  /* ---------------- COMO LO HAGO ---------------- */
  function glyph(i) {
    const wrap = document.createElementNS(svgNS, 'svg');
    wrap.setAttribute('viewBox', '0 0 64 64');
    wrap.setAttribute('fill', 'none');
    wrap.setAttribute('stroke', 'currentColor');
    wrap.setAttribute('stroke-width', '1.25');
    wrap.setAttribute('stroke-linecap', 'round');
    wrap.setAttribute('stroke-linejoin', 'round');
    if (i === 0) wrap.innerHTML = `<circle cx="28" cy="28" r="14"/><line x1="38" y1="38" x2="50" y2="50"/><circle cx="28" cy="28" r="3.5" class="proceso-glyph-pulse" fill="currentColor" stroke="none"/><line x1="22" y1="28" x2="34" y2="28" opacity="0.45"/><line x1="28" y1="22" x2="28" y2="34" opacity="0.45"/>`;
    if (i === 1) wrap.innerHTML = `<rect x="10" y="13" width="44" height="11" rx="1.5"/><rect x="10" y="26.5" width="44" height="11" rx="1.5"/><rect x="10" y="40" width="44" height="11" rx="1.5"/><circle cx="15.5" cy="18.5" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.5" cy="32" r="1.4" fill="currentColor" stroke="none"/><circle cx="15.5" cy="45.5" r="1.4" fill="currentColor" stroke="none" class="proceso-glyph-pulse"/><line x1="22" y1="18.5" x2="44" y2="18.5" opacity="0.55"/><line x1="22" y1="32" x2="40" y2="32" opacity="0.55"/><line x1="22" y1="45.5" x2="46" y2="45.5" opacity="0.55"/>`;
    if (i === 2) wrap.innerHTML = `<line x1="10" y1="52" x2="54" y2="52" opacity="0.4"/><line x1="10" y1="14" x2="10" y2="52" opacity="0.4"/><polyline points="12,44 22,38 30,40 40,28 50,18"/><circle cx="12" cy="44" r="1.7" fill="currentColor" stroke="none"/><circle cx="22" cy="38" r="1.7" fill="currentColor" stroke="none"/><circle cx="30" cy="40" r="1.7" fill="currentColor" stroke="none"/><circle cx="40" cy="28" r="1.7" fill="currentColor" stroke="none"/><circle cx="50" cy="18" r="2.4" fill="currentColor" stroke="none" class="proceso-glyph-pulse"/>`;
    if (i === 3) wrap.innerHTML = `<g class="proceso-glyph-rotate" style="transform-origin:32px 32px"><path d="M32 12 a20 20 0 0 1 17.3 10"/><polyline points="44,8 49.3,22 35.5,21"/><path d="M32 52 a20 20 0 0 1 -17.3 -10" opacity="0.7"/><polyline points="20,56 14.7,42 28.5,43" opacity="0.7"/></g><circle cx="32" cy="32" r="6"/><circle cx="32" cy="32" r="2" fill="currentColor" stroke="none" class="proceso-glyph-pulse"/>`;
    return wrap;
  }

  function ComoLoHago() {
    const cards = [
      { num: '01', kicker: 'El censo',        title: 'Primero cuento tu mercado',     lines: ['Antes de escribir un correo, cuento cuántas empresas hay de verdad en tu nicho.', 'Por cargo, sector, tamaño y país. Con nombres que puedes reconocer.', 'Casi siempre salen bastantes menos de las que te dijeron.', 'Y si el número no da para tu meta, te lo digo ahí mismo.'] },
      { num: '02', kicker: 'La base',         title: 'Monto la infraestructura',      lines: ['Dominios y buzones dedicados. Tu dominio de siempre no se toca.', 'Veintiún días de calentamiento antes del primer envío real.', 'Aquí es donde se cae la mayoría de las campañas.', 'Si esto falla, ya da igual lo bueno que sea el correo.'] },
      { num: '03', kicker: 'La calle',        title: 'Escribo, lanzo y corrijo',      lines: ['Cada correo lleva un dato real de esa empresa concreta.', 'Salen, se miden y se corrigen contra respuestas de verdad.', 'El ángulo que contesta se queda y se escala.', 'El que no contesta se cambia, no se defiende.'] },
      { num: '04', kicker: 'El régimen',      title: 'Se vuelve un sistema',          lines: ['Deja de ser una campaña con fecha de caducidad.', 'Es un proceso que se repite mes tras mes.', 'Reuniones que entran sin que tengas que empujar.', 'Y un número al que por fin le puedes hacer presupuesto.'] }
    ];

    const grid = el('ol', { class: 'proceso-grid', role: 'list' });
    cards.forEach((c, i) => {
      const lines = el('ul', { class: 'proceso-lines', role: 'list' });
      c.lines.forEach((line, j) => lines.appendChild(el('li', { class: 'proceso-line', style: { '--lineDelay': (i * 90 + j * 70 + 220) + 'ms' } }, el('span', { class: 'proceso-line-bullet' }), el('span', {}, line))));
      const card = el('li', { class: 'proceso-card', dataset: { idx: i }, style: { '--delay': (i * 90) + 'ms' } },
        el('div', { class: 'proceso-card-head' },
          el('span', { class: 'proceso-pill' }, el('span', { class: 'proceso-pill-dot' }), 'Paso ' + (i + 1)),
          el('span', { class: 'proceso-kicker' }, c.kicker)
        ),
        el('div', { class: 'proceso-card-body' },
          el('div', { class: 'proceso-icon', 'aria-hidden': 'true' },
            el('span', { class: 'proceso-icon-ring' }),
            el('span', { class: 'proceso-icon-num' }, c.num),
            (() => { const ic = el('div', { class: 'proceso-icon-svg' }); ic.appendChild(glyph(i)); return ic; })()
          ),
          el('h3', { class: 'proceso-h3' }, c.title),
          lines
        ),
        el('div', { class: 'proceso-card-foot', 'aria-hidden': 'true' }, el('span', { class: 'proceso-progress' }, el('span', { class: 'proceso-progress-fill' })))
      );
      card.addEventListener('mouseenter', () => card.classList.add('is-hover'));
      card.addEventListener('mouseleave', () => card.classList.remove('is-hover'));
      grid.appendChild(card);
    });

    const section = el('section', { class: 'section proceso-section', id: 'proceso' },
      el('div', { class: 'proceso-bg', 'aria-hidden': 'true' },
        el('div', { class: 'proceso-grid-lines' }),
        el('div', { class: 'proceso-glow proceso-glow-a' }),
        el('div', { class: 'proceso-glow proceso-glow-b' })
      ),
      el('div', { class: 'section-inner proceso-inner' },
        el('div', { class: 'section-eyebrow proceso-eyebrow' }, '¿Cómo lo hago?'),
        el('h2', { class: 'proceso-title' }, 'Cuatro pasos, ', el('span', { class: 'proceso-title-accent' }, 'y el primero es contar.')),
        el('p', { class: 'lead proceso-lead' }, 'Del censo de tu mercado a reuniones que entran solas. Esto es lo que pasa entre el día que firmamos y la primera conversación de negocio en tu calendario.'),
        grid
      )
    );

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('is-in'); });
    }, { threshold: 0.3, rootMargin: '0px 0px -8% 0px' });
    $$('.proceso-card', grid).forEach(c => io.observe(c));

    return section;
  }

  /* ---------------- PORQUE NUNCA MUERE ---------------- */
  function NotifPhone() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    const notifs = [
      { app: 'Mail',     time: 'ahora',    title: 'Laura · Re: Atlas v3',     text: '¿Tienes 15 min el jueves a las 10?' },
      { app: 'Mail',     time: 'hace 4m',  title: 'Diego · Re: Outbound Q2',  text: 'Sí, agenda directo en mi calendario.' },
      { app: 'Calendar', time: 'hace 12m', title: 'Reunión confirmada',      text: 'Marta · Directora Comercial · jueves 11:00' }
    ];
    const list = el('div', { class: 'notif-list' });
    notifs.forEach(n => {
      list.appendChild(el('div', { class: 'notif-card' + (n.app === 'Calendar' ? ' is-win' : '') },
        el('div', { class: 'notif-icon' }, n.app === 'Mail' ? Icon('mail', 16, 1.8) : Icon('calendar', 16, 1.8)),
        el('div', { class: 'notif-content' },
          el('div', { class: 'notif-app' }, el('span', {}, n.app), el('span', {}, n.time)),
          el('div', { class: 'notif-title' }, n.title),
          el('div', { class: 'notif-text' }, n.text)
        )
      ));
    });
    const stage = el('div', { class: 'notif-stage' },
      el('div', { class: 'notif-phone' },
        el('div', { class: 'notif-screen' },
          el('div', { class: 'notif-time' }, h + ':' + m),
          el('div', { class: 'notif-date' }, dateStr),
          list
        )
      )
    );
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { stage.classList.add('is-armed'); io.disconnect(); } });
    }, { threshold: 0.35 });
    io.observe(stage);
    return stage;
  }

  function PorqueNuncaMuere() {
    const bullets = [
      { n: '01', h: 'Es el único canal que controlas tú',     p: 'No dependes del algoritmo de nadie ni de lo que hoy cueste el clic en LinkedIn. Mientras existan bandejas de entrada el canal sigue en pie, y el precio no te lo sube una subasta.' },
      { n: '02', h: 'Va directo al que firma',                p: 'En B2B serio las decisiones se cierran por correo. Una llamada en frío se cuelga en tres segundos. Un correo bien hecho se lee con el primer café y se contesta con calma.' },
      { n: '03', h: 'El ruido juega a tu favor',              p: 'La IA no mató el correo en frío, mató el correo en frío perezoso. Cuanto más se llena la bandeja de plantillas, más destaca el único mensaje que demuestra que alguien miró esa empresa de verdad.' }
    ];
    return el('section', { class: 'porque-section' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'El canal'),
        el('h2', {}, '¿Por qué la prospección en frío por correo ', el('em', { style: { fontStyle: 'normal', color: 'var(--pl-blue-300)' } }, 'nunca'), ' muere?'),
        el('p', { class: 'lead' }, 'Cada año alguien la declara muerta y cada año sigue abriendo más conversaciones de negocio que cualquier otro canal de salida. Tres razones, sin adorno.'),
        el('div', { class: 'porque-grid' },
          el('div', { class: 'porque-bullets' },
            ...bullets.map(b => el('div', { class: 'porque-bullet' },
              el('div', { class: 'num' }, b.n),
              el('div', {}, el('h4', {}, b.h), el('p', {}, b.p))
            ))
          ),
          NotifPhone()
        )
      )
    );
  }

  /* ---------------- XRAY — MICRO-SAAS LEAD MAGNET ----------------
     Free outreach health report at xray.prospectlab21.com. Acts as a low-friction
     entry point for cold visitors that aren't ready to book a call yet. */
  function XraySection() {
    // 4 cosas concretas que el reporte le devuelve al lead — sin jerga, "qué obtengo"
    const checks = [
      { k: 'Nota del 0 al 100', d: 'Qué tan listo está tu montaje para salir a prospectar hoy, en un solo número.' },
      { k: 'Lo que está roto',  d: 'Los problemas reales y lo que te cuesta cada uno, contados en cristiano.' },
      { k: 'Cómo te ven',       d: 'Qué credibilidad das cuando tu comprador aterriza en tu firma, tu web o tu LinkedIn.' },
      { k: 'Plan a 90 días',    d: 'Qué arreglar esta semana, qué este mes y qué este trimestre. Por orden de prioridad.' }
    ];

    // 3 pasos para que entiendan el flujo en 5 segundos
    const steps = [
      { n: '1', t: 'Pegas tu dominio',   d: 'Sin registro y sin tarjeta. Solo tuempresa.com.' },
      { n: '2', t: 'Escaneamos en vivo',  d: 'En treinta segundos revisamos tu infraestructura, tu entregabilidad y cómo te posicionas.' },
      { n: '3', t: 'Te damos el informe', d: 'Nota, problemas y plan de acción. En PDF, por si se lo quieres pasar a tu equipo.' }
    ];

    const score = el('div', { class: 'xray-score', 'aria-hidden': 'true' },
      svg('svg', { viewBox: '0 0 120 120', class: 'xray-ring' },
        svg('circle', { cx: 60, cy: 60, r: 52, class: 'xr-track' }),
        svg('circle', { cx: 60, cy: 60, r: 52, class: 'xr-fill' })
      ),
      el('div', { class: 'xray-score-num' },
        el('span', { class: 'xs-big' }, '78'),
        el('span', { class: 'xs-slash' }, '/100')
      ),
      el('div', { class: 'xray-score-label' }, 'Tu prospección · hoy')
    );

    const list = el('ul', { class: 'xray-checks', role: 'list' });
    checks.forEach((c, i) => {
      list.appendChild(el('li', { class: 'xray-check', style: { '--xd': (i * 80) + 'ms' } },
        el('span', { class: 'xc-tick', 'aria-hidden': 'true' }),
        el('div', { class: 'xc-body' },
          el('span', { class: 'xc-k' }, c.k),
          el('span', { class: 'xc-d' }, c.d)
        )
      ));
    });

    const section = el('section', { class: 'xray-section', id: 'xray' },
      el('div', { class: 'xray-bg', 'aria-hidden': 'true' }),
      el('div', { class: 'section-inner xray-inner' },
        el('div', { class: 'xray-grid' },
          el('div', { class: 'xray-copy' },
            el('div', { class: 'xray-eyebrow' },
              el('span', { class: 'xray-eyebrow-dot' }),
              'Reporte Xray · gratis · 30 segundos'
            ),
            el('h2', { class: 'xray-title' },
              'El ',
              el('span', { class: 'xray-title-accent' }, 'Xray'),
              ' es un informe gratis sobre la salud de tu prospección.'
            ),
            el('p', { class: 'xray-lead' },
              'Un escaneo de treinta segundos a tu montaje de prospección. Revisa si tus dominios aguantan volumen, si tus correos van a caer en bandeja o en spam, y qué credibilidad das cuando alguien te busca. Te devuelve una nota, la lista de lo que está roto y un plan a 90 días. Gratis y sin registro.'
            ),
            el('ol', { class: 'xray-steps', role: 'list' },
              ...steps.map(s => el('li', { class: 'xray-step' },
                el('span', { class: 'xs-num' }, s.n),
                el('div', {},
                  el('span', { class: 'xs-t' }, s.t),
                  el('span', { class: 'xs-d' }, s.d)
                )
              ))
            ),
            el('div', { class: 'xray-ctas' },
              el('a', { class: 'xray-btn xray-btn-primary', href: XRAY_URL, target: '_blank', rel: 'noopener' },
                'Quiero mi reporte Xray gratis',
                Icon('arrow-ur', 16)
              ),
              el('span', { class: 'xray-domain-hint' }, 'xray.prospectlab21.com · sin tarjeta · sin registro')
            )
          ),
          el('div', { class: 'xray-card' },
            el('div', { class: 'xray-card-stamp', 'aria-hidden': 'true' },
              el('span', { class: 'xcs-zero' }, '$0'),
              el('span', { class: 'xcs-label' }, 'siempre')
            ),
            el('div', { class: 'xray-card-head' },
              el('div', { class: 'xray-window-dots', 'aria-hidden': 'true' },
                el('span'), el('span'), el('span')
              ),
              el('span', { class: 'xray-card-url' }, 'xray.prospectlab21.com / tuempresa.com')
            ),
            el('div', { class: 'xray-card-body' },
              score,
              list
            ),
            el('div', { class: 'xray-card-foot' },
              el('span', { class: 'xray-pill' }, 'Xray completo'),
              el('span', { class: 'xray-pill xray-pill-cta' }, 'Sin costo →')
            )
          )
        )
      )
    );

    // Reveal once
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { section.classList.add('is-in'); io.disconnect(); } });
    }, { threshold: 0.25 });
    io.observe(section);

    return section;
  }

  /* ---------------- MAQUINARIA (WOW SECTION v2) ----------------
     Pipeline visualization: 6 abstract nodes connected by animated dots.
     Replaces the metric dashboard — competence without numerical claims. */
  function Maquinaria() {
    const nodes = [
      { num: '01', label: 'Censo',           desc: 'Contamos y localizamos todas las empresas que encajan con tu cliente ideal, filtro sobre filtro.', glyph: '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="22" height="22" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="13" x2="22" y2="13" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="11" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="11" y1="23" x2="18" y2="23" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><circle cx="28" cy="28" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="34" y1="34" x2="42" y2="42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { num: '02', label: 'Enriquecimiento', desc: 'Cada empresa se estudia por su web y su LinkedIn: qué hacen, qué venden y qué les cambió este mes.', glyph: '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="20" width="32" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="30" width="32" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="14" r="1.4" fill="currentColor"/><circle cx="13" cy="24" r="1.4" fill="currentColor"/><circle cx="13" cy="34" r="1.4" fill="currentColor"/><line x1="18" y1="14" x2="36" y2="14" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="18" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="18" y1="34" x2="34" y2="34" stroke="currentColor" stroke-width="1.2" opacity="0.5"/></svg>' },
      { num: '03', label: 'Criba',           desc: 'Fuera las que no encajan, antes de gastar un solo correo en ellas. El filtro es numérico, no de intuición.', glyph: '<svg viewBox="0 0 48 48"><path d="M8 10 L40 10 L29 25 L29 38 L19 33 L19 25 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="13" y1="15" x2="35" y2="15" stroke="currentColor" stroke-width="1.2" opacity="0.45"/></svg>' },
      { num: '04', label: 'Redacción',       desc: 'Se escribe la secuencia con el ángulo de ese nicho y un dato propio de cada empresa.', glyph: '<svg viewBox="0 0 48 48"><line x1="10" y1="36" x2="36" y2="36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="30" x2="28" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><path d="M30 8 L40 18 L20 38 L10 38 L10 28 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="28" y1="13" x2="35" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { num: '05', label: 'Envío',           desc: 'Buzones dedicados, 21 días de calentamiento y entregabilidad revisada todos los días.', glyph: '<svg viewBox="0 0 48 48"><path d="M6 24 L42 8 L34 40 L24 28 L6 24 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="24" y1="28" x2="42" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { num: '06', label: 'Calendario',      desc: 'Reuniones con gente que decide la compra. En tu agenda, no en una hoja de cálculo.',    glyph: '<svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="8" x2="16" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="32" y1="8" x2="32" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="18,29 22,33 30,25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
    ];

    const flow = el('div', { class: 'maq-flow' });
    nodes.forEach((n, i) => {
      const nodeEl = el('div', { class: 'maq-node', dataset: { step: n.num, idx: i }, style: { '--maq-delay': (i * 120) + 'ms', '--maq-pulse-delay': (i * 0.83) + 's' } },
        el('div', { class: 'maq-node-card' },
          el('span', { class: 'maq-node-num' }, n.num),
          (() => { const ic = el('div', { class: 'maq-node-icon' }); ic.innerHTML = n.glyph; return ic; })(),
          el('h3', { class: 'maq-node-label' }, n.label),
          el('p',  { class: 'maq-node-desc'  }, n.desc)
        )
      );
      flow.appendChild(nodeEl);
      if (i < nodes.length - 1) {
        flow.appendChild(el('div', { class: 'maq-connector', 'aria-hidden': 'true' },
          el('span', { class: 'maq-dot' }),
          el('span', { class: 'maq-dot' }),
          el('span', { class: 'maq-dot' })
        ));
      }
    });

    const section = el('section', { class: 'maq-section', id: 'maquinaria' },
      el('div', { class: 'maq-bg', 'aria-hidden': 'true' }),
      el('div', { class: 'section-inner maq-inner' },
        el('div', { class: 'maq-topbar' },
          el('div', { class: 'maq-topbar-left' },
            el('span', { class: 'maq-pulse-dot' }),
            el('span', { class: 'maq-topbar-id' }, 'PL21 · PIPELINE'),
            el('span', { class: 'maq-topbar-sep' }, '·'),
            el('span', { class: 'maq-topbar-status' }, 'EN OPERACIÓN')
          ),
          el('div', { class: 'maq-topbar-right' },
            el('span', {}, 'INPUT → OUTPUT'),
            el('span', { class: 'maq-topbar-sep' }, '·'),
            el('span', {}, 'AUTÓNOMO')
          )
        ),
        el('div', { class: 'section-eyebrow maq-eyebrow' }, 'La maquinaria'),
        el('h2', { class: 'maq-title' },
          'El sistema, ',
          el('span', { class: 'maq-title-accent' }, 'paso a paso.'),
          ' Sin magia.'
        ),
        el('p', { class: 'lead maq-lead' }, 'Seis piezas encadenadas, cada una hace una sola cosa. Cuando una falla se ve exactamente dónde, que es la razón de partirlo así en vez de tener una caja negra.'),
        flow,
        el('div', { class: 'maq-footer' },
          el('span', {}, 'Todo esto lo opero yo. Tu equipo no toca ninguna pieza, tú solo abres el calendario.')
        )
      )
    );

    // Reveal on scroll: nodes fade in with the per-node CSS delay
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          flow.classList.add('is-in');
          io.disconnect();
        }
      });
    }, { threshold: 0.2 });
    io.observe(section);

    return section;
  }

  /* ---------------- SIMULADOR DE ENTREGABILIDAD ----------------
     Interactive proof of the "Sender" node: play with volume / warm-up /
     dedicated-domain and watch 100 emails land in inbox vs spam in real time.
     Directly answers the #1 objection: "¿me van a quemar el dominio?". */
  function Simulador() {
    const TOTAL = 100;
    let volume = 25, warmup = 21, dedicated = true;

    const matrix = el('div', { class: 'sim-matrix', 'aria-hidden': 'true' });
    const dots = [];
    for (let i = 0; i < TOTAL; i++) { const d = el('span', { class: 'sim-dot' }); dots.push(d); matrix.appendChild(d); }

    const pctNum = el('span', { class: 'sim-pct-num' }, '95');
    const verdict = el('div', { class: 'sim-verdict good' }, 'En bandeja. Tu dominio intacto.');
    const inboxCount = el('span', { class: 'sim-leg-num' }, '95');
    const spamCount = el('span', { class: 'sim-leg-num' }, '5');
    const warnNote = el('div', { class: 'sim-warn', style: { display: 'none' } });

    const compute = () => {
      let rate = 0.55 + 0.40 * Math.min(1, warmup / 21);
      rate -= Math.max(0, (volume - 30)) / 100;
      if (!dedicated) rate -= 0.35;
      return Math.max(0.04, Math.min(0.985, rate));
    };

    const screen = el('div', { class: 'sim-screen', dataset: { tone: 'good' } });

    const render = () => {
      const rate = compute();
      const inbox = Math.round(rate * TOTAL);
      dots.forEach((d, i) => {
        const isInbox = i < inbox;
        d.classList.toggle('is-inbox', isInbox);
        d.classList.toggle('is-spam', !isInbox);
        d.style.setProperty('--dd', (i * 5) + 'ms');
      });
      pctNum.textContent = Math.round(rate * 100);
      inboxCount.textContent = inbox;
      spamCount.textContent = TOTAL - inbox;
      let v, cls;
      if (rate >= 0.9) { v = 'En bandeja. Tu dominio intacto.'; cls = 'good'; }
      else if (rate >= 0.7) { v = 'Pasable, pero estás dejando reuniones en la carpeta de spam.'; cls = 'warn'; }
      else { v = 'Te estás quemando. Esto es justo lo que NO hacemos.'; cls = 'bad'; }
      verdict.textContent = v;
      verdict.className = 'sim-verdict ' + cls;
      screen.dataset.tone = cls;
      warnNote.textContent = dedicated ? '' : 'Estás usando tu dominio principal. Un mal envío aquí y quemas tu correo corporativo de por vida.';
      warnNote.style.display = dedicated ? 'none' : 'flex';
    };

    const slider = (labelText, min, max, val, unit, onInput) => {
      const valEl = el('span', { class: 'sim-ctrl-val' }, val + unit);
      const range = el('input', { type: 'range', min, max, value: val, class: 'sim-range', 'aria-label': labelText });
      range.addEventListener('input', () => { const n = +range.value; valEl.textContent = n + unit; onInput(n); render(); });
      return { wrap: el('div', { class: 'sim-ctrl' },
        el('div', { class: 'sim-ctrl-top' }, el('span', { class: 'sim-ctrl-label' }, labelText), valEl),
        range
      ), range };
    };

    const volCtrl = slider('Volumen diario por buzón', 5, 80, volume, '/día', (n) => { volume = n; });
    const warmCtrl = slider('Warm-up del dominio', 0, 28, warmup, ' días', (n) => { warmup = n; });

    const dedToggle = el('button', { class: 'sim-toggle is-on', type: 'button', 'aria-pressed': 'true' },
      el('span', { class: 'sim-toggle-track' }, el('span', { class: 'sim-toggle-knob' })),
      el('span', { class: 'sim-toggle-label' }, 'Dominio dedicado (no el principal)')
    );
    dedToggle.addEventListener('click', () => {
      dedicated = !dedicated;
      dedToggle.classList.toggle('is-on', dedicated);
      dedToggle.setAttribute('aria-pressed', String(dedicated));
      render();
    });

    const presetBtn = el('button', { class: 'sim-preset', type: 'button' },
      Icon('arrow-right', 14), 'Aplicar el ajuste de ProspectLab21'
    );
    presetBtn.addEventListener('click', () => {
      volume = 25; warmup = 21; dedicated = true;
      volCtrl.range.value = 25; volCtrl.range.dispatchEvent(new Event('input'));
      warmCtrl.range.value = 21; warmCtrl.range.dispatchEvent(new Event('input'));
      dedToggle.classList.add('is-on'); dedToggle.setAttribute('aria-pressed', 'true');
      render();
      screen.classList.remove('sim-flash'); void screen.offsetWidth; screen.classList.add('sim-flash');
    });

    const controls = el('div', { class: 'sim-controls' },
      volCtrl.wrap,
      warmCtrl.wrap,
      el('div', { class: 'sim-ctrl' },
        el('div', { class: 'sim-ctrl-top' }, el('span', { class: 'sim-ctrl-label' }, 'Infraestructura')),
        dedToggle
      ),
      warnNote,
      presetBtn
    );

    screen.appendChild(el('div', { class: 'sim-screen-head' },
      el('span', { class: 'sim-leg sim-leg-inbox' }, el('span', { class: 'sim-leg-dot' }), 'Bandeja ', inboxCount),
      el('span', { class: 'sim-leg sim-leg-spam' }, el('span', { class: 'sim-leg-dot' }), 'Spam ', spamCount)
    ));
    screen.appendChild(matrix);
    screen.appendChild(el('div', { class: 'sim-screen-foot' },
      el('div', { class: 'sim-pct' }, pctNum, el('span', { class: 'sim-pct-unit' }, '% llega a bandeja')),
      verdict
    ));

    const section = el('section', { class: 'sim-section', id: 'simulador' },
      el('div', { class: 'sim-bg', 'aria-hidden': 'true' }),
      el('div', { class: 'section-inner sim-inner' },
        el('div', { class: 'section-eyebrow sim-eyebrow' }, 'La prueba'),
        el('h2', { class: 'sim-title' }, '¿Te van a ', el('span', { class: 'sim-title-accent' }, 'quemar el dominio?')),
        el('p', { class: 'lead sim-lead' }, 'Mueve los controles y mira en vivo dónde acaban tus cien correos. Es la forma más rápida de entender por qué mandar mucho, rápido y desde tu dominio de siempre acaba mal.'),
        el('div', { class: 'sim-grid' }, controls, screen)
      )
    );

    render();

    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { section.classList.add('is-in'); io.disconnect(); } });
    }, { threshold: 0.2 });
    io.observe(section);

    return section;
  }

  /* ---------------- SOBRE MI ---------------- */
  function SobreMi() {
    return el('section', { class: 'sobre-section', id: 'sobre' },
      el('div', { class: 'sobre-eyebrow-top' },
        el('span', { class: 'sobre-eyebrow-rule', 'aria-hidden': 'true' }),
        'Sobre mí'
      ),
      el('div', { class: 'sobre-grid' },
        el('div', { class: 'sobre-portrait-col' },
          el('div', { class: 'sobre-portrait-wrap' },
            (() => {
              const pic = document.createElement('picture');
              pic.innerHTML = '<source srcset="assets/gael-portrait.webp" type="image/webp">';
              const img = el('img', { class: 'sobre-portrait', src: 'assets/gael-portrait.jpg', alt: 'Retrato de Gael Sosa, fundador de ProspectLab21', width: 1000, height: 1500, loading: 'lazy', decoding: 'async' });
              pic.appendChild(img);
              return pic;
            })(),
            el('div', { class: 'sobre-portrait-tag' },
              el('div', { class: 'signature' }, 'Gael'),
              'FUNDADOR / CEO · 13'
            )
          )
        ),
        el('div', { class: 'sobre-content' },
          el('h3', { class: 'sobre-greeting' }, 'Hey, soy ', el('span', { class: 'sobre-name' }, 'Gael'), '.'),
          el('div', { class: 'sobre-bio' },
            el('p', { class: 'sobre-lead' }, 'Llevo ProspectLab21 desde Zapopan, Jalisco, con clientes reales en España y en LATAM. Escribo yo los correos, monto yo la infraestructura y llevo yo las campañas. Cuando te contesto un correo, soy yo, ', el('em', {}, 'no'), ' un becario con una plantilla.'),
            el('blockquote', { class: 'sobre-credo' },
              el('p', {}, 'No creo en la suerte.'),
              el('p', {}, 'Creo en sistemas bien construidos y en aparecer todos los días.')
            ),
            el('p', { class: 'sobre-discipline' }, 'Si tu mercado no da, prefiero decírtelo en la primera llamada y perder la venta.')
          ),
          el('p', { class: 'sobre-punch' }, 'No prometo magia.'),
          el('div', { class: 'sobre-principles', 'aria-label': 'Cómo trabajo' },
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Cuento tu mercado antes de cobrarte'),
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Escribo yo cada correo'),
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Te digo que no si no encajas'),
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Sin permanencia')
          )
        )
      ),
      el('figure', { class: 'sobre-scripture' },
        el('div', { class: 'ss-bar', 'aria-hidden': 'true' }),
        el('div', { class: 'ss-body' },
          el('blockquote', { class: 'ss-quote' },
            el('span', { class: 'ss-open', 'aria-hidden': 'true' }, '“'),
            'Ninguno tenga en poco tu juventud, sino sé ejemplo de los creyentes en ',
            el('em', {}, 'palabra'), ', ', el('em', {}, 'conducta'), ', ', el('em', {}, 'amor'), ', ', el('em', {}, 'espíritu'), ', ', el('em', {}, 'fe'), ' y ', el('em', {}, 'pureza'), '.',
            el('span', { class: 'ss-close', 'aria-hidden': 'true' }, '”')
          ),
          el('figcaption', { class: 'ss-cite' },
            el('span', { class: 'ss-cite-rule', 'aria-hidden': 'true' }),
            '1 Timoteo 4:12'
          )
        )
      )
    );
  }

  /* ---------------- FAQ ---------------- */
  /* DUEÑO ÚNICO del texto del FAQ.
     Se renderiza aquí y de aquí se genera el JSON-LD de FAQPage (injectFaqSchema).
     No dupliques estas respuestas en index.html ni en el <script type="application/ld+json">. */
  const FAQ_ITEMS = [
    {
      q: '¿Qué hacen exactamente?',
      short: 'Opero tu correo en frío de punta a punta. Tú no tocas nada.',
      a: [
        'Lo primero es contar tu mercado. Cuántas empresas hay de verdad en tu nicho por cargo, sector, tamaño y país, con nombres que puedes reconocer. Ese número casi siempre sale más chico que el que te enseñó otra agencia, y prefiero decírtelo antes de cobrarte que después.',
        'Después construyo la lista con filtros reales en vez de comprar bases sucias, y escribo las secuencias para ese nicho. Monto los dominios y los buzones de envío, lanzo, pruebo asuntos y ángulos, y clasifico cada respuesta que entra. Lo único que aterriza en tu bandeja son conversaciones con gente que decide la compra.'
      ]
    },
    {
      q: '¿Me van a quemar el dominio?',
      short: 'No. Tu dominio principal no se usa nunca.',
      a: [
        'Monto dominios y buzones dedicados solo para las campañas, separados de tu correo corporativo. Cada cuenta lleva 21 días de calentamiento progresivo antes de escribirle a una empresa real, y el volumen sube despacio conforme madura la reputación de envío.',
        'Mantengo el rebote por debajo del 2% y reviso la entregabilidad todos los días. Si una cuenta empieza a flaquear la saco antes de que arrastre a las demás. Tu dominio de siempre queda intacto, y ese es justo el punto de montar la infraestructura aparte.'
      ]
    },
    {
      q: '¿En cuánto tiempo empiezan a caer reuniones?',
      short: 'Las primeras respuestas entre la semana 2 y la 3. Reuniones constantes, del mes 2 en adelante.',
      a: [
        'El mes 1 es montaje y la primera oleada a volumen bajo, mientras los dominios terminan de calentarse. El mes 2 y el 3 son donde el sistema entra en régimen, con las campañas ya afinadas contra respuestas reales y no contra suposiciones.',
        'No te voy a prometer veinte reuniones la primera semana. Quien te promete eso, miente. Lo que sí te prometo es un sistema que, una vez calibrado, abre conversaciones de negocio mes tras mes.'
      ]
    },
    {
      q: '¿Qué necesitan de mí?',
      short: 'Una llamada de 20 minutos y permiso para crear los dominios de envío. Nada más.',
      a: [
        'Necesito que me cuentes a fondo tu cliente ideal y tu oferta. Qué vendes, a quién y por qué te eligen a ti. Validamos juntos el mensaje y el ángulo antes de lanzar nada, así que tienes la última palabra sobre cómo suena tu marca.',
        'No te pido listas de contactos, ni plantillas, ni que escribas los correos. De eso me encargo yo. A partir del lanzamiento tu única tarea es presentarte a las reuniones que se agenden.'
      ]
    },
    {
      q: '¿Les funciona cualquier sector?',
      short: 'No, y prefiero decírtelo antes de cobrarte.',
      a: [
        'El filtro es concreto. Le vendes a otras empresas, tu comprador vive en el correo, la decisión la toma una sola persona y un cliente tuyo vale al menos 10,000 dólares a lo largo de la relación. Agencias, software, reclutamiento, consultoras y servicios profesionales suelen entrar sin problema.',
        'Si tu producto es de ticket bajo, masivo o de consumo, el correo en frío no es tu mejor canal y te lo digo en la llamada en vez de venderte algo que no te va a funcionar. Y si conozco a alguien que sí trabaje tu caso, te paso el contacto.'
      ]
    },
    {
      q: '¿Cuánto cuesta?',
      short: '450 € al mes más 350 € de arranque en España. En México y LATAM, lo mismo en dólares.',
      a: [
        'El arranque es un pago único que cubre la infraestructura completa: dominios, buzones y los 21 días de calentamiento. El número final depende de cuántos buzones necesites, de cuántos países quieras atacar y de tu ciclo de venta, así que te lo cierro concreto en la llamada.',
        'No bajo el precio para cerrar y tampoco te amarro con contratos largos. Si a los 60 días no hay tracción real, nos salimos sin drama. La forma sana de verlo es esta: con que cierres un cliente, el servicio normalmente ya se pagó solo.'
      ]
    },
    {
      q: '¿Y si ya tengo un SDR interno?',
      short: 'Mejor, porque se suman. Yo le lleno el calendario y él cierra.',
      a: [
        'Un SDR caro se quema en la parte mecánica: armar listas, buscar correos, mandar secuencias y perseguir seguimientos. Eso es justo lo que el sistema hace en automático y a escala, sin cansarse ni pedir vacaciones.',
        'No reemplazo a tu equipo comercial, lo alimento para que pase el día hablando con prospectos en vez de peleándose con una hoja de cálculo. Y si todavía no tienes SDR, tienes el flujo de reuniones sin necesidad de contratar uno todavía.'
      ]
    },
    {
      q: '¿Mandan reportes?',
      short: 'Sí. Un panel con envíos, respuestas y reuniones, y una llamada de ajuste cada quince días.',
      a: [
        'Cada respuesta te llega ya clasificada como interesado, tibio, no interesado, fuera de oficina o rebote, para que sepas a quién contestar primero sin tener que leerlas todas.',
        'Hay una métrica que no vas a ver en el panel, y es a propósito: la tasa de apertura. Medir aperturas obliga a meter un píxel de rastreo en cada correo, y ese píxel es de las cosas que más te empujan a spam. Prefiero perder el número y ganar la bandeja de entrada. Lo que se mide aquí son respuestas y reuniones, que es lo que paga.'
      ]
    },
    {
      q: '¿Trabajan en España o en LATAM?',
      short: 'En los dos. España en castellano peninsular, LATAM adaptado.',
      a: [
        'Opero campañas en España, México, Chile, Colombia y el resto de LATAM hispanohablante. El registro del copy lo manda el mercado al que escribes, no el país donde está tu empresa. Si eres una empresa mexicana que vende en Madrid, tus correos salen en castellano peninsular.',
        'Es un detalle que casi nadie cuida y que se nota en el primer renglón. Un vosotros mal puesto en Monterrey, o un ustedes en Barcelona, y el que lee ya sabe que es un envío masivo.'
      ]
    },
    {
      q: '¿En qué se diferencian de otra agencia de cold email?',
      short: 'En que te cuento tu mercado antes de cobrarte.',
      a: [
        'Casi todas las agencias te venden un volumen de envíos. Tres mil correos al mes, cinco mil al mes. Ninguna te dice cuántas empresas hay de verdad en tu nicho, porque si el número sale chico se les cae la venta.',
        'Yo lo cuento primero y te enseño los nombres. Si tu mercado son 200 empresas y no 4,000, lo vas a saber en la llamada y gratis. A partir de ahí la conversación es honesta: sabes cuándo se te agota el mercado, y sabes por qué el que llega primero se lo queda.'
      ]
    }
  ];

  function FAQ() {
    const list = el('div', { class: 'faq-list', role: 'list' });
    FAQ_ITEMS.forEach((item, i) => {
      const id = 'faq-' + i;
      const ans = el('div', { class: 'faq-answer', id: id + '-a', role: 'region' },
        el('div', { class: 'faq-answer-inner' },
          el('p', { class: 'faq-a-short' }, item.short),
          ...item.a.map(t => el('p', { class: 'faq-a-p' }, t))
        )
      );
      const btn = el('button', { type: 'button', class: 'faq-question', 'aria-expanded': 'false', 'aria-controls': id + '-a' },
        el('span', { class: 'faq-q-text' }, item.q),
        el('span', { class: 'faq-q-icon', 'aria-hidden': 'true' })
      );
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        row.classList.toggle('is-open', !open);
        ans.style.maxHeight = open ? '0px' : ans.scrollHeight + 'px';
      });
      const row = el('div', { class: 'faq-row', role: 'listitem', id }, btn, ans);
      list.appendChild(row);
    });
    return el('section', { class: 'faq-section', id: 'faq' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'Lo que siempre me preguntan'),
        el('h2', {}, 'Lo que vas a querer saber ', el('em', { style: { fontStyle: 'normal', color: 'var(--accent)' } }, 'antes'), ' de la llamada.'),
        el('p', { class: 'lead' }, 'Las diez preguntas que me hacen cada semana, contestadas como te las contestaría por teléfono. Sin rodeos y sin letra chica.'),
        list
      )
    );
  }

  /* ---------------- PRECIO ----------------
     El precio vive AQUÍ y en el FAQ. Si cambia, se cambia en los dos sitios.
     Fuente de verdad del negocio: memoria fb_pricing_below_market. */
  const PRECIO_INCLUYE = [
    'El censo de tu mercado, con el número real de empresas y sus nombres.',
    'Dominios y buzones dedicados, con sus 21 días de calentamiento.',
    'La lista construida a mano y verificada, correo por correo.',
    'Las secuencias escritas para tu nicho, con pruebas de asunto y de ángulo.',
    'La operación diaria de las campañas y la entregabilidad vigilada.',
    'Cada respuesta clasificada y un panel con envíos, respuestas y reuniones.',
    'Una llamada de ajuste cada quince días.'
  ];

  function Precio() {
    const card = (mercado, cifra, setup, nota) => el('article', { class: 'precio-card' },
      el('div', { class: 'precio-mercado' }, mercado),
      el('div', { class: 'precio-cifra' },
        el('span', { class: 'pc-num' }, cifra),
        el('span', { class: 'pc-per' }, 'al mes')
      ),
      el('div', { class: 'precio-setup' }, setup),
      el('div', { class: 'precio-nota-card' }, nota)
    );

    const incluye = el('ul', { class: 'precio-incluye', role: 'list' });
    PRECIO_INCLUYE.forEach(t => incluye.appendChild(
      el('li', {}, el('span', { class: 'pi-tick', 'aria-hidden': 'true' }), el('span', {}, t))
    ));

    const section = el('section', { class: 'precio-section', id: 'precio' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'Precio'),
        el('h2', {}, 'El precio, ', el('em', { style: { fontStyle: 'normal', color: 'var(--accent)' } }, 'antes'), ' de que me lo preguntes.'),
        el('p', { class: 'lead' }, 'Un solo precio para todos. Ni tarifa secreta, ni descuento por insistir, ni doce llamadas para llegar al número. Cobro en la moneda de tu mercado porque mis costes están en dólares y no quiero pasarte a ti el riesgo del cambio.'),
        el('div', { class: 'precio-grid' },
          card('España', '450 €', 'más 350 € de arranque, pago único', 'Copy en castellano peninsular.'),
          card('México y LATAM', '450 USD', 'más 350 USD de arranque, pago único', 'Copy adaptado a cada país.')
        ),
        el('h3', { class: 'precio-sub' }, 'Qué entra por ese dinero'),
        incluye,
        el('p', { class: 'precio-honesto' }, 'No bajo el precio para cerrar, y tampoco te amarro. Si a los 60 días no hay tracción real nos salimos sin drama. Con que cierres un cliente, el servicio normalmente ya se pagó solo.'),
        el('div', { class: 'precio-cta' },
          el('a', { class: 'btn btn-primary', href: CAL_URL, target: '_blank', rel: 'noopener' }, 'Agenda 20 minutos', Icon('arrow-right', 16)),
          el('span', { class: 'precio-cta-note' }, 'Sales de la llamada sabiendo el tamaño real de tu mercado, contrates o no.')
        )
      )
    );
    return section;
  }

  /* ---------------- JSON-LD DEL FAQ ----------------
     Se genera desde FAQ_ITEMS para que el texto viva en un solo sitio.
     Google ejecuta JS y lee datos estructurados inyectados así. */
  function injectFaqSchema() {
    try {
      const data = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        '@id': 'https://prospectlab21.com/#faq',
        mainEntity: FAQ_ITEMS.map(it => ({
          '@type': 'Question',
          name: it.q,
          acceptedAnswer: { '@type': 'Answer', text: [it.short].concat(it.a).join(' ') }
        }))
      };
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(data);
      document.head.appendChild(s);
    } catch (_) {}
  }

  /* ---------------- CTA ---------------- */
  function CTA() {
    return el('section', { class: 'cta-section', id: 'cta' },
      el('div', { class: 'cta-bg' }),
      el('div', { class: 'cta-inner' },
        el('div', { class: 'cta-eyebrow' }, 'Empezamos aquí'),
        el('h2', {}, 'Vamos a contar', el('br'), 'tu mercado.'),
        el('p', { class: 'cta-sub' }, 'Veinte minutos. Salgo de esa llamada habiéndote dicho cuántas empresas hay de verdad en tu nicho, y si el correo en frío es tu canal o no lo es. Si no lo es, te lo digo y te paso a alguien que sí trabaje tu caso.'),
        el('div', { class: 'cta-btn-row' },
          el('a', { class: 'cta-btn', href: CAL_URL, target: '_blank', rel: 'noopener' }, 'Agenda 20 minutos', el('span', { class: 'arrow' }, Icon('arrow-ur', 20))),
          el('a', { class: 'cta-btn cta-btn-audit', href: XRAY_URL, target: '_blank', rel: 'noopener' },
            el('span', { class: 'cta-btn-audit-dot', 'aria-hidden': 'true' }),
            'Xray gratis de mi prospección',
            el('span', { class: 'cta-btn-audit-free' }, 'gratis')
          )
        ),
        el('div', { class: 'cta-meta' },
          el('span', {}, '· 20 MIN'),
          el('span', {}, '· SIN COMPROMISO'),
          el('span', {}, '· TE CONTESTO EN 24 H')
        ),
        el('p', { class: 'cta-alt' },
          '¿Prefieres correo? Escríbeme directo a ',
          el('a', { href: 'mailto:gael@prospectlab21.com?subject=Quiero%20hablar%20con%20ProspectLab21', class: 'cta-alt-mail' }, 'gael@prospectlab21.com')
        )
      )
    );
  }

  /* ---------------- FOOTER ---------------- */
  function Footer() {
    return el('footer', { class: 'footer' },
      el('div', { class: 'footer-inner' },
        el('div', { class: 'footer-brand' },
          el('img', { src: 'assets/logo-mark.png', alt: '', 'aria-hidden': 'true', width: 28, height: 28, loading: 'lazy' }),
          el('span', {}, 'PROSPECTLAB 21')
        ),
        el('div', { class: 'footer-links' },
          el('a', { href: '#mails' }, 'El correo'),
          el('a', { href: '#proceso' }, 'Proceso'),
          el('a', { href: '#maquinaria' }, 'La maquinaria'),
          el('a', { href: '#precio' }, 'Precio'),
          el('a', { href: '#faq' }, 'Preguntas'),
          el('a', { href: 'mailto:gael@prospectlab21.com' }, 'Contacto')
        ),
        el('div', { class: 'footer-meta' }, '© 2026 ProspectLab21 · Hecho con atención, correo a correo')
      )
    );
  }

  /* ---------------- CUSTOM CURSOR ----------------
     Outline ring + tiny snap dot. Grows + inverts on interactive hover.
     Auto-disabled on coarse pointers (touch) and prefers-reduced-motion. */
  function setupCursor() {
    if (matchMedia('(pointer: coarse)').matches || prefersReduced) return;
    const ring = el('div', { class: 'pl-cursor', 'aria-hidden': 'true' });
    const dot  = el('div', { class: 'pl-cursor pl-cursor-dot', 'aria-hidden': 'true' });
    document.body.appendChild(ring);
    document.body.appendChild(dot);
    document.documentElement.classList.add('has-pl-cursor');

    let tx = 0, ty = 0, x = 0, y = 0;
    let firstMove = true;
    addEventListener('mousemove', (e) => {
      tx = e.clientX; ty = e.clientY;
      if (firstMove) { x = tx; y = ty; firstMove = false; }
      // dot snaps every frame in its own transform
      dot.style.transform = 'translate3d(' + tx + 'px, ' + ty + 'px, 0) translate(-50%, -50%)';
    }, { passive: true });

    (function tick() {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      ring.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0) translate(-50%, -50%)';
      requestAnimationFrame(tick);
    })();

    const hoverSel = 'a, button, [role=button], .step, .faq-question, .lab-metric, .proceso-card, .sobre-principles span, input, textarea, label';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest && e.target.closest(hoverSel)) ring.classList.add('is-hover');
    });
    document.addEventListener('mouseout', (e) => {
      const from = e.target.closest && e.target.closest(hoverSel);
      const to   = e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hoverSel);
      if (from && !to) ring.classList.remove('is-hover');
    });
    document.addEventListener('mousedown', () => ring.classList.add('is-down'));
    document.addEventListener('mouseup',   () => ring.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => { ring.classList.add('is-out'); dot.classList.add('is-out'); });
    document.addEventListener('mouseenter', () => { ring.classList.remove('is-out'); dot.classList.remove('is-out'); });
  }

  /* ---------------- EVENT TRACKING ----------------
     Vercel Web Analytics custom events. Fires only if Analytics is enabled
     on the project — otherwise window.va is undefined and the calls no-op. */
  function track(name, props) {
    try { if (window.va) window.va('event', { name, ...(props ? { props } : {}) }); } catch (_) {}
  }
  function setupEventTracking() {
    // CTA → cal.com (3 locations: nav, hero, final CTA section)
    const locFor = (a) => {
      if (a.closest('.nav-cta'))   return 'nav';
      if (a.closest('.cta-btn'))   return 'cta-section';
      if (a.closest('.hero-ctas')) return 'hero';
      return 'unknown';
    };
    document.addEventListener('click', (e) => {
      const a = e.target.closest && e.target.closest('a[href*="call.prospectlab21.com"]');
      if (a) track('cta_click', { location: locFor(a) });
      const m = e.target.closest && e.target.closest('a[href^="mailto:gael@prospectlab21.com"]');
      if (m) track('email_click', { location: m.closest('.footer-links') ? 'footer' : 'cta-alt' });
    }, { passive: true });

    // FAQ opens — which questions get expanded
    document.addEventListener('click', (e) => {
      const btn = e.target.closest && e.target.closest('.faq-question');
      if (btn && btn.getAttribute('aria-expanded') === 'false') {
        const q = (btn.querySelector('.faq-q-text') || {}).textContent || '';
        track('faq_open', { question: q.slice(0, 80) });
      }
    }, { passive: true });

    // Section reveal — fires once per section as user scrolls
    const seenSections = new Set();
    const sIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.id || (e.target.className.match(/(\w+)-section/) || [])[1];
        if (id && !seenSections.has(id)) {
          seenSections.add(id);
          track('section_view', { section: id });
        }
      });
    }, { threshold: 0.5 });
    $$('section[id], section[class*="-section"]').forEach(s => sIo.observe(s));
  }

  /* ---------------- TESTIMONIOS (prueba social — listo para tus videos) ----------------
     Rellena TESTIMONIOS con los videos de tus clientes y la sección aparece sola.
     Formato por item:
       { name, role, company, video, quote }
       - video: URL de embed (YouTube/Loom) para <iframe>, o un .mp4 directo.
       - quote: frase corta opcional que se muestra debajo del video.
     Mientras el array esté vacío, la sección NO se renderiza (cero hueco en la web). */
  const TESTIMONIOS = [
    // { name: 'Nombre del cliente', role: 'Director Comercial', company: 'Empresa S.A.', video: 'https://www.youtube.com/embed/VIDEO_ID', quote: 'En 6 semanas llenamos la agenda de reuniones.' },
  ];

  function Testimonios() {
    if (!TESTIMONIOS.length) return null;
    const isMp4 = (u) => /\.mp4($|\?)/i.test(u || '');
    const grid = el('div', { class: 'testi-grid' });
    TESTIMONIOS.forEach((t) => {
      const media = isMp4(t.video)
        ? el('video', { class: 'testi-video', src: t.video, controls: true, preload: 'metadata', playsinline: true })
        : el('iframe', { class: 'testi-video', src: t.video, title: 'Testimonio de ' + (t.name || 'cliente'), loading: 'lazy', allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture', allowfullscreen: true, frameborder: '0' });
      grid.appendChild(el('article', { class: 'testi-card' },
        el('div', { class: 'testi-video-wrap' }, media),
        t.quote ? el('blockquote', { class: 'testi-quote' }, '“' + t.quote + '”') : null,
        el('div', { class: 'testi-person' },
          el('span', { class: 'testi-name' }, t.name || ''),
          el('span', { class: 'testi-role' }, [t.role, t.company].filter(Boolean).join(' · '))
        )
      ));
    });
    return el('section', { class: 'testi-section', id: 'testimonios' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'Lo que dicen mis clientes'),
        el('h2', {}, 'No tienes que creerme ', el('em', { style: { fontStyle: 'normal', color: 'var(--accent)' } }, 'a mí'), '.'),
        el('p', { class: 'lead' }, 'Clientes reales contando con su propia voz cómo les cambió la agenda.'),
        grid
      )
    );
  }

  /* ---------------- BOOT ---------------- */
  function boot() {
    const root = $('#root');
    if (!root) return;
    root.dataset.themeMode = 'default';
    root.dataset.density = 'default';
    root.dataset.accent = 'blue';
    root.appendChild(Nav());
    root.appendChild(Hero());
    root.appendChild(MailsSection());
    root.appendChild(ComoLoHago());
    root.appendChild(PorqueNuncaMuere());
    root.appendChild(XraySection());
    root.appendChild(Maquinaria());
    root.appendChild(Simulador());
    root.appendChild(SobreMi());
    const testi = Testimonios();
    if (testi) root.appendChild(testi);
    root.appendChild(Precio());
    root.appendChild(FAQ());
    root.appendChild(CTA());
    root.appendChild(Footer());

    // El bloque de texto para buscadores deja de estar oculto: se coloca antes
    // del pie como sección visible. Contenido oculto y duplicado no ayuda a nadie.
    const seo = document.getElementById('seo-content');
    if (seo) root.insertBefore(seo, root.lastChild);
    document.documentElement.classList.add('booted');

    injectFaqSchema();
    setupCursor();
    setupEventTracking();

    // Smooth scroll polyfill for older Safari iOS
    if (!('scrollBehavior' in document.documentElement.style)) {
      document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const tgt = document.querySelector(a.getAttribute('href'));
          if (tgt) { e.preventDefault(); tgt.scrollIntoView({ behavior: 'smooth' }); }
        });
      });
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
