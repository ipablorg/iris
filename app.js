(function(){
  // Progress bar
  const bar = document.querySelector('.progress');
  const onScroll = () => { const h = document.documentElement; const p = h.scrollTop / (h.scrollHeight - h.clientHeight); bar.style.width = (p*100).toFixed(2) + '%'; };
  document.addEventListener('scroll', onScroll, {passive:true}); onScroll();

  // Reveal
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), {rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  } else document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));

  // Layers toggle
  document.querySelectorAll('[data-layer]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-layer]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
    document.querySelectorAll('[data-layer-panel]').forEach(p => p.hidden = p.dataset.layerPanel !== b.dataset.layer);
  }));

  // Tabs
  document.querySelectorAll('[data-tab]').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('[data-tab]').forEach(x => x.setAttribute('aria-selected', String(x === b)));
    document.querySelectorAll('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== b.dataset.tab; if (!p.hidden) p.classList.add('in'); });
  }));

  // Embed controls
  document.querySelectorAll('[data-embed]').forEach(frame => {
    const stage = frame.querySelector('.stage'), iframe = stage.querySelector('iframe'), src = iframe.getAttribute('src');
    frame.querySelectorAll('[data-view]').forEach(btn => btn.addEventListener('click', () => {
      frame.querySelectorAll('[data-view]').forEach(b => b.setAttribute('aria-pressed','false')); btn.setAttribute('aria-pressed','true');
      stage.classList.toggle('mobile', btn.dataset.view === 'mobile');
    }));
    frame.querySelector('[data-reload]').addEventListener('click', () => { iframe.src = 'about:blank'; setTimeout(() => iframe.src = src, 50); });
    frame.querySelector('[data-full]').addEventListener('click', () => {
      const ov = document.createElement('div'); ov.className = 'overlay'; ov.setAttribute('role','dialog'); ov.setAttribute('aria-modal','true');
      ov.innerHTML = `<div class="frame-bar"><div class="dots"><i></i><i></i><i></i></div><div class="url">${src.replace(/^https?:\/\//,'')}</div><div class="frame-actions"><a href="${src}" target="_blank" rel="noopener">Abrir en pestaña ↗</a><button type="button" data-close>Cerrar ✕</button></div></div><iframe src="${src}" title="${iframe.title}" allow="clipboard-write"></iframe>`;
      document.body.appendChild(ov); document.body.style.overflow = 'hidden';
      const close = () => { ov.remove(); document.body.style.overflow = ''; document.removeEventListener('keydown', onKey); };
      const onKey = e => { if (e.key === 'Escape') close(); };
      ov.querySelector('[data-close]').addEventListener('click', close); document.addEventListener('keydown', onKey); ov.querySelector('[data-close]').focus();
    });
  });

  // Stacked bar chart (USD M per year by vertical) — Business Case figures
  const data = [
    { label: 'Año 1', ecom: 1.2, comex: 0.5, tech: 0.3 },
    { label: 'Año 2', ecom: 3.6, comex: 1.5, tech: 0.9 },
    { label: 'Año 3', ecom: 6.0, comex: 2.3, tech: 1.5 },
  ];
  const svg = document.getElementById('chart'); if (!svg) return;
  const W = 640, H = 320, padL = 56, padR = 20, padT = 24, padB = 44, max = 10;
  const ih = H - padT - padB, iw = W - padL - padR, y = v => padT + ih - (v / max) * ih;
  const ns = 'http://www.w3.org/2000/svg', el = (t, a, txt) => { const n = document.createElementNS(ns, t); for (const k in a) n.setAttribute(k, a[k]); if (txt != null) n.textContent = txt; return n; };
  // grid + axis
  for (let v = 0; v <= max; v += 2) {
    svg.appendChild(el('line', { x1: padL, x2: W - padR, y1: y(v), y2: y(v), stroke: '#DBE8E5', 'stroke-width': 1 }));
    svg.appendChild(el('text', { x: padL - 10, y: y(v) + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#59706E', 'font-family': 'JetBrains Mono, monospace' }, v + ' M'));
  }
  const bw = 110, gap = (iw - bw * data.length) / (data.length + 1);
  data.forEach((d, i) => {
    const x = padL + gap + i * (bw + gap); let acc = 0;
    [['ecom', '#004747'], ['comex', '#12A37A'], ['tech', '#6BF0B2']].forEach(([k, c]) => {
      const v = d[k], top = y(acc + v), h = y(acc) - top;
      svg.appendChild(el('rect', { x, y: top, width: bw, height: h, fill: c, rx: 3 }));
      if (h > 16) svg.appendChild(el('text', { x: x + bw / 2, y: top + h / 2 + 4, 'text-anchor': 'middle', 'font-size': 11, fill: k === 'tech' ? '#004747' : '#fff', 'font-family': 'Inter, sans-serif', 'font-weight': 600 }, v.toFixed(1).replace('.', ',')));
      acc += v;
    });
    svg.appendChild(el('text', { x: x + bw / 2, y: y(acc) - 8, 'text-anchor': 'middle', 'font-size': 13, fill: '#004747', 'font-family': 'Manrope, sans-serif', 'font-weight': 800 }, 'USD ' + acc.toFixed(1).replace('.', ',') + ' M'));
    svg.appendChild(el('text', { x: x + bw / 2, y: H - 16, 'text-anchor': 'middle', 'font-size': 12, fill: '#3E5A58', 'font-family': 'Inter, sans-serif', 'font-weight': 500 }, d.label));
  });
})();
