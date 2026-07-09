# S-AUTOCODE SOVEREIGN TERMINAL AGENT IDE — SCAFFOLD PLAN

## The Vision

A browser-native terminal where 5 formal-system agents (FORGE, SENTINEL, ORACLE, CODEX, VAULT) compile natural language into code mathematically via SUBLEQ, with a super strong agent chat box and IDE-grade code editor.

## The Architecture

```
╔══════════════════════════════════════════════════════════════════════════════════════╗
║                         S-AUTOCODE SOVEREIGN TERMINAL                               ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  USER INTERFACE                                                                │ ║
║  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐            │ ║
║  │  │  Agent Chat Box   │  │  Code Editor      │  │  Inspector       │            │ ║
║  │  │  (sovereign-emul) │  │  (Codiad + proj)  │  │  (Module Inspector)│           │ ║
║  │  │  agents → user    │  │  IDE-grade        │  │  real-time       │            │ ║
║  │  └──────────────────┘  └──────────────────┘  └──────────────────┘            │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  THIN LLM LAYER (nemotron-harness)                                              │ ║
║  │  EmojiCode persona → Syscall tokens → Policy gate → Receipts                    │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  MCP SERVER (snapkitty-mcp)                                                     │ ║
║  │  worm_seal · agent_build · ada_contract · twin_chat · sovereign_inject          │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  ALSTV LAYER (snapkitty-shell)                                                  │ ║
║  │  Backtick executor → Command registry (100+) → Governance gate → WORM           │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  AGENT LAYER (sovereign-emulator)                                               │ ║
║  │  11 agents · Prolog constitution · WORM ledger · Agent Heap                     │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  MEMORY LAYER (snapkitty-gitbucket)                                             │ ║
║  │  Memory buckets · Extractor pipeline · Multi-dimensional index                  │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  P/NP SWARM (snapkitty-agentos)                                                 │ ║
║  │  Skills as memories · ContextClip · Universe Sum · AXIOM                        │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  DATA PIPELINE (snapkitty-mirp)                                                 │ ║
║  │  Ingestor · Logic Engine · ML Engine · Auditor · Bifrost SDK                   │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  MODEL TRAINING (summon)                                                        │ ║
║  │  Build your own weights · Constitutional principles · QLoRA · WORM-sealed       │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  CI/CD PIPELINE (snapkitty-gitlab)                                              │ ║
║  │  Webhook → ROBOB → Frankenstein → GitLab MR / ABZU IDE                         │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  META-CATALOG (SNAPKIT)                                                         │ ║
║  │  22 Rust crates · 21 npm packages · 6 VS Code extensions · 10 bridge languages  │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  SUBLEQ CORE (S-AUTOCODE)                                                       │ ║
║  │  Deterministic execution · Autocode parser · WASM bindings                      │ ║
║  │  CODE GENERATION IS MATHEMATICAL, NOT LLM-BASED                                │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
║  ┌────────────────────────────────────────────────────────────────────────────────┐ ║
║  │  SOVEREIGN OS KERNEL (snap-os)                                                  │ ║
║  │  WORM chain · Capability system · S-expression parser · SoulVM JIT · soul-bus   │ ║
║  │  124 tests · 16 Rust crates · Ed25519 sealing · Cranelift JIT                  │ ║
║  └────────────────────────────────────────────────────────────────────────────────┘ ║
║                                                                                      ║
╚══════════════════════════════════════════════════════════════════════════════════════╝
```

## Implementation Phases

### Phase 1: Agent Chat Box (sovereign-emulator) — 400 lines

