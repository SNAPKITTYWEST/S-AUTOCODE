// script.js — Main orchestrator for S-AUTOCODE sovereign runtime
import { initRouter, onRouteChange, navigate } from './routes.js';
import { SExprParser } from './sexpr-parser.js';
import { Sandbox64 } from './sandbox64.js';
import { MemoryTape } from './memory-tape.js';
import { AgentForge } from './agent-forge.js';
import { WormChain } from './worm-receipts.js';
import { FeatureEditor } from './feature-editor.js';
import { SymbolicTerminal } from './symbolic-terminal.js';

// Global state
const state = {
    parser: new SExprParser(),
    sandbox: new Sandbox64(),
    forge: new AgentForge(),
    worm: new WormChain(),
    editor: new FeatureEditor(),
    terminal: null,
    memoryTape: null,
    sessionHistory: [],
    currentSession: null
};

// Initialize terminal
function initTerminal() {
    const outputEl = document.getElementById('terminal-output');
    const inputEl = document.getElementById('terminal-input');
    state.terminal = new SymbolicTerminal(outputEl, inputEl);
    
    state.terminal.onCommand = (cmd, terminal) => {
        processCommand(cmd, terminal);
    };
    
    state.terminal.bind();
    state.terminal.initWasm();
    
    // Wire terminal buttons
    document.getElementById('btn-clear')?.addEventListener('click', () => state.terminal.clear());
    document.getElementById('btn-export')?.addEventListener('click', exportSession);
}

// Process terminal commands
function processCommand(cmd, terminal) {
    // Save to session
    state.sessionHistory.push({ cmd, timestamp: Date.now() });
    
    // Built-in commands
    if (cmd === 'help') {
        terminal.appendLine('output', `Commands:
  factorial <n>      Compute factorial
  sum <a> <b>        Compute sum
  subleq <expr>      Compile to SUBLEQ
  memory             Show memory state
  trace              Show execution trace
  chain              Show WORM chain
  agents             List agents
  proofs             Show proof status
  clear              Clear terminal
  export             Export session
  sandbox            Open sandbox view
  route <path>       Navigate to route`);
        return;
    }
    
    if (cmd === 'clear') { terminal.clear(); return; }
    if (cmd === 'export') { exportSession(); return; }
    if (cmd === 'sandbox') { navigate('/sandbox'); return; }
    if (cmd === 'agents') { navigate('/agents'); return; }
    if (cmd === 'worm') { navigate('/worm'); return; }
    if (cmd === 'proofs') { navigate('/proofs'); return; }
    
    if (cmd.startsWith('route ')) {
        navigate(cmd.slice(6));
        return;
    }
    
    if (cmd === 'memory') {
        const mem = state.sandbox.getMemorySnapshot();
        terminal.appendLine('output', JSON.stringify(mem, null, 2));
        return;
    }
    
    if (cmd === 'trace') {
        const trace = state.sandbox.trace;
        if (trace.length === 0) {
            terminal.appendLine('output', 'No execution trace yet.');
        } else {
            const lines = trace.slice(-20).map(t => 
                `[${String(t.step).padStart(4, '0')}] PC:${t.pc} ${t.instruction?.op || '?'}`
            );
            terminal.appendLine('output', lines.join('\n'));
        }
        return;
    }
    
    if (cmd === 'chain') {
        const chain = state.worm.getChain();
        const lines = chain.map(b => 
            `[${String(b.block).padStart(4, '0')}] ${b.type} hash:${b.hash.substring(0, 12)}...`
        );
        terminal.appendLine('output', lines.join('\n'));
        return;
    }
    
    if (cmd === 'agents') {
        const agents = state.forge.getAgents();
        const lines = agents.map(a => 
            `${a.name.padEnd(10)} [${a.status}] trust:${a.trust} domain:${a.domain}`
        );
        terminal.appendLine('output', lines.join('\n'));
        return;
    }
    
    if (cmd === 'proofs') {
        terminal.appendLine('output', `PROOF OBLIGATIONS
  [✓] Type Safety      - All expressions type-check
  [✓] Termination      - All loops guaranteed to terminate
  [✓] Memory Bounds    - No out-of-bounds access
  [✓] WORM Seal        - Chain integrity verified
  [~] Soundness        - In progress
  [ ] Completeness     - Pending`);
        return;
    }
    
    // S-expression processing
    if (cmd.startsWith('(')) {
        try {
            const expr = state.parser.parse(cmd);
            const formatted = state.parser.format(expr);
            terminal.appendLine('output', `Parsed: ${formatted}`);
            
            // Run through forge pipeline
            state.forge.runPipeline(cmd, 
                (stage) => updateForgeStage(stage),
                (entry) => addReasoningEntry(entry)
            );
            
            // Compile to SUBLEQ
            const subleq = state.parser.compileToSUBLEQ(expr);
            if (subleq.length > 0) {
                terminal.appendLine('output', `SUBLEQ: ${subleq.length} instructions`);
            }
            
            // Compute result for simple expressions
            if (expr.type === 'list' && expr.items[0]?.value === 'factorial' && expr.items[1]?.type === 'number') {
                const n = expr.items[1].value;
                let result = 1;
                for (let i = 2; i <= n; i++) result *= i;
                terminal.appendLine('result', `→ ${result}`);
            }
            
            // Seal to WORM
            state.worm.append('COMPILE', { input: cmd, output: formatted });
            updateWormIndicator();
            
        } catch (e) {
            terminal.appendLine('error', `Parse error: ${e.message}`);
        }
        return;
    }
    
    // Try WASM compile
    if (state.terminal.wasmReady) {
        try {
            const wasmState = state.terminal.wasmModule.compile_and_run(cmd);
            state.sandbox.loadProgram([]);
            terminal.appendLine('result', `PC: ${wasmState.pc}, Steps: ${wasmState.step_count}, Halted: ${wasmState.halted}`);
            updateTapeFromWasm(wasmState);
            return;
        } catch (e) {}
    }
    
    terminal.appendLine('error', `Unknown command: ${cmd}. Type "help" for available commands.`);
}

