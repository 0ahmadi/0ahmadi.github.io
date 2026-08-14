(function () {
  const POSTS_INDEX = 'blog/posts/index.json';
  const POSTS_DIR    = 'blog/posts/';

  const listEl = document.getElementById('blog-list');
  const postEl = document.getElementById('post-content');

  let postsCache = null;

  function fmtDate(iso) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d)) return iso;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
  }

  function getPosts() {
    if (postsCache) return Promise.resolve(postsCache);
    return fetch(POSTS_INDEX)
      .then(r => r.json())
      .then(posts => {
        postsCache = posts.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
        return postsCache;
      });
  }

  function renderList() {
    if (!listEl) return;
    listEl.innerHTML = '<p class="blog-loading">Loading…</p>';
    getPosts()
      .then(posts => {
        if (!posts.length) {
          listEl.innerHTML = '<p class="blog-loading">No posts yet.</p>';
          return;
        }
        listEl.innerHTML = posts.map(p => `
          <a class="blog-item" href="#blog/${encodeURIComponent(p.slug)}">
            <div class="blog-item-date">${fmtDate(p.date)}</div>
            <div class="blog-item-body">
              <div class="blog-item-title">${escapeHtml(p.title)}</div>
              ${p.summary ? `<p class="blog-item-summary">${escapeHtml(p.summary)}</p>` : ''}
              ${p.tags && p.tags.length ? `<div class="blog-item-tags">${p.tags.map(t => `<span class="proj-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
            </div>
          </a>
        `).join('');
      })
      .catch(() => {
        listEl.innerHTML = '<p class="blog-loading">Could not load posts.</p>';
      });
  }

  function highlightCode(container) {
    if (window.hljs) {
      container.querySelectorAll('pre code').forEach(block => window.hljs.highlightElement(block));
    }
  }

  function renderMath(container) {
    if (window.renderMathInElement) {
      window.renderMathInElement(container, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '$', right: '$', display: false }
        ],
        throwOnError: false
      });
    }
  }

  function loadPost(slug) {
    if (!postEl) return;
    postEl.innerHTML = '<p class="blog-loading">Loading…</p>';

    getPosts().then(posts => {
      const meta = posts.find(p => p.slug === slug);

      return fetch(POSTS_DIR + slug + '.md').then(r => {
        if (!r.ok) throw new Error('Post not found');
        return r.text();
      }).then(md => {
        const html = window.marked ? window.marked.parse(md) : '<pre>' + escapeHtml(md) + '</pre>';
        const header = meta ? `
          <div class="post-meta">
            <h1>${escapeHtml(meta.title)}</h1>
            <div class="post-date">${fmtDate(meta.date)}</div>
            ${meta.tags && meta.tags.length ? `<div class="blog-item-tags">${meta.tags.map(t => `<span class="proj-tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
          </div>` : '';

        postEl.innerHTML = header + html;
        document.title = (meta ? meta.title : slug) + ' — Ali Ahmadi';

        highlightCode(postEl);
        renderMath(postEl);
      });
    }).catch(() => {
      postEl.innerHTML = '<p class="blog-loading">Post not found.</p><p><a href="#blog">← Back to Blog</a></p>';
    });
  }

  window.BlogApp = { renderList, loadPost };
})();
