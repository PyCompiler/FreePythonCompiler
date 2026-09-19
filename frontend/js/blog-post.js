const postContainer = document.getElementById('single-post-container');

// Extract the slug from the URL: /blog/slug-name or /blog-post.html?slug=slug-name
let slug = new URLSearchParams(window.location.search).get('slug');
if (!slug) {
    const pathParts = window.location.pathname.split('/');
    // Check if we are on a clean URL like /blog/my-post
    if (pathParts[pathParts.length - 1] && pathParts[pathParts.length - 1] !== 'blog-post.html') {
        slug = pathParts[pathParts.length - 1];
    }
}

const WP_API_URL = `https://cms.freepythoncompiler.com/wp-json/wp/v2/posts?slug=${slug}&_embed`;

function renderLoader() {
    postContainer.innerHTML = `
        <div class="post-header">
            <div class="skeleton skeleton-title" style="margin: 0 auto 1rem; width: 60%; height: 40px"></div>
            <div class="skeleton skeleton-text" style="margin: 0 auto; width: 30%"></div>
        </div>
        <div class="skeleton skeleton-img post-featured-image"></div>
        <div class="post-content">
            ${Array(8).fill('<div class="skeleton skeleton-text" style="margin-bottom:12px;"></div>').join('')}
            <div class="skeleton skeleton-text" style="width: 70%"></div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

async function loadPost() {
    if (!slug) {
        postContainer.innerHTML = '<h2>Post not found</h2><p>Invalid URL.</p>';
        return;
    }

    renderLoader();

    try {
        const response = await fetch(WP_API_URL);
        const posts = await response.json();

        if (!posts || posts.length === 0) {
            postContainer.innerHTML = `
                <div class="post-header">
                    <h2>Post not found</h2>
                    <p>The article you're looking for doesn't exist or was removed.</p>
                </div>
            `;
            return;
        }

        const post = posts[0];
        const title = post.title.rendered;
        const content = post.content.rendered;
        const date = formatDate(post.date);

        let author = 'FreePythonCompiler Team';
        try { author = post._embedded.author[0].name; } catch (e) { }

        let imgHtml = '';
        try {
            const imgUrl = post._embedded['wp:featuredmedia'][0].source_url;
            imgHtml = `<img src="${imgUrl}" class="post-featured-image" alt="${title}">`;
        } catch (e) { }

        // Calculate estimated read time
        const wordCount = content.replace(/<[^>]+>/g, '').split(' ').length;
        const readTime = Math.max(1, Math.ceil(wordCount / 200));

        postContainer.innerHTML = `
            <div class="post-header">
                <h1 class="post-title">${title}</h1>
                <div class="post-meta">By ${author} • ${date} • ${readTime} min read</div>
            </div>
            ${imgHtml}
            <div class="post-content">
                ${content}
            </div>
        `;

        document.title = `${title} | FreePythonCompiler Blog`;
    } catch (error) {
        console.error('Error fetching post:', error);
        postContainer.innerHTML = '<h2>Error loading article</h2><p>Please try again later.</p>';
    }
}

document.addEventListener('DOMContentLoaded', loadPost);