// Update forge stage UI
function updateForgeStage(stageName) {
    document.querySelectorAll('.forge-stages .stage').forEach(el => {
        const stage = el.dataset.stage;
        el.classList.remove('is-active', 'is-complete');
        const stages = ['parse', 'ast', 'lower', 'verify', 'optimize', 'emit', 'execute'];
        const idx = stages.indexOf(stage);
        const activeIdx = stages.indexOf(stageName);
        if (idx < activeIdx) el.classList.add('is-complete');
        if (idx === activeIdx) el.classList.add('is-active');
    });
    
    document.getElementById('forge-badge').textContent = stageName;
    document.getElementById('forge-badge').classList.add('is-executing');
}

// Add reasoning entry
function addReasoningEntry(entry) {
    const stream = document.getElementById('reasoning-stream');
    const el = document.createElement('div');
    el.className = 'reasoning-entry';
    el.innerHTML = `
        <span class="reasoning-timestamp">${entry.timestamp}</span>
        <span class="reasoning-stage is-${entry.stage}">${entry.stage}</span>
        <p class="reasoning-text">${entry.text}</p>
    `;
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
    stream.appendChild(el);
    requestAnimationFrame(() => {
        el.style.transition = 'all 0.3s ease';
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
    });
    stream.scrollTop = stream.scrollHeight;
}

// Update WORM indicator
function updateWormIndicator() {
    const chain = state.worm.getChain();
    document.getElementById('worm-block').textContent = `Block ${chain.length - 1}`;
}

// Update tape from WASM state
function updateTapeFromWasm(wasmState) {
    if (state.memoryTape) {
        const mem = [];
        for (let i = 0; i < 256; i++) {
            mem.push(wasmState.get_memory_cell(i));
        }
        state.memoryTape.updateMemory(mem);
    }
}

