# S-AUTOCODE | Project PRIMUS

**Sign-Prefixed Linear Autocode -> SUBLEQ -> Manchester Mark 1**

Ahmad Ali Parr | the-49th-call | SNAPKITTYWEST

---

## Mission

S-AUTOCODE is a 9-layer research platform that compiles sign-prefixed linear
Autocode to SUBLEQ (a one-instruction-set computer) and Manchester Mark 1
machine code, with formal verification through Lean 4 proofs.

### Why This Exists

In 1948, the Manchester Mark 1 stored-program computer faced a critical
bottleneck: magnetic drum memory. Programs suffered from rotational latency --
accessing data at different physical locations required waiting for the drum
to rotate to the correct position. This was the original motivation for the
drum-latency optimizer.

S-AUTOCODE recreates this historical problem and solves it with modern
techniques: branch-aware memory layout, latency-driven relocation, and
formal verification that the optimized program is semantically equivalent
to the original.

### The Autocode Language

Autocode is a sign-prefixed linear language where each instruction maps
1:1 to SUBLEQ:

```
+3 5 2       ; Subtract 5 from Mem[3], jump to 2 if result <= 0
-3 0 3       ; Conditional branch
+1 0 0       ; Unconditional jump to 0
```

Signs: `+` = subtract, `-` = branch on non-positive.
Three operands per line: address, value, next-address.

This syntax is deliberately minimal -- no parser complexity, no AST
construction, no semantic analysis. The compiler is a single pass that
emits instructions as it reads tokens.

## Architecture

```
+-------------------------------------------------------------+
|  Layer 9 | Visualization      | ASCII/SVG control flow     |
|  Layer 8 | Lean 4 Proofs      | Formal verification        |
|  Layer 7 | Comparative Exec   | Dual-backend check         |
|  Layer 6 | SUBLEQ Emulator    | Universal machine          |
|  Layer 5 | Manchester Emulator| Drum latency model         |
|  Layer 4 | Drum Optimizer     | Branch-aware relocation    |
|  Layer 3 | Translation        | Signed -> SUBLEQ           |
|  Layer 2 | Symbol Table       | Deterministic mapping      |
|  Layer 1 | Autocode Parser    | Single-pass, no-AST        |
+-------------------------------------------------------------+
```

### Compilation Pipeline

1. **Parse**: Sign-prefixed Autocode -> Statements (single-pass, no AST)
2. **Resolve**: Symbol table maps names to memory addresses deterministically
3. **Translate**: Statements -> SUBLEQ instructions
4. **Emit**: SUBLEQ -> Dual backends (pure SUBLEQ / Manchester Mark 1 orders)
5. **Optimize**: Branch analysis -> latency-aware relocation -> >20% drum-latency reduction
6. **Verify**: Lean 4 proofs for each layer

### Drum Latency Optimization

The optimizer achieves >20% latency reduction through:

1. **Branch Profiling** -- Execute once, record instruction frequencies
2. **CFG Construction** -- Build weighted control-flow graph
3. **Block Ordering** -- Hot blocks first, loop headers clustered
4. **Address Assignment** -- Latency-aware memory layout
5. **Equivalence Check** -- Lean 4 proof that relocation preserves semantics

## Autocoder Mode

S-AUTOCODE now supports **Autocoder Mode** — a root-level autocoder platform.

Autocoder Mode allows multiple surface syntaxes to compile into a shared root substrate: sign-prefixed Autocode lowered to SUBLEQ unified memory.

Because SUBLEQ stores code and data in the same tape, the emulator supports controlled self-modifying code inside a deterministic sandbox.

Every mutation is traced, every branch is recorded, and every accepted run must produce a verification witness.

**The goal is not transpilation. The goal is substrate collapse:**

```
Many syntaxes → One universal execution tape
```

### Self-Modifying Code Model

SUBLEQ's **memory-instruction duality** is the theoretical key to unlocking a verified self-modifying loop—something impossible in multi-opcode ISAs without heavyweight JIT infrastructure.

The sandbox records:
- Instruction pointer
- Operands
- Modified addresses
- Pre-state and post-state
- Branch decisions
- Halt conditions
- Cryptographic receipt hash

### Verification Pipeline

```
Surface Syntax
→ Grammar Adapter
→ Sign-Prefixed Linear Autocode
→ SUBLEQ Tape
→ Self-Modifying Execution
→ Manchester Backend
→ Comparative Trace
→ Lean Witness
→ SHA-256 Receipt
```

See `docs/AUTOCODER.md` for complete documentation.

## Current Status

**Working:**
- Autocode parser (single-pass, no AST)
- SUBLEQ backend with unified code/data memory ✨ **NEW**
- Self-modification detection and tracing ✨ **NEW**
- Manchester backend (compiles to Manchester Mark 1 orders)
- Branch analyzer (CFG construction, loop detection)
- Drum latency model (rotational latency calculation)
- Heuristic relocator (block ordering, address assignment)
- Lean 4 verification files (8 proof files) ✨ **EXPANDED**
- Verification witness generation ✨ **NEW**
- Frontend (GitHub Pages, Technical Brutalism aesthetic)

**Recent Fixes:**
- ✅ SUBLEQ emulator now uses unified memory (code and data share address space)
- ✅ Self-modifying writes are detected and traced
- ✅ Memory writes include instruction field detection
- ✅ Execution traces include full state transitions
- ✅ Cryptographic receipts seal execution witnesses

## Build

```bash
cargo build --release          # All crates
cargo test --workspace         # Run all tests
```

## Verification

```
Lean 4 files in src/verification/:
  Parser.lean           -- Parsing determinism
  SymbolTable.lean      -- Lookup correctness
  Translation.lean      -- Length preservation
  BackendEquivalence.lean -- Semantic equivalence
  Relocation.lean       -- Injectivity preservation
  Integration.lean      -- Full pipeline
```

## Project Structure

```
S-AUTOCODE/
  Cargo.toml              # Workspace
  index.html              # Frontend (GitHub Pages)
  examples/               # Autocode programs
    simple_add.ac
    multiply.ac
    factorial.ac
    fibonacci.ac
  src/
    compiler/             # Layer 1-3: Parser, Symbol Table, Translation
    emulator/             # Layer 5-6: Manchester, SUBLEQ, Comparative
    optimizer/            # Layer 4: Branch analysis, Drum model, Relocator
    visualization/        # Layer 9: Memory map, Branch graph, Timeline
    verification/         # Layer 8: Lean 4 formal proofs
  docs/
    ARCHITECTURE.md
    HISTORICAL_NOTES.md
    RESEARCH_HYPOTHESIS.md
  README.md
```

## References

- Manchester Mark 1 (1948-1951), University of Manchester
- SUBLEQ OISC, A. O. P. Solis (1972)
- Williams-Kilburn tube, University of Manchester

---

**License**: SSL v1.0 | No commercial use | No AI training
**Contact**: Ahmad Ali Parr | SNAPKITTYWEST
