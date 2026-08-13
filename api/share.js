// Vercel serverless function — a per-share landing page with Open Graph /
// Twitter Card meta tags pointing at the generated image. X's crawler reads
// these tags (it doesn't run JS) to build the tweet's link-preview card, so
// pointing the intent's `url` param at this page is how the personalized
// Builder ID/Frame shows up as an image preview on desktop without needing
// the file attached by hand.
const LIVE_SITE = "https://hh-goa-2026-frame-generator-ten.vercel.app/";

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = function handler(req, res) {
  const imgParam = typeof req.query.img === "string" ? req.query.img : "";
  const captionParam = typeof req.query.caption === "string" ? req.query.caption : "";

  const safeImg = /^https:\/\//.test(imgParam) ? imgParam : "";
  const title = "HH Goa 2026 Builder ID";
  const description = (captionParam || "Built my HH Goa 2026 Builder ID — make yours at hh-goa-2026-frame-generator-ten.vercel.app").slice(0, 200);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=3600");
  res.status(200).send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(description)}">
<meta property="og:url" content="${escapeHtml(LIVE_SITE)}">
${safeImg ? `<meta property="og:image" content="${escapeHtml(safeImg)}">\n<meta property="og:image:width" content="1200">` : ""}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(description)}">
${safeImg ? `<meta name="twitter:image" content="${escapeHtml(safeImg)}">` : ""}
<link rel="canonical" href="${escapeHtml(LIVE_SITE)}">
<meta http-equiv="refresh" content="0; url=${escapeHtml(LIVE_SITE)}">
<style>body{font-family:sans-serif;background:#FFFBE8;color:#084E2B;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:24px;text-align:center}img{max-width:min(320px,90vw);border-radius:12px;margin-top:16px}</style>
</head>
<body>
<p>Redirecting to <a href="${escapeHtml(LIVE_SITE)}">HH Goa 2026 Builder ID / Frame Generator</a>…</p>
${safeImg ? `<img src="${escapeHtml(safeImg)}" alt="HH Goa 2026 Builder ID">` : ""}
</body>
</html>`);
};
