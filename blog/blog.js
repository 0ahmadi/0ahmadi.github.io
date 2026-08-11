function parseFrontMatter(raw) {
  const match = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/.exec(raw);
  if (!match) return { meta: {}, body: raw };

  const meta = {};
  match[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    if (val.startsWith('[') && val.endsWith(']')) {
      val = val.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    } else {
      val = val.replace(/^["']|["']$/g, '');
    }
    meta[key] = val;
  });
  return { meta, body: match[2] };
}

// --- Protect math from Markdown before parsing, restore with KaTeX after ---
function extractMath(md) {
  const store = [];
  md = md.replace(/\$\$([\s\S]+?)\$\$/g, (_, expr) => {
    store.push({ expr, display: true });
    return `@@MATH${store.length - 1}@@`;
  });
  md = md.replace(/\$([^\$\n]+?)\$/g, (_, expr) => {
    store.push({ expr, display: false });
    return `@@MATH${store.length - 1}@@`;
  });
  return { md, store };
}

function restoreMath(html, store) {
  return html.replace(/@@MATH(\d+)@@/g, (_, i) => {
    const { expr, display } = store[i];
    try {
      return katex.renderToString(expr, { throwOnError: false, displayMode: display });
    } catch (e) {
      return `<span style="color:red">[math error]</span>`;
    }
  });
}

// --- Render a markdown string (post body) into an HTML string ---
function renderMarkdown(md) {
  const { md: protectedMd, store } = extractMath(md);
  let html = marked.parse(protectedMd);
  html = restoreMath(html, store);
  return html;
}

// --- Highlight all code blocks inside a container ---
function highlightCodeIn(container) {
  container.querySelectorAll('pre code').forEach(block => {
    hljs.highlightElement(block);
  });
}

// --- Fetch the posts manifest ---
async function fetchPostsManifest() {
  const res = await fetch('https://github.com/0ahmadi/0ahmadi.github.io/blob/main/blog/posts.json');
  if (!res.ok) throw new Error('Could not load posts.json');
  return res.json();
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch (e) {
    return iso;
  }
}
