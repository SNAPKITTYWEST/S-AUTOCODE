// Monaco Editor Loader for S-AUTOCODE
// Loads Monaco from CDN and configures for SUBLEQ/Autocode syntax

export class MonacoLoader {
    constructor() {
        this.loaded = false;
        this.monaco = null;
        this.loadPromise = null;
    }

    async load() {
        if (this.loaded) return this.monaco;
        if (this.loadPromise) return this.loadPromise;

        this.loadPromise = new Promise((resolve, reject) => {
            // Load Monaco from CDN
            require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' } });
            
            require(['vs/editor/editor.main'], () => {
                this.monaco = window.monaco;
                this.registerLanguages();
                this.registerThemes();
                this.loaded = true;
                resolve(this.monaco);
            }, reject);
        });

        return this.loadPromise;
    }

    registerLanguages() {
        // Register S-AUTOCODE language
        this.monaco.languages.register({ id: 'autocode' });
        
        this.monaco.languages.setMonarchTokensProvider('autocode', {
            tokenizer: {
                root: [
                    [/[+\-]/, 'keyword.operator'],
                    [/\d+/, 'number'],
                    [/[a-zA-Z_]\w*/, 'identifier'],
                    [/;.*$/, 'comment'],
                    [/\s+/, 'white']
                ]
            }
        });

        // Register SUBLEQ language
        this.monaco.languages.register({ id: 'subleq' });
        
        this.monaco.languages.setMonarchTokensProvider('subleq', {
            tokenizer: {
                root: [
                    [/SUBLEQ|HALT|JMP/, 'keyword'],
                    [/\d+/, 'number'],
                    [/0x[0-9a-fA-F]+/, 'number.hex'],
                    [/;.*$/, 'comment'],
                    [/\[.*?\]/, 'string'],
                    [/\s+/, 'white']
                ]
            }
        });

        // Configure autocomplete
        this.monaco.languages.registerCompletionItemProvider('autocode', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: '+',
                        kind: this.monaco.languages.CompletionItemKind.Operator,
                        insertText: '+ ${1:addr} ${2:val} ${3:next}',
                        insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Subtract operation'
                    },
                    {
                        label: '-',
                        kind: this.monaco.languages.CompletionItemKind.Operator,
                        insertText: '- ${1:addr} ${2:val} ${3:next}',
                        insertTextRules: this.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Branch on non-positive'
                    }
                ];
                return { suggestions };
            }
        });
    }

    registerThemes() {
        // S-AUTOCODE Dark Theme (Cursor-inspired)
        this.monaco.editor.defineTheme('s-autocode-dark', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'ff7a83', fontStyle: 'bold' },
                { token: 'keyword.operator', foreground: 'ffa657' },
                { token: 'number', foreground: 'd2a8ff' },
                { token: 'number.hex', foreground: '79c0ff' },
                { token: 'string', foreground: 'a5d6ff' },
                { token: 'comment', foreground: '6b7280', fontStyle: 'italic' },
                { token: 'identifier', foreground: 'e8e8e8' }
            ],
            colors: {
                'editor.background': '#0a0a0a',
                'editor.foreground': '#e8e8e8',
                'editor.lineHighlightBackground': '#162028',
                'editor.selectionBackground': '#1a3a5c',
                'editorCursor.foreground': '#5e6ad2',
                'editorLineNumber.foreground': '#6b6b6b',
                'editorLineNumber.activeForeground': '#a0a0a0',
                'editor.inactiveSelectionBackground': '#1a3a5c80',
                'editorIndentGuide.background': '#ffffff08',
                'editorIndentGuide.activeBackground': '#ffffff12',
                'editorWhitespace.foreground': '#ffffff08'
            }
        });

        // S-AUTOCODE Light Theme
        this.monaco.editor.defineTheme('s-autocode-light', {
            base: 'vs',
            inherit: true,
            rules: [
                { token: 'keyword', foreground: 'c7254e', fontStyle: 'bold' },
                { token: 'number', foreground: '0086b3' },
                { token: 'string', foreground: '183691' },
                { token: 'comment', foreground: '969896', fontStyle: 'italic' }
            ],
            colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#24292e'
            }
        });
    }

    createEditor(container, options = {}) {
        if (!this.loaded) {
            throw new Error('Monaco not loaded. Call load() first.');
        }

        const defaultOptions = {
            theme: 's-autocode-dark',
            fontSize: 13,
            fontFamily: "'SF Mono', 'JetBrains Mono', 'Fira Code', monospace",
            fontLigatures: true,
            lineNumbers: 'on',
            minimap: { enabled: true, scale: 1 },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'off',
            renderWhitespace: 'selection',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            mouseWheelZoom: true,
            bracketPairColorization: { enabled: true },
            guides: {
                indentation: true,
                bracketPairs: true
            },
            suggest: {
                showKeywords: true,
                showSnippets: true
            },
            quickSuggestions: {
                other: true,
                comments: false,
                strings: false
            }
        };

        return this.monaco.editor.create(container, { ...defaultOptions, ...options });
    }
}

// Singleton instance
export const monacoLoader = new MonacoLoader();

// Made with Bob