**Source:** `C:\Users\jessi\Desktop\sovereign-emulator\`

**What to build:**
- Super strong chat interface where agents communicate through the user
- Agent selection panel (11 agents with roles, trust levels, domains)
- Message history with WORM-sealed receipts
- Real-time agent status indicators
- Constitution gate visualization
- Proof obligation display

**Key components:**
- Agent heap visualization
- Constitution engine panel
- WORM ledger display
- Module inspector

**Files to create:**
- `src/components/AgentChatBox.tsx`
- `src/components/AgentHeap.tsx`
- `src/components/ConstitutionPanel.tsx`
- `src/components/WormLedger.tsx`
- `src/components/ModuleInspector.tsx`

---

### Phase 2: Code Editor (Codiad + projector-server) — 500 lines

**Source:** `C:\Users\jessi\Desktop\Codiad\` + `C:\Users\jessi\Desktop\projector-server\`

**What to build:**
- IDE-grade code editor in browser
- Multi-tab support
- Syntax highlighting (JetBrains Mono / VT323 / Space Mono)
- Line numbers
- Gutter annotations (proof obligations, WORM seals)
- Real-time code-forming animation
- Split pane support

**Key components:**
- Monaco editor integration
- Tab manager
- Syntax highlighter
- Line number gutter
- Animation engine

**Files to create:**
- `src/components/CodeEditor.tsx`
- `src/components/TabManager.tsx`
- `src/components/SyntaxHighlighter.tsx`
- `src/components/LineGutter.tsx`
- `src/components/AnimationEngine.tsx`

---

### Phase 3: Agent Heap (sovereign-emulator + agentos) — 200 lines

**Source:** `C:\Users\jessi\Desktop\sovereign-emulator\` + `C:\Users\jessi\Desktop\snapkitty-agentos\`

**What to build:**
- Shared memory tape for 5 agents (FORGE, SENTINEL, ORACLE, CODEX, VAULT)
- Tagged memory machine
- Agent lifecycle management
- Inter-agent message bus

**Key components:**
- Memory tape visualization
- Agent state machine
- Message bus
- Lifecycle manager

**Files to create:**
- `src/core/AgentHeap.ts`
- `src/core/MemoryTape.ts`
- `src/core/MessageBus.ts`
- `src/core/LifecycleManager.ts`

---

### Phase 4: Constitution Gate (sovereign-resonance-kernel + gitbucket) — 150 lines

**Source:** `C:\Users\jessi\Desktop\sovereign-resonance-kernel\` + `C:\Users\jessi\Desktop\snapkitty-gitbucket\`

**What to build:**
- Prolog-style rules for agent actions
- `can_execute(agent, action)` predicates
- Trust level checks
- Domain restrictions
- Resonance checks
- Council vote for HIGH-risk actions

**Key components:**
- Prolog runtime
- Rule evaluator
- Trust checker
- Council voting

**Files to create:**
- `src/core/ConstitutionGate.ts`
- `src/core/PrologRuntime.ts`
- `src/core/RuleEvaluator.ts`
- `src/core/CouncilVote.ts`

---

### Phase 5: WORM Chain (gitbucket + woz-vault + apple-ii) — 200 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-gitbucket\` + `C:\Users\jessi\Desktop\woz-vault\` + `C:\Users\jessi\Desktop\apple-ii-universal-machine\`

**What to build:**
- Append-only SHA-256 chained ledger
- Tamper-evident receipts
- Immutable audit trail
- World state dumps

**Key components:**
- Chain writer
- Chain verifier
- Receipt generator
- World dumper

**Files to create:**
- `src/core/WormChain.ts`
- `src/core/ChainWriter.ts`
- `src/core/ChainVerifier.ts`
- `src/core/ReceiptGenerator.ts`

---

### Phase 6: FORGE Agent (existing pipeline.js) — 300 lines

**Source:** `C:\Users\jessi\Desktop\S-AUTOCODE\pipeline.js`

**What to build:**
- Intent → S-expr → SUBLEQ compilation
- Decision graph builder
- Reasoning stream
- Confidence scoring

**Key components:**
- Intent parser
- S-expr compiler
- SUBLEQ backend
- Decision graph

**Files to create:**
- `src/agents/Forge.ts`
- `src/agents/Forge/IntentParser.ts`
- `src/agents/Forge/SexprCompiler.ts`
- `src/agents/Forge/SubleqBackend.ts`
- `src/agents/Forge/DecisionGraph.ts`

---

### Phase 7: SENTINEL Agent (existing verify logic) — 200 lines

**Source:** `C:\Users\jessi\Desktop\S-AUTOCODE\pipeline.js` (verify logic)

**What to build:**
- Execution verification
- Proof obligation checking
- Invariant validation
- Lean 4 proof generation

**Key components:**
- Verifier
- Proof checker
- Invariant checker
- Lean 4 generator

**Files to create:**
- `src/agents/Sentinel.ts`
- `src/agents/Sentinel/Verifier.ts`
- `src/agents/Sentinel/ProofChecker.ts`
- `src/agents/Sentinel/InvariantChecker.ts`

---

### Phase 8: ORACLE Agent (existing decision graph) — 150 lines

**Source:** `C:\Users\jessi\Desktop\S-AUTOCODE\pipeline.js` (decision graph)

**What to build:**
- Path prediction
- Optimal compilation path selection
- Risk assessment
- Recommendation engine

**Key components:**
- Path predictor
- Risk assessor
- Recommendation engine
- Decision tree

**Files to create:**
- `src/agents/Oracle.ts`
- `src/agents/Oracle/PathPredictor.ts`
- `src/agents/Oracle/RiskAssessor.ts`
- `src/agents/Oracle/RecommendationEngine.ts`

---

### Phase 9: CODEX Agent (existing sexpr.js) — 200 lines

**Source:** `C:\Users\jessi\Desktop\S-AUTOCODE\sexpr.js`

**What to build:**
- Multi-target code generation
- Same mathematical core → any language
- Rust, Python, JavaScript, C, Forth, WASM backends

**Key components:**
- Code generator
- Language backends
- Syntax transformer
- Output formatter

**Files to create:**
- `src/agents/Codex.ts`
- `src/agents/Codex/CodeGenerator.ts`
- `src/agents/Codex/RustBackend.ts`
- `src/agents/Codex/PythonBackend.ts`
- `src/agents/Codex/JavascriptBackend.ts`

---

### Phase 10: VAULT Agent (env-ship + seal.js) — 150 lines

**Source:** `C:\Users\jessi\Desktop\env-ship\` + `C:\Users\jessi\Desktop\S-AUTOCODE\seal.js`

**What to build:**
- SHA-256 receipt generation
- WORM chain management
- Tamper-evident sealing
- Audit trail

**Key components:**
- Receipt generator
- Chain sealer
- Audit trail
- Verification

**Files to create:**
- `src/agents/Vault.ts`
- `src/agents/Vault/ReceiptGenerator.ts`
- `src/agents/Vault/ChainSealer.ts`
- `src/agents/Vault/AuditTrail.ts`

---

### Phase 11: Inverted Skills Memory (agentos) — 200 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-agentos\`

**What to build:**
- Skills as sealed memories
- Skill registry
- Skill verification
- Skill composition

**Key components:**
- Skill memory
- Skill registry
- Skill verifier
- Skill composer

**Files to create:**
- `src/core/SkillMemory.ts`
- `src/core/SkillRegistry.ts`
- `src/core/SkillVerifier.ts`
- `src/core/SkillComposer.ts`

---

### Phase 12: P/NP Swarm Protocol (agentos) — 200 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-agentos\`

**What to build:**
- Claim → Solve → Verify → Converge
- Problem registry
- Solution pool
- Universe sum

**Key components:**
- Swarm protocol
- Problem registry
- Solution pool
- Universe sum

**Files to create:**
- `src/core/SwarmProtocol.ts`
- `src/core/ProblemRegistry.ts`
- `src/core/SolutionPool.ts`
- `src/core/UniverseSum.ts`

---

### Phase 13: Math Engine (agentos) — 300 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-agentos\`

**What to build:**
- APL, Fortran, Lean 4 integration
- Mathematical computation
- Formal verification
- Proof assistant

**Key components:**
- Math engine
- APL bridge
- Fortran bridge
- Lean 4 bridge

**Files to create:**
- `src/core/MathEngine.ts`
- `src/core/AplBridge.ts`
- `src/core/FortranBridge.ts`
- `src/core/Lean4Bridge.ts`

---

### Phase 14: Brand Aesthetic (lisp-machine + woz-vault) — 200 lines

**Source:** `C:\Users\jessi\Desktop\lisp-machine\` + `C:\Users\jessi\Desktop\woz-vault\`

**What to build:**
- CRT aesthetic
- Phosphor green (#00ff41)
- Void black (#0a0a0a)
- Amber (#ffb000)
- JetBrains Mono / VT323 / Space Mono fonts
- Scanline effects
- Agent orbs

**Key components:**
- CRT effect
- Color palette
- Font loader
- Scanline overlay
- Agent orbs

**Files to create:**
- `src/ui/CrtEffect.ts`
- `src/ui/ColorPalette.ts`
- `src/ui/FontLoader.ts`
- `src/ui/ScanlineOverlay.ts`
- `src/ui/AgentOrbs.ts`

---

### Phase 15: Real-time Animation (new) — 300 lines

**Source:** New

**What to build:**
- Code forming animation
- Syntax moving in real time
- Execution replay
- Decision graph animation

**Key components:**
- Animation engine
- Code formatter
- Replay player
- Graph animator

**Files to create:**
- `src/animation/AnimationEngine.ts`
- `src/animation/CodeFormatter.ts`
- `src/animation/ReplayPlayer.ts`
- `src/animation/GraphAnimator.ts`

---

### Phase 16: Thin LLM Layer (nemotron-harness) — 200 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-nemotron-harness\`

**What to build:**
- LLM as governed agent
- 18 syscall tokens
- Policy gate (Prolog)
- SHA-256 receipts
- Trust Deed
- Lean 4 gates

**Key components:**
- Harness
- Syscall extractor
- Policy gate
- Receipt generator

**Files to create:**
- `src/core/ThinLlmLayer.ts`
- `src/core/SyscallExtractor.ts`
- `src/core/PolicyGate.ts`
- `src/core/ReceiptGenerator.ts`

---

### Phase 17: ALSTV Layer (snapkitty-shell) — 400 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-shell\`

**What to build:**
- Backtick executor
- Command registry (100+ commands)
- Governance gate (NACK tick)
- WORM chain (SHA-256 + ML-DSA-65 PQ)

**Key components:**
- Backtick executor
- Command registry
- Governance gate
- WORM chain

**Files to create:**
- `src/core/AlstvLayer.ts`
- `src/core/BacktickExecutor.ts`
- `src/core/CommandRegistry.ts`
- `src/core/GovernanceGate.ts`

---

### Phase 18: MCP Server (snapkitty-mcp) — 200 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-mcp\`

**What to build:**
- WORM chain
- Agent Builder (5 classes)
- Ada Contracts
- Digital Twin (Ollama)
- Sovereign Inject (Mamba SSM)

**Key components:**
- MCP server
- Agent builder
- Contract generator
- Twin chat

**Files to create:**
- `src/core/McpServer.ts`
- `src/core/AgentBuilder.ts`
- `src/core/ContractGenerator.ts`
- `src/core/TwinChat.ts`

---

### Phase 19: Data Pipeline (snapkitty-mirp) — 300 lines

**Source:** `C:\Users\jessi\Desktop\snapkitty-mirp\`

**What to build:**
- Data ingestion
- Rule evaluation
- ML predictions
- WORM sealing

**Key components:**
- Ingestor
- Logic engine
- ML engine
- Auditor

**Files to create:**
- `src/core/DataPipeline.ts`
- `src/core/Ingestor.ts`
- `src/core/LogicEngine.ts`
- `src/core/MlEngine.ts`

---

### Phase 20: Meta-Catalog (SNAPKIT) — 200 lines

**Source:** `C:\Users\jessi\Desktop\SNAPKIT\`

**What to build:**
- Package registry
- Catalog viewer
- Brand assets
- Documentation

**Key components:**
- Catalog viewer
- Package registry
- Brand assets
- Documentation

**Files to create:**
- `src/ui/CatalogViewer.ts`
- `src/core/PackageRegistry.ts`
- `src/ui/BrandAssets.ts`
- `src/core/Documentation.ts`

---

### Phase 21: Integration (wire everything together) — 500 lines

**Source:** New

**What to build:**
- Wire all components together
- Event bus
- State management
- Error handling
- Testing

**Key components:**
- Event bus
- State manager
- Error handler
- Test runner

**Files to create:**
- `src/core/EventBus.ts`
- `src/core/StateManager.ts`
- `src/core/ErrorHandler.ts`
- `src/core/TestRunner.ts`

---

### Phase 22: CSS/HTML specs from user — pending

**Source:** User will provide

**What to build:**
- Apply CSS/HTML specs to the terminal
- Brand the UI
- Apply color palette
- Apply fonts
- Apply effects

**Key components:**
- CSS variables
- HTML structure
- Brand application
- Effect application

**Files to create:**
- `src/styles/variables.css`
- `src/styles/effects.css`
- `src/styles/fonts.css`
- `index.html`

---

### Phase 23: Sovereign OS Kernel (snap-os) — 800 lines

**Source:** `C:\Users\jessi\Desktop\snap-os\`

**What to build:**
- Cherry-pick foundational components from snap-os into S-AUTOCODE
- WORM chain (canonical Rust implementation)
- Capability system (CSpace, Rights, mint, revoke)
- S-expression parser (replaces sexpr.js)
- SoulVM JIT (Cranelift) for SUBLEQ execution
- Inter-agent message bus (soul-bus)

**Key components to cherry-pick:**
1. **bifrost** — WORM audit chain, DAG, Ed25519 sealing (31 tests)
   - `bifrost/src/worm.rs` — WORM chain append
   - `bifrost/src/dag.rs` — Merkle DAG
   - `bifrost/src/seal.rs` — Ed25519 sealing
   - `bifrost/src/event.rs` — Event types
   - `bifrost/src/verify.rs` — Chain verification

2. **silverback** — Capability system (21 tests)
   - `silverback/src/capability/rights.rs` — Rights bitflags (READ, WRITE, INVOKE, DELEGATE, SEAL)
   - `silverback/src/capability/cnode.rs` — CSpace, CNode, Cap pointers
   - `silverback/src/capability/mint.rs` — mint, transfer, revoke, seal

3. **fontan-lisopp** — S-expression parser (12 tests)
   - `fontan-lisopp/src/lib.rs` — Full parser/printer (replaces sexpr.js)
   - Supports: atoms, keywords, lists, vectors, maps, tagged bytes, integers, floats

4. **soulvm** — Cranelift JIT, Immix GC, BifrostBridge (21 tests)
   - `soulvm/src/bytecode.rs` — SoulFunc bytecode (Instruction, ValType)
   - `soulvm/src/jit.rs` — Cranelift JIT engine
   - `soulvm/src/gc/` — Immix garbage collector
   - `soulvm/src/bridge.rs` — BifrostBridge (seals JIT compiles to WORM)

5. **craft-crypto** — Dialect compiler (9 tests)
   - `craft-crypto/src/lib.rs` — Dialect trait, SigilOp, BinOp, compile_and_seal
   - `craft-crypto/src/emoji.rs` — EmojiScript dialect

6. **soul-bus** — Inter-agent routing (4 tests)
   - `soul-bus/src/bus.rs` — SoulBus registry, load, call, broadcast

**Integration points:**
- Replace `sexpr.js` with `fontan-lisopp` (Rust → WASM)
- Use `bifrost` for WORM chain in WASM bindings
- Use `silverback` for agent capability checks
- Use `soul-bus` for inter-agent message routing
- Use `craft-crypto` for dialect compilation

**Files to create:**
- `src/kernel/bifrost.rs` — WORM chain (from bifrost)
- `src/kernel/silverback.rs` — Capability system (from silverback)
- `src/kernel/fontan.rs` — S-expression parser (from fontan-lisopp)
- `src/kernel/soulvm.rs` — JIT engine (from soulvm)
- `src/kernel/soulbus.rs` — Message bus (from soul-bus)
- `src/kernel/craft.rs` — Dialect compiler (from craft-crypto)

---

## Total Lines

| Phase | Component | Lines |
|-------|-----------|-------|
| 1 | Agent Chat Box | 400 |
| 2 | Code Editor | 500 |
| 3 | Agent Heap | 200 |
| 4 | Constitution Gate | 150 |
| 5 | WORM Chain | 200 |
| 6 | FORGE Agent | 300 |
| 7 | SENTINEL Agent | 200 |
| 8 | ORACLE Agent | 150 |
| 9 | CODEX Agent | 200 |
| 10 | VAULT Agent | 150 |
| 11 | Inverted Skills Memory | 200 |
| 12 | P/NP Swarm Protocol | 200 |
| 13 | Math Engine | 300 |
| 14 | Brand Aesthetic | 200 |
| 15 | Real-time Animation | 300 |
| 16 | Thin LLM Layer | 200 |
| 17 | ALSTV Layer | 400 |
| 18 | MCP Server | 200 |
| 19 | Data Pipeline | 300 |
| 20 | Meta-Catalog | 200 |
| 21 | Integration | 500 |
| 22 | CSS/HTML specs | pending |
| 23 | Sovereign OS Kernel | 800 |
| **Total** | | **~5,950 lines** |

---

## Source Map

| Source Repo | Target Component | Lines |
|-------------|-----------------|-------|
| **sovereign-emulator** | Agent Chat Box, Agent Heap | 600 |
| **Codiad** | Code Editor | 250 |
| **projector-server** | Code Editor | 250 |
| **sovereign-resonance-kernel** | Constitution Gate | 150 |
| **snapkitty-gitbucket** | Constitution Gate, WORM Chain | 200 |
| **S-AUTOCODE** | FORGE, SENTINEL, ORACLE, CODEX, VAULT | 1,050 |
| **env-ship** | VAULT Agent | 150 |
| **snapkitty-agentos** | Inverted Skills, P/NP Swarm, Math Engine | 700 |
| **lisp-machine** | Brand Aesthetic | 100 |
| **woz-vault** | Brand Aesthetic, WORM Chain | 100 |
| **apple-ii-universal-machine** | WORM Chain | 100 |
| **snapkitty-nemotron-harness** | Thin LLM Layer | 200 |
| **snapkitty-shell** | ALSTV Layer | 400 |
| **snapkitty-mcp** | MCP Server | 200 |
| **snapkitty-mirp** | Data Pipeline | 300 |
| **SNAPKIT** | Meta-Catalog | 200 |
| **snap-os** | Sovereign OS Kernel (WORM, Capabilities, SoulVM, soul-bus) | 800 |
| **new** | Real-time Animation, Integration | 800 |

---

## Implementation Order

1. **Phase 1-2**: UI Layer (Agent Chat Box + Code Editor) — 900 lines
2. **Phase 3-5**: Core Layer (Agent Heap + Constitution Gate + WORM Chain) — 550 lines
3. **Phase 6-10**: Agent Layer (FORGE, SENTINEL, ORACLE, CODEX, VAULT) — 1,050 lines
4. **Phase 11-13**: Intelligence Layer (Skills, P/NP Swarm, Math Engine) — 700 lines
5. **Phase 14-15**: Presentation Layer (Brand Aesthetic + Animation) — 500 lines
6. **Phase 16-18**: Integration Layer (Thin LLM + ALSTV + MCP) — 800 lines
7. **Phase 19-20**: Data Layer (Data Pipeline + Meta-Catalog) — 500 lines
8. **Phase 21-22**: Final Integration (Wire everything + CSS/HTML) — pending
9. **Phase 23**: Sovereign OS Kernel (snap-os cherry-pick) — 800 lines

---

## Next Steps

1. Wait for CSS/HTML specs from user
2. Apply CSS/HTML specs to the terminal
3. Cherry-pick snap-os components into S-AUTOCODE kernel
4. Start building Phase 1: Agent Chat Box
4. Continue through all phases
5. Test and verify
6. Deploy to GitHub Pages

---

**Remember: Many syntaxes → One substrate → Verified execution → Sealed receipt**
