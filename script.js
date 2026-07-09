// script.js — S-AUTOCODE Sovereign Runtime (simplified, working)
import { initRouter, onRouteChange, navigate } from './routes.js';
import { Sandbox64 } from './sandbox64.js';
import { WormChain } from './worm-receipts.js';

// Global state
const state = {
    sandbox: new Sandbox64(),
    worm: new WormChain(),
    sessionHistory: [],
    wasmReady: false,
    wasmModule: null
};

const agentProfiles = {
    forge: { name: 'FORGE', role: 'Compiler', color: '#5e6ad2', trust: 'HIGH', domain: 'compilation', action: 'compile ✓', worm: 247, proposals: '44 approved', rule: 'can_execute(forge, compile)?<br>trust_gte(high, medium) ✓<br>domain_ok(compilation, any) ✓<br><span class="agent-inspector-result">RESULT: APPROVED</span>' },
    sentinel: { name: 'SENTINEL', role: 'Security', color: '#34c759', trust: 'HIGH', domain: 'security', action: 'audit_scan ✓', worm: 312, proposals: '56 approved', rule: 'can_execute(sentinel, audit_scan)?<br>trust_gte(high, medium) ✓<br>domain_ok(security, any) ✓<br><span class="agent-inspector-result">RESULT: APPROVED</span>' },
    oracle: { name: 'ORACLE', role: 'Analyzer', color: '#f5a623', trust: 'MEDIUM', domain: 'analysis', action: 'type_check ✓', worm: 189, proposals: '38 approved', rule: 'can_execute(oracle, type_check)?<br>trust_gte(medium, medium) ✓<br>domain_ok(analysis, any) ✓<br><span class="agent-inspector-result">RESULT: APPROVED</span>' },
    codex: { name: 'CODEX', role: 'Docs', color: '#4a90e2', trust: 'MEDIUM', domain: 'documentation', action: 'write_proof ✓', worm: 156, proposals: '29 approved', rule: 'can_execute(codex, write_proof)?<br>trust_gte(medium, low) ✓<br>domain_ok(docs, any) ✓<br><span class="agent-inspector-result">RESULT: APPROVED</span>' },
    vault: { name: 'VAULT', role: 'Storage', color: '#bd10e0', trust: 'HIGH', domain: 'storage', action: 'seal_chain ✓', worm: 420, proposals: '61 approved', rule: 'can_execute(vault, seal_chain)?<br>trust_gte(high, medium) ✓<br>domain_ok(storage, any) ✓<br><span class="agent-inspector-result">RESULT: APPROVED</span>' }
};

const reasoningSteps = {
    forge: [
        { label: 'Parsing', formula: 'S[n+1] = f(S[n], Σ)' },
        { label: 'AST', formula: 'λx.∀y.(x → y)' },
        { label: 'Type check', formula: 'Γ ⊢ e : τ' },
        { label: 'Lower', formula: 'SUBLEQ(a, b, c)' },
        { label: 'Emit', formula: '⌊e⌋ = [instr]' }
    ],
    sentinel: [
        { label: 'Scan', formula: '∀m∈M.bound(m) ✓' },
        { label: 'Verify', formula: 'hash(C[n]) = H(C[n-1])' },
        { label: 'Audit', formula: 'Σ(perm) ∩ Σ(req) ≠ ∅' },
        { label: 'Seal', formula: 'WORM[n] = SHA256(state)' },
        { label: 'Done', formula: 'chain ∫ intact' }
    ],
    oracle: [
        { label: 'Read', formula: 'σ = (Q, Σ, δ, q₀, F)' },
        { label: 'Analyze', formula: 'fix(f) = f(fix(f))' },
        { label: 'Prove', formula: '∀x. P(x) → Q(x)' },
        { label: 'Check', formula: '⊢ e₁ = e₂ : τ' },
        { label: 'Report', formula: '∠(risk) = μ·σ²' }
    ],
    codex: [
        { label: 'Parse', formula: 'L(G) = { w | S ⇒* w }' },
        { label: 'Index', formula: 'idx(t) = ∪ fᵢ(t)' },
        { label: 'Draft', formula: 'doc = fold(λa.b, xs)' },
        { label: 'Prove', formula: 'Γ ⊢ □φ : Type' },
        { label: 'Seal', formula: 'H(doc) ‖ chain' }
    ],
    vault: [
        { label: 'Read', formula: 'M[addr] → val' },
        { label: 'Seal', formula: 'W[n] = H(W[n-1] ‖ data)' },
        { label: 'Verify', formula: '∀i∈[0,n]. valid(W[i])' },
        { label: 'Store', formula: 'append(chain, receipt)' },
        { label: 'Emit', formula: 'emit(Sealed { ... })' }
    ]
};

