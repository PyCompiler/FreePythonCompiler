const WP_API_URL = 'https://cms.freepythoncompiler.com/wp-json/wp/v2/posts?_embed&per_page=9';
const blogGrid = document.getElementById('blog-grid');
const CACHE_KEY = 'fpc_blog_posts_cache';

function renderSkeletons() {
    blogGrid.innerHTML = Array(6).fill(`
        <div class="blog-card">
            <div class="skeleton-img skeleton"></div>
            <div class="blog-card-content">
                <div class="skeleton-text skeleton" style="width:30%"></div>
                <div class="skeleton-title skeleton"></div>
                <div class="skeleton-text skeleton" style="margin-top: 1rem"></div>
                <div class="skeleton-text skeleton"></div>
                <div class="skeleton-text skeleton" style="width:70%"></div>
            </div>
        </div>
    `).join('');
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function renderPosts(posts) {
    if (!posts || posts.length === 0) {
        blogGrid.innerHTML = '<p class="text-muted" style="text-align:center; padding: 2rem;">No posts found. Publish something on WordPress!</p>';
        return;
    }

    blogGrid.innerHTML = posts.map(post => {
        const title = post.title.rendered;
        const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 120) + '...';
        const date = formatDate(post.date);
        const slug = post.slug;

        let imgUrl = '';
        try {
            imgUrl = post._embedded['wp:featuredmedia'][0].source_url;
        } catch (e) {
            imgUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzY2NiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tcGlsZXJJREU8L3RleHQ+PC9zdmc+';
        }

        return `
            <a href="/blog/${slug}" class="blog-card">
                <img class="blog-card-image" src="${imgUrl}" alt="${title}" loading="lazy">
                <div class="blog-card-content">
                    <div class="blog-card-date">${date}</div>
                    <h3 class="blog-card-title">${title}</h3>
                    <div class="blog-card-excerpt">${excerpt}</div>
                    <span class="blog-card-link">Read More &rarr;</span>
                </div>
            </a>
        `;
    }).join('');
}

let cachedPostsJson = null;

async function fetchPosts(isBackgroundRevalidation = false) {
    // SWR (Stale-While-Revalidate): Render cached posts immediately if available
    let hasRenderedCache = false;
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
            cachedPostsJson = cached;
            const cachedPosts = JSON.parse(cached);
            if (!isBackgroundRevalidation) {
                renderPosts(cachedPosts);
            }
            hasRenderedCache = true;
        }
    } catch (e) {
        console.warn('Failed to read blog cache:', e);
    }

    if (!hasRenderedCache && !isBackgroundRevalidation) {
        renderSkeletons();
    }

    // Always fetch fresh posts in the background (Live Invalidation without Netlify build)
    try {
        const cacheBusterUrl = `${WP_API_URL}&_cb=${Date.now()}`;
        const response = await fetch(cacheBusterUrl);

        if (!response.ok) throw new Error('Failed to fetch posts');
        const freshPosts = await response.json();
        const freshPostsJson = JSON.stringify(freshPosts);

        // Only update DOM if posts actually changed or if we haven't rendered yet
        if (freshPostsJson !== cachedPostsJson || !hasRenderedCache) {
            cachedPostsJson = freshPostsJson;
            renderPosts(freshPosts);
            try {
                localStorage.setItem(CACHE_KEY, freshPostsJson);
            } catch (e) { }
        }
    } catch (error) {
        console.error('Error loading fresh blog posts:', error);
        if (!hasRenderedCache) {
            blogGrid.innerHTML = '<p class="text-error" style="color:var(--text-muted); text-align:center; padding: 2rem;">Unable to load blog posts at this moment. Please check back shortly.</p>';
        }
    }
}

document.addEventListener('DOMContentLoaded', () => fetchPosts(false));

// Revalidate on tab focus (e.g., when returning after publishing in WordPress admin)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        fetchPosts(true);
    }
});
