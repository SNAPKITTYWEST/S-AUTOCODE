# S-AUTOCODE API Reference
**Version 1.0** | WASM Bindings & JavaScript API

---

## Overview

S-AUTOCODE exposes a WASM-based API for compiling and executing sign-prefixed Autocode programs. This document describes all public functions and data structures.

---

## WASM Functions

All WASM functions are exported from the `autocode_wasm` module and can be called from JavaScript after the module is loaded.

### Loading the WASM Module

```javascript
// Import and initialize
const wasmModule = await import('./autocode_wasm.js');
await wasmModule.default();

// Module is now ready to use
const result = wasmModule.compile_source("+3 5 2");
```

---

## Core Functions

### `compile_source(source: string): string`

Compiles Autocode source code to SUBLEQ instructions.

**Parameters:**
- `source` (string) - Sign-prefixed Autocode source code

**Returns:**
- JSON string containing array of SUBLEQ instructions

**Example:**
```javascript
const source = `
+3 5 2
-3 0 3
+1 0 0
`;

const instrsJson = wasmModule.compile_source(source);
const instrs = JSON.parse(instrsJson);

console.log(instrs);
// Output: [
//   { a: 3, b: 5, c: 2 },
//   { a: 3, b: 0, c: 3 },
//   { a: 1, b: 0, c: 0 }
// ]
```

**Error Handling:**
```javascript
try {
    const instrs = wasmModule.compile_source(source);
} catch (e) {
    console.error('Compilation failed:', e);
}
```

---

### `compile_and_run(source: string): MachineState`

Compiles and executes an Autocode program, returning the final machine state.

**Parameters:**
- `source` (string) - Sign-prefixed Autocode source code

**Returns:**
- `MachineState` object with execution results

**Example:**
```javascript
const source = "+3 5 2\n-3 0 3";
const state = wasmModule.compile_and_run(source);

console.log('PC:', state.pc);
console.log('Halted:', state.halted);
console.log('Steps:', state.step_count);
console.log('Memory:', state.memory_json());
console.log('Trace:', state.trace_json());
```

**Use Cases:**
- Quick execution of small programs
- Testing and validation
- One-shot computations

---

### `run_step_by_step(source: string, max_steps: number): MachineState`

Executes a program step-by-step with a maximum step limit.

**Parameters:**
- `source` (string) - Sign-prefixed Autocode source code
- `max_steps` (number) - Maximum number of steps to execute

**Returns:**
- `MachineState` object with execution results

**Example:**
```javascript
// Execute up to 100 steps
const state = wasmModule.run_step_by_step(source, 100);

if (!state.halted) {
    console.log('Program did not complete in 100 steps');
    console.log('Current PC:', state.pc);
}
```

**Use Cases:**
- Debugging long-running programs
- Preventing infinite loops
- Interactive step-through execution

---

### `parse_single_line(line: string): string`

Parses a single line of Autocode into its components.

**Parameters:**
- `line` (string) - Single line of sign-prefixed Autocode

**Returns:**
- JSON string with parsed components

**Example:**
```javascript
const parsed = wasmModule.parse_single_line("+3 5 2");
const data = JSON.parse(parsed);

console.log(data);
// Output: {
//   sign: "+",
//   addr: 3,
//   value: 5,
//   next: 2,
//   instr: { a: 3, b: 4, c: 2 }
// }
```

**Use Cases:**
- Syntax validation
- Interactive editors
- Line-by-line parsing

---

### `self_mod_analysis(source: string): string`

Analyzes a program for self-modifying code patterns.

**Parameters:**
- `source` (string) - Sign-prefixed Autocode source code

**Returns:**
- JSON string with self-modification report

**Example:**
```javascript
const report = wasmModule.self_mod_analysis(source);
const data = JSON.parse(report);

console.log('Modifications detected:', data.modifications.length);
console.log('Modified addresses:', data.modified_addresses);
```

**Report Structure:**
```typescript
interface SelfModificationReport {
    modifications: Array<{
        step: number;
        address: number;
        old_value: number;
        new_value: number;
    }>;
    modified_addresses: number[];
    is_self_modifying: boolean;
}
```

---

## Data Structures

### MachineState

Represents the state of the SUBLEQ machine after execution.

**Properties:**
- `pc` (number) - Program counter
- `halted` (boolean) - Whether execution has halted
- `step_count` (number) - Number of steps executed

**Methods:**

#### `memory_len(): number`
Returns the size of the memory array.

#### `get_memory_cell(addr: number): number`
Gets the value at a specific memory address.

**Example:**
```javascript
const value = state.get_memory_cell(5);
console.log('Memory[5] =', value);
```

