// ============================================================
// S-AUTOCODE: S-Expression Meta-Language Compiler
// Boolean primitives -> Autocode SUBLEQ -> Any target syntax
// ============================================================

export function createCompiler() {
    let nextAddr = 100;
    let instructions = [];
    let symbols = {};
    let functions = {};
    let currentTarget = 'autocode';

    const alloc = (n = 1) => {
        const addr = nextAddr;
        nextAddr += n;
        return addr;
    };

    const emit = (a, b, c) => {
        instructions.push({ a, b, c, addr: instructions.length * 3 });
    };

    const defineVar = (name) => {
        if (!(name in symbols)) {
            symbols[name] = alloc();
        }
        return symbols[name];
    };

    // ============================================================
    // S-EXPRESSION PARSER
    // ============================================================
    function parseSexpr(src) {
        src = src.trim();
        if (!src) return null;

        // Skip comments
        while (src.startsWith('#')) {
            const nl = src.indexOf('\n');
            src = nl >= 0 ? src.slice(nl + 1).trim() : '';
        }
        if (!src) return null;

        // String
        if (src[0] === '"') {
            const end = src.indexOf('"', 1);
            if (end < 0) return [src.slice(1), ''];
            return [src.slice(1, end), src.slice(end + 1)];
        }

        // List
        if (src[0] === '(') {
            let depth = 1;
            let i = 1;
            while (i < src.length && depth > 0) {
                if (src[i] === '(') depth++;
                else if (src[i] === ')') depth--;
                i++;
            }
            const inner = src.slice(1, i - 1);
            const rest = src.slice(i);
            const items = [];
            let remaining = inner.trim();
            while (remaining) {
                // Skip whitespace and comments
                while (remaining && (remaining[0] === ' ' || remaining[0] === '\n' || remaining[0] === '\t' || remaining[0] === '#')) {
                    if (remaining[0] === '#') {
                        const nl = remaining.indexOf('\n');
                        remaining = nl >= 0 ? remaining.slice(nl + 1) : '';
                    } else {
                        remaining = remaining.slice(1);
                    }
                }
                if (!remaining || remaining[0] === ')') break;
                const [item, after] = parseSexpr(remaining);
                if (item !== null) items.push(item);
                remaining = after;
            }
            return [items, rest];
        }

        // Atom
        let i = 0;
        while (i < src.length && src[i] !== ' ' && src[i] !== '\n' && src[i] !== '\t'
               && src[i] !== '(' && src[i] !== ')' && src[i] !== '#') {
            i++;
        }
        return [src.slice(0, i), src.slice(i)];
    }

    function parseAll(src) {
        const forms = [];
        let remaining = src;
        while (remaining.trim()) {
            while (remaining.trim().startsWith('#')) {
                const nl = remaining.indexOf('\n');
                remaining = nl >= 0 ? remaining.slice(nl + 1) : '';
            }
            if (!remaining.trim()) break;
            const [form, rest] = parseSexpr(remaining);
            if (form !== null) forms.push(form);
            remaining = rest;
        }
        return forms;
    }

    // ============================================================
    // BOOLEAN PRIMITIVE COMPILER
    // Every operation reduces to SUBLEQ: mem[b] -= mem[a]
    // Boolean ops use the standard encoding:
    //   NOT x    = 0 - x  (sub from zero)
    //   AND a b  = a + b - (a OR b)  -- needs temp
    //   OR  a b  = -( (-a) + (-b) )  -- via NOT
    //   XOR a b  = (a AND NOT b) OR (NOT a AND b)
    // ============================================================

    function compileExpr(expr, targetAddr) {
        if (typeof expr === 'number') {
            // Load literal into target
            const litAddr = alloc();
            emit(litAddr, litAddr + 1, litAddr + 2); // placeholder
            return { type: 'literal', value: expr, addr: litAddr, targetAddr };
        }

        if (typeof expr === 'string') {
            // Variable reference
            const addr = symbols[expr] || defineVar(expr);
            return { type: 'var', name: expr, addr, targetAddr };
        }

        if (!Array.isArray(expr)) return null;

        const op = expr[0];
        const args = expr.slice(1);

        switch (op) {
            // ---- ARITHMETIC ----
            case '+': case 'add': return compileBinOp(args, 'add', targetAddr);
            case '-': case 'sub': return compileBinOp(args, 'sub', targetAddr);
            case '*': case 'mul': return compileBinOp(args, 'mul', targetAddr);
            case '/': case 'div': return compileBinOp(args, 'div', targetAddr);
            case 'mod': return compileBinOp(args, 'mod', targetAddr);

            // ---- BOOLEAN (reduce to SUBLEQ) ----
            case 'not': return compileNot(args[0], targetAddr);
            case 'and': return compileAnd(args, targetAddr);
            case 'or':  return compileOr(args, targetAddr);
            case 'xor': return compileXor(args, targetAddr);
            case 'nand': return compileNand(args, targetAddr);
            case 'nor':  return compileNor(args, targetAddr);

            // ---- MEMORY ----
            case 'load': case 'peek': {
                const addrExpr = compileExpr(args[0], null);
                const dest = targetAddr || alloc();
                // SUBLEQ: load value from addrExpr into dest
                // This is a simplification - real impl would need indirection
                emit(addrExpr.addr, dest, dest + 3);
                return { type: 'load', addr: dest, targetAddr: dest };
            }
            case 'store': case 'poke': {
                const addrExpr = compileExpr(args[0], null);
                const valExpr = compileExpr(args[1], null);
                emit(valExpr.addr, addrExpr.addr, addrExpr.addr + 3);
                return { type: 'store', addr: addrExpr.addr, targetAddr: addrExpr.addr };
            }

            // ---- CONTROL FLOW ----
            case 'if': return compileIf(args, targetAddr);
            case 'while': return compileWhile(args, targetAddr);
            case 'progn': case 'begin': return compileProgn(args, targetAddr);
            case 'set': case 'setq': return compileSet(args, targetAddr);

            // ---- FUNCTION DEFINITION ----
            case 'defun': case 'fn': return compileDefun(args);
            case 'call': return compileCall(args, targetAddr);

            // ---- COMPARISON ----
            case '=': case 'eq': return compileCmp(args, 'eq', targetAddr);
            case '<': case 'lt': return compileCmp(args, 'lt', targetAddr);
            case '>': case 'gt': return compileCmp(args, 'gt', targetAddr);
            case '<=': case 'lte': return compileCmp(args, 'lte', targetAddr);
            case '>=': case 'gte': return compileCmp(args, 'gte', targetAddr);

            // ---- SPECIAL ----
            case 'let': return compileLet(args, targetAddr);
            case 'print': return compilePrint(args, targetAddr);
            case 'target': {
                currentTarget = args[0] || 'autocode';
                return { type: 'target', target: currentTarget };
            }

            default:
                // Check if it's a known function
                if (functions[op]) {
                    return compileCall([op, ...args], targetAddr);
                }
                return { type: 'unknown', op, args };
        }
    }

    function compileBinOp(args, op, targetAddr) {
        if (args.length < 2) return null;
        const left = compileExpr(args[0], null);
        const right = compileExpr(args[1], null);
        const dest = targetAddr || alloc();

        switch (op) {
            case 'add':
                // SUBLEQ addition: a + b via double-subtraction
                // Store a at dest, subtract b from a copy, negate
                emit(left.addr, dest, dest + 3);         // dest = left
                emit(right.addr, dest + 3, dest + 6);    // temp = right
                emit(dest, dest + 3, dest + 6);          // temp = right - left
                emit(dest + 3, dest, dest + 6);          // dest = left - (right - left) = 2*left - right... 
                // Simplified: just chain SUBLEQ
                instructions.length -= 3; // undo, use simpler approach
                emit(left.addr, dest, dest + 3);
                emit(right.addr, dest, dest + 3);
                break;
            case 'sub':
                emit(right.addr, left.addr, left.addr + 3);
                emit(left.addr, dest, dest + 3);
                break;
            case 'mul':
                // Multiplication via repeated addition (simplified)
                emit(left.addr, dest, dest + 3);
                emit(right.addr, dest + 3, dest + 6);
                // For now, emit as Autocode multiplication pattern
                emit(dest, dest + 3, dest + 6);
                break;
            default:
                emit(left.addr, dest, dest + 3);
                emit(right.addr, dest, dest + 3);
        }

        return { type: 'binop', op, addr: dest, targetAddr: dest };
    }

    function compileNot(arg, targetAddr) {
        const val = compileExpr(arg, null);
        const zero = alloc();
        const dest = targetAddr || alloc();
        // NOT: 0 - x via SUBLEQ
        emit(val.addr, zero, zero + 3);    // zero = 0 - val (via SUBLEQ)
        emit(zero, dest, dest + 3);         // dest = not result
        return { type: 'not', addr: dest, targetAddr: dest };
    }

    function compileAnd(args, targetAddr) {
        if (args.length < 2) return compileExpr(args[0], targetAddr);
        const a = compileExpr(args[0], null);
        const b = compileExpr(args[1], null);
        const dest = targetAddr || alloc();
        // AND via NAND: NAND(a,b) = NOT(AND(a,b))
        // AND(a,b) = NOT(NAND(a,b))
        // Simplified: store a, subtract NAND pattern
        emit(a.addr, dest, dest + 3);
        emit(b.addr, dest, dest + 3);
        return { type: 'and', addr: dest, targetAddr: dest };
    }

    function compileOr(args, targetAddr) {
        if (args.length < 2) return compileExpr(args[0], targetAddr);
        const a = compileExpr(args[0], null);
        const b = compileExpr(args[1], null);
        const dest = targetAddr || alloc();
        // OR: a + b (in boolean context, subtraction gives OR)
        emit(a.addr, dest, dest + 3);
        emit(b.addr, dest, dest + 3);
        return { type: 'or', addr: dest, targetAddr: dest };
    }

    function compileXor(args, targetAddr) {
        if (args.length < 2) return compileExpr(args[0], targetAddr);
        const a = compileExpr(args[0], null);
        const b = compileExpr(args[1], null);
        const dest = targetAddr || alloc();
        const temp = alloc();
        // XOR = (a OR b) AND NOT(a AND b)
        emit(a.addr, dest, dest + 3);
        emit(b.addr, dest, dest + 3);
        emit(a.addr, temp, temp + 3);
        emit(b.addr, temp, temp + 3);
        emit(temp, dest, dest + 3);
        return { type: 'xor', addr: dest, targetAddr: dest };
    }

    function compileNand(args, targetAddr) {
        const and = compileAnd(args, targetAddr);
        return compileNot(and, targetAddr);
    }

    function compileNor(args, targetAddr) {
        const or = compileOr(args, targetAddr);
        return compileNot(or, targetAddr);
    }

    function compileIf(args, targetAddr) {
        const cond = compileExpr(args[0], null);
        const thenAddr = alloc();
        const elseAddr = alloc();
        const dest = targetAddr || alloc();

        // Condition: if zero, jump to else
        emit(cond.addr, cond.addr, elseAddr);

        // Then branch
        if (args[1]) compileExpr(args[1], dest);

        // Jump over else
        emit(0, 0, thenAddr); // placeholder jump

        // Else branch
        if (args[2]) compileExpr(args[2], dest);

        return { type: 'if', addr: dest, targetAddr: dest };
    }

    function compileWhile(args, targetAddr) {
        const condAddr = instructions.length * 3;
        const cond = compileExpr(args[0], null);
        const bodyStart = instructions.length * 3;
        const loopEnd = alloc();

        // If condition false, exit loop
        emit(cond.addr, cond.addr, loopEnd);

        // Body
        for (let i = 1; i < args.length; i++) {
            compileExpr(args[i], null);
        }

        // Jump back to condition
        emit(0, 0, condAddr);

        return { type: 'while', addr: condAddr, targetAddr };
    }

    function compileProgn(args, targetAddr) {
        let last = null;
        for (const arg of args) {
            last = compileExpr(arg, targetAddr);
        }
        return last;
    }

    function compileSet(args, targetAddr) {
        const name = args[0];
        const addr = defineVar(name);
        const val = compileExpr(args[1], addr);
        return { type: 'set', name, addr, targetAddr: addr };
    }

    function compileLet(args, targetAddr) {
        const bindings = args[0];
        const body = args.slice(1);
        const saved = { ...symbols };

        if (Array.isArray(bindings)) {
            for (const binding of bindings) {
                if (Array.isArray(binding)) {
                    defineVar(binding[0]);
                    compileExpr(binding[1], symbols[binding[0]]);
                } else {
                    defineVar(binding);
                }
            }
        }

        let last = null;
        for (const expr of body) {
            last = compileExpr(expr, targetAddr);
        }

        symbols = saved;
        return last;
    }

    function compileDefun(args) {
        const name = args[0];
        const params = args[1] || [];
        const body = args.slice(2);

        const savedSymbols = { ...symbols };
        const savedAddr = nextAddr;
        const savedInstrs = instructions;

        instructions = [];
        nextAddr = 200;
        symbols = {};

        const paramAddrs = [];
        for (const p of params) {
            paramAddrs.push(defineVar(p));
        }

        let last = null;
        for (const expr of body) {
            last = compileExpr(expr, null);
        }

        functions[name] = {
            params: params,
            paramAddrs: paramAddrs,
            instructions: [...instructions],
            entryAddr: 200,
            returnAddr: last ? last.addr : null
        };

        instructions = savedInstrs;
        nextAddr = savedAddr;
        symbols = savedSymbols;

        return { type: 'defun', name, addr: 200 };
    }

    function compileCall(args, targetAddr) {
        const name = args[0];
        const fn = functions[name];
        if (!fn) return { type: 'unknown_call', name };

        // Load arguments into parameter addresses
        for (let i = 0; i < fn.params.length; i++) {
            const argVal = compileExpr(args[i + 1], fn.paramAddrs[i]);
        }

        // Jump to function
        const dest = targetAddr || alloc();
        emit(fn.entryAddr, dest, dest + 3);

        return { type: 'call', name, addr: dest, targetAddr: dest };
    }

    function compileCmp(args, op, targetAddr) {
        const a = compileExpr(args[0], null);
        const b = compileExpr(args[1], null);
        const dest = targetAddr || alloc();
        const temp = alloc();

        // Comparison via subtraction
        emit(a.addr, temp, temp + 3);   // temp = a - b
        emit(b.addr, temp, temp + 3);
        // Result is in temp: negative if a < b, zero if equal, positive if a > b

        return { type: 'cmp', op, addr: temp, targetAddr: dest };
    }

    function compilePrint(args, targetAddr) {
        const val = compileExpr(args[0], targetAddr);
        return { type: 'print', addr: val.addr, targetAddr };
    }

    // ============================================================
    // AUTOCODE OUTPUT
    // ============================================================
    function toAutocode() {
        return instructions.map((instr, i) => {
            const sign = '+';
            return `${sign}${instr.a} ${instr.b} ${instr.c}`;
        }).join('\n');
    }

    // ============================================================
    // MULTI-TARGET SYNTAX TRANSFORMERS
    // ============================================================
    function toRust() {
        let out = '// Generated by S-AUTOCODE\n\n';
        out += 'fn main() {\n';
        for (const [name, addr] of Object.entries(symbols)) {
            out += `    let mut ${name}: i64 = 0; // mem[${addr}]\n`;
        }
        out += '\n';

        for (const [name, fn] of Object.entries(functions)) {
            out += `    fn ${name}(${fn.params.map(p => `${p}: i64`).join(', ')}) -> i64 {\n`;
            out += `        // SUBLEQ function at addr ${fn.entryAddr}\n`;
            out += `        0 // stub\n`;
            out += `    }\n\n`;
        }

        out += '    // SUBLEQ program\n';
        for (const instr of instructions) {
            out += `    // mem[${instr.b}] -= mem[${instr.a}]; if mem[${instr.b}] <= 0 then pc = ${instr.c}\n`;
        }

        out += '}\n';
        return out;
    }

    function toPython() {
        let out = '# Generated by S-AUTOCODE\n\n';
        for (const [name, addr] of Object.entries(symbols)) {
            out += `${name} = 0  # mem[${addr}]\n`;
        }
        out += '\n';

        for (const [name, fn] of Object.entries(functions)) {
            out += `def ${name}(${fn.params.join(', ')}):\n`;
            out += `    # SUBLEQ function at addr ${fn.entryAddr}\n`;
            out += `    pass\n\n`;
        }

        out += '# SUBLEQ program\n';
        out += 'memory = [0] * 1024\n';
        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            out += `memory[${instr.b}] -= memory[${instr.a}]  # step ${i}: if memory[${instr.b}] <= 0 then pc = ${instr.c}\n`;
        }
        return out;
    }

    function toJavaScript() {
        let out = '// Generated by S-AUTOCODE\n\n';
        out += 'const memory = new Array(1024).fill(0);\n\n';

        for (const [name, addr] of Object.entries(symbols)) {
            out += `let ${name} = 0; // mem[${addr}]\n`;
        }
        out += '\n';

        for (const [name, fn] of Object.entries(functions)) {
            out += `function ${name}(${fn.params.join(', ')}) {\n`;
            out += `    // SUBLEQ function at addr ${fn.entryAddr}\n`;
            out += `    return 0;\n`;
            out += `}\n\n`;
        }

        out += '// SUBLEQ program\n';
        out += 'let pc = 0;\n';
        out += 'while (pc < memory.length) {\n';
        out += '    const a = memory[pc], b = memory[pc+1], c = memory[pc+2];\n';
        out += '    memory[b] -= memory[a];\n';
        out += '    pc = memory[b] <= 0 ? c : pc + 3;\n';
        out += '}\n';
        return out;
    }

    function toC() {
        let out = '/* Generated by S-AUTOCODE */\n#include <stdio.h>\n\n';
        out += 'long memory[1024] = {0};\n\n';

        for (const [name, addr] of Object.entries(symbols)) {
            out += `#define ${name.toUpperCase()} ${addr} /* mem[${addr}] */\n`;
        }
        out += '\n';

        out += 'int main() {\n';
        out += '    int pc = 0;\n';
        out += '    while (pc < 1024) {\n';
        out += '        int a = memory[pc], b = memory[pc+1], c = memory[pc+2];\n';
        out += '        memory[b] -= memory[a];\n';
        out += '        pc = memory[b] <= 0 ? c : pc + 3;\n';
        out += '    }\n';
        out += '    return 0;\n';
        out += '}\n';
        return out;
    }

    function toCforth() {
        let out = '\\ Generated by S-AUTOCODE\n\\ Forth-style output\n\n';

        for (const [name, addr] of Object.entries(symbols)) {
            out += `variable ${name} \\ mem[${addr}]\n`;
        }
        out += '\n';

        for (const [name, fn] of Object.entries(functions)) {
            out += `: ${name} `;
            out += fn.params.map(p => `>R`).join(' ');
            out += ' ;
\n';
        }

        out += '\\ SUBLEQ program\n';
        for (let i = 0; i < instructions.length; i++) {
            const instr = instructions[i];
            out += `\\ step ${i}: mem[${instr.b}] -= mem[${instr.a}]; if <=0 goto ${instr.c}\n`;
        }
        return out;
    }

    function toSqueak() {
        let out = '" Generated by S-AUTOCODE"\n\n';

        for (const [name, addr] of Object.entries(symbols)) {
            out += `| ${name} |\n`;
        }
        out += '\n';

        for (const [name, fn] of Object.entries(functions)) {
            out += `${name} := [ :${fn.params.join(' :')} |\n`;
            out += `    "SUBLEQ function at addr ${fn.entryAddr}"\n`;
            out += `    0\n].\n\n`;
        }

        out += 'memory := Array new: 1024 withAll: 0.\n';
        return out;
    }

    function toWasm() {
        let out = ';; Generated by S-AUTOCODE\n;; WebAssembly text format\n\n';
        out += '(module\n';
        out += '  (memory (export "memory") 1)\n\n';

        for (const [name, addr] of Object.entries(symbols)) {
            out += `  (global $$${name} (mut i32) (i32.const 0)) ;; mem[${addr}]\n`;
        }
        out += '\n';

        out += '  (func (export "run")\n';
        out += '    (local $pc i32) (local $a i32) (local $b i32) (local $c i32)\n';
        out += '    (local.set $pc (i32.const 0))\n';
        out += '    (block $halt\n';
        out += '      (loop $loop\n';
        out += '        ;; Load instruction\n';
        out += '        (local.set $a (i32.load (local.get $pc)))\n';
        out += '        (local.set $b (i32.load (i32.add (local.get $pc) (i32.const 4))))\n';
        out += '        (local.set $c (i32.load (i32.add (local.get $pc) (i32.const 8))))\n';
        out += '        ;; SUBLEQ: mem[b] -= mem[a]\n';
        out += '        (i32.store (local.get $b)\n';
        out += '          (i32.sub\n';
        out += '            (i32.load (local.get $b))\n';
        out += '            (i32.load (local.get $a))))\n';
        out += '        ;; Branch\n';
        out += '        (if (i32.le_s (i32.load (local.get $b)) (i32.const 0))\n';
        out += '          (then (local.set $pc (local.get $c)))\n';
        out += '          (else (local.set $pc (i32.add (local.get $pc) (i32.const 12)))))\n';
        out += '        (br $loop)\n';
        out += '      )\n';
        out += '    )\n';
        out += '  )\n';
        out += ')\n';
        return out;
    }

    // ============================================================
    // MAIN COMPILE ENTRY
    // ============================================================
    function compile(source) {
        instructions = [];
        symbols = {};
        functions = {};
        nextAddr = 100;
        currentTarget = 'autocode';

        const forms = parseAll(source);
        for (const form of forms) {
            compileExpr(form, null);
        }

        return {
            autocode: toAutocode(),
            rust: toRust(),
            python: toPython(),
            javascript: toJavaScript(),
            c: toC(),
            forth: toCforth(),
            wasm: toWasm(),
            symbols: { ...symbols },
            functions: { ...functions },
            instructions: [...instructions]
        };
    }

    function setTarget(target) {
        currentTarget = target;
    }

    function getTarget() {
        return currentTarget;
    }

    return {
        compile,
        parseSexpr,
        parseAll,
        setTarget,
        getTarget,
        toAutocode,
        toRust,
        toPython,
        toJavaScript,
        toC,
        toCforth,
        toWasm
    };
}
