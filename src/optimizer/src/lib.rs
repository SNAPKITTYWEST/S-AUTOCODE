pub mod branch_analyzer;
pub mod drum_model;
pub mod relocator;
pub mod report;
pub mod pipeline;

pub use branch_analyzer::{BranchAnalyzer, BranchProfile};
pub use drum_model::{DrumGeometry, DrumLatencyCalculator, PhysicalAddress, MemoryLayout};
pub use relocator::{HeuristicRelocator, RelocationPlan};
pub use report::{ReportGenerator, LatencyReport};
pub use pipeline::OptimizationPipeline;
