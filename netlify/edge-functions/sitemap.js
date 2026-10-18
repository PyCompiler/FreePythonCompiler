export default async (request, context) => {
  try {
    const WP_API_URL = "https://cms.freepythoncompiler.com/wp-json/wp/v2/posts?per_page=100&_fields=slug,date,modified";
    
    // Fetch live posts from Headless WordPress with 4s timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(WP_API_URL, {
      signal: controller.signal,
      headers: { "User-Agent": "FreePythonCompiler-Sitemap-Edge/1.0" }
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return context.next();
    }

    const posts = await res.json();

    // 1. Core static pillar pages
    const staticPages = [
      { url: "https://freepythoncompiler.com/", lastmod: "2026-10-18", changefreq: "daily", priority: "1.0" },
      { url: "https://freepythoncompiler.com/python-compiler", lastmod: "2026-10-18", changefreq: "weekly", priority: "0.95" },
      { url: "https://freepythoncompiler.com/html-compiler", lastmod: "2026-10-18", changefreq: "weekly", priority: "0.95" },
      { url: "https://freepythoncompiler.com/thonny-online-compiler", lastmod: "2026-10-18", changefreq: "weekly", priority: "0.90" },
      { url: "https://freepythoncompiler.com/visual-studio-code-online-compiler", lastmod: "2026-10-18", changefreq: "weekly", priority: "0.90" },
      { url: "https://freepythoncompiler.com/ai-code-editor-online", lastmod: "2026-10-18", changefreq: "weekly", priority: "0.90" },
      { url: "https://freepythoncompiler.com/features", lastmod: "2026-10-18", changefreq: "weekly", priority: "0.85" },
      { url: "https://freepythoncompiler.com/blog", lastmod: "2026-10-18", changefreq: "daily", priority: "0.85" },
      { url: "https://freepythoncompiler.com/about", lastmod: "2026-10-18", changefreq: "monthly", priority: "0.70" },
      { url: "https://freepythoncompiler.com/contact", lastmod: "2026-10-18", changefreq: "monthly", priority: "0.70" },
      { url: "https://freepythoncompiler.com/advertise", lastmod: "2026-10-18", changefreq: "monthly", priority: "0.60" },
      { url: "https://freepythoncompiler.com/privacy", lastmod: "2026-10-18", changefreq: "yearly", priority: "0.50" },
      { url: "https://freepythoncompiler.com/terms", lastmod: "2026-10-18", changefreq: "yearly", priority: "0.50" }
    ];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Core pages
    for (const p of staticPages) {
      xml += '  <url>\n';
      xml += `    <loc>${p.url}</loc>\n`;
      xml += `    <lastmod>${p.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${p.changefreq}</changefreq>\n`;
      xml += `    <priority>${p.priority}</priority>\n`;
      xml += '  </url>\n';
    }

    // Dynamic WordPress blog posts
    if (Array.isArray(posts)) {
      for (const post of posts) {
        if (!post.slug) continue;
        const mod = post.modified ? post.modified.split("T")[0] : (post.date ? post.date.split("T")[0] : "2026-10-18");
        xml += '  <url>\n';
        xml += `    <loc>https://freepythoncompiler.com/blog/${post.slug}</loc>\n`;
        xml += `    <lastmod>${mod}</lastmod>\n`;
        xml += '    <changefreq>monthly</changefreq>\n';
        xml += '    <priority>0.80</priority>\n';
        xml += '  </url>\n';
      }
    }

    xml += '</urlset>\n';

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=300, must-revalidate"
      }
    });
  } catch (_e) {
    // If any error occurs or API is unreachable, seamlessly fallback to static sitemap.xml
    return context.next();
  }
};

export const config = {
  path: "/sitemap.xml"
};
