// fireworks-ai.js — Fireworks AI Integration for CODEX Agent
export class FireworksAI {
    constructor() {
        this.apiKey = 'key_eEDSHgkIYo5hjal14';
        this.modelPath = 'accounts/ahmedparr93-mr3fh2cp/deployments/o5hjal14';
        this.apiUrl = 'https://api.fireworks.ai/inference/v1/chat/completions';
        this.conversationHistory = [];
        this.isThinking = false;
        // Use mock responses for now (CORS blocks direct API calls from browser)
        this.useMock = true;
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

    generateSmartResponse(message) {
        const lower = message.toLowerCase();
        
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
        return `I'm CODEX, your AI coding assistant. I can:
• Write code in any language
• Debug and fix errors
• Explain technical concepts
• Review and optimize code
• Generate algorithms

What would you like help with?`;
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
