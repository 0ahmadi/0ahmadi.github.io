(function () {
  const tabs   = document.querySelectorAll('.nav-links a[data-tab]');
  const panels = document.querySelectorAll('main section[id]');
  const validIds = Array.from(panels).map(p => p.id);

  function activate(tabId) {
    // the "post" panel (single blog post) has no nav link of its own —
    // it should keep the "Blog" tab highlighted in the nav.
    const navId = tabId === 'post' ? 'blog' : tabId;
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === navId));
    panels.forEach(p => p.classList.toggle('active', p.id === tabId));
  }

  function route() {
    const raw = location.hash.replace('#', '');
    const [tabId, slug] = raw.split('/');

    if (tabId === 'blog' && slug) {
      activate('post');
      if (window.BlogApp) window.BlogApp.loadPost(decodeURIComponent(slug));
      return;
    }

    if (validIds.includes(tabId) && tabId !== 'post') {
      activate(tabId);
      if (tabId === 'blog' && window.BlogApp) window.BlogApp.renderList();
      return;
    }

    activate('home');
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', e => {
      e.preventDefault();
      location.hash = tab.dataset.tab;
    });
  });

  const brand = document.querySelector('[data-tab-brand]');
  if (brand) brand.addEventListener('click', e => { e.preventDefault(); location.hash = 'home'; });

  window.addEventListener('hashchange', route);
  route();
})();
