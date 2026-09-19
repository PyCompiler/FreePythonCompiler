import { VirtualFileSystem } from './editor/file-system.js';
import { SidebarUI } from './ui/sidebar.js';
import { EditorManager } from './editor/editor-manager.js';
import { PreviewManager } from './preview/preview-manager.js';
import { ConsoleUI } from './ui/console.js';
import { downloadSources } from './features/download.js';
import { copyToClipboard } from './features/clipboard.js';
import { showToast } from './ui/toast.js';
import { StatusBar } from './ui/status-bar.js';
import { buildShareURL, getSharedPayload } from './features/share.js';
import { SnippetsPanel } from './ui/snippets.js';

console.log('Compiler IDE initialized.');

document.addEventListener('DOMContentLoaded', async () => {

    const vfs = new VirtualFileSystem();
    const sidebarUI = new SidebarUI(vfs);
    const consoleUI = new ConsoleUI('console-output');
    const statusBar = new StatusBar('status-bar');
    statusBar.setState('loading');

    const previewManager = new PreviewManager('preview-container', (msg) => {
        consoleUI.log(msg);
        if (msg.type === 'pyodide-ready') statusBar.setState('ready');
    });

    const editorManager = new EditorManager('monaco-container', vfs);
    await editorManager.init();
    statusBar.bind(editorManager.editor, editorManager.monaco);
    statusBar.setState('ready');

    // ── F11: Snippets Panel ─────────────────────────────────────────
    const snippetsPanel = new SnippetsPanel(editorManager, 'lang-selector');

    const runBtn = document.getElementById('btn-run');
    const stopBtn = document.getElementById('btn-stop');
    const clearConsoleBtn = document.getElementById('btn-clear-console');

    function runCode() {
        const sources = editorManager.getSources();
        consoleUI.clear();
        statusBar.setState('running');
        previewManager.buildPreview(sources.html, sources.css, sources.javascript, sources.python);
        stopBtn.disabled = false;
        // For web mode, restore ready after render
        if (!sources.python.trim()) setTimeout(() => statusBar.setState('idle'), 500);
    }

    runBtn.addEventListener('click', runCode);

    stopBtn.addEventListener('click', () => {
        previewManager.stop();
        stopBtn.disabled = true;
        statusBar.setState('idle');
    });

    clearConsoleBtn.addEventListener('click', () => {
        consoleUI.clear();
    });

    // ── F1: Keyboard shortcut — Ctrl+Enter to run ──────────────────────────
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });

    // ── F2: Undo / Redo buttons ─────────────────────────────────────────────
    document.getElementById('btn-undo')?.addEventListener('click', () => {
        editorManager.editor?.trigger('toolbar', 'undo', null);
    });

    document.getElementById('btn-redo')?.addEventListener('click', () => {
        editorManager.editor?.trigger('toolbar', 'redo', null);
    });

    // ── Format ────────────────────────────────────────────────────────────
    document.getElementById('btn-format').addEventListener('click', () => {
        editorManager.format();
    });

    document.getElementById('btn-clear').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the active editor?")) {
            editorManager.clear();
        }
    });

    // ── F8: Toast-based copy feedback ─────────────────────────────────────
    document.getElementById('btn-copy').addEventListener('click', async () => {
        const src = editorManager.editor ? editorManager.editor.getValue() : '';
        const success = await copyToClipboard(src);
        showToast(success ? 'Code copied to clipboard' : 'Copy failed', success ? 'success' : 'error');
    });

    document.getElementById('btn-download').addEventListener('click', () => {
        const sources = editorManager.getSources();
        downloadSources(sources);
        showToast('Files downloaded', 'success');
    });

    document.getElementById('btn-refresh-preview').addEventListener('click', runCode);

    let debounceTimer;
    window.addEventListener('keyup', () => {
        const liveToggle = document.getElementById('live-preview-toggle');
        if (liveToggle && liveToggle.checked) {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                runCode();
            }, 1000);
        }
    });

    initResizers();

    const langSelector = document.getElementById('lang-selector');

    // Parse URL path to initialize the correct language workspace
    let initialLang = 'web';
    const currentPath = window.location.pathname;
    if (currentPath.includes('python-compiler')) {
        initialLang = 'python';
    }

    if (langSelector) {
        langSelector.value = initialLang;
    }
    vfs.reset(initialLang);

    // Trigger initial renders
    vfs.notify();
    editorManager.openFile(vfs.activeFile);
    runCode();

    if (langSelector) {
        langSelector.addEventListener('change', (e) => {
            const mode = e.target.value;
            const newSlug = mode === 'python' ? '/python-compiler' : '/html-compiler';
            window.history.pushState({}, '', newSlug);
            vfs.reset(mode);
            editorManager.openFile(vfs.activeFile);
            runCode();
        });
    }

    window.appState = { vfs, editorManager, previewManager, consoleUI, sidebarUI, statusBar };

    // ── F7: Restore shared code from URL ─────────────────────────────────
    const sharedPayload = getSharedPayload();
    if (sharedPayload) {
        // Override VFS with shared content for the active file only
        try {
            Object.entries(sharedPayload).forEach(([path, content]) => {
                vfs.setFileContent(path, content);
            });
            editorManager.openFile(vfs.activeFile);
            runCode();
            showToast('Shared project loaded', 'info');
        } catch (e) { /* ignore malformed share */ }
    }

    // ── F7: Share button ──────────────────────────────────────────────────
    document.getElementById('btn-share')?.addEventListener('click', async () => {
        const sources = editorManager.getSources();
        const url = buildShareURL(sources);
        const ok = await copyToClipboard(url);
        showToast(ok ? 'Share link copied!' : 'Could not copy link', ok ? 'success' : 'error');
    });

    // ── F13: Embed button ─────────────────────────────────────────────────
    document.getElementById('btn-embed')?.addEventListener('click', async () => {
        const sources = editorManager.getSources();
        const url = buildShareURL(sources);
        const embed = `<iframe src="${url}" width="100%" height="500" frameborder="0" allowfullscreen></iframe>`;
        const ok = await copyToClipboard(embed);
        showToast(ok ? 'Embed code copied!' : 'Could not copy', ok ? 'success' : 'error');
    });

    // ── F10: Fullscreen preview ───────────────────────────────────────────
    const fullscreenBtn = document.getElementById('btn-fullscreen');
    const previewEl = document.getElementById('preview-container');

    fullscreenBtn?.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            previewEl?.requestFullscreen().catch(() => showToast('Fullscreen not supported', 'error'));
        } else {
            document.exitFullscreen();
        }
    });

    document.addEventListener('fullscreenchange', () => {
        const svg = fullscreenBtn?.querySelector('svg');
        if (!svg) return;
        if (document.fullscreenElement) {
            svg.innerHTML = '<polyline points="4 14 10 14 10 20"/><polyline points="20 10 14 10 14 4"/><line x1="10" y1="14" x2="3" y2="21"/><line x1="21" y1="3" x2="14" y2="10"/>';
        } else {
            svg.innerHTML = '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>';
        }
    });

    // ── F3: Word Wrap toggle ──────────────────────────────────────────────
    let wordWrap = false;
    document.getElementById('btn-wrap')?.addEventListener('click', (e) => {
        wordWrap = !wordWrap;
        editorManager.editor?.updateOptions({ wordWrap: wordWrap ? 'on' : 'off' });
        e.currentTarget.classList.toggle('btn-active', wordWrap);
        showToast(`Word wrap ${wordWrap ? 'on' : 'off'}`, 'info');
    });

    // ── F4: Font Size control ─────────────────────────────────────────────
    let fontSize = 14;
    document.getElementById('btn-font-inc')?.addEventListener('click', () => {
        fontSize = Math.min(fontSize + 1, 22);
        editorManager.editor?.updateOptions({ fontSize });
    });
    document.getElementById('btn-font-dec')?.addEventListener('click', () => {
        fontSize = Math.max(fontSize - 1, 10);
        editorManager.editor?.updateOptions({ fontSize });
    });

    // Safety: ensure file tree renders after all async init completes
    requestAnimationFrame(() => vfs.notify());
});

