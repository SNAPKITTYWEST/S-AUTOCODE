# Architecture

## S-AUTOCODE: 9-Layer Research Platform

```
┌─────────────────────────────────────────────────────────┐
│  Layer 9: Visualization (ASCII/SVG control flow)        │
├─────────────────────────────────────────────────────────┤
│  Layer 8: Lean 4 Verification (Formal proofs)           │
├─────────────────────────────────────────────────────────┤
│  Layer 7: Comparative Execution (Dual-backend check)    │
├─────────────────────────────────────────────────────────┤
│  Layer 6: SUBLEQ Emulator (Universal machine)           │
├─────────────────────────────────────────────────────────┤
│  Layer 5: Manchester Emulator (Drum latency model)      │
├─────────────────────────────────────────────────────────┤
│  Layer 4: Drum Latency Optimizer (Branch analysis)      │
├─────────────────────────────────────────────────────────┤
│  Layer 3: Translation (Signed → SUBLEQ)                 │
├─────────────────────────────────────────────────────────┤
│  Layer 2: Symbol Table (Deterministic mapping)          │
├─────────────────────────────────────────────────────────┤
│  Layer 1: Autocode Parser (Single-pass, no-AST)         │
└─────────────────────────────────────────────────────────┘
```

## Compilation Pipeline

1. **Parse**: Sign-prefixed Autocode → Statements (single-pass, no AST construction)
2. **Resolve**: Symbol table maps names to memory addresses deterministically
3. **Translate**: Statements → SUBLEQ instructions
4. **Emit**: SUBLEQ → Dual backends (pure SUBLEQ / Manchester Mark 1 orders)
5. **Optimize**: Branch analysis → latency-aware relocation → >20% drum-latency reduction
6. **Verify**: Lean 4 proofs for each layer

## Drum Latency Optimization

Manchester Mark 1 accessed a magnetic drum with mechanical seek latency.
The optimizer achieves >20% reduction by:
- Hot-block-first placement (frequently executed blocks on low-latency sectors)
- Loop header clustering (loops adjacent on drum surface)
- Edge-weighted CFG traversal (branch probabilities guide layout)
