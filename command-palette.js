// Command Palette System - Cursor-style Ctrl+K interface
// Fuzzy search, keyboard navigation, command execution

export class CommandPalette {
    constructor() {
        this.commands = new Map();
        this.isOpen = false;
        this.selectedIndex = 0;
        this.filteredCommands = [];
        this.element = null;
        this.inputElement = null;
        this.resultsElement = null;
        this.init();
    }

    init() {
        // Create palette DOM
        this.element = document.createElement('div');
        this.element.className = 'command-palette-overlay';
        this.element.innerHTML = `
            <div class="command-palette">
                <div class="command-palette-header">
                    <span class="command-palette-icon">⌘</span>
                    <input type="text" class="command-palette-input" placeholder="Type a command or search..." autocomplete="off" spellcheck="false">
                    <span class="command-palette-hint">ESC to close</span>
                </div>
                <div class="command-palette-results"></div>
                <div class="command-palette-footer">
                    <span class="command-palette-tip">
                        <kbd>↑</kbd><kbd>↓</kbd> navigate • <kbd>Enter</kbd> execute • <kbd>ESC</kbd> close
                    </span>
                </div>
            </div>
        `;
        document.body.appendChild(this.element);

        this.inputElement = this.element.querySelector('.command-palette-input');
        this.resultsElement = this.element.querySelector('.command-palette-results');

        this.setupEventListeners();
        this.registerDefaultCommands();
    }

