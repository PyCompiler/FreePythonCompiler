/**
 * StatusBar — manages the IDE status bar at the bottom.
 * Shows: cursor position, language, and runtime state.
 */
export class StatusBar {
    constructor(barId) {
        this.bar = document.getElementById(barId);
        this.langEl = this.bar?.querySelector('#status-lang');
        this.posEl = this.bar?.querySelector('#status-pos');
        this.stateEl = this.bar?.querySelector('#status-state');
        this.dotEl = this.bar?.querySelector('#status-dot');
    }

    bind(editor, monaco) {
        if (!editor || !this.bar) return;

        // Update line/col on cursor move
        editor.onDidChangeCursorPosition((e) => {
            const { lineNumber, column } = e.position;
            if (this.posEl) this.posEl.textContent = `Ln ${lineNumber}, Col ${column}`;
        });

        // Update language on model change
        editor.onDidChangeModel(() => {
            const lang = editor.getModel()?.getLanguageId() || '';
            if (this.langEl) this.langEl.textContent = lang;
        });
    }

    setState(state) {
        if (!this.stateEl || !this.dotEl) return;
        const states = {
            loading: { label: 'Loading Pyodide…', color: '#D97706' },
            ready: { label: 'Ready', color: '#16A34A' },
            running: { label: 'Running…', color: '#2563EB' },
            error: { label: 'Error', color: '#DC2626' },
            idle: { label: 'Ready', color: '#16A34A' },
        };
        const s = states[state] || states.idle;
        this.stateEl.textContent = s.label;
        this.dotEl.style.background = s.color;
    }

    setLanguage(lang) {
        if (this.langEl) this.langEl.textContent = lang;
    }
}
