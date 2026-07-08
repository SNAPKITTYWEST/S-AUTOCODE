pub use autocode_compiler::SubleqInstr;

pub type Word = i64;

#[derive(Debug, Clone)]
pub struct SubleqMachine {
    pub mem: Vec<Word>,
    pub pc: usize,
    pub halted: bool,
    pub trace: Vec<TraceEvent>,
    pub self_modifications: Vec<MemoryWrite>,
}

#[derive(Clone, Debug)]
pub struct TraceEvent {
    pub step: usize,
    pub pc: usize,
    pub a: usize,
    pub b: usize,
    pub c: usize,
    pub before_a: Word,
    pub before_b: Word,
    pub after_b: Word,
    pub branch_taken: bool,
}

#[derive(Clone, Debug)]
pub struct MemoryWrite {
    pub step: usize,
    pub address: usize,
    pub old_value: Word,
    pub new_value: Word,
    pub writes_instruction_field: bool,
}

impl SubleqMachine {
    pub fn new(memory_size: usize) -> Self {
        Self {
            mem: vec![0; memory_size],
            pc: 0,
            halted: false,
            trace: Vec::new(),
            self_modifications: Vec::new(),
        }
    }

    pub fn load_program(&mut self, instrs: &[SubleqInstr]) {
        for (i, instr) in instrs.iter().enumerate() {
            self.mem[i * 3] = instr.a as Word;
            self.mem[i * 3 + 1] = instr.b as Word;
            self.mem[i * 3 + 2] = instr.c as Word;
        }
    }

    /// Check if an address is part of an instruction triple
    fn is_instruction_field(&self, address: usize) -> bool {
        // An address is an instruction field if it's part of any (a, b, c) triple
        // This is a heuristic: we consider addresses divisible by 3 or within 2 of them
        // as potential instruction fields in the unified memory model
        address % 3 == 0 || address % 3 == 1 || address % 3 == 2
    }

    pub fn step(&mut self) -> Result<(), String> {
        // Bounds check: ensure PC + 2 is within memory
        if self.pc + 2 >= self.mem.len() {
            self.halted = true;
            return Ok(());
        }

        // Fetch instruction from unified memory (code and data share same space)
        let a = self.mem[self.pc] as usize;
        let b = self.mem[self.pc + 1] as usize;
        let c = self.mem[self.pc + 2] as usize;

        // Bounds check operands
        if a >= self.mem.len() || b >= self.mem.len() {
            return Err(format!("Address out of bounds at pc={}: a={}, b={}", self.pc, a, b));
        }

        let before_a = self.mem[a];
        let before_b = self.mem[b];

        // Canonical SUBLEQ: mem[b] = mem[b] - mem[a]
        let old_value = self.mem[b];
        self.mem[b] -= self.mem[a];
        let new_value = self.mem[b];

        // Record memory write with self-modification detection
        let writes_instruction = self.is_instruction_field(b);
        self.self_modifications.push(MemoryWrite {
            step: self.trace.len(),
            address: b,
            old_value,
            new_value,
            writes_instruction_field: writes_instruction,
        });

        let after_b = self.mem[b];
        let branch_taken = self.mem[b] <= 0;

        // Record trace event
        self.trace.push(TraceEvent {
            step: self.trace.len(),
            pc: self.pc,
            a,
            b,
            c,
            before_a,
            before_b,
            after_b,
            branch_taken,
        });

        // Branch logic
        if branch_taken {
            self.pc = c;
        } else {
            self.pc += 3; // Move to next instruction triple
        }

        Ok(())
    }

    pub fn run(&mut self) -> Result<(), String> {
        while !self.halted {
            self.step()?;
        }
        Ok(())
    }

    pub fn get_memory(&self) -> &[Word] {
        &self.mem
    }

    pub fn get_self_modification_report(&self) -> SelfModificationReport {
        let modified_instruction_addresses: Vec<usize> = self
            .self_modifications
            .iter()
            .filter(|w| w.writes_instruction_field)
            .map(|w| w.address)
            .collect();

        SelfModificationReport {
            writes: self.self_modifications.clone(),
            modified_instruction_addresses,
            deterministic: true, // All SUBLEQ execution is deterministic
            sandbox_safe: true,  // Bounded by memory size
        }
    }
}

#[derive(Clone, Debug)]
pub struct SelfModificationReport {
    pub writes: Vec<MemoryWrite>,
    pub modified_instruction_addresses: Vec<usize>,
    pub deterministic: bool,
    pub sandbox_safe: bool,
}

// Legacy compatibility
#[derive(Debug, Clone)]
pub struct SubleqStep {
    pub pc: usize,
    pub instr: SubleqInstr,
    pub mem_a_before: i32,
    pub mem_b_before: i32,
    pub mem_b_after: i32,
    pub branch_taken: bool,
}