#### `set_memory_cell(addr: number, val: number): void`
Sets the value at a specific memory address.

**Example:**
```javascript
state.set_memory_cell(5, 42);
```

#### `trace_len(): number`
Returns the number of trace events.

#### `get_trace_step(idx: number): StepResult`
Gets a specific trace event by index.

**Example:**
```javascript
for (let i = 0; i < state.trace_len(); i++) {
    const step = state.get_trace_step(i);
    console.log(`Step ${step.step}: PC=${step.pc}`);
}
```

#### `memory_json(): string`
Returns non-zero memory cells as JSON.

**Example:**
```javascript
const memJson = state.memory_json();
const memory = JSON.parse(memJson);
// Output: [[0, 42], [1, 100], [5, 7]]
```

#### `trace_json(): string`
Returns execution trace as JSON.

**Example:**
```javascript
const traceJson = state.trace_json();
const trace = JSON.parse(traceJson);
```

#### `self_mod_json(): string`
Returns self-modification report as JSON.

---

### StepResult

Represents a single execution step.

**Structure:**
```typescript
interface StepResult {
    step: number;           // Step number
    pc: number;             // Program counter
    a: number;              // Operand A address
    b: number;              // Operand B address
    c: number;              // Operand C address (jump target)
    before_a: number;       // Value at A before execution
    before_b: number;       // Value at B before execution
    after_b: number;        // Value at B after execution
    branch_taken: boolean;  // Whether branch was taken
}
```

**Example:**
```javascript
const step = state.get_trace_step(0);
console.log(`Step ${step.step}:`);
console.log(`  SUBLEQ ${step.a}, ${step.b}, ${step.c}`);
console.log(`  mem[${step.a}] = ${step.before_a} - ${step.before_b} = ${step.after_b}`);
if (step.branch_taken) {
    console.log(`  Branch taken to ${step.c}`);
}
```

---

## JavaScript API

### Sandbox64 Class

A 64-bit computer simulation for testing and debugging.

**Constructor:**
```javascript
const sandbox = new Sandbox64();
```

**Methods:**

#### `reset(): void`
Resets the sandbox to initial state.

```javascript
sandbox.reset();
```

#### `loadProgram(instructions: Array): void`
Loads a program into the sandbox.

```javascript
const program = [
    { op: 'MOV', dest: 'RAX', src: 42 },
    { op: 'ADD', dest: 'RAX', src: 10 },
    { op: 'HLT' }
];
sandbox.loadProgram(program);
```

#### `step(): boolean`
Executes one instruction. Returns `false` if halted.

```javascript
while (sandbox.step()) {
    console.log('PC:', sandbox.pc);
}
```

#### `run(maxSteps?: number): Object`
Runs the program to completion or max steps.

```javascript
const state = sandbox.run(1000);
console.log('Final state:', state);
```

#### `getState(): Object`
Returns current machine state.

```javascript
const state = sandbox.getState();
console.log('Registers:', state.registers);
console.log('Memory:', state.memory);
console.log('Trace:', state.trace);
```

#### `exportState(): string`
Exports state as JSON string.

```javascript
const json = sandbox.exportState();
localStorage.setItem('sandbox-state', json);
```

---

### WormChain Class

Immutable blockchain for sealing computations.

**Constructor:**
```javascript
const worm = new WormChain();
```

**Methods:**

#### `append(type: string, data: Object): void`
Appends a new block to the chain.

```javascript
worm.append('COMPUTE', {
    op: 'factorial',
    input: 5,
    output: 120
});
```

#### `getChain(): Array`
Returns the entire blockchain.

```javascript
const chain = worm.getChain();
chain.forEach(block => {
    console.log(`Block ${block.block}: ${block.type}`);
});
```

#### `verify(): boolean`
Verifies chain integrity.

```javascript
if (worm.verify()) {
    console.log('Chain is valid');
} else {
    console.error('Chain is corrupted!');
}
```

#### `getBlock(index: number): Object`
Gets a specific block by index.

```javascript
const genesis = worm.getBlock(0);
console.log('Genesis block:', genesis);
```

---

## Error Handling

### WASM Errors

WASM functions may throw errors during compilation or execution:

```javascript
try {
    const state = wasmModule.compile_and_run(source);
} catch (e) {
    if (e.message.includes('parse')) {
        console.error('Syntax error in source code');
    } else if (e.message.includes('memory')) {
        console.error('Out of memory');
    } else {
        console.error('Execution error:', e.message);
    }
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Parse error` | Invalid syntax | Check Autocode syntax |
| `Memory overflow` | Program too large | Reduce program size |
| `Infinite loop` | No halt condition | Add halt or use `run_step_by_step` |
| `Invalid address` | Out of bounds access | Check memory addresses |