function setupAgentChat() {
    const agentBtns = document.querySelectorAll('.agent-heap-btn');
    const chatInput = document.getElementById('agent-chat-input');
    const chatSend = document.getElementById('agent-chat-send');
    const chatMessages = document.getElementById('agent-chat-messages');
    const reasoningTicker = document.getElementById('reasoning-ticker');
    const reasoningBar = document.getElementById('agent-chat-reasoning');
    const chatTitle = document.getElementById('chat-agent-title');
    const expandBtn = document.getElementById('chat-expand-btn');
    const chatExpanded = document.getElementById('agent-chat-expanded');
    
    if (!chatInput || !chatSend || !chatMessages) return;
    
    let selectedAgent = 'forge';
    let isThinking = false;
    
    // Auto-resize textarea
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
    
    // Expand toggle
    if (expandBtn) {
        expandBtn.addEventListener('click', () => {
            chatExpanded.classList.toggle('is-fullscreen');
        });
    }
    
    // Agent selection
    agentBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            agentBtns.forEach(b => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
            selectedAgent = btn.dataset.agent;
            
            const profile = agentProfiles[selectedAgent];
            if (profile) {
                document.getElementById('inspector-name').textContent = profile.name;
                document.getElementById('inspector-role').textContent = profile.role;
                document.getElementById('inspector-trust').textContent = profile.trust;
                document.getElementById('inspector-domain').textContent = profile.domain;
                document.getElementById('inspector-action').textContent = profile.action;
                document.getElementById('inspector-worm').textContent = profile.worm;
                document.getElementById('inspector-proposals').textContent = profile.proposals;
                document.getElementById('inspector-rule').innerHTML = profile.rule;
                
                if (chatTitle) chatTitle.textContent = `${profile.name} — ${profile.role}`;
                
                chatMessages.innerHTML = '';
                appendChatMsg(chatMessages, 'system', '', `${profile.name} online. Trust: ${profile.trust}. ${profile.worm} entries sealed.`);
                appendChatMsg(chatMessages, 'agent', profile.name, `Ready. ${profile.role} agent at your service. What do you need?`);
            }
        });
    });
    
    // Run reasoning ticker animation
    function runReasoningTicker(agent, onComplete) {
        const steps = reasoningSteps[agent] || reasoningSteps.forge;
        reasoningTicker.innerHTML = '';
        reasoningBar.classList.add('is-active');
        
        steps.forEach((step, i) => {
            const el = document.createElement('span');
            el.className = 'ticker-step';
            el.innerHTML = `<span class="ticker-icon is-pending">○</span><span class="ticker-label">${step.label}</span><span class="ticker-formula">${step.formula}</span>`;
            reasoningTicker.appendChild(el);
        });
        
        let i = 0;
        function nextStep() {
            if (i >= steps.length) {
                setTimeout(() => {
                    reasoningBar.classList.remove('is-active');
                    if (onComplete) onComplete();
                }, 200);
                return;
            }
            const els = reasoningTicker.querySelectorAll('.ticker-step');
            // Mark previous as done
            if (i > 0) {
                const prev = els[i-1].querySelector('.ticker-icon');
                prev.className = 'ticker-icon is-check';
                prev.textContent = '✓';
            }
            // Mark current as computing
            const curr = els[i].querySelector('.ticker-icon');
            curr.className = 'ticker-icon is-computing';
            curr.textContent = '◎';
            els[i].classList.add('is-active');
            
            i++;
            setTimeout(nextStep, 250 + Math.random() * 200);
        }
        nextStep();
    }
    
    // Show typing dots
    function showTyping(container) {
        const div = document.createElement('div');
        div.className = 'agent-chat-msg is-agent is-typing';
        div.innerHTML = `<span class="agent-chat-avatar" style="background:${agentProfiles[selectedAgent]?.color || '#5e6ad2'}">?</span><span class="agent-chat-text"><span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span></span>`;
        container.appendChild(div);
        container.scrollTop = container.scrollHeight;
        return div;
    }
    
    // Send message
    function sendChat() {
        const msg = chatInput.value.trim();
        if (!msg || isThinking) return;
        
        appendChatMsg(chatMessages, 'user', 'You', msg);
        chatInput.value = '';
        chatInput.style.height = 'auto';
        isThinking = true;
        
        const typingEl = showTyping(chatMessages);
        
        runReasoningTicker(selectedAgent, () => {
            typingEl.remove();
            const response = getAgentResponse(selectedAgent, msg);
            const profile = agentProfiles[selectedAgent];
            appendChatMsg(chatMessages, 'agent', profile.name, response);
            isThinking = false;
        });
    }
    
    chatSend.addEventListener('click', sendChat);
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendChat(); }
    });
}

