// fireworks-ai.js — Fireworks AI Integration for CODEX Agent
import { codexTools } from './codex-tools.js';

export class FireworksAI {
    constructor() {
        this.apiKey = 'fw_nWm5Lhhp8mbShSuFyJwws';
        // Use fast serverless model instead of slow deployment
        this.modelPath = 'accounts/fireworks/models/qwen2p5-coder-32b-instruct';
        this.apiUrl = 'https://api.fireworks.ai/inference/v1/chat/completions';
        this.conversationHistory = [];
        this.isThinking = false;
        this.useMock = true;
        this.tools = codexTools;
        this.toolUseEnabled = true;
    }

    async chat(userMessage, systemPrompt = null, options = {}) {
        if (this.isThinking) {
            throw new Error('Agent is already thinking');
        }

        this.isThinking = true;

        try {
            // Add user message to history
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            const aiResponse = await this.generateResponse(userMessage, systemPrompt);

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            await this.streamResponse(aiResponse, options.onToken);

            return aiResponse;
        } catch (error) {
            console.error('CODEX error:', error);
            throw error;
        } finally {
            this.isThinking = false;
        }
    }

    async generateResponse(message, systemPrompt = null) {
        if (!this.useMock) {
            try {
                return await this.queryProxy(message, systemPrompt);
            } catch (error) {
                console.warn('CODEX proxy unavailable, using local fallback:', error);
            }
        }

        try {
            return await this.queryProxy(message, systemPrompt);
        } catch (_) {
            return this.generateSmartResponse(message);
        }
    }

    // Bridge-aware endpoint resolution
    // /api/bridge endpoints use { action: "ai", messages } payload
    // local proxy uses plain Fireworks body
    isBridgeEndpoint(endpoint) {
        return endpoint && (
            endpoint.includes('/api/bridge') ||
            endpoint.includes('collectivekitty.com')
        );
    }

