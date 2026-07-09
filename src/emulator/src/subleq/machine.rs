//! Canonical SUBLEQ machine with unified code/data memory tape.
//!
//! Instructions live in the same `mem` vector as data. Self-modifying code
//! is possible because writes to instruction field addresses affect future fetches.

pub use autocode_compiler::SubleqInstr;

pub type Word = i64;

#[derive(Debug, Clone)]
pub struct SubleqMachine {
    pub mem: Vec<Word>,
    pub pc: usize,
    pub halted: bool,
    pub trace: Vec<TraceEvent>,
    /// Word offsets where instruction triples begin (for self-mod detection).
    pub executable_regions: Vec<(usize, usize)>,
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct TraceEvent {
    pub step: usize,
    pub pc: usize,
    pub a: usize,
    pub b: usize,
    pub c: usize,
    pub mem_a_before: Word,
    pub mem_b_before: Word,
    pub mem_b_after: Word,
    pub branch_taken: bool,
}

/// Legacy alias used by branch analyzer and comparative modules.
#[derive(Debug, Clone)]
pub struct SubleqStep {
    pub pc: usize,
    pub instr: SubleqInstr,
    pub mem_a_before: i32,
    pub mem_b_before: i32,
    pub mem_b_after: i32,
    pub branch_taken: bool,
}

impl From<&TraceEvent> for SubleqStep {
    fn from(e: &TraceEvent) -> Self {
        Self {
            pc: e.pc,
            instr: SubleqInstr {
                a: e.a,
                b: e.b,
                c: e.c,
            },
            mem_a_before: e.mem_a_before as i32,
            mem_b_before: e.mem_b_before as i32,
            mem_b_after: e.mem_b_after as i32,
            branch_taken: e.branch_taken,
        }
    }
}

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct ExecutionTrace {
    pub pc_histogram: std::collections::HashMap<usize, u64>,
    pub total_steps: u64,
    pub events: Vec<TraceEvent>,
}

impl SubleqMachine {
    pub fn new(memory_size: usize) -> Self {
        Self {
            mem: vec![0; memory_size],
            pc: 0,
            halted: false,
            trace: Vec::new(),
            executable_regions: Vec::new(),
        }
    }

    /// Load SUBLEQ triples into unified tape at offsets 0, 3, 6, ...
    pub fn load_program(&mut self, instrs: &[SubleqInstr]) {
        let needed = instrs.len().saturating_mul(3);
        if self.mem.len() < needed {
            self.mem.resize(needed, 0);
        }
        self.executable_regions.clear();
        for (i, instr) in instrs.iter().enumerate() {
            let base = i * 3;
            self.mem[base] = instr.a as Word;
            self.mem[base + 1] = instr.b as Word;
            self.mem[base + 2] = instr.c as Word;
            self.executable_regions.push((base, base + 3));
        }
        self.pc = 0;
        self.halted = false;
        self.trace.clear();
    }

    /// Load raw image directly (optimizer / self-modifying quine path).
    pub fn load_image(&mut self, image: Vec<Word>, entry_pc: usize, executable: Vec<(usize, usize)>) {
        self.mem = image;
        self.pc = entry_pc;
        self.halted = false;
        self.trace.clear();
        self.executable_regions = executable;
    }

    pub fn step(&mut self) -> Result<(), String> {
        if self.halted {
            return Ok(());
        }
        if self.pc + 2 >= self.mem.len() {
            self.halted = true;
            return Ok(());
        }

        let a = self.mem[self.pc] as usize;
        let b = self.mem[self.pc + 1] as usize;
        let c = self.mem[self.pc + 2] as usize;

        if a >= self.mem.len() || b >= self.mem.len() {
            return Err(format!(
                "Address out of bounds at pc={} (a={}, b={}, mem_len={})",
                self.pc,
                a,
                b,
                self.mem.len()
            ));
        }

        let mem_a_before = self.mem[a];
        let mem_b_before = self.mem[b];

        // Canonical SUBLEQ: mem[b] = mem[b] - mem[a]
        self.mem[b] = self.mem[b].wrapping_sub(self.mem[a]);
        let mem_b_after = self.mem[b];

        let branch_taken = self.mem[b] <= 0;
        let next_pc = if branch_taken { c } else { self.pc + 3 };

        self.trace.push(TraceEvent {
            step: self.trace.len(),
            pc: self.pc,
            a,
            b,
            c,
            mem_a_before,
            mem_b_before,
            mem_b_after,
            branch_taken,
        });

        if next_pc >= self.mem.len() {
            self.halted = true;
        } else {
            self.pc = next_pc;
        }
        Ok(())
    }

    pub fn run(&mut self) -> Result<(), String> {
        const MAX_STEPS: usize = 1_000_000;
        let mut steps = 0;
        while !self.halted && steps < MAX_STEPS {
            self.step()?;
            steps += 1;
        }
        if steps >= MAX_STEPS {
            return Err("execution step limit exceeded".into());
        }
        Ok(())
    }

    pub fn execution_trace(&self) -> ExecutionTrace {
        let mut pc_histogram = std::collections::HashMap::new();
        for e in &self.trace {
            *pc_histogram.entry(e.pc).or_insert(0) += 1;
        }
        ExecutionTrace {
            pc_histogram,
            total_steps: self.trace.len() as u64,
            events: self.trace.clone(),
        }
    }

    pub fn write_execution_trace_json(&self, path: &std::path::Path) -> std::io::Result<()> {
        let trace = self.execution_trace();
        let json = serde_json::to_string_pretty(&trace)?;
        std::fs::write(path, json)
    }

    pub fn legacy_steps(&self) -> Vec<SubleqStep> {
        self.trace.iter().map(SubleqStep::from).collect()
    }

    pub fn get_memory(&self) -> &[Word] {
        &self.mem
    }

    /// Backward-compatible i32 slice view for comparative execution.
    pub fn get_memory_i32(&self) -> Vec<i32> {
        self.mem.iter().map(|&w| w as i32).collect()
    }
}
