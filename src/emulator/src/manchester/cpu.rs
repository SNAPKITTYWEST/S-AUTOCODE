use crate::manchester::crt_store::{CrtStore, MemoryAccess};
use crate::manchester::magnetic_drum::MagneticDrum;
use crate::manchester::timing::TimingModel;

#[derive(Debug, Clone, Copy, PartialEq)]
pub enum ManchesterOrder {
    Add(usize, usize),
    Sub(usize, usize),
    Load(usize, usize),
    Store(usize, usize),
    Jump(usize),
    JumpNeg(usize),
    Read(usize),
    Print(usize),
    Stop,
}

#[derive(Debug, Clone)]
pub struct CpuState {
    pub pc: usize,
    pub accumulator: i32,
    pub crt: CrtStore,
    pub drum: MagneticDrum,
    pub timing: TimingModel,
    pub trace: Vec<ExecutionStep>,
    pub halted: bool,
}

#[derive(Debug, Clone)]
pub struct ExecutionStep {
    pub pc: usize,
    pub order: ManchesterOrder,
    pub acc_before: i32,
    pub acc_after: i32,
    pub memory_accesses: Vec<MemoryAccess>,
    pub cycles: u64,
}

impl CpuState {
    pub fn new(memory_size: usize, drum_tracks: usize, track_size: usize) -> Self {
        Self {
            pc: 0,
            accumulator: 0,
            crt: CrtStore::new(memory_size),
            drum: MagneticDrum::new(drum_tracks, track_size),
            timing: TimingModel::new(),
            trace: Vec::new(),
            halted: false,
        }
    }

    pub fn load_program(&mut self, orders: &[ManchesterOrder]) {
        for (i, order) in orders.iter().enumerate() {
            self.crt.write_instruction(i, *order);
        }
    }

    pub fn step(&mut self) -> bool {
        if self.halted { return false; }
        if self.pc >= self.crt.instruction_count() { self.halted = true; return false; }

        let order = self.crt.read_instruction(self.pc);
        let acc_before = self.accumulator;
        let mut memory_accesses = Vec::new();
        let mut cycles = 0u64;

        match order {
            ManchesterOrder::Add(addr, _) => {
                let (val, acc) = self.crt.read(addr);
                memory_accesses.push(acc);
                self.accumulator = self.accumulator.wrapping_add(val);
                cycles += 1;
            }
            ManchesterOrder::Sub(addr, _) => {
                let (val, acc) = self.crt.read(addr);
                memory_accesses.push(acc);
                self.accumulator = self.accumulator.wrapping_sub(val);
                cycles += 1;
            }
            ManchesterOrder::Load(addr, _) => {
                let (val, acc) = self.crt.read(addr);
                memory_accesses.push(acc);
                self.accumulator = val;
                cycles += 1;
            }
            ManchesterOrder::Store(addr, _) => {
                let acc = self.crt.write(addr, self.accumulator);
                memory_accesses.push(acc);
                cycles += 1;
            }
            ManchesterOrder::Jump(addr) => {
                self.pc = addr;
                self.trace.push(ExecutionStep {
                    pc: self.pc, order, acc_before, acc_after: self.accumulator,
                    memory_accesses, cycles,
                });
                return true;
            }
            ManchesterOrder::JumpNeg(addr) => {
                cycles += 1;
                if self.accumulator < 0 { self.pc = addr; } else { self.pc += 1; }
                self.trace.push(ExecutionStep {
                    pc: self.pc, order, acc_before, acc_after: self.accumulator,
                    memory_accesses, cycles,
                });
                return true;
            }
            ManchesterOrder::Read(addr) => {
                let latency = self.drum.seek_latency();
                cycles += latency;
                let acc = self.crt.write(addr, 0);
                memory_accesses.push(acc);
            }
            ManchesterOrder::Print(addr) => {
                let (val, acc) = self.crt.read(addr);
                memory_accesses.push(acc);
                cycles += 1;
            }
            ManchesterOrder::Stop => {
                self.halted = true;
                cycles += 1;
            }
        }

        self.pc += 1;
        self.trace.push(ExecutionStep {
            pc: self.pc - 1, order, acc_before, acc_after: self.accumulator,
            memory_accesses, cycles,
        });
        true
    }

    pub fn run(&mut self) {
        while self.step() {}
    }

    pub fn get_memory(&self) -> &[i32] {
        self.crt.get_memory()
    }
}
