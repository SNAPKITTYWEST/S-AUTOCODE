// sexpr-parser.js — S-expression parser for S-AUTOCODE
export class SExprParser {
    constructor() {
        this.pos = 0;
        this.src = '';
    }

    parse(src) {
        this.src = src;
        this.pos = 0;
        return this.parseValue();
    }

    parseValue() {
        this.skipWhitespace();
        if (this.pos >= this.src.length) return null;
        
        const ch = this.src[this.pos];
        if (ch === '(') return this.parseList();
        if (ch === '[') return this.parseVector();
        if (ch === '"') return this.parseString();
        if (ch === ':' || ch === '-' || /\d/.test(ch)) return this.parseAtom();
        if (/[a-zA-Z_!$%&*+./<=>?@^~]/.test(ch)) return this.parseAtom();
        return null;
    }

    parseList() {
        this.pos++; // skip (
        const items = [];
        while (this.pos < this.src.length) {
            this.skipWhitespace();
            if (this.src[this.pos] === ')') { this.pos++; break; }
            if (this.pos >= this.src.length) break;
            const item = this.parseValue();
            if (item !== null) items.push(item);
        }
        return { type: 'list', items };
    }

    parseVector() {
        this.pos++; // skip [
        const items = [];
        while (this.pos < this.src.length) {
            this.skipWhitespace();
            if (this.src[this.pos] === ']') { this.pos++; break; }
            if (this.pos >= this.src.length) break;
            const item = this.parseValue();
            if (item !== null) items.push(item);
        }
        return { type: 'vector', items };
    }

    parseString() {
        this.pos++; // skip "
        let str = '';
        while (this.pos < this.src.length && this.src[this.pos] !== '"') {
            if (this.src[this.pos] === '\\') { this.pos++; }
            str += this.src[this.pos++];
        }
        this.pos++; // skip closing "
        return { type: 'string', value: str };
    }

    parseAtom() {
        let start = this.pos;
        while (this.pos < this.src.length && /[a-zA-Z0-9_!$%&*+./<=>?@^~:\-]/.test(this.src[this.pos])) {
            this.pos++;
        }
        const raw = this.src.slice(start, this.pos);
        
        if (raw.startsWith(':')) return { type: 'keyword', value: raw.slice(1) };
        if (/^-?\d+(\.\d+)?$/.test(raw)) return { type: 'number', value: Number(raw) };
        return { type: 'symbol', value: raw };
    }

    skipWhitespace() {
        while (this.pos < this.src.length && /\s/.test(this.src[this.pos])) this.pos++;
        // Skip comments
        if (this.src[this.pos] === ';') {
            while (this.pos < this.src.length && this.src[this.pos] !== '\n') this.pos++;
            this.skipWhitespace();
        }
    }

    // Compile S-expression to SUBLEQ
    compileToSUBLEQ(expr) {
        if (!expr) return [];
        
        if (expr.type === 'number') {
            return this.emitLiteral(expr.value);
        }
        
        if (expr.type === 'symbol') {
            return this.emitSymbolRef(expr.value);
        }
        
        if (expr.type === 'list' && expr.items.length > 0) {
            const op = expr.items[0];
            if (op.type === 'symbol') {
                return this.compileOp(op.value, expr.items.slice(1));
            }
        }
        
        return [];
    }

    emitLiteral(n) {
        // Load literal into memory
        return [
            { op: 'SET', addr: 100, value: n },
            { op: 'SUBLEQ', a: 100, b: 101, c: 102 }
        ];
    }

    emitSymbolRef(name) {
        return [{ op: 'LOAD', symbol: name }];
    }

    compileOp(op, args) {
        switch (op) {
            case '+':
            case 'add':
                return this.compileBinOp('ADD', args);
            case '-':
            case 'sub':
                return this.compileBinOp('SUB', args);
            case '*':
            case 'mul':
                return this.compileBinOp('MUL', args);
            case 'factorial':
                return this.compileFactorial(args);
            default:
                return [{ op: 'CALL', func: op, args: args.map(a => this.compileToSUBLEQ(a)).flat() }];
        }
    }

    compileBinOp(op, args) {
        const left = this.compileToSUBLEQ(args[0]);
        const right = this.compileToSUBLEQ(args[1]);
        return [...left, ...right, { op, a: 100, b: 101, c: 102 }];
    }

    compileFactorial(args) {
        const n = args[0];
        if (n && n.type === 'number') {
            let result = 1;
            for (let i = 2; i <= n.value; i++) result *= i;
            return this.emitLiteral(result);
        }
        return [{ op: 'FACTORIAL', args: this.compileToSUBLEQ(n) }];
    }

    // Format expression for display
    format(expr, indent = 0) {
        if (!expr) return '';
        const pad = '  '.repeat(indent);
        
        switch (expr.type) {
            case 'number': return String(expr.value);
            case 'symbol': return expr.value;
            case 'string': return `"${expr.value}"`;
            case 'keyword': return `:${expr.value}`;
            case 'list':
                if (expr.items.length === 0) return '()';
                if (expr.items.length === 1) return `(${this.format(expr.items[0], indent)})`;
                const inner = expr.items.map(i => this.format(i, indent + 1)).join(' ');
                return `(${inner})`;
            case 'vector':
                return `[${expr.items.map(i => this.format(i, indent + 1)).join(' ')}]`;
            default: return String(expr);
        }
    }
}