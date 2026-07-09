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
        // Use mock responses (CORS blocks direct API calls from browser)
        this.useMock = true;
        this.tools = codexTools;
        this.toolUseEnabled = true;
    }

    async chat(userMessage, systemPrompt = null) {
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

            // Use intelligent mock responses (CORS prevents direct API calls)
            const aiResponse = this.generateSmartResponse(userMessage);

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            return aiResponse;
        } catch (error) {
            console.error('CODEX error:', error);
            throw error;
        } finally {
            this.isThinking = false;
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
            return 'I can help you write code! Specify the language (Python, JavaScript, Rust, etc.) and what you need.';
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
        return `I'm CODEX, your AI coding assistant with tool access! I can:
• Write code in any language
• Execute bash commands (git, npm, etc.)
• Read and write files
• Search and analyze code
• Debug and fix errors
• Explain technical concepts

**Try these commands:**
• "run git status"
• "list files in this directory"
• "read script.js"
• "search for 'fireworks' in all files"

What would you like help with?`;
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
        // Open Editor
        if (lower.includes('open editor') || lower.includes('edit file')) {
            const file = message.match(/(?:open editor|edit file|edit)\s+(\S+)/i)?.[1] || 'untitled.js';
            const result = await this.tools.openEditor(file);
            return `✅ ${result.message}\n\nMonaco Editor is now open. You can start coding!`;
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
                const realBadge = result.real ? '🔴 REAL BASH' : '🟡 SIMULATED';
                return `**Command:** \`${result.command}\` ${realBadge}\n\n**Output:**\n\`\`\`\n${result.output}\n\`\`\`\n\n**Exit code:** ${result.exitCode}`;
            }
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
