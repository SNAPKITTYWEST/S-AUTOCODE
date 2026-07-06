pub struct UnifiedMemory {
    data: Vec<i32>,
}

impl UnifiedMemory {
    pub fn new(size: usize) -> Self {
        Self { data: vec![0; size] }
    }

    pub fn read(&self, addr: usize) -> i32 {
        self.data.get(addr).copied().unwrap_or(0)
    }

    pub fn write(&mut self, addr: usize, val: i32) {
        if addr < self.data.len() {
            self.data[addr] = val;
        }
    }

    pub fn as_slice(&self) -> &[i32] {
        &self.data
    }
}
