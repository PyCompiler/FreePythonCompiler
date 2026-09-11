import { consoleBridgeScript } from './console-bridge.js';

export class PreviewManager {
    constructor(containerId, onConsoleMessage) {
        this.container = document.getElementById(containerId);
        this.onConsoleMessage = onConsoleMessage;
        this.iframe = null;

        this.setupMessageListener();
    }

    setupMessageListener() {
        window.addEventListener('message', (event) => {
            // Security: check simple source discriminator
            if (event.data && event.data.source === 'compiler-playground') {
                if (this.onConsoleMessage) {
                    this.onConsoleMessage(event.data);
                }
            }
        });
    }

    buildPreview(html, css, js, py) {
        this.container.innerHTML = '';

        this.iframe = document.createElement('iframe');
        this.iframe.className = 'preview-iframe';
        this.iframe.setAttribute('sandbox', 'allow-scripts allow-modals');
        this.container.appendChild(this.iframe);

        // If Python code is present, render a full interactive terminal inside the iframe
        const hasPython = py && py.trim() !== '';

        const terminalStyles = hasPython ? `
            * { margin:0; padding:0; box-sizing:border-box; }
            body { background:#0d1117; color:#e6edf3; font-family:'Courier New',monospace; font-size:14px; height:100vh; display:flex; flex-direction:column; }
            #terminal { flex:1; overflow-y:auto; padding:16px 12px 8px; line-height:1.7; }
            .t-out { color:#e6edf3; white-space:pre-wrap; }
            .t-prompt { color:#4ec9b0; white-space:pre-wrap; }
            .t-err { color:#f85149; white-space:pre-wrap; }
            .t-echo { color:#79c0ff; white-space:pre-wrap; }
            #input-row { display:none; align-items:center; padding:6px 12px 10px; border-top:1px solid #21262d; background:#0d1117; }
            #input-row.active { display:flex; }
            #input-prefix { color:#4ec9b0; margin-right:6px; flex-shrink:0; }
            #user-input { flex:1; background:transparent; border:none; outline:none; color:#79c0ff; font-family:inherit; font-size:14px; caret-color:#58a6ff; }
        ` : css;

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>${terminalStyles}</style>
    <script>${consoleBridgeScript}</script>
    ${hasPython ? `<script src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"></script>` : ''}
</head>
<body>
    ${hasPython ? `
    <div id="terminal"></div>
    <div id="input-row">
        <span id="input-prefix">&gt;&nbsp;</span>
        <input id="user-input" type="text" autocomplete="off" spellcheck="false" />
    </div>

    <script type="text/python" id="py-code">${py}</script>
    <script>
        const term = document.getElementById('terminal');
        const inputRow = document.getElementById('input-row');
        const userInput = document.getElementById('user-input');

        function termPrint(text, cls) {
            const line = document.createElement('div');
            line.className = cls || 't-out';
            line.textContent = text;
            term.appendChild(line);
            term.scrollTop = term.scrollHeight;
            // Also send to parent console
            console.log(text);
        }

        // Async input: shows the inline input bar, waits for Enter key
        function termInput(promptText) {
            return new Promise((resolve) => {
                if (promptText) termPrint(promptText, 't-prompt');
                inputRow.classList.add('active');
                userInput.value = '';
                userInput.focus();
                
                function onEnter(e) {
                    if (e.key === 'Enter') {
                        const val = userInput.value;
                        userInput.removeEventListener('keydown', onEnter);
                        inputRow.classList.remove('active');
                        // Echo what the user typed in blue
                        termPrint(val, 't-echo');
                        resolve(val);
                    }
                }
                userInput.addEventListener('keydown', onEnter);
            });
        }

        async function runPython() {
            try {
                termPrint('Python 3 (Pyodide) — Interactive Terminal', 't-prompt');
                termPrint('', 't-out');
                let pyodide = await loadPyodide();
                
                // Notify parent that Pyodide is ready
                window.parent.postMessage({ source: 'compiler-playground', type: 'pyodide-ready', level: 'info', payload: '' }, '*');
                
                pyodide.setStdout({ batched: (msg) => termPrint(msg, 't-out') });
                pyodide.setStderr({ batched: (msg) => { termPrint(msg, 't-err'); console.error(msg); } });
                
                // Use window.prompt() for input — also echo prompt + value into the terminal
                pyodide.globals.set('input', (promptText) => {
                    if (promptText) termPrint(promptText, 't-prompt');
                    const val = window.prompt(promptText || '');
                    const result = val !== null ? val : '';
                    termPrint('> ' + result, 't-echo');
                    return result;
                });

                const code = document.getElementById('py-code').textContent;
                await pyodide.runPythonAsync(code);
                termPrint('', 't-out');
                termPrint('[Program finished]', 't-prompt');
            } catch(e) {
                termPrint(String(e), 't-err');
                console.error(String(e));
            }
        }
        runPython();
    </script>
    ` : `
    ${html}
    <script type="module">${js || ''}</script>
    `}
</body>
</html>`;

        this.iframe.srcdoc = htmlContent;
    }

    stop() {
        this.container.innerHTML = '';
    }
}

