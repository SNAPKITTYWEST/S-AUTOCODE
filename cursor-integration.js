// Cursor-Level Integration Script
// Initializes all enhanced features and connects them

import { monacoLoader } from './monaco-loader.js';
import { commandPalette } from './command-palette.js';
import { FileTree } from './file-tree.js';

export class CursorIntegration {
    constructor() {
        this.monaco = null;
        this.editor = null;
        this.fileTree = null;
        this.activeFile = null;
        this.files = new Map();
    }

    async init() {
        console.log('🚀 Initializing Cursor-level enhancements...');
        if (window.codexTools?.fileSystem) {
            window.codexTools.fileSystem.forEach((content, path) => {
                this.files.set(path, content);
            });
        }
        
        // Initialize Monaco Editor
        try {
            this.monaco = await monacoLoader.load();
            console.log('✓ Monaco Editor loaded');
            this.initEditor();
        } catch (error) {
            console.error('✗ Monaco Editor failed to load:', error);
        }

        // Initialize File Tree
        const fileTreeContainer = document.getElementById('editor-files');
        if (fileTreeContainer) {
            this.fileTree = new FileTree(fileTreeContainer);
            this.fileTree.syncFromWorkspace();
            this.fileTree.render();
            this.setupFileTreeHandlers();
            console.log('✓ File Tree initialized');
        }

        // Setup Command Palette handlers
        this.setupCommandHandlers();
        console.log('✓ Command Palette ready');

        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        console.log('✓ Keyboard shortcuts registered');

        // Setup toast notifications
        this.setupToastContainer();
        console.log('✓ Notification system ready');

        // Add smooth transitions to all route changes
        this.enhanceRouteTransitions();
        console.log('✓ Route transitions enhanced');

        console.log('✨ All Cursor-level enhancements loaded!');
    }

    initEditor() {
        const editorContainer = document.getElementById('editor-content');
        if (!editorContainer) return;

        // Clear placeholder
        editorContainer.innerHTML = '';

        // Create Monaco editor
        this.editor = monacoLoader.createEditor(editorContainer, {
            value: '// Welcome to S-AUTOCODE\n// Press Ctrl+K to open command palette\n\n',
            language: 'autocode',
            theme: 's-autocode-dark'
        });
        window.monacoEditor = this.editor;

        // Setup editor event handlers
        this.editor.onDidChangeModelContent(() => {
            if (this.activeFile) {
                this.files.set(this.activeFile, this.editor.getValue());
                if (window.codexTools?.fileSystem) {
                    window.codexTools.fileSystem.set(this.activeFile, this.editor.getValue());
                    window.codexTools.persistWorkspace?.();
                }
            }
        });

        // Add status bar updates
        this.editor.onDidChangeCursorPosition((e) => {
            const posEl = document.getElementById('editor-pos');
            if (posEl) {
                posEl.textContent = `Ln ${e.position.lineNumber}, Col ${e.position.column}`;
            }
        });
    }

    setupFileTreeHandlers() {
        // File selection
        this.fileTree.on('select', (path) => {
            this.openFile(path);
        });

        // File creation
        this.fileTree.on('create', (path) => {
            this.files.set(path, '');
            window.codexTools?.writeFile(path.replace(/^\//, ''), '');
            this.fileTree.syncFromWorkspace();
            this.fileTree.render();
            this.showToast('success', `Created ${path}`);
        });

        // File rename
        this.fileTree.on('rename', (path, newName) => {
            this.showToast('info', `Renamed to ${newName}`);
        });

        // File delete
        this.fileTree.on('delete', (path) => {
            this.files.delete(path);
            if (window.codexTools?.fileSystem) {
                window.codexTools.fileSystem.delete(path.replace(/^\//, ''));
                window.codexTools.persistWorkspace?.();
            }
            if (this.activeFile === path) {
                this.activeFile = null;
                if (this.editor) {
                    this.editor.setValue('');
                }
            }
            this.fileTree.syncFromWorkspace();
            this.fileTree.render();
            this.showToast('info', 'File deleted');
        });

        // File move
        this.fileTree.on('move', (fromPath, toPath) => {
            this.showToast('success', 'File moved');
        });

        // Notifications
        this.fileTree.on('notification', (message) => {
            this.showToast('info', message);
        });
    }

    setupCommandHandlers() {
        // File commands
        commandPalette.on('file:new', () => {
            this.showToast('info', 'New file');
        });

        commandPalette.on('file:open', () => {
            this.showToast('info', 'Open file');
        });

        commandPalette.on('file:save', () => {
            if (this.activeFile && this.editor) {
                this.files.set(this.activeFile, this.editor.getValue());
                this.showToast('success', 'File saved');
            }
        });

        // Editor commands
        commandPalette.on('editor:format', () => {
            if (this.editor) {
                this.editor.getAction('editor.action.formatDocument').run();
                this.showToast('success', 'Document formatted');
            }
        });

        commandPalette.on('editor:find', () => {
            if (this.editor) {
                this.editor.getAction('actions.find').run();
            }
        });

        commandPalette.on('editor:replace', () => {
            if (this.editor) {
                this.editor.getAction('editor.action.startFindReplaceAction').run();
            }
        });

        // View commands
        commandPalette.on('view:terminal', () => {
            this.togglePanel('terminal');
        });

        commandPalette.on('view:sidebar', () => {
            this.togglePanel('sidebar');
        });

        commandPalette.on('view:fullscreen', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
            } else {
                document.exitFullscreen();
            }
        });

        // Agent commands
        commandPalette.on('agent:select', (agent) => {
            const btn = document.querySelector(`[data-agent="${agent}"]`);
            if (btn) btn.click();
            this.showToast('info', `Switched to ${agent.toUpperCase()} agent`);
        });

        // WASM commands
        commandPalette.on('wasm:compile', () => {
            this.showToast('info', 'Compiling...');
        });

        commandPalette.on('wasm:run', () => {
            this.showToast('info', 'Running program...');
        });

        // Settings
        commandPalette.on('settings:open', () => {
            this.showToast('info', 'Settings panel');
        });

        commandPalette.on('settings:theme', () => {
            this.cycleTheme();
        });
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+S - Save
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                if (this.activeFile && this.editor) {
                    this.files.set(this.activeFile, this.editor.getValue());
                    this.showToast('success', 'File saved');
                }
            }

            // Ctrl+N - New file
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.showToast('info', 'New file');
            }

            // Ctrl+B - Toggle sidebar
            if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
                e.preventDefault();
                this.togglePanel('sidebar');
            }