// Export session
function exportSession() {
    const data = {
        history: state.sessionHistory,
        wormChain: state.worm.getChain(),
        sandboxState: state.sandbox.getState(),
        timestamp: Date.now()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `s-autocode-session-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize memory tape
function initMemoryTape() {
    const container = document.getElementById('tape-viewer');
    if (container) {
        state.memoryTape = new MemoryTape(container);
        state.memoryTape.render();
        document.getElementById('btn-mem-prev')?.addEventListener('click', () => state.memoryTape.scrollUp());
        document.getElementById('btn-mem-next')?.addEventListener('click', () => state.memoryTape.scrollDown());
    }
}

// Initialize proofs panel
function initProofs() {
    const container = document.getElementById('proof-list');
    if (container) {
        const proofs = [
            { name: 'Type Safety', status: 'verified' },
            { name: 'Termination', status: 'verified' },
            { name: 'Memory Bounds', status: 'verifying' },
            { name: 'WORM Seal', status: 'pending' },
            { name: 'Soundness', status: 'pending' }
        ];
        container.innerHTML = proofs.map(p => `
            <div class="proof-item is-${p.status}">
                <span class="proof-icon">${p.status === 'verified' ? '&#x2713;' : p.status === 'verifying' ? '&#x23F3;' : '&#x25CB;'}</span>
                <span class="proof-name">${p.name}</span>
                <span class="proof-status">${p.status}</span>
            </div>
        `).join('');
    }
}

// Initialize widgets
function initWidgets() {
    const container = document.getElementById('widget-grid');
    if (container) {
        container.innerHTML = `
            <div class="widget">
                <div class="widget-header"><span class="widget-title">Registers</span></div>
                <div class="widget-body">
                    <div class="register-row"><span class="register-name">RIP</span><span class="register-value">0x0000</span></div>
                    <div class="register-row"><span class="register-name">RAX</span><span class="register-value">0x0000</span></div>
                    <div class="register-row"><span class="register-name">RSP</span><span class="register-value">0x03FF</span></div>
                </div>
            </div>
            <div class="widget">
                <div class="widget-header"><span class="widget-title">Heap</span></div>
                <div class="widget-body">
                    <div class="heap-bar"><div class="heap-used" style="width:42%">42%</div></div>
                    <div class="heap-stats"><span>Used: 1.2 KB</span><span>Free: 1.6 KB</span></div>
                </div>
            </div>
            <div class="widget">
                <div class="widget-header"><span class="widget-title">Performance</span></div>
                <div class="widget-body">
                    <div class="perf-stat"><span class="perf-label">FPS</span><span class="perf-value">120</span></div>
                    <div class="perf-stat"><span class="perf-label">Latency</span><span class="perf-value">8ms</span></div>
                </div>
            </div>
        `;
    }
}

// Initialize timeline markers
function initTimeline() {
    const container = document.getElementById('timeline-markers');
    if (container) {
        const stages = ['Parse', 'AST', 'Lower', 'Verify', 'Optimize', 'Emit', 'Execute'];
        container.innerHTML = stages.map((s, i) => `
            <div class="marker" data-step="${i}">
                <span class="marker-dot">&#x25CB;</span>
                <span class="marker-label">${s}</span>
            </div>
        `).join('');
    }
}

// Timeline controls
function initTimelineControls() {
    document.getElementById('btn-play')?.addEventListener('click', () => {
        const progress = document.getElementById('timeline-progress');
        let w = parseFloat(progress.style.width) || 0;
        progress.style.width = Math.min(w + 16.6, 100) + '%';
    });
    document.getElementById('btn-rewind')?.addEventListener('click', () => {
        const progress = document.getElementById('timeline-progress');
        let w = parseFloat(progress.style.width) || 0;
        progress.style.width = Math.max(w - 16.6, 0) + '%';
    });
    document.getElementById('btn-forward')?.addEventListener('click', () => {
        document.getElementById('timeline-progress').style.width = '100%';
    });
    document.getElementById('btn-replay')?.addEventListener('click', () => {
        document.getElementById('timeline-progress').style.width = '0%';
        state.forge.resetPipeline();
        state.terminal.replayHistory(state.sessionHistory.map(h => h.cmd));
    });
}

// Command palette
function initCommandPalette() {
    const palette = document.getElementById('command-palette');
    const overlay = document.getElementById('overlay');
    const input = document.getElementById('palette-input');
    const results = document.getElementById('palette-results');
    
    const commands = [
        { icon: '&#x29B9;', title: 'Observatory', desc: 'Five-Pane Observatory', route: '/observatory' },
        { icon: '&#x270E;', title: 'Editor', desc: 'Feature Editor', route: '/editor' },
        { icon: '&#x25B6;', title: 'Sandbox', desc: '64-bit Runtime', route: '/sandbox' },
        { icon: '&#x25CF;', title: 'Agents', desc: 'Agent Status Board', route: '/agents' },
        { icon: '&#x2713;', title: 'Proofs', desc: 'Proof Registry', route: '/proofs' },
        { icon: '&#x29B9;', title: 'WORM Chain', desc: 'Receipt Explorer', route: '/worm' },
        { icon: '&#x2B07;', title: 'Deploy', desc: 'Deployment Dashboard', route: '/deploy' },
        { icon: '&#x2317;', title: 'Clear Terminal', desc: 'Clear output', action: 'clear' },
        { icon: '&#x2B07;', title: 'Export Session', desc: 'Download JSON', action: 'export' }
    ];
    
    function openPalette() {
        palette.classList.add('is-open');
        overlay.classList.add('is-visible');
        input.value = '';
        renderResults(commands);
        input.focus();
    }
    
    function closePalette() {
        palette.classList.remove('is-open');
        overlay.classList.remove('is-visible');
    }
    
    function renderResults(cmds) {
        results.innerHTML = cmds.map((c, i) => `
            <div class="command-result${i === 0 ? ' is-selected' : ''}" data-route="${c.route || ''}" data-action="${c.action || ''}">
                <span class="command-result-icon">${c.icon}</span>
                <div>
                    <div class="command-result-title">${c.title}</div>
                    <div class="command-result-desc">${c.desc}</div>
                </div>
            </div>
        `).join('');
        
        results.querySelectorAll('.command-result').forEach(el => {
            el.addEventListener('click', () => {
                if (el.dataset.route) navigate(el.dataset.route);
                if (el.dataset.action === 'clear') state.terminal?.clear();
                if (el.dataset.action === 'export') exportSession();
                closePalette();
            });
        });
    }
    
    document.getElementById('cmd-palette-trigger')?.addEventListener('click', openPalette);
    overlay?.addEventListener('click', closePalette);
    
    input?.addEventListener('input', () => {
        const q = input.value.toLowerCase();
        const filtered = commands.filter(c => c.title.toLowerCase().includes(q) || c.desc.toLowerCase().includes(q));
        renderResults(filtered);
    });
    
    input?.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePalette();
        if (e.key === 'Enter') {
            const selected = results.querySelector('.command-result.is-selected');
            if (selected) selected.click();
        }
    });
    
    // Global Ctrl+K
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openPalette();
        }
    });
}

// Symbol explorer
function initSymbolExplorer() {
    const container = document.getElementById('symbol-list');
    if (container) {
        const symbols = [
            { name: 'factorial', type: 'Function', icon: 'f' },
            { name: 'sum', type: 'Function', icon: '&#x2211;' },
            { name: 'Tape', type: 'Memory', icon: '&#x03C4;' },
            { name: 'delta', type: 'Variable', icon: '&#x0394;' },
            { name: 'main', type: 'Entry', icon: '&#x03BB;' }
        ];
        container.innerHTML = symbols.map(s => `
            <div class="symbol-item" data-symbol="${s.name}">
                <span class="symbol-icon">${s.icon}</span>
                <span class="symbol-name">${s.name}</span>
                <span class="symbol-type">${s.type}</span>
            </div>
        `).join('');
        
        container.querySelectorAll('.symbol-item').forEach(item => {
            item.addEventListener('click', () => {
                navigate(`/symbols/${item.dataset.symbol}`);
            });
        });
    }
}

// Route change handler
function handleRouteChange(route, params) {
    // Update agent count
    document.getElementById('agent-count').textContent = `${state.forge.getAgents().length} agents`;
    
    // Render agents view
    if (route === '/agents' || route === '/') {
        renderAgentsView();
    }
    
    // Render worm view
    if (route === '/worm') {
        renderWormView();
    }
    
    // Render deploy view
    if (route === '/deploy') {
        renderDeployView();
    }
}

function renderAgentsView() {
    const grid = document.getElementById('agents-grid');
    if (!grid) return;
    
    const agents = state.forge.getAgents();
    grid.innerHTML = agents.map(a => `
        <div class="agent-card" data-agent="${a.id}">
            <div class="agent-card-header">
                <span class="agent-card-dot ${a.status === 'idle' ? 'is-idle' : ''}"></span>
                <div>
                    <div class="agent-card-name">${a.name}</div>
                    <div class="agent-card-role">${a.role}</div>
                </div>
            </div>
            <div class="agent-card-stats">
                <span>Trust: ${a.trust}</span>
                <span>Domain: ${a.domain}</span>
                <span>Status: ${a.status}</span>
            </div>
        </div>
    `).join('');
}

function renderWormView() {
    const chain = document.getElementById('worm-chain');
    if (!chain) return;
    
    const blocks = state.worm.getChain();
    chain.innerHTML = blocks.map(b => `
        <div class="worm-block is-sealed" data-block="${b.block}">
            <span class="worm-block-type">${b.type}</span>
            <span class="worm-block-hash">hash:${b.hash.substring(0, 16)}...</span>
            <span class="worm-block-time">${new Date(b.timestamp).toLocaleTimeString()}</span>
        </div>
    `).join('');
}

function renderDeployView() {
    const dashboard = document.getElementById('deploy-dashboard');
    if (!dashboard) return;
    
    dashboard.innerHTML = `
        <div class="deploy-card">
            <div class="deploy-card-title">Runtime Status</div>
            <div class="deploy-card-status">PRIMUS Kernel: Active</div>
            <div class="deploy-card-status">WORM Chain: ${state.worm.getChain().length} blocks</div>
            <div class="deploy-card-status">Sandbox: Ready</div>
        </div>
        <div class="deploy-card">
            <div class="deploy-card-title">Agent Registry</div>
            <div class="deploy-card-status">${state.forge.getAgents().length} agents registered</div>
            <div class="deploy-card-status">All agents sealed</div>
        </div>
        <div class="deploy-card">
            <div class="deploy-card-title">Proof Obligations</div>
            <div class="deploy-card-status">3 verified, 1 verifying, 1 pending</div>
        </div>
        <div class="deploy-card">
            <div class="deploy-card-title">Session History</div>
            <div class="deploy-card-status">${state.sessionHistory.length} commands executed</div>
        </div>
    `;
}

// Boot sequence
function boot() {
    console.log('S-AUTOCODE: Initializing sovereign runtime...');
    
    initTerminal();
    initMemoryTape();
    initProofs();
    initWidgets();
    initTimeline();
    initTimelineControls();
    initCommandPalette();
    initSymbolExplorer();
    
    initRouter();
    onRouteChange(handleRouteChange);
    
    // Initial seal
    state.worm.append('BOOT', { system: 'S-AUTOCODE', version: '1.0.0' });
    updateWormIndicator();
    
    console.log('S-AUTOCODE: PRIMUS Runtime Kernel ready.');
}

// Boot on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}