interface Item {
  name: string
  description: string
  src: string
}

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (ch) => `&#${ch.charCodeAt(0)};`)

export function galleryPage(version: string, items: Item[]): string {
  const cards = items
    .map(
      (item) => `
      <a class="card" href="${escapeHtml(item.src)}" target="_blank" rel="noopener">
        <img src="${escapeHtml(item.src)}" alt="${escapeHtml(item.name)} template" loading="lazy" width="1200" height="630">
        <div class="meta"><code>${escapeHtml(item.name)}</code><span>${escapeHtml(item.description)}</span></div>
      </a>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>cardshot</title>
<style>
  :root { color-scheme: dark; --bg:#09090b; --fg:#fafafa; --muted:#a1a1aa; --border:#27272a; }
  * { box-sizing: border-box; }
  body { margin:0; background:var(--bg); color:var(--fg); font:16px/1.5 ui-sans-serif, system-ui, sans-serif; }
  main { max-width: 1200px; margin: 0 auto; padding: 56px 24px; }
  h1 { font-size: 40px; letter-spacing: -0.03em; margin: 0 0 8px; }
  p { color: var(--muted); margin: 0 0 40px; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; }
  .grid { display:grid; gap:24px; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); }
  .card { display:block; border:1px solid var(--border); border-radius:16px; overflow:hidden; color:inherit; text-decoration:none; transition: transform .15s, border-color .15s; }
  .card:hover { transform: translateY(-2px); border-color:#3f3f46; }
  .card img { display:block; width:100%; height:auto; aspect-ratio:1200/630; background:#18181b; }
  .meta { display:flex; flex-direction:column; gap:4px; padding:14px 16px; }
  .meta span { color: var(--muted); font-size: 14px; }
</style>
</head>
<body>
<main>
  <h1>cardshot</h1>
  <p>v${escapeHtml(version)} · <code>GET /og</code> for social cards, <code>GET /shot</code> for screenshots, <code>GET /templates</code> for the list.</p>
  <div class="grid">${cards}</div>
</main>
</body>
</html>`
}
