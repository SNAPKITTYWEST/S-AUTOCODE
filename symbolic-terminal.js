// symbolic-terminal.js — Terminal engine with WASM integration
export class SymbolicTerminal {
    constructor(outputEl, inputEl) {
        this.outputEl = outputEl;
        this.inputEl = inputEl;
        this.history = [];
        this.historyIndex = -1;
        this.onCommand = null;
        this.wasmReady = false;
        this.wasmModule = null;
    }

    async initWasm() {
        try {
            const module = await import('./autocode_wasm.js');
            await module.default();
            this.wasmModule = module;
            this.wasmReady = true;
            this.appendLine('output', 'S-AUTOCODE WASM runtime ready.');
        } catch (e) {
            this.appendLine('error', 'WASM not available: ' + e.message);
        }
    }

    bind() {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.inputEl.value.trim();
                if (cmd) {
                    this.history.push(cmd);
                    this.historyIndex = this.history.length;
                    this.appendLine('input', cmd);
                    this.execute(cmd);
                    this.inputEl.value = '';
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputEl.value = this.history[this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputEl.value = this.history[this.historyIndex];
                } else {
                    this.historyIndex = this.history.length;
                    this.inputEl.value = '';
                }
            }
        });
    }

    execute(cmd) {
        if (this.onCommand) {
            this.onCommand(cmd, this);
        }
    }

    appendLine(type, text) {
        const line = document.createElement('div');
        line.className = `terminal-line is-${type}`;
        if (type === 'input') {
            line.innerHTML = `<span class="terminal-prompt">&#x279C;</span><span class="terminal-input">${this.escape(text)}</span>`;
        } else {
            line.innerHTML = `<pre><code>${text}</code></pre>`;
        }
        this.outputEl.appendChild(line);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clear() {
        this.outputEl.innerHTML = '';
    }

    getHistory() {
        return [...this.history];
    }

    replayHistory(commands) {
        commands.forEach(cmd => {
            this.appendLine('input', cmd);
            this.execute(cmd);
        });
    }

    exportSession() {
        return {
            history: this.history,
            timestamp: Date.now()
        };
    }
}