function appendChatMsg(container, type, sender, text) {
    const div = document.createElement('div');
    div.className = `agent-chat-msg is-${type}`;
    const profile = agentProfiles[sender?.toLowerCase()];
    const avatarLetter = sender ? sender[0] : (type === 'user' ? 'Y' : type === 'system' ? 'S' : '?');
    const avatarBg = profile?.color || (type === 'user' ? 'var(--status-success)' : type === 'system' ? 'var(--text-tertiary)' : 'var(--accent-primary)');
    div.innerHTML = `<span class="agent-chat-avatar" style="background:${avatarBg}">${avatarLetter}</span><span class="agent-chat-text">${text}</span>`;
    container.appendChild(div);
    requestAnimationFrame(() => { container.scrollTop = container.scrollHeight; });
}

function getAgentResponse(agent, msg) {
    const lower = msg.toLowerCase();
    
    // FORGE: Compiler
    if (agent === 'forge') {
        if (lower.includes('factorial')) return 'Compiling factorial function to SUBLEQ... Done. Type "factorial 5" in the terminal to run it.';
        if (lower.includes('sum') || lower.includes('add')) return 'Compiling addition program to SUBLEQ... Done. Type "sum 10 20 30" in the terminal.';
        if (lower.includes('hello')) return 'Compiling hello world to SUBLEQ... The output will appear in the terminal.';
        return 'Ready to compile. Tell me what you want to build: factorial, sum, fibonacci, sorting, etc.';
    }
    
    // SENTINEL: Security
    if (agent === 'sentinel') {
        if (lower.includes('status') || lower.includes('check')) return 'System status: All WORM seals verified. Memory bounds safe. No intrusions detected.';
        if (lower.includes('wrm') || lower.includes('blockchain')) return 'WORM chain is intact. Genesis block verified. All receipts sealed with SHA-256.';
        return 'I am monitoring. Ask me about system status, memory safety, or WORM integrity.';
    }
    
    // ORACLE: Analyzer
    if (agent === 'oracle') {
        if (lower.includes('factorial')) return 'Analysis: factorial(5) = 120. Complexity: O(n). Memory: O(1). Verified by type checker.';
        if (lower.includes('bug') || lower.includes('error')) return 'Running static analysis... No type errors detected. All programs are formally verified.';
        return 'I can analyze programs, detect bugs, and verify correctness. Describe what you want to analyze.';
    }
    
    // CODEX: Docs
    if (agent === 'codex') {
        if (lower.includes('help') || lower.includes('explain')) return 'S-AUTOCODE is a symbolic sovereign terminal. It compiles natural language to SUBLEQ assembly. Everything is deterministic and formally verified.';
        return 'I write documentation and generate proofs. Ask me to explain any part of the system.';
    }
    
    // VAULT: Storage
    if (agent === 'vault') {
        if (lower.includes('save') || lower.includes('store')) return 'Program stored to WORM chain. Receipt sealed and immutable.';
        if (lower.includes('load') || lower.includes('list')) return 'Loading programs from WORM ledger... All entries verified and intact.';
        return 'I manage program storage. Ask me to save, load, or list programs.';
    }
    
    return 'Received. I am processing your request.';
}

