# S-AUTOCODE User Guide
**Version 1.0** | Sign-Prefixed Linear Autocode → SUBLEQ → Manchester Mark 1

---

## Welcome to S-AUTOCODE

S-AUTOCODE is a sovereign symbolic runtime that compiles sign-prefixed linear Autocode to SUBLEQ (a one-instruction-set computer) and Manchester Mark 1 machine code, with formal verification through Lean 4 proofs.

**Live Demo:** https://snapkittywest.github.io/S-AUTOCODE/

---

## Quick Start

### 1. Open the Application
Navigate to https://snapkittywest.github.io/S-AUTOCODE/ in a modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+).

### 2. Wait for WASM to Load
The runtime status indicator (top right) will show:
- 🔄 **Loading WASM...** - Initializing
- ✓ **PRIMUS Ready** - Ready to use
- ⚠ **WASM Failed** - Fallback mode (limited features)

### 3. Try Your First Command
Type in the terminal at the bottom:
```
factorial 5
```
Press **Enter**. You should see:
```
5! = 120
```

---

## Terminal Commands

### Arithmetic Operations

#### Factorial
Compute factorial of a number (0-20):
```
factorial 5
→ 5! = 120

factorial 10
→ 10! = 3628800
```

#### Sum
Add multiple numbers:
```
sum 10 20 30
→ 10 + 20 + 30 = 60

sum 1 2 3 4 5 6 7 8 9 10
→ 1 + 2 + 3 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = 55
```

### S-Expressions

S-AUTOCODE supports Lisp-style S-expressions:

```
(factorial 5)
→ 5! = 120

(sum 1 2 3 4 5)
→ Sum = 15
```

### Navigation Commands

#### Help
Show all available commands:
```
help
```

#### Chain
View the WORM blockchain (immutable audit trail):
```
chain
```

#### Proofs
Show proof obligations status:
```
proofs
```

#### Memory
Display current memory state:
```
memory
```

#### Sandbox
Navigate to the 64-bit sandbox view:
```
sandbox
```

#### Agents
Navigate to the agent status board:
```
agents
```

#### Clear
Clear the terminal:
```
clear
```

#### Export
Download current session as JSON:
```
export
```

---

## Agent System

S-AUTOCODE includes 5 formal-system agents that work together to compile and verify code.

### How to Use Agents

1. **Select an Agent** - Click on an agent in the right panel
2. **Type Your Question** - Use the chat box at the bottom
3. **Watch the Reasoning** - See the agent's mathematical reasoning stream
4. **Get Response** - Agent responds based on its domain

### The 5 Agents

#### 1. FORGE (Compiler)
- **Trust Level:** HIGH
- **Domain:** Compilation
- **Role:** Compiles natural language to SUBLEQ assembly

**Example Questions:**
- "Compile a factorial function"
- "Generate code for sum of array"
- "Create a loop counter"

#### 2. SENTINEL (Security)
- **Trust Level:** HIGH
- **Domain:** Security & Verification
- **Role:** Monitors system integrity, verifies WORM chain

**Example Questions:**
- "Check system status"
- "Verify WORM chain integrity"
- "Scan for memory violations"

#### 3. ORACLE (Analyzer)
- **Trust Level:** MEDIUM
- **Domain:** Analysis & Optimization
- **Role:** Analyzes programs, detects bugs, verifies correctness

**Example Questions:**
- "Analyze factorial complexity"
- "Find bugs in my code"
- "Optimize this program"

#### 4. CODEX (Documentation)
- **Trust Level:** MEDIUM
- **Domain:** Documentation & Proofs
- **Role:** Writes documentation, generates formal proofs

**Example Questions:**
- "Explain how SUBLEQ works"
- "Document this function"
- "Generate proof for type safety"

#### 5. VAULT (Storage)
- **Trust Level:** HIGH
- **Domain:** Storage & WORM Chain
- **Role:** Manages program storage, seals receipts

**Example Questions:**
- "Save this program"
- "Load previous programs"
- "Show WORM receipts"

---

## Views & Navigation

### Observatory (Main View)
**Route:** `/` or `/observatory`

