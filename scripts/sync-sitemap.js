const fs = require('fs');
const path = require('path');
const https = require('https');

const SITEMAP_PATH = path.join(__dirname, '..', 'frontend', 'sitemap.xml');
const WP_API_URL = 'https://cms.freepythoncompiler.com/wp-json/wp/v2/posts?per_page=100&_fields=slug,date,modified';

// Core static pages with defined SEO priority and change frequency
const staticPages = [
    { url: 'https://freepythoncompiler.com/', lastmod: '2026-10-18', changefreq: 'daily', priority: '1.0' },
    { url: 'https://freepythoncompiler.com/python-compiler', lastmod: '2026-10-18', changefreq: 'weekly', priority: '0.95' },
    { url: 'https://freepythoncompiler.com/html-compiler', lastmod: '2026-10-18', changefreq: 'weekly', priority: '0.95' },
    { url: 'https://freepythoncompiler.com/thonny-online-compiler', lastmod: '2026-10-18', changefreq: 'weekly', priority: '0.90' },
    { url: 'https://freepythoncompiler.com/visual-studio-code-online-compiler', lastmod: '2026-10-18', changefreq: 'weekly', priority: '0.90' },
    { url: 'https://freepythoncompiler.com/ai-code-editor-online', lastmod: '2026-10-18', changefreq: 'weekly', priority: '0.90' },
    { url: 'https://freepythoncompiler.com/features', lastmod: '2026-10-18', changefreq: 'weekly', priority: '0.85' },
    { url: 'https://freepythoncompiler.com/blog', lastmod: '2026-10-18', changefreq: 'daily', priority: '0.85' },
    { url: 'https://freepythoncompiler.com/about', lastmod: '2026-10-18', changefreq: 'monthly', priority: '0.70' },
    { url: 'https://freepythoncompiler.com/contact', lastmod: '2026-10-18', changefreq: 'monthly', priority: '0.70' },
    { url: 'https://freepythoncompiler.com/advertise', lastmod: '2026-10-18', changefreq: 'monthly', priority: '0.60' },
    { url: 'https://freepythoncompiler.com/privacy', lastmod: '2026-10-18', changefreq: 'yearly', priority: '0.50' },
    { url: 'https://freepythoncompiler.com/terms', lastmod: '2026-10-18', changefreq: 'yearly', priority: '0.50' }
];

function fetchPosts() {
    return new Promise((resolve, reject) => {
        https.get(WP_API_URL, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const posts = JSON.parse(data);
                    resolve(posts);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', reject);
    });
}

async function generateSitemap() {
    console.log('Fetching live blog posts from WordPress API...');
    let blogPosts = [];
    try {
        blogPosts = await fetchPosts();
        console.log(`Successfully fetched ${blogPosts.length} posts from CMS.`);
    } catch (e) {
        console.error('Failed to fetch from CMS API, keeping existing sitemap fallback:', e.message);
    }

    const xmlLines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    // 1. Core pages
    staticPages.forEach(p => {
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>${p.url}</loc>`);
        xmlLines.push(`    <lastmod>${p.lastmod}</lastmod>`);
        xmlLines.push(`    <changefreq>${p.changefreq}</changefreq>`);
        xmlLines.push(`    <priority>${p.priority}</priority>`);
        xmlLines.push('  </url>');
    });

    // 2. Blog posts from Headless CMS
    blogPosts.forEach(post => {
        const modDate = post.modified ? post.modified.split('T')[0] : (post.date ? post.date.split('T')[0] : '2026-10-18');
        xmlLines.push('  <url>');
        xmlLines.push(`    <loc>https://freepythoncompiler.com/blog/${post.slug}</loc>`);
        xmlLines.push(`    <lastmod>${modDate}</lastmod>`);
        xmlLines.push('    <changefreq>monthly</changefreq>');
        xmlLines.push('    <priority>0.80</priority>');
        xmlLines.push('  </url>');
    });

    xmlLines.push('</urlset>');
    xmlLines.push('');

    const xmlContent = xmlLines.join('\n');
    fs.writeFileSync(SITEMAP_PATH, xmlContent, 'utf8');
    console.log(`Sitemap written successfully to: ${SITEMAP_PATH}`);
    console.log(`Total URLs in sitemap: ${staticPages.length + blogPosts.length}`);
}

generateSitemap();