    setupEventListeners() {
        // Global keyboard shortcut (Ctrl+K or Cmd+K)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.toggle();
            }
        });

        // Close on overlay click
        this.element.addEventListener('click', (e) => {
            if (e.target === this.element) {
                this.close();
            }
        });

        // Input handling
        this.inputElement.addEventListener('input', (e) => {
            this.filter(e.target.value);
        });

        this.inputElement.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Escape':
                    e.preventDefault();
                    this.close();
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    this.selectNext();
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.selectPrevious();
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.executeSelected();
                    break;
            }
        });
    }

    registerDefaultCommands() {
        // File commands
        this.register({
            id: 'file.new',
            label: 'File: New File',
            category: 'File',
            icon: '📄',
            keybinding: 'Ctrl+N',
            action: () => this.emit('file:new')
        });

        this.register({
            id: 'file.open',
            label: 'File: Open File',
            category: 'File',
            icon: '📂',
            keybinding: 'Ctrl+O',
            action: () => this.emit('file:open')
        });

        this.register({
            id: 'file.save',
            label: 'File: Save',
            category: 'File',
            icon: '💾',
            keybinding: 'Ctrl+S',
            action: () => this.emit('file:save')
        });

        // Editor commands
        this.register({
            id: 'editor.format',
            label: 'Editor: Format Document',
            category: 'Editor',
            icon: '✨',
            keybinding: 'Shift+Alt+F',
            action: () => this.emit('editor:format')
        });

        this.register({
            id: 'editor.find',
            label: 'Editor: Find',
            category: 'Editor',
            icon: '🔍',
            keybinding: 'Ctrl+F',
            action: () => this.emit('editor:find')
        });

        this.register({
            id: 'editor.replace',
            label: 'Editor: Replace',
            category: 'Editor',
            icon: '🔄',
            keybinding: 'Ctrl+H',
            action: () => this.emit('editor:replace')
        });

        // View commands
        this.register({
            id: 'view.terminal',
            label: 'View: Toggle Terminal',
            category: 'View',
            icon: '⌨️',
            keybinding: 'Ctrl+`',
            action: () => this.emit('view:terminal')
        });

        this.register({
            id: 'view.sidebar',
            label: 'View: Toggle Sidebar',
            category: 'View',
            icon: '📁',
            keybinding: 'Ctrl+B',
            action: () => this.emit('view:sidebar')
        });

        this.register({
            id: 'view.fullscreen',
            label: 'View: Toggle Fullscreen',
            category: 'View',
            icon: '⛶',
            keybinding: 'F11',
            action: () => this.emit('view:fullscreen')
        });

        // Agent commands
        this.register({
            id: 'agent.forge',
            label: 'Agent: Talk to FORGE',
            category: 'Agents',
            icon: '🔨',
            action: () => this.emit('agent:select', 'forge')
        });

        this.register({
            id: 'agent.sentinel',
            label: 'Agent: Talk to SENTINEL',
            category: 'Agents',
            icon: '🛡️',
            action: () => this.emit('agent:select', 'sentinel')
        });

        this.register({
            id: 'agent.oracle',
            label: 'Agent: Talk to ORACLE',
            category: 'Agents',
            icon: '🔮',
            action: () => this.emit('agent:select', 'oracle')
        });

        // WASM commands
        this.register({
            id: 'wasm.compile',
            label: 'WASM: Compile Current File',
            category: 'WASM',
            icon: '⚙️',
            keybinding: 'Ctrl+Shift+B',
            action: () => this.emit('wasm:compile')
        });

        this.register({
            id: 'wasm.run',
            label: 'WASM: Run Program',
            category: 'WASM',
            icon: '▶️',
            keybinding: 'Ctrl+Shift+R',
            action: () => this.emit('wasm:run')
        });

        // Settings
        this.register({
            id: 'settings.open',
            label: 'Settings: Open Settings',
            category: 'Settings',
            icon: '⚙️',
            keybinding: 'Ctrl+,',
            action: () => this.emit('settings:open')
        });

        this.register({
            id: 'settings.theme',
            label: 'Settings: Change Theme',
            category: 'Settings',
            icon: '🎨',
            action: () => this.emit('settings:theme')
        });
    }

    register(command) {
        this.commands.set(command.id, command);
    }

    unregister(id) {
        this.commands.delete(id);
    }

    filter(query) {
        if (!query.trim()) {
            this.filteredCommands = Array.from(this.commands.values());
        } else {
            const lowerQuery = query.toLowerCase();
            this.filteredCommands = Array.from(this.commands.values())
                .map(cmd => ({
                    command: cmd,
                    score: this.fuzzyScore(cmd.label.toLowerCase(), lowerQuery)
                }))
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(item => item.command);
        }

        this.selectedIndex = 0;
        this.render();
    }

    fuzzyScore(text, query) {
        let score = 0;
        let textIndex = 0;
        let queryIndex = 0;
        let consecutiveMatches = 0;

        while (textIndex < text.length && queryIndex < query.length) {
            if (text[textIndex] === query[queryIndex]) {
                score += 1 + consecutiveMatches;
                consecutiveMatches++;
                queryIndex++;
            } else {
                consecutiveMatches = 0;
            }
            textIndex++;
        }

        return queryIndex === query.length ? score : 0;
    }

    render() {
        const maxResults = 10;
        const commands = this.filteredCommands.slice(0, maxResults);

        if (commands.length === 0) {
            this.resultsElement.innerHTML = '<div class="command-palette-empty">No commands found</div>';
            return;
        }

        this.resultsElement.innerHTML = commands.map((cmd, index) => `
            <div class="command-palette-item ${index === this.selectedIndex ? 'is-selected' : ''}" data-index="${index}">
                <span class="command-palette-item-icon">${cmd.icon || '•'}</span>
                <div class="command-palette-item-content">
                    <div class="command-palette-item-label">${this.highlightMatch(cmd.label, this.inputElement.value)}</div>
                    <div class="command-palette-item-meta">
                        <span class="command-palette-item-category">${cmd.category}</span>
                        ${cmd.keybinding ? `<span class="command-palette-item-keybinding">${cmd.keybinding}</span>` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Add click handlers
        this.resultsElement.querySelectorAll('.command-palette-item').forEach((el, index) => {
            el.addEventListener('click', () => {
                this.selectedIndex = index;
                this.executeSelected();
            });
        });

        // Scroll selected into view
        const selectedEl = this.resultsElement.querySelector('.is-selected');
        if (selectedEl) {
            selectedEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
        }
    }

    highlightMatch(text, query) {
        if (!query.trim()) return text;

        const lowerText = text.toLowerCase();
        const lowerQuery = query.toLowerCase();
        let result = '';
        let textIndex = 0;
        let queryIndex = 0;

        while (textIndex < text.length) {
            if (queryIndex < lowerQuery.length && lowerText[textIndex] === lowerQuery[queryIndex]) {
                result += `<mark>${text[textIndex]}</mark>`;
                queryIndex++;
            } else {
                result += text[textIndex];
            }
            textIndex++;
        }

        return result;
    }

    selectNext() {
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredCommands.length - 1);
        this.render();
    }

    selectPrevious() {
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.render();
    }

    executeSelected() {
        const command = this.filteredCommands[this.selectedIndex];
        if (command && command.action) {
            command.action();
            this.close();
        }
    }

    open() {
        this.isOpen = true;
        this.element.classList.add('is-open');
        this.inputElement.value = '';
        this.filter('');
        setTimeout(() => this.inputElement.focus(), 50);
    }

    close() {
        this.isOpen = false;
        this.element.classList.remove('is-open');
        this.inputElement.blur();
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    // Event emitter
    emit(event, ...args) {
        const customEvent = new CustomEvent(`command:${event}`, { detail: args });
        document.dispatchEvent(customEvent);
    }

    on(event, handler) {
        document.addEventListener(`command:${event}`, (e) => handler(...e.detail));
    }
}

// Singleton instance
export const commandPalette = new CommandPalette();

// Made with Bob
