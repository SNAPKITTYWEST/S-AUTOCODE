pub struct TimingModel {
    pub total_cycles: u64,
}

impl TimingModel {
    pub fn new() -> Self {
        Self { total_cycles: 0 }
    }

    pub fn add_cycles(&mut self, cycles: u64) {
        self.total_cycles += cycles;
    }
}
