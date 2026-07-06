pub use autocode_compiler::SubleqInstr;

#[derive(Debug, Clone)]
pub struct SubleqMachine {
    pub memory: Vec<i32>,
    pub pc: usize,
    pub trace: Vec<SubleqStep>,
    pub halted: bool,
}

#[derive(Debug, Clone)]
pub struct SubleqStep {
    pub pc: usize,
    pub instr: SubleqInstr,
    pub mem_a_before: i32,
    pub mem_b_before: i32,
    pub mem_b_after: i32,
    pub branch_taken: bool,
}

impl SubleqMachine {
    pub fn new(memory_size: usize) -> Self {
        Self {
            memory: vec![0; memory_size],
            pc: 0,
            trace: Vec::new(),
            halted: false,
        }
    }

    pub fn load_program(&mut self, instrs: &[SubleqInstr]) {
        for (i, instr) in instrs.iter().enumerate() {
            self.memory[i * 3] = instr.a as i32;
            self.memory[i * 3 + 1] = instr.b as i32;
            self.memory[i * 3 + 2] = instr.c as i32;
        }
    }

    pub fn step(&mut self) -> bool {
        if self.halted || self.pc >= self.memory.len() / 3 {
            self.halted = true;
            return false;
        }

        let a = self.memory[self.pc * 3] as usize;
        let b = self.memory[self.pc * 3 + 1] as usize;
        let c = self.memory[self.pc * 3 + 2] as usize;

        if a >= self.memory.len() || b >= self.memory.len() {
            self.halted = true;
            return false;
        }

        let mem_a_before = self.memory[a];
        let mem_b_before = self.memory[b];

        self.memory[b] = self.memory[b].wrapping_sub(self.memory[a]);
        let mem_b_after = self.memory[b];

        let branch_taken = self.memory[b] <= 0;
        let next_pc = if branch_taken { c } else { self.pc + 1 };

        self.trace.push(SubleqStep {
            pc: self.pc,
            instr: SubleqInstr { a, b, c },
            mem_a_before,
            mem_b_before,
            mem_b_after,
            branch_taken,
        });

        self.pc = next_pc;
        true
    }

    pub fn run(&mut self) {
        while self.step() {}
    }

    pub fn get_memory(&self) -> &[i32] {
        &self.memory
    }
}
