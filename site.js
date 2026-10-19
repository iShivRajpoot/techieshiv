/* TECHIE SHIV — shared helpers (theme, menu, live stats) */
(function () {
  'use strict';

  function safeUrl(u) {
    try {
      const x = new URL(String(u), location.href);
      return ['http:', 'https:', 'mailto:'].includes(x.protocol) ? String(u) : '#';
    } catch (e) { return '#'; }
  }

  // Builds DOM nodes safely: text is always inserted as text, never as HTML.
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) {
        if (v == null || v === false) continue;
        if (k === 'class') n.className = v;
        else if (k === 'href' || k === 'src') n.setAttribute(k, safeUrl(v));
        else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2), v);
        else n.setAttribute(k, v === true ? '' : v);
      }
    }
    kids.flat().forEach(c => {
      if (c == null || c === false) return;
      n.append(c.nodeType ? c : document.createTextNode(String(c)));
    });
    return n;
  }

  async function fetchJSON(path) {
    try {
      const r = await fetch(path + '?v=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const d = await r.json();
      return Array.isArray(d) ? d : [];
    } catch (e) {
      console.warn('Could not load ' + path, e);
      return [];
    }
  }

  function formatDate(s) {
    const d = new Date(s);
    return isNaN(d) ? '' : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function compact(n) {
    if (n >= 1e6) return (Math.round(n / 1e5) / 10) + 'M';
    if (n >= 1e3) return (Math.round(n / 100) / 10) + 'K';
    return String(n);
  }

  function fmt(v, type) {
    if (type === 'percent') return v.toFixed(1) + '%';
    if (type === 'full') return v.toLocaleString('en-IN');
    return compact(v);
  }

  function initTheme() {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const root = document.documentElement;
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
  }

  function initMenu() {
    const btn = document.getElementById('hamburger');
    const menu = document.getElementById('mobileMenu');
    if (!btn || !menu) return;
    const icon = btn.querySelector('i');
    const set = open => {
      menu.classList.toggle('open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      if (icon) icon.className = open ? 'fas fa-xmark' : 'fas fa-bars';
    };
    btn.addEventListener('click', e => { e.stopPropagation(); set(!menu.classList.contains('open')); });
    menu.addEventListener('click', e => { if (e.target.closest('a')) set(false); });
    document.addEventListener('click', e => { if (!menu.contains(e.target) && !btn.contains(e.target)) set(false); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') set(false); });
  }

  async function initStats() {
    const nodes = document.querySelectorAll('[data-stat]');
    if (!nodes.length) return;
    try {
      const r = await fetch('stats.json?v=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) throw new Error(r.status);
      const data = await r.json();
      nodes.forEach(n => {
        const v = data[n.dataset.stat];
        if (typeof v === 'number' && isFinite(v)) n.textContent = fmt(v, n.dataset.format);
      });
      const u = document.getElementById('stats-updated');
      if (u && data.updated) {
        const t = formatDate(data.updated);
        if (t) u.textContent = 'updated ' + t;
      }
    } catch (e) { /* keep the numbers already written in the HTML */ }
  }

  window.Site = { el, fetchJSON, formatDate, safeUrl };

  document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMenu();
    initStats();
  });
})();