    async queryProxy(message, systemPrompt = null) {
        const endpoints = this.getCandidateEndpoints();
        const messages = [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...this.conversationHistory,
            { role: 'user', content: message }
        ];

        let lastError = null;
        for (const endpoint of endpoints) {
            try {
                // Bridge endpoint uses action wrapper; local proxy uses plain body
                const body = this.isBridgeEndpoint(endpoint)
                    ? { action: 'ai', messages, temperature: 0.3, max_tokens: 1200 }
                    : { messages, temperature: 0.3, max_tokens: 1200 };

                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                    signal: AbortSignal.timeout(15000),
                });
                if (!response.ok) {
                    lastError = new Error(`AI proxy ${endpoint} returned ${response.status}`);
                    continue;
                }
                const data = await response.json();
                const content = data?.choices?.[0]?.message?.content || data?.content || data?.response;
                if (content) return content;
            } catch (error) {
                lastError = error;
            }
        }

        throw lastError || new Error('No AI proxy endpoints available');
    }

    getCandidateEndpoints() {
        const endpoints = [
            window.S_AUTOCODE_CONFIG?.aiEndpoint,
            localStorage.getItem('s_autocode_ai_endpoint'),
            // Bridge endpoint first (collectivekitty.com Cloudflare Worker)
            'https://collectivekitty.com/api/bridge',
            // Local proxy fallback
            'http://localhost:8765',
        ].filter(Boolean);

        return [...new Set(endpoints)];
    }

    async streamResponse(text, onToken) {
        if (!onToken) return;

        const chunks = text.split(/(\s+)/);
        for (const chunk of chunks) {
            if (!chunk) continue;
            onToken(chunk);
            await new Promise((resolve) => setTimeout(resolve, Math.min(25, Math.max(8, chunk.length * 2))));
        }
    }

    async generateSmartResponse(message) {
        const lower = message.toLowerCase();
        
        // Tool use detection
        if (this.toolUseEnabled && this.detectToolUse(lower)) {
            return await this.handleToolUse(message, lower);
        }
        
        // Code generation requests
        if (lower.includes('write') || lower.includes('create') || lower.includes('generate')) {
            if (lower.includes('python')) return this.pythonCodeResponse(message);
            if (lower.includes('javascript') || lower.includes('js')) return this.jsCodeResponse(message);
            if (lower.includes('rust')) return this.rustCodeResponse(message);
            return 'I can help you write code. Name the language and the program, then tell me whether to create a new file, update the current file, or run it.';
        }
        
        // Debugging
        if (lower.includes('debug') || lower.includes('fix') || lower.includes('error')) {
            return 'Share your code and the error message. I\'ll help you debug it step by step.';
        }
        
        // Explanations
        if (lower.includes('explain') || lower.includes('how') || lower.includes('what')) {
            if (lower.includes('subleq')) return 'SUBLEQ is a one-instruction computer: SUbtract and Branch if Less than or EQual to zero. It\'s Turing-complete despite having only one instruction!';
            if (lower.includes('worm')) return 'WORM (Write Once Read Many) is our immutable blockchain. Every computation is sealed with SHA-256 and can never be altered.';
            return 'I can explain any programming concept. What would you like to understand?';
        }
        
        // Default helpful response
        return `I'm CODEX. I can create files, stream code into the editor, explain changes, and run the current file when a runtime exists.

Try:
- "create app.py that prints fibonacci numbers"
- "open editor main.js and build a todo app"
- "run current file"
- "explain this code and lower it to S-expressions"`;
    }

    detectToolUse(lower) {
        const toolKeywords = [
            'run', 'execute', 'command', 'bash', 'git', 'npm',
            'read file', 'write file', 'create file', 'list files',
            'search', 'find', 'grep', 'analyze',
            'open editor', 'open browser', 'navigate', 'go to', 'show'
        ];
        return toolKeywords.some(keyword => lower.includes(keyword));
    }

    async handleToolUse(message, lower) {
        // Open Editor and Write Code
        if (lower.includes('open editor') || lower.includes('edit file') || lower.includes('create file') || lower.includes('new file')) {
            const file = message.match(/(?:open editor|edit file|edit|create file|new file)\s+(\S+)/i)?.[1] || 'untitled.js';
            
            // Check if they want to write code too
            if (lower.includes('write') || lower.includes('create') || lower.includes('generate')) {
                // Generate the code first
                const code = this.generateCodeForIntent(message, file);
                
                const result = await this.tools.openEditor(file, '');
                
                // Schedule typing animation to run AFTER response is shown
                // Store it so script.js can trigger it
                this.pendingAnimation = () => this.typeCodeInEditor(code);
                
                return `Opened ${file}. I am streaming the file into the editor now.\n\n\`\`\`${this.codeFenceForFile(file)}\n${code}\n\`\`\``;
            }
            
            const result = await this.tools.openEditor(file);
            return `${result.message}. Monaco is ready for edits.`;
        }
        
        // Open Browser/KittyBrowse
        if (lower.includes('open browser') || lower.includes('browse') || lower.includes('open url')) {
            const url = message.match(/(?:open browser|browse|open url)\s+(\S+)/i)?.[1] || 'https://example.com';
            const result = await this.tools.openBrowser(url);
            return `✅ ${result.message}\n\nKittyBrowse sandbox is now showing the page.`;
        }
        
        // Navigate routes
        if (lower.includes('go to') || lower.includes('navigate to') || lower.includes('show')) {
            const routeMatch = message.match(/(?:go to|navigate to|show)\s+(observatory|editor|sandbox|agents|proofs|worm|deploy)/i);
            if (routeMatch) {
                const route = '/' + routeMatch[1].toLowerCase();
                const result = await this.tools.navigateRoute(route);
                return `✅ ${result.message}`;
            }
        }
        
        // Execute command
        if (lower.includes('run ') || lower.includes('execute ')) {
            const command = message.match(/(?:run|execute)\s+(.+)/i)?.[1];
            if (command) {
                const result = await this.tools.executeCommand(command);
                const realBadge = result.real ? 'REAL' : 'SIMULATED';
                return `Command: \`${result.command}\` [${realBadge}]\n\nOutput:\n\`\`\`\n${result.output}\n\`\`\`\n\nExit code: ${result.exitCode}`;
            }
        }

        if (lower.includes('run current file') || lower.includes('build current file') || lower.includes('preview current file')) {
            const command = lower.includes('build') ? 'build' : lower.includes('preview') ? 'preview' : 'run';
            const result = await this.tools.executeCommand(command);
            return `Current file command: \`${command}\`\n\n\`\`\`\n${result.output}\n\`\`\``;
        }
        
        // Git commands
        if (lower.includes('git ')) {
            const gitCmd = message.match(/git\s+.+/i)?.[0];
            if (gitCmd) {
                const result = await this.tools.executeCommand(gitCmd);
                return `**Git command:** \`${gitCmd}\`\n\n\`\`\`\n${result.output}\n\`\`\``;
            }
        }
        
        // List files
        if (lower.includes('list files') || lower.includes('ls') || lower.includes('dir')) {
            const result = await this.tools.listFiles('.');
            return `**Files in current directory:**\n\n${result.files.map(f => `• ${f}`).join('\n')}\n\n**Total:** ${result.count} files`;
        }
        
        // Read file
        if (lower.includes('read ') || lower.includes('show ') || lower.includes('cat ')) {
            const file = message.match(/(?:read|show|cat)\s+(\S+)/i)?.[1];
            if (file) {
                const result = await this.tools.readFile(file);
                return `**File:** ${result.path} (${result.lines} lines)\n\n\`\`\`javascript\n${result.content}\n\`\`\``;
            }
        }
        
        // Search files
        if (lower.includes('search') || lower.includes('find') || lower.includes('grep')) {
            const query = message.match(/(?:search|find|grep)\s+(?:for\s+)?['"]?(.+?)['"]?(?:\s+in)?/i)?.[1];
            if (query) {
                const result = await this.tools.searchFiles('.', query);
                return `**Search results for "${query}":**\n\n${result.matches.map(m => `• **${m.file}:${m.line}**\n  \`${m.content}\``).join('\n\n')}`;
            }
        }
        
        // Analyze code
        if (lower.includes('analyze')) {
            return `**Code Analysis Tools Available:**
• Complexity analysis
• Code quality metrics
• Security scanning
• Performance profiling

Ask me to analyze specific code or files!`;
        }
        
        return 'I detected you want to use a tool, but I need more details. Try:\n• "run git status"\n• "list files"\n• "read script.js"\n• "search for fireworks"';
    }

    // Type code into Monaco editor with animation
    async typeCodeInEditor(code, speed = 20) {
        // Wait for Monaco to be ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        if (!window.monacoEditor || !window.monacoEditor.setValue) {
            console.warn('Monaco editor not available for typing animation');
            return;
        }
        
        // Clear editor first
        window.monacoEditor.setValue('');

        // Type character by character
        for (let i = 0; i < code.length; i++) {
            const currentCode = code.substring(0, i + 1);
            window.monacoEditor.setValue(currentCode);
            await new Promise(resolve => setTimeout(resolve, speed));
        }

        const file = this.tools.getCurrentFile?.();
        if (file) {
            await this.tools.writeFile(file, code);
        }
    }

    generateCodeForIntent(message, filename) {
        const lower = message.toLowerCase();
        if (lower.includes('fibonacci')) {
            return this.generateFibonacciCode(filename);
        }
        if (lower.includes('todo')) {
            if (filename.endsWith('.js')) {
                return `const tasks = [];\n\nfunction addTask(title) {\n    tasks.push({ title, done: false });\n}\n\nfunction completeTask(index) {\n    if (tasks[index]) tasks[index].done = true;\n}\n\naddTask("Ship S-AUTOCODE");\ncompleteTask(0);\nconsole.log(tasks);\n`;
            }
            if (filename.endsWith('.py')) {
                return `tasks = []\n\ndef add_task(title):\n    tasks.append({\"title\": title, \"done\": False})\n\ndef complete_task(index):\n    if 0 <= index < len(tasks):\n        tasks[index][\"done\"] = True\n\nadd_task(\"Ship S-AUTOCODE\")\ncomplete_task(0)\nprint(tasks)\n`;
            }
        }
        if (lower.includes('hello') || lower.includes('world')) {
            return this.generateHelloWorld(filename);
        }
        if (filename.endsWith('.html')) {
            return '<!doctype html>\n<html>\n  <body>\n    <main>\n      <h1>S-AUTOCODE App</h1>\n      <p>Generated by CODEX.</p>\n    </main>\n  </body>\n</html>\n';
        }
        if (filename.endsWith('.py')) {
            return 'def main():\n    print("Generated by CODEX")\n\nif __name__ == "__main__":\n    main()\n';
        }
        return `console.log("Generated by CODEX for ${filename}");\n`;
    }

    codeFenceForFile(file) {
        const ext = file.split('.').pop()?.toLowerCase();
        const map = {
            js: 'javascript',
            py: 'python',
            html: 'html',
            ac: 'autocode',
            rs: 'rust'
        };
        return map[ext] || '';
    }

    // Generate fibonacci code
    generateFibonacciCode(filename) {
        const ext = filename.split('.').pop();
        
        if (ext === 'py') {
            return `def fibonacci(n):
    """Calculate nth Fibonacci number recursively"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

def fibonacci_iterative(n):
    """Calculate nth Fibonacci number iteratively (more efficient)"""
    if n <= 1:
        return n
    
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

# Test the functions
if __name__ == "__main__":
    n = 10
    print(f"Fibonacci({n}) recursive: {fibonacci(n)}")
    print(f"Fibonacci({n}) iterative: {fibonacci_iterative(n)}")
`;
        } else if (ext === 'js') {
            return `// Fibonacci function (recursive)
function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

// Fibonacci function (iterative - more efficient)
function fibonacciIterative(n) {
    if (n <= 1) return n;
    
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
}

// Test
console.log('Fibonacci(10) recursive:', fibonacci(10));
console.log('Fibonacci(10) iterative:', fibonacciIterative(10));
`;
        } else {
            return `// Fibonacci in ${ext}\n// Generated by CODEX\n`;
        }
    }

    // Generate hello world code
    generateHelloWorld(filename) {
        const ext = filename.split('.').pop();
        
        if (ext === 'py') {
            return `#!/usr/bin/env python3
"""
Hello World - Generated by CODEX
"""

def main():
    print("Hello, World!")
    print("This code was generated by CODEX AI")

if __name__ == "__main__":
    main()
`;
        } else if (ext === 'js') {
            return `// Hello World - Generated by CODEX

function main() {
    console.log("Hello, World!");
    console.log("This code was generated by CODEX AI");
}

main();
`;
        } else {
            return `// Hello World in ${ext}\n// Generated by CODEX\n`;
        }
    }

    pythonCodeResponse(message) {
        if (message.toLowerCase().includes('fibonacci')) {
            return `Here's a Python fibonacci function:

\`\`\`python
def fibonacci(n):
    """Calculate nth Fibonacci number"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# Or iterative (more efficient):
def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a
\`\`\``;
        }
        return 'I can write Python code for you. What function or program do you need?';
    }

    jsCodeResponse(message) {
        return `Here's a JavaScript example:

\`\`\`javascript
// Modern async/await pattern
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}
\`\`\``;
    }

    rustCodeResponse(message) {
        return `Here's a Rust example:

\`\`\`rust
// Safe, fast, and concurrent
fn factorial(n: u64) -> u64 {
    match n {
        0 | 1 => 1,
        _ => n * factorial(n - 1)
    }
}

// Or iterative:
fn factorial_iter(n: u64) -> u64 {
    (1..=n).product()
}
\`\`\``;
    }

    clearHistory() {
        this.conversationHistory = [];
    }

    getHistory() {
        return [...this.conversationHistory];
    }

    isProcessing() {
        return this.isThinking;
    }
}

// Singleton instance
export const fireworksAI = new FireworksAI();

// Made with Bob
