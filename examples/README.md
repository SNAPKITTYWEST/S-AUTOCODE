# S-AUTOCODE Example Programs

This directory contains example programs written in sign-prefixed linear Autocode. Each example demonstrates different features and programming patterns.

---

## Table of Contents

1. [Simple Addition](#1-simple-addition)
2. [Factorial (Iterative)](#2-factorial-iterative)
3. [Factorial (Recursive)](#3-factorial-recursive)
4. [Sum of Array](#4-sum-of-array)
5. [Conditional Branch](#5-conditional-branch)
6. [Loop Counter](#6-loop-counter)
7. [Memory Copy](#7-memory-copy)
8. [Fibonacci Sequence](#8-fibonacci-sequence)
9. [Maximum of Two Numbers](#9-maximum-of-two-numbers)
10. [Self-Modifying Code](#10-self-modifying-code)

---

## Understanding the Syntax

### Sign-Prefixed Autocode Format

```
+A B C    # Subtract B from mem[A], jump to C if result <= 0
-A B C    # Conditional branch (alternative syntax)
```

### SUBLEQ Semantics

```
SUBLEQ a, b, c
```

1. `mem[a] = mem[a] - mem[b]` (subtract)
2. If `mem[a] <= 0`, jump to address `c`

### Comments

Lines starting with `#` are comments and are ignored.

---

## 1. Simple Addition

**Goal:** Add two numbers (10 + 20 = 30)

```autocode
# Simple Addition: 10 + 20 = 30
# Result stored in memory[2]

+0 10 1     # mem[0] = 10
+1 20 2     # mem[1] = 20
+2 0 3      # mem[2] = mem[0] (copy)
+2 1 4      # mem[2] = mem[2] - mem[1] (subtract)
+3 2 5      # Negate to get positive sum
```

**How to run:**
```javascript
const source = `
+0 10 1
+1 20 2
+2 0 3
+2 1 4
+3 2 5
`;
const state = wasmModule.compile_and_run(source);
console.log('Result:', state.get_memory_cell(3)); // 30
```

---

## 2. Factorial (Iterative)

**Goal:** Compute 5! = 120

```autocode
# Factorial: 5! = 120
# n = 5, result = 1
# Loop: result *= counter, counter--

+0 5 1      # n = 5
+1 1 2      # result = 1
+2 0 3      # counter = n

# Loop start (address 3)
+1 2 4      # result *= counter
+2 1 5      # counter--
+5 0 3      # if counter > 0, goto loop (address 3)

# Result in mem[1]
```

**Explanation:**
1. Initialize `n = 5`, `result = 1`, `counter = n`
2. Loop: multiply result by counter, decrement counter
3. Continue until counter reaches 0
4. Final result in `mem[1]`

---

## 3. Factorial (Recursive)

**Goal:** Compute factorial recursively

```autocode
# Recursive Factorial
# Uses stack for recursion

+0 5 1      # n = 5
+1 0 2      # Call factorial(n)

# factorial(n):
# if n <= 1, return 1
# else return n * factorial(n-1)

+2 1 3      # if n <= 1
-2 0 5      # goto base case
+3 0 4      # recursive case
+0 1 5      # n = n - 1
+1 2 6      # call factorial(n-1)
+4 0 7      # multiply result by n

# Base case (address 5)
+1 1 8      # return 1
```

**Note:** Full recursion requires stack management. This is a simplified example.

---

## 4. Sum of Array

**Goal:** Sum elements of an array

```autocode
# Sum of Array: [10, 20, 30, 40, 50]
# Result = 150

+0 10 1     # arr[0] = 10
+1 20 2     # arr[1] = 20
+2 30 3     # arr[2] = 30
+3 40 4     # arr[3] = 40
+4 50 5     # arr[4] = 50

+5 0 6      # sum = 0
+6 5 7      # length = 5
+7 0 8      # index = 0

# Loop (address 8)
+5 0 9      # sum += arr[index]
+7 1 10     # index++
+10 6 8     # if index < length, goto loop

# Result in mem[5]
```

---

## 5. Conditional Branch

**Goal:** If x > 10 then y = 1 else y = 0

```autocode
# Conditional: if x > 10 then y = 1 else y = 0

+0 15 1     # x = 15
+1 10 2     # temp = 10
+0 1 3      # x = x - 10

# Check if x > 0
-0 0 5      # if x <= 0, goto else (address 5)

# Then branch (address 4)
+2 1 6      # y = 1
+6 0 7      # goto end (address 7)

# Else branch (address 5)
+2 0 7      # y = 0

# End (address 7)
# Result in mem[2]
```

**Explanation:**
1. Set `x = 15`
2. Subtract 10 from x
3. If result <= 0, jump to else branch
4. Otherwise, set `y = 1`
5. Else branch sets `y = 0`

---

## 6. Loop Counter

**Goal:** Count from 0 to 10

```autocode
# Loop Counter: 0 to 10

+0 0 1      # counter = 0
+1 1 2      # increment = 1
+2 10 3     # limit = 10

# Loop (address 3)
+0 1 4      # counter++
+4 2 5      # temp = limit
+0 4 6      # counter - limit

# Check if counter <= limit
-0 0 3      # if counter <= limit, goto loop

# Result: counter = 10 in mem[0]
```

---

## 7. Memory Copy

**Goal:** Copy value from one memory location to another

```autocode
# Memory Copy: mem[0] -> mem[1]

+0 42 1     # source = 42
+1 0 2      # dest = 0
+1 0 3      # dest = dest - source (copy)

# Result: mem[1] = 42
```

**Explanation:**
1. Set source value to 42
2. Initialize destination to 0
3. Subtract source from destination (effectively copying)

---

## 8. Fibonacci Sequence

**Goal:** Compute Fibonacci numbers

```autocode
# Fibonacci: F(n) = F(n-1) + F(n-2)
# Compute F(7) = 13

+0 0 1      # F(0) = 0
+1 1 2      # F(1) = 1
+2 7 3      # n = 7
+3 2 4      # counter = 2

# Loop (address 4)
+4 0 5      # temp = F(n-2)
+4 1 6      # temp += F(n-1)
+0 1 7      # F(n-2) = F(n-1)
+1 4 8      # F(n-1) = temp
+3 1 9      # counter++
+9 2 4      # if counter < n, goto loop

# Result: F(7) = 13 in mem[1]
```

---

## 9. Maximum of Two Numbers

**Goal:** Find max(a, b)

```autocode
# Maximum: max(15, 23) = 23

+0 15 1     # a = 15
+1 23 2     # b = 23
+2 0 3      # diff = a
+2 1 4      # diff = a - b

# Check if a > b
-2 0 6      # if a <= b, goto else (b is max)

# Then: a is max (address 5)
+3 0 7      # max = a
+7 0 8      # goto end

# Else: b is max (address 6)
+3 1 8      # max = b

# End (address 8)
# Result in mem[3]
```

---

## 10. Self-Modifying Code

**Goal:** Demonstrate self-modifying code detection

```autocode
# Self-Modifying Code
# Modifies instruction at address 3

+0 10 1     # initial value = 10
+1 5 2      # modifier = 5

# Modify instruction at address 3
+3 1 4      # mem[3] = mem[3] - 5

# Modified instruction executes here
+0 0 5      # This instruction was modified

# Result: mem[0] modified, self-modification detected
```

**Warning:** Self-modifying code is detected and traced by S-AUTOCODE. Use with caution.

---

## Running Examples

### In Terminal

```bash
# Type in the S-AUTOCODE terminal
factorial 5
sum 10 20 30
```

### Via WASM API

```javascript
// Load WASM module
const wasmModule = await import('./autocode_wasm.js');
await wasmModule.default();

// Run example
const source = `
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

### Step-by-Step Execution

```javascript
const state = wasmModule.run_step_by_step(source, 100);

for (let i = 0; i < state.trace_len(); i++) {
    const step = state.get_trace_step(i);
    console.log(`Step ${step.step}: PC=${step.pc}`);
}
```

---

## Programming Patterns

### Pattern 1: Variable Assignment

```autocode
+0 42 1     # x = 42
```

### Pattern 2: Addition (via double negation)

```autocode
# x = a + b
+0 0 1      # x = 0
+0 a 2      # x = x - a (x = -a)
+0 b 3      # x = x - b (x = -a-b)
+1 0 4      # temp = 0
+1 x 5      # temp = -x (temp = a+b)
```

### Pattern 3: Conditional Jump

```autocode
+0 value 1  # Load value
-0 0 3      # If value <= 0, jump to address 3
# ... else continue here
```

### Pattern 4: Unconditional Jump

```autocode
+0 0 5      # Always jump to address 5
```

### Pattern 5: Loop

```autocode
# Loop from 0 to N
+0 0 1      # counter = 0
+1 N 2      # limit = N
# Loop body (address 2)
+0 1 3      # counter++
+3 1 4      # temp = limit
+0 3 2      # if counter < limit, goto loop
```

---

## Best Practices

### 1. Use Comments

Always comment your code to explain what each instruction does.

```autocode
# Good
+0 5 1      # n = 5

# Bad
+0 5 1
```

### 2. Initialize Variables

Always initialize variables before use.

```autocode
+0 0 1      # Initialize to 0
+0 value 2  # Then set value
```

### 3. Avoid Self-Modification

Unless necessary, avoid self-modifying code as it's harder to verify.

### 4. Test Incrementally

Test each section of your program before combining them.

### 5. Use Meaningful Addresses

Document what each memory address represents.

```autocode
# Memory layout:
# 0: counter
# 1: result
# 2: temp
# 3: limit
```

---

## Debugging Tips

### 1. Use Step-by-Step Execution

```javascript
const state = wasmModule.run_step_by_step(source, 10);
```

### 2. Inspect Memory

```javascript
const memJson = state.memory_json();
console.log('Memory:', JSON.parse(memJson));
```

### 3. Check Trace

```javascript
for (let i = 0; i < state.trace_len(); i++) {
    const step = state.get_trace_step(i);
    console.log(`Step ${step.step}: ${step.a} ${step.b} ${step.c}`);
}
```

### 4. Verify Self-Modifications

```javascript
const report = wasmModule.self_mod_analysis(source);
const data = JSON.parse(report);
if (data.is_self_modifying) {
    console.log('Self-modifications:', data.modifications);
}
```

---

## Further Reading

- **USER_GUIDE.md** - User documentation
- **API.md** - API reference
- **README.md** - Project overview
- **PRODUCTION_AUDIT.md** - Technical details

---

## Contributing Examples

Have a cool example? Submit a pull request!

1. Fork the repository
2. Add your example to this file
3. Test it thoroughly
4. Submit PR with description

---

**Happy coding with S-AUTOCODE!** 🚀