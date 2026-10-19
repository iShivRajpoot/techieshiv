/* TECHIE SHIV — builds the home page sections from the JSON files */
(function () {
  'use strict';
  const { el, fetchJSON, formatDate } = window.Site;
  const $ = id => document.getElementById(id);

  /* ── typewriter ── */
  const phrases = [
    'Honest reviews. No scripted praise 📱',
    'Less scrolling. More learning ⚡',
    'Tech, AI & things worth knowing 💡',
    'Sharing things I wish I knew earlier 💯'
  ];
  function typewriter(node) {
    if (!node) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = phrases[0];
      node.classList.add('static');
      return;
    }
    let p = 0, c = 0, del = false;
    (function tick() {
      const chars = Array.from(phrases[p]);
      c += del ? -1 : 1;
      node.textContent = chars.slice(0, c).join('');
      let d = del ? 28 : 60;
      if (!del && c === chars.length) { d = 1800; del = true; }
      else if (del && c === 0) { del = false; p = (p + 1) % phrases.length; d = 300; }
      setTimeout(tick, d);
    })();
  }

  const empty = msg => el('div', { class: 'empty' }, msg);
  const money = n => '₹' + Number(n).toLocaleString('en-IN');

  /* ── filter chips helper ── */
  function withFilter(chipsNode, gridNode, items, labelOf, keyOf, drawItem) {
    const keys = [...new Set(items.map(keyOf).filter(Boolean))];
    let active = 'All';
    const draw = () => {
      gridNode.replaceChildren(...items.filter(i => active === 'All' || keyOf(i) === active).map(drawItem));
      chipsNode.querySelectorAll('.chip').forEach(c => c.setAttribute('aria-pressed', String(c.dataset.v === active)));
    };
    chipsNode.replaceChildren(...['All', ...keys].map(k =>
      el('button', { class: 'chip', type: 'button', 'data-v': k, onclick: () => { active = k; draw(); } }, k === 'All' ? 'All' : labelOf(k))
    ));
    chipsNode.hidden = keys.length < 2;
    draw();
  }

  /* ── reviews ── */
  function reviewCard(r) {
    const thumb = el('div', { class: 'rthumb' },
      r.image ? el('img', { src: r.image, alt: r.name || 'Review', loading: 'lazy' }) : el('i', { class: 'fas fa-mobile-screen-button' }),
      el('div', { class: 'badges' },
        r.category && el('span', { class: 'pill' }, r.category),
        r.sample && el('span', { class: 'pill pill-warn' }, 'Sample')
      )
    );
    const pros = (r.pros || []).slice(0, 3), cons = (r.cons || []).slice(0, 3);
    const body = el('div', { class: 'rbody' },
      el('div', { class: 'rtop' },
        el('h3', null, r.name || 'Untitled'),
        typeof r.rating === 'number' && el('span', { class: 'rating' }, r.rating + '/10')
      ),
      r.summary && el('p', { class: 'rsum' }, r.summary),
      (pros.length || cons.length) && el('div', { class: 'pc' },
        pros.length && el('div', { class: 'pros' }, el('h4', null, 'Liked'), el('ul', null, pros.map(t => el('li', null, t)))),
        cons.length && el('div', { class: 'cons' }, el('h4', null, 'Not great'), el('ul', null, cons.map(t => el('li', null, t))))
      ),
      el('div', { class: 'rfoot' },
        r.price != null && r.price !== '' && el('span', { class: 'price' }, money(r.price)),
        r.article && el('a', { class: 'btn btn-sm btn-ghost', href: 'article.html?slug=' + encodeURIComponent(r.article) }, 'Full review'),
        r.video && el('a', { class: 'btn btn-sm btn-ghost', href: r.video, target: '_blank', rel: 'noopener' }, el('i', { class: 'fas fa-play' }), 'Watch'),
        r.buy && el('a', { class: 'btn btn-sm btn-primary', href: r.buy, target: '_blank', rel: 'noopener sponsored' }, 'Buy', el('i', { class: 'fas fa-arrow-right' }))
      )
    );
    return el('article', { class: 'card rcard' }, thumb, body);
  }
  function renderReviews(list) {
    const grid = $('reviews-grid'), chips = $('reviews-chips');
    if (!grid) return;
    if (!list.length) { chips.hidden = true; grid.replaceChildren(empty('First review coming soon. Follow on Instagram to catch it first.')); return; }
    withFilter(chips, grid, list, k => k, r => r.category, reviewCard);
  }

  /* ── articles ── */
  function articleCard(a) {
    return el('a', { class: 'card acard', href: 'article.html?slug=' + encodeURIComponent(a.slug) },
      el('div', { class: 'meta' },
        a.tag && el('span', { class: 'tagpill' }, a.tag),
        a.sample && el('span', { class: 'tagpill warn' }, 'Sample'),
        a.date && el('span', null, formatDate(a.date)),
        a.readTime && el('span', null, '· ' + a.readTime + ' min read')
      ),
      el('h3', null, a.title || 'Untitled'),
      a.summary && el('p', null, a.summary),
      el('span', { class: 'more' }, 'Read article →')
    );
  }
  function renderArticles(list) {
    const grid = $('articles-grid');
    if (!grid) return;
    const items = list.filter(a => a && a.slug).sort((a, b) => String(b.date).localeCompare(String(a.date))).slice(0, 6);
    grid.replaceChildren(...(items.length ? items.map(articleCard) : [empty('First article coming soon.')]));
  }

  /* ── videos ── */
  const TAGS = { tips: 'Tips & Tricks', ai: 'AI', review: 'Reviews' };
  function videoCard(v) {
    const icon = v.platform === 'youtube' ? 'fab fa-youtube' : 'fab fa-instagram';
    return el('a', { class: 'card vcard', href: v.url, target: '_blank', rel: 'noopener' },
      el('div', { class: 'vthumb' },
        v.thumb ? el('img', { src: v.thumb, alt: v.title || 'Video', loading: 'lazy' }) : el('i', { class: 'fas fa-circle-play' }),
        el('i', { class: icon + ' plat' }),
        el('div', { class: 'badges' },
          v.tag && el('span', { class: 'pill' }, TAGS[v.tag] || v.tag),
          v.sample && el('span', { class: 'pill pill-warn' }, 'Sample')
        )
      ),
      el('div', { class: 'vbody' }, el('h3', null, v.title || 'Untitled'))
    );
  }
  function renderVideos(list) {
    const grid = $('videos-grid'), chips = $('videos-chips');
    if (!grid) return;
    if (!list.length) { chips.hidden = true; grid.replaceChildren(empty('Videos coming soon. Subscribe on YouTube to be first.')); return; }
    withFilter(chips, grid, list, k => TAGS[k] || k, v => v.tag, videoCard);
  }

  /* ── store ── */
  function productCard(p) {
    const img = el('img', { src: p.image || '', alt: p.name || 'Product', loading: 'lazy' });
    if (p.imageFallback) {
      img.addEventListener('error', function once() {
        img.removeEventListener('error', once);
        img.src = p.imageFallback;
      });
    }
    return el('article', { class: 'card rcard' },
      el('div', { class: 'rthumb contain' }, p.image && img,
        el('div', { class: 'badges' },
          p.badge && el('span', { class: 'pill pill-pick' }, p.badge))),
      el('div', { class: 'rbody' },
        p.category && el('span', { class: 'tagpill' }, p.category),
        el('h3', null, p.name || 'Untitled'),
        p.description && el('p', { class: 'rsum' }, p.description),
        el('div', { class: 'rfoot' },
          p.price != null && el('span', { class: 'price' }, money(p.price), p.mrp && el('small', null, money(p.mrp))),
          p.url && el('a', { class: 'btn btn-sm btn-primary', href: p.url, target: '_blank', rel: 'noopener sponsored' }, 'Buy Now', el('i', { class: 'fas fa-arrow-right' }))
        )
      )
    );
  }
  function renderStore(list) {
    const grid = $('store-grid');
    if (!grid) return;
    grid.replaceChildren(...(list.length ? list.map(productCard) : [empty('Picks coming soon.')]));
  }

  document.addEventListener('DOMContentLoaded', async () => {
    typewriter($('typed'));
    const [reviews, articles, videos, store] = await Promise.all(
      ['reviews.json', 'articles.json', 'videos.json', 'store.json'].map(fetchJSON)
    );
    renderReviews(reviews);
    renderArticles(articles);
    renderVideos(videos);
    renderStore(store);
  });
})();
