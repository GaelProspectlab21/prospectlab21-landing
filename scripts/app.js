/* ProspectLab21 — Landing JS (vanilla port of the design React prototype)
   No frameworks, no runtime transpilation. Same DOM the original CSS expects. */
(() => {
  'use strict';

  const CAL_URL = 'https://cal.com/gael-prospectlab21/15min';

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
      el('a', { class: 'nav-brand', href: '#top', 'aria-label': 'ProspectLab21 — Inicio' },
        el('img', { src: 'assets/logo-mark.png', alt: '', width: 26, height: 26, loading: 'eager', decoding: 'sync', fetchpriority: 'high' }),
        el('span', {}, 'PROSPECTLAB 21')
      ),
      el('nav', { class: 'nav-links', 'aria-label': 'Navegación principal' },
        el('a', { href: '#mails' }, 'Cómo funciona'),
        el('a', { href: '#proceso' }, 'Proceso'),
        el('a', { href: '#maquinaria' }, 'La maquinaria'),
        el('a', { href: '#sobre' }, 'Sobre Gael'),
        el('a', { href: '#faq' }, 'FAQ')
      ),
      el('a', { class: 'nav-cta', href: CAL_URL, target: '_blank', rel: 'noopener' }, 'Agenda una llamada', Icon('arrow-right', 14))
    );
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 32);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return header;
  }

  /* ---------------- HERO ---------------- */
  const ROTATOR_WORDS = ['ese cliente', 'un sí', 'ese deal', 'el cierre', 'ese deal', 'un sí', 'tu próximo cliente'];

  function Rotator(onChange) {
    const measure = el('span', { class: 'rotator-measure', 'aria-hidden': 'true' });
    const track = el('span', { class: 'rotator-track' });
    const wrap = el('span', { class: 'rotator', 'aria-live': 'polite' }, measure, track);
    let i = 0;
    const render = () => {
      const word = ROTATOR_WORDS[i];
      measure.textContent = word;
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

    const eyebrow = el('div', { class: 'hero-eyebrow intro-fade', style: { transitionDelay: '60ms' } }, 'Agencia de cold email B2B');
    const h1 = el('h1', { class: 'headline-intro' });
    // Line 1
    h1.appendChild(IntroLine('A un mail de', 180, 80));
    h1.appendChild(el('br'));
    h1.appendChild(IntroLine('conectar con', 520, 80));
    h1.appendChild(el('span', { class: 'iw-space' }, ' '));
    const rotatorWrap = el('span', { class: 'iw-wrap rotator-wrap', style: { transitionDelay: '780ms' } });
    rotatorWrap.appendChild(Rotator((word) => {
      if (word === 'tu próximo cliente') {
        h1.classList.add('is-settling');
        setTimeout(() => h1.classList.remove('is-settling'), 900);
      }
    }));
    h1.appendChild(rotatorWrap);
    const dotWrap = el('span', { class: 'iw-wrap' });
    const dot = el('span', { class: 'iw', style: { transitionDelay: '880ms' } }, '.');
    dotWrap.appendChild(dot);
    h1.appendChild(dotWrap);

    const sub = el('p', { class: 'hero-sub intro-fade', style: { transitionDelay: '1100ms' } },
      'Operamos como un robot que no duerme: 24/7 segmentando cuentas hasta el último filtro, afinando secuencias y manteniendo la bandeja limpia. Tú recibes reuniones calificadas en el calendario, no clicks.');
    const ctas = el('div', { class: 'hero-ctas intro-fade', style: { transitionDelay: '1280ms' } },
      el('a', { href: CAL_URL, target: '_blank', rel: 'noopener', class: 'btn btn-primary' }, 'Agenda una llamada', Icon('arrow-right', 16)),
      el('a', { href: '#mails', class: 'btn btn-ghost' }, 'Ver cómo trabajamos')
    );

    const copy = el('div', { class: 'hero-copy' }, eyebrow, h1, sub, ctas);
    const grid = el('div', { class: 'hero-grid' }, copy, SplineRobot());
    section.appendChild(grid);

    section.appendChild(el('div', { class: 'hero-meta' },
      el('span', { class: 'live' }, 'EN OPERACIÓN · Q2 / 2026'),
      el('span', {}, '21 / GAEL · CEO 13 AÑOS')
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
      rotatorWrap.classList.add('is-in');
      $$('.iw', h1).forEach(n => n.classList.add('is-in'));
    }));

    return section;
  }

  /* ---------------- MAILS SECTION ---------------- */
  const MAIL_STEPS = [
    { id: 'asunto',   num: '01 / ASUNTO',    title: 'Hiperconcreto, en minúsculas.',           body: 'Suena a mensaje interno, no a marketing. Eso solo ya dobla la tasa de apertura.' },
    { id: 'apertura', num: '02 / APERTURA',  title: 'Sin "Hola". Solo el nombre.',             body: 'Rompemos el patrón del 95% de cold emails que arrancan igual. El cerebro del lead detecta la diferencia en 0,3 segundos.' },
    { id: 'gancho',   num: '03 / GANCHO',    title: 'Dato verificable, no halago.',            body: 'Serie A + Lisboa demuestra research real. Imposible de copiar/pegar a otro lead — y eso es exactamente la señal.' },
    { id: 'pain',     num: '04 / PAIN',      title: 'El momento humano.',                      body: 'Aquí el email deja de sonar a empresa. Atreverse a sonar humano es lo que destaca entre 50 correos corporativos del día.' },
    { id: 'cta',      num: '05 / CTA',       title: 'Valor antes de pedir.',                   body: 'No pide reunión. Ofrece una auditoría real que el lead querría aunque no comprara. Cuesta más decir no a algo gratis y útil.' },
    { id: 'firma',    num: '06 / FIRMA',     title: 'Una sola palabra.',                       body: 'Solo el nombre. Mensaje entre personas, no entre empresas.' },
    { id: 'pd',       num: '07 / PD',        title: 'El cierre que casi nadie usa.',           body: '"2 SDRs en Madrid" cierra el loop: gasto real → ahorro real. La PD es el lugar más leído del email.' }
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
  const OUR_MAIL = { from: 'Gael — ProspectLab21', subject: 'vuestra ronda de junio', preview: 'Marcos, cerrasteis la Serie A y abrís Lisboa este trimestre. Menudo año…', avatar: '#0047ff' };
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
          el('span', { class: 'name' }, 'Gael Carrasco'),
          el('span', { class: 'time' }, '9:38')
        ),
        el('div', { class: 'mm-row mm-row-sub' },
          el('span', { class: 'addr' }, 'Para: marcos@trackr.io ', el('span', { class: 'chev' }, '›')),
          el('span', { class: 'star', 'aria-hidden': 'true' }, '☆')
        )
      )
    ));

    const mkHL = (id, text) => el('span', { class: 'mail-hl', dataset: { hl: id } }, text);

    const subjectEl = el('div', { class: 'mail-subject', dataset: { anchor: 'asunto' } }, mkHL('asunto', 'vuestra ronda de junio'));
    const txt = el('div', { class: 'mail-text' },
      el('p', { dataset: { anchor: 'apertura' } }, mkHL('apertura', 'Marcos,')),
      el('p', { dataset: { anchor: 'gancho' } }, mkHL('gancho', 'cerrasteis la Serie A y abrís Lisboa este trimestre.'), ' Menudo año.'),
      el('p', { dataset: { anchor: 'pain' } }, 'Justo después de una ronda, la prospección manual revienta. ', mkHL('pain', 'Joder'), ', hemos visto founders perder 3 meses post-ronda por no levantar el outbound a tiempo. Lo nuestro: reuniones con decisores sin que tu equipo toque un correo.'),
      el('p', { dataset: { anchor: 'cta' } }, mkHL('cta', '¿Te paso una auditoría gratis del outbound de Trackr?'), ' Sin venta — te digo dónde se os escapan reuniones.'),
      el('p', { dataset: { anchor: 'firma' } }, mkHL('firma', 'Gael')),
      el('p', { class: 'mail-pd', dataset: { anchor: 'pd' } }, mkHL('pd', 'PD: vi que buscáis 2 SDRs en Madrid. Justo lo que os ahorramos.'))
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
      // arm rows on falling
      if (p === 'falling') {
        const rows = $$('.inbox-row', inboxList);
        rows.forEach((r, i) => setTimeout(() => r.classList.add('is-armed'), i * 90));
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
        el('h2', {}, 'Cada correo es ', el('em', { style: { fontStyle: 'normal', color: 'var(--accent)' } }, 'una decisión'), ', no una plantilla.'),
        el('p', { class: 'lead' }, 'Esto no es spray-and-pray. Cada campaña se construye con segmentación quirúrgica y un ángulo pensado para ese nicho específico. Así se ve un correo por dentro.'),
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

    // Trigger cinematic once when section enters viewport
    let started = false;
    const cinematicIo = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting || started) return;
        started = true;
        phase = 'falling';  mock.setPhase('falling');
        setTimeout(() => { phase = 'highlight'; mock.setPhase('highlight'); }, 1200);
        setTimeout(() => { phase = 'opening';   mock.setPhase('opening');   }, 2100);
        setTimeout(() => {
          phase = 'open';
          mock.setPhase('open');
          // PIN bullet 01 for ~2.6s so the user reads from the start
          lockActiveObs = true;
          forceActive('asunto');
          if (stepEls[0]) stepEls[0].classList.add('is-in');
          revealSeen();
          // Gently bring bullet 01 into the reading band
          if (stepEls[0]) {
            try { stepEls[0].scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch (_) {}
          }
          setTimeout(() => { lockActiveObs = false; }, 2600);
        }, 2700);
        cinematicIo.disconnect();
      });
    }, { threshold: 0.28 });
    cinematicIo.observe(section);

    // Reveal observer — marks as "seen" always; flips .is-in only once phase=open
    const revealObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const id = e.target.dataset.stepid;
        seen.add(id);
        if (phase === 'open') e.target.classList.add('is-in');
      });
    }, { rootMargin: '0px 0px -20% 0px', threshold: 0.15 });

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
      { num: '01', kicker: 'Diagnóstico',     title: 'Entendemos tu negocio primero', lines: ['Antes de enviar un solo correo, vemos tu empresa a fondo.', 'Qué vendes. A quién. Por qué deberían elegirte.', 'Definimos tu oferta, tu mensaje y tu ángulo.', 'Sin eso, no hay sistema que funcione.'] },
      { num: '02', kicker: 'Infraestructura', title: 'Construimos la infraestructura', lines: ['Configuramos todo bien desde el inicio.', 'Dominios, cuentas, warm-up y entregabilidad.', 'La base importa.', 'Si fallas aquí, todo lo demás se cae.'] },
      { num: '03', kicker: 'Lanzamiento',     title: 'Lanzamos y optimizamos',         lines: ['Enviamos. Medimos. Ajustamos.', 'Vemos datos reales: aperturas, respuestas, reuniones.', 'Lo que funciona se escala.', 'Lo que no, se mejora.'] },
      { num: '04', kicker: 'Sistema',         title: 'Convertimos en sistema',         lines: ['No es una campaña.', 'Es un proceso repetible.', 'Reuniones constantes.', 'Crecimiento predecible.'] }
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
        el('h2', { class: 'proceso-title' }, 'Cuatro pasos. ', el('span', { class: 'proceso-title-accent' }, 'Un sistema que funciona.')),
        el('p', { class: 'lead proceso-lead' }, 'Del diagnóstico al sistema. Así pasamos de cero a reuniones recurrentes en tu calendario.'),
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
      { app: 'Calendar', time: 'hace 12m', title: 'Reunión confirmada',      text: 'Marta — Director Ventas · jueves 11:00' }
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
      { n: '01', h: 'Es el único canal que controlas tú',     p: 'No dependes de un algoritmo de TikTok ni del CPC de LinkedIn. Mientras existan bandejas de entrada, existe el canal.' },
      { n: '02', h: 'Va directo al decisor',                  p: 'En B2B serio, las decisiones se firman por correo. Una llamada en frío se ignora; un correo bien hecho se lee al primer café.' },
      { n: '03', h: 'Escala sin perder calidad',              p: 'La IA no mata el cold email — mata el cold email malo. Cuanto más ruido hay, más diferencia el correo con criterio, bien segmentado y con un ángulo real.' }
    ];
    return el('section', { class: 'porque-section' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'El canal'),
        el('h2', {}, '¿Por qué el cold email ', el('em', { style: { fontStyle: 'normal', color: 'var(--pl-blue-300)' } }, 'nunca'), ' muere?'),
        el('p', { class: 'lead' }, 'Cada año alguien lo declara muerto. Cada año cierra más reuniones que cualquier otro canal outbound. Estas son las razones —resumidas, sin floritura.'),
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

  /* ---------------- MAQUINARIA (WOW SECTION v2) ----------------
     Pipeline visualization: 6 abstract nodes connected by animated dots.
     Replaces the metric dashboard — competence without numerical claims. */
  function Maquinaria() {
    const nodes = [
      { num: '01', label: 'Scraper',         desc: 'Buscamos las cuentas que encajan con tu ICP — capa por capa de filtros.',                glyph: '<svg viewBox="0 0 48 48"><rect x="6" y="6" width="22" height="22" rx="1" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="11" y1="13" x2="22" y2="13" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="11" y1="18" x2="20" y2="18" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="11" y1="23" x2="18" y2="23" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><circle cx="28" cy="28" r="8" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="34" y1="34" x2="42" y2="42" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { num: '02', label: 'Enriquecimiento', desc: 'Cada lead se pule con la información que importa: qué hacen, qué venden, qué cambió.', glyph: '<svg viewBox="0 0 48 48"><rect x="8" y="10" width="32" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="20" width="32" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><rect x="8" y="30" width="32" height="8" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="13" cy="14" r="1.4" fill="currentColor"/><circle cx="13" cy="24" r="1.4" fill="currentColor"/><circle cx="13" cy="34" r="1.4" fill="currentColor"/><line x1="18" y1="14" x2="36" y2="14" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="18" y1="24" x2="32" y2="24" stroke="currentColor" stroke-width="1.2" opacity="0.5"/><line x1="18" y1="34" x2="34" y2="34" stroke="currentColor" stroke-width="1.2" opacity="0.5"/></svg>' },
      { num: '03', label: 'Calificador',     desc: 'Descartamos cuentas que no encajan antes de gastar tinta. Filtro duro.',                glyph: '<svg viewBox="0 0 48 48"><path d="M8 10 L40 10 L29 25 L29 38 L19 33 L19 25 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="13" y1="15" x2="35" y2="15" stroke="currentColor" stroke-width="1.2" opacity="0.45"/></svg>' },
      { num: '04', label: 'Escritor',        desc: 'Construimos las secuencias con el ángulo correcto para ese nicho específico.',          glyph: '<svg viewBox="0 0 48 48"><line x1="10" y1="36" x2="36" y2="36" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="10" y1="30" x2="28" y2="30" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/><path d="M30 8 L40 18 L20 38 L10 38 L10 28 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="28" y1="13" x2="35" y2="20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { num: '05', label: 'Sender',          desc: 'Mailboxes dedicadas, warm-up de 30 días, deliverability monitoreada todos los días.',  glyph: '<svg viewBox="0 0 48 48"><path d="M6 24 L42 8 L34 40 L24 28 L6 24 Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><line x1="24" y1="28" x2="42" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { num: '06', label: 'Calendar',        desc: 'Reuniones calificadas con decisores. En tu calendario, no en una hoja de cálculo.',     glyph: '<svg viewBox="0 0 48 48"><rect x="8" y="12" width="32" height="28" rx="2" fill="none" stroke="currentColor" stroke-width="1.5"/><line x1="8" y1="20" x2="40" y2="20" stroke="currentColor" stroke-width="1.5"/><line x1="16" y1="8" x2="16" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><line x1="32" y1="8" x2="32" y2="14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><polyline points="18,29 22,33 30,25" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
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
        el('p', { class: 'lead maq-lead' }, 'Esto es lo que ocurre entre el día que firmamos contigo y la primera reunión en tu calendario. Seis nodos. Cada uno hace una cosa, y solo una.'),
        flow,
        el('div', { class: 'maq-footer' },
          el('span', {}, '— Operado punta a punta. Tu equipo no toca ningún nodo. Tú solo abres el calendario.')
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
          ),
          el('dl', { class: 'sobre-credentials' },
            el('div', { class: 'sc-row' }, el('dt', {}, 'Nombre'),   el('dd', {}, 'Gael')),
            el('div', { class: 'sc-row' }, el('dt', {}, 'Rol'),      el('dd', {}, 'Fundador & CEO')),
            el('div', { class: 'sc-row' }, el('dt', {}, 'Edad'),     el('dd', {}, '13 años')),
            el('div', { class: 'sc-row' }, el('dt', {}, 'Enfoque'),  el('dd', {}, 'Cold email B2B'))
          )
        ),
        el('div', { class: 'sobre-content' },
          el('h3', { class: 'sobre-greeting' }, 'Hey, soy ', el('span', { class: 'sobre-name' }, 'Gael'), '.'),
          el('div', { class: 'sobre-bio' },
            el('p', { class: 'sobre-lead' }, 'Soy un emprendedor joven obsesionado con una cosa: conectar negocios con los decisores que ', el('em', {}, 'realmente'), ' mueven el juego — a través de cold email ejecutado con precisión.'),
            el('blockquote', { class: 'sobre-credo' },
              el('p', {}, 'No creo en la suerte.'),
              el('p', {}, 'Creo en sistemas bien construidos y ejecución constante.')
            ),
            el('p', { class: 'sobre-discipline' }, 'Trabajo con disciplina, enfoque y mentalidad de largo plazo.')
          ),
          el('p', { class: 'sobre-punch' }, 'No prometo magia.'),
          el('div', { class: 'sobre-principles', 'aria-label': 'Principios' },
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Disciplina'),
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Enfoque'),
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Largo plazo'),
            el('span', {}, el('i', { 'aria-hidden': 'true' }), 'Sin magia')
          )
        )
      ),
      el('figure', { class: 'sobre-scripture' },
        el('div', { class: 'ss-bar', 'aria-hidden': 'true' }),
        el('div', { class: 'ss-body' },
          el('div', { class: 'ss-eyebrow' }, el('span', { class: 'ss-dot', 'aria-hidden': 'true' }), 'Versículo guía'),
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
  const FAQ_ITEMS = [
    { q: '¿Qué hacen exactamente?', a: 'Operamos tu cold email B2B de punta a punta: segmentamos hasta el último filtro, armamos las secuencias con personalización por lead, manejamos toda la infraestructura de envío y dejamos las reuniones calificadas en tu calendario. Tu equipo no toca un correo.' },
    { q: '¿Me van a quemar el dominio?', a: 'No, ese es justo el punto. Usamos dominios y mailboxes dedicadas que nunca tocan tu dominio principal. Cada cuenta lleva entre 21 y 30 días de warm-up antes de mandar un solo correo a un lead. Bounce siempre debajo del 3%, ritmo conservador y deliverability monitoreada todos los días.' },
    { q: '¿En cuánto tiempo empiezan a caer reuniones?', a: 'Depende del nicho y de qué tan fino esté el ICP, pero el rango normal son las primeras 2 a 3 semanas. El mes 1 es setup y primera oleada. El mes 2 y 3 es donde el sistema empieza a generar reuniones de forma constante.' },
    { q: '¿Qué necesitan de mí?', a: 'Una llamada de diagnóstico de 20 minutos, acceso para crear los dominios y correos auxiliares, y que me cuentes a fondo tu ICP y tu oferta. No te pedimos listas, ni plantillas, ni que tú escribas los correos. Eso lo hacemos nosotros.' },
    { q: '¿Les funciona cualquier sector?', a: 'No, y mejor así. Filtro fuerte: B2B con ticket medio arriba de unos 3,000 USD/mes o con ciclo de venta consultivo. Si tu producto encaja, te lo digo. Si no encaja, también te lo digo — y si conozco a alguien que sí lo trabaja, te lo paso.' },
    { q: '¿Cuánto cuesta?', a: 'Lo platicamos en la llamada — el precio depende del volumen de mailboxes, los países que ataques y tu ciclo de venta. Sin contratos largos: si a los 60 días no hay tracción real, nos salimos sin drama.' },
    { q: '¿Y si ya tengo SDR interno?', a: 'Mejor todavía. Nosotros llenamos su calendario, él cierra. Un SDR caro se quema haciendo prospección manual; con el sistema de fondo, pasa el día en llamadas en lugar de en hojas de cálculo.' },
    { q: '¿Mandan reportes?', a: 'Sí. Dashboard semanal con envíos, aperturas, replies clasificados (interesado, tibio, no interesado, fuera de oficina, rebote) y reuniones agendadas. Cada quince días tenemos una llamada para ajustar mensaje, ICP y volumen.' }
  ];

  function FAQ() {
    const list = el('div', { class: 'faq-list', role: 'list' });
    FAQ_ITEMS.forEach((item, i) => {
      const id = 'faq-' + i;
      const ans = el('div', { class: 'faq-answer', id: id + '-a', role: 'region' }, el('p', {}, item.a));
      const btn = el('button', { type: 'button', class: 'faq-question', 'aria-expanded': 'false', 'aria-controls': id + '-a' },
        el('span', { class: 'faq-q-text' }, item.q),
        el('span', { class: 'faq-q-icon', 'aria-hidden': 'true' })
      );
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true';
        btn.setAttribute('aria-expanded', String(!open));
        item.q && row.classList.toggle('is-open', !open);
        if (!open) ans.style.maxHeight = ans.scrollHeight + 'px';
        else ans.style.maxHeight = '0px';
      });
      const row = el('div', { class: 'faq-row', role: 'listitem', id }, btn, ans);
      list.appendChild(row);
    });
    return el('section', { class: 'faq-section', id: 'faq' },
      el('div', { class: 'section-inner' },
        el('div', { class: 'section-eyebrow' }, 'Lo que siempre me preguntan'),
        el('h2', {}, 'Lo que vas a querer saber ', el('em', { style: { fontStyle: 'normal', color: 'var(--accent)' } }, 'antes'), ' de la llamada.'),
        el('p', { class: 'lead' }, 'Las dudas reales que escuchamos cada semana. Sin rodeos, sin letra chica.'),
        list
      )
    );
  }

  /* ---------------- CTA ---------------- */
  function CTA() {
    return el('section', { class: 'cta-section', id: 'cta' },
      el('div', { class: 'cta-bg' }),
      el('div', { class: 'cta-inner' },
        el('div', { class: 'cta-eyebrow' }, 'Empezamos aquí'),
        el('h2', {}, 'Vamos por', el('br'), 'tu primer mail.'),
        el('p', { class: 'cta-sub' }, 'Una llamada de 20 minutos. Te digo si tu producto encaja con lo que hacemos — y si no, te paso a alguien que sí.'),
        el('a', { class: 'cta-btn', href: CAL_URL, target: '_blank', rel: 'noopener' }, 'Agenda una llamada', el('span', { class: 'arrow' }, Icon('arrow-ur', 20))),
        el('div', { class: 'cta-meta' },
          el('span', {}, '· 20 MIN'),
          el('span', {}, '· SIN COMPROMISO'),
          el('span', {}, '· RESPUESTA EN 24H')
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
          el('img', { src: 'assets/logo-mark.png', alt: '', width: 28, height: 28, loading: 'lazy' }),
          el('span', {}, 'PROSPECTLAB 21')
        ),
        el('div', { class: 'footer-links' },
          el('a', { href: '#mails' }, 'Cómo funciona'),
          el('a', { href: '#proceso' }, 'Proceso'),
          el('a', { href: '#maquinaria' }, 'La maquinaria'),
          el('a', { href: '#faq' }, 'FAQ'),
          el('a', { href: 'mailto:gael@prospectlab21.com' }, 'Contacto')
        ),
        el('div', { class: 'footer-meta' }, '© 2026 ProspectLab21 — Hecho con atención, correo a correo')
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
    root.appendChild(Maquinaria());
    root.appendChild(SobreMi());
    root.appendChild(FAQ());
    root.appendChild(CTA());
    root.appendChild(Footer());

    setupCursor();

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
