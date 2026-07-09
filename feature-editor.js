// feature-editor.js — Advanced off-page feature editor
export class FeatureEditor {
    constructor() {
        this.files = new Map();
        this.activeFile = null;
        this.tabs = [];
    }

    createFile(name, content = '') {
        this.files.set(name, { name, content, modified: false });
        return this.files.get(name);
    }

    openFile(name) {
        if (!this.files.has(name)) {
            this.createFile(name);
        }
        this.activeFile = name;
        if (!this.tabs.includes(name)) {
            this.tabs.push(name);
        }
        return this.files.get(name);
    }

    closeFile(name) {
        this.tabs = this.tabs.filter(t => t !== name);
        if (this.activeFile === name) {
            this.activeFile = this.tabs[this.tabs.length - 1] || null;
        }
        return this.activeFile;
    }

    saveFile(name, content) {
        const file = this.files.get(name);
        if (file) {
            file.content = content;
            file.modified = false;
        }
        return file;
    }

    getActiveFile() {
        return this.activeFile ? this.files.get(this.activeFile) : null;
    }

    getTabs() {
        return this.tabs.map(name => ({
            name,
            modified: this.files.get(name)?.modified || false
        }));
    }

    getFileList() {
        return Array.from(this.files.values());
    }

    renderFileList(container) {
        const files = this.getFileList();
        container.innerHTML = files.map(f => `
            <div class="symbol-item${f.name === this.activeFile ? ' is-active' : ''}" data-file="${f.name}">
                <span class="symbol-icon">${f.modified ? '*' : '>'}</span>
                <span class="symbol-name">${f.name}</span>
                <span class="symbol-type">${this.getLang(f.name)}</span>
            </div>
        `).join('');

        container.querySelectorAll('.symbol-item').forEach(item => {
            item.addEventListener('click', () => {
                this.openFile(item.dataset.file);
                this.renderFileList(container);
                this.onFileChange?.(this.getActiveFile());
            });
        });
    }

    renderTabs(container) {
        const tabs = this.getTabs();
        container.innerHTML = tabs.map(t => `
            <div class="editor-tab${t.name === this.activeFile ? ' is-active' : ''}" data-file="${t.name}">
                ${t.name}${t.modified ? ' *' : ''}
            </div>
        `).join('');

        container.querySelectorAll('.editor-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                this.openFile(tab.dataset.file);
                this.renderTabs(container);
                this.onFileChange?.(this.getActiveFile());
            });
        });
    }

    getLang(name) {
        if (name.endsWith('.ac')) return 'S-AUTOCODE';
        if (name.endsWith('.lean')) return 'Lean 4';
        if (name.endsWith('.pl')) return 'Prolog';
        if (name.endsWith('.rs')) return 'Rust';
        if (name.endsWith('.js')) return 'JavaScript';
        return 'Text';
    }
}