            // Ctrl+` - Toggle terminal
            if ((e.ctrlKey || e.metaKey) && e.key === '`') {
                e.preventDefault();
                this.togglePanel('terminal');
            }

            // F11 - Fullscreen
            if (e.key === 'F11') {
                e.preventDefault();
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
        });
    }

    setupToastContainer() {
        if (!document.querySelector('.toast-container')) {
            const container = document.createElement('div');
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }

    showToast(type, message, duration = 3000) {
        const container = document.querySelector('.toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `${type}-toast`;
        
        const icons = {
            success: '✓',
            error: '⚠',
            info: 'ℹ'
        };

        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || 'ℹ'}</span>
            <span class="toast-message">${message}</span>
            <button class="toast-close">×</button>
        `;

        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    openFile(path) {
        const normalizedPath = path.replace(/^\//, '');
        this.activeFile = normalizedPath;
        
        if (this.editor) {
            const content = this.files.get(normalizedPath) || this.files.get(path) || `// ${normalizedPath}\n\n`;
            this.editor.setValue(content);
            
            // Set language based on file extension
            const ext = normalizedPath.split('.').pop();
            const langMap = {
                'ac': 'autocode',
                'js': 'javascript',
                'json': 'json',
                'md': 'markdown',
                'rs': 'rust'
            };
            const lang = langMap[ext] || 'plaintext';
            this.monaco.editor.setModelLanguage(this.editor.getModel(), lang);
            const langEl = document.getElementById('editor-lang');
            if (langEl) langEl.textContent = lang.toUpperCase();
        }

        const currentFileEl = document.getElementById('editor-current-file');
        if (currentFileEl) currentFileEl.textContent = normalizedPath;
        if (window.codexTools?.setCurrentFile) {
            window.codexTools.setCurrentFile(normalizedPath);
        }

        this.showToast('info', `Opened ${normalizedPath}`);
    }

    togglePanel(panel) {
        const panels = {
            sidebar: document.querySelector('.editor-sidebar'),
            terminal: document.querySelector('.symbolic-terminal')
        };

        const el = panels[panel];
        if (el) {
            el.style.display = el.style.display === 'none' ? '' : 'none';
        }
    }

    cycleTheme() {
        const themes = ['s-autocode-dark', 's-autocode-light'];
        const current = this.editor ? this.monaco.editor.getTheme() : themes[0];
        const next = themes[(themes.indexOf(current) + 1) % themes.length];
        
        if (this.editor) {
            this.monaco.editor.setTheme(next);
        }
        
        this.showToast('info', `Theme: ${next}`);
    }

    enhanceRouteTransitions() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.classList && node.classList.contains('route-view')) {
                        node.classList.add('animate-fade-in');
                    }
                });
            });
        });

        observer.observe(document.getElementById('route-container'), {
            childList: true,
            subtree: true
        });
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.cursorIntegration = new CursorIntegration();
        window.cursorIntegration.init();
    });
} else {
    window.cursorIntegration = new CursorIntegration();
    window.cursorIntegration.init();
}

export default CursorIntegration;

// Made with Bob
