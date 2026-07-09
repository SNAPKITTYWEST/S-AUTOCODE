pub mod manchester;
pub mod subleq;
pub mod comparative;
pub mod self_modifying;

pub use manchester::cpu::CpuState;
pub use subleq::machine::{SubleqMachine, SubleqInstr, SubleqStep};
pub use comparative::{compare_execution, ComparisonReport};
pub use self_modifying::{analyze_self_modification, SelfModificationReport, MemoryWrite};
