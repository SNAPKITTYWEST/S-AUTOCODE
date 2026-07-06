use crate::Theme;
use autocode_optimizer::drum_model::{DrumGeometry, PhysicalAddress};
use std::collections::HashMap;

pub struct MemoryMapView {
    geometry: DrumGeometry,
    theme: Theme,
    heatmap: HashMap<usize, f64>,
    access_counts: HashMap<usize, u64>,
}

impl MemoryMapView {
    pub fn new(geometry: DrumGeometry, theme: Theme) -> Self {
        Self {
            geometry,
            theme,
            heatmap: HashMap::new(),
            access_counts: HashMap::new(),
        }
    }

    pub fn record_access(&mut self, addr: PhysicalAddress) {
        let linear = addr.linear_index(&self.geometry);
        let count = self.access_counts.entry(linear).or_insert(0);
        *count += 1;
    }

    pub fn build_heatmap(&mut self) -> Vec<String> {
        let total = self.access_counts.values().sum::<u64>().max(1);
        self.heatmap = self.access_counts.iter()
            .map(|(&k, &v)| (k, v as f64 / total as f64))
            .collect();
        self.render()
    }

    fn render(&self) -> Vec<String> {
        let mut rows = Vec::new();
        for track in 0..self.geometry.tracks {
            let mut row = String::new();
            for sector in 0..self.geometry.sectors_per_track {
                let linear = track * self.geometry.sectors_per_track + sector;
                let intensity = self.heatmap.get(&linear).copied().unwrap_or(0.0);
                let ch = match self.theme {
                    Theme::PhosphorGreen => match (intensity * 10.0) as u8 {
                        0 => '·',
                        1..=3 => '░',
                        4..=6 => '▒',
                        7..=8 => '▓',
                        _ => '█',
                    },
                    Theme::CrtAmber => match (intensity * 10.0) as u8 {
                        0 => '.',
                        1..=3 => ':',
                        4..=6 => '+',
                        7..=8 => '#',
                        _ => '@',
                    },
                    Theme::MatrixGreen => match (intensity * 10.0) as u8 {
                        0 => '0',
                        1..=3 => '1',
                        4..=6 => '2',
                        7..=8 => '3',
                        _ => '4',
                    },
                };
                row.push(ch);
            }
            rows.push(format!("T{:02}|{}", track, row));
        }
        rows
    }

    pub fn to_ascii_art(&self) -> String {
        let rows = self.render();
        let mut art = String::new();
        art.push_str("╔");
        for _ in 0..rows[0].len() { art.push('═'); }
        art.push_str("╗\n");
        for row in &rows {
            art.push_str(&format!("║{}║\n", row));
        }
        art.push_str("╚");
        for _ in 0..rows[0].len() { art.push('═'); }
        art.push_str("╝\n");
        art
    }
}
