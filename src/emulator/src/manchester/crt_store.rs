pub struct CrtStore {
    memory: Vec<i32>,
    instructions: Vec<ManchesterOrder>,
}

use crate::manchester::cpu::ManchesterOrder;

impl CrtStore {
    pub fn new(size: usize) -> Self {
        Self {
            memory: vec![0; size],
            instructions: Vec::new(),
        }
    }

    pub fn read(&self, addr: usize) -> (i32, MemoryAccess) {
        let val = self.memory.get(addr).copied().unwrap_or(0);
        (val, MemoryAccess { address: addr, is_read: true, is_drum: false, latency: 1 })
    }

    pub fn write(&mut self, addr: usize, val: i32) -> MemoryAccess {
        if addr < self.memory.len() {
            self.memory[addr] = val;
        }
        MemoryAccess { address: addr, is_read: false, is_drum: false, latency: 1 }
    }

    pub fn write_instruction(&mut self, addr: usize, order: ManchesterOrder) {
        if addr >= self.instructions.len() {
            self.instructions.resize(addr + 1, ManchesterOrder::Stop);
        }
        self.instructions[addr] = order;
    }

    pub fn read_instruction(&self, addr: usize) -> ManchesterOrder {
        self.instructions.get(addr).copied().unwrap_or(ManchesterOrder::Stop)
    }

    pub fn instruction_count(&self) -> usize {
        self.instructions.len()
    }

    pub fn get_memory(&self) -> &[i32] {
        &self.memory
    }
}

#[derive(Debug, Clone)]
pub struct MemoryAccess {
    pub address: usize,
    pub is_read: bool,
    pub is_drum: bool,
    pub latency: u64,
}
