const WP_API_URL = 'https://cms.freepythoncompiler.com/wp-json/wp/v2/posts?_embed&per_page=9';
const blogGrid = document.getElementById('blog-grid');

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

async function fetchPosts() {
    renderSkeletons();

    try {
        const response = await fetch(WP_API_URL);
        if (!response.ok) throw new Error('Failed to fetch posts');

        const posts = await response.json();

        if (posts.length === 0) {
            blogGrid.innerHTML = '<p class="text-muted">No posts found. Publish something on WordPress!</p>';
            return;
        }

        blogGrid.innerHTML = posts.map(post => {
            const title = post.title.rendered;
            const excerpt = post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 120) + '...';
            const date = formatDate(post.date);
            const slug = post.slug;

            // Extract featured image from _embedded
            let imgUrl = '';
            try {
                imgUrl = post._embedded['wp:featuredmedia'][0].source_url;
            } catch (e) {
                // Default placeholder
                imgUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1zaXplPSIyMCIgZmlsbD0iIzY2NiIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Q29tcGlsZXJJREU8L3RleHQ+PC9zdmc+';
            }

            return `
                <div class="blog-card">
                    <img class="blog-card-image" src="${imgUrl}" alt="${title}">
                    <div class="blog-card-content">
                        <div class="blog-card-date">${date}</div>
                        <h3 class="blog-card-title">${title}</h3>
                        <div class="blog-card-excerpt">${excerpt}</div>
                        <a href="/blog/${slug}" class="blog-card-link">Read More &rarr;</a>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Error loading blog:', error);
        blogGrid.innerHTML = '<p class="text-error" style="color:red">Oops, unable to load blog posts. Ensure your WordPress REST API is accessible.</p>';
    }
}

document.addEventListener('DOMContentLoaded', fetchPosts);
