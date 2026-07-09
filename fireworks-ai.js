// fireworks-ai.js — Fireworks AI Integration for CODEX Agent
export class FireworksAI {
    constructor() {
        this.apiKey = 'key_eEDSHgkIYo5hjal14';
        this.modelPath = 'accounts/ahmedparr93-mr3fh2cp/deployments/o5hjal14';
        // Try localhost proxy first (run codex-server.py), fallback to direct API
        this.apiUrl = 'http://localhost:8765';
        this.fallbackUrl = 'https://api.fireworks.ai/inference/v1/chat/completions';
        this.conversationHistory = [];
        this.isThinking = false;
        this.useProxy = true;
    }

    async chat(userMessage, systemPrompt = null) {
        if (this.isThinking) {
            throw new Error('Agent is already thinking');
        }

        this.isThinking = true;

        try {
            // Add system prompt if provided
            if (systemPrompt && this.conversationHistory.length === 0) {
                this.conversationHistory.push({
                    role: 'system',
                    content: systemPrompt
                });
            }

            // Add user message
            this.conversationHistory.push({
                role: 'user',
                content: userMessage
            });

            const url = this.useProxy ? this.apiUrl : this.fallbackUrl;
            const headers = this.useProxy
                ? { 'Content-Type': 'application/json' }
                : {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                };

            const response = await fetch(url, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({
                    model: this.modelPath,
                    max_tokens: 4096,
                    messages: this.conversationHistory,
                    stream: false
                })
            });

            if (!response.ok) {
                // If proxy fails, try direct API
                if (this.useProxy) {
                    console.warn('Proxy failed, trying direct API...');
                    this.useProxy = false;
                    return this.chat(userMessage, systemPrompt);
                }
                throw new Error(`API error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            const aiResponse = data.choices[0].message.content;

            // Add AI response to history
            this.conversationHistory.push({
                role: 'assistant',
                content: aiResponse
            });

            return aiResponse;
        } catch (error) {
            console.error('Fireworks AI error:', error);
            throw error;
        } finally {
            this.isThinking = false;
        }
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
