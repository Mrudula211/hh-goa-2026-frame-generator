// Vercel serverless function — receives the generated PNG as a base64 data URL
// and re-uploads it to catbox.moe (free, anonymous, no API key) so we get back
// a real public image URL. Needed because a static site has nowhere else to
// host the image, and X's share intent can only auto-attach/preview an image
// if it's reachable at a URL.
module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const { image } = req.body || {};
    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      res.status(400).json({ error: "Missing or invalid image data URL" });
      return;
    }

    const commaIndex = image.indexOf(",");
    const base64 = image.slice(commaIndex + 1);
    const buffer = Buffer.from(base64, "base64");

    if (buffer.length > 8 * 1024 * 1024) {
      res.status(413).json({ error: "Image too large" });
      return;
    }

    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", new Blob([buffer], { type: "image/png" }), "hh-goa-2026.png");

    const upstream = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: form,
    });
    const text = (await upstream.text()).trim();

    if (!upstream.ok || !/^https?:\/\//.test(text)) {
      res.status(502).json({ error: "Upload host rejected the image", detail: text.slice(0, 300) });
      return;
    }

    res.status(200).json({ url: text });
  } catch (err) {
    res.status(500).json({ error: "Server error", detail: String(err && err.message || err) });
  }
};