---

## Performance Considerations

### Memory Usage

- Default memory size: 1024 cells
- Each cell: 64-bit signed integer
- Total: ~8KB per machine

### Execution Speed

- WASM execution: ~1M instructions/second
- JavaScript overhead: ~10-20%
- Typical program: <1ms

### Optimization Tips

1. **Use `compile_source` for syntax checking only**
   ```javascript
   // Fast syntax check
   const instrs = wasmModule.compile_source(source);
   ```

2. **Limit trace collection for long programs**
   ```javascript
   // Disable trace for performance
   const state = wasmModule.run_step_by_step(source, 10000);
   ```

3. **Batch operations**
   ```javascript
   // Compile once, run multiple times
   const instrs = wasmModule.compile_source(source);
   // ... reuse instrs ...
   ```

---

## Examples

### Example 1: Compile and Execute

```javascript
const source = `
# Factorial of 5
+0 5 1
+1 1 2
+2 0 3
+1 2 4
+2 1 5
+5 0 2
`;

const state = wasmModule.compile_and_run(source);
console.log('Result:', state.get_memory_cell(1));
```

### Example 2: Step-by-Step Execution

```javascript
const source = "+3 5 2\n-3 0 3";
const state = wasmModule.run_step_by_step(source, 10);

for (let i = 0; i < state.trace_len(); i++) {
    const step = state.get_trace_step(i);
    console.log(`Step ${step.step}: PC=${step.pc}, Branch=${step.branch_taken}`);
}
```

### Example 3: Self-Modification Detection

```javascript
const source = `
# Self-modifying code
+3 1 4
+3 0 5
`;

const report = wasmModule.self_mod_analysis(source);
const data = JSON.parse(report);

if (data.is_self_modifying) {
    console.log('Self-modification detected!');
    data.modifications.forEach(mod => {
        console.log(`  Step ${mod.step}: mem[${mod.address}] changed from ${mod.old_value} to ${mod.new_value}`);
    });
}
```

### Example 4: WORM Chain

```javascript
const worm = new WormChain();

// Seal genesis
worm.append('BOOT', { system: 'S-AUTOCODE', version: '1.0.0' });

// Seal computation
worm.append('COMPUTE', { op: 'factorial', input: 5, output: 120 });

// Verify integrity
if (worm.verify()) {
    console.log('Chain verified ✓');
    const chain = worm.getChain();
    console.log(`${chain.length} blocks sealed`);
}
```

---

## TypeScript Definitions

```typescript
// WASM Module
interface AutocodeWasm {
    compile_source(source: string): string;
    compile_and_run(source: string): MachineState;
    run_step_by_step(source: string, max_steps: number): MachineState;
    parse_single_line(line: string): string;
    self_mod_analysis(source: string): string;
}

// Machine State
interface MachineState {
    pc: number;
    halted: boolean;
    step_count: number;
    
    memory_len(): number;
    get_memory_cell(addr: number): number;
    set_memory_cell(addr: number, val: number): void;
    trace_len(): number;
    get_trace_step(idx: number): StepResult;
    memory_json(): string;
    trace_json(): string;
    self_mod_json(): string;
}

// Step Result
interface StepResult {
    step: number;
    pc: number;
    a: number;
    b: number;
    c: number;
    before_a: number;
    before_b: number;
    after_b: number;
    branch_taken: boolean;
}

// Sandbox64
class Sandbox64 {
    constructor();
    reset(): void;
    loadProgram(instructions: Instruction[]): void;
    step(): boolean;
    run(maxSteps?: number): SandboxState;
    getState(): SandboxState;
    exportState(): string;
}

// WORM Chain
class WormChain {
    constructor();
    append(type: string, data: any): void;
    getChain(): Block[];
    verify(): boolean;
    getBlock(index: number): Block;
}

interface Block {
    block: number;
    type: string;
    data: any;
    timestamp: number;
    hash: string;
    prevHash: string;
}
```

---

## Browser Compatibility

| Browser | Version | WASM Support | Status |
|---------|---------|--------------|--------|
| Chrome | 90+ | ✓ | Full support |
| Firefox | 88+ | ✓ | Full support |
| Safari | 14+ | ✓ | Full support |
| Edge | 90+ | ✓ | Full support |
| Opera | 76+ | ✓ | Full support |

---

## Further Reading

- **USER_GUIDE.md** - User documentation
- **PRODUCTION_AUDIT.md** - Technical audit
- **PRODUCTION_ROADMAP.md** - Development plan
- **README.md** - Project overview

---

**Questions?** Open an issue at https://github.com/SNAPKITTYWEST/S-AUTOCODE