The default view with 5 panels:
- **Left:** Project explorer and symbol tree
- **Center:** Live agent pipeline and symbolic terminal
- **Right:** Agent inspector and chat
- **Bottom:** Memory tape, proofs, and widgets

### Sandbox (64-bit Computer)
**Route:** `/sandbox`

A sandboxed 64-bit computer simulation:
- Load programs
- Step through execution
- View registers and memory
- Trace self-modifying code

**Controls:**
- ▶ **Run** - Execute program to completion
- ⏭ **Step** - Execute one instruction
- ⏸ **Pause** - Pause execution
- 🔄 **Reset** - Reset to initial state
- ⬇ **Export** - Download execution trace

### WORM Chain Explorer
**Route:** `/worm`

View the immutable WORM (Write-Once-Read-Many) blockchain:
- Every computation is sealed
- SHA-256 cryptographic receipts
- Tamper-evident audit trail
- Click blocks to see details

### Proof Registry
**Route:** `/proofs`

View formal verification status:
- ✓ **Verified** - Proof complete
- ~ **In Progress** - Being verified
- ○ **Pending** - Not yet started

**Current Proofs:**
- Type Safety
- Termination
- Memory Bounds
- WORM Seal Integrity
- Backend Equivalence
- Relocation Correctness
- Integration
- Soundness

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| **Ctrl+K** | Open command palette |
| **Enter** | Execute terminal command |
| **Ctrl+L** | Clear terminal |
| **Esc** | Close modals/palettes |

---

## Understanding SUBLEQ

SUBLEQ (SUBtract and branch if Less than or EQual to zero) is a one-instruction-set computer (OISC).

### The Single Instruction

```
SUBLEQ a, b, c
```

**Semantics:**
1. `mem[a] = mem[a] - mem[b]` (subtract)
2. If `mem[a] <= 0`, jump to address `c`

### Why SUBLEQ?

- **Simplicity:** Only one instruction
- **Universality:** Turing-complete
- **Verifiability:** Easy to formally verify
- **Self-Modification:** Code and data share memory

### Sign-Prefixed Autocode

S-AUTOCODE uses a sign-prefixed syntax:

```
+3 5 2    # Subtract 5 from mem[3], jump to 2 if result <= 0
-3 0 3    # Conditional branch
+1 0 0    # Unconditional jump to 0
```

**Signs:**
- `+` = subtract operation
- `-` = branch on non-positive

---

## WORM Blockchain

Every computation in S-AUTOCODE is sealed in an immutable blockchain.

### What is WORM?

**WORM** = Write-Once-Read-Many

- Append-only ledger
- SHA-256 chained hashes
- Tamper-evident
- Cryptographic receipts

### Block Structure

```json
{
  "block": 0,
  "type": "BOOT",
  "data": { "system": "S-AUTOCODE", "version": "1.0.0" },
  "timestamp": 1720508400000,
  "hash": "a3f5...",
  "prevHash": "0000..."
}
```

### Verification

Every block contains:
- **Hash:** SHA-256 of block contents
- **Previous Hash:** Links to previous block
- **Timestamp:** When block was created
- **Data:** Computation details

To verify integrity:
1. Recompute hash of each block
2. Check hash matches stored hash
3. Check prevHash links to previous block
4. Verify genesis block

---

## Troubleshooting

### WASM Not Loading

**Symptoms:**
- Runtime status shows "WASM Failed"
- Commands don't execute
- Error toast appears

**Solutions:**
1. **Check Browser:** Use Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+
2. **Clear Cache:** Hard refresh with Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. **Check Console:** Open browser DevTools (F12) and check for errors
4. **Disable Extensions:** Some ad blockers may interfere with WASM

### Commands Not Working

**Symptoms:**
- Typing commands has no effect
- Terminal doesn't respond

**Solutions:**
1. **Click Terminal:** Ensure terminal input is focused
2. **Check Syntax:** Type `help` to see correct command syntax
3. **View Errors:** Check terminal output for error messages
4. **Reload Page:** Refresh the browser

### Agent Not Responding

**Symptoms:**
- Agent chat doesn't show response
- Reasoning stream stuck

**Solutions:**
1. **Select Agent:** Ensure an agent is selected (highlighted in right panel)
2. **Wait:** Reasoning may take 2-3 seconds
3. **Check Message:** Ensure you typed a message and pressed Enter
4. **Try Different Agent:** Switch to another agent