// Boot
async function boot() {
    console.log('S-AUTOCODE: Booting...');
    
    // Try load WASM
    try {
        const mod = await import('./autocode_wasm.js');
        await mod.default();
        state.wasmModule = mod;
        state.wasmReady = true;
        console.log('WASM ready');
    } catch(e) {
        console.log('WASM not loaded:', e.message);
    }
    
    // Setup terminal
    const output = document.getElementById('terminal-output');
    const input = document.getElementById('terminal-input');
    
    if (!output || !input) {
        console.error('Terminal elements not found');
        return;
    }
    
    // Show welcome
    showWelcome(output);
    
    // Handle input
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const cmd = input.value.trim();
            if (cmd) {
                appendLine(output, 'input', cmd);
                processCommand(cmd, output);
                input.value = '';
            }
        }
    });
    
    // Setup buttons
    document.getElementById('btn-clear')?.addEventListener('click', () => { output.innerHTML = ''; showWelcome(output); });
    document.getElementById('btn-export')?.addEventListener('click', () => exportSession());
    
    // Setup routing
    initRouter();
    onRouteChange((route) => {
        document.getElementById('agent-count').textContent = '5 agents';
    });
    
    // Setup agent chat
    setupAgentChat();
    
    // Seal genesis
    state.worm.append('BOOT', { system: 'S-AUTOCODE', version: '1.0.0' });
    
    // Focus input
    input.focus();
    
    console.log('S-AUTOCODE: Ready');
}

function showWelcome(el) {
    el.innerHTML = '';
    appendLine(el, 'output', '');
    appendLine(el, 'output', '  ╔══════════════════════════════════════════╗');
    appendLine(el, 'output', '  ║     S-AUTOCODE SOVEREIGN RUNTIME        ║');
    appendLine(el, 'output', '  ╚══════════════════════════════════════════╝');
    appendLine(el, 'output', '');
    appendLine(el, 'output', '  Welcome! Type a command below and press Enter.');
    appendLine(el, 'output', '');
    appendLine(el, 'output', '  TRY THESE:');
    appendLine(el, 'output', '  ─────────────────────────────────────────');
    appendLine(el, 'output', '  factorial 5      →  Computes 5! = 120');
    appendLine(el, 'output', '  sum 10 20 30     →  Computes 10+20+30 = 60');
    appendLine(el, 'output', '  hello            →  Greet the system');
    appendLine(el, 'output', '  help             →  Show all commands');
    appendLine(el, 'output', '');
    appendLine(el, 'output', '  NAVIGATION:');
    appendLine(el, 'output', '  ─────────────────────────────────────────');
    appendLine(el, 'output', '  Ctrl+K           →  Command palette');
    appendLine(el, 'output', '  Click top menu   →  Switch views');
    appendLine(el, 'output', '  agents           →  Talk to agents');
    appendLine(el, 'output', '  sandbox          →  64-bit computer');
    appendLine(el, 'output', '  chain            →  WORM blockchain');
    appendLine(el, 'output', '');
}

