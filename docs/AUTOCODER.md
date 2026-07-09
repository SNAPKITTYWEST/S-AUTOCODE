# S-AUTOCODE Autocoder Guide

S-AUTOCODE is a root-level autocoder platform.

It accepts multiple surface syntaxes, normalizes them into sign-prefixed linear Autocode, lowers them into SUBLEQ unified memory, executes them inside a deterministic sandbox, and verifies behavior through comparative execution and Lean 4 proof witnesses.

## Pipeline

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

## Core Rule

All syntax must eventually reduce to the same substrate:

**SUBLEQ unified memory tape.**

No syntax receives privileged execution.

## Self-Modifying Code Model

SUBLEQ code and data share one memory space.

A program may modify future instructions by writing to addresses that will later be interpreted as instruction fields.

This is allowed only inside the emulator sandbox.

The sandbox records:

- instruction pointer
- operands
- modified addresses
- pre-state
- post-state
- branch decision
- halt condition
- receipt hash

## Safety Rule

Self-modifying code is permitted for historical computing research, compiler research, proof systems, and emulator development.

It must not be used to generate malware, evade analysis, bypass security controls, or execute unauthorized code on host systems.

## Backends

1. **Pure SUBLEQ backend** - Unified memory execution with self-modification detection
2. **Manchester Mark 1 backend** - Historical accuracy with CRT store and magnetic drum timing
3. **Trace backend** - Comparative execution verification
4. **Lean witness backend** - Formal proof generation and verification

## Definition of Done

A generated program is accepted only when:

1. It parses successfully.
2. It lowers to valid Autocode.
3. It assembles to SUBLEQ tape.
4. It executes deterministically.
5. It does not violate sandbox bounds.
6. Its trace matches the expected semantic witness.
7. Its receipt is sealed.

## Architecture Principles

### Substrate Collapse

Many syntaxes → one universal execution tape.

The goal is not transpilation. The goal is substrate collapse.

### Memory-Instruction Duality

SUBLEQ's memory-instruction duality is the theoretical key to unlocking a verified self-modifying loop—something impossible in multi-opcode ISAs without heavyweight JIT infrastructure.

### Deterministic Execution

Every execution is deterministic and traceable. The sandbox ensures:
- Bounded memory access
- Recorded state transitions
- Verifiable execution traces
- Cryptographic receipts

### Verification First

Programs are not "compiled and run." They are:
1. Lowered to substrate
2. Executed in sandbox
3. Traced completely
4. Verified formally
5. Sealed cryptographically

## Usage Examples

### Basic SUBLEQ Program

```rust
use autocode_emulator::{SubleqMachine, SelfModificationAnalyzer};

let mut machine = SubleqMachine::new(1024);
// Load program...
machine.run().expect("Execution failed");

let report = machine.get_self_modification_report();
let analyzer = SelfModificationAnalyzer::new(5);
let analysis = analyzer.analyze(&report);

println!("Self-modifications: {}", analysis.instruction_field_writes);
```

### Verification Witness

```rust
use autocode_emulator::{VerificationWitness, SealedWitness};

let initial_mem = machine.get_memory().to_vec();
// ... execute ...
let final_mem = machine.get_memory().to_vec();

let witness = VerificationWitness::from_trace(
    &initial_mem,
    &final_mem,
    &machine.trace,
    &machine.self_modifications,
);

let sealed = witness.seal();
println!("Receipt: {}", sealed.receipt);
```

## Frontend Adapters

Each language frontend must output the same object:

```rust
pub struct AutocodeProgram {
    pub source_language: String,
    pub statements: Vec<AutocodeStatement>,
    pub symbols: SymbolTable,
    pub provenance: Provenance,
}
```

Supported frontends (planned):
- FORTRAN (historical lineage)
- Lisp (symbolic computation)
- Prolog (logic programming)
- Brainfuck (minimalism)
- C-like (imperative)
- APL (array processing)
- Pseudocode (natural language)

## Historical Context

S-AUTOCODE traces its lineage to:

1. **Autocode (1952)** - First compiled high-level language (Alick Glennie, Manchester Mark 1)
2. **FORTRAN (1957)** - First widely-adopted compiled language
3. **SUBLEQ** - One-instruction set computer (theoretical minimalism)
4. **Manchester Mark 1** - First stored-program computer with unified memory

This is not nostalgia. This is **root architecture**.

## Research Applications

- Compiler verification
- Self-modifying code analysis
- Historical computing reconstruction
- Minimal instruction set research
- Formal methods in systems programming
- Cyber-physical control loops

## Contributing

See `AGENTS.md` for agent rules and contribution guidelines.

## License

See repository root for license information.