function initResizers() {
    const resizerMain = document.getElementById('resizer-main');
    const editorPane = document.getElementById('editor-pane');
    let isResizingH = false;

    const toggleIframes = (pointerEvents) => {
        document.querySelectorAll('iframe').forEach(el => el.style.pointerEvents = pointerEvents);
    };

    if (resizerMain) {
        resizerMain.addEventListener('mousedown', () => {
            isResizingH = true;
            document.body.style.cursor = 'col-resize';
            toggleIframes('none');
        });
    }

    const resizerSidebar = document.getElementById('resizer-sidebar');
    const sidebarPane = document.getElementById('sidebar-pane');
    let isResizingSidebar = false;

    if (resizerSidebar) {
        resizerSidebar.addEventListener('mousedown', () => {
            isResizingSidebar = true;
            document.body.style.cursor = 'col-resize';
            toggleIframes('none');
        });
    }

    const resizerConsole = document.getElementById('resizer-console');
    const previewContainer = document.getElementById('preview-container');
    let isResizingV = false;

    if (resizerConsole) {
        resizerConsole.addEventListener('mousedown', () => {
            isResizingV = true;
            document.body.style.cursor = 'row-resize';
            toggleIframes('none');
        });
    }

    document.addEventListener('mousemove', (e) => {
        if (!isResizingH && !isResizingV && !isResizingSidebar) return;

        if (isResizingH && editorPane) {
            const widthPct = (e.clientX / window.innerWidth) * 100;
            if (widthPct > 10 && widthPct < 85) {
                editorPane.style.flex = `0 0 ${widthPct}%`;
            }
        }

        if (isResizingSidebar && sidebarPane) {
            if (e.clientX > 50 && e.clientX < 500) {
                sidebarPane.style.flex = `0 0 ${e.clientX}px`;
            }
        }

        if (isResizingV && previewContainer) {
            const container = document.getElementById('right-pane').getBoundingClientRect();
            const yPos = e.clientY - container.top;
            const heightPct = (yPos / container.height) * 100;
            if (heightPct > 10 && heightPct < 90) {
                previewContainer.style.flex = `0 0 ${heightPct}%`;
            }
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizingH || isResizingV || isResizingSidebar) {
            isResizingH = false;
            isResizingV = false;
            isResizingSidebar = false;
            document.body.style.cursor = 'default';
            toggleIframes('auto');
            window.dispatchEvent(new Event('resize'));
        }
    });
}
