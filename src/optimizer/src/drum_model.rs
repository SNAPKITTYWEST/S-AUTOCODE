use serde::{Serialize, Deserialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub struct DrumGeometry {
    pub tracks: usize,
    pub sectors_per_track: usize,
    pub rotation_period_us: u64,
    pub track_switch_time_us: u64,
    pub words_per_sector: usize,
    pub instructions_per_sector: usize,
}

impl Default for DrumGeometry {
    fn default() -> Self {
        Self {
            tracks: 64,
            sectors_per_track: 64,
            rotation_period_us: 16_000,
            track_switch_time_us: 500,
            words_per_sector: 32,
            instructions_per_sector: 10,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryLayout {
    pub instruction_to_address: HashMap<usize, PhysicalAddress>,
    pub address_to_instruction: HashMap<PhysicalAddress, usize>,
    pub total_sectors_used: usize,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct PhysicalAddress {
    pub track: usize,
    pub sector: usize,
    pub word_offset: usize,
}

impl PhysicalAddress {
    pub fn linear_index(&self, geometry: &DrumGeometry) -> usize {
        (self.track * geometry.sectors_per_track + self.sector) * geometry.words_per_sector + self.word_offset
    }
}

pub struct DrumLatencyCalculator {
    geometry: DrumGeometry,
    current_position: PhysicalAddress,
}

impl DrumLatencyCalculator {
    pub fn new(geometry: DrumGeometry) -> Self {
        Self {
            geometry,
            current_position: PhysicalAddress { track: 0, sector: 0, word_offset: 0 },
        }
    }

    pub fn calculate_access_latency(&mut self, target: PhysicalAddress) -> u64 {
        let mut latency = 0;
        if target.track != self.current_position.track {
            let track_diff = (target.track as isize - self.current_position.track as isize).abs() as u64;
            latency += self.geometry.track_switch_time_us * track_diff;
        }
        let current_sector_abs = self.current_position.track * self.geometry.sectors_per_track + self.current_position.sector;
        let target_sector_abs = target.track * self.geometry.sectors_per_track + target.sector;
        let sector_diff = if target_sector_abs >= current_sector_abs {
            target_sector_abs - current_sector_abs
        } else {
            self.geometry.tracks * self.geometry.sectors_per_track - current_sector_abs + target_sector_abs
        };
        latency += (sector_diff as u64 * self.geometry.rotation_period_us) /
                   (self.geometry.tracks * self.geometry.sectors_per_track) as u64;
        self.current_position = target;
        latency
    }

    pub fn simulate_sequence(&mut self, accesses: &[PhysicalAddress]) -> Vec<u64> {
        accesses.iter().map(|&addr| self.calculate_access_latency(addr)).collect()
    }
}
