# Security

## Reporting a vulnerability

Please do not open a public issue. Use [GitHub's private vulnerability reporting](https://github.com/whosdrix/cardshot/security/advisories/new) instead, and you will get a reply within a few days.

## How cardshot protects your server

`/shot` loads arbitrary URLs in a real browser, and templates can load remote images, so the main risk is server-side request forgery (SSRF).

- Target URLs must be `http` or `https`, without credentials.
- Every hostname is resolved before use. Loopback, private, link-local (including cloud metadata at `169.254.169.254`), carrier-grade NAT, multicast and reserved ranges are rejected, for IPv4 and IPv6.
- The same check runs on **every request the page makes**, including redirects, iframes, scripts and images, not just the first URL.
- Remote template images are fetched with redirects followed manually and checked at each hop, a 5 second timeout and a 2 MB limit.
- Service workers and downloads are disabled in the browser.

Known limitation: a hostname is resolved by cardshot and then again by the browser, so a DNS rebinding attack has a small window between the two lookups. If you run cardshot next to sensitive internal services, also restrict its egress at the network level.

`ALLOW_PRIVATE_URLS=true` turns all of this off. Only use it for local development.

## Signed URLs

Set `SIGNING_SECRET` in production. Without it, anyone who can reach your instance can use it to render images and take screenshots.
