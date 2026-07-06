#[derive(Debug, Clone)]
pub struct MagneticDrum {
    tracks: usize,
    track_size: usize,
    current_position: usize,
    rotation_period_us: u64,
}

impl MagneticDrum {
    pub fn new(tracks: usize, track_size: usize) -> Self {
        Self {
            tracks,
            track_size,
            current_position: 0,
            rotation_period_us: 16_000,
        }
    }

    pub fn seek_latency(&mut self) -> u64 {
        use rand::Rng;
        let mut rng = rand::thread_rng();
        let latency = rng.gen_range(0..self.rotation_period_us);
        self.current_position = (self.current_position + (latency as usize / 10)) % self.track_size;
        latency
    }

    pub fn transfer_rate(&self) -> u64 {
        100_000
    }
}