### Performance Issues

**Symptoms:**
- Slow execution
- UI lag
- Browser freezing

**Solutions:**
1. **Close Other Tabs:** Free up browser memory
2. **Reduce History:** Clear terminal with `clear` command
3. **Limit Steps:** For large programs, use step-by-step execution
4. **Check System:** Ensure adequate RAM and CPU available

---

## Advanced Features

### Self-Modifying Code

SUBLEQ's unified memory allows controlled self-modification:

```
# Modify instruction at address 3
+3 1 4    # mem[3] = mem[3] - 1
```

**Detection:**
- Every memory write is traced
- Self-modifications are flagged
- Execution receipts include modifications

### Drum Latency Optimization

S-AUTOCODE includes a drum latency optimizer inspired by the Manchester Mark 1:

1. **Profile:** Execute once, record instruction frequencies
2. **Analyze:** Build control-flow graph
3. **Optimize:** Reorder blocks to minimize rotational latency
4. **Verify:** Lean 4 proof that optimization preserves semantics

**Result:** >20% latency reduction

### Formal Verification

Every layer of S-AUTOCODE is formally verified in Lean 4:

- **Parser:** Deterministic parsing
- **Symbol Table:** Lookup correctness
- **Translation:** Length preservation
- **Backend:** Semantic equivalence
- **Relocation:** Injectivity preservation
- **Integration:** End-to-end correctness

---

## Examples

### Example 1: Simple Addition

```
# Terminal command
sum 42 58

# Output
42 + 58 = 100
```

### Example 2: Factorial

```
# Terminal command
factorial 7

# Output
7! = 5040
```

### Example 3: S-Expression

```
# Terminal command
(factorial 6)

# Output
6! = 720
```

### Example 4: WORM Chain

```
# Terminal command
chain

# Output
WORM BLOCKCHAIN:
[0000] BOOT       hash:a3f5...
[0001] COMPUTE    hash:b7e2...
[0002] COMPUTE    hash:c9d4...
```

---

## Best Practices

### 1. Start Simple
Begin with basic commands like `factorial 5` before trying complex programs.

### 2. Use Agents
Ask agents for help instead of guessing syntax.

### 3. Check WORM Chain
Verify your computations are sealed with the `chain` command.

### 4. Export Sessions
Regularly export your session with `export` to save your work.

### 5. Read Proofs
Check the `/proofs` view to understand what's formally verified.

---

## FAQ

### Q: What is S-AUTOCODE?
**A:** A research platform that compiles sign-prefixed Autocode to SUBLEQ and Manchester Mark 1 machine code, with formal verification.

### Q: Is it production-ready?
**A:** S-AUTOCODE is a research platform. Use for education and experimentation.

### Q: Can I write my own programs?
**A:** Yes! Use the sign-prefixed Autocode syntax or ask agents to generate code.

### Q: What browsers are supported?
**A:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+. WASM support required.

### Q: Is my data saved?
**A:** Sessions are saved in browser localStorage. Use `export` to download.

### Q: Can I contribute?
**A:** Yes! Visit https://github.com/SNAPKITTYWEST/S-AUTOCODE

### Q: What's the license?
**A:** SSL v1.0 | No commercial use | No AI training

---

## Getting Help

### In-App Help
- Type `help` in the terminal
- Ask agents questions
- Check `/proofs` for verification status

### Documentation
- **README.md** - Project overview
- **PRODUCTION_AUDIT.md** - Technical audit
- **PRODUCTION_ROADMAP.md** - Development plan
- **API.md** - API reference

### Community
- **GitHub:** https://github.com/SNAPKITTYWEST/S-AUTOCODE
- **Issues:** Report bugs and request features
- **Discussions:** Ask questions and share ideas

---

## Next Steps

1. **Try Commands** - Experiment with `factorial`, `sum`, and `chain`
2. **Talk to Agents** - Ask FORGE to compile a program
3. **Explore Views** - Navigate to `/sandbox` and `/worm`
4. **Read Proofs** - Check `/proofs` to see formal verification
5. **Export Session** - Save your work with `export`

---

**Welcome to the sovereign symbolic runtime. Happy coding!** 🚀