// sandbox64.js — Sandboxed 64-bit computer simulation
export class Sandbox64 {
    constructor() {
        this.reset();
    }

    reset() {
        this.registers = {
            RAX: 0n, RBX: 0n, RCX: 0n, RDX: 0n,
            RSI: 0n, RDI: 0n, RBP: 0n, RSP: 0n,
            RIP: 0n, R8: 0n, R9: 0n, R10: 0n,
            R11: 0n, R12: 0n, R13: 0n, R14: 0n, R15: 0n,
            RFLAGS: 0n
        };
        this.memory = new BigInt64Array(1024);
        this.stack = [];
        this.code = [];
        this.pc = 0;
        this.halted = false;
        this.steps = 0;
        this.maxSteps = 100000;
        this.trace = [];
        this.mutations = [];
        this.selfModDetections = [];
    }

    loadProgram(instructions) {
        this.code = instructions;
        this.pc = 0;
        this.halted = false;
        this.steps = 0;
        this.registers.RIP = 0n;
        this.registers.RSP = BigInt(this.memory.length - 1);
    }

    step() {
        if (this.halted || this.pc >= this.code.length || this.steps >= this.maxSteps) {
            this.halted = true;
            return false;
        }

        const instr = this.code[this.pc];
        const beforeState = this.captureState();
        
        this.executeInstruction(instr);
        this.steps++;
        this.pc++;
        this.registers.RIP = BigInt(this.pc);

        // Check for self-modifying code
        if (instr.address !== undefined && this.mutations.some(m => m.address === instr.address)) {
            this.selfModDetections.push({
                step: this.steps,
                address: instr.address,
                timestamp: Date.now()
            });
        }

        this.trace.push({
            step: this.steps,
            pc: this.pc - 1,
            instruction: instr,
            registers: { ...this.registers },
            memory: this.getMemorySnapshot()
        });

        return true;
    }

    run(maxSteps = this.maxSteps) {
        this.maxSteps = maxSteps;
        while (this.step()) {}
        return this.getState();
    }

    executeInstruction(instr) {
        switch (instr.op) {
            case 'MOV':
                this.setReg(instr.dest, this.getOperand(instr.src));
                break;
            case 'ADD':
                this.setReg(instr.dest, this.getReg(instr.dest) + this.getOperand(instr.src));
                break;
            case 'SUB':
                this.setReg(instr.dest, this.getReg(instr.dest) - this.getOperand(instr.src));
                break;
            case 'MUL':
                this.setReg(instr.dest, this.getReg(instr.dest) * this.getOperand(instr.src));
                break;
            case 'DIV':
                const divisor = this.getOperand(instr.src);
                if (divisor !== 0n) {
                    this.setReg(instr.dest, this.getReg(instr.dest) / divisor);
                }
                break;
            case 'AND':
                this.setReg(instr.dest, this.getReg(instr.dest) & this.getOperand(instr.src));
                break;
            case 'OR':
                this.setReg(instr.dest, this.getReg(instr.dest) | this.getOperand(instr.src));
                break;
            case 'XOR':
                this.setReg(instr.dest, this.getReg(instr.dest) ^ this.getOperand(instr.src));
                break;
            case 'SHL':
                this.setReg(instr.dest, this.getReg(instr.dest) << this.getOperand(instr.src));
                break;
            case 'SHR':
                this.setReg(instr.dest, this.getReg(instr.dest) >> this.getOperand(instr.src));
                break;
            case 'LOAD':
                const addr = Number(this.getOperand(instr.src));
                this.setReg(instr.dest, this.memory[addr] || 0n);
                break;
            case 'STORE':
                const sAddr = Number(this.getOperand(instr.dest));
                this.memory[sAddr] = this.getOperand(instr.src);
                this.mutations.push({ address: sAddr, value: this.memory[sAddr], step: this.steps });
                break;
            case 'PUSH':
                this.registers.RSP--;
                this.memory[Number(this.registers.RSP)] = this.getOperand(instr.src);
                break;
            case 'POP':
                this.setReg(instr.dest, this.memory[Number(this.registers.RSP)]);
                this.registers.RSP++;
                break;
            case 'CMP':
                const a = this.getReg(instr.a);
                const b = this.getOperand(instr.b);
                this.registers.RFLAGS = a === b ? 1n : (a > b ? 2n : 0n);
                break;
            case 'JMP':
                this.pc = Number(this.getOperand(instr.addr)) - 1;
                break;
            case 'JZ':
                if (this.registers.RFLAGS === 1n) this.pc = Number(this.getOperand(instr.addr)) - 1;
                break;
            case 'JNZ':
                if (this.registers.RFLAGS !== 1n) this.pc = Number(this.getOperand(instr.addr)) - 1;
                break;
            case 'CALL':
                this.registers.RSP--;
                this.memory[Number(this.registers.RSP)] = BigInt(this.pc + 1);
                this.pc = Number(this.getOperand(instr.addr)) - 1;
                break;
            case 'RET':
                this.pc = Number(this.memory[Number(this.registers.RSP)]) - 1;
                this.registers.RSP++;
                break;
            case 'SUBLEQ':
                // SUBLEQ: mem[A] = mem[A] - mem[B]; if mem[A] <= 0 then PC = C
                const aAddr = Number(this.getOperand(instr.a));
                const bAddr = Number(this.getOperand(instr.b));
                const cAddr = Number(this.getOperand(instr.c));
                this.memory[aAddr] = this.memory[aAddr] - this.memory[bAddr];
                this.mutations.push({ address: aAddr, value: this.memory[aAddr], step: this.steps });
                if (this.memory[aAddr] <= 0n) {
                    this.pc = cAddr - 1;
                }
                break;
            case 'NOP':
                break;
            case 'HLT':
                this.halted = true;
                break;
        }
    }

    getReg(name) {
        return this.registers[name] || 0n;
    }

    setReg(name, value) {
        if (this.registers[name] !== undefined) {
            this.registers[name] = value;
        }
    }

    getOperand(op) {
        if (typeof op === 'bigint') return op;
        if (typeof op === 'number') return BigInt(op);
        if (typeof op === 'string' && this.registers[op] !== undefined) return this.registers[op];
        return 0n;
    }

    captureState() {
        return {
            registers: { ...this.registers },
            pc: this.pc,
            steps: this.steps
        };
    }

    getMemorySnapshot() {
        const snap = {};
        for (let i = 0; i < Math.min(this.memory.length, 64); i++) {
            if (this.memory[i] !== 0n) {
                snap[i] = this.memory[i];
            }
        }
        return snap;
    }

    getState() {
        return {
            registers: { ...this.registers },
            memory: this.getMemorySnapshot(),
            pc: this.pc,
            halted: this.halted,
            steps: this.steps,
            trace: this.trace,
            mutations: this.mutations,
            selfModDetections: this.selfModDetections,
            stack: this.stack
        };
    }

    exportState() {
        return JSON.stringify(this.getState(), (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        , 2);
    }
}