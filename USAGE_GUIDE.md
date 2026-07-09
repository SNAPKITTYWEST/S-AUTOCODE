# S-AUTOCODE Usage Guide

> **Complete guide to using S-AUTOCODE's AI agents, tools, and features**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [CODEX Agent Examples](#codex-agent-examples)
3. [Terminal Commands](#terminal-commands)
4. [Monaco Editor](#monaco-editor)
5. [Agent System](#agent-system)
6. [WORM Blockchain](#worm-blockchain)
7. [Advanced Features](#advanced-features)
8. [Troubleshooting](#troubleshooting)

---

## Getting Started

### First Launch

1. **Open S-AUTOCODE:** [https://snapkittywest.github.io/S-AUTOCODE/](https://snapkittywest.github.io/S-AUTOCODE/)

2. **You'll see the Observatory view** with 5 panels:
   - Left: Project Explorer
   - Center: Terminal + Agent Forge
   - Right: Agent Chat
   - Bottom: Memory Tape, Proofs, Widgets

3. **Try your first command:**
   ```
   Type in terminal: factorial 5
   Press Enter
   ```
   
   **Result:** `5! = 120`

![First Command](docs/screenshots/first-command.png)

---

## CODEX Agent Examples

### Example 1: Generate Python Code

**You type:**
```
open editor fibonacci.py and write fibonacci code
```

**CODEX responds:**

```
✅ Opened fibonacci.py in Monaco Editor

Typing code into editor now...

def fibonacci(n):
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
```

**What happens:**
1. ✅ Editor route opens automatically
2. ✅ Monaco editor appears empty
3. ✅ Code types character-by-character (typing animation)
4. ✅ Full syntax highlighting
5. ✅ WORM receipt sealed

![Fibonacci Generation](docs/screenshots/fibonacci-generation.gif)

---

### Example 2: Execute Git Commands

**You type:**
```
run git status
```

**CODEX responds:**

```
🔴 REAL BASH
Command: git status

Output:
On branch master
Your branch is up to date with 'origin/master'.

Changes not staged for commit:
  (use "git add <file>..." to update what will be committed)
  (use "git restore <file>..." to discard changes in working directory)
        modified:   README.md
        modified:   script.js

no changes added to commit (use "git add" and/or "git commit -a")

Exit code: 0
```

**What happens:**
1. ✅ Real bash execution (if available)
2. ✅ Full command output
3. ✅ Exit code displayed
4. ✅ Syntax highlighting for output

![Git Status](docs/screenshots/git-status.png)

---

### Example 3: Search Codebase

**You type:**
```
search for 'fireworks' in all files
```

**CODEX responds:**

```
**Search results for "fireworks":**

• **script.js:243**
  `const response = await fireworksAI.chat(msg, systemPrompt);`

• **fireworks-ai.js:15**
  `async chat(userMessage, systemPrompt = null) {`

• **fireworks-ai.js:78**
  `return 'I'm CODEX, powered by Fireworks AI!';`
```

**What happens:**
1. ✅ Searches all files in project
2. ✅ Shows file name and line number
3. ✅ Displays matching code snippet
4. ✅ Clickable results (future feature)

![Search Results](docs/screenshots/search-results.png)

---

### Example 4: Navigate Interface

**You type:**
```
go to sandbox
```

**CODEX responds:**

```
✅ Navigated to /sandbox

Sandboxed 64-bit Runtime is now active.
```

**What happens:**
1. ✅ Route changes to sandbox view
2. ✅ Sandbox panels appear
3. ✅ Registers, memory, trace visible
4. ✅ Ready for execution

![Navigate Sandbox](docs/screenshots/navigate-sandbox.png)

---

### Example 5: Read File Contents

**You type:**
```
read script.js
```

**CODEX responds:**

```
**File:** script.js (655 lines)

```javascript
// script.js — S-AUTOCODE Sovereign Runtime (Production Ready)
import { initRouter, onRouteChange, navigate } from './routes.js';
import { Sandbox64 } from './sandbox64.js';
import { WormChain } from './worm-receipts.js';
import { initWormExplorer } from './worm-explorer.js';
import { initProofRegistry } from './proof-registry.js';
import { stateManager, addTerminalHistory,addCommandHistory, addWormBlock, addProof } from './state-manager.js';
import { fireworksAI } from './fireworks-ai.js';

// Global state
const state = {
    sandbox: new Sandbox64(),
    worm: new WormChain(),
    sessionHistory: [],
    wasmReady: false,
    wasmModule: null,
    wormExplorer: null,
    proofRegistry: null,
    proofStore: {
        proofs: [],
        getProofs() { return this.proofs; },
        addProof(proof) {
            this.proofs.push(proof);
            addProof(proof);
        }
    }
};
...
```
```

**What happens:**
1. ✅ File contents displayed
2. ✅ Line count shown
3. ✅ Syntax highlighting
4. ✅ Scrollable output

![Read File](docs/screenshots/read-file.png)

---

### Example 6: List Files

**You type:**
```
list files in this directory
```

**CODEX responds:**

```
**Files in current directory:**

• index.html
• script.js
• fireworks-ai.js
• codex-tools.js
• styles.css
• README.md
• package.json

**Total:** 7 files
```

**What happens:**
1. ✅ Lists all files
2. ✅ Shows file count
3. ✅ Clean bullet list format

![List Files](docs/screenshots/list-files.png)

---

## Terminal Commands

### Math Operations

```bash
# Factorial
factorial 5
# Output: 5! = 120

# Sum
sum 10 20 30
# Output: 10 + 20 + 30 = 60
```

### System Commands

```bash
# Help
help
# Shows all available commands

# Chain
chain
# Displays WORM blockchain

# Agents
agents
# Lists all 5 agents

# Proofs
proofs
# Shows proof obligations

# Memory
memory
# Displays memory state
```

### Navigation

```bash
# Open sandbox
sandbox

# Clear terminal
clear

# Export session
export
```

### S-Expressions

```bash
# Factorial as S-expression
(factorial 5)
# Output: 5! = 120

# Sum as S-expression
(sum 10 20 30)
# Output: Sum = 60
```

![Terminal Commands](docs/screenshots/terminal-commands.png)

---

## Monaco Editor

### Opening the Editor

**Method 1: Via CODEX**
```
You: "open editor main.py"
```

**Method 2: Via Navigation**
- Click **Editor** in top menu bar
- Or type `Ctrl+K` and search "editor"

**Method 3: Via Terminal**
```bash
sandbox
```

### Editor Features

✅ **Syntax Highlighting**
- JavaScript, Python, Rust, Lean, Prolog
- Auto-detection by file extension

✅ **IntelliSense**
- Auto-completion
- Parameter hints
- Quick info

✅ **Multi-Cursor**
- `Alt+Click` to add cursor
- `Ctrl+Alt+↑/↓` for column selection

✅ **Find & Replace**
- `Ctrl+F` to find
- `Ctrl+H` to replace

✅ **Code Folding**
- Click arrows in gutter
- `Ctrl+Shift+[` to fold
- `Ctrl+Shift+]` to unfold

### Live Typing Animation

When CODEX generates code, watch it type in real-time:

```javascript
// Speed: 20ms per character (configurable)
async typeCodeInEditor(code, speed = 20) {
    for (let i = 0; i < code.length; i++) {
        window.monacoEditor.setValue(code.substring(0, i + 1));
        await new Promise(resolve => setTimeout(resolve, speed));
    }
}
```

![Monaco Editor](docs/screenshots/monaco-editor.gif)

---

## Agent System

### 5 Specialized Agents

#### 1. FORGE (Compiler)
- **Role:** Compiles code to SUBLEQ bytecode
- **Trust:** HIGH
- **Commands:**
  ```
  You: "compile factorial function"
  FORGE: "Compiling to SUBLEQ... Done."
  ```

#### 2. SENTINEL (Security)
- **Role:** Security audits and WORM verification
- **Trust:** HIGH
- **Commands:**
  ```
  You: "check system status"
  SENTINEL: "All WORM seals verified. No intrusions."
  ```

#### 3. ORACLE (Analyzer)
- **Role:** Type checking and static analysis
- **Trust:** MEDIUM
- **Commands:**
  ```
  You: "analyze factorial function"
  ORACLE: "Complexity: O(n). Memory: O(1). Verified."
  ```

#### 4. CODEX (AI Coder)
- **Role:** Code generation with tool access
- **Trust:** HIGH
- **Commands:**
  ```
  You: "write a sorting algorithm"
  CODEX: [Generates code with typing animation]
  ```

#### 5. VAULT (Storage)
- **Role:** WORM chain management
- **Trust:** HIGH
- **Commands:**
  ```
  You: "save program to chain"
  VAULT: "Program sealed. Receipt immutable."
  ```

### Agent Chat Interface

![Agent Chat](docs/screenshots/agent-chat.png)

**Features:**
- ✅ Select agent from heap
- ✅ View agent profile (trust, domain, stats)
- ✅ See reasoning steps in real-time
- ✅ Conversation history
- ✅ Typing indicators
- ✅ Fullscreen mode

### Reasoning Visualization

Watch agents think:

```
○ Connect     API → Fireworks
◎ Analyze     context ⊢ intent
✓ Generate    LLM(prompt) → code
✓ Verify      ∀x. valid(x) ✓
✓ Emit        seal(output) → WORM
```

**Symbols:**
- `○` Pending
- `◎` Computing
- `✓` Complete

![Reasoning Ticker](docs/screenshots/reasoning-ticker.gif)

---

## WORM Blockchain

### What is WORM?

**WORM** = Write Once Read Many

Every computation is sealed in an immutable blockchain:

```
Block 0: BOOT
├─ System: S-AUTOCODE
├─ Version: 1.0.0
└─ Hash: 0000000000000000...

Block 1: COMPUTE
├─ Operation: factorial
├─ Input: 5
├─ Output: 120
└─ Hash: a3f2b1c4d5e6f7a8...

Block 2: COMPILE
├─ Source: factorial.ac
├─ Target: SUBLEQ
└─ Hash: b4e3c2d1a0f9e8d7...
```

### Viewing the Chain

**Method 1: Terminal**
```bash
chain
```

**Method 2: CODEX**
```
You: "show me the blockchain"
```

**Method 3: Navigation**
- Click **WORM** in top menu
- Explore blocks visually

![WORM Chain](docs/screenshots/worm-chain.png)

### Block Structure

```javascript
{
    block: 0,
    type: 'BOOT',
    hash: '0000000000000000...',
    prevHash: '0000000000000000...',
    timestamp: 1720519200000,
    data: {
        system: 'S-AUTOCODE',
        version: '1.0.0'
    }
}
```

### Verification

Every block is verified:
- ✅ SHA-256 hash integrity
- ✅ Previous hash linkage
- ✅ Timestamp ordering
- ✅ Data immutability

---

## Advanced Features

### Tool System

CODEX has access to 9 tools:

| Tool | Description | Example |
|------|-------------|---------|
| `execute_command` | Run bash commands | `run git status` |
| `open_editor` | Open Monaco editor | `open editor main.py` |
| `open_browser` | Launch KittyBrowse | `browse https://example.com` |
| `navigate_route` | Change views | `go to sandbox` |
| `read_file` | Read file contents | `read script.js` |
| `write_file` | Write to file | `create hello.py` |
| `list_files` | List directory | `list files` |
| `search_files` | Search with regex | `search for 'function'` |
| `analyze_code` | Code analysis | `analyze complexity` |

### Command Palette

Press `Ctrl+K` to open:

![Command Palette](docs/screenshots/command-palette.png)

**Quick Actions:**
- Navigate to any route
- Execute commands
- Search files
- Open settings

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Command palette |
| `Ctrl+S` | Save file |
| `Ctrl+F` | Find |
| `Ctrl+H` | Replace |
| `Ctrl+/` | Toggle comment |
| `Alt+↑/↓` | Move line |
| `Ctrl+D` | Select next occurrence |

---

## Troubleshooting

### CODEX Not Responding

**Problem:** CODEX shows "thinking" but no response

**Solutions:**
1. Check internet connection
2. Refresh the page
3. Clear browser cache
4. Try a different browser

### Monaco Editor Not Loading

**Problem:** Editor shows blank or placeholder

**Solutions:**
1. Wait 2-3 seconds for Monaco to load
2. Check browser console for errors
3. Disable browser extensions
4. Use Chrome/Edge (best compatibility)

### Typing Animation Too Fast/Slow

**Problem:** Code types too quickly or slowly

**Solution:**
```javascript
// Adjust speed in fireworks-ai.js line 212
async typeCodeInEditor(code, speed = 20) {
    // Change speed value:
    // 10 = faster
    // 50 = slower
}
```

### Commands Not Working

**Problem:** Terminal commands don't execute

**Solutions:**
1. Check spelling (case-sensitive)
2. Type `help` to see available commands
3. Try S-expression format: `(factorial 5)`
4. Refresh page if terminal is frozen

### WORM Chain Not Updating

**Problem:** New blocks don't appear

**Solutions:**
1. Navigate to WORM view
2. Refresh the chain display
3. Check browser console for errors
4. Verify computation completed

---

## Tips & Tricks

### 1. Use Natural Language

CODEX understands natural language:
```
✅ "write a python function to sort a list"
✅ "show me the git log"
✅ "open the editor and create a hello world"
```

### 2. Chain Commands

Execute multiple operations:
```
You: "open editor main.py, write hello world, then run it"
```

### 3. Explore with Questions

Ask CODEX to explain:
```
You: "explain how SUBLEQ works"
You: "what is the WORM blockchain?"
You: "how do I use the sandbox?"
```

### 4. Use Shortcuts

Speed up your workflow:
- `Ctrl+K` for quick navigation
- Terminal commands for fast operations
- Agent heap for quick agent switching

### 5. Watch the Reasoning

Learn how AI thinks:
- Enable reasoning ticker
- Watch formulas and steps
- Understand the process

---

## Next Steps

1. **Try the Examples:** Work through each example above
2. **Explore Agents:** Chat with all 5 agents
3. **Build Something:** Create a real project
4. **Read the Docs:** Check out advanced features
5. **Join Community:** Share your creations

---

## Need Help?

- 📖 **Documentation:** [GitHub Wiki](https://github.com/snapkittywest/S-AUTOCODE/wiki)
- 💬 **Discussions:** [GitHub Discussions](https://github.com/snapkittywest/S-AUTOCODE/discussions)
- 🐛 **Bug Reports:** [GitHub Issues](https://github.com/snapkittywest/S-AUTOCODE/issues)
- 📧 **Email:** support@s-autocode.dev

---

**Happy Coding with S-AUTOCODE! 🚀**