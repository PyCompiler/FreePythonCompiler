/**
 * Share feature — encode/decode VFS sources as a URL param.
 */

export function encodeShare(sources) {
    const json = JSON.stringify(sources);
    return btoa(unescape(encodeURIComponent(json)));
}

export function decodeShare(encoded) {
    try {
        const json = decodeURIComponent(escape(atob(encoded)));
        return JSON.parse(json);
    } catch {
        return null;
    }
}

export function buildShareURL(sources) {
    const encoded = encodeShare(sources);
    const url = new URL(window.location.href);
    url.searchParams.set('share', encoded);
    return url.toString();
}

export function getSharedPayload() {
    const param = new URLSearchParams(window.location.search).get('share');
    if (!param) return null;
    return decodeShare(param);
}
