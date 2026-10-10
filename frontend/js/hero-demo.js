/**
 * Hero Interactive IDE Mockup Handler
 * Powers the interactive live preview widget on the homepage
 */
document.addEventListener('DOMContentLoaded', () => {
    const pythonTab = document.getElementById('hero-tab-py');
    const webTab = document.getElementById('hero-tab-web');
    const codePanel = document.getElementById('hero-code-content');
    const consoleOut = document.getElementById('hero-console-text');
    const runBtn = document.getElementById('hero-mock-run');
    const perfChip = document.getElementById('hero-perf-stat');

    if (!pythonTab || !webTab || !codePanel || !consoleOut || !runBtn) return;

    let currentMode = 'python';

    const snippets = {
        python: {
            code: `<div class="code-line"><span class="line-no">1</span><span><span class="token-comment"># Instant Python 3.12 WebAssembly Execution</span></span></div>
<div class="code-line"><span class="line-no">2</span><span><span class="token-kw">import</span> <span class="token-fn">math</span></span></div>
<div class="code-line"><span class="line-no">3</span><span></span></div>
<div class="code-line"><span class="line-no">4</span><span><span class="token-kw">def</span> <span class="token-fn">calculate_primes</span>(limit):</span></div>
<div class="code-line"><span class="line-no">5</span><span>    <span class="token-kw">return</span> [x <span class="token-kw">for</span> x <span class="token-kw">in</span> range(2, limit) <span class="token-kw">if</span> all(x % d != 0 <span class="token-kw">for</span> d <span class="token-kw">in</span> range(2, int(math.isqrt(x)) + 1))]</span></div>
<div class="code-line"><span class="line-no">6</span><span></span></div>
<div class="code-line"><span class="line-no">7</span><span>result = calculate_primes(25)</span></div>
<div class="code-line"><span class="line-no">8</span><span><span class="token-fn">print</span>(<span class="token-str">f"✨ Primes found: {result}"</span>)</span></div>`,
            output: `⚡ Initializing Pyodide WASM runtime... Done (0ms server latency)
✨ Primes found: [2, 3, 5, 7, 11, 13, 17, 19, 23]
Process finished with exit code 0`,
            perf: '0.04s'
        },
        web: {
            code: `<div class="code-line"><span class="line-no">1</span><span><span class="token-comment">&lt;!-- Live Sandboxed Web Playground --&gt;</span></span></div>
<div class="code-line"><span class="line-no">2</span><span>&lt;<span class="token-kw">div</span> <span class="token-fn">class</span>=<span class="token-str">"canvas-container"</span>&gt;</span></div>
<div class="code-line"><span class="line-no">3</span><span>  &lt;<span class="token-kw">h2</span>&gt;🚀 Hello Modern Web!&lt;/<span class="token-kw">h2</span>&gt;</span></div>
<div class="code-line"><span class="line-no">4</span><span>  &lt;<span class="token-kw">p</span>&gt;Isolated Null-Origin Security Sandbox&lt;/<span class="token-kw">p</span>&gt;</span></div>
<div class="code-line"><span class="line-no">5</span><span>&lt;/<span class="token-kw">div</span>&gt;</span></div>
<div class="code-line"><span class="line-no">6</span><span></span></div>
<div class="code-line"><span class="line-no">7</span><span>&lt;<span class="token-kw">script</span>&gt;</span></div>
<div class="code-line"><span class="line-no">8</span><span>  <span class="token-fn">console</span>.log(<span class="token-str">"DOM Rendered instantaneously via iframe bridge"</span>);</span></div>
<div class="code-line"><span class="line-no">9</span><span>&lt;/<span class="token-kw">script</span>&gt;</span></div>`,
            output: `[Iframe Bridge] Sandboxed iframe loaded with null-origin.
[Console] DOM Rendered instantaneously via iframe bridge
Status: 200 OK • Live Reload Ready`,
            perf: '0.01s'
        }
    };

    function renderMode(mode) {
        currentMode = mode;
        if (mode === 'python') {
            pythonTab.classList.add('active');
            webTab.classList.remove('active');
        } else {
            webTab.classList.add('active');
            pythonTab.classList.remove('active');
        }
        codePanel.innerHTML = snippets[mode].code;
        consoleOut.textContent = snippets[mode].output;
        if (perfChip) perfChip.textContent = snippets[mode].perf;
    }

    pythonTab.addEventListener('click', () => renderMode('python'));
    webTab.addEventListener('click', () => renderMode('web'));

    runBtn.addEventListener('click', () => {
        runBtn.innerHTML = `<span>⚡</span> Running...`;
        consoleOut.textContent = `Compiling code in browser memory...`;
        
        setTimeout(() => {
            renderMode(currentMode);
            runBtn.innerHTML = `<span>▶</span> Run Code`;
        }, 350);
    });
});
