import { snippets } from '../data/snippets-data.js';

export class SnippetsPanel {
    constructor(editorManager, langSelectorId) {
        this.editorManager = editorManager;
        this.langSelector = document.getElementById(langSelectorId);
        this.panel = null;
        this.btn = document.getElementById('btn-snippets');
        this.visible = false;

        this.build();
    }

    build() {
        if (!this.btn) return;

        // Create the floating panel
        this.panel = document.createElement('div');
        this.panel.id = 'snippets-panel';
        this.panel.className = 'snippets-panel hidden';
        document.body.appendChild(this.panel);

        this.btn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (!this.panel.contains(e.target) && e.target !== this.btn) {
                this.hide();
            }
        });
    }

    toggle() {
        this.visible ? this.hide() : this.show();
    }

    show() {
        const lang = this.langSelector?.value === 'python' ? 'python' : 'web';
        const list = snippets[lang] || [];

        this.panel.innerHTML = `
            <div class="snippets-header">Snippets — ${lang === 'python' ? 'Python' : 'Web'}</div>
            <ul class="snippets-list">
                ${list.map((s, i) => `
                    <li class="snippet-item" data-index="${i}">
                        <span class="snippet-label">${s.label}</span>
                        <span class="snippet-desc">${s.description}</span>
                    </li>`
        ).join('')}
            </ul>`;

        this.panel.querySelectorAll('.snippet-item').forEach((el) => {
            el.addEventListener('click', () => {
                const idx = parseInt(el.dataset.index);
                this.insertSnippet(list[idx].code);
                this.hide();
            });
        });

        // Position relative to the button
        const btnRect = this.btn.getBoundingClientRect();
        this.panel.style.top = `${btnRect.bottom + 6}px`;
        this.panel.style.right = `${window.innerWidth - btnRect.right}px`;
        this.panel.classList.remove('hidden');
        this.btn.classList.add('btn-active');
        this.visible = true;
    }

    hide() {
        this.panel.classList.add('hidden');
        this.btn?.classList.remove('btn-active');
        this.visible = false;
    }

    insertSnippet(code) {
        const editor = this.editorManager.editor;
        if (!editor) return;
        const selection = editor.getSelection();
        editor.executeEdits('snippet', [{
            range: selection,
            text: code,
            forceMoveMarkers: true,
        }]);
        editor.focus();
    }
}
