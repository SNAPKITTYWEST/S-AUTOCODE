use serde::{Serialize, Deserialize};
use std::collections::HashMap;

pub mod memory_map;
pub mod branch_graph;
pub mod timeline;

pub use memory_map::MemoryMapView;
pub use branch_graph::BranchGraphView;
pub use timeline::ExecutionTimeline;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VisualizerConfig {
    pub width: usize,
    pub height: usize,
    pub theme: Theme,
    pub show_latency: bool,
    pub show_branches: bool,
    pub animation_speed: f64,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize)]
pub enum Theme {
    PhosphorGreen,
    CrtAmber,
    MatrixGreen,
}

impl Default for VisualizerConfig {
    fn default() -> Self {
        Self {
            width: 120,
            height: 40,
            theme: Theme::PhosphorGreen,
            show_latency: true,
            show_branches: true,
            animation_speed: 1.0,
        }
    }
}