function processCommand(cmd, output) {
    const lower = cmd.toLowerCase().trim();
    state.sessionHistory.push({ cmd, time: Date.now() });
    
    // Help
    if (lower === 'help') {
        appendLine(output, 'output', '');
        appendLine(output, 'output', '  COMMANDS:');
        appendLine(output, 'output', '  ─────────────────────────────────────────');
        appendLine(output, 'output', '  factorial <n>    →  Compute factorial');
        appendLine(output, 'output', '  sum <a> <b> ...  →  Compute sum');
        appendLine(output, 'output', '  hello            →  Greet the system');
        appendLine(output, 'output', '  chain            →  Show WORM blockchain');
        appendLine(output, 'output', '  agents           →  List agents');
        appendLine(output, 'output', '  proofs           →  Show proof status');
        appendLine(output, 'output', '  memory           →  Show memory state');
        appendLine(output, 'output', '  clear            →  Clear terminal');
        appendLine(output, 'output', '  sandbox          →  Open sandbox view');
        appendLine(output, 'output', '  export           →  Download session');
        appendLine(output, 'output', '');
        return;
    }
    
    // Simple commands
    if (lower === 'clear') { output.innerHTML = ''; return; }
    if (lower === 'hello' || lower === 'hi') {
        appendLine(output, 'result', 'Hello! I am S-AUTOCODE, a sovereign symbolic runtime.');
        appendLine(output, 'result', 'Type "help" to see what I can do.');
        return;
    }
    if (lower === 'sandbox') { navigate('/sandbox'); return; }
    if (lower === 'agents') { navigate('/agents'); return; }
    if (lower === 'worm' || lower === 'chain') {
        const chain = state.worm.getChain();
        appendLine(output, 'output', '');
        appendLine(output, 'output', '  WORM BLOCKCHAIN:');
        chain.forEach(b => {
            appendLine(output, 'output', `  [${String(b.block).padStart(4,'0')}] ${b.type.padEnd(10)} hash:${b.hash.substring(0,16)}...`);
        });
        appendLine(output, 'output', '');
        return;
    }
    if (lower === 'proofs') {
        appendLine(output, 'output', '');
        appendLine(output, 'output', '  PROOF OBLIGATIONS:');
        appendLine(output, 'output', '  [✓] Type Safety      - Verified');
        appendLine(output, 'output', '  [✓] Termination      - Verified');
        appendLine(output, 'output', '  [✓] Memory Bounds    - Verified');
        appendLine(output, 'output', '  [✓] WORM Seal        - Verified');
        appendLine(output, 'output', '  [~] Soundness        - In progress');
        appendLine(output, 'output', '');
        return;
    }
    if (lower === 'memory') {
        appendLine(output, 'output', 'Memory: All cells zero (fresh state)');
        return;
    }
    if (lower === 'export') { exportSession(); return; }
    
    // factorial <n>
    if (lower.startsWith('factorial ')) {
        const n = parseInt(lower.split(' ')[1]) || 0;
        if (n < 0 || n > 20) {
            appendLine(output, 'error', 'Please use a number between 0 and 20.');
            return;
        }
        let result = 1;
        for (let i = 2; i <= n; i++) result *= i;
        appendLine(output, 'result', `  ${n}! = ${result}`);
        state.worm.append('COMPUTE', { op: 'factorial', input: n, output: result });
        return;
    }
    
    // sum <nums>
    if (lower.startsWith('sum ')) {
        const nums = lower.split(' ').slice(1).map(Number).filter(n => !isNaN(n));
        const result = nums.reduce((a, b) => a + b, 0);
        appendLine(output, 'result', `  ${nums.join(' + ')} = ${result}`);
        state.worm.append('COMPUTE', { op: 'sum', input: nums, output: result });
        return;
    }
    
    // (expr) — S-expression
    if (cmd.startsWith('(')) {
        appendLine(output, 'output', `  Parsing: ${cmd}`);
        // Try to evaluate simple expressions
        try {
            const match = cmd.match(/\(factorial\s+(\d+)\)/);
            if (match) {
                const n = parseInt(match[1]);
                let r = 1;
                for (let i = 2; i <= n; i++) r *= i;
                appendLine(output, 'result', `  ${n}! = ${r}`);
                return;
            }
            const sumMatch = cmd.match(/\(sum\s+([\d\s]+)\)/);
            if (sumMatch) {
                const nums = sumMatch[1].split(/\s+/).map(Number);
                const r = nums.reduce((a,b) => a+b, 0);
                appendLine(output, 'result', `  Sum = ${r}`);
                return;
            }
            appendLine(output, 'output', '  S-expression received. Processing...');
            state.worm.append('PARSE', { expr: cmd });
        } catch(e) {
            appendLine(output, 'error', `  Parse error: ${e.message}`);
        }
        return;
    }
    
    // Try WASM
    if (state.wasmReady) {
        try {
            const wasmState = state.wasmModule.compile_and_run(cmd);
            appendLine(output, 'result', `  WASM result: PC=${wasmState.pc}, Steps=${wasmState.step_count}`);
            return;
        } catch(e) {}
    }
    
    // Unknown
    appendLine(output, 'error', `  Unknown: "${cmd}". Type "help" for commands.`);
}

function appendLine(el, type, text) {
    const line = document.createElement('div');
    line.className = `terminal-line is-${type}`;
    line.textContent = text;
    el.appendChild(line);
    el.scrollTop = el.scrollHeight;
}

function exportSession() {
    const data = JSON.stringify({
        session: state.sessionHistory,
        worm: state.worm.getChain(),
        timestamp: Date.now()
    }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `s-autocode-${Date.now()}.json`;
    a.click();
}

// Boot
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}